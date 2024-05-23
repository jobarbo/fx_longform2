class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, seed, features) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 10, 20, 20, 20, 30, 40, 40, 60, 80, 80, 90]);
		this.initBri = random([10, 20, 50, 60, 70, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.22 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = random([0, 0, 0, 10, 10, 10, 80, 100, 100, 100, 100, 100, 100]);
		this.bri = 0;
		this.a = this.initAlpha;
		this.hueStep = 0.45;
		this.satDir = 2;
		this.s = this.initS;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.seed = seed;
		this.xRandDivider = xRandDivider;
		this.yRandDivider = yRandDivider;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperVal = random([0.01, random([0.1, 1, 2, 5, 10, 25, 50, 100])]);
		this.yRandSkipperVal = this.xRandSkipperVal;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = 3;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.zombie = false;
		this.lineWeight = random([0.1, 1, 2, 5, 10, 25, 50, 100]) * MULTIPLIER; //!try randomizing this
		this.clampvaluearray = features.clampvalue.split(",").map(Number);
		this.uvalue = [5, 5, 45, 45];
		this.nvalue = [0.000001, 0.000001, 0.000001, 0.000001];
		this.nlimit = [0.00005, 0.00005, 0.00005, 0.00005];
		this.nvalueDir = [-1, -1, -1, -1];
		this.uvalueDir = [1, 1, 1, 1];
		this.ulow = 5;
		this.uhigh = 60;

		this.skipperMax = 10;

		this.shutterLow = 2;
		this.shutterHigh = 20;
		this.lineWeightMax = this.shutterHigh;

		this.apertureLow = 0.1;
		this.apertureHigh = 10;
	}

	show() {
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed, this.oct, this.nvalue, this.uvalue);

		this.lineWeightMax = map(frameCount, 50, maxFrames - 200, this.shutterHigh, this.shutterLow, true);
		this.skipperMax = map(frameCount, 50, maxFrames - 200, this.apertureHigh, this.apertureLow, true);
		this.bri = map(frameCount, 50, maxFrames - 50, 100, 40, true);
		this.sat = map(frameCount, 50, maxFrames - 50, 20, 70, true);
		this.xRandSkipperVal = random([0.1, random(0.00001, this.skipperMax)]);
		this.yRandSkipperVal = random([0.1, random(0.00001, this.skipperMax)]);
		for (let i = 0; i < this.nvalue.length; i++) {
			if (config_type === 1) {
				//! STARMAP CONFIGURATION
				this.uvalue[i] *= 1.013 * this.uvalueDir[i];
				this.nvalue[i] += 0.000001 * this.nvalueDir[i];
			} else if (config_type === 2) {
				//! Equilibrium CONFIGURATION
				this.uvalue[i] *= 1.015 * this.uvalueDir[i];
				this.nvalue[i] += 0.0000015 * this.nvalueDir[i];
			} else if (config_type === 3) {
				//! ORIGINAL CONFIGURATION
				//this.uvalue[i] += 0.5;
				this.uvalue[i] *= 1.011 * this.uvalueDir[i];
				this.nvalue[i] += 0.0000005 * this.nvalueDir[i];
			}

			//! YoYo with value (not sure);

			if (this.nvalue[i] < -this.nlimit[i] || this.nvalue[i] > this.nlimit[i]) {
				this.nvalue[i] = this.nvalue[i] > this.nlimit[i] ? this.nlimit[i] : this.nvalue[i] < -this.nlimit[i] ? -this.nlimit[i] : this.nvalue[i];
				this.nvalueDir[i] *= -1;
			}

			if (this.uvalue[i] < this.ulow || this.uvalue[i] > this.uhigh) {
				this.uvalue[i] = this.uvalue[i] > this.uhigh ? this.ulow : this.uvalue[i] < this.ulow ? this.uhigh : this.uvalue[i];
			}
		}

		this.xRandSkipper = randomGaussian(0, this.xRandSkipperVal * MULTIPLIER);
		this.yRandSkipper = randomGaussian(0, this.yRandSkipperVal * MULTIPLIER);

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		let pxy = abs(p.x) + abs(p.y);
		let velocity = createVector((p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper, (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper);

		let totalSpeed = abs(velocity.mag());
		//this.sat += map(totalSpeed, 0, 600 * MULTIPLIER, -this.satDir, this.satDir, true);
		//this.sat = this.sat > 95 ? (this.sat = 0) : this.sat < 0 ? (this.sat = 95) : this.sat;
		this.hue += map(totalSpeed, 0, 1200 * MULTIPLIER, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? (this.hue = 0) : this.hue < 0 ? (this.hue = 360) : this.hue;
		this.lineWeight = map(totalSpeed, 0, 600 * MULTIPLIER, 0, this.lineWeightMax, true) * MULTIPLIER;

		if (this.x < this.xMin * width - this.lineWeight) {
			this.x = this.xMax * width + fxrand() * this.lineWeight;
			this.y = this.y + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.x > this.xMax * width + this.lineWeight) {
			this.x = this.xMin * width - fxrand() * this.lineWeight;
			this.y = this.y + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.y < this.yMin * height - this.lineWeight) {
			this.y = this.yMax * height + fxrand() * this.lineWeight;
			this.x = this.x + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.y > this.yMax * height + this.lineWeight) {
			this.y = this.yMin * height - fxrand() * this.lineWeight;
			this.x = this.x + fxrand() * this.lineWeight;
			//this.a = 100;
		}
	}
}

function superCurve(x, y, scl1, scl2, ang1, ang2, seed, octave, nvalue, uvalue) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy;

	dx = oct(nx, ny, scale1, 0, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 3, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 0, octave);
	let vn = oct(nx, ny, scale2, 1, octave);

	let u = map(un, -nvalue[0], nvalue[1], -uvalue[0], uvalue[1], true);
	let v = map(vn, -nvalue[2], nvalue[3], -uvalue[2], uvalue[3], true);

	let p = createVector(u, v);
	return p;
}
