// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_CONFIG = {
	BASE_WIDTH: 1000,
	ARTWORK_RATIO: 1.0,
	ARTWORK_PADDING: 0.1,
	WRAP_PADDING_FACTOR: 0.05,
	SCALE_FACTOR_X: 1.0,
	SCALE_FACTOR_Y: 1.0,
};

const DEBUG_CONFIG = {
	DEFAULT_PIXEL_DENSITY_DESKTOP: 1,
	DEFAULT_PIXEL_DENSITY_MOBILE: 1,
	HELP_TEXT: "Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)",
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
	// Animation & Rendering
	animation: {
		maxFrames: null,
		useFrameMode: true,
	},

	// UI & Debug
	ui: {
		showDebugBounds: false,
	},
};

// ============================================================================
// STATE
// ============================================================================

// Lifecycle & Animation
let features = "";
let elapsedTime = 0;
let executionTimer = new ExecutionTimer();
let sketchFrame = 0;
let hasDisplayedFirstFrame = false;

// Particle system
let movers = [];
let baseHSLPalette = [];
let currentPaletteName = "";
let selectedPalette = null;

// Palette & Swatch
let swatchPalette = null;
let swatchesLoaded = false;

// Canvas & Rendering
let mainCanvas = null;
let shaderCanvas = null;

// Display dimensions
let ARTWORK_RATIO = 1.6;
let BASE_HEIGHT = 0;
let DEFAULT_SIZE = 0;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM = 0;
let MULTIPLIER = 1;
let pixel_density = 1;

// Media
let img = null;
let mask = null;

// ============================================================================
// UTILITIES
// ============================================================================

function hexToHsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;
	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}
	return {h: h * 360, s: s * 100, l: l * 100};
}

function updateDebugOverlay() {
	const debugOverlay = document.getElementById("debug-bounds");
	const basePadding = document.getElementById("debug-base-padding");
	const moverBounds = document.getElementById("debug-mover-bounds");

	if (!config.ui.showDebugBounds) {
		debugOverlay.classList.remove("visible");
		return;
	}

	debugOverlay.classList.add("visible");

	const canvas = document.querySelector("canvas");
	if (!canvas) return;

	const canvasRect = canvas.getBoundingClientRect();
	const canvasWidth = canvasRect.width;
	const canvasHeight = canvasRect.height;

	// Position the debug overlay to match the canvas
	debugOverlay.style.left = canvasRect.left + "px";
	debugOverlay.style.top = canvasRect.top + "px";
	debugOverlay.style.width = canvasWidth + "px";
	debugOverlay.style.height = canvasHeight + "px";

	// Base artwork padding
	const padding = CANVAS_CONFIG.ARTWORK_PADDING;
	const basePaddingLeft = padding * canvasWidth;
	const basePaddingTop = padding * canvasHeight;
	const basePaddingWidth = (1 - 2 * padding) * canvasWidth;
	const basePaddingHeight = (1 - 2 * padding) * canvasHeight;

	basePadding.style.left = basePaddingLeft + "px";
	basePadding.style.top = basePaddingTop + "px";
	basePadding.style.width = basePaddingWidth + "px";
	basePadding.style.height = basePaddingHeight + "px";

	// Mover bounds (if movers exist)
	if (movers.length > 0) {
		const m = movers[0];
		const wrapPaddingX = (min(DIM, DIM * ARTWORK_RATIO) * CANVAS_CONFIG.WRAP_PADDING_FACTOR) / DIM;
		const wrapPaddingY = ((min(DIM, DIM * ARTWORK_RATIO) * CANVAS_CONFIG.WRAP_PADDING_FACTOR) / (DIM * ARTWORK_RATIO)) * ARTWORK_RATIO;

		const moverLeft = (m.xMin - wrapPaddingX) * canvasWidth;
		const moverTop = (m.yMin - wrapPaddingY) * canvasHeight;
		const moverWidth = (m.xMax + wrapPaddingX - (m.xMin - wrapPaddingX)) * canvasWidth;
		const moverHeight = (m.yMax + wrapPaddingY - (m.yMin - wrapPaddingY)) * canvasHeight;

		moverBounds.style.left = moverLeft + "px";
		moverBounds.style.top = moverTop + "px";
		moverBounds.style.width = moverWidth + "px";
		moverBounds.style.height = moverHeight + "px";
	}
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

function preload() {
	// Initialize shader effects (will load all shaders) - optional
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.preload(this);
	}
}

