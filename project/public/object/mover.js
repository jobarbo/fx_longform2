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
		this.prevX = x;
		this.prevY = y;
		this.initHue = hue;
		this.initSat = [0, 10, 20, 20, 20, 30, 40, 40, 60, 80, 80, 90][Math.floor(fxrand() * 12)];
		this.initBri = [40, 60, 70, 70, 80, 80, 80, 90, 100][Math.floor(fxrand() * 9)];
		this.initAlpha = 0.2;
		this.initS = 0.7 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = 0;
		this.bri = 100;
		this.a = this.initAlpha;
		this.hueStep = 0;
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
		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = 1;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.borderX = width / 3.5;
		this.borderY = height / 2.25;
		this.clampvaluearray = features.clampvalue.split(',').map(Number);
		this.uvalue = 5;
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a})`;
		drawingContext.strokeStyle = 'transparent';
		drawingContext.fillRect(this.x, this.y, this.s, this.s);

		// draw a line from the previous position to the current position
		/* 		drawingContext.beginPath();
		drawingContext.lineWidth = 1;
		drawingContext.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a})`;
		drawingContext.moveTo(this.prevX, this.prevY);
		drawingContext.lineTo(this.x, this.y);
		drawingContext.stroke(); */
	}

	move() {
		this.prevX = this.x;
		this.prevY = this.y;
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
		/* 		this.xRandDivider = fxrand() * 4 + 0.000000000001;
		this.yRandDivider = fxrand() * 4 + 0.000000000001; */
		this.xRandSkipper =
			fxrand() * (-this.xRandSkipperVal * MULTIPLIER - this.xRandSkipperVal * MULTIPLIER) +
			this.xRandSkipperVal * MULTIPLIER;
		this.yRandSkipper =
			fxrand() * (-this.yRandSkipperVal * MULTIPLIER - this.yRandSkipperVal * MULTIPLIER) +
			this.yRandSkipperVal * MULTIPLIER;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		this.x =
			this.x <= this.centerX - this.borderX
				? this.centerX + this.borderX
				: this.x >= this.centerX + this.borderX
				? this.centerX - this.borderX
				: this.x;

		this.y =
			this.y <= this.centerY - this.borderY
				? this.centerY + this.borderY
				: this.y >= this.centerY + this.borderY
				? this.centerY - this.borderY
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

		this.a = map(distanceToEdge, 5, 10, 0, 0.2, true);
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

	let u = mapValue(un, -0.0000000015, 0.5, -2, 1, true);
	let v = mapValue(vn, -0.5, 0.0000000015, -1, 2, true);

	let p = createVector(u, v);
	return p;
}
