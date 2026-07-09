// sketch.js — generative artwork entry point
//
// SECTIONS (search by number or name)
//   1. Configuration      — tunable constants and runtime config
//   2. State              — module-level variables
//   3. Color utilities    — palette conversion helpers
//   4. Canvas & layout    — sizing, pixel density, canvas creation
//   5. Particles          — mover initialization
//   6. Audio & MIDI       — reactive shader uniforms and knob smoothing
//   7. UI controls        — FPS toggle and mobile controls
//   8. Rendering          — per-frame artwork and display output
//   9. p5 lifecycle       — preload, setup, draw, keyPressed
//

// ============================================================================
// 1. CONFIGURATION
// ============================================================================

const CANVAS_CONFIG = {
	BASE_WIDTH: 1000,
	ARTWORK_RATIO: 1.0,
	ARTWORK_PADDING: 0.1,
	WRAP_PADDING_FACTOR: 0.05,
	SCALE_FACTOR_X: 1.0,
	SCALE_FACTOR_Y: 1.0,
	FORCE_SIZE: true,
	FIXED_WIDTH: 680,
	FIXED_HEIGHT: 680,
	SHADER_RENDER: {
		fitCanvas: false,
		width: 1,
		height: 1,
	},
	SHADER_ANIMATION_SPEED: 1.0,
	ARTWORK_LAYOUT: {
		orientation: "horizontal",
		ratio: 1,
		baseSize: 200,
	},
};

const DEBUG_CONFIG = {
	DEFAULT_PIXEL_DENSITY_DESKTOP: 2,
	DEFAULT_PIXEL_DENSITY_MOBILE: 1,
	HELP_TEXT: "Controls: F=FPS, L=loop countdown, M=MIDI OSC overlay",
};

const MIDI_CLOCK_CONFIG = {
	ENABLED: true,
	WS_URL: "ws://localhost:3302",
	SHOW_OVERLAY: true,
};

const config = {
	animation: {
		maxFrames: null,
		useFrameMode: true,
	},
};

// ============================================================================
// 2. STATE
// ============================================================================

// Lifecycle
let features = "";
let executionTimer = new ExecutionTimer();
let sketchFrame = 0;
let hasDisplayedFirstFrame = false;

// Particles
let movers = [];
let baseHSLPalette = [];

// Canvas
let mainCanvas = null;
let shaderCanvas = null;
let pixel_density = 1;

// Layout (derived from canvas dimensions at setup)
let ARTWORK_RATIO = 1.6;
let DIM = 0;
let MULTIPLIER = 1;

// ============================================================================
// 3. COLOR UTILITIES
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
// 4. CANVAS & LAYOUT
// ============================================================================

function getPixelDensity() {
	return typeof isSafariMobile === "function" && isSafariMobile() ? DEBUG_CONFIG.DEFAULT_PIXEL_DENSITY_MOBILE : DEBUG_CONFIG.DEFAULT_PIXEL_DENSITY_DESKTOP;
}

/** @returns {number} width / height */
function getArtworkAspectRatio(layout = CANVAS_CONFIG.ARTWORK_LAYOUT) {
	const r = Math.max(Number(layout.ratio) || 1, 0.01);
	return layout.orientation === "vertical" ? 1 / r : r;
}

/**
 * Canvas size with ~constant pixel area regardless of aspect ratio.
 * @param {number} viewportMin - min(windowWidth, windowHeight)
 * @param {object} layout
 */
function computeArtworkLayout(viewportMin, layout = CANVAS_CONFIG.ARTWORK_LAYOUT) {
	const aspect = getArtworkAspectRatio(layout);
	const height = viewportMin / Math.sqrt(aspect);
	const width = viewportMin * Math.sqrt(aspect);
	return {
		width,
		height,
		aspect,
		multiplier: viewportMin / layout.baseSize,
	};
}