function setup() {
	console.log(features);
	features = $fx.getFeatures();
	executionTimer.start();

	// Reset the random seed to ensure consistency
	$fx.rand.reset();

	// Using direct hex palette
	swatchesLoaded = true;

	// Calculate optimal pixel density before creating canvases
	pixel_density = typeof isSafariMobile === "function" && isSafariMobile() ? DEBUG_CONFIG.DEFAULT_PIXEL_DENSITY_MOBILE : DEBUG_CONFIG.DEFAULT_PIXEL_DENSITY_DESKTOP;

	// Canvas setup - match viewport aspect ratio
	ARTWORK_RATIO = CANVAS_CONFIG.ARTWORK_RATIO;
	BASE_HEIGHT = CANVAS_CONFIG.BASE_WIDTH * ARTWORK_RATIO;
	DEFAULT_SIZE = min(CANVAS_CONFIG.BASE_WIDTH, BASE_HEIGHT);
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork
	mainCanvas = createGraphics(DIM / ARTWORK_RATIO, DIM);

	// Try to create shader canvas for the WEBGL renderer
	if (typeof shaderEffects !== "undefined") {
		try {
			shaderCanvas = createCanvas(DIM / ARTWORK_RATIO, DIM, WEBGL);
			shaderEffects.setup(width, height, mainCanvas, shaderCanvas);
			shaderCanvas.pixelDensity(pixel_density);
			console.log("Shader effects initialized successfully");
		} catch (error) {
			console.warn("Failed to initialize shader effects:", error);
			console.log("Falling back to sketch without shaders");
			shaderCanvas = null;
			createCanvas(DIM / ARTWORK_RATIO, DIM);
			pixelDensity(pixel_density);
		}
	} else {
		createCanvas(DIM / ARTWORK_RATIO, DIM);
		pixelDensity(pixel_density);
	}

	// Set up the main canvas rendering properties
	mainCanvas.pixelDensity(pixel_density);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	colorMode(HSB, 360, 100, 100, 100);
	mainCanvas.drawingContext.imageSmoothingEnabled = false;
	mainCanvas.drawingContext.globalCompositeOperation = "source-over";

	// Initialize random seeds from fxrand for deterministic behavior
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	// Apply scale transformation
	mainCanvas.translate(width / 2, height / 2);
	mainCanvas.scale(CANVAS_CONFIG.SCALE_FACTOR_X, CANVAS_CONFIG.SCALE_FACTOR_Y);
	mainCanvas.translate(-width / 2, -height / 2);

	initializeParticles();

	// --- Audio-reactive uniforms (uncomment to activate) ---
	audioKnob
		.setSource("microphone") // or 'chime'
		.map("bass", "zoom", "zoomOutAmount", 1.2, 4.2);

	// --- MIDI knob smoothing ---
	const initAngle = shaderEffects.effectsConfig.symmetry.rotationStartingAngle;
	addKnobSmooth(32, "symmetry", "rotationStartingAngle", initAngle, 0.08);

	if (typeof createDownloadButton === "function") {
		createDownloadButton();
	}

	updateDebugOverlay();
	setupMobileControls();

	console.log(DEBUG_CONFIG.HELP_TEXT);
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		console.log(`Shader performance: Frame rate limited to ${shaderEffects.getFrameRate()}fps to match p5.js draw speed`);
		console.log(`Use shaderEffects.setFrameRate(fps) to adjust the frame rate to match your p5.js settings`);
	} else {
		console.log("Running without shader effects");
	}
}

