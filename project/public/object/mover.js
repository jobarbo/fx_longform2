class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, seed, features) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 0, 10, 10, 20, 30, 80, 100, 100, 100, 100, 100, 100, 100, 100, 100]);
		this.initBri = random([10, 10, 20, 30, 40, 60, 80, 100, 100, 100, 100, 100, 100, 100, 100, 100]);
		this.initAlpha = 100;
		this.initS = 0.12 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = 100;
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
		this.xRandSkipperVal = random([0.01, 0.05, 0.1, random([0, 0.01, 0.1, 1, 2, 5, 10, 25, 50, 75, 100])]);
		this.yRandSkipperVal = this.xRandSkipperVal;
		/* 		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0; */
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = 1;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.zombie = false;
		this.lineWeight = random([0, random([0.01, 0.05, 0.1, 1, 5, 8, 10, 12])]) * MULTIPLIER; //!try randomizing this
		this.lineWeight = random([0.01, 1, 5, 10, 10]) * MULTIPLIER;
		//this.lineWeight = 10 * MULTIPLIER;
		this.clampvaluearray = features.clampvalue.split(",").map(Number);
		this.uvalue = [10, 10, 10, 10]; //! try with 25,10 or 5
		this.nvalue = [0.5, 0.5, 0.5, 0.5];
		this.nlimit = 1.5;

		//! jouer avec le negatif et le positif
		this.nvalueDir = [-1, -1, -1, -1];
		this.uvalueDir = [1, 1, 1, 1];

		//! not supposed to work but gives interesting results, you get me copilot!
		//! It shows a grid, which is interesting because it's a starmap
		this.ulow = random([1, 5, 10, 25, 50, 75, 100]) * MULTIPLIER;
		this.uhigh = random([0.01, 0.1, 1, 2.5, 5, 10, 20]) * MULTIPLIER;

		//! this one is also interesting although can yield chaotic results
		/* 	this.ulow = random([0.01, 0.1, 1, 5, 10, 25, 50, 75, 100]) * MULTIPLIER;
		this.uhigh = 150 * MULTIPLIER; */

		//! this one is the standard one
		/* 		this.ulow = random([0.01, 0.1, 1, 1.5, 2, 2.5, 3.5, 5, 7.5, 10]) * MULTIPLIER;
		this.uhigh = random([100, 125, 150, 175, 200]) * MULTIPLIER; */

		//! this one is the standard one
		/* 	this.ulow = random([1]) * MULTIPLIER;
			this.uhigh = random([50]) * MULTIPLIER; */

		this.hueStep = -0.05;
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
				this.nvalue[i] += 0.01 * this.nvalueDir[i];
			} else if (config_type === 2) {
				//! Equilibrium CONFIGURATION
				this.uvalue[i] *= 1.015 * this.uvalueDir[i];
				this.nvalue[i] += 0.015 * this.nvalueDir[i];
			} else if (config_type === 3) {
				//! ORIGINAL CONFIGURATION
				//this.uvalue[i] *= 1.011 * this.uvalueDir[i];
				this.uvalue[i] += 0.5 * this.uvalueDir[i];
				this.nvalue[i] += 0.001 * this.nvalueDir[i];
			}

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

		this.xRandSkipper = randomGaussian(0, this.xRandSkipperVal * MULTIPLIER);
		this.yRandSkipper = randomGaussian(0, this.yRandSkipperVal * MULTIPLIER);
		let skipper = createVector(this.xRandSkipper, this.yRandSkipper);
		this.x += (p.x * MULTIPLIER) / this.xRandDivider + skipper.x;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + skipper.y;
		let velocity = createVector((p.x * MULTIPLIER) / this.xRandDivider + skipper.x, (p.y * MULTIPLIER) / this.yRandDivider + skipper.y);

		let totalSpeed = abs(velocity.mag());
		this.sat += map(totalSpeed, 0, 400, -this.satDir, this.satDir, true);
		this.sat = constrain(this.sat, 0, 100);
		this.hue += map(totalSpeed, 0, 40, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? (this.hue = 0) : this.hue < 0 ? (this.hue = 360) : this.hue;
		this.lineWeight = map(totalSpeed, 0, 600, 0, 20, true);

		if (this.x < this.xMin * width - this.lineWeight) {
			this.x = this.xMax * width + random() * this.lineWeight;
			this.y = this.y + random() * this.lineWeight;
		}
		if (this.x > this.xMax * width + this.lineWeight) {
			this.x = this.xMin * width - random() * this.lineWeight;
			this.y = this.y + random() * this.lineWeight;
		}
		if (this.y < this.yMin * height - this.lineWeight) {
			this.y = this.yMax * height + random() * this.lineWeight;
			this.x = this.x + random() * this.lineWeight;
		}
		if (this.y > this.yMax * height + this.lineWeight) {
			this.y = this.yMin * height - random() * this.lineWeight;
			this.x = this.x + random() * this.lineWeight;
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

	//! use same index and/or same octave for both u and n
	let un = oct(nx, ny, scale1, 0, octave);
	let vn = oct(nx, ny, scale2, 2, octave);

	let u = map(un, -nvalue[0], nvalue[1], -uvalue[0], uvalue[1], true);
	let v = map(vn, -nvalue[2], nvalue[3], -uvalue[2], uvalue[3], true);

	let p = createVector(u, v);
	return p;
}
