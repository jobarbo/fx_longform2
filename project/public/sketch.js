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
		pixelDensity(3.0);
	}
	createCanvas((16 * 300) / 3, (22 * 300) / 3);
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

	/* 	if (frameCount > 150) {
		console.log('done');
		noLoop();
	} */
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(rseed);
}

function INIT(seed) {
	movers = [];
	scl1 = 0.006;
	scl2 = 0.006;
	ang1 = 1;
	ang2 = 1;
	console.log('scl1: ' + scl1);
	console.log('scl2: ' + scl2);
	console.log('ang1: ' + ang1);
	console.log('ang2: ' + ang2);

	let hue = 45;
	let y = random(height / 1.2, height / 1.5);
	let x = -100;
	let bgCol = spectral.mix('#fff', '#00152C', 0.999);

	background(bgCol);

	for (let i = 0; i < 25000; i++) {
		// make stars
		let x = random(width);
		let y = random(height);
		let size = random(0.1, 5);
		let hue = random([0, 15, 20, 30, 40, 45, 170, 180, 190, 200, 210, 220]);
		let sat = random(0, 70);
		let bri = random(100);
		let alpha = random(100) * (1 - y / height);
		let col = color(hue, sat, bri, alpha);
		fill(col);
		noStroke();
		ellipse(x, y, size);
	}

	fill(230, 60, 10, 100);
	strokeWeight(3);
	stroke(hue, 90, 20, 100);
	beginShape();
	vertex(-100, height);
	for (let i = 0; i < 55000; i++) {
		// make x iterate from 0 to width with a step of 20 pixels
		x += width / 51000;
		// make y start at height/2 but every other steps it's position is affected by noise

		y += map(noise(x * 0.007, seed), 0, 1, -0.1, 0.086);
		ellipse();
		vertex(x, y);
		let initHue = hue + random(-40, 40);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, ang1, ang2, seed));
	}
	vertex(width + 100, height);
	endShape(CLOSE);
}
