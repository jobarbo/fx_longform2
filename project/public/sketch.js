let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let graphicsArray = [];
let cols = 4;
let rows = 4;
let cellSize = 350;
let angleArray = [0, 90, 180, 270];
let configNum = 10;
let angle = 0;
let margin = 0;
let time = 0;
let scale = 10;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	//imageMode(CENTER)
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	angleMode(DEGREES);
	//rectMode(CENTER);

	console.log(DIM);
	margin = 0;
	cellSize = (width - margin * 2) / 100;
	cols = int((width - margin) / cellSize);
	rows = int((height - margin) / cellSize);
	let cellNum = cols * rows;
	console.log(cellSize);

	scale = cellSize / 2;
}

function draw() {
	background(40, 10, 100);

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			let x = (width - cols * cellSize) / 2 + i * cellSize;
			let y = (height - rows * cellSize) / 2 + j * cellSize;
			let w0 = wobbly(x * scale, y * scale, time);
			let w1 = wobbly(x * scale, (y + 0.5) * scale, time);
			stroke(0);
			strokeWeight(1);
			noFill();
			//rect(x, y, cellSize, cellSize);
			// draw an ellipse at the center of each cell
			fill(0);
			noStroke();
			ellipse(x + cellSize / 2, y + cellSize / 2, w0, w0);
			noFill();
			stroke(40, 10, 100);
			strokeWeight(1);
			ellipse(x + cellSize / 2, y + cellSize / 2, w1, w1);
		}
	}
	time += 10.5; // Increment time for animation
}

function wobbly(x, y, t) {
	let w0 = sin(10.3 * x + 1.4 * t + 2.0 + 112.5 * sin(0.4 * y + -1.3 * t + 1.0));
	let w1 = sin(10.2 * y + 1.5 * t + 2.8 + 111.3 * sin(0.5 * x + -1.2 * t + 0.5));
	return (w0 + w1 + 2) * 1 * scale;
}
