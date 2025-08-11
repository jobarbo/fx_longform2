let features = "";
let movers = [];
let startTime;
let maxFrames = 25;
let elapsedTime = 0;
let particleNum = 1500000;
// Adjust cycle for smoother percentage updates (1% increments)
let cycle = parseInt((maxFrames * particleNum) / 1170);
let executionTimer = new ExecutionTimer(); // Replace executionStartTime with timer instance

// Shader Manager - using global instance from shaderManager.js
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects
let debugCanvas; // Separate canvas for debug overlays
let compositeCanvas; // Combined canvas for shader processing

// Animation control
let particleAnimationComplete = false;
let shaderTime = 0;

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

// Two different base HSL palettes to choose from
let basePalettes = [
	// Palette 1: Current blue-orange gradient
	[
		{h: 200, s: 100, l: 3}, // #00202e
		{h: 200, s: 100, l: 9}, // #00202e
		{h: 200, s: 100, l: 18}, // #003f5c
		{h: 218, s: 45, l: 32}, // #2c4875
		{h: 295, s: 28, l: 44}, // #8a508f
		{h: 320, s: 40, l: 53}, // #bc5090
		{h: 1, s: 100, l: 69}, // #ff6361
		{h: 25, s: 100, l: 60}, // #ff8531
		{h: 39, s: 100, l: 50}, // #ffa600
		{h: 44, s: 100, l: 75}, // #ffd380
	],
	// Palette 2: Dark blue-green to coral gradient (smoother transitions)
	[
		{h: 190, s: 43, l: 7}, // #0a1419
		{h: 208, s: 37, l: 12}, // #141f2b
		{h: 215, s: 34, l: 18}, // #1e2a3d
		{h: 215, s: 36, l: 25}, // #283c55
		{h: 215, s: 35, l: 37}, // #355070
		{h: 230, s: 25, l: 38}, // Intermediate blue-purple
		{h: 250, s: 20, l: 39}, // Intermediate purple-blue
		{h: 284, s: 15, l: 40}, // #6d597a
		{h: 335, s: 21, l: 44}, // #915f78
		{h: 349, s: 24, l: 53}, // #b56576
		{h: 2, s: 69, l: 67}, // #e56b6f
		{h: 8, s: 70, l: 68}, // #e77c76
		{h: 14, s: 71, l: 69}, // #e88c7d
		{h: 26, s: 69, l: 73}, // #eaac8b
		{h: 35, s: 77, l: 80}, // #eebba0
	],

	[
		{h: 200, s: 100, l: 5}, // rgba(5, 32, 46, 1)
		{h: 187, s: 95, l: 10}, // rgba(7, 50, 56, 1)
		{h: 182, s: 90, l: 15}, // rgba(13, 85, 87, 1)
		{h: 161, s: 85, l: 20}, // rgba(24, 115, 86, 1)
		{h: 145, s: 80, l: 25}, // rgba(47, 150, 90, 1)
		{h: 80, s: 75, l: 35}, // rgba(148, 184, 77, 1)
		{h: 71, s: 70, l: 45}, // rgba(219, 194, 127, 1)
		{h: 64, s: 65, l: 55}, // rgba(255, 223, 189, 1)
		{h: 60, s: 60, l: 65},
	],

	[
		{h: 240, s: 100, l: 8}, // Deep midnight blue
		{h: 250, s: 85, l: 12}, // Dark blue-purple
		{h: 265, s: 75, l: 18}, // Deep purple
		{h: 285, s: 70, l: 25}, // Purple-magenta
		{h: 310, s: 65, l: 32}, // Magenta-pink
		{h: 340, s: 80, l: 40}, // Deep coral-red
		{h: 350, s: 75, l: 45}, // Deep coral-red
		{h: 15, s: 85, l: 48}, // Warm red-orange
		{h: 25, s: 90, l: 58}, // Bright orange
		{h: 35, s: 85, l: 68}, // Light orange
		{h: 45, s: 80, l: 78}, // Golden yellow
		{h: 55, s: 70, l: 85}, // Light golden
	],

	[
		{h: 252, s: 95, l: 1},
		{h: 247, s: 85, l: 5},
		{h: 242, s: 76, l: 8},
		{h: 234, s: 76, l: 13},
		{h: 230, s: 66, l: 21},
		{h: 225, s: 68, l: 27},
		{h: 215, s: 69, l: 33},
		{h: 205, s: 71, l: 38},
		{h: 197, s: 73, l: 44},
		{h: 192, s: 76, l: 48},
		{h: 186, s: 77, l: 53},
		{h: 181, s: 85, l: 58},
		{h: 175, s: 87, l: 65},
		{h: 171, s: 89, l: 68},
		{h: 165, s: 88, l: 78},
		{h: 161, s: 72, l: 85},
	],
	[{h: 252, s: 95, l: 1}],
	[{h: 45, s: 100, l: 100}],
];

