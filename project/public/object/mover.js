class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 20, 40, 60, 80, 100]);
		this.initBri = random([0, 10, 10, 20, 20, 40, 60, 70, 90]);
		this.initAlpha = 50;
		this.initS = 1;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = this.initS;
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
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed);

		/* 		this.xRandDivider = random([0.1, 30, 50, 100]);
		this.yRandDivider = random([0.1, 30, 50, 100]); */
		this.xRandDivider = 0.1;
		this.yRandDivider = 0.1;
		/* this.xRandDivider = random(0.01, 12);
		this.yRandDivider = random(0.01, 12); */
		this.xRandSkipper = random(-0.1, 0.1);
		this.yRandSkipper = random(-0.1, 0.1);

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		this.x = this.x <= 0 ? width - 2 : this.x >= width ? 0 : this.x;
		this.y = this.y <= 0 ? height - 2 : this.y >= height ? 0 : this.y;

		//let pxy = p.x - p.y;

		//this.a = map(p.x, -4, 4, this.initAlpha - 5, this.initAlpha + 5, true);
		//this.s = map(p.x, -24, 24, this.initS + 10, this.initS - 10, true);
		this.hue += map(p.x, -20, 20, -10, 10, true);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		//this.sat = map(p.x, -2, 2, 0, 20, true);
		//this.bri = map(p.x, -2, 2, 0, 40, true);

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

	dx = oct(nx, ny, scale1, 0);
	dy = oct(nx, ny, scale2, 2);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1);
	dy = oct(nx, ny, scale2, 3);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1);
	dy = oct(nx, ny, scale2, 2);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3);
	let vn = oct(nx, ny, scale2, 2);

	let u = map(un, -0.015, 0.015, -5, 5, true);
	let v = map(vn, -0.0015, 0.0015, -15, 15, true);

	let p = createVector(u, v);
	return p;
}
