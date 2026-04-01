let features = "";
let movers = [];
let startTime;
let maxFrames = null; // null = unlimited, number = limited (e.g. 25)
let colorLoop = true; // when true, each mover cycles through the palette continuously
let colorYoyo = true; // when true, palette ping-pongs forward then backward
let colorLoopSpeed = 0.03; // cycle speed multiplier: 1 = default, 2 = twice as fast, 0.5 = half speed
let colorLoopSpeedOffset = 0.0; // random speed variance per particle: 0 = uniform, higher = more variation
let colorRandomStart = false; // when true, each particle begins at a random point in the palette cycle
let useFrameMode = true; // true = draw-loop style (all particles per frame); false = cycle rendering (original)
let elapsedTime = 0;
let particleNum = 50;
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
	"#4d9aff",
	"#579afb",
	"#6099f8",
	"#6899f4",
	"#6f99f0",
	"#7698ec",
	"#7c98e9",
	"#8298e5",
	"#8797e1",
	"#8c97de",
	"#9096da",
	"#9596d6",
	"#9996d3",
	"#9d96cf",
	"#a195cb",
	"#a595c8",
	"#a895c4",
	"#ac94c0",
	"#af94bd",
	"#b294b9",
	"#b593b6",
	"#b893b2",
	"#bb93ae",
	"#bd92ab",
	"#c092a7",
	"#c392a3",
	"#c591a0",
	"#c8919c",
	"#ca9199",
	"#cc9195",
	"#ce9091",
	"#d1908e",
	"#d3908a",
	"#d58f86",
	"#d78f83",
	"#d98f7f",
	"#db8f7b",
	"#dd8e78",
	"#de8e74",
	"#e08e70",
	"#e28d6d",
	"#e48d69",
	"#e58d65",
	"#e78d61",
	"#e98c5d",
	"#ea8c59",
	"#ec8c55",
	"#ed8c51",
	"#ef8b4d",
	"#f08b49",
	"#f28b45",
	"#f38a40",
	"#f58a3c",
	"#f68a37",
	"#f78a32",
	"#f9892d",
	"#fa8927",
	"#fb8920",
	"#fd8919",
	"#fe880f",
	"#ff8800",
	"#fe8600",
	"#fd8500",
	"#fc8300",
	"#fb8100",
	"#fa8000",
	"#fa7e00",
	"#f97c00",
	"#f87b00",
	"#f77900",
	"#f67700",
	"#f57600",
	"#f47400",
	"#f37200",
	"#f27100",
	"#f16f00",
	"#f06d00",
	"#ef6b00",
	"#ee6a00",
	"#ee6800",
	"#ed6600",
	"#ec6500",
	"#eb6300",
	"#ea6100",
	"#e95f00",
	"#e85d00",
	"#e75c00",
	"#e65a00",
	"#e55800",
	"#e45600",
	"#e35400",
	"#e25200",
	"#e15100",
	"#e04f00",
	"#df4d00",
	"#de4b00",
	"#dd4900",
	"#dd4700",
	"#dc4500",
	"#db4300",
	"#da4100",
	"#d93f00",
	"#d83c00",
	"#d73a00",
	"#d63800",
	"#d53600",
	"#d43300",
	"#d33100",
	"#d22e00",
	"#d12c00",
	"#d02900",
	"#cf2600",
	"#ce2300",
	"#cd2000",
	"#cc1c00",
	"#cb1800",
	"#ca1400",
	"#c90e00",
	"#c80700",
	"#c70000",
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
	ARTWORK_RATIO = 1.6;
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
	let bgCol = color(complementaryHue, 100, 60);
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
