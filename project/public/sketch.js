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
let maxFrames = 60;
let currentFrame = 0;
let C_WIDTH;
let MULTIPLIER;

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
		pixelDensity(2.0);
	}
	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 3600;
	c = createCanvas(C_WIDTH, C_WIDTH);

	/*
		window.addEventListener('resize', onResize);
		onResize();
		*/

	rectMode(CENTER);
	randomSeed(seed);
	noiseSeed(seed);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	INIT();
}

function draw() {
	// put drawing code here
	for (let i = 0; i < movers.length; i++) {
		for (let j = 0; j < 1; j++) {
			movers[i].show();
			movers[i].move();
		}
	}
	let elapsedTime = frameCount - startTime;
	if (elapsedTime > maxFrames) {
		console.log('elapsedTime', elapsedTime);
		drawUI();
		noLoop();
	}
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	console.log('INIT');
	let hue = random(360);
	let bgCol = color(random(30, 50), random([10, 15, 25]), 95, 100);

	background(bgCol);

	drawTexture(hue);
	movers = [];
	scl1 = 0.004;
	scl2 = scl1;
	ang1 = 1000;
	ang2 = ang1;

	console.log(scl1, ang1);

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	xMin = 0.07;
	xMax = 0.93;
	yMin = 0.07;
	yMax = 0.93;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	for (let i = 0; i < 400000; i++) {
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
	for (let i = 0; i < 400000; i++) {
		let x = random(width);
		let y = random(height);
		let sw = 0.45;
		let h = hue + random(-1, 1);
		let s = random([0, 20, 40, 60, 80, 100]);
		let b = random([0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100]);
		fill(h, s, b, 20);
		noStroke();
		rect(x, y, sw);
	}
}

function drawUI() {
	console.log('drawUI');
	stroke(0);
	strokeWeight(1 * MULTIPLIER);
	line(xMin * width, yMin * height, xMax * width, yMin * height);
	line(xMin * width, yMax * height, xMax * width, yMax * height);
	line(xMin * width, yMin * height, xMin * width, yMax * height);
	line(xMax * width, yMin * height, xMax * width, yMax * height);

	stroke(0, 0, 0, 100);
	strokeWeight(1 * MULTIPLIER);
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
	let sw = 20 * MULTIPLIER;
	strokeWeight(1);
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

	strokeWeight(1);
	stroke(0);
	fill(255);
	rect(xMin * width - sw, yMin * height - sw, sw, sw);
	rect(xMax * width, yMin * height - sw, sw, sw);
	rect(xMin * width - sw, yMax * height, sw, sw);
	rect(xMax * width, yMax * height, sw, sw);
}
