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
let drawing = false;
let scl1Off = 0.00001,
	scl2Off = 0.00001,
	ang1Off = 0,
	ang2Off = 0;

/* P5Capture.setDefaultOptions({
	format: 'mp4',
}); */
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
	//createCanvas((16 * 300) / 3, (16 * 300) / 3);
	createCanvas(1080, 1920);
	colorMode(HSB, 360, 100, 100, 100);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);

	INIT(rseed);
}

function draw() {
	// put drawing code here
	for (let i = 0; i < movers.length; i++) {
		movers[i].show();
		movers[i].move();
	}

	// every 100 frames, save the canvas
	if (scl2 < 0.005) {
		if (frameCount % 100 == 0) {
			console.log('done');
			scl1Off *= 1.1;
			scl2Off *= 1.1;
			saveArtwork();
			INIT(rseed);
			//noLoop();
		}
	} else {
		noLoop();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(rseed);
}

function INIT(seed) {
	movers = [];

	scl1 = random(0.00001, 0.005);
	scl2 = random(0.00001, 0.005);
	ang1 = int(random(1000));
	ang2 = int(random(1000));
	scl1 = 0.00053 + scl1Off;
	scl2 = 0.00053 + scl2Off;
	ang1 = 952;
	ang2 = 688;

	console.log('scl1: ' + scl1);
	console.log('scl2: ' + scl2);
	console.log('ang1: ' + ang1);
	console.log('ang2: ' + ang2);

	xMin = 0.2;
	xMax = 0.8;
	yMin = 0.15;
	yMax = 0.85;
	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	let hue = random(360);
	hue = 71.11800734885037;
	console.log('hue: ' + hue);
	for (let i = 0; i < 40000; i++) {
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
	let bgCol = spectral.mix('#fff', '#000', 0.138);
	background(bgCol);
}
