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
let maxFrames = 120;
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
		pixelDensity(3.0);
	}
	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 2600;
	c = createCanvas(C_WIDTH, C_WIDTH * 1.78);

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
		noLoop();
	}
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	console.log('INIT');
	let hue = random(360);
	let bgCol = color(random(0, 360), random([0, 2]), 95, 100);

	background(bgCol);

	drawTexture(hue);
	movers = [];
	scl1 = random(0.0002, 0.003);
	scl2 = scl1;
	ang1 = int(random(1000));
	ang2 = ang1;

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	xMin = 0.07;
	xMax = 0.93;
	yMin = 0.05;
	yMax = 0.95;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */
	stroke(0);
	strokeWeight(1);
	line(xMin * width, yMin * height, xMax * width, yMin * height);
	line(xMin * width, yMax * height, xMax * width, yMax * height);
	line(xMin * width, yMin * height, xMin * width, yMax * height);
	line(xMax * width, yMin * height, xMax * width, yMax * height);

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
