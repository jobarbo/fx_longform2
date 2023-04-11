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

		this.x += p.x / random(0.0001, 2.01) + random(-1.1, 0.1);
		this.y += p.y / random(0.0001, 2.01) + random(-0.1, 1.1);
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
		if (this.s < 1) {
			this.s = 1;
		}
		if (this.s > 10) {
			this.s = 10;
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

	dx = n3(nx, ny, scale1, 0);
	dy = n3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = n3(nx, ny, scale1, 0);
	dy = n3(nx, ny, scale2, 1);
	nx += dx * a2;
	ny += dy * a1;
	dx = n3(nx, ny, scale1, 0);
	dy = n3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	let un = n3(nx, ny, scale1, 2);
	let vn = n3(nx, ny, scale2, 5);

	let u = map(un, -0.5, 0.5, -4, 4, true);
	let v = map(vn, -0.5, 0.5, -4, 4, true);
	//let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	//let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) - sin(x * scl2 * 0.2 + seed);
	let p = createVector(u, v);
	return p;
}
