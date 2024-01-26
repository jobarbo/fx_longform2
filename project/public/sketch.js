let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;
let MARGIN = 0;

let xoff;
let yoff;
let cellSize;

let noiseLevel = 255;
let noiseScale = 0.01;

let bg_img;
function preload() {
	bg_img = loadImage("./assets/art.png");
}

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	//colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(10);

	xoff = random(10000000);
	yoff = random(10000000);

	cellSize = (width - MARGIN * 2) / 128;
	bg_img.resize(width, height);

	//blendMode(LIGHTEST);
	image(bg_img, 0, 0);
	createGrid();
}

function createGrid() {
	for (x = MARGIN; x < width - MARGIN; x += cellSize) {
		for (y = MARGIN; y < height - MARGIN; y += cellSize) {
			/* 			let n_hx = noiseScale * x;
			let n_hy = noiseScale * y;
			let hue = noise(n_hx, n_hy) * 360; */

			let pix = bg_img.get(x, y);

			fill(pix);
			strokeWeight(0);
			rect(x + cellSize / 2, y + cellSize / 2, cellSize, cellSize);
			yoff += 0.001;
		}
		xoff += 0.0000001;
	}
}

function draw() {
	noLoop();
}
