let features = "";
let movers = [];
let startTime;
let maxFrames = 25;
let elapsedTime = 0;
let particleNum = 500000;
// Adjust cycle for smoother percentage updates (1% increments)
let cycle = parseInt((maxFrames * particleNum) / 1170);
let executionTimer = new ExecutionTimer(); // Replace executionStartTime with timer instance

// Swatch palette system
let swatchPalette;
let swatchesLoaded = false;

// Shader Manager - using global instance from shaderManager.js
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects
let debugCanvas; // Separate canvas for debug overlays
let compositeCanvas; // Combined canvas for shader processing

// Animation control
let particleAnimationComplete = false;
let shaderTime = 0;
let shaderSeed = 0; // Will be initialized with fxhash in setup
let effectsConfig = {
	deform: {enabled: false, amount: 0.1},
	chromatic: {enabled: false, amount: 0.003},
	grain: {enabled: true, amount: 0.1},
};

// Debug controls
let debugPadding = false;

// Global color mapping optimization
let globalColorIndices = {
	once: 0,
	yoyo: 0,
	default: 0,
	onceCompleted: false,
	// Pre-calculated yo-yo indices for common cycle counts
	yoyoCycles: {},
	lastCalculatedFrame: -1, // Track last frame we calculated for
};

// Removed hardcoded palettes - now using exclusively swatch palettes from /swatches/ folder

let selectedPalette; // Will store the randomly selected palette
let baseHSLPalette; // Keep for backward compatibility
let currentPaletteName = ""; // Store the name of the current palette for debug

// Pre-calculated color variations (1000 different palettes)
let colorVariations = [];

let scl1;
let scl2;
let scl3;
let ang1;
let ang2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let isBordered = true;

let img;
let mask;

// Base artwork dimensions (width: 948, height: 948 * 1.41)
let ARTWORK_RATIO = 1.25;
let BASE_WIDTH = 948;
let BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;

// This is our reference size for scaling
let DEFAULT_SIZE = max(BASE_WIDTH, BASE_HEIGHT);

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

// Dynamic pixel density will be calculated in setup() after windowWidth/Height are available
let pixel_density;

function preload() {
	// Initialize the global shader manager instance
	shaderManager.init(this);

	// Set default vertex shader
	shaderManager.setDefaultVertex("chromatic-aberration/vertex.vert");

	// Load independent shaders
	shaderManager.loadShader("copy", "copy/fragment.frag", "copy/vertex.vert");
	shaderManager.loadShader("deform", "deform/fragment.frag", "deform/vertex.vert");
	shaderManager.loadShader("chromatic", "chromatic-aberration/fragment.frag", "chromatic-aberration/vertex.vert");
	shaderManager.loadShader("grain", "grain/fragment.frag", "grain/vertex.vert");

	// Initialize swatch palette system
	swatchPalette = new SwatchPalette();
}

