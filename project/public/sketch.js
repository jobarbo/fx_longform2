// ============================================================================
// CONFIGURATION
// ============================================================================

const ENABLE_SHADERS = true;
const ENABLE_DEV_PANELS = true;
const PERSIST_SHADER_PANEL = true; // localStorage: keep shader panel edits across refresh

let features = "";

let maxDPI = 3;
let RATIO = 1;

// Base artwork dimensions (width: 948, height: 948 * 1.41)
let ARTWORK_RATIO = 1.0;
let BASE_WIDTH = 1000;
let BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;

// This is our reference size for scaling
let DEFAULT_SIZE = max(BASE_WIDTH, BASE_HEIGHT);

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

// Perspective drawing
let compositionParams;
let composition;
let renderSeed;
let showDebug = false; // key D: construction lines, VP marks and validation

let executionTimer = new ExecutionTimer();
// Canvas references
let pixel_density = 2;
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects (if shaders enabled)
let panelLoopId = null;

function shadersEnabled() {
	return ENABLE_SHADERS && typeof shaderEffects !== "undefined";
}

function preload() {
	// Initialize shader effects (optional - will work without it)
	if (shadersEnabled()) {
		shaderEffects.preload(this);
	}
}

/** Redraw the whole drawing into mainCanvas, in base units. */
function renderArtwork() {
	setPencilSeed(renderSeed);
	noiseSeed(renderSeed);
	mainCanvas.push();
	mainCanvas.scale(MULTIPLIER);
	renderPerspective(mainCanvas, composition, {W: BASE_WIDTH, H: BASE_HEIGHT, debug: showDebug});
	mainCanvas.pop();
	if (showDebug) validatePerspective(composition.scene, composition.boxes);
}

function setup() {
	executionTimer.start();

	// Canvas setup
	const screenRatio = window.innerWidth / window.innerHeight;
	const baseRatio = BASE_WIDTH / BASE_HEIGHT;
	MULTIPLIER = screenRatio < baseRatio ? window.innerWidth / BASE_WIDTH : window.innerHeight / BASE_HEIGHT;

	// Create main canvas for artwork
	mainCanvas = createGraphics(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER);

	// Create shader canvas (WEBGL) or regular canvas
	if (shadersEnabled()) {
		shaderCanvas = createCanvas(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER, WEBGL);

		// Restore panel edits from localStorage before setup
		if (PERSIST_SHADER_PANEL && typeof shaderEffects.loadPersistedPanelConfig === "function") {
			shaderEffects.loadPersistedPanelConfig();
		}

		shaderEffects.setup(width, height, mainCanvas, shaderCanvas, pixel_density);
		shaderCanvas.pixelDensity(pixel_density);
	} else {
		createCanvas(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER);
		pixelDensity(pixel_density);
	}

	// Setup main canvas
	mainCanvas.pixelDensity(pixel_density);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	mainCanvas.rectMode(CENTER);
	mainCanvas.angleMode(DEGREES);
	mainCanvas.strokeCap(ROUND);

	// Set global color mode
	colorMode(HSB, 360, 100, 100, 100);

	// Use the dimension-agnostic functions
	setPixelRatio(dpi(pixel_density));
	setDimensionAgnostic(DEFAULT_SIZE);

	// Initialize random
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	// Generated in src/index.js (bundle), which also sets the fxhash features
	compositionParams = window.composition_params;
	features = $fx.getFeatures();

	renderSeed = Math.floor(fxrand() * 1e9);
	composition = buildComposition(compositionParams, BASE_WIDTH, BASE_HEIGHT);
	renderArtwork();

	executionTimer.stop().logElapsedTime("Sketch completed in");
	if (shadersEnabled()) {
		shaderEffects.setParticleAnimationComplete(true);
	}
	$fx.preview();
	document.complete = true;
	sketchComplete = true;

	if (ENABLE_DEV_PANELS) {
		setupDevPanels();
	}

	// Start the custom draw loop (shaders keep running after the drawing is done)
	customDraw();
}

function setupDevPanels() {
	if (typeof shaderEffectsPanel !== "undefined" && shadersEnabled() && shaderCanvas) {
		shaderEffectsPanel.init(shaderEffects);
	}
	startPanelLoop();
}

// Panels run on their own rAF loop so they stay live independently of the
// artwork draw loop (which can stop on completion).
function startPanelLoop() {
	if (panelLoopId !== null) return;
	const tick = () => {
		if (typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.update();
		panelLoopId = requestAnimationFrame(tick);
	};
	panelLoopId = requestAnimationFrame(tick);
}

// Track sketch completion state
let sketchComplete = false;

// Custom draw loop - the drawing is static, only the shader effects run per frame
function customDraw() {
	if (shadersEnabled()) {
		const shouldContinue = shaderEffects.renderFrame(sketchComplete, customDraw);
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		clear();
		image(mainCanvas, 0, 0);
		requestAnimationFrame(customDraw);
	}
}

function keyPressed() {
	// Don't hijack keys while typing in panel inputs
	const tag = document.activeElement?.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) {
		return;
	}

	if (key === "E" || key === "e") {
		if (typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.toggle();
	}
	if (key === "D" || key === "d") {
		showDebug = !showDebug;
		renderArtwork();
	}
}
