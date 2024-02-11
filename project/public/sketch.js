let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 400;
let DIM;
let MULTIPLIER;
let MAX_FRAMES = 350;

let particle_num = 5000;

let xoff = 0.6;
let yoff = 0.001;
let woff = 0.3;

let xi = Math.random * 1000000000000;
let yi = Math.random * 1000000000000;

let pos_range;
let n_range_min = 0.1;
let n_range_max = 0.9;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(maxDPI));
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
	pos_range = width;
}

function draw() {
	// Draw with p5.js things
	translate(width / 2, height / 2);

	//let angle = int(random([0, 45, 90]));
	//let angle = int(random([0, 45, 90, 180, 225, 270]));
	//let angle = int(random([0, 45, 90, 135, 180, 225, 270, 315]));
	//let angle = random([45, 225]);
	//let angle = random([45, 135, 225, 315]);
	//let angle = random([0, 180]);
	//let angle = random([90, 270]);
	let angle = 45;
	//let angle = random([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350]);
	rotate(angle);
	scale(0.5);
	paint(xoff, yoff, woff, particle_num, xi, yi);

	if (frameCount >= MAX_FRAMES) {
		document.complete = true;
		noLoop();
	}
}

function paint(xoff, yoff, woff, particle_num, xi, yi) {
	for (let s = 0; s < particle_num; s++) {
		xoff = random(0, 1);
		yoff = random(0, 1);
		woff = random(0, 1);
		//noiseDetail(10, 0.5);
		//! Simple Block
		/* 		let x = map(noise(xoff),n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff),n_range_min, n_range_max, -pos_range, pos_range, true); */
		//! Electron microscope
		/* 		let x = map(noise(xoff, yoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//!block Rect
		/* 		let x = map(noise(xoff, xoff, xi),n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, yi),n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Yin Yang
		/* let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true);
 */
		//!Drapery Equilibrium
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings
		let x = map(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);

		//! Astral Beings 2
		/* 		let x = map(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 3
		/* 	let x = map(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		/* 		let x = map(noise(yoff, xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings Asymmetrical
		/* let x = map(noise(xoff, random([xoff, yoff, xi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Hybrid Drapery Blocks
		/* let x = map(noise(xoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!complex organism (aliens)
		/* 		let x = map(noise(xoff, yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		let elW = 0.2 * MULTIPLIER;

		noStroke();
		//stroke(190, 53, 89, 0);
		fill(0, 75, 10, 100);
		ellipse(x, y, elW, elW);

		xi += 0.0000000000000000000001;
		yi += 0.0000000000000000000001;
	}
}
