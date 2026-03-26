let features = "";
let movers = [];
let startTime;
let maxFrames = null; // null = unlimited, number = limited (e.g. 25)
let colorLoop = true; // when true, each mover cycles through the palette continuously
let colorYoyo = true; // when true, palette ping-pongs forward then backward
let colorLoopSpeed = 0.03; // cycle speed multiplier: 1 = default, 2 = twice as fast, 0.5 = half speed
let colorLoopSpeedOffset = 0.000001; // random speed variance per particle: 0 = uniform, higher = more variation
let colorRandomStart = false; // when true, each particle begins at a random point in the palette cycle
let useFrameMode = true; // true = draw-loop style (all particles per frame); false = cycle rendering (original)
let elapsedTime = 0;
let particleNum = 12150;
let executionTimer = new ExecutionTimer(); // Replace executionStartTime with timer instance
let generator; // Animation generator instance

// Swatch palette system
let swatchPalette;
let swatchesLoaded = false;

// Canvas references
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects

// Shader effects are now managed by shaderEffects module (loaded from shaders/sketch-shaders.js)
// To configure shaders, modify the effectsConfig in shaders/sketch-shaders.js
let debugBounds = false;

// CSS overlay debug bounds functions
function updateDebugOverlay() {
	const debugOverlay = document.getElementById("debug-bounds");
	const basePadding = document.getElementById("debug-base-padding");
	const moverBounds = document.getElementById("debug-mover-bounds");

	if (!debugBounds) {
		debugOverlay.classList.remove("visible");
		return;
	}

	debugOverlay.classList.add("visible");

	// Get canvas position and dimensions
	const canvas = document.querySelector("canvas");
	if (!canvas) return;

	const canvasRect = canvas.getBoundingClientRect();
	const canvasWidth = canvasRect.width;
	const canvasHeight = canvasRect.height;

	// Position the debug overlay to match the canvas
	debugOverlay.style.left = canvasRect.left + "px";
	debugOverlay.style.top = canvasRect.top + "px";
	debugOverlay.style.width = canvasWidth + "px";
	debugOverlay.style.height = canvasHeight + "px";

	// Base artwork padding (0.1 padding)
	const padding = 0.1;
	const basePaddingLeft = padding * canvasWidth;
	const basePaddingTop = padding * canvasHeight;
	const basePaddingWidth = (1 - 2 * padding) * canvasWidth;
	const basePaddingHeight = (1 - 2 * padding) * canvasHeight;

	basePadding.style.left = basePaddingLeft + "px";
	basePadding.style.top = basePaddingTop + "px";
	basePadding.style.width = basePaddingWidth + "px";
	basePadding.style.height = basePaddingHeight + "px";

	// Mover bounds (if movers exist)
	if (movers.length > 0) {
		const m = movers[0];
		const wrapPaddingX = (min(DIM, DIM * ARTWORK_RATIO) * 0.05) / DIM;
		const wrapPaddingY = ((min(DIM, DIM * ARTWORK_RATIO) * 0.05) / (DIM * ARTWORK_RATIO)) * ARTWORK_RATIO;

		const moverLeft = (m.xMin - wrapPaddingX) * canvasWidth;
		const moverTop = (m.yMin - wrapPaddingY) * canvasHeight;
		const moverWidth = (m.xMax + wrapPaddingX - (m.xMin - wrapPaddingX)) * canvasWidth;
		const moverHeight = (m.yMax + wrapPaddingY - (m.yMin - wrapPaddingY)) * canvasHeight;

		moverBounds.style.left = moverLeft + "px";
		moverBounds.style.top = moverTop + "px";
		moverBounds.style.width = moverWidth + "px";
		moverBounds.style.height = moverHeight + "px";
	}
}

// Global color mapping optimization
// Simplified color management - no more complex calculations needed

