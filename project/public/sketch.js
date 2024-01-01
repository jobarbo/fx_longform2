let features = "";
let dpi_val = 2;
let MARGIN = 200;
let oldMARGIN = MARGIN;
let frameMargin;
let RATIO = 1;
let DEFAULT_SIZE = 4800 / RATIO;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let particleNum = 350000;

let startTime;
let maxFrames = 100;
let frameIterator = 0;
let currentFrame = 0;
let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;
let drawing = true;
let renderMode = 1;
let cycle = parseInt((maxFrames * particleNum) / 500);

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DEFAULT_SIZE = 4800 / RATIO;
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(dpi_val));
	frameMargin = MARGIN * MULTIPLIER;

	rectMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	INIT_MOVERS();
	renderStart = Date.now();
	let sketch = drawGenerator();
	function animate() {
		animation = setTimeout(animate, 0);
		sketch.next();
	}

	animate();
}

function* drawGenerator() {
	let count = 0;
	let frameCount = 0;
	let draw_every = cycle;

	while (true) {
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];
			//if (elapsedTime > 1) {
			mover.show();
			//}

			mover.move();
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = frameCount - startTime;

		//showLoadingBar(elapsedTime, maxFrames, renderStart);

		frameCount++;
		if (elapsedTime > maxFrames && drawing) {
			drawing = false;
			$fx.preview();
			document.complete = true;
			console.log("complete");
			return;
		}
	}
}

function INIT_MOVERS() {
	movers = [];
	scl1 = random(0.001, 0.0015);
	scl2 = random(0.001, 0.0015);
	let hue = random(360);
	for (let i = 0; i < particleNum; i++) {
		let x = random(-0.1, 1.1) * width;
		let y = random(-0.1, 1.1) * height;
		movers.push(new Mover(x, y, hue, scl1 / MULTIPLIER, scl2 / MULTIPLIER));
	}

	background(45, 10, 90);
}
