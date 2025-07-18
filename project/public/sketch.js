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
let isShaderEnabled = true;
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects

// Animation control
let particleAnimationComplete = false;
let shaderTime = 0;

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

	[{h: 0, s: 0, l: 0}],
];

let selectedPalette; // Will store the randomly selected palette
let baseHSLPalette; // Keep for backward compatibility

// Pre-calculated color variations (1000 different palettes)
let colorVariations = [];

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
	let mappedIndex = map(currentFrame, 0, maxFrames / 1.5, paletteLength - 1, 0, true);
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

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork
	mainCanvas = createGraphics(DIM, DIM * ARTWORK_RATIO);
	// Create shader canvas for the WEBGL renderer
	shaderCanvas = createCanvas(DIM, DIM * ARTWORK_RATIO, WEBGL);

	// Set up the rendering properties
	mainCanvas.pixelDensity(2);
	shaderCanvas.pixelDensity(2);

	// Set color modes and ensure proper color preservation
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	colorMode(HSB, 360, 100, 100, 100);

	// Enable color preservation settings for mainCanvas
	mainCanvas.drawingContext.imageSmoothingEnabled = false;
	mainCanvas.drawingContext.globalCompositeOperation = "source-over";
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	let scaleFactorX = 1;
	let scaleFactorY = 1;

	translate(width / 2, height / 2);
	scale(scaleFactorX, scaleFactorY);
	translate(-width / 2, -height / 2); // Move back to maintain center

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
}

// Function to toggle shader effects
function toggleShader() {
	isShaderEnabled = !isShaderEnabled;
	console.log("Shader effects:", isShaderEnabled ? "enabled" : "disabled");
}

// Function to apply shader effects (call this in your render loop if needed)
function applyShaderEffect() {
	if (!isShaderEnabled || !shaderManager) return;

	// Clear the shader canvas
	clear();

	// Apply the shader effect using the manager with dedicated shader time
	shaderManager
		.apply("chromatic", {
			uTexture: mainCanvas,
			uTime: shaderTime,
			uResolution: [width, height],
		})
		.drawFullscreenQuad();
}

// Keyboard controls
function keyPressed() {
	if (key === "g" || key === "G") {
		toggleShader();
	}
}

// Traditional draw function that handles shader effects continuously
function draw() {
	// Update shader animation time
	shaderTime += 0.01;

	// Apply shader effects to the main canvas
	if (isShaderEnabled) {
		applyShaderEffect();
	}
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

function INIT(rseed, nseed) {
	movers = [];

	// Generate color variations first (1000 different palettes)
	selectedPalette = int(random(basePalettes.length));
	baseHSLPalette = basePalettes[selectedPalette];
	generateColorVariations();

	// Scale noise values based on MULTIPLIER
	scl1 = 0.0019 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.0011 / MULTIPLIER;

	let sclOffset1 = 0.75;
	let sclOffset2 = 1;
	let sclOffset3 = 0.75;

	// Calculate padding based on the reference size and scale it
	let paddingRatioX = 0.005; // 45% padding for X axis
	let paddingRatioY = 0.005; // 45% padding for Y axis
	let basePaddingX = DEFAULT_SIZE * paddingRatioX;
	let basePaddingY = DEFAULT_SIZE * paddingRatioY;
	let paddingX = basePaddingX * MULTIPLIER;
	let paddingY = basePaddingY * MULTIPLIER;

	// Calculate bounds in absolute coordinates with equal padding
	let bounds = {
		left: paddingX,
		right: width - paddingX,
		top: paddingY,
		bottom: height - paddingY,
	};

	// Convert to relative coordinates
	xMin = bounds.left / width;
	xMax = bounds.right / width;
	yMin = bounds.top / height;
	yMax = bounds.bottom / height;

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

		movers.push(new Mover(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, selectedPalette));
	}

	let bgCol = color(45, 0, 100);
	mainCanvas.background(bgCol);

	//initGrid(50);
}

function initGrid(brightness) {
	// Add subtle organic grid texture
	let gridSizeX = width / 150; // Size of grid cells
	let gridSizeY = width / 150; // Size of grid cells
	let variance = gridSizeX / 1; // Amount of variation for particles
	let g_variance = gridSizeX / 1111;
	let noiseScale = 0.000015; // Scale of the noise

	// Vertical lines of particles
	for (let x = -gridSizeX; x <= width + gridSizeX; x += gridSizeX) {
		for (let y = -gridSizeY; y <= height + gridSizeY; y += gridSizeY / 10) {
			// More dense particle distribution
			let xPos = x + map(noise(x * noiseScale, y * noiseScale) + randomGaussian(0, g_variance), 0, 1, -variance, variance);
			noStroke();
			fill(0, 0, brightness, random(10, 60));
			rect(xPos, y, random(0.05, 0.25) * MULTIPLIER, random(0.05, 0.25) * MULTIPLIER);
		}
	}

	// Horizontal lines of particles
	for (let y = -gridSizeY; y <= height + gridSizeY; y += gridSizeY) {
		for (let x = -gridSizeX; x <= width + gridSizeX; x += gridSizeX / 10) {
			// More dense particle distribution
			let yPos = y + map(noise(x * noiseScale, y * noiseScale) + randomGaussian(0, g_variance), 0, 1, -variance, variance);
			noStroke();
			fill(0, 0, brightness, random(10, 60));
			rect(x, yPos, random(0.05, 0.25) * MULTIPLIER, random(0.05, 0.25) * MULTIPLIER);
		}
	}
}
