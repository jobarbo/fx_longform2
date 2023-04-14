let features = '';
let movers = [];
let scl1;
let scl2;
let ang1;
let ang2;
let rseed;
let nseed;
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
	createCanvas(3600, 3600);
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

	if (frameCount > 150) {
		console.log('done');
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
	console.log(scl1);
	console.log(scl2);
	console.log(ang1);
	console.log(ang2);
	let hue = random(360);
	for (let i = 0; i < 100000; i++) {
		/* 		// distribue the movers within a circle using polar coordinates
		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 100;
		let y = height / 2 + r * sin(theta) * 100; */

		let x = random(0.2, 0.8) * width;
		let y = random(0.2, 0.8) * height;

		movers.push(new Mover(x, y, hue, scl1, scl2, ang1, ang2, seed));
	}
	let bgCol = spectral.mix('#fff', '#D79900', 0.038);
	background(bgCol);
}
