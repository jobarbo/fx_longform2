class Mover {
	constructor(
		x,
		y,
		xi,
		yi,
		hue,
		scl1,
		scl2,
		ang1,
		ang2,
		xMin,
		xMax,
		yMin,
		yMax,
		xRandDivider,
		yRandDivider,
		seed,
		features
	) {
		this.x = x;
		this.y = y;
		this.xi = xi;
		this.yi = yi;
		this.initHue = hue;
		this.initSat = random([0, 10, 20, 20, 20, 30, 40, 40, 60, 80, 80, 90]);
		this.initBri =
			features.theme === 'bright' && features.colormode !== 'monochrome'
				? random([0, 10, 20, 20, 40, 40, 60, 70, 80, 90, 100])
				: features.theme === 'bright' && features.colormode === 'monochrome'
				? random([0, 0, 10, 20, 20, 30, 40, 60, 80])
				: random([40, 60, 70, 70, 80, 80, 80, 90, 100]);
		this.initAlpha = 100;
		this.initS = 1 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = features.colormode === 'monochrome' ? 0 : this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep =
			features.colormode === 'monochrome' || features.colormode === 'fixed'
				? 1
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
		this.xRandSkipperVal = features.strokestyle === 'thin' ? 0.1 : features.strokestyle === 'bold' ? 2 : 1;
		this.yRandSkipperVal = features.strokestyle === 'thin' ? 0.1 : features.strokestyle === 'bold' ? 2 : 1;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = 1;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.borderX = width / 3;
		this.borderY = height / 3;

		this.clampvaluearray = features.clampvalue.split(',').map(Number);
		this.uvalue = 3;
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
			this.xi,
			this.yi,
			this.scl1,
			this.scl2,
			this.ang1,
			this.ang2,
			this.seed,
			this.oct,
			this.clampvaluearray,
			this.uvalue
		);

		this.xRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);
		this.yRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		this.x =
			this.x <= this.centerX - this.borderX
				? this.centerX + this.borderX + random(-1 * MULTIPLIER, 0)
				: this.x >= this.centerX + this.borderX
				? this.centerX - this.borderX + random(0, 1 * MULTIPLIER)
				: this.x;
		this.y =
			this.y <= this.centerY - this.borderY
				? this.centerY + this.borderY + random(-1 * MULTIPLIER, 0)
				: this.y >= this.centerY + this.borderY
				? this.centerY - this.borderY + random(0, 1 * MULTIPLIER)
				: this.y;

		let pxy = p.x - p.y;
		this.hue += mapValue(pxy, -this.uvalue * 2, this.uvalue * 2, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? this.hue - 360 : this.hue < 0 ? this.hue + 360 : this.hue;

		// make the alpha transition to zero when the particle are getting 100px closer to the edge of the borderX and borderY calculated from the center of the canvas

		// Check if particle is approaching the edge of the canvas
		let distanceToEdge = min(
			abs(this.x - this.centerX + this.borderX),
			abs(this.x - this.centerX - this.borderX),
			abs(this.y - this.centerY + this.borderY),
			abs(this.y - this.centerY - this.borderY)
		);

		this.a = map(distanceToEdge, 10, 60, 0, 30, true);
	}
}

function superCurve(x, y, xi, yi, scl1, scl2, ang1, ang2, seed, octave, clampvalueArr, uvalue) {
	let nx = x + xi,
		ny = y + yi,
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

	let u = mapValue(un, -0.5, 0.5, -uvalue, uvalue, true);
	let v = mapValue(vn, -0.5, 0.5, -uvalue, uvalue, true);

	let p = createVector(u, v);
	return p;
}