function getCanvasDimensions() {
	if (CANVAS_CONFIG.FORCE_SIZE) {
		return {
			width: CANVAS_CONFIG.FIXED_WIDTH,
			height: CANVAS_CONFIG.FIXED_HEIGHT,
		};
	}

	if (CANVAS_CONFIG.ARTWORK_LAYOUT) {
		const viewportMin = min(windowWidth, windowHeight);
		return computeArtworkLayout(viewportMin, CANVAS_CONFIG.ARTWORK_LAYOUT);
	}

	const ratio = CANVAS_CONFIG.ARTWORK_RATIO;
	const viewportDim = min(windowWidth, windowHeight);
	return {
		width: viewportDim / ratio,
		height: viewportDim,
	};
}

function updateLayoutMetrics(canvasW, canvasH) {
	ARTWORK_RATIO = canvasW / canvasH;
	DIM = min(canvasW, canvasH);

	if (!CANVAS_CONFIG.FORCE_SIZE && CANVAS_CONFIG.ARTWORK_LAYOUT) {
		const layout = computeArtworkLayout(DIM, CANVAS_CONFIG.ARTWORK_LAYOUT);
		MULTIPLIER = layout.multiplier;
	} else {
		const baseHeight = CANVAS_CONFIG.BASE_WIDTH * ARTWORK_RATIO;
		const defaultSize = min(CANVAS_CONFIG.BASE_WIDTH, baseHeight);
		MULTIPLIER = DIM / defaultSize;
	}
	console.log(MULTIPLIER);
}

function createArtworkCanvas(canvasW, canvasH) {
	mainCanvas = createGraphics(canvasW, canvasH);
	mainCanvas.pixelDensity(pixel_density);
}

function initDisplayCanvas(canvasW, canvasH) {
	if (typeof shaderEffects === "undefined") {
		createCanvas(canvasW, canvasH);
		pixelDensity(pixel_density);
		return null;
	}

	try {
		const displayCanvas = createCanvas(canvasW, canvasH, WEBGL);
		displayCanvas.pixelDensity(pixel_density);
		if (CANVAS_CONFIG.SHADER_RENDER) {
			shaderEffects.setRenderRatio(CANVAS_CONFIG.SHADER_RENDER);
		}
		if (CANVAS_CONFIG.SHADER_ANIMATION_SPEED != null) {
			shaderEffects.setAnimationSpeed(CANVAS_CONFIG.SHADER_ANIMATION_SPEED);
		}
		shaderEffects.setup(width, height, mainCanvas, displayCanvas, pixel_density);
		console.log("Shader effects initialized successfully");
		return displayCanvas;
	} catch (error) {
		console.warn("Failed to initialize shader effects:", error);
		console.log("Falling back to sketch without shaders");
		createCanvas(canvasW, canvasH);
		pixelDensity(pixel_density);
		return null;
	}
}

function configureArtworkCanvas() {
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	colorMode(HSB, 360, 100, 100, 100);
	mainCanvas.drawingContext.imageSmoothingEnabled = false;
	mainCanvas.drawingContext.globalCompositeOperation = "source-over";

	mainCanvas.translate(width / 2, height / 2);
	mainCanvas.scale(CANVAS_CONFIG.SCALE_FACTOR_X, CANVAS_CONFIG.SCALE_FACTOR_Y);
	mainCanvas.translate(-width / 2, -height / 2);
}

function logStartupInfo() {
	console.log(DEBUG_CONFIG.HELP_TEXT);
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		console.log(`Shader pipeline: every ${shaderEffects.getShaderApplyInterval()} frame(s) during sketch (setShaderApplyInterval to tune)`);
	} else {
		console.log("Running without shader effects");
	}
}

// ============================================================================
// 5. PARTICLES
// ============================================================================

function initializeParticles() {
	movers = [];

	const hexPalette = getPalette("hex_palette");
	baseHSLPalette = hexPalette.map(hexToHsl);

	const cx = mainCanvas.width / 2;
	const cy = mainCanvas.height / 2;
	const rectSize = min(mainCanvas.width, mainCanvas.height) * 0.425;

	movers.push(new Mover(cx, cy, rectSize, baseHSLPalette));
}

// ============================================================================
// 6. AUDIO & MIDI
// ============================================================================

