let features = "";

let maxDPI = 3;
let RATIO = 1.41;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let v_p;
let v_p_pos = {x: 0, y: 0};

let relativeX = 0;
let relativeY = 0;

let noiseX = 0;
let noiseY = 0;

let nx_offset = 0;
let ny_offset = 0;
function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 5, 5);

	relativeX = 0;
	relativeY = 0 + height / 4;
	nx_offset = random(10000);
	ny_offset = random(10000);
}

function draw() {
	// Create clipping mask
	push();
	// Draw the same rectangle but with no stroke to use as a mask
	stroke(50, 5, 5);
	let borderRadius = 70;
	let strokeWidth = 100;
	strokeWeight(strokeWidth);
	noFill();
	rect(width / 2, height / 2, width, height, borderRadius);

	// Draw card border
	stroke(0, 0, 100);
	strokeWeight(2);
	noFill();
	rect(width / 2, height / 2, width * 0.89, height * 0.92, 20);

	// Draw the top half
	drawTopHalf();

	// Draw the mirrored bottom half
	push();
	translate(width / 2, height / 2);
	scale(1, -1); // Flip vertically
	translate(-width / 2, -height / 2);
	drawTopHalf();
	pop();

	pop(); // End clipping mask
}

function drawTopHalf() {
	// Only draw in the top half of the canvas
	push();
	translate(width / 2, height / 4); // Position at quarter height

	// Example elements - only in top half
	fill(200, 80, 80);
	stroke(200, random(20, 80), 100);
	strokeWeight(2);

	// Calculate mouse position relative to the translation

	circle(relativeX, relativeY, width * 0.1);

	nx_offset += 0.01;
	ny_offset += 0.025;

	let nx = noise(nx_offset);
	let ny = noise(ny_offset);

	ux = map(nx, 0, 0.95, -2, 2);
	uy = map(ny, 0, 0.95, -13, 13);

	relativeX += ux;
	relativeY += uy;

	// Add more elements here that will be mirrored
	pop();
}