async function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// Log hash and initial state for debugging
	console.log("=== PALETTE SELECTION DEBUG ===");
	console.log("fxhash:", $fx.hash);
	console.log("Initial fxrand() calls for palette selection:");

	// Store the current fxrand state to reset it after logging
	let testRand1 = fxrand();
	let testRand2 = fxrand();
	let testRand3 = fxrand();
	console.log("fxrand() call 1:", testRand1);
	console.log("fxrand() call 2:", testRand2);
	console.log("fxrand() call 3:", testRand3);

	// Reset the random seed to ensure consistency
	$fx.rand.reset();
	console.log("Random seed reset for consistent palette selection");

	// Load swatch palettes - REQUIRED for this project (no hardcoded fallback)
	try {
		console.log("Attempting to load swatch palettes...");
		await swatchPalette.loadFromManifest("swatches/manifest.json");
		swatchesLoaded = true;
		console.log(`✓ Successfully loaded ${swatchPalette.getSwatchCount()} swatch palettes`);
		console.log("Swatch palette isReady():", swatchPalette.isReady());
		if (swatchPalette.isReady()) {
			console.log("Available swatch names:", swatchPalette.getSwatchNames());
		} else {
			throw new Error("Swatch palette loaded but not ready");
		}
	} catch (error) {
		console.error("✗ CRITICAL ERROR: Failed to load swatch palettes:", error);
		console.error("This project requires swatch palettes to function. Please check:");
		console.error("1. swatches/manifest.json exists and is valid");
		console.error("2. All swatch image files exist in swatches/ folder");
		console.error("3. Network/CORS configuration allows loading the images");
		swatchesLoaded = false;
		throw error; // Stop execution if swatch palettes can't be loaded
	}

	// Calculate optimal pixel density before creating canvases
	pixel_density = 2;

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork
	mainCanvas = createGraphics(DIM, DIM * ARTWORK_RATIO);
	// Create debug canvas for overlays
	debugCanvas = createGraphics(DIM, DIM * ARTWORK_RATIO);
	// Create shader canvas for the WEBGL renderer
	shaderCanvas = createCanvas(DIM, DIM * ARTWORK_RATIO, WEBGL);
	// Create composite canvas for combining main and debug content
	compositeCanvas = createGraphics(DIM, DIM * ARTWORK_RATIO);

	// Init shader pipeline ping-pong buffers
	shaderPipeline = new ShaderPipeline(shaderManager, this).init(width, height);

	// Set up the rendering properties
	mainCanvas.pixelDensity(pixel_density);
	shaderCanvas.pixelDensity(pixel_density);
	debugCanvas.pixelDensity(pixel_density);
	compositeCanvas.pixelDensity(pixel_density);

	// Set color modes and ensure proper color preservation
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	debugCanvas.colorMode(HSB, 360, 100, 100, 100);
	compositeCanvas.colorMode(HSB, 360, 100, 100, 100);
	colorMode(HSB, 360, 100, 100, 100);

	// Enable color preservation settings for mainCanvas
	mainCanvas.drawingContext.imageSmoothingEnabled = false;
	mainCanvas.drawingContext.globalCompositeOperation = "source-over";

	// Initialize debug canvas as transparent
	debugCanvas.clear();
	debugCanvas.drawingContext.globalCompositeOperation = "source-over";

	// Store random values from a clean fxrand state for deterministic behavior
	console.log("=== RANDOM SEED INITIALIZATION ===");
	console.log("Hash for seed generation:", $fx.hash);

	let mainRandomSeed = fxrand() * 10000;
	let mainNoiseSeed = fxrand() * 10000;
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	shaderSeed = fxrand() * 10000; // Initialize shader seed with fxhash

	console.log("Generated seeds:");
	console.log("  - mainRandomSeed:", mainRandomSeed);
	console.log("  - mainNoiseSeed:", mainNoiseSeed);
	console.log("  - rseed:", rseed);
	console.log("  - nseed:", nseed);
	console.log("  - shaderSeed:", shaderSeed);

	randomSeed(mainRandomSeed);
	noiseSeed(mainNoiseSeed);

	console.log("=== END RANDOM SEED INITIALIZATION ===");
	let scaleFactorX = 1.12;
	let scaleFactorY = 1.12;

	debugCanvas.translate(width / 2, height / 2);
	debugCanvas.scale(scaleFactorX, scaleFactorY);
	debugCanvas.translate(-width / 2, -height / 2); // Move back to maintain center

	mainCanvas.translate(width / 2, height / 2);
	mainCanvas.scale(scaleFactorX, scaleFactorY);
	mainCanvas.translate(-width / 2, -height / 2); // Move back to maintain center

	INIT(rseed, nseed);

	// Calculate the center offset based on scale

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		currentFrame: 0, // Add current frame tracking
		renderItem: (mover, currentFrame) => {
			if (currentFrame > 0) {
				mover.show(mainCanvas);
			}
		},
		moveItem: (mover, currentFrame) => {
			// Calculate color indices once per frame (check if not already calculated)
			if (globalColorIndices.lastCalculatedFrame !== currentFrame) {
				calculateGlobalColorIndices(currentFrame, maxFrames, baseHSLPalette.length);
				globalColorIndices.lastCalculatedFrame = currentFrame;
			}
			mover.move(currentFrame, maxFrames);
		},

		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			particleAnimationComplete = true;
			$fx.preview();
			document.complete = true;
			console.log("Particle animation complete, shader animation continues");
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(animConfig);
	startAnimation(generator);

	// Log available controls
	console.log("Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)");
	console.log(`Current palette: ${currentPaletteName}`);
}

