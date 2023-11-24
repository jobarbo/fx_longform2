//new Q5('global');
console.log(fxhash);

let features;
let fxfeatures;
let dpi_val = 1;

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
// if url params has ratio, use that, else use 3
let MARGIN;
let ratio = 3;
if (window.location.search.includes('ratio')) {
	if (window.location.search.includes('ratio=a4')) {
		ratio = 1.41;
	} else if (window.location.search.includes('ratio=skate')) {
		ratio = 3.666;
		MARGIN = 0;
	} else if (window.location.search.includes('ratio=landscape')) {
		ratio = 0.6;
		MARGIN = window.innerWidth / 13;
	} else {
		ratio = parseInt(window.location.search.split('ratio=')[1]);
		MARGIN = width / 7;
	}
}

if (window.location.search.includes('dpi')) {
	dpi_val = parseInt(window.location.search.split('dpi=')[1]);
}

let DEFAULT_SIZE = 4800 / (ratio + 1);
console.log(DEFAULT_SIZE);
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
let cycle = parseInt((maxFrames * particleNum) / 170);

let hue;
let bgCol;

function setup() {
	fxfeatures = $fx.getFeatures();
	features = window.features;
	console.log(features);
	console.log(fxfeatures);
	console.time('setup');
	pixelDensity(dpi(dpi_val));
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * ratio);

	/*
		window.addEventListener('resize', onResize);
		onResize();
		*/

	rectMode(CENTER);
	randomSeed(seed);
	noiseSeed(seed);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;

	hue = parseInt(fxrand() * 360);
	bgCol = color(hue, random([0, 2, 5]), features.theme == 'bright' ? 93 : 10, 100);
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
			$fx.preview();
			document.complete = true;
			console.timeEnd('setup');
			return;
		}
	}
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	background(bgCol);

	drawTexture(hue);
	movers = [];
	sclVal = features.scalevalue.split(',').map(Number);

	scl1 = random(sclVal[0], sclVal[1]);
	scl2 = random(sclVal[0], sclVal[1]);
	let ang1Max = Math.floor(map(scl1, 0.0001, 0.0008, 16000, 150, true));
	let ang2Max = Math.floor(map(scl2, 0.0001, 0.0008, 16000, 150, true));
	ang1rnd = Math.floor(fxrand() * ang1Max);
	ang2rnd = Math.floor(fxrand() * ang2Max);
	// get the smallest value from both randoms
	let smallest = Math.min(ang1rnd, ang2rnd);
	ang1 = smallest;
	ang2 = smallest;

	/* 	scl1 = random(0.0003, 0.006) / ratio;
	scl2 = random(0.0003, 0.006) / ratio;

	ang1 = Math.floor(fxrand() * 1000 * (ratio / 2));
	ang2 = Math.floor(fxrand() * 1000 * (ratio / 2)); */

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	// convert the margin to a percentage of the width
	xMarg = MARGIN / width;
	yMarg = MARGIN / height;

	xMin = xMarg;
	xMax = 1 - xMarg;
	yMin = yMarg;
	yMax = 1 - yMarg;

	for (let i = 0; i < particleNum; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue;
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

	for (let i = 0; i < 280000; i++) {
		let x = fxrand() * width;
		let y = fxrand() * height;
		let sw = 0.75 * MULTIPLIER;
		let h = hue + fxrand() * 2 - 1;
		let s = features.colormode != 'monochrome' ? [0, 20, 40, 60, 80, 100][parseInt(fxrand() * 6)] : 0;
		let b = [0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100][parseInt(fxrand() * 11)];
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
	let uiSat = features.colormode == 'monochrome' ? 0 : 25;
	let uiColor =
		features.theme == 'bright' ? `hsla(${hue}, ${uiSat}%, 70%, 100%)` : `hsla(${hue}, ${uiSat}%, 40%, 100%)`;

	drawingContext.strokeStyle = uiColor;
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
