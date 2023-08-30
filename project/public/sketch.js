let features = '';

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
	createCanvas(1500, 1500);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	console.log(features);
}

function draw() {
	// put drawing code here
	background(0);
	translate(width / 2, height / 2);
	stroke(255);
	noFill();

	beginShape();
	for (let a = 0; a < TWO_PI; a += 0.01) {
		let r = 200;
		let x = r * cos(a);
		let y = r * sin(a);
		vertex(x, y);
	}
	endShape();
}
