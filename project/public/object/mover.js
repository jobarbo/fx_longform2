class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, seed, features) {
		this.x = x;
		this.y = y;
		this.initHue = 30;
		this.initSat = random([0, 0, 10, 10, 20, 30, 80, 100, 100, 100, 100, 100, 100, 100, 100, 100]);
		this.initBri = random([0, 10, 20, 30, 40, 50, 60, 70, 70, 80, 80, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.12 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.sat = 0;
		this.bri = this.initBri;
		this.a = this.initAlpha;
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
		this.xRandSkipperVal = random([0.01, 0.05, 0.1, random([0, 0.01, 0.1, 1, 2, 5, 10, 25, 50, 300])]);
		this.yRandSkipperVal = this.xRandSkipperVal;
		/* 		this.xRandSkipperVal = 0.01;
		this.yRandSkipperVal = 0.01; */
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = 1;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.zombie = false;
		//this.lineWeight = random([0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]) * MULTIPLIER; //!try randomizing this
		this.lineWeight = 10 * MULTIPLIER;
		this.clampvaluearray = features.clampvalue.split(",").map(Number);
		this.uvalue = [10, 10, 10, 10]; //! try with 10 or 5
		this.nvalue = [0.00005, 0.00005, 0.00005, 0.00005];
		this.nlimit = 1;

		//! jouer avec le negatif et le positif
		this.nvalueDir = [1, 1, 1, 1];
		this.uvalueDir = [1, 1, 1, 1];

		this.ulow = 0.01;
		this.uhigh = 50;

		this.hueStep = 0.05;
		this.satDir = random([2]);
	}

	show() {
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.seed, this.oct, this.nvalue, this.uvalue);

		for (let i = 0; i < this.nvalue.length; i++) {
			if (config_type === 1) {
				//! STARMAP CONFIGURATION
				this.uvalue[i] *= 1.013 * this.uvalueDir[i];
				this.nvalue[i] += 0.005 * this.nvalueDir[i];
			} else if (config_type === 2) {
				//! Equilibrium CONFIGURATION
				this.uvalue[i] *= 1.015 * this.uvalueDir[i];
				this.nvalue[i] += 0.015 * this.nvalueDir[i];
			} else if (config_type === 3) {
				//! ORIGINAL CONFIGURATION
				//this.uvalue[i] *= 1.011;
				this.uvalue[i] += 0.75 * this.uvalueDir[i];
				//this.nvalue[i] += 0.0015 * this.nvalueDir[i];
			}

			//! YoYo with value (not sure);

			if (this.nvalue[i] <= -this.nlimit || this.nvalue[i] >= this.nlimit) {
				this.nvalue[i] = this.nvalue[i] > this.nlimit ? this.nlimit : this.nvalue[i] < -this.nlimit ? -this.nlimit : this.nvalue[i];
				this.nvalueDir[i] *= -1;
				//this.lineWeight += 0.1 * MULTIPLIER;
			}

			if (this.uvalue[i] <= this.ulow || this.uvalue[i] >= this.uhigh) {
				this.uvalue[i] = this.uvalue[i] > this.uhigh ? this.ulow : this.uvalue[i] < this.ulow ? this.uhigh : this.uvalue[i];
				//this.uvalueDir[i] *= -1;
			}
		}

		this.xRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);
		this.yRandSkipper = random(-this.yRandSkipperVal * MULTIPLIER, this.yRandSkipperVal * MULTIPLIER);

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

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

		let pxy = abs(p.x) + abs(p.y);
		this.sat += map(pxy, -this.uvalue[0] * 2, this.uvalue[1] * 2, -this.satDir, this.satDir, true);
		if (this.sat > 100 || this.sat < 0) this.satDir *= -1;

		this.hue += map(pxy, -this.uvalue[0] * 2, this.uvalue[1] * 2, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? (this.hue = 0) : this.hue < 0 ? (this.hue = 360) : this.hue;
	}
}

function superCurve(x, y, scl1, scl2, ang1, ang2, seed, octave, nvalue, uvalue) {
	let nx = x + 150,
		ny = y - 0,
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

	//! use same index and/or same octave for both u and n
	let un = oct(nx, ny, scale1, 0, octave);
	let vn = oct(nx, ny, scale2, 2, octave);

	let u = map(un, -nvalue[0], nvalue[1], -uvalue[0], uvalue[1], true);
	let v = map(vn, -nvalue[2], nvalue[3], -uvalue[2], uvalue[3], true);

	let p = createVector(u, v);
	return p;
}