let selectedPalette; // Will store the randomly selected palette
let baseHSLPalette; // Keep for backward compatibility

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
let ARTWORK_RATIO = 1.6;
let BASE_WIDTH = 948;
let BASE_HEIGHT = BASE_WIDTH / ARTWORK_RATIO;

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

	// Load the shader we need
	shaderManager.loadShader("chromatic", "chromatic-aberration/fragment.frag");
}

function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// Calculate optimal pixel density before creating canvases
	pixel_density = 5;

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork
	mainCanvas = createGraphics(DIM * ARTWORK_RATIO, DIM);
	// Create debug canvas for overlays
	debugCanvas = createGraphics(DIM * ARTWORK_RATIO, DIM);
	// Create shader canvas for the WEBGL renderer
	shaderCanvas = createCanvas(DIM * ARTWORK_RATIO, DIM, WEBGL);
	// Create composite canvas for combining main and debug content
	compositeCanvas = createGraphics(DIM * ARTWORK_RATIO, DIM);

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

	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	let scaleFactorX = 1;
	let scaleFactorY = 1;

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
			if (currentFrame > -1) {
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
}

function INIT(rseed, nseed) {
	movers = [];

	// Generate color variations first (1000 different palettes)
	selectedPalette = int(random(basePalettes.length));
	baseHSLPalette = basePalettes[6];
	generateColorVariations();

	// Scale noise values based on MULTIPLIER
	scl1 = 0.006 / MULTIPLIER;
	scl2 = 0.006 / MULTIPLIER;
	scl3 = 0.006 / MULTIPLIER;

	let sclOffset1 = 0.9;
	let sclOffset2 = 1.2;
	let sclOffset3 = 1.2;

	let amplitude1 = 1 * MULTIPLIER;
	let amplitude2 = 1 * MULTIPLIER;

	// Simple 10% padding calculation with artwork ratio
	let padding = 0.11;
	xMin = padding;
	xMax = 1 - padding;
	yMin = padding;
	yMax = 1 - padding;

	let hue = random(360); // Define base hue for particles

	// Scale number of particles based on canvas size
	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		// Randomly assign one of the pre-calculated color variations using Math.random()
		let colorVariationIndex = 0;
		let selectedPalette;
		if (colorVariations.length > 0) {
			colorVariationIndex = Math.floor(Math.random() * colorVariations.length);
			selectedPalette = colorVariations[colorVariationIndex];
		} else {
			// Use base palette directly when no variations exist
			selectedPalette = baseHSLPalette;
		}

		movers.push(new Mover(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, selectedPalette));
	}

	let bgCol = color(25, 5, 2);
	mainCanvas.background(bgCol);

	//initGrid(50);
}

// Traditional draw function that handles shader effects continuously
function draw() {
	// Update shader animation time
	shaderTime += 0.01;

	// Always apply shader effects
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
	const numVariations = 0; // Create 1000 different color palettes
	colorVariations = [];

	for (let i = 0; i < numVariations; i++) {
		// Use Math.random() instead of p5's random() to avoid affecting the seed
		const saturationOffset = random(-5, 15); // -5 to 5
		const brightnessOffset = random(-5, 5); // -5 to 5

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
	}

	console.log(`Using palette ${selectedPalette + 1} with ${baseHSLPalette.length} colors`);
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

	// Apply the shader effect using the composite canvas
	shaderManager
		.apply("chromatic", {
			uTexture: compositeCanvas,
			uTime: shaderTime,
			uResolution: [width, height],
			uEffectType: 1,
		})
		.drawFullscreenQuad();
}

// Keyboard controls
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

	debugCanvas.pop();
}
