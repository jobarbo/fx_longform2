let movers = [];
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
//let maxFrames = 64 * 500000;
let maxFrames = 64 * 1;
let currentFrame = 0;
let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let elapsedTime = 0;
let particleNum = 50251;
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

	scl1 = fxrand() * (0.0005 - 0.00052) + 0.0005;
	scl2 = fxrand() * (0.0005 - 0.00052) + 0.0005;
	ang1 = int(fxrand() * (3000, 3200) + 3000);
	ang2 = int(fxrand() * (3000, 3200) + 3000);
	console.log(scl1, scl2, ang1, ang2);

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
	showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax);

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

	//drawTexture(hue);
	movers = [];

	console.log(scl1, scl2, ang1, ang2);

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	xMin = 0.05;
	xMax = 0.95;
	yMin = 0.05;
	yMax = 0.95;

	for (let i = 0; i < particleNum; i++) {
		let r = random(0, 2 * PI);
		let x = width / 2 + cos(r) * 1300 * MULTIPLIER;
		let y = height / 2 + sin(r) * 1300 * MULTIPLIER;
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
				int(ang1 * MULTIPLIER),
				int(ang2 * MULTIPLIER),
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
	for (let i = 0; i < 40000; i++) {
		let x = random(width);
		let y = random(height);
		let sw = fxrand() * 2 * MULTIPLIER;
		let h = 35 + random(75);
		let s = random([0, 20, 40, 60, 80, 100]);
		let b = random([100]);
		fill(h, s, b, 100);
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
