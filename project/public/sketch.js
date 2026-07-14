// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

// Shader effects toggle
const ENABLE_SHADERS = true;

// UI toggles
const SHOW_FPS_UI = false; // FPS overlay + FPS toggle button
const SHOW_DOWNLOAD_UI = false; // Download button (mounted in panel)

// Padding constants - centralized for consistency
const BASE_PADDING = 0.155; // Base padding for artwork bounds (used in INIT)
const WRAP_PADDING_FACTOR = 0.04; // Wrap padding factor for particle movement bounds (used in Mover class)
// Animation configuration
let maxFrames = 30;
let particleNum = 500000;
let cycle = computeCycle(maxFrames, particleNum);

function computeCycle(frames, population) {
	// Divisor scales with population: 1150 @ 500k, ~150 @ 100k
	const divisor = Math.max(1, Math.round(1150 * Math.pow(population / 500000, 1.25)));
	return parseInt((frames * population) / divisor);
}

// Debug flags
let debugBounds = false;

// ============================================================================
// ARTWORK DIMENSIONS & SCALING
// ============================================================================

// Artwork layout — orientation + ratio without blowing up pixel count.
// ratio = long edge : short edge (e.g. 3 → 3:1 strip). Canvas area stays ~viewportMin².
const ARTWORK_LAYOUT = {
	orientation: "horizontal", // "horizontal" | "vertical"
	ratio: 10, // long : short — horizontal 3 = 3:1 wide, vertical 3 = 1:3 tall
	baseSize: 400, // reference size for particle scaling (≈ viewport min at 1:1)
};

// Calculated at setup (for mover bounds / debugging)
let ARTWORK_ASPECT = 1;
let ARTWORK_CANVAS_WIDTH = 0;
let ARTWORK_CANVAS_HEIGHT = 0;

// Shader output framing (final pass only, object-fit: cover).
// fitCanvas: true = no crop; set false + width/height for a custom ratio.
// Tip: match ARTWORK_LAYOUT — e.g. horizontal ratio 3 → { fitCanvas: false, width: 3, height: 1 }
const SHADER_RENDER_RATIO = {
	fitCanvas: false,
	width: 2,
	height: 1,
};

// Master shader animation speed — scales all time-driven effects uniformly.
// 1.0 = default, 0.5 = half speed, 2.0 = double speed
const SHADER_ANIMATION_SPEED = 12.0;

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
let drawLoop = null; // createSketchDrawLoop instance

// ============================================================================
// PALETTE SYSTEM
// ============================================================================

let paletteManager;
let palettesLoaded = false;
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
const FRAME_SCALE_FACTOR_X = 1.45;
const FRAME_SCALE_FACTOR_Y = 1.45;

function sketchShadersEnabled() {
	return shadersEnabled(ENABLE_SHADERS);
}

function refreshDebugOverlay() {
	updateDebugOverlay({debugBounds, padding: BASE_PADDING, movers});
}

