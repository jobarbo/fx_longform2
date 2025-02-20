let features = "";
let movers = [];
let startTime;
let maxFrames = 20;
let elapsedTime = 0;
let particleNum = 500000;
// Adjust cycle for smoother percentage updates (1% increments)
let cycle = parseInt((maxFrames * particleNum) / 1170);
let executionTimer = new ExecutionTimer(); // Replace executionStartTime with timer instance

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
let ARTWORK_RATIO = 1.41;
let BASE_WIDTH = 948;
let BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;

// This is our reference size for scaling
let DEFAULT_SIZE = BASE_WIDTH;

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);
	c = createCanvas(DIM, DIM * ARTWORK_RATIO);
	pixelDensity(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	INIT(rseed, nseed);

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		currentFrame: 0, // Add current frame tracking
		renderItem: (mover, currentFrame) => {
			if (currentFrame > 0) {
				mover.show();
			}
		},
		moveItem: (mover, currentFrame) => {
			mover.move(currentFrame, maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			$fx.preview();
			document.complete = true;
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(animConfig);
	startAnimation(generator);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(seed);
}

function INIT(rseed, nseed) {
	movers = [];

	// Scale noise values based on MULTIPLIER
	scl1 = 0.002 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.002 / MULTIPLIER;

	let sclOffset1 = 2;
	let sclOffset2 = 0.0001;
	let sclOffset3 = 2;

	// Calculate padding based on the reference size and scale it
	let paddingRatioX = 0.1; // 45% padding for X axis
	let paddingRatioY = 0.1; // 45% padding for Y axis
	let basePaddingX = DEFAULT_SIZE * paddingRatioX;
	let basePaddingY = DEFAULT_SIZE * paddingRatioY;
	let paddingX = basePaddingX * MULTIPLIER;
	let paddingY = basePaddingY * MULTIPLIER;

	// Calculate bounds in absolute coordinates
	let bounds = {
		left: paddingX,
		right: width - paddingX,
		top: paddingY,
		bottom: height - paddingY,
	};

	// Convert to relative coordinates
	xMin = bounds.left / width;
	xMax = bounds.right / width;
	yMin = bounds.top / height;
	yMax = bounds.bottom / height;

	let hue = random(360); // Define base hue for particles

	// Scale number of particles based on canvas size
	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed));
	}

	let bgCol = spectral.mix("#000", "#fff", 0.98);
	background(bgCol);

	// Add subtle organic grid texture
	let gridSizeX = width / 100; // Size of grid cells
	let gridSizeY = width / 100; // Size of grid cells
	let variance = gridSizeX / 4; // Amount of variation for particles
	let g_variance = gridSizeX / 150;
	let noiseScale = 0.05; // Scale of the noise

	// Vertical lines of particles
	for (let x = -gridSizeX; x <= width + gridSizeX; x += gridSizeX) {
		for (let y = -gridSizeY; y <= height + gridSizeY; y += gridSizeY / 20) {
			// More dense particle distribution
			let xPos = x + map(noise(x * noiseScale, y * noiseScale) + randomGaussian(0, g_variance), 0, 1, -variance, variance);
			noStroke();
			fill(0, 0, 0, random(0, 100));
			rect(xPos, y, random(0.15, 0.35) * MULTIPLIER, random(0.15, 0.35) * MULTIPLIER);
		}
	}

	// Horizontal lines of particles
	for (let y = -gridSizeY; y <= height + gridSizeY; y += gridSizeY) {
		for (let x = -gridSizeX; x <= width + gridSizeX; x += gridSizeX / 20) {
			// More dense particle distribution
			let yPos = y + map(noise(x * noiseScale, y * noiseScale) + randomGaussian(0, g_variance), 0, 1, -variance, variance);
			noStroke();
			fill(0, 0, 0, random(0, 100));
			rect(x, yPos, random(0.15, 0.35) * MULTIPLIER, random(0.15, 0.35) * MULTIPLIER);
		}
	}

	// Random noise particles
	/* 	for (let i = 0; i < particleNum; i++) {
		let x = random(width);
		let y = random(height);
		noStroke();
		fill(0, 0, 0, 50);
		rect(x, y, 0.25 * MULTIPLIER, 0.25 * MULTIPLIER);
	} */
}
