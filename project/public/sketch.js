let features = "",
	maxDPI = 3,
	RATIO = 1,
	W = window.innerWidth,
	H = window.innerHeight,
	CM = 1,
	DEFAULT_SIZE = 600,
	DIM,
	MULTIPLIER,
	particle_num = 5000,
	xoff = 0.6,
	yoff = 0.001,
	woff = 0.3,
	xi = Math.random() * 1e12,
	yi = Math.random() * 1e12,
	n_range;

function setup() {
	features = $fx.getFeatures();
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(3));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(45, 5, 100);
	xi = random(1e12);
	yi = random(1e12);
	n_range = width / 2.55;
}

function draw() {
	translate(width / 2, height / 2);
	let angle = int(random([0, 45, 90, 135, 180, 225, 270, 315]));
	rotate(angle);
	paint(xoff, yoff, woff, particle_num, xi, yi);
}

function paint(xoff, yoff, woff, particle_num, xi, yi) {
	let cos_val = cos(frameCount * 2),
		sin_val = sin(frameCount * 2);
	for (let s = 0; s < particle_num; s++) {
		xoff = random();
		yoff = random();
		woff = random();
		noiseDetail(1, 0.5);
		let x = map(noise(xoff, cos_val, yoff || xi), 0, 1, -n_range, n_range, true);
		let y = map(noise(yoff, sin_val, xoff || xi), 0, 1, -n_range, n_range, true);
		let elW = 0.25 * MULTIPLIER;
		noStroke();
		fill(0, 75, 10, 100);
		ellipse(x, y, elW, elW);
		xi += 1e-17;
		yi += 1e-17;
	}
}
