// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

// Shader effects toggle
const ENABLE_SHADERS = true;

// UI toggles
const SHOW_FPS_UI = false; // FPS overlay + FPS toggle button
const SHOW_DOWNLOAD_UI = false; // Download button (mounted in panel)

// Padding constants - centralized for consistency
const BASE_PADDING = 0.2; // Base padding for artwork bounds (used in INIT)
const WRAP_PADDING_FACTOR = 0.04; // Wrap padding factor for particle movement bounds (used in Mover class)

// Animation configuration
let maxFrames = 30;
let particleNum = 500000;
let cycle = computeCycle(maxFrames, particleNum);

function computeCycle(frames, population) {
	return parseInt((frames * population) / 1150);
}

// Debug flags
let debugBounds = false;

// ============================================================================
// ARTWORK DIMENSIONS & SCALING
// ============================================================================

// Base artwork dimensions (width: 1000, height: 1000 * 1.25)
const ARTWORK_RATIO = 1.25;
const BASE_WIDTH = 1000;
const BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;
const DEFAULT_SIZE = max(BASE_WIDTH, BASE_HEIGHT);

// Calculated dimensions (set in setup())
let DIM; // Canvas dimension (min of window width/height)
let MULTIPLIER; // Scaling factor based on screen size
let W = window.innerWidth; // Window width
let H = window.innerHeight; // Window height

// ============================================================================
// CANVAS & RENDERING
// ============================================================================

let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects
let pixel_density; // Calculated in setup() after windowWidth/Height are available

// ============================================================================
// ANIMATION STATE
// ============================================================================

let features = "";
let movers = [];
let startTime;
let elapsedTime = 0;
let executionTimer = new ExecutionTimer();
let generator; // Animation generator instance
let animationFrameId = null; // requestAnimationFrame handle for customDraw loop

// ============================================================================
// PALETTE SYSTEM
// ============================================================================

let swatchPalette;
let swatchesLoaded = false;
let selectedPalette; // Will store the randomly selected palette
let baseHSLPalette; // Keep for backward compatibility
let currentPaletteName = ""; // Store the name of the current palette for debug

// ============================================================================
// PARTICLE/MOVER PARAMETERS
// ============================================================================

// Noise and movement parameters
let scl1, scl2, scl3, ang1, ang2;
let rseed, nseed; // Random and noise seeds

// Particle bounds
let xMin, xMax, yMin, yMax;
let isBordered = true;

// Re-applied on UI Apply so the composition doesn't shift
const FRAME_SCALE_FACTOR_X = 1.47;
const FRAME_SCALE_FACTOR_Y = 1.47;

