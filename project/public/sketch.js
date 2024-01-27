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

let baseHue = 190;
let baseSat = 5;
let baseBri = 100;
let h_iteration = 100;

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
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(190, 30, 90);
	stroke(0, 0, 0);
	strokeWeight(4);
	generateSun();
	generateMountain();
}

function generateSun() {
	let sun_w = random([200, 240, 280, 320]);
	let sun_pos = {x: random(sun_w / 2, width - sun_w), y: random(sun_w, height / 2.25 - sun_w)};
	fill(40, 50, 100);
	ellipse(sun_pos.x, sun_pos.y, sun_w, sun_w);
}

function generateMountain() {
	for (n = height / 2; n < height + 200; n += 20) {
		baseHue += random(-4, 3);
		baseSat += random(-1, 8);
		baseBri += random(-5, 1);

		fill(baseHue, baseSat, baseBri);
		beginShape();
		curveVertex(-200, n);
		for (i = -200; i < width + 200; i += width / 20) {
			var d = dist(i, n, width / 2, n);
			curveVertex(i, n - noise(n + i * 0.08) * (width / 2 - d));
		}
		curveVertex(width + 1200, n);
		curveVertex(width + 1200, n);
		endShape();
	}
}
