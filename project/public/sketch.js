let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 1200;
let DIM;
let MULTIPLIER;
let xoff = 0.6;
let yoff = 0.3;

let xi = Math.random * 1000000000000;
let yi = Math.random * 1000000000000;

let pos_range_x;
let pos_range_y;
//! Standard noise
let n_range_min = 0;
let n_range_max = 1;
//! Custom noise
/* let n_range_min = -1;
let n_range_max = 1; */

let hue = 0;
let sat = 0;
let bri = 0;
let bri_min = 60;

let displacement1 = 0;
let displacement2 = 100;

//let angle1 = [45, 105, 165, 225, 285, 345];
//let angle1 = [0, 45, 90, 135, 180, 225, 270, 315];
//let angle1 = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
//let angle1 = [45, 225];
//let angle1 = [45, 135, 225, 315];
let angle1 = [0, 90, 180, 270];
//let angle1 = [0, 45, 90];
//let angle1 = [0, 90, 270];
//let angle1 = [180, 270];
//let angle1 = [90, 270];
//let angle1 = [45];
//let angle1 = [5, 25, 45, 65, 85, 105, 125, 145, 165, 185, 205, 225, 245, 265, 285, 305, 325, 345];
// let angle1 = [85, 105, 125, 145, 305, 325, 345, 5]; //! y-axis asymmetry
//let angle1 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350];
//let angle1 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 315, 320, 325, 330, 335, 340, 345, 350, 355];

let animation;
let drawing = true;
let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;

let MAX_FRAMES = Math.floor(mapValue(angle1.length, 1, 36, 700, 1400));
let particle_num = Math.floor(20000 / angle1.length);

let cycle = Math.floor(mapValue(angle1.length, 1, 36, 1, 20));
//let cycle = parseInt(MAX_FRAMES / angle1.length);

console.log(cycle);

let nx_scale = 0.00005;
let ny_scale = 0.00005;
/* let nx_scale = 0.001;
let ny_scale = 0.001; */

let skipperMax = 0;
let xRandSkipperVal;
let yRandSkipperVal;
let xRandSkipper = 0;
let yRandSkipper = 0;
let apertureLow = 0.01;
let apertureHigh = 0.01;
let xoff_l_init = 0.6;
let xoff_l = xoff_l_init;
let xoff_h = 1;
let yoff_l_init = 0.6;
let yoff_l = yoff_l_init;
let yoff_h = 1;
let cos_val;
let angle_index = 0;

function setup() {
	features = $fx.getFeatures();

	elapsedTime = 0;
	framesRendered = 0;
	drawing = true;
	startTime = frameCount;
	renderStart = Date.now();

	C_WIDTH = min(DEFAULT_SIZE * CM, DEFAULT_SIZE * CM);
	MULTIPLIER = C_WIDTH / DEFAULT_SIZE;
	c = createCanvas(C_WIDTH, C_WIDTH * RATIO);
	pixelDensity(dpi(maxDPI));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	//background(45, 0, 5);
	//background(45, 0, 100);
	drawingContext.globalCompositeOperation = "source-over";
	let gradient = drawingContext.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
	gradient.addColorStop(0.5, "hsl(25, 100%, 95%)");
	gradient.addColorStop(0.8, "hsl(36, 100%, 95%)");
	drawingContext.fillStyle = gradient;
	drawingContext.fillRect(0, 0, width, height);

	xi = random(1000000000000);
	yi = random(1000000000000);
	pos_range_x = width / 1.3;
	pos_range_y = width / 1.3;

	xRandSkipperVal = random([0.01, random([0.1, 1, 2, 5, 10, 25, 50, 100])]);
	yRandSkipperVal = xRandSkipperVal;

	let sketch = drawGenerator();
	function animate() {
		animation = setTimeout(animate, 0);
		sketch.next();
	}
	animate();
}