function preload() {
	// Initialize shader effects (will load all shaders) - optional
	if (shadersEnabled()) {
		shaderEffects.preload(this);
	}

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
	// Set pixel density for all devices
	//! when using shaders, higher than 4-5 causes dead space when exporting pngs
	pixel_density = CURRENT_PARAMS.printDPI ?? (typeof isSafariMobile === "function" && isSafariMobile() ? 1 : 2);

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork (will also handle debug overlays)
	mainCanvas = createGraphics(DIM / ARTWORK_RATIO, DIM);

	// Try to create shader canvas for the WEBGL renderer (or regular canvas if no shaders)
	if (shadersEnabled()) {
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

	// Lock seeds on first run so Apply doesn't change the underlying randomness
	if (window.PARAMS_UI && !window.PARAMS_UI.lockedSeeds) {
		window.PARAMS_UI.lockedSeeds = {
			mainRandomSeed,
			mainNoiseSeed,
			rseed,
			nseed,
		};
	}

	randomSeed(mainRandomSeed);
	noiseSeed(mainNoiseSeed);

	canvasSetup();

	// Initialize from UI resolved values
	maxFrames = CURRENT_PARAMS.exposure ?? maxFrames;
	particleNum = CURRENT_PARAMS.population ?? particleNum;
	cycle = computeCycle(maxFrames, particleNum);

	INIT(rseed, nseed);

	// Inform UI about available swatches + selected palette (after INIT chooses it)
	try {
		const swatchNames = swatchPalette.getSwatchNames();
		const sortedSwatchNames = [...swatchNames].sort();
		window.dispatchEvent(
			new CustomEvent("swatches:ready", {
				detail: {
					names: sortedSwatchNames,
					selected: currentPaletteName,
				},
			}),
		);
	} catch {
		// ignore (UI will fall back gracefully)
	}

	// Calculate the center offset based on scale

	startAnimation();

	if (CURRENT_PARAMS.showExternalFrame !== false) {
		renderOutsideFrame();
	}
	// Start the custom draw loop
	customDraw();

	// Initialize debug overlay after setup is complete
	updateDebugOverlay();

	// Setup UI controls (if present)
	setupControls();

	// Log available controls and performance settings
	console.log("Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)");
	if (shadersEnabled() && shaderCanvas) {
		console.log(`Shader performance: Frame rate limited to ${shaderEffects.getFrameRate()}fps to match p5.js draw speed`);
		console.log(`Use shaderEffects.setFrameRate(fps) to adjust the frame rate to match your p5.js settings`);
	} else {
		console.log("Running without shader effects");
	}
}

function canvasSetup() {
	try {
		mainCanvas?.resetMatrix?.();
	} catch {
		// ignore
	}
	mainCanvas.translate(width / 2, height / 2);
	mainCanvas.scale(FRAME_SCALE_FACTOR_X, FRAME_SCALE_FACTOR_Y);
	mainCanvas.translate(-width / 2, -height / 2); // Move back to maintain center
}

function flushGraphicsStyleCache(g) {
	// Some drawing code (e.g. `Mover.show`) writes directly to `g.drawingContext`,
	// which can desync p5's internal style cache from the canvas context.
	// Bust the cache by forcing a different fill once so the next `g.fill(...)`
	// definitely re-applies `drawingContext.fillStyle`.
	if (!g?.fill || !g?.colorMode) return;
	try {
		g.push();
		g.colorMode(RGB, 255, 255, 255, 255);
		g.fill(255, 0, 255, 255); // unlikely to match any intended fill
		g.noStroke();
		// No need to draw; we just want p5 to update its internal fill state.
		g.pop();
	} catch {
		// ignore
	}
}

function renderOutsideFrame() {
	mainCanvas.colorMode(HSL, 360, 100, 100, 100);
	let firstParticleColor = baseHSLPalette[baseHSLPalette.length - 1];
	let lastParticleColor = baseHSLPalette[2];
	let s_hue = lastParticleColor.h;
	let s_sat = lastParticleColor.s;
	let s_bri = lastParticleColor.l;
	let s_alpha = 1;
	let compHue = lastParticleColor.h;
	console.log(firstParticleColor);

	mainCanvas.rectMode(CENTER);
	mainCanvas.noFill();
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	const baseRectW = mainCanvas.width * (1 - BASE_PADDING * 2);
	const baseRectH = mainCanvas.height * (1 - BASE_PADDING * 2);
	const rectShrink = baseRectW / 35;
	for (let i = 0; i < 10000; i++) {
		let randShrink = fxrand() * rectShrink;
		let rectW = baseRectW + randShrink;
		let rectH = baseRectH + randShrink;
		mainCanvas.strokeWeight(map(randShrink, 0, rectShrink / 1.5, 2, 0.1, true));
		s_alpha = map(randShrink, rectShrink, rectShrink / 1.25, 100, 100, true);
		s_sat = map(randShrink, rectShrink, 0, 30, 100, true);
		s_bri = map(randShrink, rectShrink / 1.5, -rectShrink / 1.5, 20, 1, true);

		mainCanvas.stroke(s_hue, s_sat, s_bri, s_alpha);
		mainCanvas.rect(mainCanvas.width / 2, mainCanvas.height / 2, rectW, rectH);
	}

	compHue = (firstParticleColor.h + 180) % 360;
	mainCanvas.fill(compHue, 4, 100, 100);
	mainCanvas.noStroke();

	mainCanvas.rect(mainCanvas.width / 2, mainCanvas.height / 2, baseRectW, baseRectH);
}

function startAnimation() {
	// Notify UI that a render is starting (panel spinner, status text, etc.)
	try {
		window.dispatchEvent(new CustomEvent("render:started"));
	} catch {
		// ignore
	}

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
			// Simple movement - no complex color calculations needed
			mover.move(currentFrame, maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			if (shadersEnabled() && shaderCanvas) {
				shaderEffects.setParticleAnimationComplete(true);
			}
			$fx.preview();
			document.complete = true;

			// Notify UI that render is complete
			try {
				window.dispatchEvent(new CustomEvent("render:completed"));
			} catch {
				// ignore
			}

			// Create download button after sketch is complete
			if (SHOW_DOWNLOAD_UI && typeof createDownloadButton === "function") {
				createDownloadButton();
			}
		},
	};

	// Create and start the animation
	generator = createAnimationGenerator(animConfig);
}

