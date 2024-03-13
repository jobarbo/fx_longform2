let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 400;
let DIM;
let MULTIPLIER;
let MAX_FRAMES = 1350;

let particle_num = 20000;

let xoff = 0.6;
let yoff = 0.001;
let woff = 0.3;

let xi = Math.random * 1000000000000;
let yi = Math.random * 1000000000000;

let pos_range;
let n_range_min = 0;
let n_range_max = 1;
let hue = 0;
let sat = 0;

let displacement1 = 0;
let displacement2 = 100;

let angle1 = 0;
let angle2 = 0;

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
	background(45, 0, 4);
	xi = random(1000000000000);
	yi = random(1000000000000);
	wi = random(1000000000000);
	pos_range = width;
}

function draw() {
	// Draw with p5.js things
	blendMode(SCREEN);
	displacement2 = random([100, 200, 300]);
	translate(width / 2, height / 2);

	//let angle = int(random([0, 45, 90]));
	//let angle = int(random([0, 45, 90, 180, 225, 270]));
	//let angle2 = int(random([0, 45, 90, 135, 180, 225, 270, 315]));
	//let angle = random([45, 225]);
	//let angle1 = random([45, 135, 225, 315]);
	//let angle = random([0, 180]);
	//let angle1 = random([0, 90, 180, 270]);
	//let angle = random([90, 270]);
	//let angle1 = 45;
	//let angle2 = random([0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340]);
	//let angle = random([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350]);

	let scale1 = 0.3;
	let scale2 = 0.4;

	push();
	rotate(angle1);
	scale(scale1);
	paint(0, 1, 0, 0.6, 0, 1, particle_num, xi, yi, wi, scale1);
	pop();
	push();
	rotate(angle2);
	translate(0, displacement2);
	scale(scale2);
	paint(0.4, 0.6, 0.1, 0.9, 0, 1, particle_num, xi, yi, wi, scale2);
	pop();
	blendMode(BLEND);
	angle1 += 90;
	angle2 += 45;
	angle1 = angle1 < 0 ? 360 : angle1 > 360 ? 0 : angle1;
	angle2 = angle2 < 0 ? 360 : angle2 > 360 ? 0 : angle2;
	displacement2 += 50;
	if (displacement2 > 300) {
		displacement2 = 100;
	}
	if (frameCount >= MAX_FRAMES) {
		document.complete = true;
		noLoop();
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h, woff_l, woff_h, particle_num, xi, yi, wi, scale) {
	for (let s = 0; s < particle_num; s++) {
		xoff = random(xoff_l, xoff_h);
		yoff = random(yoff_l, yoff_h);
		woff = random(woff_l, woff_h);
		//noiseDetail(10, 0.5);
		//! Simple Block
		/* 		let x = map(noise(xoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//! Electron microscope
		/* let x = map(noise(xoff, yoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		/* 		let x = map(oct(xoff, yoff, 0.0005, 1, 2), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(oct(yoff, xoff, 0.0025, 0, 2), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//!block Rect
		/* 		let x = map(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Yin Yang
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Equilibrium
		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true);

		//! Astral Beings
		/* 		let x = map(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 2
		/* 		let x = map(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 3
		/* 		let x = map(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		/* let x = map(noise(yoff, xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings Asymmetrical
		/* 		let x = map(noise(xoff, random([xoff, yoff, xi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Hybrid Drapery Blocks
		/* let x = map(noise(xoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!complex organism (aliens)
		/* 		let x = map(noise(xoff, yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		noStroke();
		let w = map(noise(woff, random([xoff, yoff, wi])), n_range_min, n_range_max, 0.3, 0.3, true);
		// map w to a higher value if the scale argument is smaller
		//let w = map(scale, 0, 0.4, 1.6, 0.1, true);
		/* 		let dist_center = dist(0, 0, x, y);
		let w = map(dist_center, 0, pos_range, 0.2, 0.5, true); */
		let elW = w * MULTIPLIER;
		let ab_x = abs(x);
		let ab_y = abs(y);
		// map the saturation to the distance from the center
		sat = map(sqrt(ab_x * ab_x + ab_y * ab_y), 0, pos_range / 3, 0, 100, true);
		hue = map(sqrt(ab_x * ab_x + ab_y * ab_y), 0, pos_range, 0, 45, true);
		fill(hue, sat, random([5, 10, 25, 50, 100]), 100);
		ellipse(x, y, elW, elW);

		wi += 0.0000000000000000000001;
		xi += 0.0000000000000000000001;
		yi += 0.0000000000000000000001;
	}
}
