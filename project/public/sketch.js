let features = "";
let movers = [];
let scl1;
let scl2;
let rseed;
let nseed;
let startTime;
let frameIterator = 0;
let currentFrame = 0;

//let maxFrames = 20;
let maxFrames = 64;
//let maxFrames = 64 * 120;
//let particleNum = 800000;
let particleNum = 100000;
//let particleNum = 2250;

// viewport
let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let elapsedTime = 0;
let drawing = true;
let renderMode = 1;
let cycle = (maxFrames * particleNum) / 1000;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	pixelDensity(dpi(2));
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM * 1.4, DIM);
	colorMode(HSB, 360, 100, 100, 100);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	INIT();
	let sketch = drawGenerator();

	// use requestAnimationFrame to call the generator function and pass it the sketch function
	function animate() {
		//requestAnimationFrame(animate);
		setTimeout(animate, 0);
		sketch.next();
	}
	animate();
}

function* drawGenerator() {
	let count = 0;
	let frameCount = 0;
	let draw_every = cycle;

	// draw the particles and make them move until draw_every is reached then yield and wait for the next frame, also check if the maxFrames is reached and stop the sketch if it is and also show the loading bar
	while (true) {
		for (let i = 0; i < movers.length; i++) {
			const mover = movers[i];
			if (frameCount > 1) {
				mover.show();
			}
			mover.move();
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = frameCount - startTime;
		//showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax);
		//drawUI();

		frameCount++;

		if (elapsedTime > maxFrames && drawing) {
			drawing = false;
			// close the generator
			console.timeEnd("setup");
			return;
		}
	}
}
/* function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(rseed);
} */

function INIT() {
	movers = [];
	scl1 = random(0.003, 0.007);
	scl2 = random(0.003, 0.007);
	let hue = random(360);
	let y = random(height / 1.5, height / 3);
	let x = -400;

	let top_y = 1;
	let bottom_y = height / 3;
	for (let j = 0; j < 5; j++) {
		seed = random(10000);
		noiseDetail(5 - j, 0.5);
		for (let i = 0; i < particleNum; i++) {
			// make x iterate from 0 to width with a step of 20 pixels
			x = random(-400, width + 400);
			// make y start at height/2 but every other steps it's position is affected by noise

			y = map(noise(x * (width / (particleNum * (5 + j))), seed), 0, 1, top_y, bottom_y, true);

			movers.push(new Mover(x, y, hue, scl1, scl2, seed, j));
		}
		top_y += height / (7 - j);
		bottom_y += height / (7 - j);
		console.log(top_y, bottom_y);
	}
	let bgCol = spectral.mix("#fff", "#D79900", 0.038);
	background(bgCol);
}
