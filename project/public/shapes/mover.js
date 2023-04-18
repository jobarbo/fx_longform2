class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([40, 70, 90, 100]);
		this.initBri = random([30, 80, 100]);
		this.initAlpha = random(0, 60);
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = 3;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.seed = seed;
		this.xRandDivider = 1;
		this.yRandDivider = 1;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.isBordered = isBordered;
	}

	show() {
		//
		//blendMode(SCREEN);

		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		circle(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed);

		/* 		this.xRandDivider = random(0.01, 5.1);
		this.yRandDivider = random(0.01, 5.1);
		this.xRandSkipper = random(-0.1, 0.1);
		this.yRandSkipper = random(-0.1, 0.1); */

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider - this.yRandSkipper;

		//this.s = map(p.x, -4, 4, 5, 1, true);
		//this.a = map(p.x, -4, 4, 0, 30, true);

		if (this.isBordered) {
			if (this.x < (this.xMin - 0.015) * width) {
				this.x = (this.xMax + 0.015) * width;
			}
			if (this.x > (this.xMax + 0.015) * width) {
				this.x = (this.xMin - 0.015) * width;
			}
			if (this.y < (this.yMin - 0.015) * height) {
				this.y = (this.yMax + 0.015) * height;
			}
			if (this.y > (this.yMax + 0.015) * height) {
				this.y = (this.yMin - 0.015) * height;
			}
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
	/*
	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct3(nx, ny, scale1, 0);
	dy = oct3(nx, ny, scale2, 1);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct3(nx, ny, scale1, 1);
	let vn = oct3(nx, ny, scale2, 2); */

	let un = sin(ny * scale1 * 10.0002 + seed) + cos(ny * scale2 * 20.0002 + seed) + sin(ny * scale2 * 5.0002 + seed);
	let vn = sin(nx * scale1 * 10.0002 + seed) - cos(nx * scale2 * 20.0002 + seed) + sin(nx * scale2 * 5.0002 + seed);
	let u = map(un, -3, 3, -4, 4, true);
	let v = map(vn, -3, 3, -4, 4, true);

	let p = createVector(u, v);
	return p;
}
