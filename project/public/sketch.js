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

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(3.0);
	}
	createCanvas((30 * 300) / 3, (30 * 300) / 3);
	colorMode(HSB, 360, 100, 100, 100);
	seed = random(10000000);
	randomSeed(seed);
	INIT(seed);
}

function draw() {
	for (let i = 0; i < movers.length; i++) {
		for (let t = 0; t < 1; t++) {
			movers[i].show();
			movers[i].move();
		}
	}
	if (frameCount > 100) {
		console.log('done');
		noLoop();
	}
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(seed);
}

function INIT(seed) {
	movers = [];
	scl1 = random([0.00005, 0.0001, 0.0005, 0.001, 0.0025, 0.005, 0.0075, 0.01, 0.03, 0.05, 0.075]);
	scl2 = random([0.00005, 0.0001, 0.0005, 0.001, 0.0025, 0.005, 0.0075, 0.01, 0.03, 0.05, 0.075]);
	scl3 = random([0.00005, 0.0001, 0.0005, 0.001, 0.0025, 0.005, 0.0075, 0.01, 0.03, 0.05, 0.075]);
	ang1 = int(random(1000));
	ang2 = int(random(1000));

	console.log('scl1', scl1);
	console.log('scl2', scl2);
	console.log('scl3', scl3);

	xMin = 0.2;
	xMax = 0.8;
	yMin = 0.1;
	yMax = 0.9;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	let hue = random(360);

	let angOffset1 = random(1, 2);
	let angOffset2 = random(1, 2);
	let angOffset3 = random(1, 2);
	for (let i = 0; i < 30000; i++) {
		/* 		// distribue the movers within a circle using polar coordinates
		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 100;
		let y = height / 2 + r * sin(theta) * 100; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		//let hueOffset = map(x, xMin * width, xMax * width, -10, 10);
		let hueOffset = random(-10, 10);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				initHue,
				scl1,
				scl2,
				scl3,
				ang1,
				ang2,
				angOffset1,
				angOffset2,
				angOffset3,
				xMin,
				xMax,
				yMin,
				yMax,
				isBordered,
				seed
			)
		);
	}
	let bgCol = spectral.mix('#000', '#faedcd', 0.938);
	background(bgCol);
}
