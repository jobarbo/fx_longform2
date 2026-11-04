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

//! Shaders: the artwork is drawn into mainCanvas (2D) and shown through the shader pipeline
// on the WEBGL display canvas. Effects are edited in the shader panel (key E / button bottom right).
const ENABLE_SHADERS = true;
const PERSIST_SHADER_PANEL = true; // localStorage: keep shader panel edits across refresh
const SHOW_FPS_UI = false; // FPS overlay drawn by shaderEffects (read in shaderEffects.setup)
// One rAF loop draws particles and shows the result (see startDisplayLoop)
const SHADER_PREVIEW_INTERVAL = 33; // min ms between displays while particles are drawn (0 = every frame)
const BOUNDS_BUDGET_MS = 12; // per-frame time spent on the bounds pass (draws nothing)
let mainCanvas; // offscreen 2D buffer holding the artwork
let shaderCanvas = null; // WEBGL display canvas, null when shaders are off or failed to start
let artCtx; // mainCanvas.drawingContext, used by the particle hot loop
let displayLoopId = null;
let lastDisplay = 0;
let renderDone = false;

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

let sketch = null; // render generator stepped by the display loop, null when idle
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
let x_val;
let y_val;
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

//! Seeded random: same LCG and state handling as p5 2.x random() / randomSeed(), so the exact same
// sequence, without p5's per-call overhead (it was ~28% of the render time). Only sketch.js draws from it.
const LCG_M = 4294967296;
let randState = 0;
function seedRand(seed) {
	randState = seed >>> 0;
}
function rand() {
	randState = (1664525 * randState + 1013904223) % LCG_M;
	return randState / LCG_M;
}
// p5 random(min, max)
function randRange(min, max) {
	const r = rand();
	if (min > max) {
		const t = min;
		min = max;
		max = t;
	}
	return r * (max - min) + min;
}
// p5 random([a, b]) / random([a, b, c]), without allocating the array
function pick2(a, b) {
	return Math.floor(rand() * 2) === 0 ? a : b;
}
function pick3(a, b, c) {
	const i = Math.floor(rand() * 3);
	return i === 0 ? a : i === 1 ? b : c;
}

//! Shapes: noise formulas returning the particle position in noise space (mapped to pos_range in paint)
// x is always evaluated before y so the rand() call order matches the original blocks
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
		x: (xoff, yoff) => noise(xoff, pick3(xoff, xoff, yi)),
		y: (xoff, yoff) => noise(yoff, pick3(yoff, xoff, yi)),
	},
	jellyfish: {
		x: (xoff, yoff) => noise(xoff, xoff, yoff),
		y: (xoff, yoff) => noise(yoff, yoff, xoff),
	},
	"jellyfish 2": {
		x: (xoff, yoff) => noise(xoff, pick2(xoff, yi), yoff),
		y: (xoff, yoff) => noise(yoff, pick2(yoff, yi), xoff),
	},
	"jellyfish 3": {
		x: (xoff, yoff) => noise(xoff, pick2(xoff, xi), pick2(yoff, yi)),
		y: (xoff, yoff) => noise(yoff, pick2(yoff, xi), pick2(xoff, yi)),
	},
	"astral beings": {
		x: (xoff, yoff) => noise(xoff, pick3(xoff, yoff, yi)),
		y: (xoff, yoff) => noise(yoff, pick3(yoff, xoff, yi)),
	},
	"astral beings 2": {
		x: (xoff, yoff) => noise(xoff, pick3(yoff, yoff, yi)),
		y: (xoff, yoff) => noise(yoff, pick3(xoff, xoff, yi)),
	},
	"astral beings 3": {
		x: (xoff, yoff) => noise(xoff, xoff, pick3(yoff, yoff, yi)),
		y: (xoff, yoff) => noise(yoff, yoff, pick3(xoff, xoff, yi)),
	},
	"astral beings 4": {
		x: (xoff, yoff) => noise(yoff, xoff, pick3(xoff, yoff, yi)),
		y: (xoff, yoff) => noise(xoff, yoff, pick3(xoff, yoff, yi)),
	},
	"astral beings asym": {
		x: (xoff, yoff) => noise(xoff, pick3(xoff, yoff, xi)),
		y: (xoff, yoff) => noise(yoff, pick3(yoff, xoff, yi)),
	},
	"complex organism": {
		x: (xoff, yoff) => noise(xoff, yoff, pick3(xoff, xi, yi)),
		y: (xoff, yoff) => noise(yoff, xoff, pick3(yoff, xi, yi)),
	},
};

