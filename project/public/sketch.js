let features = "";

let maxDPI = 3;
let RATIO = 1;

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

// Animation control
let movers = [];
let numMovers = 400;
let maxFrames = 200; // Total frames to animate
let generator; // Animation generator instance
let executionTimer = new ExecutionTimer();
// Canvas references
let pixel_density = 2;
let mainCanvas; // Main graphics buffer for artwork
let shaderCanvas; // WEBGL canvas for shader effects (if shaders enabled)
let cycle = parseInt((maxFrames * numMovers) / 50); // Number of operations before updating display (lower = more updates = slower, higher = fewer updates = faster)
function preload() {
	// Initialize shader effects (optional - will work without it)
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.preload(this);
	}
}

function setup() {
	features = $fx.getFeatures();
	executionTimer.start();

	// Canvas setup
	const screenRatio = window.innerWidth / window.innerHeight;
	const baseRatio = BASE_WIDTH / BASE_HEIGHT;
	MULTIPLIER = screenRatio < baseRatio ? window.innerWidth / BASE_WIDTH : window.innerHeight / BASE_HEIGHT;

	// Create main canvas for artwork
	mainCanvas = createGraphics(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER);

	// Create shader canvas (WEBGL) or regular canvas
	if (typeof shaderEffects !== "undefined") {
		shaderCanvas = createCanvas(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER, WEBGL);
		shaderEffects.setup(width, height, mainCanvas, shaderCanvas);
		shaderCanvas.pixelDensity(pixel_density);
	} else {
		createCanvas(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER);
		pixelDensity(pixel_density);
	}

	// Setup main canvas
	mainCanvas.pixelDensity(pixel_density);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	mainCanvas.rectMode(CENTER);
	mainCanvas.angleMode(DEGREES);
	mainCanvas.background(50, 10, 10);

	// Set global color mode
	colorMode(HSB, 360, 100, 100, 100);

	// Use the dimension-agnostic functions
	setPixelRatio(dpi(pixel_density));
	setDimensionAgnostic(DEFAULT_SIZE);

	// Initialize random
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	// Create movers using fixed coordinate system
	for (let i = 0; i < numMovers; i++) {
		const x = random(BASE_WIDTH * 1.1) - BASE_WIDTH * 1.1 * 0.5;
		const y = random(BASE_HEIGHT * 1.1) - BASE_HEIGHT * 1.1 * 0.5;
		movers.push(new Mover(x, y, random(1000), MULTIPLIER));
	}

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: frameCount,
		cycleLength: cycle,
		currentFrame: 0,
		renderItem: (mover, currentFrame) => {
			// Update position and render the mover
			mover.update(currentFrame);
			if (currentFrame > -1) {
				mainCanvas.push();
				mainCanvas.scale(MULTIPLIER);
				mainCanvas.translate(BASE_WIDTH * 0.5, BASE_HEIGHT * 0.5);
				mover.display(mainCanvas);
				mainCanvas.pop();
			}
		},
		moveItem: (mover, currentFrame) => {
			// Draw connections from this mover to subsequent movers
			mainCanvas.push();
			mainCanvas.scale(MULTIPLIER);
			mainCanvas.translate(BASE_WIDTH * 0.5, BASE_HEIGHT * 0.5);

			mainCanvas.stroke(0, 0, 100, 2);
			mainCanvas.strokeWeight(0.5);

			// Get current mover's position
			let pos1 = mover.getPos();

			// Get the index of current mover
			let currentIndex = movers.indexOf(mover);

			// Only draw connections to movers that come after this one
			// This ensures each connection is drawn exactly once
			for (let j = currentIndex + 1; j < movers.length; j++) {
				let pos2 = movers[j].getPos();
				let d = dist(pos1.x, pos1.y, pos2.x, pos2.y);
				if (d < 100) {
					mainCanvas.line(pos1.x, pos1.y, pos2.x, pos2.y);
				}
			}

			mainCanvas.pop();
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			if (typeof shaderEffects !== "undefined") {
				shaderEffects.setParticleAnimationComplete(true);
			}
			$fx.preview();
			document.complete = true;
			console.log("Animation complete!");
		},
	};

	// Create and start the animation
	generator = createAnimationGenerator(animConfig);

	// Start the custom draw loop
	customDraw();
}

// Track sketch completion state
let sketchComplete = false;

// Custom draw loop - advances sketch animation and applies shader effects
function customDraw() {
	// Only advance generator if sketch isn't complete yet
	let result = {done: sketchComplete};
	if (!sketchComplete) {
		result = generator.next();
		if (result.done) {
			sketchComplete = true;
		}
	}

	// Render shader effects for this frame (if shaders are enabled)
	if (typeof shaderEffects !== "undefined") {
		const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);

		// Continue animation if not complete
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		// No shaders - just copy mainCanvas to display canvas
		clear();
		image(mainCanvas, 0, 0);

		// Continue animation if not complete
		if (!result.done) {
			requestAnimationFrame(customDraw);
		}
	}
}
