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

// Source image (replaces particle system)
let sourceImage;
const SOURCE_IMAGE_PATH = "./assets/p.gif";

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
	sourceImage = loadImage(SOURCE_IMAGE_PATH);

	// Initialize shader effects (optional - will work without it)
	if (shadersEnabled()) {
		shaderEffects.preload(this);
	}
}

/** Draw the GIF so it fits entirely in the canvas (letterboxed if needed). */
function drawImageContain(g, img) {
	const cw = g.width;
	const ch = g.height;
	const scale = Math.min(cw / img.width, ch / img.height);
	const dw = img.width * scale;
	const dh = img.height * scale;
	g.push();
	g.imageMode(CORNER);
	// Dest-only image() so p5 advances animated GIF frames (source-rect form can freeze them).
	g.image(img, (cw - dw) * 0.5, (ch - dh) * 0.5, dw, dh);
	g.pop();
}

function drawGifFrame() {
	mainCanvas.background(35, 100, 20);
	drawImageContain(mainCanvas, sourceImage);
}

function setup() {
	features = $fx.getFeatures();
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
	mainCanvas.background(50, 10, 0);

	// Set global color mode
	colorMode(HSB, 360, 100, 100, 100);

	// Use the dimension-agnostic functions
	setPixelRatio(dpi(pixel_density));
	setDimensionAgnostic(DEFAULT_SIZE);

	// Initialize random
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	if (typeof sourceImage.play === "function") {
		sourceImage.play();
	}

	drawGifFrame();

	executionTimer.stop().logElapsedTime("Sketch completed in");
	if (shadersEnabled()) {
		shaderEffects.setParticleAnimationComplete(true);
	}
	$fx.preview();
	document.complete = true;
	sketchComplete = true;
	console.log("GIF playing (contain)");

	if (ENABLE_DEV_PANELS) {
		setupDevPanels();
	}

	// Start the custom draw loop (shaders keep running after the image is drawn)
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

// Custom draw loop - redraws the GIF, then applies shader effects
function customDraw() {
	drawGifFrame();

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
}
