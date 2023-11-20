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
		maxFrames,
		features
	) {
		this.x = x;
		this.y = y;
		this.initX = x;
		this.initY = y;
		this.prevX = x;
		this.prevY = y;
		this.posArr = [];
		this.xi = xi;
		this.yi = yi;
		this.initHue = hue;
		this.initSat = [0, 10, 20, 20, 20, 30, 40, 40, 60, 80, 80, 90][Math.floor(fxrand() * 12)];
		this.initBri = [40, 60, 70, 70, 80, 80, 80, 90, 100][Math.floor(fxrand() * 9)];
		this.initAlpha = 40;
		this.initS = 2 * MULTIPLIER;
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
		this.borderX = width / 1.75;
		this.borderY = height / 1.75;
		this.clampvaluearray = features.clampvalue.split(',').map(Number);
		this.maxFrames = maxFrames;
		this.uvalue = 5;
	}

	show() {
		/* drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a})`;
		drawingContext.strokeStyle = 'transparent';
		drawingContext.fillRect(this.x, this.y, this.s, this.s); */

		/* drawingContext.beginPath();
		drawingContext.arc(this.x, this.y, this.s / 2, 0, 2 * Math.PI);
		drawingContext.fill(); */

		// draw a line from the previous position to the current position
		/* 		drawingContext.beginPath();
		drawingContext.lineWidth = this.s;
		drawingContext.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a})`;
		drawingContext.moveTo(this.prevX, this.prevY);
		drawingContext.lineTo(this.x, this.y);
		drawingContext.stroke(); */

		/* 		strokeCap(PROJECT);
		strokeWeight(this.s);
		stroke(this.hue, this.sat, this.bri, this.a);
		line(this.prevX, this.prevY, this.x, this.y); */

		strokeWeight(this.s);
		stroke(this.hue, this.sat, this.bri, this.a);
		noFill();
		beginShape();
		if (this.posArr.length >= this.maxFrames - 1) {
			curveVertex(this.initX, this.initY);
			curveVertex(this.initX, this.initY);
			for (let i = 0; i < this.posArr.length; i++) {
				curveVertex(this.posArr[i].x, this.posArr[i].y);
			}
			curveVertex(this.prevX, this.prevY);
			curveVertex(this.x, this.y);
		}
		endShape();
	}

	move(frameCount, maxFrames) {
		this.prevX = this.x;
		this.prevY = this.y;
		// push and store the current position into an array
		this.posArr.push(createVector(this.x, this.y));
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

		this.x += (p.x * MULTIPLIER) / this.xRandDivider;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider;

		/* 		this.x =
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
				: this.y; */

		/* 		if (
			this.x <= this.centerX - this.borderX ||
			this.x >= this.centerX + this.borderX ||
			this.y <= this.centerY - this.borderY ||
			this.y >= this.centerY + this.borderY
		) {
			this.prevX = this.x;
			this.prevY = this.y;
		} */

		//this.a = map(distFromCenter, -40, 1, 10, 0, true);
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

	let minU = -2;
	let maxU = 2;
	let minV = -2;
	let maxV = 2;

	let u = pmap(vn, pmap(nx, 0, width, -10.0001, -0.0000001), pmap(nx, 0, width, 0.0000001, 10.0001), minU, maxU);
	let v = pmap(un, pmap(ny, 0, height, -10.0001, -0.0000001), pmap(ny, 0, height, 0.0000001, 10.0001), minV, maxV);

	/* 	let u = mapValue(un, -0.5, 0.5, -5, 5, true);
	let v = mapValue(vn, -0.5, 0.5, -5, 5, true); */
	return {x: u, y: v};
}
