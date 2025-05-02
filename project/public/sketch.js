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

// Function to generate evenly spaced angles
function generateAngles(numAngles, startAngle = 0) {
	const angles = [];
	const angleStep = 360 / numAngles;

	for (let i = 0; i < numAngles; i++) {
		angles.push((startAngle + i * angleStep) % 360);
	}

	return angles;
}

let numAngles = 32;
let angle1 = generateAngles(numAngles);

let animation;
let drawing = true;
let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;

let MAX_FRAMES = Math.floor(mapValue(angle1.length, 1, 36, 175, 350));
let start_particle_num = Math.floor(40000 / angle1.length);
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

// Shader variables
let shaderProgram;
let graphicsOriginal;
let finalBuffer; // Add a final buffer to store the accumulated drawing

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

//! original
const baseLow_l = 1;
const baseHigh_l = 0.148;
const maxPatternValue_l = 3;

const baseLow_h = 1.148;
const baseHigh_h = 0;
const maxPatternValue_h = 3;

//! inverted
/* const baseLow_l = 0.148;
const baseHigh_l = 1;
const maxPatternValue_l = 1;

const baseLow_h = 0;
const baseHigh_h = 1.148;
const maxPatternValue_h = 1; */

// !high pattern / eidolons
/*const baseLow_l = 0.5;
const baseHigh_l = 0;
const maxPatternValue_l = 3;

const baseLow_h = 0;
const baseHigh_h = 0.5;
const maxPatternValue_h = 3;*/

//! 2 fold symmetry to create eidolons

const offValues_l = generateSymmetricOffValues(numCases, baseLow_l, baseHigh_l, maxPatternValue_l);
const offValues_h = generateSymmetricOffValues(numCases, baseLow_h, baseHigh_h, maxPatternValue_h);

console.log(offValues_l);
console.log(offValues_h);

function preload() {
	// Load shader files
	shaderProgram = loadShader("shaders/vertex.vert", "shaders/fragment.frag");
}

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

	// Create main canvas with WEBGL mode
	c = createCanvas(C_WIDTH, C_WIDTH * RATIO, WEBGL);
	pixelDensity(dpi(maxDPI));

	// Create the offscreen graphics buffer for original content
	graphicsOriginal = createGraphics(C_WIDTH, C_WIDTH * RATIO);
	graphicsOriginal.colorMode(HSB, 360, 100, 100, 100);
	graphicsOriginal.pixelDensity(dpi(maxDPI));
	graphicsOriginal.rectMode(CENTER);
	graphicsOriginal.angleMode(DEGREES);

	// Create a final buffer to store accumulated drawing
	finalBuffer = createGraphics(C_WIDTH, C_WIDTH * RATIO);
	finalBuffer.pixelDensity(dpi(maxDPI));

	// Setup main canvas settings
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	angleMode(DEGREES);

	// Initialize the original graphics with background
	graphicsOriginal.drawingContext.globalCompositeOperation = "source-over";
	let gradient = graphicsOriginal.drawingContext.createRadialGradient(
		graphicsOriginal.width / 2,
		graphicsOriginal.height / 2,
		0,
		graphicsOriginal.width / 2,
		graphicsOriginal.height / 2,
		graphicsOriginal.width / 2
	);
	gradient.addColorStop(0.5, "hsl(0, 100%, 95%,100%)");
	gradient.addColorStop(0.8, "hsl(10, 100%, 96%,100%)");
	graphicsOriginal.drawingContext.fillStyle = gradient;
	graphicsOriginal.drawingContext.fillRect(0, 0, graphicsOriginal.width, graphicsOriginal.height);

	// Also initialize the final buffer with the same background
	finalBuffer.drawingContext.globalCompositeOperation = "source-over";
	let finalGradient = finalBuffer.drawingContext.createRadialGradient(finalBuffer.width / 2, finalBuffer.height / 2, 0, finalBuffer.width / 2, finalBuffer.height / 2, finalBuffer.width / 2);
	finalGradient.addColorStop(0.5, "hsl(0, 100%, 95%,100%)");
	finalGradient.addColorStop(0.8, "hsl(10, 100%, 96%,100%)");
	finalBuffer.drawingContext.fillStyle = finalGradient;
	finalBuffer.drawingContext.fillRect(0, 0, finalBuffer.width, finalBuffer.height);

	xi = random(1000000000000);
	yi = random(1000000000000);
	pos_range_x = graphicsOriginal.width * 0.5;
	pos_range_y = graphicsOriginal.width * 0.5;

	let sketch = drawGenerator();
	function animate() {
		animation = setTimeout(animate, 0);
		sketch.next();
	}
	animate();
}

