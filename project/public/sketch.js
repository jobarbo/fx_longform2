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
let startTime;
let maxFrames = 60;
let C_WIDTH;
let MULTIPLIER;

({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

P5Capture.setDefaultOptions({
	format: 'mp4',
	framerate: 5,
});

function setup() {
	features = $fx.getFeatures();
	console.log(features);
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(3.0);
	}

	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 1600;
	c = createCanvas(C_WIDTH, C_WIDTH * 1.375);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	INIT(rseed);
}

function draw() {
	for (let i = 0; i < movers.length; i++) {
		for (let j = 0; j < 1; j++) {
			movers[i].show();
			movers[i].move();
		}
	}

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

function INIT(seed) {
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

	xRandDivider = random([0.08, 0.09, 0.1, 0.11, 0.12]);
	yRandDivider = xRandDivider;
	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01;

	let hue = random(360);
	for (let i = 0; i < 10000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;
		let initHue = hue + random(-1, 1);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				initHue,
				scl1 / MULTIPLIER,
				scl2 / MULTIPLIER,
				ang1 * MULTIPLIER,
				ang2 * MULTIPLIER,
				xMin,
				xMax,
				yMin,
				yMax,
				xRandDivider,
				yRandDivider,
				seed,
				features
			)
		);
	}

	bgCol = color(random(0, 360), random([0, 2, 5]), features.theme == 'bright' ? 93 : 10, 100);

	background(bgCol);
}
