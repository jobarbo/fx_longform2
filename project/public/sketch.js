let features = "";

const basePalette = [
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

// rotated copy of basePalette, see applyConfig (starting index is random unless fixed in the panel)
let palette = basePalette;

let RATIO = 1.41;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 1200;
let DIM;
let MULTIPLIER;
let C_WIDTH;
let c;
let currentPixelRatio;
let xoff = 0.6;
let yoff = 0.3;

let xi;
let yi;

let pos_range_x;
let pos_range_y;
let n_range_min = 0;
let n_range_max = 1;

let hue = 0;
let sat = 0;
let bri = 0;
let bri_min = 60;

//! Ink
let particleBoost = 2; // particle multiplier, paid for by drawing each particle once with a per-frame style
let alphaScale = 0.5; // particle transparency (1 = original alpha)
let inkScale = 1; // line width multiplier
let inkStyle = "";
let inkW = 0;

let displacement1 = 0;
let displacement2 = 100;

let angle1 = [225];

let sketch;
let animation;
let completeTimer;
let drawing = true;
let startTime = 0;
let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;

let MAX_FRAMES;
let particle_num;
let cycle;

let nx_scale = 0.00005;
let ny_scale = 0.00005;

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
let col_cos;
let off_cos;
let noise_cos;
let sin_val;
let angle_index = 0;

let offValues_l;
let offValues_h;

let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;
let centerOffsetX = 0;
let centerOffsetY = 0;
let calculatingBounds = true;

//! Shapes: noise formulas returning the particle position in noise space (mapped to pos_range in paint)
// x is always evaluated before y so the random() call order matches the original blocks
const SHAPES = {
	"simple block": {
		x: (xoff, yoff) => noise(xoff),
		y: (xoff, yoff) => noise(yoff),
	},
	"electron microscope": {
		x: (xoff, yoff) => noise(xoff, yoff),
		y: (xoff, yoff) => noise(yoff, xoff),
	},
	"electron microscope oct": {
		x: (xoff, yoff) => oct(xoff, yoff, nx_scale, 1, 1),
		y: (xoff, yoff) => oct(yoff, xoff, ny_scale, 1, 1),
	},
	"block rect": {
		x: (xoff, yoff) => noise(xoff, xoff, xi),
		y: (xoff, yoff) => noise(yoff, yoff, yi),
	},
	"block rect 2": {
		x: (xoff, yoff) => noise(xoff, xoff, xi),
		y: (xoff, yoff) => noise(yoff, yoff, xi),
	},
	"drapery yin/yang": {
		x: (xoff, yoff) => noise(xoff, yoff, xi),
		y: (xoff, yoff) => noise(xoff, yoff, yi),
	},
	"drapery equilibrium": {
		x: (xoff, yoff) => noise(xoff, yoff, xi),
		y: (xoff, yoff) => noise(yoff, xoff, yi),
	},
	"hybrid drapery/blocks": {
		x: (xoff, yoff) => noise(xoff, random([xoff, xoff, yi])),
		y: (xoff, yoff) => noise(yoff, random([yoff, xoff, yi])),
	},
	jellyfish: {
		x: (xoff, yoff) => noise(xoff, xoff, yoff),
		y: (xoff, yoff) => noise(yoff, yoff, xoff),
	},
	"jellyfish 2": {
		x: (xoff, yoff) => noise(xoff, random([xoff, yi]), yoff),
		y: (xoff, yoff) => noise(yoff, random([yoff, yi]), xoff),
	},
	"jellyfish 3": {
		x: (xoff, yoff) => noise(xoff, random([xoff, xi]), random([yoff, yi])),
		y: (xoff, yoff) => noise(yoff, random([yoff, xi]), random([xoff, yi])),
	},
	"astral beings": {
		x: (xoff, yoff) => noise(xoff, random([xoff, yoff, yi])),
		y: (xoff, yoff) => noise(yoff, random([yoff, xoff, yi])),
	},
	"astral beings 2": {
		x: (xoff, yoff) => noise(xoff, random([yoff, yoff, yi])),
		y: (xoff, yoff) => noise(yoff, random([xoff, xoff, yi])),
	},
	"astral beings 3": {
		x: (xoff, yoff) => noise(xoff, xoff, random([yoff, yoff, yi])),
		y: (xoff, yoff) => noise(yoff, yoff, random([xoff, xoff, yi])),
	},
	"astral beings 4": {
		x: (xoff, yoff) => noise(yoff, xoff, random([xoff, yoff, yi])),
		y: (xoff, yoff) => noise(xoff, yoff, random([xoff, yoff, yi])),
	},
	"astral beings asym": {
		x: (xoff, yoff) => noise(xoff, random([xoff, yoff, xi])),
		y: (xoff, yoff) => noise(yoff, random([yoff, xoff, yi])),
	},
	"complex organism": {
		x: (xoff, yoff) => noise(xoff, yoff, random([xoff, xi, yi])),
		y: (xoff, yoff) => noise(yoff, xoff, random([yoff, xi, yi])),
	},
};

let shapeX = SHAPES["jellyfish 3"].x;
let shapeY = SHAPES["jellyfish 3"].y;

// per-frame oscillators, resolved from the panel in applyConfig
let noiseCosFn;
let colorCosFn;

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
	const increment = 0.0015;

	for (let i = 0; i < numCases; i++) {
		const patternIndex = i % pattern.length;
		const low = baseLow + (pattern[patternIndex] - 1) * increment;
		const high = baseHigh + (pattern[patternIndex] - 1) * increment;
		offValues.push({low, high});
	}

	return offValues;
}

