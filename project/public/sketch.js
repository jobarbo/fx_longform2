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
	FORCE_SIZE: true,
	FIXED_WIDTH: 240,
	FIXED_HEIGHT: 24,
};

const DEBUG_CONFIG = {
	DEFAULT_PIXEL_DENSITY_DESKTOP: 5,
	DEFAULT_PIXEL_DENSITY_MOBILE: 1,
	HELP_TEXT: "Controls: Press 'F' to toggle FPS counter",
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

	// Canvas setup
	let canvasW, canvasH;
	if (CANVAS_CONFIG.FORCE_SIZE) {
		canvasW = CANVAS_CONFIG.FIXED_WIDTH;
		canvasH = CANVAS_CONFIG.FIXED_HEIGHT;
	} else {
		ARTWORK_RATIO = CANVAS_CONFIG.ARTWORK_RATIO;
		const viewportDim = min(windowWidth, windowHeight);
		canvasW = viewportDim / ARTWORK_RATIO;
		canvasH = viewportDim;
	}
	ARTWORK_RATIO = canvasW / canvasH;
	BASE_HEIGHT = CANVAS_CONFIG.BASE_WIDTH * ARTWORK_RATIO;
	DEFAULT_SIZE = min(CANVAS_CONFIG.BASE_WIDTH, BASE_HEIGHT);
	DIM = min(canvasW, canvasH);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork
	mainCanvas = createGraphics(canvasW, canvasH);
	mainCanvas.pixelDensity(pixel_density);

	// Try to create shader canvas for the WEBGL renderer
	if (typeof shaderEffects !== "undefined") {
		try {
			shaderCanvas = createCanvas(canvasW, canvasH, WEBGL);
			shaderCanvas.pixelDensity(pixel_density);
			shaderEffects.setup(width, height, mainCanvas, shaderCanvas, pixel_density);
			// Full pipeline every N frames; p5 draws every frame. interval=1 for max quality.
			// shaderEffects.setShaderApplyInterval(1);
			console.log("Shader effects initialized successfully");
		} catch (error) {
			console.warn("Failed to initialize shader effects:", error);
			console.log("Falling back to sketch without shaders");
			shaderCanvas = null;
			createCanvas(canvasW, canvasH);
			pixelDensity(pixel_density);
		}
	} else {
		createCanvas(canvasW, canvasH);
		pixelDensity(pixel_density);
	}

	// Set up the main canvas rendering properties
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
		.map("energy", "zoom", "zoomOutAmount", 1.2, 5.4, 0, 1, 2, 0.85)
		//.map("energy", "pixelSort", "threshold", 0, 1, 0, 1, 10, 0.75)
		.map("energy", "pixelSort", "sortAmount", 0, 120, 0, 1, 1, 0.75) /* s */
		.map("energy", "pixelSort", "threshold", 0, 1, 0, 1, 1, 0.75); /* s */
	// --- MIDI knob smoothing ---
	const initAngle = shaderEffects.effectsConfig.symmetry.rotationStartingAngle;
	addKnobSmooth(32, "symmetry", "rotationStartingAngle", initAngle, 0.08);

	if (typeof createDownloadButton === "function") {
		createDownloadButton();
	}

	setupMobileControls();

	console.log(DEBUG_CONFIG.HELP_TEXT);
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		console.log(`Shader pipeline: every ${shaderEffects.getShaderApplyInterval()} frame(s) during sketch (setShaderApplyInterval to tune)`);
	} else {
		console.log("Running without shader effects");
	}
}

function syncFpsToggleButton() {
	const toggleFpsButton = document.getElementById("toggle-fps");
	if (!toggleFpsButton || typeof shaderEffects === "undefined") return;

	toggleFpsButton.classList.toggle("active", shaderEffects.showFPS);
	toggleFpsButton.textContent = shaderEffects.showFPS ? "FPS: ON" : "FPS: OFF";
}

function setupMobileControls() {
	const toggleFpsButton = document.getElementById("toggle-fps");
	if (!toggleFpsButton) return;

	toggleFpsButton.addEventListener("click", () => {
		if (typeof shaderEffects === "undefined") return;
		shaderEffects.toggleFPS();
		syncFpsToggleButton();
	});

	syncFpsToggleButton();
}

function draw() {
	mainCanvas.background(190, 100, 0, 100);
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
	if (key === "F" || key === "f") {
		if (typeof shaderEffects !== "undefined") {
			shaderEffects.toggleFPS();
			syncFpsToggleButton();
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