// Color palette — hex array used directly (no image swatches)
const HEX_PALETTE = [
	"#ffff8a",
	"#fffb86",
	"#fff882",
	"#fff47f",
	"#fff07d",
	"#ffec7a",
	"#ffe879",
	"#ffe377",
	"#ffdf77",
	"#ffdb77",
	"#ffd777",
	"#ffd278",
	"#ffce79",
	"#ffc97b",
	"#ffc57d",
	"#ffc07f",
	"#ffbc82",
	"#ffb785",
	"#ffb389",
	"#ffaf8d",
	"#ffaa91",
	"#ffa695",
	"#ffa29a",
	"#ff9e9f",
	"#ff9aa4",
	"#ff97a9",
	"#ff94af",
	"#ff91b5",
	"#ff8eba",
	"#ff8cc0",
	"#ff8ac6",
	"#ff88cc",
	"#ff87d2",
	"#ff86d8",
	"#ff85de",
	"#ff85e4",
	"#ff85ea",
	"#ff85f0",
	"#ff86f6",
	"#ff87fb",
	"#fe88ff",
	"#fc88ff",
	"#fa88ff",
	"#f888ff",
	"#f788ff",
	"#f588ff",
	"#f389ff",
	"#f189ff",
	"#ef89ff",
	"#ed89ff",
	"#eb89ff",
	"#e989ff",
	"#e789ff",
	"#e589ff",
	"#e289ff",
	"#e089ff",
	"#de89ff",
	"#dc89ff",
	"#da89ff",
	"#d889ff",
	"#d68aff",
	"#d48aff",
	"#d28aff",
	"#d08aff",
	"#ce8aff",
	"#cc8aff",
	"#ca8aff",
	"#c88aff",
	"#c58aff",
	"#c38aff",
	"#c18aff",
	"#bf8aff",
	"#bd8aff",
	"#bb8aff",
	"#b98aff",
	"#b68aff",
	"#b48aff",
	"#b28aff",
	"#b08aff",
	"#ae8aff",
	"#aa87fc",
	"#a583f7",
	"#a17ff2",
	"#9c7aed",
	"#9776e9",
	"#9372e4",
	"#8e6edf",
	"#896adb",
	"#8565d6",
	"#8061d1",
	"#7c5dcd",
	"#7759c8",
	"#7255c3",
	"#6e51bf",
	"#694dba",
	"#6549b6",
	"#6045b1",
	"#5c41ad",
	"#573ea8",
	"#523aa4",
	"#4e369f",
	"#49329b",
	"#452e96",
	"#402b92",
	"#3b278d",
	"#362389",
	"#311f85",
	"#2c1c80",
	"#27187c",
	"#211478",
	"#1b1074",
	"#140d6f",
	"#0c096b",
	"#020567",
	"#000263",
	"#00005f",
	"#00005b",
	"#000057",
	"#000053",
	"#000000",
];

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

let selectedPalette; // Will store the randomly selected palette
let baseHSLPalette; // Keep for backward compatibility
let currentPaletteName = ""; // Store the name of the current palette for debug

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

// Base artwork dimensions - aspect ratio matches viewport
let ARTWORK_RATIO; // Set in setup() to windowWidth / windowHeight
let BASE_WIDTH = 1000;
let BASE_HEIGHT; // Set in setup() from viewport aspect

// This is our reference size for scaling (set in setup after ARTWORK_RATIO is known)
let DEFAULT_SIZE;

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

// Dynamic pixel density will be calculated in setup() after windowWidth/Height are available
let pixel_density;

function preload() {
	// Initialize shader effects (will load all shaders) - optional
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.preload(this);
	}
}

async function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// Reset the random seed to ensure consistency
	$fx.rand.reset();

	// Using direct hex palette — no image swatches needed
	swatchesLoaded = true;

	// Calculate optimal pixel density before creating canvases
	// Set pixel density for all devices
	//! when using shaders, higher than 4-5 causes dead space when exporting pngs
	pixel_density = typeof isSafariMobile === "function" && isSafariMobile() ? 1 : 2;

	// Canvas setup - match viewport aspect ratio
	ARTWORK_RATIO = 1.0;
	//ARTWORK_RATIO = windowWidth / windowHeight;
	BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;
	DEFAULT_SIZE = min(BASE_WIDTH, BASE_HEIGHT);
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);
	// Create main canvas for the artwork (same aspect as viewport)
	//mainCanvas = createGraphics(windowWidth, windowHeight);
	mainCanvas = createGraphics(DIM / ARTWORK_RATIO, DIM);

	// Try to create shader canvas for the WEBGL renderer (or regular canvas if no shaders)
	if (typeof shaderEffects !== "undefined") {
		try {
			shaderCanvas = createCanvas(DIM / ARTWORK_RATIO, DIM, WEBGL);
			// Initialize shader effects system
			shaderEffects.setup(width, height, mainCanvas, shaderCanvas);
			// Set up shader canvas pixel density
			shaderCanvas.pixelDensity(pixel_density);
			console.log("Shader effects initialized successfully");
		} catch (error) {
			console.warn("Failed to initialize shader effects:", error);
			console.log("Falling back to sketch without shaders");
			// Fallback: create regular canvas without shaders
			shaderCanvas = null;
			createCanvas(DIM / ARTWORK_RATIO, DIM);
			pixelDensity(pixel_density);
			// Shaders are unavailable; continue without them
		}
	} else {
		// No shaders - create regular canvas for display
		createCanvas(DIM / ARTWORK_RATIO, DIM);
		pixelDensity(pixel_density);
	}

	// Set up the main canvas rendering properties
	mainCanvas.pixelDensity(pixel_density);

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

	randomSeed(mainRandomSeed);
	noiseSeed(mainNoiseSeed);
	let scaleFactorX = 1.24;
	let scaleFactorY = 1.24;
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
		frameMode: useFrameMode,
		currentFrame: 0, // Add current frame tracking
		renderItem: (mover, currentFrame) => {
			if (currentFrame > -1) {
				mover.show(mainCanvas);
			}
		},
		moveItem: (mover, currentFrame) => {
			// Simple movement - no complex color calculations needed
			mover.move(currentFrame, maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			if (typeof shaderEffects !== "undefined" && shaderCanvas) {
				shaderEffects.setParticleAnimationComplete(true);
			}
			$fx.preview();
			document.complete = true;

			// Create download button after sketch is complete
			if (typeof createDownloadButton === "function") {
				createDownloadButton();
			}
		},
	};

	// Create and start the animation
	generator = createAnimationGenerator(animConfig);

	// Create download button immediately (will only show if not in iframe)
	if (typeof createDownloadButton === "function") {
		createDownloadButton();
	}

	// Start the custom draw loop
	customDraw();

	// Initialize debug overlay after setup is complete
	updateDebugOverlay();

	// Setup mobile controls
	setupMobileControls();

	// Log available controls and performance settings
	console.log("Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)");
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		console.log(`Shader performance: Frame rate limited to ${shaderEffects.getFrameRate()}fps to match p5.js draw speed`);
		console.log(`Use shaderEffects.setFrameRate(fps) to adjust the frame rate to match your p5.js settings`);
	} else {
		console.log("Running without shader effects");
	}
}

