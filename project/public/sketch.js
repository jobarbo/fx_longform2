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
let maxFrames = 600;
let C_WIDTH;
let MULTIPLIER;
let drawing = false;
let hue = Math.random() * 360;
let elapsedTime = 0;
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
	MULTIPLIER = C_WIDTH / 600;
	c = createCanvas(C_WIDTH, C_WIDTH);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	xoff = random(1000000);
	yoff = random(1000000);
	axoff = random(1000000);
	ayoff = random(1000000);
	sxoff = random(1000000);
	syoff = random(1000000);
	scl1 = random(0.002, 0.0023);
	scl2 = scl1;
	ang1 = 100;
	ang2 = 800;

	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	INIT(rseed);
	bgCol = color(random(0, 360), random([0, 2, 5]), features.theme == 'bright' ? 93 : 10, 100);
	background(bgCol);
}

function draw() {
	blendMode(ADD);
	elapsedTime = frameCount - startTime;
	for (let i = 0; i < movers.length; i++) {
		for (let j = 0; j < 1; j++) {
			if (elapsedTime > 1) {
				movers[i].show();
			}
			movers[i].move();
		}
	}
	blendMode(BLEND);

	if (frameCount % 100 == 0) {
		let cosIndex = cos(radians(easeAng));
		console.log('cosIndex: ' + cosIndex);
		if (cosIndex >= 1) {
			cycleCount += 1;
		}
		if (cycleCount < 1) {
			movers = [];
			console.log('screenshot');
			saveArtwork();
			elapsedTime = 0;
			frameCount = 0;

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
	scl1 += map(noise(sxoff, syoff), 0, 1, -0.00001, 0.00001, true);
	scl2 = scl1;

	angle1 = int(map(noise(axoff, ayoff), 0, 1, 0, ang1 * 2, true));
	angle2 = int(map(noise(ayoff, axoff), 0, 1, 0, ang2 * 2, true));
	//angle1 = int(map(cos(easing), -1, 1, 0, 2000, true));
	xi += map(noise(xoff), 0, 1, -50 * MULTIPLIER, 50 * MULTIPLIER, true);
	yi += map(noise(yoff), 0, 1, -50 * MULTIPLIER, 50 * MULTIPLIER, true);
	hue += map(noise(xoff, yoff), 0, 1, -2, 2, true);
	hue < 0 ? hue + 360 : hue > 360 ? hue - 360 : hue;

	console.log('xi: ' + xi);
	console.log('yi: ' + yi);

	easeAng += 10;
	xoff += 0.001;
	yoff += 0.001;
	axoff += 0.001;
	ayoff += 0.001;
	sxoff += 0.001;
	syoff += 0.001;

	console.log('scl1: ' + scl1);
	console.log('scl2: ' + scl2);
	console.log('ang1: ' + angle1);
	console.log('ang2: ' + angle2);

	console.log('cos(easing): ' + cos(easing));

	xRandDivider = random([0.07]);
	yRandDivider = xRandDivider;
	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01;

	for (let i = 0; i < 10000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;
		let initHue = hue + random(-1, 1);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(
			new Mover(
				x,
				y,
				xi,
				yi,
				initHue,
				scl1 / MULTIPLIER,
				scl2 / MULTIPLIER,
				angle1 * MULTIPLIER,
				angle2 * MULTIPLIER,
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
	let bgCol = spectral.mix('#000', '#deb887', 0.1);
	background(bgCol);
}
