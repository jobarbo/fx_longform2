let features = "";
let movers = [];
let startTime;
let maxFrames = 20;
let frameIterator = 0;
let currentFrame = 0;

let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;
let particleNum = 250000;
let drawing = true;
let renderMode = 1;
let cycle = parseInt((maxFrames * particleNum) / 1170);

let DEFAULT_SIZE = 2600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let frameCount = 0;
function setup() {
	console.log(features);
	features = $fx.getFeatures();
	elapsedTime = 0;
	framesRendered = 0;
	startTime = frameCount;
	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.41);
	pixelDensity(2);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	INIT();

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
	let looptime = 0;
	while (true) {
		blendMode(SCREEN);
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];

			mover.show();
			mover.move(elapsedTime, maxFrames);
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = frameCount - startTime;

		showLoadingBar(elapsedTime, maxFrames, renderStart);

		frameCount++;
		if (elapsedTime > maxFrames && drawing) {
			drawing = false;
			$fx.preview();
			document.complete = true;
			return;
		}
	}
}

function INIT(seed) {
	movers = [];
	scl1 = random(0.00075, 0.0025);
	scl2 = random(0.00075, 0.0025);
	a1 = int(random(1, 2000) * MULTIPLIER);
	a2 = int(random(1, 2000) * MULTIPLIER);
	let hue = random(360);
	for (let i = 0; i < particleNum; i++) {
		let x = random(-0.1, 1.1) * width;
		let y = random(-0.1, 1.1) * height;
		movers.push(new Mover(x, y, hue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, a1, a2, seed));
	}

	background(30, 5, 5);
}

function showLoadingBar(elapsedTime, maxFrames, renderStart) {
	framesRendered++;
	let currentTime = Date.now();
	totalElapsedTime = currentTime - renderStart;

	let percent = (elapsedTime / maxFrames) * 100;
	if (percent > 100) percent = 100;

	let averageFrameTime = totalElapsedTime / framesRendered;

	let remainingFrames = maxFrames - framesRendered;

	let estimatedTimeRemaining = averageFrameTime * remainingFrames;

	// Convert milliseconds to seconds
	let timeLeftSec = Math.round(estimatedTimeRemaining / 1000);

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + "% - Time left : " + timeLeftSec + "s";
}
