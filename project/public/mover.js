class Mover {
	constructor(x, y, hue, scl1, scl2, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.hue = hue;
		this.sat = 0;
		this.bri = 100;
		this.a = 5;
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.s = 6 * MULTIPLIER;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.a1 = a1;
		this.a2 = a2;
		this.seed = seed;
		this.xRandDivider = random(0.0001, 2.01) * MULTIPLIER;
		this.yRandDivider = random(0.0001, 2.01) * MULTIPLIER;
		this.xRandOffset = random(-3.1, 0.1) * MULTIPLIER;
		this.yRandOffset = random(-0.1, 3.1) * MULTIPLIER;
		this.minSat = random(1, 20);
		this.minBri = random(1, 20);

		this.initVar = {
			a: 10,
			b: 28,
			c: 88 / 41.001,
			x: 0.02,
			y: 0.02,
			z: 0,
			dt: 0.001,
		};
	}

	show() {
		//
		//blendMode(MULTIPLY);
		fill(this.hue, this.sat, this.bri, this.a);
		//stroke(34, 40, 90,80);
		noStroke();
		ellipse(this.x, this.y, this.s);
	}

	move(elapsedTime, maxFrames) {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.a1, this.a2, this.seed, this.initVar);

		let pos = abs(p.x) + abs(p.y);
		/* 		this.hue = map(pos, 0, 8, this.hue - 3, this.hue + 3, true);
		this.sat = map(pos, 0, 8, this.sat + 3, this.sat - 3, true);
		this.bri = map(pos, 0, 8, this.bri - 3, this.bri + 3, true); */
		this.x += (p.x / randomGaussian(0.04, 0.00000000000000001) + randomGaussian(0, 0.000001)) * MULTIPLIER;
		this.y += (p.y / randomGaussian(0.9, 0.00000000000000001) + randomGaussian(0, 0.000001)) * MULTIPLIER;
		//this.s += map(pos, 0, 8, -0.1 * MULTIPLIER, 0.1 * MULTIPLIER);

		this.s = map(abs(pos), 20, 40, 0.2, 1, true) * MULTIPLIER;
		this.a = map(abs(pos), 20, 40, 100, 100, true);

		/* 		if (this.hue < 0) {
			this.hue = 360;
		}
		if (this.hue > 360) {
			this.hue = 0;
		} */
		/*
		if (this.sat < 20) {
			this.sat = random(20, 40);
		} else if (this.sat > 100) {
			this.sat = random(80, 100);
		}
		if (this.bri < 20) {
			this.bri = random(20, 30);
		} else if (this.bri > 100) {
			this.bri = random(90, 100);
		} */
		/* 		if (this.s < 1 * MULTIPLIER) {
			this.s = 1 * MULTIPLIER;
		}
		if (this.s > 5 * MULTIPLIER) {
			this.s = 5 * MULTIPLIER;
		} */

		// if out of bounds, reset to random position inside canvas

		if (elapsedTime < maxFrames / 1.5) {
			if (this.x < -0.1 * width || this.x > 1.1 * width || this.y < -0.1 * height || this.y > 1.1 * height) {
				this.s = 0;
				this.x = random(-0.1, 1.1) * width;
				this.y = random(-0.1, 1.1) * height;
			}
		} else {
			// Check if out of bounds and reposition to the opposite side
			if (this.x < -0.012 * width) {
				this.x = random(1.01, 1.012) * width; // Move to the right side
				/* 				this.hue = 190;
				this.sat = 100; */
			} else if (this.x > 1.012 * width) {
				this.x = random(-0.012, -0.01) * width; // Move to the left side
				/* 				this.hue = 35;
				this.sat = 100; */
			}
			if (this.y < -0.012 * height) {
				this.y = random(1.01, 1.012) * height; // Move to the bottom side
			} else if (this.y > 1.012 * height) {
				this.y = random(-0.012, -0.01) * height; // Move to the top side
			}
		}
	}
}

function superCurve(x, y, scl1, scl2, a1, a2, seed, initVar) {
	let nx = x,
		ny = y,
		scale1 = scl1,
		scale2 = scl2,
		amplitude1 = a1,
		amplitude2 = a2,
		dx,
		dy,
		init_var = initVar,
		octave = 1;

	dx = oct(nx, ny, scale1, 0, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * amplitude1;
	ny += dy * amplitude2;

	dx = oct(nx, ny, scale1, 4, octave);
	dy = oct(nx, ny, scale2, 3, octave);
	nx += dx * amplitude1;
	ny += dy * amplitude2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * amplitude1;
	ny += dy * amplitude2;

	/* 	let un = oct(nx, ny, scale1, 3, octave);
	let vn = oct(nx, ny, scale2, 2, octave); */
	/* 	let u = map(un, -0.05, 0.0005, -25, 15, true);
	let v = map(vn, -0.0005, 0.05, -15, 25, true); */

	/* 	let u = map(noise(x * scl1, y * scl1, seed), 0, 1, -4, 4);
	let v = map(noise(x * scl2, y * scl2, seed), 0, 1, -4, 4); */
	let time = millis() * 0.00000001; // Introduce a time variable for dynamic movement
	let noiseScale = 0.00001; // Scale for noise function

	// Modify the calculations to include time and noise
	let un = sin(y * scl1 + seed + time) + cos(y * scl2 + seed + time) + sin(y * scl2 * 6.5 + seed + time) + oct(ny * scl1 + seed + time, nx * scl2 + seed + time, noiseScale, 2, 6);
	let vn = sin(x * scl1 + seed + time) + cos(x * scl2 + seed + time) - sin(x * scl2 * 2.05 + seed + time) + oct(nx * scl2 + seed + time, ny * scl1 + seed + time, noiseScale, 3, 6);

	//! brutalism config (with or without ZZ)
	let zun = ZZ(un, 10, 120, 0.27);
	let zvn = ZZ(vn, 10, 120, 0.27);

	//let u = map(zun, -0.05, 0.0005, -25, 15, true);
	//let v = map(zvn, -0.0005, 0.05, -15, 25, true);

	//! really cool wavey config
	/* 	let u = map(un, -1.05, 1.0005, -25, 15, true);
	let v = map(zvn, -1.0005, 1.05, -15, 25, true); */

	// Calculate Lorenz-like values
	init_var.x = zun;
	init_var.y = zvn;
	let dir_x = init_var.a * (init_var.y - init_var.x) * init_var.dt;
	let dir_y = (init_var.b * init_var.x - init_var.c * init_var.y) * init_var.dt;

	// Modify the final u and v calculations to incorporate the Lorenz values
	let u = map(dir_x, -0.05, 0.0005, -25, 15, true);
	let v = map(dir_y, -0.0005, 0.05, -15, 25, true);

	// Or alternatively, blend them multiplicatively:
	// let u = map(zun * (1 + abs(dir_x)), -0.05, 0.0005, -25, 15, true);
	// let v = map(zvn * (1 + abs(dir_y)), -0.0005, 0.05, -15, 25, true);

	let p = createVector(u, v);
	return p;
}
