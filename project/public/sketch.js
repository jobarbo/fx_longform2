let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 600;
let DIM;
let MULTIPLIER;

let particle_num = 5000;

let xoff = 0.6;
let yoff = 0.001;
let woff = 0.3;

let xi = Math.random * 1000000000000;
let yi = Math.random * 1000000000000;

let n_range;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(3));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(45, 5, 100);
	xi = random(1000000000000);
	yi = random(1000000000000);
	/* 	xi = 0; */
	/* 	yi = 0; */
	n_range = width / 2.55;
}

function draw() {
	// Draw with p5.js things
	translate(width / 2, height / 2);

	//let angle = int(random([0, 45, 90]));
	//let angle = int(random([0, 45, 90, 180, 225, 270]));
	//let angle = int(random([0, 45, 90, 135, 180, 225, 270, 315]));
	let angle = 45;
	rotate(angle);
	paint(xoff, yoff, woff, particle_num, xi, yi);
}

function paint(xoff, yoff, woff, particle_num, xi, yi) {
	for (let s = 0; s < particle_num; s++) {
		xoff = random(0, 1);
		yoff = random(0, 1);
		woff = random(0, 1);
		//noiseDetail(62, 0.45);
		//! Simple Block
		/* 		let x = map(noise(xoff), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff), 0.1, 0.9, -n_range, n_range, true); */
		//! Electron microscope
		/* let x = map(noise(xoff, yoff), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, xoff), 0.1, 0.9, -n_range, n_range, true); */
		//!block Rect
		/* 		let x = map(noise(xoff, xoff, xi), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, yoff, yi), 0.1, 0.9, -n_range, n_range, true); */

		//!Drapery Yin Yang
		/* 		let x = map(noise(xoff, yoff, xi), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(xoff, yoff, yi), 0.1, 0.9, -n_range, n_range, true); */

		//!Drapery Equilibrium
		/* let x = map(noise(xoff, yoff, xi), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, xoff, yi), 0.1, 0.9, -n_range, n_range, true); */

		//! Astral Beings
		/* 		let x = map(noise(xoff, random([xoff, yoff, xi])), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, random([yoff, xoff, xi])), 0.1, 0.9, -n_range, n_range, true); */

		//! Astral Beings 2
		/* let x = map(noise(xoff, random([yoff, yoff, xi])), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, random([xoff, xoff, xi])), 0.1, 0.9, -n_range, n_range, true); */

		//! Astral Beings Asymmetrical
		let x = map(noise(xoff, random([xoff, yoff, xi])), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), 0.1, 0.9, -n_range, n_range, true);

		//! Hybrid Drapery Blocks
		/* let x = map(noise(xoff, random([xoff, xoff, yi])), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), 0.1, 0.9, -n_range, n_range, true); */

		//!complex organism (aliens)
		/* 		let x = map(noise(xoff, yoff, random([yoff, xoff])), 0.1, 0.9, -n_range, n_range, true);
		let y = map(noise(yoff, xoff, random([yoff, xoff])), 0.1, 0.9, -n_range, n_range, true); */

		let elW = 0.25 * MULTIPLIER;

		noStroke();
		//stroke(190, 53, 89, 0);
		fill(0, 75, 10, 100);
		ellipse(x, y, elW, elW);

		xi += 0.00000000000000001;
		yi += 0.00000000000000001;
	}
}
