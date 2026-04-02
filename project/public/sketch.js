// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_CONFIG = {
	BASE_WIDTH: 1000,
	ARTWORK_RATIO: 1.0,
	ARTWORK_PADDING: 0.1,
	WRAP_PADDING_FACTOR: 0.05,
	SCALE_FACTOR_X: 2.27,
	SCALE_FACTOR_Y: 2.27,
};

const DEBUG_CONFIG = {
	DEFAULT_PIXEL_DENSITY_DESKTOP: 2,
	DEFAULT_PIXEL_DENSITY_MOBILE: 1,
	HELP_TEXT: "Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)",
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
	// Animation & Rendering
	animation: {
		maxFrames: null, // null = unlimited, number = limited (e.g. 25)
		useFrameMode: true, // true = draw-loop style; false = cycle rendering
		particleNum: 200,
	},

	// Color System
	color: {
		loop: true, // cycles through palette continuously
		yoyo: true, // ping-pongs forward then backward
		loopSpeed: 0.03, // cycle speed multiplier: 1 = default, 2 = twice as fast, 0.5 = half speed
		loopSpeedOffset: 0.0, // random speed variance per particle
		randomStart: false, // each particle begins at a random point in the palette cycle
	},

	// Particle Behavior
	particles: {
		bordered: true,
	},

	// Particle Lifecycle
	lifecycle: {
		enabled: true,
		schedule: "sync", // "off" | "sync" | "random" | "window"
		syncPeriod: 2,
		randomIntervalMin: 60,
		randomIntervalMax: 180,
		windowStart: 30,
		windowEnd: 90,
		resetPosition: "spawn", // "spawn" | "random"
		cullOnReset: false,
	},

	// Noise & Scaling
	noise: {
		scaleBase: [0.001, 0.002, 0.003],
		offsetBase: [1, 2, 3],
		amplitudeBase: [1, 2, 3],
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
let startTime = null;
let elapsedTime = 0;
let executionTimer = new ExecutionTimer();
let generator = null;

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

// Noise seeds & scaling
let rseed = 0;
let nseed = 0;
let scl1 = 0;
let scl2 = 0;
let scl3 = 0;
let ang1 = 0;
let ang2 = 0;

// Bounds
let xMin = 0;
let xMax = 1;
let yMin = 0;
let yMax = 1;

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

async function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
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
	let mainRandomSeed = fxrand() * 10000;
	let mainNoiseSeed = fxrand() * 10000;
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;

	randomSeed(mainRandomSeed);
	noiseSeed(mainNoiseSeed);

	// Apply scale transformation
	mainCanvas.translate(width / 2, height / 2);
	mainCanvas.scale(CANVAS_CONFIG.SCALE_FACTOR_X, CANVAS_CONFIG.SCALE_FACTOR_Y);
	mainCanvas.translate(-width / 2, -height / 2);

	initializeParticles(rseed, nseed);

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: config.animation.maxFrames,
		startTime: startTime,
		frameMode: config.animation.useFrameMode,
		currentFrame: 0,
		renderItem: (mover, currentFrame) => {
			if (currentFrame > -1) {
				mover.show(mainCanvas);
			}
		},
		moveItem: (mover, currentFrame) => {
			mover.move(currentFrame, config.animation.maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			if (typeof shaderEffects !== "undefined" && shaderCanvas) {
				shaderEffects.setParticleAnimationComplete(true);
			}
			$fx.preview();
			document.complete = true;

			if (typeof createDownloadButton === "function") {
				createDownloadButton();
			}
		},
	};

	generator = createAnimationGenerator(animConfig);

	// --- Audio-reactive uniforms (uncomment to activate) ---
	audioKnob
		.setSource("microphone") // or 'chime'
		.map("energy", "zoom", "zoomOutAmount", 3.2, 12.2);

	// --- MIDI knob smoothing ---
	const initAngle = shaderEffects.effectsConfig.symmetry.rotationStartingAngle;
	addKnobSmooth(32, "symmetry", "rotationStartingAngle", initAngle, 0.08);

	if (typeof createDownloadButton === "function") {
		createDownloadButton();
	}

	customDraw();
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

function customDraw() {
	// Update audio-reactive uniforms each frame
	if (typeof audioKnob !== "undefined") audioKnob.update();
	updateKnobSmoothing();

	const result = generator.next();

	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		clear();
		image(mainCanvas, 0, 0);

		if (typeof shaderEffects !== "undefined") {
			shaderEffects.updateFPS();
			shaderEffects.drawFPS();
		}

		if (!result.done) {
			requestAnimationFrame(customDraw);
		}
	}
}

function initializeParticles(rseed, nseed) {
	movers = [];

	// Build HSL palette directly from hex array
	const hexPalette = getPalette("hex_palette");
	baseHSLPalette = hexPalette.map(hexToHsl);
	currentPaletteName = "hex_palette";

	// Scale noise values based on MULTIPLIER
	scl1 = config.noise.scaleBase[0] / MULTIPLIER;
	scl2 = config.noise.scaleBase[1] / MULTIPLIER;
	scl3 = config.noise.scaleBase[2] / MULTIPLIER;

	const sclOffset1 = config.noise.offsetBase[0];
	const sclOffset2 = config.noise.offsetBase[1];
	const sclOffset3 = config.noise.offsetBase[2];

	const amplitude1 = config.noise.amplitudeBase[0] * MULTIPLIER;
	const amplitude2 = config.noise.amplitudeBase[1] * MULTIPLIER;
	const amplitude3 = config.noise.amplitudeBase[2] * MULTIPLIER;

	// Simple padding calculation
	const padding = CANVAS_CONFIG.ARTWORK_PADDING;
	xMin = padding;
	xMax = 1 - padding;
	yMin = padding;
	yMax = 1 - padding;

	// Create particles
	const particleCount = config.animation.particleNum;
	for (let i = 0; i < particleCount; i++) {
		const x = random(xMin, xMax) * width;
		const y = random(yMin, yMax) * height;

		movers.push(
			new Mover(
				x,
				y,
				scl1,
				scl2,
				scl3,
				sclOffset1,
				sclOffset2,
				sclOffset3,
				amplitude1,
				amplitude2,
				xMin,
				xMax,
				yMin,
				yMax,
				config.particles.bordered,
				rseed,
				nseed,
				config.color.loop,
				config.color.yoyo,
				config.color.loopSpeed,
				config.color.loopSpeedOffset,
				config.color.randomStart,
				baseHSLPalette,
				config.lifecycle,
				config.animation.maxFrames,
			),
		);
	}

	// Set background color based on complementary hue
	const middleIndex = Math.floor(baseHSLPalette.length / 2);
	const middleColor = baseHSLPalette[middleIndex];
	//const complementaryHue = (middleColor.h + 180) % 360;
	const complementaryHue = 35;
	const bgCol = color(complementaryHue, 0, 2);
	mainCanvas.background(bgCol);
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
