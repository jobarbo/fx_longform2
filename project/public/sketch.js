let features = "";

let palette = [
	{name: "Rose", hex: "f72585", rgb: [247, 37, 133], cmyk: [0, 85, 46, 3], hsb: [333, 85, 97], hsl: [333, 93, 56], lab: [55, 79, 1]},
	{name: "Fandango", hex: "b5179e", rgb: [181, 23, 158], cmyk: [0, 87, 13, 29], hsb: [309, 87, 71], hsl: [309, 77, 40], lab: [43, 70, -34]},
	{name: "Grape", hex: "7209b7", rgb: [114, 9, 183], cmyk: [38, 95, 0, 28], hsb: [276, 95, 72], hsl: [276, 91, 38], lab: [32, 66, -66]},
	{name: "Chrysler blue", hex: "560bad", rgb: [86, 11, 173], cmyk: [50, 94, 0, 32], hsb: [268, 94, 68], hsl: [268, 88, 36], lab: [27, 60, -68]},
	{name: "Dark blue", hex: "480ca8", rgb: [72, 12, 168], cmyk: [57, 93, 0, 34], hsb: [263, 93, 66], hsl: [263, 87, 35], lab: [25, 58, -69]},
	{name: "Zaffre", hex: "3a0ca3", rgb: [58, 12, 163], cmyk: [64, 93, 0, 36], hsb: [258, 93, 64], hsl: [258, 86, 34], lab: [23, 55, -70]},
	{name: "Palatinate blue", hex: "3f37c9", rgb: [63, 55, 201], cmyk: [69, 73, 0, 21], hsb: [243, 73, 79], hsl: [243, 57, 50], lab: [34, 48, -74]},
	{name: "Neon blue", hex: "4361ee", rgb: [67, 97, 238], cmyk: [72, 59, 0, 7], hsb: [229, 72, 93], hsl: [229, 83, 60], lab: [47, 36, -74]},
	{name: "Chefchaouen Blue", hex: "4895ef", rgb: [72, 149, 239], cmyk: [70, 38, 0, 6], hsb: [212, 70, 94], hsl: [212, 84, 61], lab: [61, 5, -52]},
	{name: "Vivid sky blue", hex: "4cc9f0", rgb: [76, 201, 240], cmyk: [68, 16, 0, 6], hsb: [194, 68, 94], hsl: [194, 85, 62], lab: [76, -22, -29]},
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
let angle1 = [0, 45, 90, 135, 180, 225, 270, 315];
/* let angle1 = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5]; */
/* let angle1 = [45, 225]; */
//let angle1 = [45, 135, 225, 315];
//let angle1 = [0, 90, 180, 270];
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
let particle_num = Math.floor(10000 / angle1.length);

//let cycle = Math.floor(mapValue(angle1.length, 1, 36, 1, 20));
let cycle = 10000;

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

/* const offValues_l = [
	{low: 2, high: 1.075}, // case 0
	{low: 1, high: 0.075}, // case 1
	{low: 2, high: 1.075}, // case 2
	{low: 3, high: 2.075}, // case 3
	{low: 4, high: 3.075}, // case 4
	{low: 5, high: 4.075}, // case 5
	{low: 4, high: 3.075}, // case 6
	{low: 3, high: 2.075}, // case 7
	// Add more if needed
];

const offValues_h = [
	{low: 2.075, high: 1}, // case 0
	{low: 1.075, high: 0}, // case 1
	{low: 2.075, high: 1}, // case 2
	{low: 3.075, high: 2}, // case 3
	{low: 4.075, high: 3}, // case 4
	{low: 5.075, high: 4}, // case 5
	{low: 4.075, high: 3}, // case 6
	{low: 3.075, high: 2}, // case 7
	// Add more if needed
];
 */

const offValues_l = [
	{low: 2, high: 1.2}, // case 0
	{low: 1, high: 0.2}, // case 1
	{low: 2.1, high: 1.3}, // case 2
	{low: 3, high: 2.2}, // case 3
	{low: 2.2, high: 1.4}, // case 4
	{low: 1.1, high: 0.3}, // case 5
	{low: 2.3, high: 1.5}, // case 6
	{low: 3.1, high: 2.3}, // case 7
	// Add more if needed
];

const offValues_h = [
	{low: 2.2, high: 1}, // case 0
	{low: 1.2, high: 0}, // case 1
	{low: 2.3, high: 1.1}, // case 2
	{low: 3.2, high: 2}, // case 3
	{low: 2.4, high: 1.2}, // case 4
	{low: 1.3, high: 0.1}, // case 5
	{low: 2.5, high: 1.3}, // case 6
	{low: 3.3, high: 2.1}, // case 7
	// Add more if needed
];
/* const offValues_l = [
	{low: 1, high: 0.042}, // case 0
	{low: 2, high: 1.042}, // case 1
	{low: 3, high: 2.042}, // case 2
	{low: 2, high: 1.042}, // case 3
	{low: 1, high: 0.042}, // case 4
	{low: 2, high: 1.042}, // case 5
	{low: 3, high: 2.042}, // case 6
	{low: 2, high: 1.042}, // case 7
	{low: 1, high: 0.042}, // case 8
	{low: 2, high: 1.042}, // case 9
	{low: 3, high: 2.042}, // case 10
	{low: 2, high: 1.042}, // case 11
	{low: 1, high: 0.042}, // case 12
	{low: 2, high: 1.042}, // case 13
	{low: 3, high: 2.042}, // case 14
	{low: 2, high: 1.042}, // case 15
	{low: 1, high: 0.042}, // case 16
	{low: 2, high: 1.042}, // case 17
	{low: 1, high: 0.042}, // case 18
	// Add more if needed
];

const offValues_h = [
	{low: 1.042, high: 0}, // case 0
	{low: 2.042, high: 1}, // case 1
	{low: 3.042, high: 2}, // case 2
	{low: 2.042, high: 1}, // case 3
	{low: 1.042, high: 0}, // case 4
	{low: 2.042, high: 1}, // case 5
	{low: 3.042, high: 2}, // case 6
	{low: 2.042, high: 1}, // case 7
	{low: 1.042, high: 0}, // case 8
	{low: 2.042, high: 1}, // case 9
	{low: 3.042, high: 2}, // case 10
	{low: 2.042, high: 1}, // case 11
	{low: 1.042, high: 0}, // case 12
	{low: 2.042, high: 1}, // case 13
	{low: 3.042, high: 2}, // case 14
	{low: 2.042, high: 1}, // case 15
	{low: 1.042, high: 0}, // case 16
	{low: 2.042, high: 1}, // case 17
	{low: 1.042, high: 0}, // case 18
	// Add more if needed
]; */

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
	pos_range_x = height * 0.7;
	pos_range_y = height * 0.7;
	translate(width / 2, height / 2);
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

	while (true) {
		// Draw with p5.js things
		//blendMode(SCREEN);
		cos_val = cos(generator_frameCount * 45);
		sin_val = cos(generator_frameCount * 45);
		noise_cos = sin(generator_frameCount * 170);
		off_cos = sin(generator_frameCount * 800);
		col_cos = cos(generator_frameCount * 45);
		//nd_cos = sin(generator_frameCount * 5);
		//noise_cos: 25,40,45(5), 48,50,54,60,100

		//cos_val = 125;//!test
		//sin_val = 125;//!test
		//n_cos = 125;//!test
		//off_cos = 250;//!test

		/* 		cos_val = cos(generator_frameCount * 10);
		sin_val = cos(generator_frameCount * 10);
		noise_cos = tan(generator_frameCount * 6);
		off_cos = tan(generator_frameCount * 2);
		nd_cos = tan(generator_frameCount * 6); */
		// noise_cos: 6,8,9,10,11 / 12, 15,18,20,25,30,35,36,40,45(stable),50,54,60(stable)70,75,80,90(stable),100,200,500
		// off_cos: 26,30,50,60,150,500,1250,1500
		//35+26 together with low noise ;)

		let scale1 = 1;
		let xoff_l_high;
		let xoff_l_low;
		for (let i = 0; i < angle1.length; i++) {
			xoff_l_high = mapValue(abs(noise_cos), 0, 1, offValues_h[i].low, offValues_h[i].high, true);
			xoff_l_low = mapValue(abs(noise_cos), 0, 1, offValues_l[i].low, offValues_l[i].high, true);
			/* xoff_l_high = mapValue(noise_cos, -1, 1, offValues_h[i].low, offValues_h[i].high, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_l[i].low, offValues_l[i].high, true); */
			/* xoff_l_high = mapValue(noise_cos, -1, 1, offValues_l[i].high, offValues_l[i].low, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_h[i].high, offValues_h[i].low, true); */

			xoff_h = xoff_l_high + 0.001;
			yoff_h = xoff_l_high + 0.001;
			// 0.001,0.0025,0.005,0.007,0.01,0.025,0.05,0.07
			// peut aussi etre alterné

			xoff_l = mapValue(cos_val, -1, 0, xoff_l_high, xoff_l_low, true);
			yoff_l = mapValue(cos_val, -0, 1, xoff_l_low, xoff_l_high, true);

			/* 			xoff_l = mapValue(off_cos, -1, 1, xoff_l_high, xoff_l_low, true);
			yoff_l = mapValue(off_cos, -1, 1, xoff_l_low, xoff_l_high, true); */
			push();
			rotate(angle1[i]);
			scale(scale1);
			for (let s = 0; s < particle_num; s++) {
				paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale1, cos_val, sin_val, noise_cos, col_cos, off_cos);

				if (count >= draw_every) {
					count = 0;
					yield;
				}
				count++;
			}
			pop();
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

function paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale, cos_val, sin_val, noise_cos, col_cos, off_cos) {
	xoff = random(xoff_l, xoff_h);
	yoff = random(yoff_l, yoff_h);
	//let nd = floor(map(abs(nd_cos), 1, 0, 2, 5, true));
	//let ni = map(nd, 1, 6, 0.7, 0.4, true);
	noiseDetail(4, 0.6);
	//! Simple Block
	/* 		let x = mapValue(noise(xoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
	//! Electron microscope
	//! Electron microscope
	let x = mapValue(noise(xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true); /*
			let y = mapValue(noise(yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
	/* 		let x = mapValue(oct(xoff, yoff, nx_scale, 1, 1), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
			let y = mapValue(oct(yoff, xoff, ny_scale, 1, 1), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
	//!block Rect
	/*let x = mapValue(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
			let y = mapValue(noise(yoff, yoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//! block Rect 2
	/* 		let x = mapValue(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true); */
	let y = mapValue(noise(yoff, yoff, xi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);

	//!Drapery Yin Yang
	/* let x = mapValue(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);*/

	//!Drapery Equilibrium
	/* 	let x = mapValue(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);*/

	//! Jellyfish
	/* 	let x = mapValue(noise(xoff, xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//! Astral Beings
	/* let x = mapValue(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//! Astral Beings 2
	/* 	let x = mapValue(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//! Astral Beings 3
	/* 	let x = mapValue(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
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

	//let w = mapValue(abs(cos_val), 0, 1, 0.16, 0.26, true);
	let w = mapValue(abs(cos_val), 0, 1, 0.32, 0.46, true);
	let elW = w * MULTIPLIER;
	let ab_x = x * MULTIPLIER;
	let ab_y = y * MULTIPLIER;
	let index = Math.floor(mapValue(abs(col_cos), 0, 1, 0, palette.length - 1, true));

	hue = palette[index].hsl[0];
	sat = palette[index].hsl[1];
	b = palette[index].hsl[2];

	/* 	hue = mapValue(abs(cos_val), 0, 1, 360, 190, true);
	sat = mapValue(elapsedTime, 0, MAX_FRAMES / 2.5, 100, 75, true); */
	bri_min = mapValue(elapsedTime, MAX_FRAMES / 1.15, MAX_FRAMES / 1, 0, 80, true);
	bri_max = mapValue(elapsedTime, MAX_FRAMES / 1.15, MAX_FRAMES / 1, 0, 15, true);
	bri = mapValue(abs(col_cos), 0, 1, b - bri_max, b - bri_min, true);
	alpha = mapValue(elapsedTime, MAX_FRAMES / 2, MAX_FRAMES / 1, 50, 50, true);

	drawingContext.fillStyle = `hsla(${hue}, ${sat}%, ${bri}%, ${alpha}%)`;
	drawingContext.fillRect(ab_x, ab_y, elW, elW);
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
