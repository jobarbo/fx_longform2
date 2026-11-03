// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

// Shader effects toggle
const ENABLE_SHADERS = true;

// UI toggles
const SHOW_FPS_UI = false; // FPS overlay + FPS toggle button
const SHOW_DOWNLOAD_UI = false; // Download button (mounted in #controls)

// Dev panels — shader effects panel (key E)
const ENABLE_DEV_PANELS = true;
const PERSIST_SHADER_PANEL = true; // localStorage: keep shader panel edits across refresh
const PERSIST_CONTROLS_PANEL = true; // localStorage: keep Controls panel edits across refresh
const ENABLE_AUDIO = false; // false = no mic/chime input
const AUDIO_SOURCE = "microphone"; // "microphone" | "chime" (mic opens on first user gesture)

// Canvas sizing — FORCE_SIZE true uses FIXED_WIDTH/HEIGHT; false uses viewport + ARTWORK_RATIO + ORIENTATION
const CANVAS_CONFIG = {
	BASE_WIDTH: 1000,
	// Long : short edge (e.g. 1.77). Combined with ORIENTATION → 1.77:1 or 1:1.77
	ARTWORK_RATIO: 1.21,
	ORIENTATION: "vertical", // "horizontal" | "vertical"
	// Fraction of the shorter canvas edge — equal absolute border on all sides
	ARTWORK_PADDING: 0.05,
	WRAP_PADDING_FACTOR: 0.0,
	SCALE_FACTOR_X: 1.0,
	SCALE_FACTOR_Y: 1.0,
	FORCE_SIZE: false,
	FIXED_WIDTH: 240,
	FIXED_HEIGHT: 228,
	// Shared by p5 mainCanvas, display/shader canvas, and shader pipeline
	PIXEL_DENSITY: 2,
	PIXEL_DENSITY_MOBILE: 1,
	// Shader output framing (final pass only).
	// fitCanvas: true = no crop (full texture). false = object-fit cover with width:height.
	// matchArtwork: true = derive width/height from ARTWORK_RATIO + ORIENTATION (or FIXED_*).
	SHADER_RENDER: {fitCanvas: false, matchArtwork: true, width: 1, height: 1},
	// Master shader animation speed — 1.0 = default, 0.5 = half, 2.0 = double
	SHADER_ANIMATION_SPEED: 1.0,
};

// Aliases for Mover / legacy call sites
const WRAP_PADDING_FACTOR = CANVAS_CONFIG.WRAP_PADDING_FACTOR;
const BASE_PADDING = CANVAS_CONFIG.ARTWORK_PADDING;

// Particle size comes from the active config (render.particleSize), in canvas units at PARTICLE_DPI_REFERENCE density
// (curve + defaults in library/utils/utils.js → particleDensityScale)
const PARTICLE_DPI_REFERENCE = 4; // density particle sizes are expressed at
const PARTICLE_DPI_COMPENSATION = 0.7; // 0 = no compensation; omit either to use utils defaults

// Animation configuration — overwritten from ACTIVE_CONFIG in setup() / Apply
let maxFrames = 25;
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

// Calculated at setup (for mover bounds / debugging)
let ARTWORK_ASPECT = 1;
let ARTWORK_CANVAS_WIDTH = 0;
let ARTWORK_CANVAS_HEIGHT = 0;
// Legacy global used by Mover wrap padding (height/width after layout)
let ARTWORK_RATIO = CANVAS_CONFIG.ARTWORK_RATIO;

// Calculated dimensions (set in setup())
let DIM; // Canvas dimension (min of canvas width/height)
let MULTIPLIER; // Scaling factor based on screen size
let CONFIG_MULTIPLIER = 1; // MULTIPLIER as the active config knew it (render.sizeRef) — set in INIT
let W = window.innerWidth; // Window width
let H = window.innerHeight; // Window height

