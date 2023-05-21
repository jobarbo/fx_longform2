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
function setup() {
	console.log(features);
	features = $fx.getFeatures();

	let formatMode = features.format_mode;
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if Safari mobile or any smartphone browser, use pixelDensity(0.5) to make the canvas bigger, else use pixelDensity(3.0)
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		pixelDensity(1);
	} else {
		pixelDensity(3);
	}
	createCanvas(16 * 100, 22 * 100);
	colorMode(HSB, 360, 100, 100, 100);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	INIT(rseed);
}

function draw() {
	// put drawing code here
	for (let i = 0; i < movers.length; i++) {
		for (let j = 0; j < 1; j++) {
			movers[i].show();
			movers[i].move();
		}
	}

	if (frameCount > 100) {
		console.log('done');
		noLoop();
	}
}

/* function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(rseed);
} */

function INIT(seed) {
	movers = [];
	scl1 = random(0.001, 0.006);
	scl2 = random(0.001, 0.006);
	ang1 = random([1, 5, 10, 25, 50, 75, 100, 200, 500, 1000]);
	ang2 = random([1, 5, 10, 25, 50, 75, 100, 200, 500, 1000]);

	xMin = 0.15;
	xMax = 0.85;
	yMin = 0.1;
	yMax = 0.9;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	let hue = random(360);
	for (let i = 0; i < 50000; i++) {
		/* 		// distribue the movers within a circle using polar coordinates
		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 100;
		let y = height / 2 + r * sin(theta) * 100; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue + random(-10, 10);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed));
	}
	let bgCol = spectral.mix('#fff', '#000', 0.938);
	background(bgCol);
}