function INIT(rseed, nseed) {
	movers = [];

	// Enhanced palette selection logging
	console.log("=== PALETTE SELECTION LOGIC ===");
	console.log("swatchesLoaded:", swatchesLoaded);
	console.log("swatchPalette.isReady():", swatchPalette.isReady());
	console.log("Current fxhash for palette selection:", $fx.hash);

	// Verify that swatch palettes are available (required for this project)
	if (!swatchesLoaded || !swatchPalette.isReady()) {
		throw new Error("CRITICAL: Swatch palettes are required but not available. Cannot proceed with palette selection.");
	}

	// CRITICAL FIX: Reset the random seed to ensure consistent state
	$fx.rand.reset();
	console.log("Random seed reset to ensure deterministic palette selection");

	// Store the fxrand value we'll use for selection to ensure consistency
	const paletteSelectionRand = fxrand();
	console.log("Palette selection fxrand() value:", paletteSelectionRand);

	// Use ONLY swatch palettes - no hardcoded fallback
	const swatchNames = swatchPalette.getSwatchNames();
	console.log("Available swatch names:", swatchNames);

	if (swatchNames.length === 0) {
		throw new Error("No swatch palettes available for selection");
	}

	// Select directly from swatch palettes
	selectedPalette = Math.floor(paletteSelectionRand * swatchNames.length);
	currentPaletteName = swatchNames[selectedPalette];
	baseHSLPalette = swatchPalette.getPalette(currentPaletteName);

	if (!baseHSLPalette || baseHSLPalette.length === 0) {
		throw new Error(`Selected swatch palette '${currentPaletteName}' is empty or invalid`);
	}

	console.log(`✓ SELECTED SWATCH PALETTE:`);
	console.log(`  - Index: ${selectedPalette} of ${swatchNames.length}`);
	console.log(`  - Name: '${currentPaletteName}'`);
	console.log(`  - Source: SWATCH (exclusive)`);
	console.log(`  - Colors: ${baseHSLPalette.length}`);
	console.log(`  - First color:`, baseHSLPalette[0]);
	console.log(`  - Last color:`, baseHSLPalette[baseHSLPalette.length - 1]);

	console.log("=== END PALETTE SELECTION ===");

	generateColorVariations();

	// Scale noise values based on MULTIPLIER
	scl1 = 0.002 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.002 / MULTIPLIER;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;

	let amplitude1 = 1 * MULTIPLIER;
	let amplitude2 = 1 * MULTIPLIER;

	// Simple 10% padding calculation with artwork rzatio
	let padding = -0.05;
	xMin = padding;
	xMax = 1 - padding;
	yMin = padding;
	yMax = 1 - padding;

	let hue = random(360); // Define base hue for particles

	// Scale number of particles based on canvas size
	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	// Log color variation assignment for first few particles
	console.log("=== COLOR VARIATION ASSIGNMENT ===");
	console.log("Total color variations generated:", colorVariations.length);
	console.log("Will assign to", scaledParticleCount, "particles");

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		// Randomly assign one of the pre-calculated color variations using fxrand() for deterministic selection
		let colorVariationIndex = 0;
		let selectedPalette;
		if (colorVariations.length > 0) {
			colorVariationIndex = Math.floor(fxrand() * colorVariations.length);
			selectedPalette = colorVariations[colorVariationIndex];
		} else {
			// Use base palette directly when no variations exist
			selectedPalette = baseHSLPalette;
		}

		// Log first few assignments for debugging
		if (i < 3) {
			console.log(`Particle ${i}:`);
			console.log(`  - Color variation index: ${colorVariationIndex}`);
			console.log(`  - Palette colors: ${selectedPalette.length}`);
			console.log(`  - First color:`, selectedPalette[0]);
		}

		movers.push(new Mover(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, selectedPalette));
	}

	console.log("=== END COLOR VARIATION ASSIGNMENT ===");

	let bgCol = color(25, 5, 100);
	mainCanvas.background(bgCol);

	//initGrid(50);
}

