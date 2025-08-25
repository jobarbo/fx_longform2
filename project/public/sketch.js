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

// Modular shader effects configuration
// Each effect has:
// - enabled: boolean to toggle the effect
// - uniforms: mapping of uniform names to their values/expressions
// - Any additional parameters specific to that effect
let effectsConfig = {
	deform: {
		enabled: true,
		amount: 0.1,
		uniforms: {
			uTime: "shaderTime",
			uSeed: "shaderSeed",
			uAmount: "amount",
		},
	},
	chromatic: {
		enabled: true,
		amount: 0.003,
		uniforms: {
			uTime: "shaderTime",
			uSeed: "shaderSeed + 777.0",
			uAmount: "amount",
		},
	},
	grain: {
		enabled: true,
		amount: 0.1,
		uniforms: {
			uTime: "shaderTime",
			uSeed: "shaderSeed + 345.0",
			uAmount: "amount",
		},
	},
	collage: {
		enabled: true,
		amount: 21.0,
		tileSize: 55.0,
		tileSize2: 25.0,
		tileSize3: 16.0,
		sizeNoise: 1.0,
		rotNoise: 21.0,
		uniforms: {
			uSeed: "shaderSeed + 2222.0",
			uTileSize1: "tileSize",
			uTileSize2: "tileSize2",
			uTileSize3: "tileSize3",
			uSizeNoise: "sizeNoise",
			uRotNoise: "rotNoise",
			uAmount: "amount",
			uResolution: "[width, height]",
		},
	},
};

// Helper function to add new effects programmatically
function addShaderEffect(effectName, config) {
	effectsConfig[effectName] = {
		enabled: config.enabled || false,
		...config,
		uniforms: config.uniforms || {},
	};
}

// Helper function to enable/disable effects
function setEffectEnabled(effectName, enabled) {
	if (effectsConfig[effectName]) {
		effectsConfig[effectName].enabled = enabled;
	}
}

// Helper function to update effect parameters
function updateEffectParam(effectName, paramName, value) {
	if (effectsConfig[effectName] && effectsConfig[effectName][paramName] !== undefined) {
		effectsConfig[effectName][paramName] = value;
	}
}

// Debug controls
let debugPadding = false;

// Global color mapping optimization
// Simplified color management - no more complex calculations needed

// Removed hardcoded palettes - now using exclusively swatch palettes from /swatches/ folder

let selectedPalette; // Will store the randomly selected palette
let baseHSLPalette; // Keep for backward compatibility
let currentPaletteName = ""; // Store the name of the current palette for debug

// Pre-calculated color variations (1000 different palettes)
// No color variations needed - using swatches directly

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
	shaderManager.loadShader("collage", "collage-rotate/fragment.frag", "collage-rotate/vertex.vert");

	// Initialize swatch palette system
	swatchPalette = new SwatchPalette();
}

async function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// Reset the random seed to ensure consistency
	$fx.rand.reset();

	// Load swatch palettes - REQUIRED for this project (no hardcoded fallback)
	try {
		await swatchPalette.loadFromManifest("swatches/manifest.json");
		swatchesLoaded = true;
		if (!swatchPalette.isReady()) {
			throw new Error("Swatch palette loaded but not ready");
		}
	} catch (error) {
		console.error("Failed to load swatch palettes:", error);
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

	// Initialize random seeds from fxrand for deterministic behavior
	let mainRandomSeed = fxrand() * 10000;
	let mainNoiseSeed = fxrand() * 10000;
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	shaderSeed = fxrand() * 10000; // Initialize shader seed with fxhash

	randomSeed(mainRandomSeed);
	noiseSeed(mainNoiseSeed);
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
			if (currentFrame > 0) {
				mover.show(mainCanvas);
			}
		},
		moveItem: (mover, currentFrame) => {
			// Simple movement - no complex color calculations needed
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

	// Verify that swatch palettes are available (required for this project)
	if (!swatchesLoaded || !swatchPalette.isReady()) {
		throw new Error("CRITICAL: Swatch palettes are required but not available. Cannot proceed with palette selection.");
	}

	// Reset the random seed to ensure consistent state
	$fx.rand.reset();

	// Store the fxrand value we'll use for selection to ensure consistency
	const paletteSelectionRand = fxrand();

	// Use ONLY swatch palettes - no hardcoded fallback
	const swatchNames = swatchPalette.getSwatchNames();

	if (swatchNames.length === 0) {
		throw new Error("No swatch palettes available for selection");
	}

	// Sort swatch names alphabetically to ensure consistent order
	// across different environments regardless of loading timing
	const sortedSwatchNames = [...swatchNames].sort();

	// Select directly from sorted swatch palettes
	selectedPalette = Math.floor(paletteSelectionRand * sortedSwatchNames.length);
	currentPaletteName = sortedSwatchNames[selectedPalette];
	baseHSLPalette = swatchPalette.getPalette(currentPaletteName);

	if (!baseHSLPalette || baseHSLPalette.length === 0) {
		throw new Error(`Selected swatch palette '${currentPaletteName}' is empty or invalid`);
	}

	// No color variations needed - using swatches directly

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
	let padding = 0.05;
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

		// Use the swatch palette directly - no variations needed
		movers.push(new Mover(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, baseHSLPalette));
	}

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

