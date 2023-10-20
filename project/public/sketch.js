let movers = [];
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
//let maxFrames = 64 * 500000;
let maxFrames = 72 * 1;
let currentFrame = 0;
let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let elapsedTime = 0;
let particleNum = 50250;
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

	scl1 = fxrand() * (0.0012 - 0.0016) + 0.0012;
	scl2 = fxrand() * (0.0012 - 0.0016) + 0.0012;
	ang1 = int(fxrand() * (1000, 1200) + 1000);
	ang2 = int(fxrand() * (1000, 1200) + 1000);

	// change how drastically it changes with the SDF
	scl1Zone = 600;
	scl2Zone = 600;
	ang1Zone = 1;
	ang2Zone = 1;

	startTime = frameCount;
	bgCol = color(random(30, 50), random([1, 5, 10]), 2, 100);
	INIT();
}

function draw() {
	// put drawing code here
	blendMode(ADD);
	for (let i = 0; i < movers.length; i++) {
		//for (let j = 0; j < 50; j++) {
		movers[i].move();
		movers[i].show();
		//}
	}
	//frameCount += 50;
	blendMode(BLEND);
	let elapsedTime = frameCount - startTime;
	// render a loading bar on the canvas to show the progress of the sketch, i want the bar to start on the xmin and end on the xmax
	showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax);
	//drawUI();

	if (elapsedTime > maxFrames) {
		console.log('elapsedTime', elapsedTime);
		console.timeEnd('setup');
		let timeToRender = (elapsedTime / 60).toFixed(2);
		console.log('timeToRender', timeToRender);
		noLoop();
	}
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	console.log('INIT');
	let hue = fxrand() * 360;

	background(bgCol);

	drawTexture(hue);
	movers = [];

	console.log(scl1, scl2, ang1, ang2);

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	xMin = 0.05;
	xMax = 0.95;
	yMin = 0.05;
	yMax = 0.95;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	for (let i = 0; i < particleNum; i++) {
		let r = random(0, 2 * PI);
		let x = width / 2 + cos(r) * 300;
		let y = height / 2 + sin(r) * 300;
		/* 		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height; */

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
				yRandDivider,
				scl1Zone * MULTIPLIER,
				scl2Zone * MULTIPLIER,
				ang1Zone * MULTIPLIER,
				ang2Zone * MULTIPLIER
			)
		);
	}
}

function drawTexture(hue) {
	// draw 200000 small rects to create a texture
	console.log('drawTexture');
	for (let i = 0; i < 1; i++) {
		let x = random(width);
		let y = random(height);
		let sw = 1 * MULTIPLIER;
		let h = hue + random(-1, 1);
		let s = random([0, 20, 40, 60, 80, 100]);
		let b = random([0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100]);
		fill(h, s, b, 50);
		noStroke();
		rect(x, y, sw);
	}
}

function showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax) {
	let percent = (elapsedTime / maxFrames) * 100;
	if (percent > 100) percent = 100;

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + '%' + ' (mode ' + renderMode + ')';
}

function drawUI() {
	stroke(0);
	strokeWeight(2 * MULTIPLIER);
	line(xMin * width, yMin * height, xMax * width, yMin * height);
	line(xMin * width, yMax * height, xMax * width, yMax * height);
	line(xMin * width, yMin * height, xMin * width, yMax * height);
	line(xMax * width, yMin * height, xMax * width, yMax * height);

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
		57: 64,
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
