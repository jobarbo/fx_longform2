class Mover {
	constructor(x, y, hue, scl1, scl2, scl3, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 5, 10, 10, 90, 100, 100]);
		this.initBri = random([0, 5, 10, 10, 20, 90, 100]);
		this.initAlpha = random(0, 60);
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = random([0.5, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 5]);
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
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
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.scl3, this.ang1, this.ang2, this.seed);

		/* 	this.xRandDivider = random(0.1, 5.1);
		this.yRandDivider = random(0.1, 5.1);
		this.xRandSkipper = random(-0.1, 0.1);
		this.yRandSkipper = random(-0.1, 0.1); */

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider - this.yRandSkipper;

		//this.s = map(p.x, -4, 4, 5, 1, true);
		//this.a = map(p.x, -4, 4, 0, 30, true);

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		this.x = this.x < 0 ? width : this.x > width ? 0 : this.x;
		this.y = this.y < 0 ? height : this.y > height ? 0 : this.y;

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

function superCurve(x, y, scl1, scl2, scl3, ang1, ang2, seed) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		scale3 = scl3,
		dx,
		dy,
		nseed = seed;

	//convert frameCount to a value equivalent to seconds
	let mode = 1;
	let t = int(frameCount / 60);
	// every 5 seconds, change the seed

	let un = oct3(nx, ny, scale1, 1);
	let vn = oct3(nx, ny, scale2, 2);
	let angOffset1 = 10.2;
	let angOffset2 = 11.4;
	let angOffset3 = 9.2;
	if (mode == 0) {
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

		un = oct3(nx, ny, scale1, 1);
		vn = oct3(nx, ny, scale2, 2);
	} else {
		un =
			sin(ny * scale1 * angOffset1 + nseed) +
			cos(ny * scale2 * angOffset2 + nseed) +
			sin(ny * scale3 * angOffset1 + nseed);
		vn =
			sin(nx * scale1 * angOffset2 + nseed) -
			cos(nx * scale2 * angOffset1 + nseed) +
			sin(nx * scale3 * angOffset2 + nseed);
	}
	let u = map(un, -3, 3, -4, 4, true);
	let v = map(vn, -3, 3, -4, 4, true);

	let p = createVector(u, v);
	return p;
}
