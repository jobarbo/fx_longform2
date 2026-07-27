// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

// Shader effects toggle
const ENABLE_SHADERS = true;

// UI toggles
const SHOW_FPS_UI = false;
const SHOW_DOWNLOAD_UI = false;
const ENABLE_DEV_PANELS = true;
const PERSIST_SHADER_PANEL = true;
const PERSIST_CONTROLS_PANEL = true;
const ENABLE_AUDIO = false;
const AUDIO_SOURCE = "microphone"; // "microphone" | "chime" (mic opens on first user gesture)

// Canvas sizing
const CANVAS_CONFIG = {
	BASE_WIDTH: 1000,
	ARTWORK_RATIO: 1.0,
	ORIENTATION: "horizontal", // "horizontal" | "vertical"
	EXTERNAL_FRAME_THICKNESS: 0.03,
	ARTWORK_PADDING: 0.0,
	WRAP_PADDING_FACTOR: 0.05,
	SCALE_FACTOR_X: 1.1,
	SCALE_FACTOR_Y: 1.1,
	FORCE_SIZE: false,
	FIXED_WIDTH: 3840,
	FIXED_HEIGHT: 1200,
	PIXEL_DENSITY: 1,
	PIXEL_DENSITY_MOBILE: 1,
	SHADER_RENDER: {fitCanvas: false, matchArtwork: true, width: 1, height: 1},
	SHADER_ANIMATION_SPEED: 1.0,
};

// Alias for Mover (reads WRAP_PADDING_FACTOR as a global)
const WRAP_PADDING_FACTOR = CANVAS_CONFIG.WRAP_PADDING_FACTOR;

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

// Calculated at setup (for mover bounds / debugging)
let ARTWORK_ASPECT = 1;
let ARTWORK_CANVAS_WIDTH = 0;
let ARTWORK_CANVAS_HEIGHT = 0;

// Calculated dimensions (set in setup())
let DIM; // Canvas dimension (min of canvas width/height)
let MULTIPLIER; // Scaling factor based on screen size
let W = window.innerWidth; // Window width
let H = window.innerHeight; // Window height

