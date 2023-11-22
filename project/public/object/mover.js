class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = [0, 10, 20, 30, 40, 40, 60, 80, 80, 90, 100][Math.floor(fxrand() * 11)];
		this.initBri =
			features.theme === 'bright' && features.colormode !== 'monochrome'
				? [0, 10, 20, 20, 40, 40, 60, 70, 80, 90, 100][Math.floor(fxrand() * 11)]
				: features.theme === 'bright' && features.colormode === 'monochrome'
				? [0, 0, 10, 20, 20, 30, 40, 60, 80][Math.floor(fxrand() * 9)]
				: [40, 60, 70, 70, 80, 80, 80, 90, 100][Math.floor(fxrand() * 9)];
		this.initAlpha = 100;
		this.initS = 0.75 * MULTIPLIER;
		//this.initS = 1 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = features.colormode === 'monochrome' || features.colormode === 'duotone' ? 0 : this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep =
			features.colormode === 'monochrome' || features.colormode === 'fixed'
				? 1
				: features.colormode === 'dynamic' || features.colormode === 'duotone'
				? 6
				: 25;
		this.satStep = features.colorMode === 'duotone' ? 0.1 : 1;
		this.briStep = 1;
		this.s = this.initS;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.xRandDivider = 0.1;
		this.yRandDivider = 0.1;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = features.complexity;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.borderX = width / 2;
		this.borderY = height / 2.75;
		this.clampvaluearray = features.clampvalue.split(',').map(Number);
		this.uvalueArr = features.behaviorvalue.split(',').map(Number);
		// store the smallest value of the uvalueArr in this.uvalue
		this.uvalue = Math.min(...this.uvalueArr);
		this.isBordered = true;
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move() {
		let p = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.ang1,
			this.ang2,
			this.oct,
			this.clampvaluearray,
			this.uvalueArr
		);

		this.xRandSkipper = fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) - this.xRandSkipperVal * MULTIPLIER;
		this.yRandSkipper = fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) - this.xRandSkipperVal * MULTIPLIER;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		let pxy = p.x - p.y;
		this.hue += mapValue(pxy, -this.uvalue * 2, this.uvalue * 2, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue;
		this.bri += mapValue(p.y, -this.uvalue * 2, this.uvalue * 2, -this.briStep, this.briStep, true);
		this.bri = this.bri > 100 ? 0 : this.bri < 0 ? 100 : this.bri;
		this.sat += mapValue(p.x, -this.uvalue * 2, this.uvalue * 2, -this.satStep, this.satStep, true);
		if (features.colormode != 'monochrome' && features.colormode != 'duotone') {
			this.sat = this.sat > 100 ? 0 : this.sat < 0 ? 100 : this.sat;
		} else if (features.colormode === 'duotone') {
			this.sat = this.sat > this.initSat * 1.5 ? 0 : this.sat < 0 ? this.initSat * 1.5 : this.sat;
		}

		this.x = this.x <= 0 ? width - 2 : this.x >= width ? 0 : this.x;
		this.y = this.y <= 0 ? height - 2 : this.y >= height ? 0 : this.y;

		if (this.isBordered) {
			if (this.x < this.xMin * width) {
				this.x = this.xMax * width + fxrand() * (1 * MULTIPLIER);
				//this.a = 0;
			}
			if (this.x > this.xMax * width) {
				this.x = this.xMin * width + fxrand() * (1 * MULTIPLIER);
				//this.a = 0;
			}
			if (this.y < this.yMin * height) {
				this.y = this.yMax * height + fxrand() * (1 * MULTIPLIER);
				//this.a = 0;
			}
			if (this.y > this.yMax * height) {
				this.y = this.yMin * height + fxrand() * (1 * MULTIPLIER);
				//this.a = 0;
			}
		}
	}
}
function superCurve(x, y, scl1, scl2, ang1, ang2, octave, clampvalueArr, uvalueArr) {
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

	let un = oct(nx, ny, scale1, 3, octave);
	let vn = oct(nx, ny, scale2, 2, octave);

	let u = mapValue(un, -clampvalueArr[0], clampvalueArr[1], -uvalueArr[0], uvalueArr[1], true);
	let v = mapValue(vn, -clampvalueArr[2], clampvalueArr[3], -uvalueArr[2], uvalueArr[3], true);

	return {x: u, y: v};
}
