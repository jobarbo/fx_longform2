class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, seed) {
		this.x = x;
		this.y = y;
		this.hue = hue;
		this.sat = random(10, 100);
		this.bri = random(70, 100);
		this.a = random(0, 20);
		this.s = 3;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.seed = seed;
		this.angoffset = 0;
		this.scaleoffset = 0;
		this.xoffset = 0;
	}

	show() {
		//
		//blendMode(SCREEN);
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(
			this.x,
			this.y,
			this.scl1 + this.scaleoffset,
			this.scl2 + this.scaleoffset,
			int(this.ang1 + this.angoffset),
			int(this.ang2 + this.angoffset),
			this.seed
		);

		/* 		this.hue = map(p.x, -4, 4, this.hue - 3, this.hue + 3, true);
		this.sat = map(p.x, -4, 4, this.sat + 2, this.sat - 2, true);
		this.bri = map(p.x, -4, 4, this.bri - 2, this.bri + 2, true); */

		this.x += p.x / random(0.0001, 1.01) + random(-0.1 - this.xoffset, 0.1 + this.xoffset);
		this.y += p.y / random(0.0001, 1.01) + random(0.1, 4.1);
		this.s += map(p.x, -4, 4, 0.000001, 0.01);
		this.angoffset += 1;
		this.scaleoffset += 0.0000002;
		this.xoffset += 0.0000002;

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
		if (this.s > 30) {
			this.s = 10;
		}
	}
}

function superCurve(x, y, scl1, scl2, seed) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(ny, nx, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(ny, nx, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;
	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(ny, nx, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct3(nx, ny, scale1, 0);
	let vn = oct3(ny, nx, scale2, 1);

	let u = map(un, -1, 1, -4, 4);
	let v = map(vn, -1, 1, 0, 4);
	//let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	//let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) - sin(x * scl2 * 0.2 + seed);
	let p = createVector(u, v);
	return p;
}
