let config_type = parseInt(fxrand() * 3 + 1);
//let config_type = 2;
console.log(config_type);

let features = "";
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

let centerX;
let centerY;
let borderX;
let borderY;

({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

function setup() {
	features = $fx.getFeatures();
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(1.0);
	}

	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 1200;
	c = createCanvas(C_WIDTH, C_WIDTH);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	//noCursor();

	centerX = width / 2;
	centerY = height / 2;
	borderX = features.composition === "compressed" ? width / 3.5 : features.composition === "constrained" ? width / 3 : features.composition === "semiconstrained" ? width / 2.35 : width / 1.9;
	borderY = features.composition === "compressed" ? height / 2.75 : features.composition === "constrained" ? height / 2.5 : features.composition === "semiconstrained" ? height / 2.25 : height / 1.9;
	INIT(rseed);
}

function draw() {
	checkMIDI();
	blendMode(ADD);
	for (let i = 0; i < movers.length; i++) {
		//if (frameCount > 20 || frameCount < 2) {
		movers[i].show();
		//}
		movers[i].move();
	}
	blendMode(BLEND);
	noFill();
	strokeWeight(0.1 * MULTIPLIER);
	stroke(0, 0, 100, 100);
	// draw a rectangle the size of the composition with centerX, centerY as the center and borderX, borderY as the width and height
	//rect(centerX, centerY, borderX * 2, borderY * 2);
	let elapsedTime = frameCount - startTime;
	if (elapsedTime > maxFrames) {
		window.rendered = c.canvas;
		document.complete = true;
		noLoop();
	}
}

function INIT(seed) {
	scl1 = random([0.0014, 0.0015, 0.0016, 0.0017, 0.0018, 0.0019, 0.00195]);
	scl2 = scl1;

	ang1 = 1;
	ang2 = 1;

	//xRandDivider = random([0.08, 0.09, 0.1, 0.11, 0.12]);
	xRandDivider = 0.1;
	yRandDivider = 0.125;
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
		movers.push(new Mover(x, y, initHue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, ang1 * MULTIPLIER, ang2 * MULTIPLIER, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, seed, features));
	}

	bgCol = color(random(0, 360), random([0, 2, 5]), features.theme == "bright" ? 93 : 5, 100);

	background(bgCol);
	//background(45, 100, 100);
	//background(221, 100, 60);
}
