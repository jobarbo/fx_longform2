let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	imageMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);

	background(204, 82, 76);

	drawSun();

	drawWave();
}

function drawSun() {
	// make a p5 graphics object that will draw the sun and then mask it with a circle
	let sw = random([width / 2, width / 2.5, width / 3, width / 3.5]);
	let cnv = createGraphics(sw, sw);
	cnv.colorMode(HSB, 360, 100, 100, 100);
	cnv.noStroke();
	cnv.circle(cnv.width / 2, cnv.height / 2, cnv.width / 1.1);
	cnv.canvas.getContext("2d").clip();
	cnv.background(48, 95, 95);
	h = 20;
	s = 20;
	b = 100;
	vary = 10;
	/* 	for (n = 0; n < 70000; n++) {
		let i = randomGaussian(cnv.width / 2, cnv.width / 6);
		let j = randomGaussian(cnv.height / 2, cnv.height / 6);
		cnv.fill(randomGaussian(h, vary), s + randomGaussian(h, vary), b + randomGaussian(h, vary), 30);
		cnv.circle(i, j, cnv.width / random([300, 400, 500]));
	} */
	image(cnv, width / random([1.5, 2, 2.5, 3, 3.5]), height / 3);
	// make a mask
}

function drawWave() {
	// make a series of wavy lines, even is red, odd is white. Use noise the make the waves
	let xOff = 10;
	let ln = 40;
	let ly = height / 3;
	let sw = 40;
	let ns = 120;
	strokeWeight(sw);
	noFill();
	strokeCap(SQUARE);
	for (let i = 0; i <= ln; i += 1) {
		if (i % 2 != 0) {
			stroke(204, 82, 76);
		} else {
			stroke(40, 10, 100);
		}
		beginShape();
		ly += sw * random(0.2, 0.6);
		for (j = -180; j <= width + 500; j += 180) {
			curveVertex(j, ly + noise(xOff, j) * ns);
			ns -= 0.21;
			xOff += 0.006;
		}
		endShape();
	}
}
