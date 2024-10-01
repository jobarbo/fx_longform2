let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let v_p;
let v_p_pos = {x: 0, y: 0};

let noiseOffsetX = 0; // Initialize noise offset for horizontal movement
let noiseOffsetY = 1000; // Initialize noise offset for vertical movement

function setup() {
	features = $fx.getFeatures();
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);

	background(130, 2, 99);

	// canvas setup
}

function draw() {
	background(130, 2, 99);
	// Create grid
	let gridSpacing = 50; // Adjust spacing as needed
	stroke(234, 21, 54, 30); // Set line color

	// Update offsets using Perlin noise
	let offsetX = noise(noiseOffsetX) * 11210; // Scale the noise for horizontal movement
	let offsetY = noise(noiseOffsetY) * 11210; // Scale the noise for vertical movement
	noiseOffsetX += 0.00015; // Increment noise offset for horizontal
	noiseOffsetY += 0.00015; // Increment noise offset for vertical

	for (let x = -offsetX; x < width + offsetX; x += gridSpacing) {
		line(x, 0, x, height); // Vertical lines
	}
	for (let y = -offsetY; y < height + offsetY; y += gridSpacing) {
		line(0, y, width, y); // Horizontal lines
	}
}
