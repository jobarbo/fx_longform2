class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random(0, 100);
		this.initBri = random(0, 20);
		this.initAlpha = random(0, 20);
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = 1;
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
		blendMode(SCREEN);

		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		circle(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed);

		this.xRandDivider = random(0.000001, 2.1);
		this.yRandDivider = random(0.000001, 2.1);
		this.xRandSkipper = random(-1.1, 1.1);
		this.yRandSkipper = random(-1.1, 1.1);

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		this.s = map(p.x, -4, 4, 5, 1, true);
		this.a = map(p.x, -4, 4, 10, 30, true);
		this.hue += map(p.x, -4, 4, -20, 20);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		this.sat = map(p.x, -4, 4, 100, 70, true);
		this.bri = map(p.x, -4, 4, 60, 100, true);

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

	dx = oct(nx, ny, scale1, 6, 6);
	dy = oct(nx, ny, scale2, 1, 1);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 4, 6);
	dy = oct(nx, ny, scale2, 3, 6);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 2, 6);
	dy = oct(nx, ny, scale2, 7, 6);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 0, 6);
	let vn = oct(nx, ny, scale2, 2, 6);

	let u = map(un, -0.5, 0.5, -4, 4, true);
	let v = map(vn, -0.5, 0.5, -4, 4, true);
	let p = createVector(u, v);
	return p;
}