function getPixelDensity() {
	const isMobile = typeof isSafariMobile === "function" && isSafariMobile();
	return isMobile ? CANVAS_CONFIG.PIXEL_DENSITY_MOBILE : (CURRENT_PARAMS.printDPI ?? CANVAS_CONFIG.PIXEL_DENSITY);
}

function getCanvasDimensions() {
	if (CANVAS_CONFIG.FORCE_SIZE) {
		return {
			width: CANVAS_CONFIG.FIXED_WIDTH,
			height: CANVAS_CONFIG.FIXED_HEIGHT,
		};
	}

	const viewportDim = min(windowWidth, windowHeight);
	const layout = {
		orientation: CANVAS_CONFIG.ORIENTATION === "vertical" ? "vertical" : "horizontal",
		ratio: Math.max(Number(CANVAS_CONFIG.ARTWORK_RATIO) || 1, 0.01),
		baseSize: CANVAS_CONFIG.BASE_WIDTH,
	};

	if (typeof computeArtworkLayout === "function") {
		const sized = computeArtworkLayout(viewportDim, layout);
		return {width: sized.width, height: sized.height};
	}

	// Fallback if artworkLayout.js is missing: ratio = long:short
	const r = layout.ratio;
	if (layout.orientation === "vertical") {
		return {width: viewportDim / r, height: viewportDim};
	}
	return {width: viewportDim, height: viewportDim / r};
}

/**
 * Artwork padding from the active framing (ACTIVE_CONFIG.layout.padding); returns normalized {x, y}.
 * Number = equal absolute padding, a fraction of min(canvasW, canvasH).
 * {x, y} = legacy per-axis padding, already normalized to width / height.
 */
function getArtworkPaddingNorm(canvasW = width, canvasH = height) {
	const padding = ACTIVE_CONFIG.layout?.padding ?? CANVAS_CONFIG.ARTWORK_PADDING;
	if (typeof padding === "object") {
		return {x: padding.x, y: padding.y};
	}
	const pad = Math.max(0, Math.min(0.49, Number(padding) || 0));
	const shortEdge = Math.min(canvasW, canvasH) || 1;
	const padPx = pad * shortEdge;
	return {
		x: padPx / (canvasW || 1),
		y: padPx / (canvasH || 1),
	};
}

/**
 * Resolve shader output framing from CANVAS_CONFIG.SHADER_RENDER.
 * With matchArtwork, width/height follow ARTWORK_RATIO + ORIENTATION (or FIXED_*).
 */
function resolveShaderRender() {
	const cfg = CANVAS_CONFIG.SHADER_RENDER || {};
	const fitCanvas = Boolean(cfg.fitCanvas);

	if (fitCanvas) {
		return {fitCanvas: true, width: cfg.width ?? 1, height: cfg.height ?? 1};
	}

	if (cfg.matchArtwork !== false) {
		if (CANVAS_CONFIG.FORCE_SIZE) {
			return {
				fitCanvas: false,
				width: CANVAS_CONFIG.FIXED_WIDTH,
				height: CANVAS_CONFIG.FIXED_HEIGHT,
			};
		}
		const r = Math.max(Number(CANVAS_CONFIG.ARTWORK_RATIO) || 1, 0.01);
		if (CANVAS_CONFIG.ORIENTATION === "vertical") {
			return {fitCanvas: false, width: 1, height: r};
		}
		return {fitCanvas: false, width: r, height: 1};
	}

	return {
		fitCanvas: false,
		width: cfg.width ?? 1,
		height: cfg.height ?? 1,
	};
}

function updateLayoutMetrics(canvasW, canvasH) {
	ARTWORK_ASPECT = canvasW / canvasH;
	ARTWORK_RATIO = canvasH / canvasW; // Mover legacy Y correction
	ARTWORK_CANVAS_WIDTH = canvasW;
	ARTWORK_CANVAS_HEIGHT = canvasH;
	const baseHeight = CANVAS_CONFIG.BASE_WIDTH * ARTWORK_ASPECT;
	const defaultSize = min(CANVAS_CONFIG.BASE_WIDTH, baseHeight);
	DIM = min(canvasW, canvasH);
	MULTIPLIER = DIM / defaultSize;
}