// Separate draw function for p5.js that handles shader rendering
function draw() {
	// Clear the shader canvas
	clear();

	// Apply shader to the main canvas
	shader(shaderProgram);

	// Set the shader uniforms - use finalBuffer instead of graphicsOriginal
	shaderProgram.setUniform("uTexture", finalBuffer);
	shaderProgram.setUniform("uTime", millis() / 300.0);
	shaderProgram.setUniform("uResolution", [width, height]);

	// Draw a plane that covers the entire canvas in WebGL space
	push();
	noStroke();

	// Use normalized device coordinates
	translate(0, 0, 0);
	beginShape();
	vertex(-1, -1, 0, 0, 0);
	vertex(1, -1, 0, 1, 0);
	vertex(1, 1, 0, 1, 1);
	vertex(-1, 1, 0, 0, 1);
	endShape(CLOSE);

	pop();

	// Show loading progress
	showLoadingBar(elapsedTime, MAX_FRAMES, renderStart);

	// Check if we're done with generation
	// But don't stop the animation loop - we want the shader to keep animating
	if (elapsedTime > MAX_FRAMES && drawing) {
		window.rendered = c.canvas;
		document.complete = true;
		let endTime = Date.now();
		let timeDiff = endTime - renderStart;
		console.log("Render time: " + timeDiff + " ms");
		drawing = false; // Mark as not drawing, but don't call noLoop()
	}
}

