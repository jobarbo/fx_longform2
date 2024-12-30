let features = "";

let palette = [
	{name: "Engineering orange", hex: "d00000", rgb: [208, 0, 0], cmyk: [0, 100, 100, 18], hsb: [0, 100, 82], hsl: [0, 100, 41], lab: [43, 69, 58]},
	{name: "Selective yellow", hex: "ffba08", rgb: [255, 186, 8], cmyk: [0, 27, 97, 0], hsb: [43, 97, 100], hsl: [43, 100, 52], lab: [80, 13, 81]},
	{name: "Mauve", hex: "9f86c0", rgb: [159, 134, 192], cmyk: [17, 30, 0, 25], hsb: [263, 30, 75], hsl: [263, 31, 64], lab: [59, 19, -27]},
	{name: "Powder blue", hex: "bcd4e6", rgb: [188, 212, 230], cmyk: [18, 8, 0, 10], hsb: [206, 18, 90], hsl: [206, 48, 82], lab: [84, -4, -13]},
	{name: "Persian green", hex: "1b998b", rgb: [27, 153, 139], cmyk: [82, 0, 9, 40], hsb: [173, 82, 60], hsl: [173, 70, 35], lab: [57, -36, -2]},
	{name: "Azure", hex: "3185fc", rgb: [49, 133, 252], cmyk: [81, 47, 0, 1], hsb: [215, 81, 99], hsl: [215, 97, 59], lab: [57, 17, -66]},
	{name: "Tekhelet", hex: "5d2e8c", rgb: [93, 46, 140], cmyk: [34, 67, 0, 45], hsb: [270, 67, 55], hsl: [270, 51, 36], lab: [30, 40, -44]},
	{name: "Tekhelet", hex: "46237a", rgb: [70, 35, 122], cmyk: [43, 71, 0, 52], hsb: [264, 71, 48], hsl: [264, 55, 31], lab: [23, 36, -44]},
	{name: "Rose Pompadour", hex: "ff7b9c", rgb: [255, 123, 156], cmyk: [0, 52, 39, 0], hsb: [345, 52, 100], hsl: [345, 100, 74], lab: [68, 53, 6]},
	{name: "Coral pink", hex: "ff9b85", rgb: [255, 155, 133], cmyk: [0, 39, 48, 0], hsb: [11, 48, 100], hsl: [11, 100, 76], lab: [74, 35, 27]},
];
let maxDPI = 2;
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
let angle1 = [45, 135, 225, 315];
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
// 32 angles array
/* let angle1 = [
	0, 11.25, 22.5, 33.75, 45, 56.25, 67.5, 78.75, 90, 101.25, 112.5, 123.75, 135, 146.25, 157.5, 168.75, 180, 191.25, 202.5, 213.75, 225, 236.25, 247.5, 258.75, 270, 281.25, 292.5, 303.75, 315, 326.25,
	337.5, 348.75,
]; */
console.log(angle1.length);
//let angle1 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350];
//let angle1 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 315, 320, 325, 330, 335, 340, 345, 350, 355] ;
let animation;
let drawing = true;
let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;

let MAX_FRAMES = Math.floor(mapValue(angle1.length, 1, 36, 700, 1400));
let start_particle_num = Math.floor(10000 / angle1.length);
let particle_num = start_particle_num;

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

function generateUpDownPattern(maxPatternValue) {
	const pattern = [];

	// Create the up-down pattern
	for (let i = 1; i <= maxPatternValue; i++) {
		pattern.push(i);
	}
	for (let i = maxPatternValue - 1; i > 1; i--) {
		pattern.push(i);
	}

	return pattern;
}

function generateSymmetricOffValues(numCases, baseLow, baseHigh, maxPatternValue) {
	const offValues = [];
	const pattern = generateUpDownPattern(maxPatternValue);
	const increment = 1;

	for (let i = 0; i < numCases; i++) {
		const patternIndex = i % pattern.length;
		const low = baseLow + (pattern[patternIndex] - 1) * increment;
		const high = baseHigh + (pattern[patternIndex] - 1) * increment;
		offValues.push({low, high});
	}

	return offValues;
}
console.log(angle1.length);
const numCases = angle1.length; // Number of cases you want
const baseLow_l = 0.148;
const baseHigh_l = 0;
const maxPatternValue_l = 1; // Maximum value in the pattern

const baseLow_h = 0;
const baseHigh_h = 0.148;
const maxPatternValue_h = 1; // Maximum value in the pattern

