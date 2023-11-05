let movers = [];
let scl1;
let scl2;
let ang1;
let ang2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
let maxFrames = 10;
let frameIterator = 0;
let currentFrame = 0;

// viewport
let DEFAULT_SIZE = 1600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

// render time
let elapsedTime = 0;
let particleNum = 800000;
//let particleNum = 400000;
let drawing = true;
let renderMode = 1;
let cycle = (maxFrames * particleNum) / 170;

function setup() {
	console.time('setup');
	pixelDensity(dpi(3));
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 3);

	/*
		window.addEventListener('resize', onResize);
		onResize();
		*/

	rectMode(CENTER);
	randomSeed(seed);
	noiseSeed(seed);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	console.log(cycle);
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
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];
			mover.show();
			mover.move();
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = frameCount - startTime;
		showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax);

		frameCount++;

		if (elapsedTime > maxFrames && drawing) {
			drawing = false;
			drawUI();
			// close the generator
			console.timeEnd('setup');
			return;
		}
	}
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	console.log('INIT');
	let hue = random(360);
	let bgCol = color(random(0, 360), random([0, 2, 5]), 95, 100);

	background(bgCol);

	drawTexture(hue);
	movers = [];
	scl1 = random(0.0001, 0.002);
	scl2 = random(0.0001, 0.002);
	ang1 = Math.floor(fxrand() * 10);
	ang2 = Math.floor(fxrand() * 10);

	console.log(ang1, ang2);

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	xMin = 0.15;
	xMax = 0.85;
	yMin = 0.06;
	yMax = 0.94;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	for (let i = 0; i < particleNum; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue + random(-1, 1);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				initHue,
				scl1 / MULTIPLIER,
				scl2 / MULTIPLIER,
				ang1 * MULTIPLIER,
				ang2 * MULTIPLIER,
				xMin,
				xMax,
				yMin,
				yMax,
				xRandDivider,
				yRandDivider
			)
		);
	}
}

function drawTexture(hue) {
	// draw 200000 small rects to create a texture
	console.log('drawTexture');
	for (let i = 0; i < 600000; i++) {
		let x = fxrand() * width;
		let y = fxrand() * height;
		let sw = 0.45 * MULTIPLIER;
		let h = hue + fxrand() * 2 - 1;
		let s = [0, 20, 40, 60, 80, 100][int(fxrand() * 6)];
		let b = [0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100][int(fxrand() * 11)];
		drawingContext.fillStyle = `hsla(${h}, ${s}%, ${b}%, 100%)`;
		drawingContext.fillRect(x, y, sw, sw);
	}
}

function showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax) {
	let percent = (elapsedTime / maxFrames) * 100;
	if (percent > 100) percent = 100;

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + '%' + ' (mode ' + renderMode + ')';
}

function drawUI() {
	// Define the stroke color and weight (line width)
	drawingContext.strokeStyle = 'hsla(0, 0%, 0%, 100%)';
	drawingContext.lineWidth = 3 * MULTIPLIER;
	drawingContext.beginPath();

	drawingContext.moveTo(xMin * width, yMin * height);
	drawingContext.lineTo(xMax * width, yMin * height);

	drawingContext.moveTo(xMin * width, yMax * height);
	drawingContext.lineTo(xMax * width, yMax * height);

	drawingContext.moveTo(xMin * width, yMin * height);
	drawingContext.lineTo(xMin * width, yMax * height);

	drawingContext.moveTo(xMax * width, yMin * height);
	drawingContext.lineTo(xMax * width, yMax * height);

	// Stroke the lines
	drawingContext.stroke();
}
