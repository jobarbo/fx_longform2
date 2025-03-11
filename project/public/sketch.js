let features = "";

let DEFAULT_SIZE = 2600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let frameCount = 0;
function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.41);
	pixelDensity(2);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	let seed = fxrand() * 10000;
	INIT(seed);
}

function draw() {
	blendMode(ADD);
	for (let i = 0; i < movers.length; i++) {
		for (let t = 0; t < 1; t++) {
			movers[i].show();
			movers[i].move();
		}
	}

	if (frameCount > 100) {
		noLoop();
	}

	frameCount++;

	exporting = true;
	if (!exporting && bleed > 0) {
		stroke(0, 100, 100);
		noFill();
		strokeWeight(10);
		rect(bleed, bleed, trimWidth, trimHeight);
	}
}

function INIT(seed) {
	movers = [];
	scl1 = random(0.001, 0.001);
	scl2 = random(0.001, 0.001);
	a1 = int(random(777, 1100) * MULTIPLIER);
	a2 = int(random(777, 1100) * MULTIPLIER);
	let hue = random(360);
	for (let i = 0; i < 100000; i++) {
		let x = random(-0.1, 1.1) * width;
		let y = random(-0.1, 1.1) * height;
		movers.push(new Mover(x, y, hue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, a1, a2, seed));
	}

	background(30, 5, 5);
}
