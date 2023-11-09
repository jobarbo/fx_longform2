({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

// particles variables setup
let features = '';
let movers = [];
let scl1;
let scl2;
let amp1;
let amp2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let bgCol;
let xRandDivider, yRandDivider;
let hue = Math.random() * 360;

// viewport
let DEFAULT_SIZE = 800;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let startTime;
let maxFrames = 100;

// Easing animation variables
let easeAng = 0,
	easeScalar = 0.001,
	easeScalar2 = 200,
	cycleCount = 0,
	xi = 0,
	yi = 0,
	xoff,
	yoff,
	axoff,
	ayoff,
	sxoff,
	syoff;

// render time
let elapsedTime = 0;
let particleNum = 300;
let drawing = true;
let cycle = (maxFrames * particleNum) / 2;

function setup() {
	features = $fx.getFeatures();

	pixelDensity(dpi());

	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	xRandDivider = random([0.08]);
	yRandDivider = xRandDivider;
	xoff = fxrand() * 1000000;
	yoff = fxrand() * 1000000;
	axoff = fxrand() * 1000000;
	ayoff = fxrand() * 1000000;
	sxoff = fxrand() * 1000000;
	syoff = fxrand() * 1000000;
	scl1 = 0.0018;
	scl2 = 0.0018;

	amp1 = 1200;
	amp2 = 1200;

	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;

	bgCol = color(random(0, 360), 0, 10, 100);
	background(bgCol);

	INIT(rseed);

	// use requestAnimationFrame to call the generator function and pass it the sketch function
	let sketch = drawGenerator();
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
		blendMode(ADD);
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];
			if (elapsedTime > 1) {
				movers[i].show();
			}
			mover.move();
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}
		blendMode(BLEND);

		elapsedTime = frameCount - startTime;
		frameCount++;

		if (frameCount % maxFrames == 0) {
			let cosIndex = cos(radians(easeAng));
			if (cosIndex >= 1) {
				cycleCount += 1;
			}
			if (cycleCount < 1) {
				movers = [];
				//saveArtwork();
				elapsedTime = 0;
				frameCount = 0;
				INIT(rseed);
			} else {
				if (elapsedTime > maxFrames && drawing) {
					drawing = false;
					// close the generator
					return;
				}
			}
		}
	}
}

function INIT(seed) {
	bgCol = color(0, 0, 10, 50);
	background(bgCol);
	let easing = radians(easeAng);

	scl1 = mapValue(cos(easing), -1, 1, 0.0022, 0.0007, true);
	scl2 = mapValue(cos(easing), -1, 1, 0.0007, 0.0022, true);

	angle1 = parseInt(mapValue(cos(easing), -1, 1, 500, 1600, true));
	angle2 = parseInt(mapValue(cos(easing), -1, 1, 1600, 500, true));

	/* 	xi += map(noise(xoff), 0, 0.9, -1 * MULTIPLIER, 1 * MULTIPLIER, true);
	yi += map(noise(yoff), 0, 0.9, -1 * MULTIPLIER, 1 * MULTIPLIER, true); */

	easeAng += 0.12;
	xoff += 0.001;
	yoff += 0.001;
	axoff += 0.0025;
	ayoff += 0.0025;
	sxoff += 0.007;
	syoff += 0.007;
	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01;

	for (let i = 0; i < particleNum; i++) {
		let x = fxrand() * (xMax - xMin) * width;
		let y = fxrand() * (yMax - yMin) * height;
		let initHue = hue + fxrand() * 2 - 1;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				xi,
				yi,
				initHue,
				scl1 / MULTIPLIER,
				scl2 / MULTIPLIER,
				angle1 * MULTIPLIER,
				angle2 * MULTIPLIER,
				xMin,
				xMax,
				yMin,
				yMax,
				xRandDivider,
				yRandDivider,
				seed,
				features
			)
		);
	}
}
