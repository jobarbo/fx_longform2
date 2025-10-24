/**
 * REFACTORED SKETCH USING STOP MOTION CONTROLLER
 *
 * This is your original sketch refactored to use the StopMotionController.
 * Compare this with the original sketch.js to see how much cleaner it is!
 */

// Global variables
console.log("sketch-with-stopmotion.js loaded");
let features = "";
let movers = [];
let baseHue = Math.random() * 360;

// Module references
let utils, logger, MoverClass, memoryManager, stopMotion;
let modulesLoaded = false;

// Initialize the application
async function initApp() {
	try {
		// Load essential modules
		await libManager.loadEssentials();
		await libManager.loadModule("memory");
		await libManager.loadModule("stopMotion");

		// Get module references
		utils = libManager.get("utils");
		logger = libManager.get("logs").Logger;
		MoverClass = libManager.get("mover").Mover || window.Mover;
		const MemoryManagerClass = libManager.get("memory").MemoryManager;
		const StopMotionController = libManager.get("stopMotion").StopMotionController;

		// Initialize Memory Manager
		memoryManager = new MemoryManagerClass({
			intervalMs: 5000,
			memoryThreshold: 0.85,
			enableLogging: true,
		});
		memoryManager.prepareForSketch();
		memoryManager.start();

		// Initialize Stop Motion Controller
		stopMotion = new StopMotionController({
			captureInterval: 100,
			easingIncrement: 0.31,
			maxCycles: 1,
			reinitDelay: 150,
			memoryManager: memoryManager,

			// Called every 100 frames to save
			onCapture: () => {
				logger.info("Taking screenshot");
				utils.saveArtwork();
			},

			// Called after save to reinitialize scene
			onReinit: (params) => {
				logger.info("Reinitializing after save...");
				reinitializeScene(params);
			},

			// Called when animation completes
			onComplete: () => {
				logger.info("Animation complete!");
			},
		});

		logger.success("All modules loaded successfully!");
		logger.info("Starting generative art application...");

		// Set features
		features = $fx.getFeatures();
		modulesLoaded = true;
	} catch (error) {
		console.error("Failed to initialize application:", error);
		features = window.features || {};
		MoverClass = window.Mover;
		modulesLoaded = false;
	}
}

// Call initialization when the page loads
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initApp);
} else {
	initApp();
}

function setup() {
	// Wait for modules to be loaded
	if (!modulesLoaded) {
		setTimeout(setup, 100);
		return;
	}

	logger.info("Features loaded:", features);

	if (!features) {
		features = $fx.getFeatures() || {};
	}

	// Device detection for pixel density
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(1.0);
	}

	createCanvas(1080, 1080);
	colorMode(HSB, 360, 100, 100, 100);

	// Seed randomness
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	// Initial scene setup - match the controller's starting state
	// The controller starts at easeAng = 180°, so cos(180°) = -1
	const initialParams = stopMotion.getParameters();
	reinitializeScene(initialParams);
}

function draw() {
	// Drawing code - same as before!
	blendMode(SCREEN);
	for (let i = 0; i < movers.length; i++) {
		movers[i].show();
		movers[i].move();
	}
	blendMode(BLEND);

	// That's it! The controller handles everything else:
	// - Frame counting
	// - Capture timing
	// - Cycle detection
	// - Memory management
	// - Reinitialization
	stopMotion.update();
}

/**
 * Reinitialize scene with evolved parameters
 * This is called by the StopMotionController
 */
function reinitializeScene(params) {
	// Clear existing movers and force GC
	if (movers && movers.length > 0) {
		movers.length = 0;
		if (memoryManager) {
			memoryManager.forceGC();
		}
	}
	movers = [];

	// Get animated parameters using the controller's helpers
	const scl1 = params.mapEasing(-0.002, 0.002);
	const scl2 = scl1;

	const angle1 = params.mapNoise("ax", 0, 8000, 0.01);
	const angle2 = params.mapNoise("ay", 0, 8000, 0.01);

	const xi = params.mapEasing(-600, -600);
	const yi = params.mapEasing(-600, -600);

	// Evolve base hue using noise
	baseHue += params.mapNoise ? params.mapNoise("x", -2, 2, 0.001) : random(-2, 2);
	baseHue = (baseHue + 360) % 360;

	// Log parameters
	logger.table("Position Variables", {
		xi: xi.toFixed(2),
		yi: yi.toFixed(2),
		baseHue: baseHue.toFixed(2),
	});

	logger.table("Animation Parameters", {
		scl1: scl1.toFixed(6),
		scl2: scl2.toFixed(6),
		angle1: angle1.toFixed(0),
		angle2: angle2.toFixed(0),
		easing: params.easing ? params.easing.toFixed(4) : "N/A",
	});

	// Define boundaries
	const xMin = -0.1;
	const xMax = 1.1;
	const yMin = -0.1;
	const yMax = 1.1;

	// Create movers with updated parameters
	for (let i = 0; i < 40000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = baseHue + random(-10, 10);
		initHue = (initHue + 360) % 360;

		const MoverToUse = MoverClass || window.Mover;
		movers.push(
			new MoverToUse(
				x,
				y,
				xi,
				yi,
				initHue,
				scl1,
				scl2,
				angle1,
				angle2,
				xMin,
				xMax,
				yMin,
				yMax,
				true, // isBordered
				random(10000) // seed
			)
		);
	}

	background(0, 0, 2);

	// Log memory status
	if (memoryManager) {
		const memoryUsage = memoryManager.getMemoryUsage();
		if (memoryUsage) {
			logger.table("Memory Status After INIT", {
				"Objects Created": movers.length,
				"Memory Used": memoryUsage.used + "MB",
				"Memory Total": memoryUsage.total + "MB",
				"Memory Limit": memoryUsage.limit + "MB",
				"Usage Percentage": memoryUsage.percentage + "%",
			});
		}
	}
}

/**
 * COMPARISON: Original vs Refactored
 *
 * ORIGINAL (sketch.js):
 * - 75+ lines of stop-motion logic in draw()
 * - Manual frame counting and cycle detection
 * - Manual easing angle management
 * - Manual noise offset tracking
 * - Complex timing logic with requestAnimationFrame
 * - Hard to reuse in other projects
 *
 * REFACTORED (this file):
 * - 1 line in draw(): stopMotion.update()
 * - All complexity hidden in controller
 * - Clean separation of concerns
 * - Plug-and-play in any project
 * - Easy to customize via config
 * - Consistent API across projects
 *
 * Lines of code:
 * - Original: ~300 lines total, ~100 for stop-motion logic
 * - Refactored: ~180 lines total, ~20 for stop-motion setup
 * - Saved: ~120 lines, cleaner structure
 */
