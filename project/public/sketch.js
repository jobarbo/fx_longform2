let features = "";
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
let xRandDivider, yRandDivider;
let easeAng = 0,
	easeScalar = 0.001,
	easeScalar2 = 200,
	cycleCount = 0,
	xi = 0,
	yi = 0,
	xoff = Math.random() * 10000,
	yoff = Math.random() * 10000,
	axoff = Math.random() * 10000,
	ayoff = Math.random() * 10000,
	sxoff = Math.random() * 10000,
	syoff = Math.random() * 10000;
({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

let video_duration = 1; //seconds
let video_fps = 25;
let current_video_frame = 0;
let total_video_frames = video_duration * video_fps;

function setup() {
	features = $fx.getFeatures();
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(2.0);
	}

	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 130;
	c = createCanvas(1080, 1920);
	rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	xRandDivider = random([0.08]);
	yRandDivider = xRandDivider;
	xoff = random(1000000);
	yoff = random(1000000);
	axoff = random(1000000);
	ayoff = random(1000000);
	sxoff = random(1000000);
	syoff = random(1000000);
	scl1 = random([0.0018]);
	scl2 = random([0.0018]);

	ang1 = 1200;
	ang2 = 1200;

	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	INIT(rseed);
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

	if (frameCount % 25 == 0) {
		let cosIndex = cos(radians(easeAng));
		console.log("cosIndex: " + cosIndex);
		if (current_video_frame < total_video_frames) {
			current_video_frame++;
			movers = [];
			//saveArtwork();
			elapsedTime = 0;
			frameCount = 0;
			INIT(rseed);
		} else {
			noLoop();
		}
		console.log("cycleCount: " + cycleCount);
	}
}

function INIT(seed) {
	let easing = easeAng;
	let cosEasing = cos(easing);
	let xpff;
	/* 	scl1 += map(noise(sxoff, syoff), 0, 0.95, -0.000005, 0.000005, true);
	scl1 = constrain(scl1, 0, 0.1);
	scl2 += map(noise(syoff, sxoff), 0, 0.95, -0.000005, 0.000005, true);
	scl2 = constrain(scl2, 0, 0.1); */
	/* 	ang1 += int(map(noise(axoff, ayoff), 0, 0.95, -1, 1, true));
	ang1 = constrain(ang1, 0, 2000);
	ang2 += int(map(noise(ayoff, axoff), 0, 0.95, -1, 1, true));
	ang2 = constrain(ang2, 0, 2000);*/
	let angle1 = ang1;
	let angle2 = ang2;

	scl1 = map(cosEasing, -1, 1, 0.0022, 0.0007, true);
	scl2 = map(cosEasing, -1, 1, 0.0007, 0.0022, true);

	angle1 = int(map(cos(easing), -1, 1, 500, 1600, true));
	angle2 = int(map(cos(easing), -1, 1, 1600, 500, true));

	//angle1 = int(map(cos(easing), -1, 1, 0, 2000, true));
	/* 	xi += map(noise(xoff), 0, 0.9, -1 * MULTIPLIER, 1 * MULTIPLIER, true);
	yi += map(noise(yoff), 0, 0.9, -1 * MULTIPLIER, 1 * MULTIPLIER, true); */

	console.log("xi: " + xi);
	console.log("yi: " + yi);

	// easeAng increment should make the easing function complete a full cycle in the total_video_frames
	let easeAngIncrement = PI / (total_video_frames / 2);
	easeAng += easeAngIncrement;
	console.log("easeAng: " + easeAng);
	console.log("easeAngIncrement: " + easeAngIncrement);
	console.log("current_video_frame: " + current_video_frame);
	xoff += 0.001;
	yoff += 0.001;
	axoff += 0.0025;
	ayoff += 0.0025;
	sxoff += 0.007;
	syoff += 0.007;

	console.log("scl1: " + scl1);
	console.log("scl2: " + scl2);
	console.log("ang1: " + angle1);
	console.log("ang2: " + angle2);

	console.log("cos(easing): " + cos(easing));

	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01;

	for (let i = 0; i < 50000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;
		let initHue = hue + random(-1, 1);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, xi, yi, initHue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, angle1 * MULTIPLIER, angle2 * MULTIPLIER, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, easing, features));
	}
	bgCol = color(random(0, 360), random([0, 2]), features.theme == "bright" ? 93 : 10, 100);
	background(bgCol);
}
