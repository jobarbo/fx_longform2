class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed, octave) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 10, 20, 20, 30, 40, 60, 80, 100]);
		this.initBri = random([40, 60, 60, 70, 70, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.65;
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
		this.oct = octave;
	}

	show() {
		//
		//blendMode(SCREEN);

		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed, this.oct);

		/* 		this.xRandDivider = random([0.1, 30, 50, 100]);
		this.yRandDivider = random([0.1, 30, 50, 100]); */
		this.xRandDivider = 0.1;
		this.yRandDivider = 0.1;
		/* this.xRandDivider = random(0.01, 12);
		this.yRandDivider = random(0.01, 12); */
		this.xRandSkipper = random(-1.1, 1.1);
		this.yRandSkipper = random(-1.1, 1.1);

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		this.x =
			this.x <= width / 2 - width / 3
				? width / 2 + width / 3
				: this.x >= width / 2 + width / 3
				? width / 2 - width / 3
				: this.x;
		this.y =
			this.y <= height / 2 - height / 2.5
				? height / 2 + height / 2.5
				: this.y >= height / 2 + height / 2.5
				? height / 2 - height / 2.5
				: this.y;

		//let pxy = p.x - p.y;

		//this.a = mapValue(p.x, -4, 4, this.initAlpha - 5, this.initAlpha + 5, true);
		//this.s = mapValue(p.x, -24, 24, this.initS + 10, this.initS - 10, true);
		this.hue += mapValue(p.x, -20, 20, -20.1, 20.1, true);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		//this.sat = mapValue(p.x, -2, 2, 0, 20, true);
		//this.bri = mapValue(p.x, -2, 2, 0, 40, true);

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

function superCurve(x, y, scl1, scl2, ang1, ang2, seed, octaves) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy;

	dx = oct(nx, ny, scale1, int(random(octaves.length - 1)), octaves);
	dy = oct(nx, ny, scale2, int(random(octaves.length - 1)), octaves);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, int(random(octaves.length - 1)), octaves);
	dy = oct(nx, ny, scale2, int(random(octaves.length - 1)), octaves);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, int(random(octaves.length - 1)), octaves);
	dy = oct(nx, ny, scale2, int(random(octaves.length - 1)), octaves);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, int(random(octaves.length - 1)), octaves);
	let vn = oct(nx, ny, scale2, int(random(octaves.length - 1)), octaves);

	//! modify the 4th and 5th parameters for interesting results
	let u = mapValue(un, -0.000025, 0.15, -5, 5, true);
	let v = mapValue(vn, -0.15, 0.000025, -5, 5, true);

	let p = createVector(u, v);
	return p;
}