const offValues_l = generateSymmetricOffValues(numCases, baseLow_l, baseHigh_l, maxPatternValue_l);
const offValues_h = generateSymmetricOffValues(numCases, baseLow_h, baseHigh_h, maxPatternValue_h);

console.log(offValues_l);
console.log(offValues_h);

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
	gradient.addColorStop(0.5, "hsl(0, 100%, 95%)");
	gradient.addColorStop(0.8, "hsl(10, 100%, 96%)");
	drawingContext.fillStyle = gradient;
	drawingContext.fillRect(0, 0, width, height);

	xi = random(1000000000000);
	yi = random(1000000000000);
	pos_range_x = width * 0.5;
	pos_range_y = height * 0.5;
	translate(width / 2, height / 2);
	rotate(45);
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
		//! try zz here
		cos_val = cos(generator_frameCount * 50);
		sin_val = cos(generator_frameCount * 50);
		noise_cos = sin(generator_frameCount * 40);
		off_cos = sin(generator_frameCount * 800);
		col_cos = cos(generator_frameCount * 50); //!change to sin for different color
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
			//! OG config
			/* 			xoff_l_high = mapValue(noise_cos, -1, 1, offValues_h[i].low, offValues_h[i].high, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_l[i].low, offValues_l[i].high, true); */
			/* 			xoff_l_high = mapValue(noise_cos, -1, 1, offValues_l[i].high, offValues_l[i].low, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_h[i].high, offValues_h[i].low, true); */

			xoff_h = xoff_l_high + 0.000001;
			yoff_h = xoff_l_high + 0.000001;
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

		//particle_num = mapValue(elapsedTime, MAX_FRAMES / 20, MAX_FRAMES / 19, start_particle_num, start_particle_num / 40, true);

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
	//xoff = ZZ(xoff, 20, 120, 0.002);
	//yoff = ZZ(yoff, 20, 120, 0.002);
	//let nd = floor(map(abs(nd_cos), 1, 0, 2, 5, true));
	//let ni = map(nd, 1, 6, 0.7, 0.4, true);
	noiseDetail(5, 0.6);
	//! Simple Block
	/* 		let x = mapValue(noise(xoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
		let y = mapValue(noise(yoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */
	//! Electron microscope
	/* 	let x = mapValue(noise(xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true); */
	/* 	let y = mapValue(noise(yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//! Electron microscope 2
	/* 	let x = mapValue(noise(xoff, yi, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, yi, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);
 */
	/* let x = mapValue(oct(xoff, yoff, nx_scale, 1, 1), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
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
	/* 	let x = mapValue(noise(xoff, xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//! Jellyfish 2
	/* 	let x = mapValue(noise(xoff, random([xoff, yi]), yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([yoff, yi]), xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);
 */
	//! Jellyfish 3
	let x = mapValue(noise(xoff, random([xoff, xi]), random([yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([yoff, xi]), random([xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);

	//! Astral Beings
	/* 	let x = mapValue(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);
 */
	//! Astral Beings 2
	/* 	let x = mapValue(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);
 */
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
	/* 	let x = mapValue(noise(xoff, yoff, random([xoff, xi, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, xoff, random([yoff, xi, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

	//let w = mapValue(abs(cos_val), 0, 1, 0.16, 0.26, true);
	let w = mapValue(abs(cos_val), 0, 1, 0.32, 0.46, true);

	let elW = w * MULTIPLIER;
	let ab_x = constrain(x, -width / 1.95, width / 1.95) * MULTIPLIER;
	let ab_y = constrain(y, -height / 1.95, height / 1.95) * MULTIPLIER;
	let index = Math.floor(mapValue(abs(col_cos), 0, 1, 0, palette.length - 1, true));

	hue = palette[index].hsl[0];
	sat = palette[index].hsl[1];
	b = palette[index].hsl[2];

	/* 	hue = mapValue(abs(cos_val), 0, 1, 360, 190, true);
	sat = mapValue(elapsedTime, 0, MAX_FRAMES / 2.5, 100, 75, true); */
	bri_min = mapValue(elapsedTime, MAX_FRAMES / 1.21, MAX_FRAMES / 1.2, 0, 100, true);
	bri_max = mapValue(elapsedTime, MAX_FRAMES / 1.21, MAX_FRAMES / 1.2, 0, 0, true);
	bri = mapValue(abs(cos_val), 0.9, 1, b - bri_max, b - bri_min, true);
	alpha = mapValue(abs(cos_val), 0.9, 1, 50, 100, true);
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
