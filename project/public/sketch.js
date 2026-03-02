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

// Canvas references
let pixel_density = 2;
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects (if shaders enabled)
function preload() {
	// Load assets from assets/images/ (optional - will work without it)
	if (typeof assetLoader !== "undefined") {
		assetLoader.preload(this);
	}
	// Initialize shader effects (optional - will work without it)
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.preload(this);
	}
}

function setup() {
	features = $fx.getFeatures();

	// Canvas setup
	const screenRatio = window.innerWidth / window.innerHeight;
	const baseRatio = BASE_WIDTH / BASE_HEIGHT;
	MULTIPLIER = screenRatio < baseRatio ? window.innerWidth / BASE_WIDTH : window.innerHeight / BASE_HEIGHT;

	const viewportW = BASE_WIDTH * MULTIPLIER;
	const viewportH = BASE_HEIGHT * MULTIPLIER;

	// Create main canvas: cover-sized when we have assets (so shaders can sample overflow), else viewport-sized
	const hasAssets = typeof assetLoader !== "undefined" && assetLoader.getLoadedKeys().length > 0;
	const coverSize = hasAssets ? assetLoader.getCoverDimensions(viewportW, viewportH) : null;
	if (coverSize) {
		mainCanvas = createGraphics(coverSize.w, coverSize.h);
	} else {
		mainCanvas = createGraphics(viewportW, viewportH);
	}

	// Create shader canvas (WEBGL) or regular canvas
	if (typeof shaderEffects !== "undefined") {
		shaderCanvas = createCanvas(viewportW, viewportH, WEBGL);
		shaderEffects.setup(width, height, mainCanvas, shaderCanvas);
		shaderCanvas.pixelDensity(pixel_density);
	} else {
		createCanvas(viewportW, viewportH);
		pixelDensity(pixel_density);
	}

	// Setup main canvas
	mainCanvas.pixelDensity(pixel_density);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	mainCanvas.rectMode(CENTER);
	mainCanvas.angleMode(DEGREES);
	mainCanvas.background(50, 10, 0);

	// Draw loaded asset (full cover size, no clipping – overflow stays in buffer for symmetry shader)
	if (hasAssets) {
		assetLoader.drawAsset(mainCanvas, {fit: "cover"});
	}

	// Set global color mode
	colorMode(HSB, 360, 100, 100, 100);

	// Use the dimension-agnostic functions
	setPixelRatio(dpi(pixel_density));
	setDimensionAgnostic(DEFAULT_SIZE);

	// No particle animation - mark complete and trigger fxhash preview
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.setParticleAnimationComplete(true);
	}
	$fx.preview();
	document.complete = true;

	// Start the draw loop (shaders only, image is static)
	customDraw();
}

// Draw loop - applies shader effects to the image on mainCanvas
function customDraw() {
	if (typeof shaderEffects !== "undefined") {
		const shouldContinue = shaderEffects.renderFrame(true, customDraw);
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		clear();
		image(mainCanvas, 0, 0);
		requestAnimationFrame(customDraw);
	}
}