// Traditional draw function that handles shader effects continuously
function draw() {
	// Only proceed if setup is complete and canvases are initialized
	if (!compositeCanvas || !mainCanvas || !debugCanvas) {
		return;
	}

	// Update shader animation time
	shaderTime += 0.01;

	// Always apply shader effectss
	applyShaderEffect();
}

function calculateGlobalColorIndices(currentFrame, maxFrames, paletteLength) {
	// Calculate once for "once" mode
	if (currentFrame === 0) {
		globalColorIndices.onceCompleted = false;
	}

	if (!globalColorIndices.onceCompleted) {
		let progress = currentFrame / (maxFrames - 1);
		if (progress >= 1) {
			globalColorIndices.onceCompleted = true;
			globalColorIndices.once = 0;
		} else {
			globalColorIndices.once = Math.floor((1 - progress) * (paletteLength - 1));
		}
	}

	// Calculate yo-yo indices for common cycle counts (1-4)
	for (let cycleCount = 1; cycleCount <= 4; cycleCount++) {
		let frequency = (cycleCount * Math.PI) / (maxFrames - 1);
		let cosValue = Math.cos(currentFrame * frequency);
		globalColorIndices.yoyoCycles[cycleCount] = Math.round(((cosValue + 1) / 2) * (paletteLength - 1));
	}

	// Keep the original yoyo for backward compatibility (cycle count 1)
	globalColorIndices.yoyo = globalColorIndices.yoyoCycles[1];

	// Calculate once for "default" mode
	let mappedIndex = map(currentFrame, 0, maxFrames / 1.25, paletteLength - 1, 0, true);
	globalColorIndices.default = Math.floor(mappedIndex);
}

function generateColorVariations() {
	const numVariations = 0; // Create 0 different color palettes (disabled for now)
	colorVariations = [];

	console.log("=== COLOR VARIATION GENERATION ===");
	console.log(`Generating ${numVariations} color variations from base palette`);
	console.log("Base palette colors:", baseHSLPalette.length);

	for (let i = 0; i < numVariations; i++) {
		// Use fxrand() for deterministic variation generation
		const saturationOffset = fxrand() * 20 - 5; // -5 to 15
		const brightnessOffset = fxrand() * 10 - 5; // -5 to 5

		const palette = baseHSLPalette.map((hsl) => {
			const finalS = Math.max(0, Math.min(100, hsl.s + saturationOffset));
			const finalL = Math.max(0, Math.min(100, hsl.l + brightnessOffset));
			return {
				h: hsl.h,
				s: finalS,
				l: finalL,
			};
		});

		colorVariations.push(palette);

		// Log first few variations for debugging
		if (i < 3) {
			console.log(`Variation ${i}: sat offset ${saturationOffset.toFixed(2)}, brightness offset ${brightnessOffset.toFixed(2)}`);
		}
	}

	console.log(`✓ Generated ${numVariations} color variations from base palette`);
	console.log("=== END COLOR VARIATION GENERATION ===");
}

// Helper function to load additional shaders dynamically
function loadShader(name, fragPath, vertPath = null) {
	if (shaderManager) {
		shaderManager.loadShader(name, fragPath, vertPath);
		console.log(`Loaded shader: ${name}`);
	}
}

// Helper function to get available shader names
function getLoadedShaders() {
	if (shaderManager && shaderManager.shaders) {
		return Object.keys(shaderManager.shaders);
	}
	return [];
}

