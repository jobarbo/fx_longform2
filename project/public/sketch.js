let features = "";

let palette = [
	{
		h: 267,
		s: 72,
		l: 63,
	},
	{
		h: 324,
		s: 84,
		l: 65,
	},
	{
		h: 52,
		s: 99,
		l: 62,
	},
	{
		h: 195,
		s: 100,
		l: 49,
	},
	{
		h: 172,
		s: 100,
		l: 48,
	},
];

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
/* let angle1 = [0, 45, 90, 135, 180, 225, 270, 315]; */
//let angle1 = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
//let angle1 = [45, 225];
//let angle1 = [45, 135, 225, 315];
//let angle1 = [0, 90, 180, 270];
//let angle1 = [0, 45, 90];
//let angle1 = [0, 90, 270];
//let angle1 = [180, 270];
//let angle1 = [90, 270];
let angle1 = [45];
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

let nx_scale = 0.00005;
let ny_scale = 0.00005;
/* let nx_scale = 0.001;
let ny_scale = 0.001; */

let skipperMax = 0;
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

const offValues_l = [
	{low: 2, high: 1.15}, // case 0
	{low: 1, high: 0.15}, // case 1
	{low: 2, high: 1.15}, // case 2
	{low: 3, high: 2.15}, // case 3
	{low: 4, high: 3.15}, // case 4
	{low: 5, high: 4.15}, // case 5
	{low: 4, high: 3.15}, // case 6
	{low: 3, high: 2.15}, // case 7
	// Add more if needed
];

const offValues_h = [
	{low: 2.15, high: 1}, // case 0
	{low: 1.15, high: 0}, // case 1
	{low: 2.15, high: 1}, // case 2
	{low: 3.15, high: 2}, // case 3
	{low: 4.15, high: 3}, // case 4
	{low: 5.15, high: 4}, // case 5
	{low: 4.15, high: 3}, // case 6
	{low: 3.15, high: 2}, // case 7
	// Add more if needed
];

function setup() {
	features = $fx.getFeatures();

	console.log(features);

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
	pos_range_x = width * 1;
	pos_range_y = width * 1;

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
		cos_val = cos(generator_frameCount * 10);
		sin_val = cos(generator_frameCount * 50);
		noise_cos = sin(generator_frameCount * 125);
		off_cos = sin(generator_frameCount * 150);
		nd_cos = sin(generator_frameCount * 125);
		//noise_cos: 25,40,45(5), 48,50,54,60,100

		//cos_val = 125;//!test
		//sin_val = 125;//!test
		//n_cos = 125;//!test
		//off_cos = 250;//!test

		/* 	cos_val = tan(generator_frameCount * 10);
		sin_val = tan(generator_frameCount * 10);
		noise_cos = tan(generator_frameCount * 30);
		off_cos = tan(generator_frameCount * 50); */
		// noise_cos: 6,8,9,10,11 / 12, 15,18,20,25,30,35,36,40,45(stable),50,54,60(stable)70,75,80,90(stable),100,200,500
		// off_cos: 26,30,50,60,150,500,1250,1500
		//35+26 together with low noise ;)

		let scale1 = 1;
		let xoff_l_high;
		let xoff_l_low;
		for (let i = 0; i < angle1.length; i++) {
			xoff_l_high = mapValue(noise_cos, -1, 1, offValues_l[i].high, offValues_l[i].low, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_h[i].high, offValues_h[i].low, true);
			/* 		xoff_l_low = 0.4;
			xoff_l_high = 0.99; */

			xoff_h = xoff_l_high + 0.001;
			yoff_h = xoff_l_high + 0.001;
			// 0.001,0.0025,0.005,0.007,0.01,0.025,0.05,0.07
			// peut aussi etre alterné

			/* 			xoff_l = mapValue(cos_val, -1, 0, xoff_l_high, xoff_l_low, true);
			yoff_l = mapValue(cos_val, 0, 1, xoff_l_low, xoff_l_high, true); */

			xoff_l = mapValue(off_cos, -1, 1, xoff_l_high, xoff_l_low, true);
			yoff_l = mapValue(off_cos, -1, 1, xoff_l_low, xoff_l_high, true);
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
		let nd = floor(map(abs(nd_cos), 0, 1, 1, 6, true));
		let ni = map(nd, 1, 6, 0.5, 0.5, true);
		noiseDetail(nd, ni);
		//! Simple Block
		/* 		let x = mapValue(noise(xoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		//! Electron microscope
		/*let x = mapValue(noise(xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		/* 		let x = mapValue(oct(xoff, yoff, nx_scale, 1, 1), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(oct(yoff, xoff, ny_scale, 1, 1), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		//!block Rect
		/*let x = mapValue(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, yoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! block Rect 2
		/*let x = mapValue(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, yoff, xi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);*/

		//!Drapery Yin Yang
		/* let x = mapValue(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);*/

		//!Drapery Equilibrium
		/* 	let x = mapValue(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true); */
		/* let y = mapValue(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);*/

		//! Jellyfish
		/* 		let x = mapValue(noise(xoff, xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Astral Beings
		/* 		let x = mapValue(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
		//! Astral Beings 2
		let x = mapValue(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);

		//! Astral Beings 3
		/* 		let x = mapValue(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! astral beings 4
		/* 		let x = mapValue(noise(yoff, xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(xoff, yoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Astral Beings Asymmetrical
		/* 		let x = mapValue(noise(xoff, random([xoff, yoff, xi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//! Hybrid Drapery Blocks
		/* 		let x = mapValue(noise(xoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		//!complex organism (aliens)
		/* 		let x = mapValue(noise(xoff, yoff, random([xoff, xi, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, xoff, random([yoff, xi, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

		let w = mapValue(abs(cos_val), 0, 1, 0.12, 0.2, true);
		let elW = w * MULTIPLIER;
		let ab_x = x * MULTIPLIER;
		let ab_y = y * MULTIPLIER;

		/* 		let index = Math.floor(mapValue(abs(noise_cos), 0, 1, 0, palette.length - 1, true));

		hue = palette[index].h;
		sat = palette[index].s;
		b = palette[index].l; */

		hue = mapValue(abs(cos_val), 0, 1, 360, 190, true);
		sat = mapValue(elapsedTime, 0, MAX_FRAMES / 2.5, 100, 100, true);
		bri_min = mapValue(elapsedTime, MAX_FRAMES / 1.1, MAX_FRAMES / 1, 0, 80, true);
		bri_max = mapValue(elapsedTime, MAX_FRAMES / 1.1, MAX_FRAMES / 1, 0, 15, true);
		bri = mapValue(abs(sin_val), 1, 0, 50 - bri_max, 40 - bri_min, true);
		alpha = mapValue(elapsedTime, MAX_FRAMES / 2, MAX_FRAMES / 1, 100, 100, true);

		drawingContext.fillStyle = `hsla(${hue}, ${sat}%, ${bri}%, ${alpha}%)`;
		drawingContext.fillRect(ab_x, ab_y, elW, elW);
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
