let movers = [];
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
//let maxFrames = 64 * 500000;
let maxFrames = 64 * 32;
let frameIterator = 0;
let currentFrame = 0;
let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let elapsedTime = 0;
let particleNum = 10250;
let drawing = true;
let bgCol;
let renderMode = 1;

let scl1, scl2, ang1, ang2, scl1Zone, scl2Zone, ang1Zone, ang2Zone;

function setup() {
	console.time('setup');
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(3.0);
	}
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM);

	/*
		window.addEventListener('resize', onResize);
		onResize();
		*/

	rectMode(CENTER);
	randomSeed(seed);
	noiseSeed(seed);
	colorMode(HSB, 360, 100, 100, 100);

	frameIterator = maxFrames / maxFrames;
	scl1 = fxrand() * (0.0022 - 0.002) + 0.002;
	scl2 = fxrand() * (0.0022 - 0.002) + 0.002;
	ang1 = parseInt(fxrand() * (500, 1200) + 500);
	ang2 = parseInt(fxrand() * (1000, 1200) + 1000);

	// change how drastically it changes with the SDF
	scl1Zone = 600;
	scl2Zone = 600;
	ang1Zone = 800;
	ang2Zone = 800;

	startTime = frameCount;

	// create a bghue variable that is a random number between 30 and 50
	let bghue = parseInt(fxrand() * (50 - 30) + 30);
	let bgsat = parseInt(fxrand() * (1 - 5) + 1);
	let bgbri = 95;
	let bga = 100;
	bgCol = color(bghue, bgsat, bgbri, bga);

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
	let draw_every = 1;

	// draw the particles and make them move until draw_every is reached then yield and wait for the next frame, also check if the maxFrames is reached and stop the sketch if it is and also show the loading bar
	while (true) {
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];
			mover.show();
			mover.move();
		}
		count++;
		if (count > draw_every) {
			count = 0;
			yield;
		}
		elapsedTime = frameCount - startTime;
		showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax);
		drawUI();

		frameCount++;

		if (elapsedTime > maxFrames && drawing) {
			drawing = false;
			// close the generator
			console.timeEnd('setup');
			return;
		}
	}
}

function draw() {
	noLoop();
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	console.log('INIT');
	background(bgCol);
	movers = [];

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;
	let hue = fxrand() * 360;
	xMin = 0.05;
	xMax = 0.95;
	yMin = 0.05;
	yMax = 0.95;

	for (let i = 0; i < particleNum; i++) {
		let x = fxrand() * (xMax - xMin + xMin) * width;
		let y = fxrand() * (yMax - yMin + yMin) * height;

		let initHue = hue + fxrand() * 2 - 1;
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
				yRandDivider,
				scl1Zone * MULTIPLIER,
				scl2Zone * MULTIPLIER,
				ang1Zone * MULTIPLIER,
				ang2Zone * MULTIPLIER
			)
		);
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
	drawingContext.strokeStyle = 'black';
	drawingContext.lineWidth = 2 * MULTIPLIER;
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

	/* 	stroke(0, 0, 0, 70);
	strokeWeight(3 * MULTIPLIER);
	// make 3 lines from top to bottom and left to right that represent 1/4th,half and 3/4th of what's inside xMin and xMax
	let x1 = xMin + (xMax - xMin) / 4;
	let x2 = xMin + (xMax - xMin) / 2;
	let x3 = xMin + ((xMax - xMin) * 3) / 4;
	let y1 = yMin + (yMax - yMin) / 4;
	let y2 = yMin + (yMax - yMin) / 2;
	let y3 = yMin + ((yMax - yMin) * 3) / 4;

	line(x1 * width, yMin * height, x1 * width, yMax * height);
	line(x2 * width, yMin * height, x2 * width, yMax * height);
	line(x3 * width, yMin * height, x3 * width, yMax * height);
	line(xMin * width, y1 * height, xMax * width, y1 * height);
	line(xMin * width, y2 * height, xMax * width, y2 * height);
	line(xMin * width, y3 * height, xMax * width, y3 * height);

	// make a larger line that is positionned just outside of the xMin and xMax and yMin and yMax limits. One rectangle for each 1/4th segment of each side. one is black and the other is white and so on. It must look like a the border of a topo map
	let sw = (xMin / 10) * width;
	strokeWeight(1 * MULTIPLIER);
	stroke(0);

	// left side
	rectMode(CORNER);
	fill(0);
	rect(xMin * width - sw, yMin * height, sw, y1 * height - yMin * height);
	fill(255);
	rect(xMin * width - sw, y1 * height, sw, y2 * height - y1 * height);
	fill(0);
	rect(xMin * width - sw, y2 * height, sw, y3 * height - y2 * height);
	fill(255);
	rect(xMin * width - sw, y3 * height, sw, yMax * height - y3 * height);

	// top side
	fill(255);
	rect(x1 * width, yMin * height - sw, x2 * width - x1 * width, sw);
	fill(0);
	rect(x2 * width, yMin * height - sw, x3 * width - x2 * width, sw);
	fill(255);
	rect(x3 * width, yMin * height - sw, xMax * width - x3 * width, sw);
	fill(0);
	rect(xMin * width, yMin * height - sw, x1 * width - xMin * width, sw);

	// right side
	fill(255);
	rect(xMax * width, y1 * height, sw, y2 * height - y1 * height);
	fill(0);
	rect(xMax * width, y2 * height, sw, y3 * height - y2 * height);
	fill(255);
	rect(xMax * width, y3 * height, sw, yMax * height - y3 * height);
	fill(0);
	rect(xMax * width, yMin * height, sw, y1 * height - yMin * height);

	// bottom side
	fill(0);
	rect(x1 * width, yMax * height, x2 * width - x1 * width, sw);
	fill(255);
	rect(x2 * width, yMax * height, x3 * width - x2 * width, sw);
	fill(0);
	rect(x3 * width, yMax * height, xMax * width - x3 * width, sw);
	fill(255);
	rect(xMin * width, yMax * height, x1 * width - xMin * width, sw);

	// add a square to each corner of the xMin,xMax,yMin,yMax rectangle

	strokeWeight(1 * MULTIPLIER);
	stroke(0);
	fill(255);
	rect(xMin * width - sw, yMin * height - sw, sw, sw);
	rect(xMax * width, yMin * height - sw, sw, sw);
	rect(xMin * width - sw, yMax * height, sw, sw);
	rect(xMax * width, yMax * height, sw, sw); */
}
function keyPressed() {
	const particleNumMapping = {
		49: 3500,
		50: 75000,
		51: 100000,
		52: 150000,
		53: 200000,
		54: 250000,
		55: 300000,
		56: 400000,
		57: 800000,
	};

	const maxFramesMapping = {
		49: 64 * 160,
		50: 64,
		51: 64,
		52: 64,
		53: 64,
		54: 64,
		55: 64,
		56: 64,
		57: 64 * 10,
	};

	const keyCodeToParticleNum = particleNumMapping[keyCode];
	const keyCodeToMaxFrames = maxFramesMapping[keyCode];

	if (keyCodeToParticleNum !== undefined && keyCodeToMaxFrames !== undefined) {
		movers = [];
		// update the renderMode according to the key pressed
		renderMode = keyCode - 48;
		frameCount = 0;
		elapsedTime = 0;
		particleNum = keyCodeToParticleNum;
		maxFrames = keyCodeToMaxFrames;
		drawing = true;
		loop();
		console.log('keyPressed');
		INIT(particleNum);
	}
}