// Helper function to safely evaluate uniform values
// This function converts string expressions in the effectsConfig.uniforms into actual values
// It handles:
// - Direct property references (e.g., 'amount' -> effect.amount)
// - Mathematical expressions (e.g., 'shaderSeed + 777.0' -> actual calculated value)
// - Special cases (e.g., '[width, height]' -> [width, height])
// - Global variable references (e.g., 'shaderTime' -> current shaderTime value)
function evaluateUniformValue(value, effect) {
	if (typeof value === "string") {
		// Handle special cases
		if (value === "[width, height]") {
			return [width, height];
		}

		// Handle expressions like 'shaderSeed + 777.0'
		if (value.includes("+") || value.includes("-") || value.includes("*") || value.includes("/")) {
			try {
				// Create a safe evaluation context with available variables
				const evalContext = {
					shaderTime,
					shaderSeed,
					width,
					height,
					...effect, // Include effect properties
				};

				// Replace variable names with their values
				let evalString = value;
				for (const [varName, varValue] of Object.entries(evalContext)) {
					if (typeof varValue === "number") {
						evalString = evalString.replace(new RegExp(`\\b${varName}\\b`, "g"), varValue);
					}
				}

				return eval(evalString);
			} catch (error) {
				console.warn(`Failed to evaluate uniform value "${value}":`, error);
				return 0;
			}
		}

		// Handle property references from the effect config
		if (value in effect) {
			return effect[value];
		}

		// Handle global variable references
		if (value === "shaderTime") return shaderTime;
		if (value === "shaderSeed") return shaderSeed;
		if (value === "width") return width;
		if (value === "height") return height;

		// Try to evaluate as a simple variable reference
		try {
			return eval(value);
		} catch (error) {
			console.warn(`Failed to evaluate uniform value "${value}":`, error);
			return 0;
		}
	}

	return value;
}

// Function to apply shader effects (call this in your render loop if needed)
// Now uses a modular approach that dynamically loops through effectsConfig
// Each effect's uniforms are automatically mapped based on the configuration
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

	// Iterate through effectsConfig to build passes
	for (const effectName in effectsConfig) {
		const effect = effectsConfig[effectName];
		if (effect.enabled) {
			shaderPipeline.addPass(effectName, () => {
				const uniforms = {};
				for (const uniformName in effect.uniforms) {
					const value = effect.uniforms[uniformName];
					uniforms[uniformName] = evaluateUniformValue(value, effect);
				}
				return uniforms;
			});
		}
	}

	// Run pipeline from compositeCanvas to the main WEBGL canvas (default p5 instance)
	shaderPipeline.run(compositeCanvas);
}

// Keyboard controls
// D/d: Toggle debug padding
// Console commands:
// - Press 'D' to toggle debug bounds (green=padding, red=movement)
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

	// Debug overlay removed - keeping only the deformation effect
	debugCanvas.pop();
}
