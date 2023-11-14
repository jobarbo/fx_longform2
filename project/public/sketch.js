({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

// particles variables setup
let features = '';
let movers = [];
let movers_pos = [];
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
let hue = fxrand() * 360;

// viewport
let DEFAULT_SIZE = 600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let startTime;
let maxFrames = 40;

// Easing animation variables
let easeAng = 0,
	easeScalar = 0.5,
	cycleCount = 0,
	xi = 0,
	yi = 0,
	xoff = fxrand() * 1000000,
	yoff = fxrand() * 1000000,
	axoff = fxrand() * 1000000,
	ayoff = fxrand() * 1000000,
	sxoff = fxrand() * 1000000,
	syoff = fxrand() * 1000000;

// render time
let elapsedTime = 0;
let particleNum = 1120;
let drawing = true;
let cycle = (maxFrames * particleNum) / 1.0001;

function setup() {
	features = $fx.getFeatures();

	pixelDensity(dpi(3));

	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.4);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	xRandDivider = random([0.01]);
	yRandDivider = random([0.01]);

	amp1 = 1200;
	amp2 = 1200;
	scl1 = 0.0001;
	scl2 = 0.0001;

	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;

	bgCol = color(355, 10, 0, 100);
	background(bgCol);

	xMin = -0.1;
	xMax = 1.1;
	yMin = -0.1;
	yMax = 1.1;

	borderXMin = -0.1;
	borderXMax = 1.1;
	borderYMin = -0.1;
	borderYMax = 1.1;

	/* 	xMin = -0.1;
	xMax = 0.1;
	yMin = -0.1;
	yMax = 0.1; */

	xMinW = xMin * width;
	xMaxW = xMax * width;
	yMinH = yMin * height;
	yMaxH = yMax * height;
	for (let i = 0; i < particleNum; i++) {
		//distribute the x and y values of the particles randomly inside the xMin, xMax, yMin, yMax range
		let x = fxrand() * (xMaxW - xMinW) + xMinW;
		let y = fxrand() * (yMaxH - yMinH) + yMinH;

		/* 		let x = random([random(xMinW + 30, xMinW + 10), random(xMaxW + 10, xMaxW + 30)]);
		let y = random(height); */

		// push to movers arra
		movers_pos.push({x, y});
	}

	INIT(rseed);

	// use requestAnimationFrame to call the generator function and pass it the sketch function
	let sketch = drawGenerator();
	function animate() {
		requestAnimationFrame(animate);

		//setTimeout(animate, 0);
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
			//if (elapsedTime > 1) {
			movers[i].show();
			//}
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
			if (cycleCount < 10) {
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
	bgCol = color(0, 0, 0, 100);
	//	bgCol = color(355, 10, 95, 60);
	background(bgCol);
	let easing = radians(easeAng);

	scl1 = mapValue(cos(easing), -1, 1, 0.0022, 0.0007, true);
	scl2 = mapValue(cos(easing), -1, 1, 0.0007, 0.0022, true);
	amplitude1 = parseInt(mapValue(cos(easing), -1, 1, 1, 1600, true));
	amplitude2 = parseInt(mapValue(cos(easing), -1, 1, 1600, 1, true));

	/* 	scl1 = mapValue(sin(easing), -1, 1, 1, 0.00001, true);
	scl2 = mapValue(sin(easing), -1, 1, 0.00001, 0.01, true);

	amplitude1 = parseInt(mapValue(sin(easing), -1, 1, 1, 1, true));
	amplitude2 = parseInt(mapValue(sin(easing), -1, 1, 1, 1, true)); */

	xi += mapValue(oct(xoff, yoff, scl1, 1), 0, 1, -1 * MULTIPLIER, 1 * MULTIPLIER, true);
	yi += mapValue(oct(yoff, xoff, scl2, 1), 0, 1, -1 * MULTIPLIER, 1 * MULTIPLIER, true);
	/* 	scl1 += mapValue(oct(sxoff, syoff, scl1, 1), 0, 1, -0.00001 * MULTIPLIER, 0.00001 * MULTIPLIER, true);
	scl2 += mapValue(oct(syoff, sxoff, scl2, 1), 0, 1, -0.00001 * MULTIPLIER, 0.00001 * MULTIPLIER, true); */

	easeAng += easeScalar;
	xoff += 0.0001;
	yoff += 0.0001;
	axoff += 0.00025;
	ayoff += 0.00025;
	sxoff += 0.00025;
	syoff += 0.00025;

	for (let i = 0; i < particleNum; i++) {
		/* 		let x = (fxrand() * (xMax - xMin) + xMin) * width;
		let y = (fxrand() * (yMax - yMin) + yMin) * height; */
		/* 		let x = random([random(xMinW - 30, xMinW - 10), random(xMaxW + 10, xMaxW + 30)]);
		let y = random(height); */
		let x = movers_pos[i].x;
		let y = movers_pos[i].y;
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
				amplitude1 * MULTIPLIER,
				amplitude2 * MULTIPLIER,
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
