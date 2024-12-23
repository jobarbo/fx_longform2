let cfgType = 1;
console.log(cfgType);

let feats = "",
	mvrs = [],
	s1,
	s2,
	a1,
	a2,
	rSeed,
	nSeed;
let xMin,
	xMax,
	yMin,
	yMax,
	startT,
	maxF = 900;
let cWidth, mult, cX, cY;

({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

function setup() {
	feats = $fx.getFeatures();
	let ua = window.navigator.userAgent;
	let iOSSafari = /iPad|iPhone/i.test(ua) && /WebKit/i.test(ua) && !/CriOS/i.test(ua);

	pixelDensity(iOSSafari ? 1.0 : 3.0);

	cWidth = min(windowWidth, windowHeight);
	mult = cWidth / 1200;
	c = createCanvas(cWidth, cWidth * 1.41);
	rectMode(CENTER);
	rSeed = randomSeed(fxrand() * 10000);
	nSeed = noiseSeed(fxrand() * 10000);
	colorMode(HSB, 360, 100, 100, 100);
	startT = frameCount;

	cX = width / 2;
	cY = height / 2;
	init(rSeed);
}

function draw() {
	blendMode(ADD);
	mvrs.forEach((mvr) => {
		mvr.show();
		mvr.move();
	});
	blendMode(BLEND);
	noFill();
	strokeWeight(0.1 * mult);
	stroke(0, 0, 100, 100);

	let elapsedT = frameCount - startT;
	if (elapsedT > maxF) {
		window.rendered = c.canvas;
		document.complete = true;
		noLoop();
	}
}

function init(seed) {
	s1 = s2 = random([0.0055]);
	a1 = a2 = 1;
	let xRandDiv = 0.1,
		yRandDiv = 0.125;
	xMin = yMin = -0.01;
	xMax = yMax = 1.01;

	let hue = random(360);
	for (let i = 0; i < 20000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;
		let initHue = (hue + random(-1, 1) + 360) % 360;
		mvrs.push(new Mover(x, y, initHue, s1 / mult, s2 / mult, a1 * mult, a2 * mult, xMin, xMax, yMin, yMax, xRandDiv, yRandDiv, seed, feats));
	}

	let bgCol = color(random(0, 360), random([0, 2, 5]), feats.theme == "bright" ? 93 : 5, 100);
	background(bgCol);
}
