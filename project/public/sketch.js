function generateUpDownPattern(maxPatternValue) {
	const pattern = [];
	for (let i = 1; i <= maxPatternValue; i++) pattern.push(i);
	for (let i = maxPatternValue - 1; i > 1; i--) pattern.push(i);
	return pattern;
}
function generateSymmetricOffValues(numCases, baseLow, baseHigh, maxPatternValue) {
	const offValues = [],
		pattern = generateUpDownPattern(maxPatternValue),
		increment = 1;
	for (let i = 0; i < numCases; i++) {
		const patternIndex = i % pattern.length,
			low = baseLow + (pattern[patternIndex] - 1) * increment,
			high = baseHigh + (pattern[patternIndex] - 1) * increment;
		offValues.push({low, high});
	}
	return offValues;
}

// url search params
const sp = new URLSearchParams(window.location.search);

let features = "",
	maxDPI = 3,
	MAX_FRAMES = 800,
	RATIO = 1,
	W = window.innerWidth,
	H = window.innerHeight,
	CM = 1,
	DEFAULT_SIZE = 600,
	DIM,
	MULTIPLIER,
	particle_num = 15000,
	xoff = 0.6,
	yoff = 0.001,
	woff = 0.3,
	xi = Math.random() * 1e12,
	yi = Math.random() * 1e12,
	n_range,
	xoff_l_init = 0.6,
	xoff_l = xoff_l_init,
	xoff_h = 1,
	yoff_l_init = 0.6,
	yoff_l = yoff_l_init,
	yoff_h = 1,
	numCases = 1,
	baseLow_l = 1,
	baseHigh_l = 0.148,
	maxPatternValue_l = 1,
	baseLow_h = 1.148,
	baseHigh_h = 0,
	maxPatternValue_h = 1,
	offValues_l = generateSymmetricOffValues(numCases, baseLow_l, baseHigh_l, maxPatternValue_l),
	offValues_h = generateSymmetricOffValues(numCases, baseLow_h, baseHigh_h, maxPatternValue_h),
	n_range_min = 0,
	n_range_max = 1,
	pos_range_x,
	pos_range_y;
let cos_val, sin_val, noise_cos, off_cos, col_cos, x_val, y_val;
DIM = Math.min(window.innerWidth * CM, window.innerHeight * CM);
MULTIPLIER = DIM / DEFAULT_SIZE;

function setup() {
	createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(maxDPI));
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	background(45, 5, 100);
	xi = random(1e12);
	yi = random(1e12);
	pos_range_x = width * 0.35;
	pos_range_y = height * 0.35;
}
function draw() {
	if (frameCount > MAX_FRAMES) noLoop();
	translate(width / 2, height / 2);
	rotate(int(random([45])));
	paint(xoff, yoff, particle_num, xi, yi);
}
function paint(xoff, yoff, particle_num, xi, yi) {
	let xoff_l_high = mapValue(abs(sin(frameCount * 40)), 0, 1, offValues_h[0].low, offValues_h[0].high, 1),
		xoff_l_low = mapValue(abs(sin(frameCount * 40)), 0, 1, offValues_l[0].low, offValues_l[0].high, 1),
		xoff_l = mapValue(cos(frameCount * 12), -1, 0, xoff_l_high, xoff_l_low, 1),
		yoff_l = mapValue(cos(frameCount * 12), 0, 1, xoff_l_low, xoff_l_high, 1);
	for (let s = 0; s < particle_num; s++) {
		xoff = random(xoff_l, xoff_l_high + 1e-6);
		yoff = random(yoff_l, xoff_l_high + 1e-6);
		noiseDetail(6, 0.5);
		let x = map(noise(xoff, cos(frameCount * 20), random([yoff, yoff, xi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, 1),
			y = map(noise(yoff, cos(frameCount * 20), random([xoff, xoff, xi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, 1),
			elW = mapValue(abs(cos(frameCount * 12)), 0, 1, 0.1, 0.05, 1) * MULTIPLIER,
			ab_x = constrain(x, -width, width) * MULTIPLIER,
			ab_y = constrain(y, -height, height) * MULTIPLIER,
			bri_min = mapValue(frameCount, MAX_FRAMES / 1.21, MAX_FRAMES / 1.2, 0, 100, 1),
			bri_max = mapValue(frameCount, MAX_FRAMES / 1.21, MAX_FRAMES / 1.2, 0, 0, 1),
			bri = mapValue(abs(cos(frameCount * 12)), 0.9, 1, 20 - bri_max, 20 - bri_min, 1),
			alpha = mapValue(abs(cos(frameCount * 12)), 0, 1, 50, 100, 1);
		drawingContext.fillStyle = `hsla(0, 0%, ${bri}%, ${alpha}%)`;
		drawingContext.fillRect(ab_x, ab_y, elW, elW);
		xi += 1e-17;
		yi += 1e-17;
	}
}
// ! LE FIN
