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
let isBordered = false;

P5Capture.setDefaultOptions({
	format: 'mp4',
});

function setup() {
	features = $fx.getFeatures();
	console.log(features);
	let formatMode = features.format_mode;
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(1.0);
	}
	createCanvas(16 * 100, 22 * 100);
	//createCanvas(1080, 1920);
	colorMode(HSB, 360, 100, 100, 100);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	INIT(rseed);
}

function draw() {
	// get current frame count
	let fps = frameCount;
	for (let i = 0; i < movers.length; i++) {
		for (let j = 0; j < 1; j++) {
			movers[i].show();
			movers[i].move();
		}
	}
}

function INIT(seed) {
	movers = [];
	scl1 = random(0.001, 0.001);
	scl2 = random(0.001, 0.001);
	ang1 = int(random([1, 5, 10, 20, 40, 80, 160, 320, 640, 1280]));
	ang2 = int(random([1, 5, 10, 20, 40, 80, 160, 320, 640, 1280]));

	/* 	xMin = 0.25;
	xMax = 0.75;
	yMin = 0.25;
	yMax = 0.75; */
	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05;
	rectMode(CENTER);
	let hue = random(360);
	for (let i = 0; i < 100000; i++) {
		/* 		// distribue the movers within a circle using polar coordinates
		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 100;
		let y = height / 2 + r * sin(theta) * 100; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue + random(-1, 1);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed));
	}
	let bgCol = spectral.mix('#fff', '#000', 0.138);
	background(bgCol);
}
