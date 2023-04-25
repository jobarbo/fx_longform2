class Mover {
	constructor(
		x,
		y,
		hue,
		scl1,
		scl2,
		scl3,
		ang1,
		ang2,
		angOffset1,
		angOffset2,
		angOffset3,
		xMin,
		xMax,
		yMin,
		yMax,
		isBordered,
		seed
	) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 5, 10, 10, 90, 100, 100]);
		this.initBri = random([0, 5, 10, 10, 20, 90, 100]);
		this.initAlpha = random(10, 60);
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = random([0.5, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 5, 5]);
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.angOffset1 = angOffset1;
		this.angOffset2 = angOffset2;
		this.angOffset3 = angOffset3;
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
		let p = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.scl3,
			this.ang1,
			this.ang2,
			this.angOffset1,
			this.angOffset2,
			this.angOffset3,
			this.seed
		);
		// after 1 second, change the scale

		/* 		this.xRandDivider = random(0.001, 2.1);
		this.yRandDivider = random(0.001, 2.1);
		this.xRandSkipper = random(-0.01, 0.01);
		this.yRandSkipper = random(-0.01, 0.01); */

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

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

function superCurve(x, y, scl1, scl2, scl3, ang1, ang2, angOff1, angOff2, angOff3, seed) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		scale3 = scl3,
		angOffset1 = angOff1,
		angOffset2 = angOff2,
		angOffset3 = angOff3,
		dx,
		dy,
		nseed = seed;

	un =
		sin(nx * (scale1 * angOffset1) + nseed) -
		cos(nx * (scale2 * angOffset2) + nseed) +
		sin(nx * (scale3 * angOffset1) + nseed);
	vn =
		cos(ny * (scale1 * angOffset3) + nseed) -
		sin(ny * (scale2 * angOffset2) + nseed) +
		cos(ny * (scale3 * angOffset3) + nseed);

	/* 	let maxU = map(ny, 0, height, 3, -3, true);
	let maxV = map(nx, 0, width, 3, -3, true);
	let minU = map(ny, 0, height, -3, 3, true);
	let minV = map(nx, 0, width, -3, 3, true); */

	let maxU = map(noise(ny * (scale1 * angOffset1) + nseed), 0, 1, 0, 3, true);
	let maxV = map(noise(nx * (scale2 * angOffset2) + nseed), 0, 1, 0, 3, true);
	let minU = map(noise(ny * (scale2 * angOffset3) + nseed), 0, 1, -3, 0, true);
	let minV = map(noise(nx * (scale3 * angOffset1) + nseed), 0, 1, -3, 0, true);

	let u = map(vn, -0.1, 0.1, minU, maxU, true);
	let v = map(un, -0.1, 0.1, minV, maxV, true);

	let p = createVector(u, v);
	return p;
}
