let movers = [];
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
//let maxFrames = 64 * 500000;
let maxFrames = 100 * 1;
let currentFrame = 0;
let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let elapsedTime = 0;
let particleNum = 100251;
let drawing = true;
let bgCol;
let renderMode = 1;

let scl1, scl2, amp1, amp2, scl1Zone, scl2Zone, amp1Zone, amp2Zone;

function setup() {
	console.time("setup");
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
	amp1 = int(fxrand() * (1, 3200) + 1);
	amp2 = int(fxrand() * (2000, 3200) + 2000);
	console.log(scl1, scl2, amp1, amp2);

	// champe how drastically it champes with the SDF
	scl1Zone = 1200;
	scl2Zone = 1200;
	amp1Zone = 1;
	amp2Zone = 1;

	startTime = frameCount;
	bgCol = color(random(30, 50), random([1, 5, 10]), 2, 100);

	background(bgCol);
	generateStars();

	INIT();
}

function draw() {
	// put drawing code here
	blendMode(SCREEN);
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
		console.log("elapsedTime", elapsedTime);
		console.timeEnd("setup");
		let timeToRender = (elapsedTime / 60).toFixed(2);
		console.log("timeToRender", timeToRender);
		noLoop();
	}
}

///////////////////////////////////////////////////////
// -------------------- UTILS ------------------------
//////////////////////////////////////////////////////

function INIT() {
	console.log("INIT");
	let hue = fxrand() * 360;

	// Initialize movers array
	movers = [];

	console.log(scl1, scl2, amp1, amp2);

	let xRandDivider = 0.1;
	let yRandDivider = xRandDivider;

	xMin = 0.05;
	xMax = 0.95;
	yMin = 0.05;
	yMax = 0.95;

	for (let i = 0; i < particleNum; i++) {
		let r = random(0, 2 * PI);
		let x = width / 2 + cos(r) * 2600 * MULTIPLIER;
		let y = height + sin(r) * 2600 * MULTIPLIER;
		/* 		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height; */

		let initHue = int(hue + randomGaussian(hue, 10));
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				initHue,
				scl1 / MULTIPLIER,
				scl2 / MULTIPLIER,
				int(amp1 * MULTIPLIER),
				int(amp2 * MULTIPLIER),
				xMin,
				xMax,
				yMin,
				yMax,
				xRandDivider,
				yRandDivider,
				scl1Zone * MULTIPLIER,
				scl2Zone * MULTIPLIER,
				amp1Zone * MULTIPLIER,
				amp2Zone * MULTIPLIER
			)
		);
	}
}

function generateStars() {
	//generate stars
	let stars = [];
	let starNum = random([250, 350, 500]);
	for (let i = 0; i < starNum; i++) {
		let x = random(0, width);
		let y = random(0, height);
		let hue = random([0, 5, 10, 15, 20, 25, 30, 35, 30, 35, 190, 195, 200, 205, 210, 215, 220, 225]);
		let sat = random([0, 0, 10, 10, 10, 20, 30, 40, 50]);
		let bri = 100;
		stars.push(new Stars(x, y, hue, sat, bri, xMin, xMax, yMin, yMax));
	}
	//blendMode(SCREEN);
	for (let i = 0; i < starNum; i++) {
		for (let j = 0; j < 1000; j++) {
			let xi = 0.2;
			let yi = 0.8;
			stars[i].show();
			stars[i].move(xi, yi);
		}
	}

	for (let i = 0; i < starNum; i++) {
		for (let j = 0; j < 1000; j++) {
			let xi = 0.8;
			let yi = 0.2;
			stars[i].show();
			stars[i].move(xi, yi);
		}
	}
	blendMode(BLEND);
}

function drawTexture(hue) {
	// draw 200000 small rects to create a texture
	console.log("drawTexture");
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
	document.title = percent.toFixed(0) + "%" + " (mode " + renderMode + ")";
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
		console.log("keyPressed");
		INIT(particleNum);
	}
}
