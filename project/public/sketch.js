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

// Media mode: 0 = loaded image from assets, 1 = camera feed
const MEDIA_MODE = 1;

// Canvas references
let pixel_density = 2;
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects (if shaders enabled)
let capture; // Video capture when MEDIA_MODE === 1

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

	// Create main canvas: viewport-sized for camera; cover-sized for image when we have assets
	const useCamera = MEDIA_MODE === 1;
	const hasAssets = !useCamera && typeof assetLoader !== "undefined" && assetLoader.getLoadedKeys().length > 0;
	const coverSize = hasAssets ? assetLoader.getCoverDimensions(viewportW, viewportH) : null;

	if (useCamera) {
		capture = createCapture(VIDEO);
		capture.hide();
		capture.play(); // ensure live stream updates every frame
		mainCanvas = createGraphics(viewportW, viewportH);
	} else if (coverSize) {
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

	// Draw source: image (mode 0) or leave clear for camera (mode 1, drawn each frame)
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

// Draw video to mainCanvas with cover fit (same logic as asset cover)
function drawVideoCover(canvas, video) {
	if (!video || video.width <= 0 || video.height <= 0) return;
	const destW = canvas.width;
	const destH = canvas.height;
	const imgRatio = video.width / video.height;
	const destRatio = destW / destH;
	let w, h, x, y;
	if (imgRatio > destRatio) {
		h = destH;
		w = destH * imgRatio;
	} else {
		w = destW;
		h = destW / imgRatio;
	}
	x = (destW - w) / 2;
	y = (destH - h) / 2;
	canvas.image(video, x, y, w, h);
}

// Draw loop - applies shader effects to the image on mainCanvas
function customDraw() {
	// Camera mode: pass the video element directly so the pipeline samples the live stream each frame (no canvas cache)
	const inputTexture = MEDIA_MODE === 1 && capture ? capture : null;

	if (typeof shaderEffects !== "undefined") {
		const shouldContinue = shaderEffects.renderFrame(true, customDraw, inputTexture);
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		clear();
		if (inputTexture) {
			drawVideoCover(mainCanvas, capture);
			image(mainCanvas, 0, 0);
		} else {
			image(mainCanvas, 0, 0);
		}
		requestAnimationFrame(customDraw);
	}
}