// Setup mobile touch controls
function setupMobileControls() {
	const toggleFpsButton = document.getElementById("toggle-fps");
	if (toggleFpsButton) {
		toggleFpsButton.addEventListener("click", function () {
			if (typeof shaderEffects !== "undefined") {
				shaderEffects.toggleFPS();
				// Update button visual state
				if (shaderEffects.showFPS) {
					toggleFpsButton.classList.add("active");
					toggleFpsButton.textContent = "FPS: ON";
				} else {
					toggleFpsButton.classList.remove("active");
					toggleFpsButton.textContent = "FPS: OFF";
				}
				console.log("FPS counter toggled: ", shaderEffects.showFPS);
			}
		});

		// Set initial button state
		if (typeof shaderEffects !== "undefined") {
			if (shaderEffects.showFPS) {
				toggleFpsButton.classList.add("active");
				toggleFpsButton.textContent = "FPS: ON";
			} else {
				toggleFpsButton.textContent = "FPS: OFF";
			}
		}
	}
}

// Custom draw loop - advances sketch animation and applies shader effects
function customDraw() {
	const result = generator.next();

	// Render shader effects for this frame (if shaders are enabled)
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);

		// Continue animation if not complete
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		// No shaders - just copy mainCanvas to main display canvas
		clear();
		image(mainCanvas, 0, 0);

		// If FPS overlay is available, update/draw it even without shaders
		if (typeof shaderEffects !== "undefined") {
			shaderEffects.updateFPS();
			shaderEffects.drawFPS();
		}

		// Continue animation if not complete
		if (!result.done) {
			requestAnimationFrame(customDraw);
		}
	}
}

function INIT(rseed, nseed) {
	movers = [];

	// Build HSL palette directly from hex array
	baseHSLPalette = HEX_PALETTE.map(hexToHsl);
	currentPaletteName = "hex_palette";

	// Scale noise values based on MULTIPLIER
	scl1 = 0.001 / MULTIPLIER;
	scl2 = 0.001 / MULTIPLIER;
	scl3 = 0.001 / MULTIPLIER;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;

	let amplitude1 = 1 * MULTIPLIER;
	let amplitude2 = 1 * MULTIPLIER;

	// Simple 10% padding calculation with artwork rzatio
	let padding = 0.1;
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
		movers.push(
			new Mover(
				x,
				y,
				scl1,
				scl2,
				scl3,
				sclOffset1,
				sclOffset2,
				sclOffset3,
				amplitude1,
				amplitude2,
				xMin,
				xMax,
				yMin,
				yMax,
				isBordered,
				rseed,
				nseed,
				colorLoop,
				colorYoyo,
				colorLoopSpeed,
				colorLoopSpeedOffset,
				colorRandomStart,
				baseHSLPalette,
			),
		);
	}

	const middleIndex = Math.floor(baseHSLPalette.length / 2);
	const middleColor = baseHSLPalette[middleIndex];
	const complementaryHue = (middleColor.h + 180) % 360;
	let bgCol = color(complementaryHue, 0, 100);
	mainCanvas.background(bgCol);

	//initGrid(50);
}

// Key controls for debugging and performance monitoring
function keyPressed() {
	if (key === "D" || key === "d") {
		debugBounds = !debugBounds;
		console.log("Debug bounds toggled: ", debugBounds);
		updateDebugOverlay();
	}

	if (key === "F" || key === "f") {
		if (typeof shaderEffects !== "undefined") {
			shaderEffects.toggleFPS();
			console.log("FPS counter toggled: ", shaderEffects.showFPS);
		}
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
		//toggle controls
		const controls = document.getElementById("controls");
		controls.classList.toggle("hide");
	}
}