function* drawGenerator() {
	let count = 0;
	let generator_frameCount = 0;
	let draw_every = cycle;

	while (true) {
		// Stop generating new content if we've reached the frame limit
		if (elapsedTime > MAX_FRAMES) {
			return; // Exit the generator
		}

		// Clear the original graphics to start with a fresh frame for this iteration
		graphicsOriginal.clear();

		// Use transparent background for each new frame to allow accumulation
		graphicsOriginal.background(0, 0, 0, 0);

		// Calculate parameters for the frame
		cos_val = cos(generator_frameCount * 12);
		sin_val = sin(generator_frameCount * 12);
		noise_cos = sin(generator_frameCount * 40);
		off_cos = sin(generator_frameCount * 800);
		col_cos = cos(generator_frameCount * 50); //!change to sin for different color

		x_val = sin(generator_frameCount * 20);
		y_val = sin(generator_frameCount * 20);
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

		graphicsOriginal.push();
		graphicsOriginal.translate(graphicsOriginal.width / 2, graphicsOriginal.height / 2);
		graphicsOriginal.rotate(45);

		for (let i = 0; i < angle1.length; i++) {
			xoff_l_high = mapValue(abs(noise_cos), 0, 1, offValues_h[i].low, offValues_h[i].high, true);
			xoff_l_low = mapValue(abs(noise_cos), 0, 1, offValues_l[i].low, offValues_l[i].high, true);
			//! OG config
			/* 			xoff_l_high = mapValue(noise_cos, -1, 1, offValues_h[i].low, offValues_h[i].high, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_l[i].low, offValues_l[i].high, true); */
			/* 			xoff_l_high = mapValue(noise_cos, -1, 1, offValues_l[i].high, offValues_l[i].low, true);
			xoff_l_low = mapValue(noise_cos, -1, 1, offValues_h[i].high, offValues_h[i].low, true); */

			xoff_h = xoff_l_high + 0.0001;
			yoff_h = xoff_l_high + 0.0001;
			// 0.001,0.0025,0.005,0.007,0.01,0.025,0.05,0.07
			// peut aussi etre alterné

			//!another way to create eidolons (couple with higher baseLow_l) and 2-fold symettry
			/* 	xoff_l = mapValue(cos_val, -1, 20, xoff_l_high, xoff_l_low, true);
			yoff_l = mapValue(cos_val, -20, 1, xoff_l_low, xoff_l_high, true); */

			xoff_l = mapValue(cos_val, -1, 0, xoff_l_high, xoff_l_low, true);
			yoff_l = mapValue(cos_val, -0, 1, xoff_l_low, xoff_l_high, true);

			graphicsOriginal.push();
			graphicsOriginal.rotate(angle1[i]);
			graphicsOriginal.scale(1.25);
			for (let s = 0; s < particle_num; s++) {
				paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale1, cos_val, sin_val, noise_cos, col_cos, off_cos);

				if (count >= draw_every) {
					count = 0;
					yield;
				}
				count++;
			}
			graphicsOriginal.pop();
		}

		graphicsOriginal.pop();

		// Copy the current frame to the final buffer (accumulate drawing)
		finalBuffer.drawingContext.globalCompositeOperation = "source-over";
		finalBuffer.image(graphicsOriginal, 0, 0);

		// Update frame count and elapsed time
		elapsedTime = generator_frameCount - startTime;
		generator_frameCount++;

		// No need to do shader rendering here as it's now in the draw function
		yield;
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale, cos_val, sin_val, noise_cos, col_cos, off_cos) {
	xoff = random(xoff_l, xoff_h);
	yoff = random(yoff_l, yoff_h);
	//xoff = ZZ(xoff, 20, 120, 0.002);
	//yoff = ZZ(yoff, 20, 120, 0.002);
	//let nd = floor(map(abs(nd_cos), 1, 0, 2, 5, true));
	//let ni = map(nd, 1, 6, 0.7, 0.4, true);
	noiseDetail(2, 0.8);
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
	let y = mapValue(noise(yoff, yoff, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);
 */
	//! Jellyfish 2
	/* 	let x = mapValue(noise(xoff, random([xoff, yi]), yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([yoff, yi]), xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);
 */
	//! Jellyfish 3
	/* 	let x = mapValue(noise(xoff, random([xoff, xi]), random([yoff, yi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, random([yoff, xi]), random([xoff, yi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, true); */

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

	//! noise affected jellyfish
	let x = mapValue(noise(xoff, x_val, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(noise(yoff, y_val, xoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);

	let w = mapValue(abs(cos_val), 0, 1, 0.32, 0.46, true);

	let elW = w * MULTIPLIER;
	let ab_x = constrain(x, -graphicsOriginal.width / 2.95, graphicsOriginal.width / 2.95) * MULTIPLIER;
	let ab_y = constrain(y, -graphicsOriginal.height / 2.95, graphicsOriginal.height / 2.95) * MULTIPLIER;
	let index = Math.floor(mapValue(abs(col_cos), 0, 1, 0, palette.length - 1, true));

	hue = palette[index].hsl[0];
	sat = palette[index].hsl[1];
	b = palette[index].hsl[2];

	bri_min = mapValue(elapsedTime, MAX_FRAMES / 1.31, MAX_FRAMES / 1.3, 0, 100, true);
	bri_max = mapValue(elapsedTime, MAX_FRAMES / 1.31, MAX_FRAMES / 1.3, 0, 0, true);
	bri = mapValue(abs(cos_val), 0.01, 1, b - bri_max, b - bri_min, true);
	a_min = mapValue(elapsedTime, MAX_FRAMES / 1.31, MAX_FRAMES / 1.3, 0, 50, true);
	a_max = mapValue(elapsedTime, MAX_FRAMES / 1.31, MAX_FRAMES / 1.3, 0, 0, true);
	a = 100;
	alpha = mapValue(abs(cos_val), 0.95, 1, 50 - a_min, 100 - a_max, true);
	graphicsOriginal.drawingContext.fillStyle = `hsla(${hue}, ${sat}%, ${bri}%, ${alpha}%)`;
	graphicsOriginal.drawingContext.fillRect(ab_x, ab_y, elW, elW);
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
