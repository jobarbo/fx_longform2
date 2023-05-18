class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, seed) {
		this.x = x;
		this.y = y;
		this.initY = y;
		this.hue = hue;
		this.sat = random([0, 10, 60, 80, 100]);
		this.bri = random([30, 40, 50, 70, 80, 90, 100]);
		this.a = 0;
		this.fa = 100;
		this.s = 0.5;
		this.scl1init = scl1;
		this.scl2init = scl2;
		this.scl1 = map(this.y, this.initY, height, this.scl1init, this.scl1init - 0.05, true);
		this.scl2 = map(this.y, this.initY, height, this.scl2init, this.scl2init - 0.05, true);
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.xRandDivider = 1;
		this.yRandDivider = 1;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
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
			this.initY,
			this.scl1 + this.scaleoffset,
			this.scl2 + this.scaleoffset,
			int(this.ang1 + this.angoffset),
			int(this.ang2 + this.angoffset),
			this.seed
		);

		/* 		this.hue = map(p.x, -4, 4, this.hue - 3, this.hue + 3, true);
		this.sat = map(p.x, -4, 4, this.sat + 2, this.sat - 2, true);
		this.bri = map(p.x, -4, 4, this.bri - 2, this.bri + 2, true); */

		this.xRandDivider = random(0.01, 3.1);
		this.yRandDivider = random(0.01, 3.1);
		this.xRandSkipper = random(-0.1, 0.1);
		this.yRandSkipper = random(-0.1, 0.1);

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		this.a = map(this.y, this.initY, this.initY + 5, 0, this.fa, true);
		this.s = map(p.y, -4, 4, 0.4, 0.6, true);

		this.scl1 = map(this.y, this.initY, height, this.scl1init, this.scl1init - 0.0025, true);
		this.scl2 = map(this.y, this.initY, height, this.scl2init, this.scl2init - 0.0025, true);

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
	}
}

function superCurve(x, y, initY, scl1, scl2, seed) {
	let iy = initY,
		currentY = y,
		nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = map(currentY, iy, height, scl1, scl1 - 0.001),
		scale2 = map(currentY, iy, height, scl2, scl2 - 0.001),
		dx,
		dy;

	dx = oct6(nx, ny, scale1, 0);
	dy = oct6(ny, nx, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct6(nx, ny, scale1, 0);
	dy = oct6(ny, nx, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;
	dx = oct6(nx, ny, scale1, 0);
	dy = oct6(ny, nx, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct6(nx, ny, scale1, 0);
	let vn = oct6(ny, nx, scale2, 1);

	let minV = map(currentY, iy, height + 300, 4, -1);
	let u = map(un, -0.5, 0.5, -4, 4);
	let v = map(vn, -0.5, 0.5, minV, 4);
	//let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	//let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) - sin(x * scl2 * 0.2 + seed);
	let p = createVector(u, v);
	return p;
}