function INIT(rseed, nseed) {
	movers = [];

	// Verify that swatch palettes are available (required for this project)
	if (!swatchesLoaded || !swatchPalette.isReady()) {
		throw new Error("CRITICAL: Swatch palettes are required but not available. Cannot proceed with palette selection.");
	}

	// Reset the random seed to ensure consistent state
	$fx.rand.reset();

	// Use ONLY swatch palettes - no hardcoded fallback
	const swatchNames = swatchPalette.getSwatchNames();

	if (swatchNames.length === 0) {
		throw new Error("No swatch palettes available for selection");
	}

	// Sort swatch names alphabetically to ensure consistent order
	// across different environments regardless of loading timing
	const sortedSwatchNames = [...swatchNames].sort();

	// Allow UI to force palette selection by name (stable), otherwise default to deterministic selection
	const forcedPaletteName = CURRENT_PARAMS.paletteName;
	if (forcedPaletteName && sortedSwatchNames.includes(forcedPaletteName)) {
		currentPaletteName = forcedPaletteName;
		selectedPalette = sortedSwatchNames.indexOf(forcedPaletteName);
	} else {
		// Store the fxrand value we'll use for selection to ensure consistency
		const paletteSelectionRand = fxrand();
		selectedPalette = Math.floor(paletteSelectionRand * sortedSwatchNames.length);
		currentPaletteName = sortedSwatchNames[selectedPalette];
		if (window.PARAMS_UI?.current) {
			window.PARAMS_UI.current.paletteName = currentPaletteName;
			if (typeof window.resolveParams === "function") window.resolveParams();
		}
	}

	baseHSLPalette = swatchPalette.getPalette(currentPaletteName);

	if (!baseHSLPalette || baseHSLPalette.length === 0) {
		throw new Error(`Selected swatch palette '${currentPaletteName}' is empty or invalid`);
	}

	// Scale noise values based on MULTIPLIER
	scl1 = 0.003 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.003 / MULTIPLIER;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;

	let amplitude1 = 1 * MULTIPLIER;
	let amplitude2 = 1 * MULTIPLIER;

	// Simple 10% padding calculation with artwork ratio - use constant
	xMin = BASE_PADDING;
	xMax = 1 - BASE_PADDING;
	yMin = BASE_PADDING;
	yMax = 1 - BASE_PADDING;

	// Scale number of particles based on canvas size
	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		// Use the swatch palette directly - no variations needed
		movers.push(new Mover(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, baseHSLPalette));
	}

	let bgCol = color(random(0, 35), 5, 100);
	mainCanvas.background(bgCol);

	//initGrid(50);
}

// ============================================================================
// UI APPLY HOOK (minimal surface)
// ============================================================================

window.applyGenerativeSettings = async function applyGenerativeSettings(settings) {
	if (!settings) return;

	// Lock seeds if not already locked
	const locked = window.PARAMS_UI?.lockedSeeds;
	if (!locked) return;

	// Merge incoming settings into current, then resolve to numeric values
	if (window.PARAMS_UI?.current) {
		window.PARAMS_UI.current = {...window.PARAMS_UI.current, ...settings};
	}
	if (typeof window.resolveParams === "function") window.resolveParams();

	// Update runtime parameters from resolved values
	maxFrames = CURRENT_PARAMS.exposure ?? maxFrames;
	particleNum = CURRENT_PARAMS.population ?? particleNum;
	cycle = computeCycle(maxFrames, particleNum);

	// Print DPI -> pixel density
	if (typeof CURRENT_PARAMS.printDPI === "number") {
		pixel_density = CURRENT_PARAMS.printDPI;
		try {
			pixelDensity(pixel_density);
			mainCanvas?.pixelDensity(pixel_density);
			if (shaderCanvas?.pixelDensity) shaderCanvas.pixelDensity(pixel_density);
		} catch {
			// ignore
		}
	}

	// Reset seeds (deterministic re-init)
	randomSeed(locked.mainRandomSeed);
	noiseSeed(locked.mainNoiseSeed);
	rseed = locked.rseed;
	nseed = locked.nseed;

	// Stop any in-flight animation loop before starting a new one
	if (animationFrameId !== null) {
		try {
			cancelAnimationFrame(animationFrameId);
		} catch {
			// ignore
		}
		animationFrameId = null;
	}

	// Allow reruns after the sketch has completed
	document.complete = false;
	if (shadersEnabled() && shaderCanvas) {
		shaderEffects.setParticleAnimationComplete(false);
	}
	// Clear and re-init movers and generator
	mainCanvas?.clear();
	canvasSetup();
	flushGraphicsStyleCache(mainCanvas);

	// Rebuild movers with current palette/params
	INIT(rseed, nseed);

	// Re-apply the frame layer *after* INIT sets background and palette
	if (CURRENT_PARAMS.showExternalFrame !== false) {
		renderOutsideFrame();
	}

	startAnimation();
	// Restart the render loop (it stops once generator completes)
	customDraw();
};

