class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.hue = hue;
		this.sat = 50;
		this.bri = 10;
		this.s = 3;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.seed = seed;
		this.posXRand = 1;
		this.posYRand = 1;
	}

	show() {
		//
		//blendMode(SCREEN);
		fill(this.hue, this.sat, this.bri, 10);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed);

		//this.hue = map(p.x, -4, 4, this.hue - 3, this.hue + 3, true);
		//this.sat = map(p.x, -4, 4, this.sat + 2, this.sat - 2, true);
		//this.bri = map(p.x, -4, 4, this.bri - 2, this.bri + 2, true);
		this.posXRand = random(1.0001, 2.01) + random(-0.1, 0.1);
		this.posYRand = random(1.0001, 2.01) + random(-0.1, 0.1);
		this.x += p.x / this.posXRand;
		this.y += p.y / this.posYRand;

		this.s += map(p.x, -4, 4, -0.1, 0.1);

		/* 		if (this.hue < 0) {
			this.hue = 360;
		} else if (this.hue > 360) {
			this.hue = 0;
		}
		if (this.sat < 0) {
			60;
		} else if (this.sat > 60) {
			this.sat = 0;
		}
		if (this.bri > 30) {
			this.bri = 30;
		} else if (this.bri < 0) {
			this.bri = 0;
		} */

		// ! if feature_contain is true, the mover will be contained in the canvas
		if (this.x < 0.1 * width) {
			this.x = 0.9 * width;
		}
		if (this.x > 0.9 * width) {
			this.x = 0.1 * width;
		}
		if (this.y < 0.1 * height) {
			this.y = 0.9 * height;
		}
		if (this.y > 0.9 * height) {
			this.y = 0.1 * height;
		}

		if (this.s < 1) {
			this.s = 4;
		}
		if (this.s > 4) {
			this.s = 1;
		}
	}
}

function superCurve(x, y, scl1, scl2, ang1, ang2, seed) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(nx, ny, scale2, 1);
	nx += dx * a2;
	ny += dy * a1;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct3(nx, ny, scale1, 1);
	let vn = oct3(nx, ny, scale2, 2);

	let u = map(un, -0.5, 0.5, -4, 4, true);
	let v = map(vn, -0.5, 0.5, -4, 4, true);
	let p = createVector(u, v);
	return p;
}
