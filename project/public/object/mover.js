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
		this.max_a = 30;
		this.min_a = 10;
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

		this.xRandDivider = random([0.1, 0.5, 0.5, 1, 1, 1]);
		this.yRandDivider = random([0.1, 0.5, 0.5, 1, 1, 1]);
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		let alpha_dist = dist(this.x, this.y, width / 2, height / 2);

		this.s = map(abs(p.x), 0, 4, 1.5, 1, true);
		this.a = map(abs(p.x), 0, 4, this.max_a, this.min_a, true);
		this.max_a = map(alpha_dist, width / 4, width / 2.1, 30, 0, true);
		this.min_a = map(alpha_dist, width / 4, width / 2.1, 10, 0, true);
		this.hue = map(p.x, -4, 4, this.initHue - 60, this.initHue + 60);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		this.sat = map(abs(p.x), 0, 4, 0, 0, true);
		this.bri = map(abs(p.x), 0, 4, 0, 50, true);

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