function* drawGenerator() {
	let count = 0;
	let generator_frameCount = 0;
	let draw_every = cycle;
	translate(width / 2, height / 2);

	while (true) {
		// Draw with p5.js things
		//blendMode(SCREEN);
		/* 		cos_val = cos(generator_frameCount * 10);
		sin_val = cos(generator_frameCount * 10);
		noise_cos = sin(generator_frameCount * 50); */
		// 40,45(5), 48,50,54,60,100
		cos_val = tan(generator_frameCount * 10);
		sin_val = tan(generator_frameCount * 10);
		noise_cos = tan(generator_frameCount * 500);
		// 15,25,100,500

		let scale1 = 1;
		let scale2 = 0.6;
		let xoff_l_high;
		let xoff_l_low;
		for (let i = 0; i < angle1.length; i++) {
			switch (i) {
				case 0:
					xoff_l_low = map(noise_cos, -1, 1, 1, 0.3, true);
					xoff_l_high = map(noise_cos, -1, 1, 1, 0, true);
					break;
				case 1:
					xoff_l_low = map(noise_cos, 1, -1, 2, 1.3, true);
					xoff_l_high = map(noise_cos, 1, -1, 2, 1, true);
					break;
				case 2:
					xoff_l_low = map(noise_cos, -1, 1, 3, 2.3, true);
					xoff_l_high = map(noise_cos, -1, 1, 3, 2, true);
					break;
				case 3:
					xoff_l_low = map(noise_cos, 1, -1, 4, 3.3, true);
					xoff_l_high = map(noise_cos, 1, -1, 4, 3, true);
					break;
				case 4:
					xoff_l_low = map(noise_cos, -1, 1, 5, 4.3, true);
					xoff_l_high = map(noise_cos, -1, 1, 5, 4, true);
					break;
				case 5:
					xoff_l_low = map(noise_cos, 1, -1, 6, 5.3, true);
					xoff_l_high = map(noise_cos, 1, -1, 6, 5, true);
					break;
				case 6:
					xoff_l_low = map(noise_cos, -1, 1, 7, 6.3, true);
					xoff_l_high = map(noise_cos, -1, 1, 7, 6, true);
					break;
				case 7:
					xoff_l_low = map(noise_cos, 1, -1, 8, 7.3, true);
					xoff_l_high = map(noise_cos, 1, -1, 8, 7, true);
					break;
			}
			/* 		xoff_l_low = 0.4;
			xoff_l_high = 0.99; */
			xoff_h = xoff_l_high + 0.001;
			yoff_h = xoff_l_high + 0.001;

			xoff_l = map(cos_val, -1, 0, xoff_l_high, xoff_l_low, true);
			yoff_l = map(cos_val, 0, 1, xoff_l_low, xoff_l_high, true);
			push();
			rotate(angle1[i]);
			scale(scale1);
			paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale1, cos_val);
			pop();

			if (count >= draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = generator_frameCount - startTime;

		showLoadingBar(elapsedTime, MAX_FRAMES, renderStart);

		generator_frameCount++;
		if (elapsedTime > MAX_FRAMES && drawing) {
			window.rendered = c.canvas;
			//hl.token.capturePreview();
			document.complete = true;
			// calculate the time it took to render the image
			let endTime = Date.now();
			let timeDiff = endTime - renderStart;
			console.log("Render time: " + timeDiff + " ms");

			noLoop();
			return;
		}
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale, cos_val) {
	for (let s = 0; s < particle_num; s++) {
		xoff = random(xoff_l, xoff_h);
		yoff = random(yoff_l, yoff_h);
		noiseDetail(2, 0.9);
		//! Simple Block
		/* 		let x = map(noise(xoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		//! Electron microscope
		/* 		let x = map(noise(xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		/* 		let x = map(oct(xoff, yoff, nx_scale, 1, 1), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(oct(yoff, xoff, ny_scale, 1, 1), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		//!block Rect
		/* 	let x = map(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, yoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! block Rect 2
		/* 		let x = map(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, yoff, xi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//!Drapery Yin Yang
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//!Drapery Equilibrium
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Jellyfish
		/* 		let x = map(noise(xoff, xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Astral Beings
		/* let x = map(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		//! Astral Beings 2
		let x = map(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);

		//! Astral Beings 3
		/* 		let x = map(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		/* 		let x = map(noise(yoff, xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(xoff, yoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Astral Beings Asymmetrical
		/* 		let x = map(noise(xoff, random([xoff, yoff, xi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Hybrid Drapery Blocks
		/* 		let x = map(noise(xoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//!complex organism (aliens)
		/* 		let x = map(noise(xoff, yoff, random([xoff, xi, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = map(noise(yoff, xoff, random([yoff, xi, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//skipperMax = map(elapsedTime, MAX_FRAMES / 100, MAX_FRAMES / 1.5, apertureHigh, apertureLow, true);
		skipperMax = map(abs(cos_val), 0, 1, apertureHigh, apertureLow, true);

		xRandSkipperVal = 0;
		yRandSkipperVal = xRandSkipperVal;

		xRandSkipper = randomGaussian(0, xRandSkipperVal);
		yRandSkipper = randomGaussian(0, yRandSkipperVal);

		let w = map(abs(cos_val), 0.0, 1, 0.1, 0.15, true);

		let elW = w * MULTIPLIER;
		let ab_x = x + xRandSkipper;
		let ab_y = y + yRandSkipper;

		hue = map(abs(cos_val), 0, 1, 360, 190, true);
		sat = map(elapsedTime, 0, MAX_FRAMES / 2.5, 100, 100, true);
		bri_min = map(elapsedTime, MAX_FRAMES / 2, MAX_FRAMES / 1, 0, 80, true);
		bri_max = map(elapsedTime, MAX_FRAMES / 2, MAX_FRAMES / 1, 0, 30, true);
		bri = map(abs(sin_val), 0, 1, 100 - bri_max, 80 - bri_min, true);

		noStroke();
		//fill(0, 75, 10, 100);
		fill(hue, sat, bri, 100);
		rect(ab_x, ab_y, elW, elW);
	}
}

function showLoadingBar(elapsedTime, MAX_FRAMES, renderStart) {
	framesRendered++;
	let currentTime = Date.now();
	totalElapsedTime = currentTime - renderStart;

	let percent = (elapsedTime / MAX_FRAMES) * 100;
	if (percent > 100) percent = 100;

	let averageFrameTime = totalElapsedTime / framesRendered;

	let remainingFrames = MAX_FRAMES - framesRendered;
	let estimatedTimeRemaining = averageFrameTime * remainingFrames;

	// Convert milliseconds to seconds
	let timeLeftSec = Math.round(estimatedTimeRemaining / 1000);

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + "%";
	// show a loading bar on the bottom of the canvas
}
