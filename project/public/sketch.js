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

let v_p;
let v_p_pos = {x: 0, y: 0};
let x_pos = 0.5;
let y_pos = 0.5;
let r_w = 10;
let s_w = 1;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 10, 10);

	x_pos = width / 2;
	y_pos = height / 2;
	r_w = 50 * MULTIPLIER;
	console.log(r_w);
	s_w = 1 * MULTIPLIER;

	x_offset = random(1000);
	y_offset = random(1000);
}

function draw() {
	translate(width / 2, height / 2);
	for (let i = 0; i < 1000; i++) {
		x_pos = 100 * noise((1.5 * i) / 10) * MULTIPLIER;
		y_pos = 100 * noise((1.5 * i) / 10 + 1) * MULTIPLIER;
		strokeWeight(s_w);
		fill(0, 0, 100, 100);
		rect(x_pos, y_pos, r_w, r_w);
		x_offset += 10.1;
	}
	noLoop();
}
