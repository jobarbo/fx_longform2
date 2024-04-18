class Back_mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random(0, 100);
		this.initBri = random(0, 20);
		this.initAlpha = 0;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = 10;
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
		this.max_a = 30;
		this.min_a = 10;
	}

	show() {
		//
		//blendMode(SCREEN);

		fill(this.hue, this.sat, this.bri, this.a);
		stroke(this.hue, this.sat + 10, this.bri - 10, this.a);
		circle(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed);

		this.xRandDivider = random([0.1, 0.5, 0.5, 1, 1, 1]);
		this.yRandDivider = random([0.1, 0.5, 0.5, 1, 1, 1]);
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		let alpha_dist = dist(this.x, this.y, width / 2, height / 2);

		this.a = map(abs(p.x), 0, 4, this.max_a, this.min_a, true);
		this.max_a = map(alpha_dist, width / 4, width / 2.1, 30, 0, true);
		this.min_a = map(alpha_dist, width / 4, width / 2.1, 10, 0, true);
		this.hue = map(abs(p.x), 0, 4, this.initHue - 10, this.initHue + 10);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		this.sat = map(abs(p.x), 0, 4, 10, 100, true);
		this.bri = map(abs(p.x), 0, 4, 100, 80, true);

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
		dy,
		octaves = 6;

	dx = oct(nx, ny, scale1, 2, octaves);
	dy = oct(nx, ny, scale2, 3, octaves);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 4, octaves);
	dy = oct(nx, ny, scale2, 0, octaves);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 2, octaves);
	dy = oct(nx, ny, scale2, 1, octaves);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3, octaves);
	let vn = oct(nx, ny, scale2, 0, octaves);

	let u = map(un, -0.5, 0.5, -4, 4, true);
	let v = map(vn, -0.5, 0.5, -4, 4, true);

	/* 	let u = sin(ny * scale1 + seed) + cos(ny * scale2 + seed) + sin(ny * scale2 * 0.2 + seed);
	let v = sin(nx * scale1 + seed) + cos(nx * scale2 + seed) - sin(nx * scale2 * 0.2 + seed); */
	let p = createVector(u, v);
	return p;
}
