class Stars {
	constructor(x, y, hue, sat, bri, xMin, xMax, yMin, yMax) {
		this.initX = x;
		this.initY = y;
		this.x = x;
		this.y = y;
		this.s = 0.56 * MULTIPLIER;
		this.hue = hue;
		this.sat = sat;
		this.bri = bri;
		this.a = 100;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.centerX = width / 2;
		this.centerY = height;
		this.xRandSkipperVal = random([0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 0.1, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10]);
		this.yRandSkipperVal = this.xRandSkipperVal;
	}

	show() {
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move(xi, yi) {
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY], 2402 * MULTIPLIER);
		this.x = this.initX;
		this.y = this.initY;

		// Adjust the distribution of random values for star-like shapes
		this.xRandSkipper = randomGaussian(0, this.xRandSkipperVal) * xi + random(-1, 1) * 0.15;
		this.yRandSkipper = randomGaussian(0, this.yRandSkipperVal) * yi + random(-1, 1) * 0.15;

		let skipper = createVector(this.xRandSkipper, this.yRandSkipper);
		this.x += skipper.x * MULTIPLIER;
		this.y += skipper.y * MULTIPLIER;

		this.a = map(distCircle, 0, 200 * MULTIPLIER, 0, 100, true);
	}
}
