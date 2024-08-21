class Mover {
	constructor(x, y, xi, yi, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.xi = xi;
		this.yi = yi;
		this.initHue = hue;
		this.initSat = random([0, 0, 10, 20, 20, 40, 50, 60, 70, 80, 80, 90, 90, 100]);
		this.initBri = random([10, 10, 20, 20, 40, 50, 60, 70, 80, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.3;
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

		/* 		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s); */
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed, this.xi, this.yi);

		this.xRandDivider = random(0.1, 0.3);
		this.yRandDivider = random(0.1, 0.3);
		this.xRandSkipper = random(-0.5, 0.5);
		this.yRandSkipper = random(-0.5, 0.5);
		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		/* 		this.x = this.x < 0 ? width : this.x > width ? 0 : this.x;
		this.y = this.y < 0 ? height : this.y > height ? 0 : this.y; */

		let pxy = p.x - p.y;

		let mapVal = mapValue(pxy, -4, 4, -1, 1, true);

		this.hue = mapValue(mapVal, -1, 1, this.initHue - 40, this.initHue + 40, true);
		this.sat = map(mapVal, -1, 1, this.initSat + 20, this.initSat - 20, true);
		this.bri = mapValue(mapVal, -1, 1, this.initBri - 20, this.initBri + 20, true);
		// shorthand for if this.hue is less than 0, set this.hue to 360 and vice versa
		this.hue = this.hue < 0 ? this.hue + 360 : this.hue > 360 ? this.hue - 360 : this.hue;

		//this.a = map(p.x, -4, 4, this.initAlpha - 5, this.initAlpha + 5, true);
		this.s += map(mapVal, -1.4, 1.4, -0.001, 0.001, true);
		this.s = constrain(this.s, 0.1, 1);

		//this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		/* 		this.sat = mapValue(p.x, -4, 4, 0, 100, true);
		this.bri = mapValue(p.x, -4, 4, 0, 40, true); */

		if (this.isBordered) {
			if (this.x < this.xMin * width) {
				this.x = this.xMax * width;
			}
			if (this.x > this.xMax * width) {
				this.x = this.xMin * width;
			}
			if (this.y < this.yMin * height) {
				this.y = this.yMax * height;
			}
			if (this.y > this.yMax * height) {
				this.y = this.yMin * height;
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

	dx = oct(nx, ny, scale1, 0, 3);
	dy = oct(nx, ny, scale2, 2, 3);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, 3);
	dy = oct(nx, ny, scale2, 3, 3);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, 3);
	dy = oct(nx, ny, scale2, 5, 3);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3, 3);
	let vn = oct(nx, ny, scale2, 2, 3);

	let u = mapValue(un, -0.5, 0.5, -4, 4, true);
	let v = mapValue(vn, -0.5, 0.5, -4, 4, true);

	let p = createVector(u, v);
	return p;
}