let shapeX = SHAPES["jellyfish 3"].x;
let shapeY = SHAPES["jellyfish 3"].y;

// per-frame oscillator functions (p5 sin / cos / tan), resolved from the panel in applyConfig
let waveFns = {};

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
	// particles drawn per display frame (one generator step). Part of the look: Chrome rasterizes the
	// 2D canvas in batches that end with each JS task, and the blending depends on where they end.
	// Changing it, or drawing more than one step per task, changes the image (same hash, other pixels).
	cycle = 15000 * particleBoost;

	shapeX = SHAPES[p.shape].x;
	shapeY = SHAPES[p.shape].y;

	waveFns = Object.fromEntries(Object.entries(p.waves).map(([key, wave]) => [key, window[wave.fn]]));

	const start = p.paletteStart ?? window.PARAMS_UI.lockedSeeds.paletteStart;
	palette = basePalette.slice(start).concat(basePalette.slice(0, start));
}

// p5 2.x has no preload(): shaders are loaded in the async setup
async function setup() {
	features = $fx.getFeatures();

	console.log(features);

	// the panel restores saved controls on top of the defaults in params.js
	ParamsPanel.init({features: {paletteCreator: false, presentation: false}});
	window.groupPanelControls();
	window.resolveParams();

	// seeds are drawn once per page load and reused by every Apply.
	// Drawn before the shader setup, which also calls fxrand() (grain / chromatic seed).
	window.PARAMS_UI.lockedSeeds = {
		randomSeed: fxrand() * 10000,
		noiseSeed: fxrand() * 10000,
		paletteStart: Math.floor(Math.random() * basePalette.length),
	};

	if (shadersEnabled(ENABLE_SHADERS)) {
		try {
			await shaderEffects.preload(window);
		} catch (error) {
			console.warn("Shaders failed to load, drawing without them:", error);
		}
	}

	C_WIDTH = min(DEFAULT_SIZE * CM, DEFAULT_SIZE * CM);
	MULTIPLIER = C_WIDTH / DEFAULT_SIZE;
	currentPixelRatio = CURRENT_PARAMS.pixelRatio;
	const density = dpi(currentPixelRatio);

	mainCanvas = createGraphics(C_WIDTH, C_WIDTH * 1);
	mainCanvas.pixelDensity(density);
	mainCanvas.angleMode(DEGREES);
	artCtx = mainCanvas.drawingContext;
	createDisplayCanvas(density);

	colorMode(HSB, 360, 100, 100, 100);
	rectMode(CENTER);
	angleMode(DEGREES); // also used by the sin / cos oscillators

	applyConfig();
	renderPiece();

	if (shaderCanvas && typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.init(shaderEffects);
	startDisplayLoop();
}

// WEBGL canvas fed by the shader pipeline, or a plain 2D canvas when shaders are off / unavailable
function createDisplayCanvas(density) {
	if (shadersEnabled(ENABLE_SHADERS) && shaderEffects.shaderManager) {
		try {
			c = createCanvas(C_WIDTH, C_WIDTH * 1, WEBGL);
			pixelDensity(density);
			// panel edits saved in localStorage win over the defaults in shaders/sketch-shaders.js
			if (PERSIST_SHADER_PANEL) shaderEffects.loadPersistedPanelConfig();
			shaderEffects.setup(width, height, mainCanvas, c, density);
			shaderCanvas = c;
			return;
		} catch (error) {
			console.warn("Shader setup failed, drawing without shaders:", error);
			shaderCanvas = null;
		}
	}

	c = createCanvas(C_WIDTH, C_WIDTH * 1);
	pixelDensity(density);
	// style.css renders canvas.p5Canvas pixelated unless .is-smooth (shader panel "crisp pixels")
	c.canvas.classList.add("is-smooth");
}

function setArtworkPixelDensity(density) {
	mainCanvas.pixelDensity(density); // resizes (and clears) the buffer, renderPiece redraws it
	mainCanvas.angleMode(DEGREES);
	artCtx = mainCanvas.drawingContext;
	pixelDensity(density);
	if (shaderCanvas) shaderEffects.setPixelDensity(density);
}

// Single rAF loop: advances the render generator, then puts mainCanvas on screen. Once the render
// is done it keeps running the shaders (animated effects + live panel edits).
// While drawing: exactly one generator step (`cycle` particles) per frame. A time budget would make
// the batch boundaries timing dependent, and so the pixels (see cycle in applyConfig).
// The bounds pass draws nothing, so it gets a time budget instead.
function startDisplayLoop() {
	if (displayLoopId !== null) return;
	const tick = () => {
		displayLoopId = requestAnimationFrame(tick);
		if (shaderCanvas && typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.update();

		if (sketch) {
			const deadline = performance.now() + BOUNDS_BUDGET_MS;
			let step;
			do step = sketch.next();
			while (!step.done && calculatingBounds && performance.now() < deadline);
			if (step.done) sketch = null;
		}

		if (!renderDone && performance.now() - lastDisplay < SHADER_PREVIEW_INTERVAL) return;
		showFrame();
	};
	displayLoopId = requestAnimationFrame(tick);
}

function showFrame() {
	lastDisplay = performance.now();
	if (shaderCanvas) {
		shaderEffects.renderFrame(renderDone);
	} else {
		image(mainCanvas, 0, 0, width, height);
	}
}

// Apply from the panel: same hash and seeds, new settings
window.applyGenerativeSettings = async function applyGenerativeSettings(settings) {
	if (!settings || !window.PARAMS_UI?.lockedSeeds) return;

	window.PARAMS_UI.current = {...window.PARAMS_UI.current, ...settings};
	window.resolveParams();

	if (CURRENT_PARAMS.pixelRatio !== currentPixelRatio) {
		currentPixelRatio = CURRENT_PARAMS.pixelRatio;
		setArtworkPixelDensity(dpi(currentPixelRatio));
	}

	applyConfig();
	renderPiece();
};

function drawBackground() {
	const w = mainCanvas.width;
	const h = mainCanvas.height;
	artCtx.globalCompositeOperation = "source-over";
	let gradient = artCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
	gradient.addColorStop(0.5, "hsl(25, 100%, 95%)");
	gradient.addColorStop(0.8, "hsl(36, 100%, 95%)");
	artCtx.fillStyle = gradient;
	artCtx.fillRect(0, 0, w, h);
}

function renderPiece() {
	// stop a render that is still running
	sketch = null;
	clearTimeout(completeTimer);
	document.complete = false;
	window.dispatchEvent(new CustomEvent("render:started"));

	elapsedTime = 0;
	framesRendered = 0;
	drawing = true;
	startTime = 0;
	renderStart = Date.now();
	renderDone = false;
	if (shaderCanvas) shaderEffects.setParticleAnimationComplete(false);

	mainCanvas.resetMatrix();
	drawBackground();
	showFrame();
	document.title = "0%";

	// stepped by the display loop (startDisplayLoop), bounds pass included
	sketch = renderGenerator();
}

// Whole render as one generator: a bounds pass on a particle sample (nothing drawn) to center
// the piece, then the actual drawing. Same rand() call order as running both passes back to back.
function* renderGenerator() {
	const seeds = window.PARAMS_UI.lockedSeeds;
	seedRand(seeds.randomSeed);
	noiseSeed(seeds.noiseSeed);
	noiseDetail(CURRENT_PARAMS.noiseOctaves, CURRENT_PARAMS.noiseFalloff);

	mainCanvas.resetMatrix();
	xi = rand() * 1000000000000;
	yi = rand() * 1000000000000;
	pos_range_x = height * CURRENT_PARAMS.posRange;
	pos_range_y = height * CURRENT_PARAMS.posRange;

	mainCanvas.translate(width / 2, height / 2);

	// First pass: calculate bounds with a smaller sample
	minX = Infinity;
	maxX = -Infinity;
	minY = Infinity;
	maxY = -Infinity;
	calculatingBounds = true;
	let boundsSamplingFactor = 0.2 / particleBoost; // Calculate bounds using 20% of the original particle count
	let boundsSampleNum = Math.max(100, Math.floor(particle_num * boundsSamplingFactor)); // Ensure minimum sample sizes

	console.log(`Calculating bounds with ${boundsSampleNum} particles (${boundsSamplingFactor * 100}% of total)`);

	let tempParticleNum = particle_num;
	particle_num = boundsSampleNum; // Temporarily reduce particle count

	yield* drawGenerator();

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

	// Actual drawing
	yield* drawGenerator();
}

function* drawGenerator() {
	let count = 0;
	let generator_frameCount = 0;
	const p = CURRENT_PARAMS;

	while (true) {
		// fn / frequency of each oscillator come from the panel (Waves section)
		cos_val = waveFns.cos(generator_frameCount * p.waves.cos.freq);
		sin_val = waveFns.sin(generator_frameCount * p.waves.sin.freq);
		noise_cos = waveFns.noise(generator_frameCount * p.waves.noise.freq);
		off_cos = waveFns.off(generator_frameCount * p.waves.off.freq);
		col_cos = waveFns.col(generator_frameCount * p.waves.col.freq);
		x_val = waveFns.x(generator_frameCount * p.waves.x.freq);
		y_val = waveFns.y(generator_frameCount * p.waves.y.freq);

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

			mainCanvas.push();
			mainCanvas.rotate(angle1[i]);
			mainCanvas.scale(scale1);
			artCtx.fillStyle = inkStyle;
			// use the bounding box to draw the particles so that it can be centered along with the bounding box

			for (let s = 0; s < particle_num; s++) {
				paint(xoff_l, xoff_h, yoff_l, yoff_h);

				if (count >= cycle) {
					count = 0;
					yield;
				}
				count++;
			}
			mainCanvas.pop();
		}

		elapsedTime = generator_frameCount - startTime;

		// the bounds pass runs the whole generator too: keep the title for the real render
		if (!calculatingBounds) showLoadingBar(elapsedTime, MAX_FRAMES, renderStart);

		generator_frameCount++;
		if (elapsedTime > MAX_FRAMES && drawing) {
			if (calculatingBounds) return;

			// the display loop shows the final frame (through the shaders) on its next tick
			renderDone = true;
			if (shaderCanvas) shaderEffects.setParticleAnimationComplete(true);

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

			return;
		}
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h) {
	xoff = randRange(xoff_l, xoff_h);
	yoff = randRange(yoff_l, yoff_h);

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
	artCtx.fillRect(ab_x, ab_y, inkW, inkW);
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

function keyPressed() {
	// don't hijack keys while typing in panel inputs
	const el = document.activeElement;
	if (["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName) || el?.isContentEditable) return;

	if ((key === "E" || key === "e") && shaderCanvas && typeof shaderEffectsPanel !== "undefined") shaderEffectsPanel.toggle();
}
