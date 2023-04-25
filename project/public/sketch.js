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
		pixelDensity(1.0);
	}
	createCanvas((16 * 300) / 3, (22 * 300) / 3);
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
	scl1 = random([0.0001, 0.0005, 0.001, 0.0025, 0.005, 0.0075, 0.01, 0.03, 0.05, 0.075]);
	scl2 = random([0.0001, 0.0005, 0.001, 0.0025, 0.005, 0.0075, 0.01, 0.03, 0.05, 0.075]);
	scl3 = random([0.0001, 0.0005, 0.001, 0.0025, 0.005, 0.0075, 0.01, 0.03, 0.05, 0.075]);

	let hue = random(360);

	let sclOffset1 = int(random(12) + 1);
	let sclOffset2 = int(random(2) + 1);
	let sclOffset3 = int(random(2) + 1);

	console.log('sclOffset1', sclOffset1);
	console.log('sclOffset2', sclOffset2);
	console.log('sclOffset3', sclOffset3);

	console.log('scl1', scl1);
	console.log('scl2', scl2);
	console.log('scl3', scl3);

	xMin = 0.1;
	xMax = 0.9;
	yMin = 0.05;
	yMax = 0.95;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	for (let i = 0; i < 20000; i++) {
		// distribue the movers within a circle using polar coordinates
		/* 		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 50;
		let y = height / 2 + r * sin(theta) * 50; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		//let hueOffset = map(x, xMin * width, xMax * width, -10, 10);
		let hueOffset = random(-20, 20);
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
				sclOffset1,
				sclOffset2,
				sclOffset2,
				xMin,
				xMax,
				yMin,
				yMax,
				isBordered,
				seed
			)
		);
	}
	let bgCol = spectral.mix('#000', '#FAE8E0', 0.938);
	background(bgCol);
}