function setupMobileControls() {
	const toggleFpsButton = document.getElementById("toggle-fps");
	if (toggleFpsButton) {
		toggleFpsButton.addEventListener("click", function () {
			if (typeof shaderEffects !== "undefined") {
				shaderEffects.toggleFPS();
				if (shaderEffects.showFPS) {
					toggleFpsButton.classList.add("active");
					toggleFpsButton.textContent = "FPS: ON";
				} else {
					toggleFpsButton.classList.remove("active");
					toggleFpsButton.textContent = "FPS: OFF";
				}
				console.log("FPS counter toggled: ", shaderEffects.showFPS);
			}
		});

		if (typeof shaderEffects !== "undefined") {
			if (shaderEffects.showFPS) {
				toggleFpsButton.classList.add("active");
				toggleFpsButton.textContent = "FPS: ON";
			} else {
				toggleFpsButton.textContent = "FPS: OFF";
			}
		}
	}
}

function draw() {
	mainCanvas.background(190, 100, 10, 100);
	if (typeof audioKnob !== "undefined") audioKnob.update();
	updateKnobSmoothing();

	const maxFrames = config.animation.maxFrames;

	if (maxFrames == null || sketchFrame < maxFrames) {
		for (let i = 0; i < movers.length; i++) {
			movers[i].show(mainCanvas);
			movers[i].move(sketchFrame, maxFrames);
		}
		sketchFrame++;
		if (maxFrames != null && sketchFrame >= maxFrames) {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			if (typeof shaderEffects !== "undefined" && shaderCanvas) {
				shaderEffects.setParticleAnimationComplete(true);
			}
			$fx.preview();
			document.complete = true;
			if (typeof createDownloadButton === "function") {
				createDownloadButton();
			}
		}
	}

	const isSketchComplete = maxFrames != null && sketchFrame >= maxFrames;

	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		const shouldContinue = shaderEffects.renderFrame(isSketchComplete, null);
		if (!shouldContinue) {
			noLoop();
		}
	} else {
		clear();
		image(mainCanvas, 0, 0);

		if (typeof shaderEffects !== "undefined") {
			shaderEffects.updateFPS();
			shaderEffects.drawFPS();
		}

		if (isSketchComplete) {
			noLoop();
		}
	}

	// Fade the previous live-reload frame once the new sketch is visibly rendering.
	if (!hasDisplayedFirstFrame) {
		hasDisplayedFirstFrame = true;
		window.liveReloadTransition?.onSketchReady?.();
	}
}

function initializeParticles() {
	movers = [];

	// Build HSL palette directly from hex array
	const hexPalette = getPalette("hex_palette");
	baseHSLPalette = hexPalette.map(hexToHsl);

	// Single rect in center
	const cx = mainCanvas.width / 2;
	const cy = mainCanvas.height / 2;
	const rectSize = min(mainCanvas.width, mainCanvas.height) * 0.425;

	movers.push(new Mover(cx, cy, rectSize, baseHSLPalette));
}

function keyPressed() {
	if (key === "D" || key === "d") {
		config.ui.showDebugBounds = !config.ui.showDebugBounds;
		console.log("Debug bounds toggled: ", config.ui.showDebugBounds);
		updateDebugOverlay();
	}

	if (key === "F" || key === "f") {
		if (typeof shaderEffects !== "undefined") {
			shaderEffects.toggleFPS();
			console.log("FPS counter toggled: ", shaderEffects.showFPS);
		}
	}

	if (key === "G" || key === "g") {
		if (typeof shaderEffects !== "undefined") {
			const currentDebug = shaderEffects.effectsConfig.symmetry.debug;
			const newDebug = currentDebug > 0.5 ? 0.0 : 1.0;
			shaderEffects.updateEffectParam("symmetry", "debug", newDebug);
			console.log("Symmetry debug toggled: ", newDebug > 0.5);
		}
	}

	if (key === "C" || key === "c") {
		const controls = document.getElementById("controls");
		controls.classList.toggle("hide");
	}
}