function setupAudioReactive() {
	if (typeof audioKnob === "undefined") return;

	audioKnob
		.setSource("microphone") // or 'chime'
		.map("energy", "zoom", "zoomOutAmount", 1.2, 5.4, 0, 1, 2, 0.85)
		//.map("energy", "pixelSort", "threshold", 0, 1, 0, 1, 10, 0.75)
		.map("energy", "pixelSort", "sortAmount", 0, 120, 0, 1, 1, 0.75) /* s */
		.map("energy", "pixelSort", "threshold", 0, 1, 0, 1, 1, 0.75); /* s */
}

function setupMidiKnobs() {
	if (typeof shaderEffects === "undefined") return;

	const initAngle = shaderEffects.effectsConfig.symmetry.rotationStartingAngle;
	addKnobSmooth(32, "symmetry", "rotationStartingAngle", initAngle, 0.08);
}

// ============================================================================
// 7. UI CONTROLS
// ============================================================================

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

function toggleFpsCounter() {
	if (typeof shaderEffects === "undefined") return;
	shaderEffects.toggleFPS();
	syncFpsToggleButton();
}

function toggleLoopCountdown() {
	if (typeof shaderEffects === "undefined") return;
	shaderEffects.toggleLoopCountdown();
}

function setupMidiClockOsc() {
	if (!MIDI_CLOCK_CONFIG.ENABLED || typeof midiClockOsc === "undefined") return;
	midiClockOsc.connect(MIDI_CLOCK_CONFIG.WS_URL);
	midiClockOsc.setOverlayVisible(MIDI_CLOCK_CONFIG.SHOW_OVERLAY);
}

// ============================================================================
// 8. RENDERING
// ============================================================================

function updateParticles(maxFrames) {
	if (maxFrames != null && sketchFrame >= maxFrames) return;

	for (let i = 0; i < movers.length; i++) {
		movers[i].show(mainCanvas);
		movers[i].move(sketchFrame, maxFrames);
	}
	sketchFrame++;
}

function onAnimationComplete(maxFrames) {
	if (maxFrames == null || sketchFrame < maxFrames) return;

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

function renderOutput(isSketchComplete) {
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		const shouldContinue = shaderEffects.renderFrame(isSketchComplete, null);
		if (!shouldContinue) noLoop();
		return;
	}

	clear();
	image(mainCanvas, 0, 0);

	if (typeof shaderEffects !== "undefined") {
		shaderEffects.updateFPS();
		shaderEffects.drawFPS();
	}

	if (isSketchComplete) noLoop();
}

function notifyFirstFrameReady() {
	if (hasDisplayedFirstFrame) return;
	hasDisplayedFirstFrame = true;
	window.liveReloadTransition?.onSketchReady?.();
}

// ============================================================================
// 9. P5 LIFECYCLE
// ============================================================================

function preload() {
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.preload(this);
	}
}

function setup() {
	features = $fx.getFeatures();
	executionTimer.start();
	$fx.rand.reset();

	pixel_density = getPixelDensity();
	const {width: canvasW, height: canvasH} = getCanvasDimensions();
	updateLayoutMetrics(canvasW, canvasH);

	createArtworkCanvas(canvasW, canvasH);
	shaderCanvas = initDisplayCanvas(canvasW, canvasH);
	configureArtworkCanvas();

	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	initializeParticles();
	setupAudioReactive();
	setupMidiKnobs();

	if (typeof createDownloadButton === "function") {
		createDownloadButton();
	}
	setupMobileControls();
	setupMidiClockOsc();
	logStartupInfo();
}

function draw() {
	mainCanvas.background(190, 100, 0, 100);
	if (typeof audioKnob !== "undefined") audioKnob.update();
	updateKnobSmoothing();
	if (typeof midiClockOsc !== "undefined") midiClockOsc.update();

	const maxFrames = config.animation.maxFrames;
	updateParticles(maxFrames);
	onAnimationComplete(maxFrames);

	const isSketchComplete = maxFrames != null && sketchFrame >= maxFrames;
	renderOutput(isSketchComplete);
	notifyFirstFrameReady();
}

function keyPressed() {
	if (key === "F" || key === "f") {
		toggleFpsCounter();
	}

	if (key === "L" || key === "l") {
		toggleLoopCountdown();
	}

	if (key === "M" || key === "m") {
		if (typeof midiClockOsc !== "undefined") midiClockOsc.toggleOverlay();
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
		document.getElementById("controls")?.classList.toggle("hide");
	}
}
