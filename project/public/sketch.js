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
let drawing = false;
let hue = Math.random() * 360;
let easeAng = 0,
	easeScalar = 0.001,
	easeScalar2 = 200,
	cycleCount = 0,
	xi = 0,
	yi = 0,
	xoff = Math.random() * 10000,
	yoff = Math.random() * 10000,
	axoff = Math.random() * 10000,
	ayoff = Math.random() * 10000;
(sxoff = Math.random() * 10000), (syoff = Math.random() * 10000);

/* P5Capture.setDefaultOptions({
	format: 'mp4',
}); */
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
	//createCanvas((16 * 300) / 3, (16 * 300) / 3);
	createCanvas(1080, 1920);
	colorMode(HSB, 360, 100, 100, 100);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);

	scl1 = random(0.005, 0.005);
	scl2 = scl1;
	ang1 = int(random(500, 1000));
	ang2 = int(random(500, 1000));

	INIT(rseed);
}

function draw() {
	// put drawing code here
	for (let i = 0; i < movers.length; i++) {
		movers[i].show();
		movers[i].move();
	}

	// every 100 frames, save the canvas

	if (frameCount % 100 == 0) {
		let cosIndex = cos(radians(easeAng));
		console.log('cosIndex: ' + cosIndex);
		if (cosIndex >= 1) {
			cycleCount += 1;
		}
		if (cycleCount < 1) {
			console.log('screenshot');
			saveArtwork();
			INIT(rseed);
		} else {
			noLoop();
		}
		console.log('cycleCount: ' + cycleCount);
	}
}

/* function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(rseed);
}
 */
function INIT(seed) {
	movers = [];
	let easing = radians(easeAng);
	let xpff;
	scl1 += map(noise(sxoff, syoff), 0, 1, -0.0001, 0.0001, true);
	scl2 = scl1;

	angle1 = int(map(noise(axoff, ayoff), 0, 1, 0, ang1 * 2, true));
	angle2 = int(map(noise(ayoff, axoff), 0, 1, 0, ang2 * 2, true));
	//angle1 = int(map(cos(easing), -1, 1, 0, 2000, true));
	xi += map(noise(xoff), 0, 1, -50, 50, true);
	yi += map(noise(yoff), 0, 1, -50, 50, true);
	hue += map(noise(xoff, yoff), 0, 1, -2, 2, true);
	hue < 0 ? hue + 360 : hue > 360 ? hue - 360 : hue;

	console.log('xi: ' + xi);
	console.log('yi: ' + yi);

	easeAng += 1;
	xoff += 0.001;
	yoff += 0.001;
	axoff += 0.01;
	ayoff += 0.01;
	sxoff += 0.01;
	syoff += 0.01;

	console.log('scl1: ' + scl1);
	console.log('scl2: ' + scl2);
	console.log('ang1: ' + angle1);
	console.log('ang2: ' + angle2);

	console.log('cos(easing): ' + cos(easing));

	xMin = 0.2;
	xMax = 0.8;
	yMin = 0.1;
	yMax = 0.9;
	/* 	xMin = -0.15;
	xMax = 1.15;
	yMin = -0.15;
	yMax = 1.15; */

	for (let i = 0; i < 40000; i++) {
		/* 		// distribue the movers within a circle using polar coordinates
		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = width / 2 + r * cos(theta) * 100;
		let y = height / 2 + r * sin(theta) * 100; */

		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue + random(-10, 10);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, xi, yi, initHue, scl1, scl2, angle1, angle2, xMin, xMax, yMin, yMax, isBordered, seed));
	}
	let bgCol = spectral.mix('#000', '#deb887', 0.1);
	background(bgCol);
}
