let features = "";
let movers = [];
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
let ARTWORK_RATIO = 1;
let BASE_WIDTH = 1800;
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
}

function draw() {
	//blendMode(SCREEN);
	for (let i = 0; i < movers.length; i++) {
		//if (frameCount > 1) {
		movers[i].show();
		//}
		movers[i].move();
	}
	//blendMode(BLEND);
	if (frameCount > 150) {
		console.log("done");
		noLoop();
	}
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
	let sclOffset2 = 0.00001;
	let sclOffset3 = 2;

	// Calculate padding based on the reference size and scale it
	let paddingRatio = 0.25; // 10% padding
	let basePadding = DEFAULT_SIZE * paddingRatio; // Use DEFAULT_SIZE as reference
	let padding = basePadding * MULTIPLIER;

	// Calculate bounds in absolute coordinates
	let bounds = {
		left: padding,
		right: width - padding,
		top: padding,
		bottom: height - padding,
	};

	// Convert to relative coordinates
	xMin = bounds.left / width;
	xMax = bounds.right / width;
	yMin = bounds.top / height;
	yMax = bounds.bottom / height;

	let hue = random(360); // Define base hue for particles

	// Scale number of particles based on canvas size
	let baseParticleCount = 300000;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed));
	}

	let bgCol = spectral.mix("#000", "#fff", 0.88);
	background(bgCol);
}
