class Mover {
	constructor(x, y, hue, scl1, scl2, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.hue = hue;
		this.sat = 0;
		this.bri = 0;
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.s = 0.6 * MULTIPLIER;
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
	}

	show() {
		//
		//blendMode(MULTIPLY);
		fill(this.hue, this.sat, this.bri, 100);
		//stroke(34, 40, 90,80);
		noStroke();
		ellipse(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.a1, this.a2, this.seed);

		let pos = abs(p.x) + abs(p.y);
		/* 		this.hue = map(pos, 0, 8, this.hue - 3, this.hue + 3, true);
		this.sat = map(pos, 0, 8, this.sat + 3, this.sat - 3, true);
		this.bri = map(pos, 0, 8, this.bri - 3, this.bri + 3, true); */
		this.x += (p.x / randomGaussian(0.02, 0.00000000000000001) + randomGaussian(0, 0.000001)) * MULTIPLIER;
		this.y += (p.y / randomGaussian(10.1, 0.00000000000000001) + randomGaussian(0, 0.000001)) * MULTIPLIER;
		//this.s += map(pos, 0, 8, -0.1 * MULTIPLIER, 0.1 * MULTIPLIER);

		this.s = map(abs(pos), 10, 40, 0, 1 * MULTIPLIER, true);

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
		if (this.x < -0.1 * width || this.x > 1.1 * width || this.y < -0.1 * height || this.y > 1.1 * height) {
			this.s = 0;
			this.x = random(-0, 1) * width;
			this.y = random(-0, 1) * height;
		}
	}
}

function superCurve(x, y, scl1, scl2, a1, a2, seed) {
	let nx = x,
		ny = y,
		scale1 = scl1,
		scale2 = scl2,
		amplitude1 = a1,
		amplitude2 = a2,
		dx,
		dy,
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

	let un = oct(nx, ny, scale1, 3, octave);
	let vn = oct(nx, ny, scale2, 2, octave);

	let zun = ZZ(un, 20, 120, 0.01);
	let zvn = ZZ(vn, 20, 120, 0.2);

	/* 	let u = map(noise(x * scl1, y * scl1, seed), 0, 1, -4, 4);
	let v = map(noise(x * scl2, y * scl2, seed), 0, 1, -4, 4); */
	//let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	//let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) - sin(x * scl2 * 0.2 + seed);

	let u = map(zun, -0.05, 0.0005, -25, 15, true);
	let v = map(zvn, -0.0005, 0.05, -15, 25, true);
	let p = createVector(u, v);
	return p;
}
