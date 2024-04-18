let features = "";
let back_movers = [];
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

let is_bg_done = false;
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
	createCanvas(2400, 2400);
	colorMode(HSB, 360, 100, 100, 100);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	INIT(rseed);
}

function draw() {
	// put drawing code here
	if (!is_bg_done && frameCount < 10) {
		for (let i = 0; i < back_movers.length; i++) {
			back_movers[i].show();
			back_movers[i].move();
		}
		if (frameCount > 100) {
			is_bg_done = true;
		}
	} else {
		for (let i = 0; i < movers.length; i++) {
			for (let j = 0; j < 1; j++) {
				movers[i].show();
				movers[i].move();
			}
		}
	}

	if (frameCount > 200) {
		console.log("done");
		noLoop();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(rseed);
}

function INIT(seed) {
	let bgCol = spectral.mix("#fff", "#000", 0.138);
	background(bgCol);

	movers = [];
	scl1 = random(0.001, 0.0012);
	scl2 = random(0.001, 0.0012);
	ang1 = int(random(1200));
	ang2 = int(random(10000));

	xMin = 0.15;
	xMax = 0.85;
	yMin = 0.15;
	yMax = 0.85;

	noFill();
	stroke(0, 0, 70, 100);
	strokeWeight(3);
	rect(xMin * width, yMin * height, (xMax - xMin) * width, (yMax - yMin) * height);

	/* 	xMin = -0.05;
	xMax = 1.05;
	yMin = -0.05;
	yMax = 1.05; */

	for (let i = 0; i < 100000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;
		let s = random(10, 100);

		let initHue = 35;

		back_movers.push(new Back_mover(x, y, initHue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed));
	}

	let hue = random(360);
	for (let i = 0; i < 100000; i++) {
		/* 		// distribue the movers within a circle using polar coordinates
		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 100;
		let y = height / 2 + r * sin(theta) * 100; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue + random(-40, 40);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed));
	}
}
