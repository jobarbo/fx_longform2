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

// Shader animation control
let continueShadersAfterCompletion = false; // Set to false to stop shaders when sketch is done
let applyShadersDuringSketch = false; // Set to true to apply shaders while sketching, false to wait until complete

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
		timeMultiplier: 0.0, // Normal speed
		uniforms: {
			uTime: "shaderTime * timeMultiplier",
			uSeed: "shaderSeed",
			uAmount: "amount",
		},
	},

	collage: {
		enabled: false,
		amount: 1.0,
		tileSize: 255.0,
		tileSize2: 50.0,
		tileSize3: 100.0,
		sizeNoise: 23.0,
		rotNoise: 24.0,
		timeMultiplier: 0.0, // Slower speed
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

	chromatic: {
		enabled: true,
		amount: 0.0015,
		timeMultiplier: 0.0, // Faster speed
		uniforms: {
			uTime: "shaderTime * timeMultiplier",
			uSeed: "shaderSeed + 777.0",
			uAmount: "amount",
		},
	},

	grain: {
		enabled: true,
		amount: 0.1,
		timeMultiplier: 0.0, // Very slow speed
		uniforms: {
			uTime: "shaderTime * timeMultiplier",
			uSeed: "shaderSeed + 345.0",
			uAmount: "amount",
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
		// Reinitialize shader pipeline with updated enabled effects
		reinitializeShaderPipeline();
	}
}

// Function to reinitialize shader pipeline when effects are toggled
function reinitializeShaderPipeline() {
	if (shaderPipeline && shaderManager) {
		const enabledEffects = Object.keys(effectsConfig).filter((name) => effectsConfig[name].enabled);
		shaderPipeline.init(width, height, enabledEffects);
	}
}

// Helper function to update effect parameters
function updateEffectParam(effectName, paramName, value) {
	if (effectsConfig[effectName] && effectsConfig[effectName][paramName] !== undefined) {
		effectsConfig[effectName][paramName] = value;
	}
}

// Helper function to control shader continuation after sketch completion

// Helper function to check current shader continuation setting
function getShadersContinueAfterCompletion() {
	return continueShadersAfterCompletion;
}

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
	// Safari mobile fallback - set to 1 for better performance
	if (isSafariMobile()) {
		pixel_density = 2;
		console.log("Safari mobile detected, using pixel density 1");
	} else {
		pixel_density = 2;
	}

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork (will also handle debug overlays)
	mainCanvas = createGraphics(DIM, DIM * ARTWORK_RATIO);
	// Create shader canvas for the WEBGL renderer
	shaderCanvas = createCanvas(DIM, DIM * ARTWORK_RATIO, WEBGL);

	// Init shader pipeline with enabled effects
	const enabledEffects = Object.keys(effectsConfig).filter((name) => effectsConfig[name].enabled);
	shaderPipeline = new ShaderPipeline(shaderManager, this).init(width, height, enabledEffects);

	// Set up the rendering properties
	mainCanvas.pixelDensity(pixel_density);
	shaderCanvas.pixelDensity(pixel_density);

	// Set color modes and ensure proper color preservation
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	colorMode(HSB, 360, 100, 100, 100);

	// Enable color preservation settings for mainCanvas
	mainCanvas.drawingContext.imageSmoothingEnabled = false;
	mainCanvas.drawingContext.globalCompositeOperation = "source-over";

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

			// Create download button after sketch is complete
			if (typeof createDownloadButton === "function") {
				createDownloadButton();
			}
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(animConfig);

	// Create download button immediately (will only show if not in iframe)
	if (typeof createDownloadButton === "function") {
		createDownloadButton();
	}

	// Custom animation loop that handles shaders properly
	function customAnimate() {
		const result = generator.next();

		// If particle animation is done, check if we should continue shaders
		if (result.done) {
			// Always apply shaders at least once when sketch is complete
			if (!applyShadersDuringSketch) {
				applyShaderEffect();
			}

			if (continueShadersAfterCompletion) {
				// Keep shaders running even after particles are complete
				shaderTime += 0.01;
				applyShaderEffect();
				requestAnimationFrame(customAnimate);
			} else {
				// Stop everything when sketch is complete
				console.log("Sketch complete - shaders stopped");
			}
			return;
		}

		// Update shader time during sketching
		shaderTime += 0.01;

		// Only apply shaders during sketching if enabled
		if (applyShadersDuringSketch) {
			applyShaderEffect();
		} else {
			// If not applying shaders during sketching, use copy shader to display base sketch
			clear();
			shaderManager.apply("copy", {uTexture: mainCanvas}, this).drawFullscreenQuad(this);
		}

		// Continue animation
		requestAnimationFrame(customAnimate);
	}

	// Start the custom animation loop
	customAnimate();

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
	if (!mainCanvas) {
		return;
	}

	// Clear the shader canvas
	clear();

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

	// Run pipeline from mainCanvas to the main WEBGL canvas (default p5 instance)
	shaderPipeline.run(mainCanvas);
}