// ============================================================================
// CANVAS & RENDERING
// ============================================================================

let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects
let pixel_density; // Calculated in setup() after windowWidth/Height are available
let panelLoopId = null;

// ============================================================================
// ANIMATION STATE
// ============================================================================

let features = "";
let movers = [];
let startTime;
let elapsedTime = 0;
let executionTimer = new ExecutionTimer();
let generator; // Animation generator instance

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

let drawLoop = null; // createSketchDrawLoop instance

async function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// Reset the random seed to ensure consistency
	$fx.rand.reset();

	// p5.js 2.0 removed preload() — load assets here with async/await
	// Initialize shader effects (will load all shaders) - optional
	if (shadersEnabled()) {
		await shaderEffects.preload(window);
	}

	// Initialize swatch palette system
	swatchPalette = new SwatchPalette();

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

	// Shared density for p5 / shader canvas / pipeline (!>4–5 can leave dead space on PNG export)
	pixel_density = getPixelDensity();

	// canvas setup — FORCE_SIZE uses FIXED_WIDTH/HEIGHT; otherwise viewport + ARTWORK_RATIO
	const {width: canvasW, height: canvasH} = getCanvasDimensions();
	updateLayoutMetrics(canvasW, canvasH);
	console.log(
		MULTIPLIER,
		`canvas ${Math.round(canvasW)}×${Math.round(canvasH)}` +
			(CANVAS_CONFIG.FORCE_SIZE ? ` (forced ${CANVAS_CONFIG.FIXED_WIDTH}×${CANVAS_CONFIG.FIXED_HEIGHT})` : ` (${CANVAS_CONFIG.ORIENTATION} ${CANVAS_CONFIG.ARTWORK_RATIO}:1)`),
	);

	// Create main canvas for the artwork (will also handle debug overlays)
	mainCanvas = createGraphics(canvasW, canvasH);
	mainCanvas.pixelDensity(pixel_density);

	// Try to create shader canvas for the WEBGL renderer (or regular canvas if no shaders)
	if (shadersEnabled()) {
		try {
			shaderCanvas = createCanvas(canvasW, canvasH, WEBGL);
			shaderCanvas.pixelDensity(pixel_density);

			// Restore panel edits from localStorage before setup (wins over CANVAS_CONFIG output)
			let restoredPanel = false;
			if (PERSIST_SHADER_PANEL && typeof shaderEffects.loadPersistedPanelConfig === "function") {
				restoredPanel = shaderEffects.loadPersistedPanelConfig();
				if (restoredPanel) {
					console.log("[sketch] restored shader panel config from localStorage");
				}
			}
			if (!restoredPanel) {
				shaderEffects.setRenderRatio(resolveShaderRender());
				shaderEffects.setAnimationSpeed(CANVAS_CONFIG.SHADER_ANIMATION_SPEED);
			}

			// Initialize shader effects system
			shaderEffects.setup(width, height, mainCanvas, shaderCanvas, pixel_density);
			console.log("Shader effects initialized successfully");
		} catch (error) {
			console.warn("Failed to initialize shader effects:", error);
			console.log("Falling back to sketch without shaders");
			// Fallback: create regular canvas without shaders
			shaderCanvas = null;
			createCanvas(canvasW, canvasH);
			pixelDensity(pixel_density);
			// Shaders are unavailable; continue without them
		}
	} else {
		// No shaders - create regular canvas for display
		createCanvas(canvasW, canvasH);
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

	applyRenderSettings();
	INIT(rseed, nseed);
	dispatchSwatchesReady();

	if (CURRENT_PARAMS.showExternalFrame) {
		renderOutsideFrame();
	}

	drawLoop = createSketchDrawLoop({
		getGenerator: () => generator,
		isShadersEnabled: shadersEnabled,
		getShaderCanvas: () => shaderCanvas,
		getMainCanvas: () => mainCanvas,
	});

	startSketchAnimation();

	// Create download button immediately (will only show if not in iframe)
	if (typeof createDownloadButton === "function" && SHOW_DOWNLOAD_UI) {
		createDownloadButton();
	}

	// Publish --art-w / --art-h so style.css can contain-fit the canvas to the viewport.
	// Without this first call the vars only appear after a resize, and the canvas would
	// fall back to a 1:1 ratio until then.
	if (typeof fitDisplayToViewport === "function") {
		fitDisplayToViewport();
	}

	// Sync canvas smoothing class with crisp-pixels state
	if (shadersEnabled() && typeof shaderEffects.setCrispPixels === "function") {
		shaderEffects.setCrispPixels(shaderEffects.getCrispPixels());
	}

	// Start the custom draw loop
	drawLoop.start();

	// Initialize debug overlay after setup is complete
	updateDebugOverlay();

	// Setup UI controls (if present)
	if (typeof setupControls === "function") {
		setupControls({
			showFps: SHOW_FPS_UI,
			showDownload: SHOW_DOWNLOAD_UI,
			checkShaders: shadersEnabled,
		});
	} else {
		setupMobileControls();
	}

	if (ENABLE_DEV_PANELS) {
		setupDevPanels();
	}

	// Log available controls and performance settings
	console.log("Controls: Press 'D' to toggle debug bounds (green=padding, red=movement)");
	console.log("Controls: Press 'E' to toggle shader effects panel");
	if (shadersEnabled() && shaderCanvas) {
		console.log(`Shader performance: Frame rate limited to ${shaderEffects.getFrameRate()}fps to match p5.js draw speed`);
		console.log(`Use shaderEffects.setFrameRate(fps) to adjust the frame rate to match your p5.js settings`);
	} else {
		console.log("Running without shader effects");
	}
}

