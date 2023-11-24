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
	background(random(360), 50, 100);
	console.log(features);
}

function draw() {
	// put drawing code here

	noStroke();
	fill(0, 100, 100);

	if (features.shape_type == 'ellipse') {
		ellipse(mouseX, mouseY, 100, 100);
	}
	if (features.shape_type == 'rectangle') {
		rectMode(CENTER);
		rect(mouseX, mouseY, 100, 100);
	}
}