// Reads CURRENT_PARAMS (panel / hash features) into the sketch globals. Called before every render.
function applyConfig() {
	const p = CURRENT_PARAMS;

	angle1 = p.angles;
	[n_range_min, n_range_max] = p.noiseRange;

	const {l, h} = p.offPattern;
	offValues_l = generateSymmetricOffValues(angle1.length, l.baseLow, l.baseHigh, l.maxPatternValue);
	offValues_h = generateSymmetricOffValues(angle1.length, h.baseLow, h.baseHigh, h.maxPatternValue);

	particleBoost = p.particleBoost;
	alphaScale = p.alphaScale;
	inkScale = p.inkScale;

	MAX_FRAMES = p.maxFrames ?? Math.floor(mapValue(angle1.length, 1, 36, 700, 1400));
	particle_num = Math.floor((10000 * particleBoost) / angle1.length);
	cycle = 15000 * particleBoost; // keep the same number of yields per render

	shapeX = SHAPES[p.shape].x;
	shapeY = SHAPES[p.shape].y;

	noiseCosFn = window[p.noiseCosFn];
	colorCosFn = window[p.colorCosFn];

	const start = p.paletteStart ?? window.PARAMS_UI.lockedSeeds.paletteStart;
	palette = basePalette.slice(start).concat(basePalette.slice(0, start));
}

function setup() {
	features = $fx.getFeatures();

	console.log(features);

	// hash features are the defaults, then the panel restores saved controls on top
	window.applyFeatureDefaults(features);
	ParamsPanel.init({features: {paletteCreator: false, presentation: false}});
	window.resolveParams();

	C_WIDTH = min(DEFAULT_SIZE * CM, DEFAULT_SIZE * CM);
	MULTIPLIER = C_WIDTH / DEFAULT_SIZE;
	c = createCanvas(C_WIDTH, C_WIDTH * 1);
	currentPixelRatio = CURRENT_PARAMS.pixelRatio;
	pixelDensity(dpi(currentPixelRatio));
	colorMode(HSB, 360, 100, 100, 100);
	rectMode(CENTER);
	angleMode(DEGREES);

	// seeds are drawn once per page load and reused by every Apply
	window.PARAMS_UI.lockedSeeds = {
		randomSeed: fxrand() * 10000,
		noiseSeed: fxrand() * 10000,
		paletteStart: Math.floor(Math.random() * basePalette.length),
	};

	applyConfig();
	renderPiece();
}

// Apply from the panel: same hash and seeds, new settings
window.applyGenerativeSettings = async function applyGenerativeSettings(settings) {
	if (!settings || !window.PARAMS_UI?.lockedSeeds) return;

	window.PARAMS_UI.current = {...window.PARAMS_UI.current, ...settings};
	window.resolveParams();

	if (CURRENT_PARAMS.pixelRatio !== currentPixelRatio) {
		currentPixelRatio = CURRENT_PARAMS.pixelRatio;
		pixelDensity(dpi(currentPixelRatio));
	}

	applyConfig();
	renderPiece();
};

