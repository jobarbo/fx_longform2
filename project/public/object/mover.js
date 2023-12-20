class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, seed, features) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 10, 20, 20, 20, 30, 40, 40, 60, 80, 80, 90]);
		this.initBri =
			features.theme === 'bright' && features.colormode !== 'monochrome'
				? random([0, 10, 20, 20, 40, 40, 60, 70, 80, 90, 100])
				: features.theme === 'bright' && features.colormode === 'monochrome'
				? random([0, 0, 10, 20, 20, 30, 40, 60, 80])
				: random([40, 60, 70, 70, 80, 80, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.2 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = features.colormode === 'monochrome' ? 0 : this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep =
			features.colormode === 'monochrome' || features.colormode === 'fixed'
				? 25
				: features.colormode === 'dynamic'
				? 6
				: 25;
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
		this.xRandSkipperVal = random([0.01,random(1,100)])
		this.yRandSkipperVal = random([0.01,random(1,100)])
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = 1;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.zombie = false;
		this.lineWeight = 0.1 * MULTIPLIER;
		this.clampvaluearray = features.clampvalue.split(',').map(Number);
		this.uvalue = [25, 25, 25, 25];
		this.nvalue = [0.5, 0.5, 0.5, 0.5];
	}

	show() {
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.ang1,
			this.ang2,
			this.seed,
			this.oct,
			this.nvalue,
			this.uvalue
		);

		if (config_type === 1) {
			//! STARMAP CONFIGURATION
			this.uvalue[0] *= 1.013;
			this.uvalue[1] *= 1.013;
			this.uvalue[2] *= 1.013;
			this.uvalue[3] *= 1.013;

			this.nvalue[0] -= 0.005;
			this.nvalue[1] -= 0.005;
			this.nvalue[2] -= 0.005;
			this.nvalue[3] -= 0.005;
		} else if (config_type === 2) {
			//! Equilibrium CONFIGURATION
			this.uvalue[0] *= 1.015;
			this.uvalue[1] *= 1.015;
			this.uvalue[2] *= 1.015;
			this.uvalue[3] *= 1.015;

			this.nvalue[0] -= 0.015;
			this.nvalue[1] -= 0.015;
			this.nvalue[2] -= 0.015;
			this.nvalue[3] -= 0.015;
		} else if (config_type === 3) {
			//! ORIGINAL CONFIGURATION
			this.uvalue[0] += 1;
			this.uvalue[1] += 1;
			this.uvalue[2] += 1;
			this.uvalue[3] += 1;
		}
		this.xRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);
		this.yRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		if (
			this.x < this.xMin * width ||
			this.x > this.xMax * width ||
			this.y < this.yMin * height ||
			this.y > this.yMax * height
		) {
			this.a = 0;
			this.zombie = true;
		} else {
			this.a = this.zombie ? this.zombieAlpha : this.initAlpha;
		}

		if (this.x < this.xMin * width - this.lineWeight) {
			this.x = this.xMax * width + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.x > this.xMax * width + this.lineWeight) {
			this.x = this.xMin * width - fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.y < this.yMin * height - this.lineWeight) {
			this.y = this.yMax * height + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.y > this.yMax * height + this.lineWeight) {
			this.y = this.yMin * height - fxrand() * this.lineWeight;
			//this.a = 100;
		}

		let pxy = p.x - p.y;
		this.hue += map(pxy, -this.uvalue[0] * 2, this.uvalue[0] * 2, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;

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

	let u = pmap(un, -nvalue[0], nvalue[1], -uvalue[0], uvalue[1], true);
	let v = pmap(vn, -nvalue[2], nvalue[3], -uvalue[2], uvalue[3], true);

	let p = createVector(u, v);
	return p;
}
