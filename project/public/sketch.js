let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = 1200;
let DIM;
let MULTIPLIER;
let MAX_FRAMES = 700;

let particle_num = 10000;

let xoff = 0.6;
let yoff = 0.001;

let xi = Math.random * 1000000000000;
let yi = Math.random * 1000000000000;

let pos_range;
//! Standard noise
let n_range_min = 0;
let n_range_max = 1;
//! Custom noise
/* let n_range_min = -1;
let n_range_max = 1; */
let hue = 0;
let sat = 0;

let displacement1 = 0;
let displacement2 = 100;

let angle1 = 0;
let angle2 = 0;

let nx_scale = 0.00005;
let ny_scale = 0.00005;
/* let nx_scale = 0.001;
let ny_scale = 0.001; */

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	C_WIDTH = min(DEFAULT_SIZE * CM, DEFAULT_SIZE * CM);
	MULTIPLIER = C_WIDTH / DEFAULT_SIZE;
	console.log(MULTIPLIER);
	c = createCanvas(C_WIDTH, C_WIDTH * RATIO);
	pixelDensity(dpi(maxDPI));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	//background(45, 0, 4);
	//background(45, 10, 100);
	// make a radial gradient background in vanilla js
	drawingContext.globalCompositeOperation = "source-over";
	let gradient = drawingContext.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
	gradient.addColorStop(0.5, "hsl(45, 100%, 95%)");
	gradient.addColorStop(1, "hsl(45, 100%, 93%)");
	drawingContext.fillStyle = gradient;
	drawingContext.fillRect(0, 0, width, height);

	xi = random(1000000000000);
	yi = random(1000000000000);
	pos_range = width / 1.5;
}

function draw() {
	// Draw with p5.js things
	//blendMode(SCREEN);
	displacement2 = random([100, 200, 300]);
	translate(width / 2, height / 2);

	//let angle = int(random([0, 45, 90]));
	//let angle = int(random([0, 45, 90, 180, 225, 270]));
	//let angle1 = int(random([0, 45, 90, 135, 180, 225, 270, 315]));
	let angle1 = random([45, 225]);
	//let angle1 = random([45, 135, 225, 315]);
	//let angle1 = random([45, 135, 225, 315]);
	//let angle1 = random([0, 90, 180, 270]);
	//let angle1 = random([90, 270]);
	//let angle1 = 45;
	//let angle2 = random([0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340]);
	//let angle = random([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350]);

	let scale1 = 1;
	let scale2 = 1;

	push();
	rotate(angle1);
	scale(scale1);
	paint(random([0.15, 0.9]), 1, random([0.15, 0.9]), 1, particle_num, xi, yi, scale1);
	pop();
	/* 	push();
	rotate(angle2);
	translate(0, displacement2);
	scale(scale2);
	paint(0.4, 0.6, 0.1, 0.9, particle_num, xi, yi, scale2);
	pop(); */
	blendMode(BLEND);
	if (frameCount >= MAX_FRAMES) {
		document.complete = true;
		noLoop();
	}
}

function paint(xoff_l, xoff_h, yoff_l, yoff_h, particle_num, xi, yi, scale) {
	for (let s = 0; s < particle_num; s++) {
		xoff = random(xoff_l, xoff_h);
		yoff = random(yoff_l, yoff_h);
		//noiseDetail(4, 0.5);
		//! Simple Block
		/* 		let x = map(noise(xoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//! Electron microscope
		/* 		let x = map(noise(xoff, yoff), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff), n_range_min, n_range_max, -pos_range, pos_range, true); */
		/* 		let x = map(oct(xoff, yoff, nx_scale, 1, 1), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(oct(yoff, xoff, ny_scale, 1, 1), n_range_min, n_range_max, -pos_range, pos_range, true); */
		//!block Rect
		/* 		let x = map(noise(xoff, xoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Yin Yang
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(xoff, yoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//!Drapery Equilibrium
		/* 		let x = map(noise(xoff, yoff, xi), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, xoff, yi), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings
		/* 		let x = map(noise(xoff, random([xoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([yoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 2
		/* 		let x = map(noise(xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true); */

		//! Astral Beings 3
		let x = map(noise(xoff, xoff, random([yoff, yoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);
		let y = map(noise(yoff, yoff, random([xoff, xoff, yi])), n_range_min, n_range_max, -pos_range, pos_range, true);

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

		//let w = map(scale, 0, 2, 0.3, 0.1, true);
		//let w = 0.25;
		let dist_center = dist(0, 0, x, y);
		let w = map(dist_center, 0, pos_range / 2, 0.15, 0.2, true);
		let elW = w * MULTIPLIER;
		let ab_x = abs(x);
		let ab_y = abs(y);
		// map the saturation to the distance from the center
		sat = map(sqrt(ab_x * ab_x + ab_y * ab_y), 0, pos_range / 3, 0, 100, true);
		hue = map(sqrt(ab_x * ab_x + ab_y * ab_y), 0, pos_range, 0, 45, true);
		noStroke();
		fill(0, 75, 10, 100);
		rect(x, y, elW, elW);

		xi += 0.0000000000000000000001;
		yi += 0.0000000000000000000001;

		//!animated scaling , need octaves
		/* 
		nx_scale *= 1.00000025;
		ny_scale *= 1.00000025;

		nx_scale = constrain(nx_scale, 0.00005, 0.002);
		ny_scale = constrain(ny_scale, 0.00005, 0.002); */
	}
}
