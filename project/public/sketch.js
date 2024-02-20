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

let angle = 0;

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
}

function draw() {
	background(50, 10, 100);
	push();
	translate(width / 2, height / 2);
	rotate(angle);
	strokeWeight(2);
	stroke(220, 100, 100);
	line(0, 0, 0, height);
	stroke(0, 100, 100);
	line(0, 0, width, 0);

	// write x and y axis
	strokeWeight(0.22);
	stroke(0, 0, 0);
	textSize(10);
	textFont("Arial");
	textStyle(normal);
	textAlign(CENTER, CENTER);
	for (let i = 0; i < width; i += 50) {
		line(i, 0, i, 5);
		text(i, i, 10);
	}

	for (let i = 0; i < height; i += 50) {
		line(0, i, 5, i);
		text(i, 10, i);
	}

	fill(0, 0, 0);
	rect(0, 0, 50, 50);

	angle += 1.1;
	pop();

	ellipse(width / 2, height / 4, 50, 50);
}
