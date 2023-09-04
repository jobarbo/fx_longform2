let features = '';
let noiseMax = 0;

let phase = 0;
let phase_inc = 0;
let max_radius = 50;
let p_size = 1;
let hue = 0;
let sat = 0;
let brightness = 100;

let clear = true;
function setup() {
	//console.log(features);
	features = $fx.getFeatures();
	createCanvas(windowWidth, windowHeight);

	let formatMode = features.format_mode;
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(4.0);
	}

	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	background(0);
}

function draw() {
	// put drawing code here
	if (clear) {
		background(0);
	} else {
		background(0, 0, 0, 1);
	}

	if (kname == '32') {
		noiseMax = map(int(kval), 0, 100, 0, 10, true);
	}
	if (kname == '33') {
		phase_inc = map(int(kval), 0, 100, 0, 0.1, true);
	}
	if (kname == '34') {
		max_radius = map(int(kval), 0, 100, 50, width, true);
	}
	if (kname == '35') {
		p_size = map(int(kval), 0, 100, 0, 2, true);
	}

	// if midi button 40 is pressed, toggle clear
	if (kname == '40' && kval > 50) {
		clear = !clear;
		console.log(clear);
		return;
	}

	translate(width / 2, height / 2);
	strokeWeight(1);
	stroke(hue, sat, brightness, 100);
	noFill();
	let vertex_array = [];
	//let noiseMax = slider.value();
	//let t = 0;
	beginShape();
	for (let a = 0; a < TWO_PI; a += 0.01) {
		let yoff = map(cos(a - phase), -1, 1, 0, noiseMax);
		let xoff = map(sin(a + phase), -1, 1, 0, noiseMax);
		let r = map(noise(xoff, yoff), 0, 1, 0, max_radius);
		let x = r * cos(a);
		let y = r * sin(a);
		curveVertex(x, y);
		vertex_array.push({x: x, y: y});
	}

	curveVertex(vertex_array[0].x, vertex_array[0].y);
	curveVertex(vertex_array[1].x, vertex_array[1].y);
	curveVertex(vertex_array[2].x, vertex_array[2].y);

	endShape(CLOSE);
	phase += phase_inc;
	for (let i = 0; i < vertex_array.length; i++) {
		strokeWeight(p_size);
		stroke(hue, sat, brightness, 100);
		point(vertex_array[i].x, vertex_array[i].y);
	}
	//noLoop();
}
