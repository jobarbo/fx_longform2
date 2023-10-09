let features = '';
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
		pixelDensity(1);
	} else {
		pixelDensity(2);
	}
	createCanvas(16 * 100, 16 * 100);
	colorMode(HSB, 360, 100, 100, 100);
	seed = random(10000000);
	randomSeed(seed);
	INIT(seed);
}

function draw() {
	for (let i = 0; i < movers.length; i++) {
		for (let t = 0; t < 1; t++) {
			movers[i].show();
			movers[i].move();
		}
	}
	if (frameCount > 1500) {
		console.log('done');
		noLoop();
	}
}
/* function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(seed);
}
 */
function INIT(seed) {
	movers = [];
	scl1 = random([0.0005]);
	scl2 = random([0.0025]);
	scl3 = random([0.005]);

	let hue = random(360);

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;

	console.log('sclOffset1', sclOffset1);
	console.log('sclOffset2', sclOffset2);
	console.log('sclOffset3', sclOffset3);

	console.log('scl1', scl1);
	console.log('scl2', scl2);
	console.log('scl3', scl3);

	xMin = 0.25;
	xMax = 0.85;
	yMin = 0.25;
	yMax = 0.85;
	/* 	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01; */

	for (let i = 0; i < 12000; i++) {
		// distribue the movers within a circle using polar coordinates
		/* 		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 50;
		let y = height / 2 + r * sin(theta) * 50; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		//let hueOffset = map(x, xMin * width, xMax * width, -10, 10);
		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				initHue,
				scl1,
				scl2,
				scl3,
				sclOffset1,
				sclOffset2,
				sclOffset3,
				xMin,
				xMax,
				yMin,
				yMax,
				isBordered,
				seed
			)
		);
	}
	let bgCol = spectral.mix('#000', '#fff', 0.038);
	background(bgCol);
}