function setupDevPanels() {
	if (typeof shaderEffectsPanel !== "undefined" && shadersEnabled() && shaderCanvas) {
		shaderEffectsPanel.init(shaderEffects);
	}
	startPanelLoop();
}

// Panels run on their own rAF loop so they stay live independently of the
// artwork draw loop (which can stop on completion).
function startPanelLoop() {
	if (panelLoopId !== null) return;
	const tick = () => {
		if (typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.update();
		panelLoopId = requestAnimationFrame(tick);
	};
	panelLoopId = requestAnimationFrame(tick);
}

// Zoom from CANVAS_CONFIG × active framing (ACTIVE_CONFIG.layout.scale). Re-applied on Apply.
function canvasSetup() {
	try {
		mainCanvas?.resetMatrix?.();
	} catch {
		// ignore
	}
	const layoutScale = ACTIVE_CONFIG.layout?.scale ?? 1;
	mainCanvas.translate(width / 2, height / 2);
	mainCanvas.scale(CANVAS_CONFIG.SCALE_FACTOR_X * layoutScale, CANVAS_CONFIG.SCALE_FACTOR_Y * layoutScale);
	mainCanvas.translate(-width / 2, -height / 2); // Move back to maintain center
}

// External frame (ported from retro-futura) — drawn around the artwork bounds set in INIT
function renderOutsideFrame() {
	mainCanvas.colorMode(HSL, 360, 100, 100, 100);
	let firstParticleColor = baseHSLPalette[baseHSLPalette.length - 1];
	let lastParticleColor = baseHSLPalette[Math.min(2, baseHSLPalette.length - 1)];
	let s_hue = lastParticleColor.h;
	let s_sat = lastParticleColor.s;
	let s_bri = lastParticleColor.l;
	let s_alpha = 1;
	let compHue = lastParticleColor.h;

	mainCanvas.rectMode(CENTER);
	mainCanvas.noFill();
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	const baseRectW = mainCanvas.width * (xMax - xMin);
	const baseRectH = mainCanvas.height * (yMax - yMin);
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

// Exposure / population from the active config (or the panel override)
function applyRenderSettings() {
	maxFrames = ACTIVE_CONFIG.render.maxFrames;
	particleNum = ACTIVE_CONFIG.render.particleNum;
	cycle = computeCycle(maxFrames, particleNum);
}

function startSketchAnimation() {
	// Notify UI that a render is starting (panel spinner, status text, etc.)
	window.dispatchEvent(new CustomEvent("render:started"));

	const drawFirstFrame = ACTIVE_CONFIG.render.drawFirstFrame;

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		currentFrame: 0, // Add current frame tracking
		renderItem: (mover, currentFrame) => {
			if (currentFrame > 0 || drawFirstFrame) {
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
			window.dispatchEvent(new CustomEvent("render:completed"));

			// Create download button after sketch is complete
			if (typeof createDownloadButton === "function" && SHOW_DOWNLOAD_UI) {
				createDownloadButton();
			}
		},
	};

	// Create and start the animation
	generator = createAnimationGenerator(animConfig);
}

// Inform UI about available palettes + selected palette (after INIT chooses it)
function dispatchSwatchesReady() {
	window.dispatchEvent(
		new CustomEvent("swatches:ready", {
			detail: {
				names: [...swatchPalette.getSwatchNames()].sort(),
				localNames: [],
				selected: CURRENT_PARAMS.paletteName || "",
			},
		}),
	);
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

	// Select directly from sorted swatch palettes, unless the panel forces one by name
	// (the fxrand draw above always happens so the rest of the sequence stays the same)
	const forcedPaletteName = CURRENT_PARAMS.paletteName;
	if (forcedPaletteName && sortedSwatchNames.includes(forcedPaletteName)) {
		selectedPalette = sortedSwatchNames.indexOf(forcedPaletteName);
	} else {
		selectedPalette = Math.floor(paletteSelectionRand * sortedSwatchNames.length);
	}
	currentPaletteName = sortedSwatchNames[selectedPalette];
	baseHSLPalette = swatchPalette.getPalette(currentPaletteName);

	if (!baseHSLPalette || baseHSLPalette.length === 0) {
		throw new Error(`Selected swatch palette '${currentPaletteName}' is empty or invalid`);
	}

	// Copy before reversing — getPalette may return the cached array
	if (CURRENT_PARAMS.paletteDirection === "reversed") {
		baseHSLPalette = [...baseHSLPalette].reverse();
	}

	const cfg = ACTIVE_CONFIG;
	console.log(`[config] ${configLabel(cfg.id)} (${cfg.commit}) · palette ${currentPaletteName}`);

	// MULTIPLIER as it was when the config was made (older layouts used another reference size)
	CONFIG_MULTIPLIER = cfg.render.sizeRef ? min(width, height) / cfg.render.sizeRef : MULTIPLIER;

	// Scale noise values based on MULTIPLIER
	scl1 = cfg.noise.scl[0] / CONFIG_MULTIPLIER;
	scl2 = cfg.noise.scl[1] / CONFIG_MULTIPLIER;
	scl3 = cfg.noise.scl[2] / CONFIG_MULTIPLIER;

	let [sclOffset1, sclOffset2, sclOffset3] = cfg.noise.sclOffset;

	let amplitudeScale = cfg.flow.scaleAmplitude ? CONFIG_MULTIPLIER : 1;
	let amplitude1 = cfg.flow.a1 * amplitudeScale;
	let amplitude2 = cfg.flow.a2 * amplitudeScale;

	// Artwork padding from the active framing (see getArtworkPaddingNorm)
	const {x: padX, y: padY} = getArtworkPaddingNorm(width, height);
	xMin = padX;
	xMax = 1 - padX;
	yMin = padY;
	yMax = 1 - padY;

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

//! CUSTOM UTILITIES FUNCTIONS ==========================================

// Helper function to check if shaders are enabled and available
function shadersEnabled() {
	return ENABLE_SHADERS && typeof shaderEffects !== "undefined";
}

// ============================================================================
// UI APPLY HOOK (ParamsPanel → re-render with the same seeds)
// ============================================================================

window.applyGenerativeSettings = async function applyGenerativeSettings(settings) {
	if (!settings) return;

	const locked = window.PARAMS_UI?.lockedSeeds;
	if (!locked) return;

	if (window.PARAMS_UI?.current) {
		window.PARAMS_UI.current = {...window.PARAMS_UI.current, ...settings};
	}
	if (typeof window.resolveParams === "function") window.resolveParams();

	applyRenderSettings();

	pixel_density = getPixelDensity();
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

	randomSeed(locked.mainRandomSeed);
	noiseSeed(locked.mainNoiseSeed);
	rseed = locked.rseed;
	nseed = locked.nseed;

	drawLoop?.stop();

	document.complete = false;
	executionTimer.start();
	if (shadersEnabled() && shaderCanvas) {
		shaderEffects.setParticleAnimationComplete(false);
	}
	mainCanvas?.clear();
	canvasSetup();
	flushGraphicsStyleCache(mainCanvas);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);

	INIT(rseed, nseed);
	updateDebugOverlay();

	if (CURRENT_PARAMS.showExternalFrame) {
		renderOutsideFrame();
	}

	startSketchAnimation();
	drawLoop?.start();
};

// Setup mobile touch controls
function setupMobileControls() {
	// Hide entire controls container if in iframe
	const controlsContainer = document.getElementById("controls");
	if (controlsContainer && typeof isInIframe === "function" && isInIframe()) {
		controlsContainer.style.display = "none";
		return;
	}

	const toggleFpsButton = document.getElementById("toggle-fps");
	if (toggleFpsButton) {
		toggleFpsButton.addEventListener("click", function () {
			if (shadersEnabled()) {
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
		if (shadersEnabled()) {
			if (shaderEffects.showFPS) {
				toggleFpsButton.classList.add("active");
				toggleFpsButton.textContent = "FPS: ON";
			} else {
				toggleFpsButton.textContent = "FPS: OFF";
			}
		}
	}
}
// Key controls for debugging and performance monitoring
function keyPressed() {
	// Don't hijack keys while typing in panel inputs
	const tag = document.activeElement?.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) {
		return;
	}

	if (key === "D" || key === "d") {
		debugBounds = !debugBounds;
		console.log("Debug bounds toggled: ", debugBounds);
		updateDebugOverlay();
	}

	if (key === "E" || key === "e") {
		if (typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.toggle();
	}

	if (key === "F" || key === "f") {
		// Don't allow FPS toggle if in iframe or UI disabled
		if (!SHOW_FPS_UI) return;
		if (typeof isInIframe === "function" && isInIframe()) {
			return;
		}
		if (shadersEnabled()) {
			shaderEffects.toggleFPS();
			console.log("FPS counter toggled: ", shaderEffects.showFPS);
		}
	}

	if (key === "G" || key === "g") {
		if (shadersEnabled() && shaderEffects.effectsConfig.symmetry) {
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

	// Equal absolute padding on all sides (fraction of the shorter canvas edge)
	const {x: padX, y: padY} = getArtworkPaddingNorm(canvasWidth, canvasHeight);
	const basePaddingLeft = padX * canvasWidth;
	const basePaddingTop = padY * canvasHeight;
	const basePaddingWidth = canvasWidth * (1 - padX * 2);
	const basePaddingHeight = canvasHeight * (1 - padY * 2);

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
