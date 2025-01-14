class Mover {
	constructor(x, y, hue, scl1, scl2, seed) {
		this.x1 = x;
		this.y1 = y;
		this.x2 = x + randomGaussian(0.00001, 0.01) * width;
		this.y2 = y + randomGaussian(0.00001, 0.01) * height;
		this.x3 = x + randomGaussian(0.00001, 0.01) * width;
		this.y3 = y + randomGaussian(0.00001, 0.01) * height;
		this.initHue = hue;
		this.hue = hue;
		this.sat = 0;
		this.bri = 0;
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.s = 2.5 * MULTIPLIER;
		this.scl1 = scl1;
		this.scl2 = scl2;
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
		//noFill();
		fill(random(0, 30), random(30, 70), 100, 100);
		stroke(this.hue, this.sat, this.bri, 100);
		//noStroke();
		triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
	}

	move() {
		let p = superCurve(this.x1, this.y1, this.scl1, this.scl2, this.seed);

		let pos = abs(p.x) + abs(p.y);
		/* 		this.hue = map(pos, 0, 8, this.hue - 3, this.hue + 3, true);
		this.sat = map(pos, 0, 8, this.sat + 3, this.sat - 3, true);
		this.bri = map(pos, 0, 8, this.bri - 3, this.bri + 3, true); */
		this.x1 += (p.x / randomGaussian(0.01, 0.01) + randomGaussian(0.1, 0.00000000000000001)) * MULTIPLIER;
		this.y1 += (p.y / randomGaussian(0.01, 0.01) + randomGaussian(0.1, 0.00000000000000001)) * MULTIPLIER;
		this.x2 = this.x1 + randomGaussian(0.01, 0.01) * width;
		this.y2 = this.y1 + randomGaussian(0.01, 0.01) * height;
		this.x3 = this.x1 + randomGaussian(0.01, 0.01) * width;
		this.y3 = this.y1 + randomGaussian(0.01, 0.01) * height;
		//this.s += map(pos, 0, 8, -0.1 * MULTIPLIER, 0.1 * MULTIPLIER);

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
		if (this.x1 < -0.1 * width || this.x1 > 1.1 * width || this.y1 < -0.1 * height || this.y1 > 1.1 * height) {
			this.x1 = random(-0.1, 1.1) * width;
			this.y1 = random(-0.1, 1.1) * height;
			this.x2 = this.x1 + randomGaussian(0.01, 0.01) * width;
			this.y2 = this.y1 + randomGaussian(0.01, 0.01) * height;
			this.x3 = this.x1 + randomGaussian(0.01, 0.01) * width;
			this.y3 = this.y1 + randomGaussian(0.01, 0.01) * height;
		}
	}
}

function superCurve(x, y, scl1, scl2, seed) {
	let nx = x,
		ny = y,
		a1 = 233,
		a2 = 233,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy,
		octave = 6;

	dx = oct(nx, ny, scale1, 0, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 4, octave);
	dy = oct(nx, ny, scale2, 3, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3, octave);
	let vn = oct(nx, ny, scale2, 2, octave);
	let u = map(un, -1.05, 1.05, -2, 2, true);
	let v = map(vn, -1.05, 1.05, -2, 2, true);

	/* 	let u = map(noise(x * scl1, y * scl1, seed), 0, 1, -4, 4);
	let v = map(noise(x * scl2, y * scl2, seed), 0, 1, -4, 4); */
	/* 	let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) + sin(x * scl2 * 0.2 + seed); */
	/* 	let ux = map(u, -1.05, 1.05, -15, 25, true);
	let vx = map(v, -1.05, 1.05, -25, 15, true); */

	let p = createVector(u, v);
	return p;
}