//! CUSTOM UTILITIES FUNCTIONS ==========================================

// Helper function to check if shaders are enabled and available
function shadersEnabled() {
	return ENABLE_SHADERS && typeof shaderEffects !== "undefined";
}

// Custom draw loop - advances sketch animation and applies shader effects
function customDraw() {
	if (!generator) return;

	const result = generator.next();

	// Render shader effects for this frame (if shaders are enabled)
	if (shadersEnabled() && shaderCanvas) {
		const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);

		// Continue animation if not complete
		if (shouldContinue) {
			animationFrameId = requestAnimationFrame(customDraw);
		}
	} else {
		// No shaders - just copy mainCanvas to main display canvas
		clear();
		image(mainCanvas, 0, 0);

		// If FPS overlay is available, update/draw it even without shaders
		if (shadersEnabled()) {
			shaderEffects.updateFPS();
			shaderEffects.drawFPS();
		}

		// Continue animation if not complete
		if (!result.done) {
			animationFrameId = requestAnimationFrame(customDraw);
		}
	}
}

function setFpsButtonState(toggleFpsButton) {
	if (!toggleFpsButton || !SHOW_FPS_UI || !shadersEnabled()) return;
	if (shaderEffects.showFPS) {
		toggleFpsButton.classList.add("active");
		toggleFpsButton.textContent = "FPS: ON";
	} else {
		toggleFpsButton.classList.remove("active");
		toggleFpsButton.textContent = "FPS: OFF";
	}
}

function toggleFps(from = "unknown") {
	if (!SHOW_FPS_UI) return;
	if (!shadersEnabled()) return;
	// Don't allow FPS toggle if in iframe
	if (typeof isInIframe === "function" && isInIframe()) return;

	shaderEffects.toggleFPS();
	setFpsButtonState(document.getElementById("toggle-fps"));
	console.log(`FPS counter toggled (${from}): `, shaderEffects.showFPS);
}

// Setup UI controls (optional; markup may not exist)
function setupControls() {
	const controlsContainer = document.getElementById("controls");
	if (!controlsContainer) return;

	// Hide entire controls container if in iframe
	if (typeof isInIframe === "function" && isInIframe()) {
		controlsContainer.style.display = "none";
		return;
	}

	// If UI is fully disabled, hide controls container early
	if (!SHOW_FPS_UI && !SHOW_DOWNLOAD_UI) {
		controlsContainer.style.display = "none";
		return;
	}

	const toggleFpsButton = document.getElementById("toggle-fps");
	if (!toggleFpsButton) return;
	if (!SHOW_FPS_UI) {
		toggleFpsButton.style.display = "none";
		return;
	}

	toggleFpsButton.addEventListener("click", function () {
		toggleFps("button");
	});

	// Set initial button state
	setFpsButtonState(toggleFpsButton);
}
// Key controls for debugging and performance monitoring
function keyPressed() {
	if (key === "D" || key === "d") {
		debugBounds = !debugBounds;
		console.log("Debug bounds toggled: ", debugBounds);
		updateDebugOverlay();
	}

	if (key === "F" || key === "f") {
		toggleFps("keyboard");
	}

	if (key === "G" || key === "g") {
		if (shadersEnabled()) {
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

	// Base artwork padding - use the actual constant value
	const basePaddingLeft = BASE_PADDING * canvasWidth;
	const basePaddingTop = BASE_PADDING * canvasHeight;
	const basePaddingWidth = (1 - 2 * BASE_PADDING) * canvasWidth;
	const basePaddingHeight = (1 - 2 * BASE_PADDING) * canvasHeight;

	basePadding.style.left = basePaddingLeft + "px";
	basePadding.style.top = basePaddingTop + "px";
	basePadding.style.width = basePaddingWidth + "px";
	basePadding.style.height = basePaddingHeight + "px";

	// Mover bounds (if movers exist) - read actual values from mover instance
	if (movers.length > 0) {
		const m = movers[0];
		// Use the actual wrapPadding values from the mover instance
		// Convert from normalized coordinates (0-1) to pixel coordinates
		const moverLeft = m.minBoundX;
		const moverTop = m.minBoundY;
		const moverWidth = m.maxBoundX - m.minBoundX;
		const moverHeight = m.maxBoundY - m.minBoundY;

		moverBounds.style.left = moverLeft + "px";
		moverBounds.style.top = moverTop + "px";
		moverBounds.style.width = moverWidth + "px";
		moverBounds.style.height = moverHeight + "px";
	}
}
