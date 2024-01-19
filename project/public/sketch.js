// log the parameters, for debugging purposes, artists won't have to do that
//console.log('Current param values:');

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
//console.log($fx.getParams());

// particles variables setup
let features = "";
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
let DEFAULT_SIZE = 800;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let startTime;
let maxFrames = 50;
// Easing animation variables
let animationFrameId;
let easeAng = 0,
	easeScalar = 0.26,
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
let particleNum = 250;
let drawing = true;
let cycle = (maxFrames * particleNum) / 1;

function setup() {
	features = $fx.getFeatures();

	pixelDensity(dpi(1));

	DIM = min(W, H);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.4);
	rectMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);

	document.querySelector("canvas").classList.add("load");

	INIT();
}

function INIT(seed) {
	startTime = frameCount;

	// if there is an animation running, cancel it

	randomSeed(fxrand() * 1000000);
	noiseSeed(fxrand() * 1000000);

	bgCol = color(329, 98, 35, 100);

	xMin = -0.1;
	xMax = 1.1;
	yMin = -0.1;
	yMax = 1.1;

	borderXMin = -0.1;
	borderXMax = 1.1;
	borderYMin = -0.1;
	borderYMax = 1.1;

	xMinW = xMin * width;
	xMaxW = xMax * width;
	yMinH = yMin * height;
	yMaxH = yMax * height;
	const numEdges = 4; // Number of edges
	let particlesPerEdge = Math.floor(particleNum / numEdges); // Calculate particles per edge

	const edgeOffset = -5; // Adjust this value to position particles exactly on the edge or outside it

	for (let edge = 0; edge < numEdges; edge++) {
		if (edge === numEdges - 1) {
			particlesPerEdge += particleNum % numEdges; // Distribute remaining particles
		}

		switch (edge) {
			case 0: // Distribute particles along the top edge
				for (let i = 0; i < particlesPerEdge; i++) {
					let x = map(i, 0, particlesPerEdge - 1, xMinW - edgeOffset, xMaxW + edgeOffset);
					let y = yMinH - edgeOffset;
					movers_pos.push({x, y});
				}
				break;
			case 1: // Distribute particles along the bottom edge
				for (let i = 0; i < particlesPerEdge; i++) {
					let x = map(i, 0, particlesPerEdge - 1, xMinW - edgeOffset, xMaxW + edgeOffset);
					let y = yMaxH + edgeOffset;
					movers_pos.push({x, y});
				}
				break;
			case 2: // Distribute particles along the left edge
				for (let i = 0; i < particlesPerEdge; i++) {
					let x = xMinW - edgeOffset;
					let y = map(i, 0, particlesPerEdge - 1, yMinH - edgeOffset, yMaxH + edgeOffset);
					movers_pos.push({x, y});
				}
				break;
			case 3: // Distribute particles along the right edge
				for (let i = 0; i < particlesPerEdge; i++) {
					let x = xMaxW + edgeOffset;
					let y = map(i, 0, particlesPerEdge - 1, yMinH - edgeOffset, yMaxH + edgeOffset);
					movers_pos.push({x, y});
				}
				break;
		}
	}
	FRAME(seed);
	animationManager();
}

function FRAME(seed) {
	//	bgCol = color(355, 10, 95, 60);

	let easing = radians(easeAng);

	scl1 = mapValue(cos(easing), -1, 1, 0.00071, 0.0025, true);
	scl2 = mapValue(cos(easing), -1, 1, 0.0025, 0.00071, true);
	amplitude1 = parseInt(mapValue(cos(easing), -1, 1, 1200, 1, true));
	amplitude2 = parseInt(mapValue(cos(easing), -1, 1, 1, 1200, true));
	xRandDivider = random([0.025]);
	yRandDivider = random([0.025]);

	/* 	xi += mapValue(oct(xoff, yoff, 1, 6), 0, 1, -2 * MULTIPLIER, 2 * MULTIPLIER, true);
	yi += mapValue(oct(yoff, xoff, 3, 6), 0, 1, -2 * MULTIPLIER, 2 * MULTIPLIER, true); */
	/* 	scl1 += mapValue(oct(sxoff, syoff, scl1, 1), 0, 1, -0.00001 * MULTIPLIER, 0.00001 * MULTIPLIER, true);
	scl2 += mapValue(oct(syoff, sxoff, scl2, 1), 0, 1, -0.00001 * MULTIPLIER, 0.00001 * MULTIPLIER, true); */

	easeAng += easeScalar;
	xoff += 0.000001;
	yoff += 0.000001;
	axoff += 0.00025;
	ayoff += 0.00025;
	sxoff += 0.00025;
	syoff += 0.00025;

	for (let i = 0; i < particleNum; i++) {
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
				maxFrames,
				features
			)
		);
	}
}

function animationManager() {
	let maxFps = 0;
	let minFps = 1000;
	// use requestAnimationFrame to call the generator function and pass it the sketch function
	let sketch = drawGenerator();
	function animate() {
		background(bgCol);
		// calculate frame rate
		let fps = frameRate();

		if (fps > maxFps) {
			maxFps = fps;
		}
		if (fps < minFps) {
			// wait 100 frames before setting the minFps to the current fps
			if (elapsedTime > 1) {
				minFps = fps;
			}
		}
		fill(255);
		stroke(0);
		textSize(30);
		text("FPS: " + fps.toFixed(2), 10, height - 10);
		text("Max FPS: " + maxFps.toFixed(2), 10, height - 50);
		text("Min FPS: " + minFps.toFixed(2), 10, height - 90);

		if (sketch.next().done) {
			cancelAnimationFrame(animationFrameId);
			for (let i = 0; i < particleNum; i++) {
				const mover = movers[i];
				mover.show();
			}
			drawing = false;
			return;
		}

		animationFrameId = requestAnimationFrame(animate);

		//blendMode(BLEND);
	}

	if (drawing && cycleCount < 1) {
		animate();
	}
}

function* drawGenerator() {
	let count = 0;
	let frameCount = 0;
	let draw_every = cycle;

	// draw the particles and make them move until draw_every is reached then yield and wait for the next frame, also check if the maxFrames is reached and stop the sketch if it is and also show the loading bar
	while (true) {
		if (elapsedTime >= maxFrames && drawing) {
			//blendMode(BLEND);
			drawing = false;
			// close the generator
			return;
		}
		//blendMode(ADD);
		for (let i = 0; i < particleNum; i++) {
			if (count > draw_every && drawing) {
				count = 0;
				yield;
			}
			const mover = movers[i];
			if (drawing) {
				mover.show();
				mover.move();
			}

			count++;
		}

		elapsedTime = frameCount - startTime;
		frameCount++;

		if (frameCount % maxFrames == 0) {
			let cosIndex = cos(radians(easeAng));

			// when a full cycle is reached, add a cycle to the cycleCount
			if (cosIndex >= 1) {
				cycleCount++;
			}
			//if (cycleCount < 1) {
			movers = [];
			//saveArtwork();
			elapsedTime = 0;
			frameCount = 0;
			FRAME(rseed);
			//}
		}
	}
}
