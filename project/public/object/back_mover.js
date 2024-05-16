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
		this.s = 20;
		this.scl1Init = scl1;
		this.scl2Init = scl2;
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

		this.centerX = width / 2;
		this.centerY = height / 2;
	}

	show() {
		//
		//blendMode(SCREEN);

		fill(this.hue, this.sat, this.bri, this.a);
		stroke(this.hue, this.sat + 20, this.bri - 20, this.a / 2);
		ellipse(this.x, this.y, random(-this.s * 2, this.s * 2), random(-this.s * 2, this.s * 2));
	}

	move() {
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY], 1200 * MULTIPLIER);

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		/* 		this.ang1 = map(distCircle, -500 * MULTIPLIER, 200 * MULTIPLIER, -this.ang1Init * 8, this.ang1Init, true);
		this.ang2 = map(distCircle, -500 * MULTIPLIER, 200 * MULTIPLIER, -this.ang2Init * 8, this.ang2Init, true); */
		this.scl1 = map(distCircle, -200 * MULTIPLIER, 200 * MULTIPLIER, -this.scl1Init, this.scl1Init * 1, true);
		this.scl2 = map(distCircle, -200 * MULTIPLIER, 200 * MULTIPLIER, -this.scl2Init, this.scl2Init * 1, true);

		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed);

		this.xRandDivider = random([0.1, 0.5, 0.5, 1, 1, 1]);
		this.yRandDivider = random([0.1, 0.5, 0.5, 1, 1, 1]);
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		let alpha_dist = dist(this.x, this.y, width / 2, height / 2);

		this.a = map(abs(p.x), 0, 4, this.max_a, this.min_a, true);
		this.max_a = map(distCircle, 0, 2, 30, 0, true);
		this.min_a = map(distCircle, 0, 2, 10, 0, true);

		this.hue = map(abs(p.x), 0, 4, this.initHue - 30, this.initHue + 40, true);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;
		this.sat = map(abs(p.x), 0, 1, 10, 60, true);
		this.bri = map(abs(p.x), 0, 4, 100, 40, true);

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