// Function to apply shader effects (call this in your render loop if needed)
function applyShaderEffect() {
	if (!shaderManager) {
		console.log("ShaderManager not available");
		return;
	}

	// Check if canvases are initialized
	if (!compositeCanvas || !mainCanvas || !debugCanvas) {
		return;
	}

	// Clear the shader canvas
	clear();

	// Clear and prepare the composite canvas
	compositeCanvas.clear();

	// Draw mainCanvas first
	compositeCanvas.image(mainCanvas, 0, 0);

	// Overlay debugCanvas if debug is enabled
	if (debugPadding) {
		compositeCanvas.image(debugCanvas, 0, 0);
	}

	// Build effect passes dynamically
	shaderPipeline.clearPasses();
	if (effectsConfig.deform.enabled) {
		shaderPipeline.addPass("deform", () => ({
			uTime: shaderTime,
			uSeed: shaderSeed,
			uAmount: effectsConfig.deform.amount,
		}));
	}
	if (effectsConfig.chromatic.enabled) {
		shaderPipeline.addPass("chromatic", () => ({
			uTime: shaderTime,
			uSeed: shaderSeed + 777.0,
			uAmount: effectsConfig.chromatic.amount,
		}));
	}
	if (effectsConfig.grain.enabled) {
		shaderPipeline.addPass("grain", () => ({
			uTime: shaderTime,
			uSeed: shaderSeed + 345.0,
			uAmount: effectsConfig.grain.amount,
		}));
	}

	// Run pipeline from compositeCanvas to the main WEBGL canvas (default p5 instance)
	shaderPipeline.run(compositeCanvas);
}

// Keyboard controls
// D/d: Toggle debug padding
function keyPressed() {
	if (key === "d" || key === "D") {
		debugPadding = !debugPadding;
		console.log("Debug padding:", debugPadding ? "enabled" : "disabled");
		// Update debug canvas when toggled
		drawDebugPadding();
	}
}

// Function to draw debug padding outline
function drawDebugPadding() {
	// Check if debug canvas is initialized
	if (!debugCanvas) return;

	// Clear the debug canvas first
	debugCanvas.clear();

	if (!debugPadding) return;

	// Calculate the basic padding bounds in pixels
	let left = xMin * width;
	let right = xMax * width;
	let top = yMin * height;
	let bottom = yMax * height;

	// Draw on the debug canvas
	debugCanvas.push();

	// Draw basic padding bounds (green)
	debugCanvas.stroke(120, 100, 100, 90); // Bright green with transparency
	debugCanvas.strokeWeight(3);
	debugCanvas.noFill();
	debugCanvas.rect(left, top, right - left, bottom - top);

	// Draw actual particle movement bounds (red) if we have movers
	if (movers && movers.length > 0) {
		let mover = movers[0]; // Get bounds from first mover

		debugCanvas.stroke(0, 100, 100, 90); // Bright red with transparency
		debugCanvas.strokeWeight(3);
		debugCanvas.noFill();

		// Draw the actual movement bounds rectangle
		let moveLeft = mover.minBoundX;
		let moveRight = mover.maxBoundX;
		let moveTop = mover.minBoundY;
		let moveBottom = mover.maxBoundY;

		debugCanvas.rect(moveLeft, moveTop, moveRight - moveLeft, moveBottom - moveTop);
	}

	// Draw palette information text
	debugCanvas.fill(0, 0, 100, 90); // White with transparency
	debugCanvas.noStroke();
	debugCanvas.textAlign(LEFT, TOP);
	debugCanvas.textSize(16);

	let debugText = `Palette: ${currentPaletteName}\nColors: ${baseHSLPalette ? baseHSLPalette.length : 0}`;
	if (swatchesLoaded) {
		debugText += `\nSource: Swatch Image`;
	} else {
		debugText += `\nSource: Hardcoded Array`;
	}

	// Draw text background
	let textWidth = debugCanvas.textWidth(debugText.split("\n")[0]) + 20;
	let textHeight = 60;
	debugCanvas.fill(0, 0, 0, 70); // Semi-transparent black background
	debugCanvas.rect(10, 10, textWidth, textHeight);

	// Draw text
	debugCanvas.fill(0, 0, 100, 90); // White text
	debugCanvas.text(debugText, 20, 20);

	debugCanvas.pop();
}