async function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// Reset the random seed to ensure consistency
	$fx.rand.reset();

	// p5.js 2.0 removed preload() — load assets here with async/await
	if (sketchShadersEnabled()) {
		await shaderEffects.preload(window);
	}

	// Build hex-array palettes - REQUIRED for this project (no hardcoded fallback)
	try {
		const {manager, ready} = initChromaPalettes({
			defaults: window.PROJECT_PALETTES?.defaults,
			palettes: window.PROJECT_PALETTES?.palettes ?? {},
		});
		paletteManager = manager;
		palettesLoaded = ready;
		if (!ready) {
			throw new Error("No palettes defined in palettes/palettes.js");
		}
	} catch (error) {
		console.error("Failed to build palettes:", error);
		palettesLoaded = false;
		throw error; // Stop execution if palettes can't be built
	}

	// Calculate optimal pixel density before creating canvases
	// Set pixel density for all devices
	//! when using shaders, higher than 4-5 causes dead space when exporting pngs
	pixel_density = CURRENT_PARAMS.printDPI ?? (typeof isSafariMobile === "function" && isSafariMobile() ? 1 : 1);

	// canvas setup — constant-area sizing from orientation + ratio
	DIM = min(windowWidth, windowHeight);
	const artworkLayout = computeArtworkLayout(DIM, ARTWORK_LAYOUT);
	ARTWORK_ASPECT = artworkLayout.aspect;
	ARTWORK_CANVAS_WIDTH = artworkLayout.width;
	ARTWORK_CANVAS_HEIGHT = artworkLayout.height;
	MULTIPLIER = artworkLayout.multiplier;
	console.log(MULTIPLIER, `canvas ${artworkLayout.width}×${artworkLayout.height} (${ARTWORK_LAYOUT.orientation} ${ARTWORK_LAYOUT.ratio}:1)`);

	// Create main canvas for the artwork (will also handle debug overlays)
	mainCanvas = createGraphics(artworkLayout.width, artworkLayout.height);
	mainCanvas.pixelDensity(pixel_density);

	// Try to create shader canvas for the WEBGL renderer (or regular canvas if no shaders)
	if (sketchShadersEnabled()) {
		try {
			shaderCanvas = createCanvas(artworkLayout.width, artworkLayout.height, WEBGL);
			shaderCanvas.pixelDensity(pixel_density);
			// Configure output framing before setup so it reaches the shaderManager
			shaderEffects.setRenderRatio(SHADER_RENDER_RATIO);
			shaderEffects.setAnimationSpeed(SHADER_ANIMATION_SPEED);
			// Initialize shader effects system
			shaderEffects.setup(width, height, mainCanvas, shaderCanvas, pixel_density);
			console.log("Shader effects initialized successfully");
		} catch (error) {
			console.warn("Failed to initialize shader effects:", error);
			console.log("Falling back to sketch without shaders");
			// Fallback: create regular canvas without shaders
			shaderCanvas = null;
			createCanvas(artworkLayout.width, artworkLayout.height);
			pixelDensity(pixel_density);
			// Shaders are unavailable; continue without them
		}
	} else {
		// No shaders - create regular canvas for display
		createCanvas(artworkLayout.width, artworkLayout.height);
		pixelDensity(pixel_density);
	}

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

	// Inform UI about available palettes + selected palette (after INIT chooses it)
	try {
		window.dispatchEvent(
			new CustomEvent("swatches:ready", {
				detail: {
					names: [...paletteManager.getFileNames()].sort(),
					localNames: paletteManager
						.getPaletteNames()
						.filter((name) => paletteManager.getConfig(name).source === "local")
						.sort(),
					selected: currentPaletteName,
				},
			}),
		);
	} catch {
		// ignore (UI will fall back gracefully)
	}

	drawLoop = createSketchDrawLoop({
		getGenerator: () => generator,
		isShadersEnabled: sketchShadersEnabled,
		getShaderCanvas: () => shaderCanvas,
		getMainCanvas: () => mainCanvas,
	});

	startSketchAnimation();

	if (CURRENT_PARAMS.showExternalFrame !== false) {
		renderOutsideFrame();
	}
	// Start the custom draw loop
	drawLoop.start();

	// Initialize debug overlay after setup is complete
	refreshDebugOverlay();

	// Setup UI controls (if present)
	setupControls({
		showFps: SHOW_FPS_UI,
		showDownload: SHOW_DOWNLOAD_UI,
		checkShaders: sketchShadersEnabled,
	});

	// Log available controls and performance settings
	console.log("Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)");
	if (sketchShadersEnabled() && shaderCanvas) {
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

function renderOutsideFrame() {
	mainCanvas.colorMode(HSL, 360, 100, 100, 100);
	let firstParticleColor = baseHSLPalette[baseHSLPalette.length - 1];
	let lastParticleColor = baseHSLPalette[Math.min(2, baseHSLPalette.length - 1)];
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

function startSketchAnimation() {
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
			mover.move(currentFrame, maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			if (sketchShadersEnabled() && shaderCanvas) {
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

	// Verify that palettes are available (required for this project)
	if (!palettesLoaded || !paletteManager.isReady()) {
		throw new Error("CRITICAL: Palettes are required but not available. Cannot proceed with palette selection.");
	}

	// Reset the random seed to ensure consistent state
	$fx.rand.reset();

	// Deterministic pool = file palettes only (local/browser palettes excluded
	// so the same hash renders identically everywhere)
	const fileNames = paletteManager.getFileNames();

	if (fileNames.length === 0) {
		throw new Error("No palettes available for selection");
	}

	// Sort palette names alphabetically to ensure consistent order
	// across different environments regardless of loading timing
	const sortedFileNames = [...fileNames].sort();

	// Allow UI to force palette selection by name (stable, may be a local palette),
	// otherwise default to deterministic selection
	const forcedPaletteName = CURRENT_PARAMS.paletteName;
	if (forcedPaletteName && paletteManager.getPaletteNames().includes(forcedPaletteName)) {
		currentPaletteName = forcedPaletteName;
		selectedPalette = sortedFileNames.indexOf(forcedPaletteName);
	} else {
		const paletteSelectionRand = fxrand();
		selectedPalette = Math.floor(paletteSelectionRand * sortedFileNames.length);
		currentPaletteName = sortedFileNames[selectedPalette];
		if (window.PARAMS_UI?.current) {
			window.PARAMS_UI.current.paletteName = currentPaletteName;
			if (typeof window.resolveParams === "function") window.resolveParams();
		}
	}

	baseHSLPalette = paletteManager.getPalette(currentPaletteName);

	if (!baseHSLPalette || baseHSLPalette.length === 0) {
		throw new Error(`Selected palette '${currentPaletteName}' is empty or invalid`);
	}

	// Scale noise values based on MULTIPLIER
	scl1 = 0.002 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.003 / MULTIPLIER;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;

	let amplitude1 = 1 * MULTIPLIER;
	let amplitude2 = 1 * MULTIPLIER;

	xMin = BASE_PADDING;
	xMax = 1 - BASE_PADDING;
	yMin = BASE_PADDING;
	yMax = 1 - BASE_PADDING;

	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		movers.push(new Mover(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, baseHSLPalette));
	}

	let bgCol = color(random(0, 35), 5, 100);
	mainCanvas.background(bgCol);
}

// ============================================================================
// UI APPLY HOOK (minimal surface)
// ============================================================================

window.applyGenerativeSettings = async function applyGenerativeSettings(settings) {
	if (!settings) return;

	const locked = window.PARAMS_UI?.lockedSeeds;
	if (!locked) return;

	if (window.PARAMS_UI?.current) {
		window.PARAMS_UI.current = {...window.PARAMS_UI.current, ...settings};
	}
	if (typeof window.resolveParams === "function") window.resolveParams();

	maxFrames = CURRENT_PARAMS.exposure ?? maxFrames;
	particleNum = CURRENT_PARAMS.population ?? particleNum;
	cycle = computeCycle(maxFrames, particleNum);

	if (typeof CURRENT_PARAMS.printDPI === "number") {
		pixel_density = CURRENT_PARAMS.printDPI;
		try {
			pixelDensity(pixel_density);
			mainCanvas?.pixelDensity(pixel_density);
			if (shaderCanvas?.pixelDensity) shaderCanvas.pixelDensity(pixel_density);
			if (typeof shaderEffects?.setPixelDensity === "function") {
				shaderEffects.setPixelDensity(pixel_density);
			}
		} catch {
			// ignore
		}
	}

	randomSeed(locked.mainRandomSeed);
	noiseSeed(locked.mainNoiseSeed);
	rseed = locked.rseed;
	nseed = locked.nseed;

	drawLoop?.stop();

	document.complete = false;
	if (sketchShadersEnabled() && shaderCanvas) {
		shaderEffects.setParticleAnimationComplete(false);
	}
	mainCanvas?.clear();
	canvasSetup();
	flushGraphicsStyleCache(mainCanvas);

	INIT(rseed, nseed);

	if (CURRENT_PARAMS.showExternalFrame !== false) {
		renderOutsideFrame();
	}

	startSketchAnimation();
	drawLoop?.start();
};

// ============================================================================
// KEY CONTROLS (artwork-local shortcuts)
// ============================================================================

function keyPressed() {
	if (key === "D" || key === "d") {
		debugBounds = !debugBounds;
		console.log("Debug bounds toggled: ", debugBounds);
		refreshDebugOverlay();
	}

	if (key === "F" || key === "f") {
		toggleFps("keyboard", {
			showFpsUi: SHOW_FPS_UI,
			checkShaders: sketchShadersEnabled,
		});
	}

	if (key === "G" || key === "g") {
		if (sketchShadersEnabled()) {
			const currentDebug = shaderEffects.effectsConfig.symmetry.debug;
			const newDebug = currentDebug > 0.5 ? 0.0 : 1.0;
			shaderEffects.updateEffectParam("symmetry", "debug", newDebug);
			console.log("Symmetry debug toggled: ", newDebug > 0.5);
		}
	}

	if (key === "C" || key === "c") {
		const controls = document.getElementById("controls");
		controls.classList.toggle("hide");
	}
}
