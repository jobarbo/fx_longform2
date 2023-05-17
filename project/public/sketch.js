let features = '';
let movers = [];
let scl1;
let scl2;
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

	// if Safari mobile or any smartphone browser, use pixelDensity(0.5) to make the canvas bigger, else use pixelDensity(3.0)
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		pixelDensity(2);
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
		for (let step = 0; step < 1; step++) {
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
	scl1 = random(0.003, 0.007);
	scl2 = random(0.003, 0.007);
	let hue = random(360);
	let y = random(height / 1.5, height / 3);
	let x = -100;
	for (let i = 0; i < 20000; i++) {
		// make x iterate from 0 to width with a step of 20 pixels
		x += random(0.25);
		// make y start at height/2 but every other steps it's position is affected by noise

		y += map(noise(x * 0.015, seed), 0, 1, -0.25, 0.25);

		movers.push(new Mover(x, y, hue, scl1, scl2, seed));
	}
	let bgCol = spectral.mix('#fff', '#D79900', 0.038);
	background(bgCol);
}
