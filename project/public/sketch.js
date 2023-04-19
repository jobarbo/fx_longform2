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
		movers[i].show();
		movers[i].move();
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
	scl1 = random(0.00001, 0.01);
	scl2 = random(0.00001, 0.01);
	ang1 = int(random(360));
	ang2 = int(random(360));
	console.log('scl1: ' + scl1);
	console.log('scl2: ' + scl2);
	console.log('ang1: ' + ang1);
	console.log('ang2: ' + ang2);
	let hue = 45;
	let y = random(height / 1.5, height / 3);
	let x = -100;
	for (let i = 0; i < 25000; i++) {
		// make x iterate from 0 to width with a step of 20 pixels
		x += width / 20000;
		// make y start at height/2 but every other steps it's position is affected by noise

		y += map(noise(x * 0.006, seed), 0, 1, -0.53, 0.53);

		movers.push(new Mover(x, y, hue, scl1, scl2, ang1, ang2, seed));
	}
	let bgCol = spectral.mix('#fff', '#00152C', 0.999);
	background(bgCol);
}