function drawBackground() {
	drawingContext.globalCompositeOperation = "source-over";
	if (CURRENT_PARAMS.backdrop === "gradient") {
		let gradient = drawingContext.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
		gradient.addColorStop(0.5, "hsl(25, 100%, 95%)");
		gradient.addColorStop(0.8, "hsl(36, 100%, 95%)");
		drawingContext.fillStyle = gradient;
	} else {
		drawingContext.fillStyle = CURRENT_PARAMS.backdrop === "dark" ? "hsl(45, 0%, 5%)" : "hsl(45, 0%, 100%)";
	}
	drawingContext.fillRect(0, 0, width, height);
}

function renderPiece() {
	// stop a render that is still running
	clearTimeout(animation);
	clearTimeout(completeTimer);
	document.complete = false;
	window.dispatchEvent(new CustomEvent("render:started"));

	elapsedTime = 0;
	framesRendered = 0;
	drawing = true;
	startTime = 0;
	renderStart = Date.now();

	const seeds = window.PARAMS_UI.lockedSeeds;
	randomSeed(seeds.randomSeed);
	noiseSeed(seeds.noiseSeed);
	noiseDetail(4, 0.6);

	resetMatrix();
	drawBackground();

	xi = random(1000000000000);
	yi = random(1000000000000);
	pos_range_x = height * CURRENT_PARAMS.posRange;
	pos_range_y = height * CURRENT_PARAMS.posRange;

	translate(width / 2, height / 2);

	// First pass: calculate bounds with a smaller sample
	minX = Infinity;
	maxX = -Infinity;
	minY = Infinity;
	maxY = -Infinity;
	calculatingBounds = true;
	let boundsSamplingFactor = 0.2 / particleBoost; // Calculate bounds using 20% of the original particle count
	let boundsSampleNum = Math.max(100, Math.floor(particle_num * boundsSamplingFactor)); // Ensure minimum sample size

	console.log(`Calculating bounds with ${boundsSampleNum} particles (${boundsSamplingFactor * 100}% of total)`);

	let tempParticleNum = particle_num;
	particle_num = boundsSampleNum; // Temporarily reduce particle count

	sketch = drawGenerator();
	while (true) {
		let result = sketch.next();
		if (result.done) {
			break;
		}
	}

	// Calculate offsets to center the drawing
	centerOffsetX = -(minX + maxX) / 2;
	centerOffsetY = -(minY + maxY) / 2;
	console.log(`Centering offsets: X=${centerOffsetX}, Y=${centerOffsetY}`);

	// Reset for actual drawing
	particle_num = tempParticleNum; // Restore original particle count
	minX = Infinity;
	maxX = -Infinity;
	minY = Infinity;
	maxY = -Infinity;
	calculatingBounds = false;
	elapsedTime = 0;
	framesRendered = 0;

	// Start actual drawing
	sketch = drawGenerator();
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
	const p = CURRENT_PARAMS;

	while (true) {
		cos_val = cos(generator_frameCount * p.oscFreq);
		sin_val = sin(generator_frameCount * p.oscFreq);
		noise_cos = noiseCosFn(generator_frameCount * p.noiseCosFreq);
		off_cos = sin(generator_frameCount * p.offCosFreq);
		col_cos = colorCosFn(generator_frameCount * p.oscFreq);

		// ink only depends on per-frame values, so compute it once per frame instead of per particle
		updateInk(cos_val, p.colorSource === "noise_cos" ? noise_cos : col_cos);

		let scale1 = 1;
		let xoff_l_high;
		let xoff_l_low;
		for (let i = 0; i < angle1.length; i++) {
			if (p.noiseCosMap === "abs") {
				xoff_l_high = mapValue(abs(noise_cos), 0, 1, offValues_h[i].low, offValues_h[i].high, true);
				xoff_l_low = mapValue(abs(noise_cos), 0, 1, offValues_l[i].low, offValues_l[i].high, true);
			} else if (p.noiseCosMap === "signed") {
				xoff_l_high = mapValue(noise_cos, -1, 1, offValues_h[i].low, offValues_h[i].high, true);
				xoff_l_low = mapValue(noise_cos, -1, 1, offValues_l[i].low, offValues_l[i].high, true);
			} else {
				xoff_l_high = mapValue(noise_cos, -1, 1, offValues_l[i].high, offValues_l[i].low, true);
				xoff_l_low = mapValue(noise_cos, -1, 1, offValues_h[i].high, offValues_h[i].low, true);
			}

			xoff_h = xoff_l_high + p.offSpread;
			yoff_h = xoff_l_high + p.offSpread;

			if (p.offMap === "cos") {
				xoff_l = mapValue(cos_val, -1.0, 1.0, xoff_l_high, xoff_l_low, true);
				yoff_l = mapValue(cos_val, -1.0, 1.0, xoff_l_low, xoff_l_high, true);
			} else if (p.offMap === "cos split") {
				xoff_l = mapValue(cos_val, -1, 0, xoff_l_high, xoff_l_low, true);
				yoff_l = mapValue(cos_val, -0, 1, xoff_l_low, xoff_l_high, true);
			} else {
				xoff_l = mapValue(off_cos, -1, 1, xoff_l_high, xoff_l_low, true);
				yoff_l = mapValue(off_cos, -1, 1, xoff_l_low, xoff_l_high, true);
			}

			push();
			rotate(angle1[i]);
			scale(scale1);
			drawingContext.fillStyle = inkStyle;
			// use the bounding box to draw the particles so that it can be centered along with the bounding box

			for (let s = 0; s < particle_num; s++) {
				paint(xoff_l, xoff_h, yoff_l, yoff_h);

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
			if (calculatingBounds) return;

			window.rendered = c.canvas;
			window.dispatchEvent(new CustomEvent("render:completed"));
			//hl.token.capturePreview();
			/// add a 2s delay before setting document.complete to true to ensure the preview is captured correctly
			completeTimer = setTimeout(() => {
				document.complete = true;
				// calculate the time it took to render the image
				let endTime = Date.now();
				let timeDiff = endTime - renderStart;
				console.log("Render time: " + timeDiff + " ms");
			}, 2000);

			clearTimeout(animation);
			noLoop();
			return;
		}
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h) {
	xoff = random(xoff_l, xoff_h);
	yoff = random(yoff_l, yoff_h);

	let x = mapValue(shapeX(xoff, yoff), n_range_min, n_range_max, -pos_range_x, pos_range_x, true);
	let y = mapValue(shapeY(xoff, yoff), n_range_min, n_range_max, -pos_range_y, pos_range_y, true);

	if (x < minX) minX = x;
	if (x > maxX) maxX = x;
	if (y < minY) minY = y;
	if (y > maxY) maxY = y;

	// If we're just calculating bounds, don't draw anything
	if (calculatingBounds) return;

	// Apply the centering offset for actual drawing
	let centeredX = x + centerOffsetX;
	let centeredY = y + centerOffsetY;

	let ab_x = centeredX * MULTIPLIER; // Use centered coordinates
	let ab_y = centeredY * MULTIPLIER; // Use centered coordinates

	// Draw your actual particles (fillStyle is set once per frame in drawGenerator)
	drawingContext.fillRect(ab_x, ab_y, inkW, inkW);
}

function updateInk(cos_val, col_value) {
	let w = mapValue(abs(cos_val), 0.9, 1, 0.42, 1.46, true);
	inkW = w * MULTIPLIER * inkScale;

	let index = Math.floor(mapValue(abs(col_value), 0, 1, 0, palette.length - 1, true));

	hue = palette[index].hsl[0];
	sat = palette[index].hsl[1];
	let b = palette[index].hsl[2];

	// locals on purpose: `alpha` is a p5 global function and can't be reassigned in p5 2.x
	bri = mapValue(abs(cos_val), 0.5, 1, b, 0, true);
	let a_min = mapValue(elapsedTime, MAX_FRAMES / 1.31, MAX_FRAMES / 1.3, 0, 50, true);
	let a_max = mapValue(elapsedTime, MAX_FRAMES / 1.31, MAX_FRAMES / 1.3, 0, 0, true);
	let alpha = mapValue(abs(cos_val), 0.95, 1, 50 - a_min, 100 - a_max, true) * alphaScale;
	inkStyle = `hsla(${hue}, ${sat}%, ${bri}%, ${alpha}%)`;
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
