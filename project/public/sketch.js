let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 1200;
let DIM;
let MULTIPLIER;
//let MAX_FRAMES = 700;

let particle_num = 10000;

let xoff = 0.6;
let yoff = 0.001;

let xi = Math.random * 1000000000000;
let yi = Math.random * 1000000000000;

let pos_range;
//! Standard noise
let n_range_min = 0;
let n_range_max = 1;
//! Custom noise
/* let n_range_min = -1;
let n_range_max = 1; */

let hue = 0;
let sat = 0;
let bri = 0;

let displacement1 = 0;
let displacement2 = 100;

let base_angle = 0;
// let angle = [0, 45, 90];
// let angle = [0, 45, 90, 180, 225, 270];
// let angle1 = [0, 45, 90, 135, 180, 225, 270, 315];
// let angle1 = [45, 225];
//let angle1 = [45, 135, 225, 315];
// let angle1 = [0, 90, 180, 270];
// let angle1 = [90, 270];
//let angle1 = [45];
// let angle2 = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340]);
let angle1 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350];
let angle2 = 0;

let MAX_FRAMES = Math.floor(mapValue(angle1.length, 1, 36, 700, 1700));

console.log(MAX_FRAMES);

let nx_scale = 0.00005;
let ny_scale = 0.00005;
/* let nx_scale = 0.001;
let ny_scale = 0.001; */

let skipperMax = 0;

let xRandSkipperVal;
let yRandSkipperVal;

let xRandSkipper = 0;
let yRandSkipper = 0;

let apertureLow = 0.001;
let apertureHigh = 2;

let xoff_l = 0;
let xoff_h = 1;
let yoff_l = 0.5;
let yoff_h = 1;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	C_WIDTH = min(DEFAULT_SIZE * CM, DEFAULT_SIZE * CM);
	MULTIPLIER = C_WIDTH / DEFAULT_SIZE;
	c = createCanvas(windowWidth, windowHeight * RATIO);
	pixelDensity(dpi(maxDPI));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	//background(45, 0, 4);
	//background(45, 10, 100);
	// make a radial gradient background in vanilla js
	drawingContext.globalCompositeOperation = "source-over";
	let gradient = drawingContext.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
	gradient.addColorStop(0.5, "hsl(25, 100%, 98%)");
	gradient.addColorStop(1, "hsl(36, 100%, 95%)");
	drawingContext.fillStyle = gradient;
	drawingContext.fillRect(0, 0, width, height);

	xi = random(1000000000000);
	yi = random(1000000000000);
	pos_range = width / 1.75;

	xRandSkipperVal = random([0.01, random([0.1, 1, 2, 5, 10, 25, 50, 100])]);
	yRandSkipperVal = xRandSkipperVal;
}

function draw() {
	// Draw with p5.js things
	//blendMode(SCREEN);
	displacement2 = random([100, 200, 300]);
	translate(width / 2, height / 2);

	let scale1 = 1;
	let scale2 = 1;
	//xoff_l = map(frameCount, MAX_FRAMES / 22.5, MAX_FRAMES / 2, 0, 0.4999, true);
	//xoff_h = map(frameCount, MAX_FRAMES / 22.5, MAX_FRAMES / 2, 1, 0.5001, true);
	yoff_l = map(frameCount, 0, MAX_FRAMES / 2, 0.8, 0.99, true);
	//yoff_h = map(frameCount, 0, MAX_FRAMES / 2, 1, 0.5, true);
	push();
	rotate(random(angle1));
	scale(scale1);
	paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale1);
	/* 	paint(random([0.15, 0.5, 0.75]), random([0.51, 1, 1.25]), random([0.15, 0.5, 0.75]), random([0.51, 1, 1.25]), particle_num, xi, yi, scale1); */
	pop();
	/* 	push();
	rotate(angle2);
	translate(0, displacement2);
	scale(scale2);
	paint(0.4, 0.6, 0.1, 0.9, particle_num, xi, yi, scale2);
	pop(); */
	blendMode(BLEND);

	if (frameCount >= MAX_FRAMES) {
		document.complete = true;
		noLoop();
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale) {
	for (let s = 0; s < particle_num; s++) {
		xoff = random(xoff_l, xoff_h);
		yoff = random(yoff_l, yoff_h);
		//noiseDetail(5, 0.5);
		//! Simple Block
		/* 		let x = map(noise(xoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//! Electron microscope
		/* 		let x = map(noise(xoff, yoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		/* 		let x = map(oct(xoff, yoff, nx_scale, 1, 1), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(oct(yoff, xoff, ny_scale, 1, 1), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//!block Rect
		/* 		let x = map(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true); */
		/* 		let y = map(noise(yoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Yin Yang
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Equilibrium
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings
		/* 		let x = map(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 2
		/* 		let x = map(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 3
		let x = map(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);

		/* 		let x = map(noise(yoff, xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings Asymmetrical
		/* 		let x = map(noise(xoff, random([xoff, yoff, xi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Hybrid Drapery Blocks
		/* let x = map(noise(xoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!complex organism (aliens)
		/* 		let x = map(noise(xoff, yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		skipperMax = map(frameCount, MAX_FRAMES / 100, MAX_FRAMES / 1.5, apertureHigh, apertureLow, true);

		xRandSkipperVal = random(0.01, [random(0.00001, skipperMax)]);
		yRandSkipperVal = xRandSkipperVal;

		xRandSkipper = randomGaussian(0, xRandSkipperVal);
		yRandSkipper = randomGaussian(0, yRandSkipperVal);

		//let w = map(scale, 0, 2, 0.3, 0.1, true);
		//let w = 0.25;
		let dist_center = dist(0, 0, x, y);
		//let w = map(dist_center, 0, pos_range / 2, 0.2, 0.2, true);
		let w = map(frameCount, MAX_FRAMES / 5, MAX_FRAMES / 1.5, 0.22, 0.15, true);
		let elW = w * MULTIPLIER;
		let ab_x = x + xRandSkipper;
		let ab_y = y + yRandSkipper;

		hue = map(sqrt(ab_x * ab_x + ab_y * ab_y), 0, pos_range / 1.7, 360, 210, true);
		sat = map(frameCount, 0, MAX_FRAMES / 2.5, 60, 100, true);
		bri = map(frameCount, MAX_FRAMES / 3.5, MAX_FRAMES / 2, 100, 60, true);

		noStroke();
		fill(hue, sat, bri, 100);
		rect(ab_x, ab_y, elW, elW);

		xi += 0.0000000000000000000001;
		yi += 0.0000000000000000000001;
	}
}
