class Mover {
	constructor(x, y, hue, scl1, scl2) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.hue = hue;
		this.sat = 50;
		this.bri = 70;
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.s = 3 * MULTIPLIER;
		this.a = 10;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.xRandDivider = random(0.0001, 2.01) * MULTIPLIER;
		this.yRandDivider = random(0.0001, 2.01) * MULTIPLIER;
		this.xRandOffset = random(-3.1, 0.1) * MULTIPLIER;
		this.yRandOffset = random(-0.1, 3.1) * MULTIPLIER;
		this.minSat = random(1, 20);
		this.minBri = random(1, 20);
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2);
		this.hue = map(p.x, -4, 4, this.hue - 3, this.hue + 3, true);
		this.sat = map(p.x, -4, 4, this.sat + 3, this.sat - 3, true);
		this.bri = map(p.x, -4, 4, this.bri + 3, this.bri - 3, true);
		this.x += (p.x / random(0.0001, 2.01) + random(-3.1, 0.1)) * MULTIPLIER;
		this.y += (p.y / random(0.0001, 2.01) + random(-0.1, 3.1)) * MULTIPLIER;
		this.s += map(p.x, -4, 4, -0.1 * MULTIPLIER, 0.1 * MULTIPLIER);

		if (this.hue < 0) {
			this.hue = 360;
		}
		if (this.hue > 360) {
			this.hue = 0;
		}

		if (this.sat < 40) {
			this.sat = random(40, 60);
		} else if (this.sat > 100) {
			this.sat = random(80, 100);
		}
		if (this.bri < 0) {
			this.bri = random(10, 30);
		} else if (this.bri > 50) {
			this.bri = random(30, 40);
		}
		if (this.s < 1 * MULTIPLIER) {
			this.s = 1 * MULTIPLIER;
		}
		if (this.s > 5 * MULTIPLIER) {
			this.s = 5 * MULTIPLIER;
		}
	}
}

function superCurve(x, y, scl1, scl2) {
	let nx = x,
		ny = y,
		a1 = 1,
		a2 = 1,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy,
		octave = 6;

	dx = oct(nx, ny, scale1, 0, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 3, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3, octave);
	let vn = oct(nx, ny, scale2, 2, octave);
	let u = map(un, -0.5, 0.5, -4, 4, true);
	let v = map(vn, -0.5, 0.5, -4, 4, true);

	/* 	let u = map(noise(x * scl1, y * scl1, seed), 0, 1, -4, 4);
	let v = map(noise(x * scl2, y * scl2, seed), 0, 1, -4, 4); */
	//let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	//let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) - sin(x * scl2 * 0.2 + seed);
	let p = createVector(u, v);
	return p;
}
