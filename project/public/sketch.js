let features = '';
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
let maxFrames = 600;
let C_WIDTH;
let MULTIPLIER;

({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

P5Capture.setDefaultOptions({
	format: 'mp4',
	framerate: 5,
});

function setup() {
	features = $fx.getFeatures();
	console.log(features);
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(3.0);
	}

	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 1600;
	c = createCanvas(C_WIDTH, C_WIDTH * 1.375);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	INIT(rseed);
}

function draw() {
	blendMode(ADD);
	for (let i = 0; i < movers.length; i++) {
		for (let j = 0; j < 1; j++) {
			movers[i].show();
			movers[i].move();
		}
	}
	blendMode(BLEND);

	let elapsedTime = frameCount - startTime;
	if (elapsedTime > maxFrames) {
		window.rendered = c.canvas;
		document.complete = true;
		noLoop();
	}
}

function INIT(seed) {
	scl1 = random([0.00095, 0.001, 0.0011, 0.0012]);
	scl2 = scl1;

	ang1 = int(random([1, 5, 10, 20, 40, 80, 160, 320, 640, 1280]));
	ang2 = int(random([1, 5, 10, 20, 40, 80, 160, 320, 640, 1280]));

	xRandDivider = random([0.08, 0.09, 0.1, 0.11, 0.12]);
	yRandDivider = xRandDivider;
	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01;

	let hue = random(360);
	for (let i = 0; i < 20000; i++) {
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
				yRandDivider,
				seed,
				features
			)
		);
	}

	bgCol = color(random(0, 360), random([0, 2, 5]), features.theme == 'bright' ? 93 : 10, 100);

	background(bgCol);
}