function getPixelDensity() {
	if (typeof CURRENT_PARAMS?.printDPI === "number") {
		return CURRENT_PARAMS.printDPI;
	}
	const isMobile = typeof isSafariMobile === "function" && isSafariMobile();
	return isMobile ? CANVAS_CONFIG.PIXEL_DENSITY_MOBILE : CANVAS_CONFIG.PIXEL_DENSITY;
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
 * Equal absolute padding on every side.
 * ARTWORK_PADDING is a fraction of min(canvasW, canvasH); returns normalized {x, y}.
 */
function getArtworkPaddingNorm(canvasW = width, canvasH = height) {
	const pad = Math.max(0, Math.min(0.49, Number(CANVAS_CONFIG.ARTWORK_PADDING) || 0));
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
	ARTWORK_CANVAS_WIDTH = canvasW;
	ARTWORK_CANVAS_HEIGHT = canvasH;
	// Scale from short edge so horizontal/vertical keep the same particle/noise density
	DIM = min(canvasW, canvasH);
	MULTIPLIER = DIM / CANVAS_CONFIG.BASE_WIDTH;
}

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

function sketchShadersEnabled() {
	return shadersEnabled(ENABLE_SHADERS);
}

function refreshDebugOverlay() {
	updateDebugOverlay({debugBounds, padding: getArtworkPaddingNorm(width, height), movers});
}

// ============================================================================
// DEV PANELS (debug/audio panel + shader effects panel)
// ============================================================================

let panelLoopId = null;

function setupDevPanels() {
	if (!ENABLE_DEV_PANELS) return;

	// Audio analysis feeding the debug panel (and optional shader mappings)
	if (ENABLE_AUDIO && typeof audioKnob !== "undefined") {
		audioKnob.setSource(AUDIO_SOURCE);
		// Optional audio-reactive shader mappings, e.g.:
		// audioKnob.map("energy", "chromatic", "amount", 0, 0.01);
	}

	if (typeof debugPanel !== "undefined") {
		debugPanel.init({
			audio: ENABLE_AUDIO && typeof audioAnalyzer !== "undefined" ? audioAnalyzer : null,
			shaders: sketchShadersEnabled() && shaderCanvas ? shaderEffects : null,
		});
	}

	if (typeof shaderEffectsPanel !== "undefined" && sketchShadersEnabled() && shaderCanvas) {
		shaderEffectsPanel.init(shaderEffects);
	}

	startPanelLoop();
}

// Panels run on their own rAF loop so they stay live independently of the
// artwork draw loop (which restarts on Apply and can stop on completion).
function startPanelLoop() {
	if (panelLoopId !== null) return;
	const tick = () => {
		if (ENABLE_AUDIO && typeof audioKnob !== "undefined") audioKnob.update();
		if (typeof debugPanel !== "undefined") debugPanel.update();
		if (typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.update();
		panelLoopId = requestAnimationFrame(tick);
	};
	panelLoopId = requestAnimationFrame(tick);
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

	// Shared density for p5 / shader canvas / pipeline (!>4–5 can leave dead space on PNG export)
	pixel_density = getPixelDensity();

	// canvas setup — FORCE_SIZE uses FIXED_WIDTH/HEIGHT; otherwise viewport + ARTWORK_RATIO
	const {width: canvasW, height: canvasH} = getCanvasDimensions();
	updateLayoutMetrics(canvasW, canvasH);
	console.log(
		MULTIPLIER,
		`canvas ${canvasW}×${canvasH}` +
			(CANVAS_CONFIG.FORCE_SIZE ? ` (forced ${CANVAS_CONFIG.FIXED_WIDTH}×${CANVAS_CONFIG.FIXED_HEIGHT})` : ` (${CANVAS_CONFIG.ORIENTATION} ${CANVAS_CONFIG.ARTWORK_RATIO}:1)`),
	);

	// Create main canvas for the artwork (will also handle debug overlays)
	mainCanvas = createGraphics(canvasW, canvasH);
	mainCanvas.pixelDensity(pixel_density);

	// Try to create shader canvas for the WEBGL renderer (or regular canvas if no shaders)
	if (sketchShadersEnabled()) {
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

	if (typeof fitDisplayToViewport === "function") {
		fitDisplayToViewport();
	}

	// Sync canvas smoothing class with crisp-pixels state (CSS defaults to pixelated
	// when the class is missing; shader setup normally applies it, this covers fallbacks)
	shaderEffects.setCrispPixels(shaderEffects.getCrispPixels());

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

	// Deterministic shader seed without consuming fxrand (keeps gen identical with/without shaders)
	if (sketchShadersEnabled() && shaderCanvas) {
		shaderEffects.shaderSeed = rseed;
	}

	canvasSetup();

	// Initialize from UI resolved values
	maxFrames = CURRENT_PARAMS.exposure ?? maxFrames;
	particleNum = CURRENT_PARAMS.population ?? particleNum;
	cycle = computeCycle(maxFrames, particleNum);

	INIT(rseed, nseed);

	// Inform UI about available palettes. Pass the preference ("" = random), not the
	// resolved name, so the select stays on "(random)" across refresh.
	try {
		window.dispatchEvent(
			new CustomEvent("swatches:ready", {
				detail: {
					names: [...paletteManager.getFileNames()].sort(),
					localNames: paletteManager
						.getPaletteNames()
						.filter((name) => paletteManager.getConfig(name).source === "local")
						.sort(),
					selected: window.PARAMS_UI?.current?.paletteName ?? "",
					resolved: currentPaletteName,
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

	// Dev panels: D = debug/audio panel, E = shader effects panel
	setupDevPanels();

	// Log available controls and performance settings
	console.log("Controls: D debug/audio panel · E shader panel · B debug bounds · G symmetry debug · C controls");
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
	mainCanvas.scale(CANVAS_CONFIG.SCALE_FACTOR_X, CANVAS_CONFIG.SCALE_FACTOR_Y);
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

	mainCanvas.rectMode(CENTER);
	mainCanvas.noFill();
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	const {x: padX, y: padY} = getArtworkPaddingNorm(mainCanvas.width, mainCanvas.height);
	const baseRectW = mainCanvas.width * (1 - padX * 2);
	const baseRectH = mainCanvas.height * (1 - padY * 2);
	const shortEdge = Math.min(mainCanvas.width, mainCanvas.height) || 1;
	const frameThickness = Math.max(0, Number(CANVAS_CONFIG.EXTERNAL_FRAME_THICKNESS) || 0);
	const rectShrink = shortEdge * frameThickness;
	// Stroke weight scales with thickness; 0.03 ≈ old look (max stroke ~2)
	const maxStroke = Math.max(0.1, frameThickness * (2 / 0.03));
	for (let i = 0; i < 10000; i++) {
		let randShrink = fxrand() * rectShrink;
		let rectW = baseRectW + randShrink;
		let rectH = baseRectH + randShrink;
		mainCanvas.strokeWeight(map(randShrink, 0, rectShrink / 1.5 || 1, maxStroke, 0.1, true));
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
	// otherwise default to deterministic selection. Keep "" as "(random)" preference —
	// never write the resolved name back into PARAMS_UI or random won't persist.
	const forcedPaletteName = CURRENT_PARAMS.paletteName;
	if (forcedPaletteName && paletteManager.getPaletteNames().includes(forcedPaletteName)) {
		currentPaletteName = forcedPaletteName;
		selectedPalette = sortedFileNames.indexOf(forcedPaletteName);
	} else {
		const paletteSelectionRand = fxrand();
		selectedPalette = Math.floor(paletteSelectionRand * sortedFileNames.length);
		currentPaletteName = sortedFileNames[selectedPalette];
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

	const {x: padX, y: padY} = getArtworkPaddingNorm(width, height);
	xMin = padX;
	xMax = 1 - padX;
	yMin = padY;
	yMax = 1 - padY;

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

	if (sketchShadersEnabled() && shaderCanvas) {
		shaderEffects.shaderSeed = rseed;
	}

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
	// Don't hijack keys while typing in panel/params inputs
	const tag = document.activeElement?.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) {
		return;
	}

	if (key === "D" || key === "d") {
		if (typeof debugPanel !== "undefined") debugPanel.toggle();
	}

	if (key === "E" || key === "e") {
		if (typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.toggle();
	}

	if (key === "B" || key === "b") {
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
