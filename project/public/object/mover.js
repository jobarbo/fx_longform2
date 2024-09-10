class Mover {
	constructor(x, y, xi, yi, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 0, 10, 20, 20, 40, 50, 60, 70, 80, 80, 90, 90, 100]);
		this.initBri = random([10, 10, 20, 20, 40, 50, 60, 70, 80, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.4;
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
		this.xi = xi;
		this.yi = yi;
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
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed, this.xi, this.yi);
		this.xRandDivider = random(2.001, 2.1);
		this.yRandDivider = random(1.001, 1.1);
		this.xRandSkipper = random(-1.1, 1.1);
		this.yRandSkipper = random(-1.1, 1.1);

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		//shortand for if this.x is less than 0, set this.x to width and vice versa

		let pxy = p.x - p.y;

		let mapVal = map(pxy, -4, 4, -1, 1, true);

		this.hue = map(mapVal, -1, 1, this.initHue - 20, this.initHue + 20, true);
		this.sat = map(mapVal, -1, 1, this.initSat + 50, this.initSat - 50, true);
		this.bri = map(mapVal, -1, 1, this.initBri - 50, this.initBri + 50, true);
		// shorthand for if this.hue is less than 0, set this.hue to 360 and vice versa
		this.hue = this.hue < 0 ? this.hue + 360 : this.hue > 360 ? this.hue - 360 : this.hue;

		//this.a = map(p.x, -4, 4, this.initAlpha - 5, this.initAlpha + 5, true);
		this.s = map(p.x, -4, 4, this.initS + 0.8, this.initS, true);

		//this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		/* 		this.sat = map(p.x, -4, 4, 0, 100, true);
		this.bri = map(p.x, -4, 4, 0, 40, true); */

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

function superCurve(x, y, scl1, scl2, ang1, ang2, seed, xi, yi) {
	let nx = x + xi,
		ny = y + yi,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy;

	dx = oct(nx, ny, scale1, 0, 6);
	dy = oct(nx, ny, scale2, 2, 6);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, 6);
	dy = oct(nx, ny, scale2, 3, 6);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, 6);
	dy = oct(nx, ny, scale2, 1, 6);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3, 6);
	let vn = oct(nx, ny, scale2, 2, 6);

	let u = map(un, -0.5, 0.5, -4, 4, true);
	let v = map(vn, -0.5, 0.5, -4, 4, true);

	let p = createVector(u, v);
	return p;
}
