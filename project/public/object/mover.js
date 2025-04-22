class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, scl1Zone, scl2Zone, ang1Zone, ang2Zone) {
		this.px = x;
		this.py = y;
		this.x = x;
		this.y = y;
		this.initHue = parseInt(hue);
		this.initSat = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initBri = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initAlpha = 100;
		this.initS = 0.75 * MULTIPLIER;
		this.initLineS = 0.25 * MULTIPLIER;
		this.s = this.initS;
		this.ls = this.initLineS;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.scl1Init = scl1;
		this.scl2Init = scl2;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1Init = ang1;
		this.ang2Init = ang2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.xRandDivider = xRandDivider;
		this.yRandDivider = yRandDivider;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.xLimit = 0.00015;
		this.yLimit = 0.00015;
		this.oct = 6;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.borderX = width / 2;
		this.borderY = height / 2.75;
		this.uvalue = 4;

		this.ang1Zone = ang1Zone;
		this.ang2Zone = ang2Zone;
		this.scl1Zone = scl1Zone;
		this.scl2Zone = scl2Zone;

		this.ns = 0.5;

		this.lw = this.initLineS;
		this.lwl = width / 300;
		this.lhl = height / 300;
	}

	show() {
		// draw a pixel
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);

		// draw a line from the previous position to the current position
		/* 		if (this.px != this.x && this.py != this.y) {
			// only show if the line is less than half the width of the canvas
			if (abs(this.px - this.x) < this.lwl && abs(this.py - this.y) < this.lhl) {
				//make the weight of the stroke the same as the size of the particle and make the line as a bezier curve
				drawingContext.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, 100%)`;
				drawingContext.lineWidth = this.lw;
				drawingContext.beginPath();
				drawingContext.moveTo(this.px, this.py);
				drawingContext.lineTo(this.x, this.y);
				drawingContext.stroke();
			}
		} */
	}

	move() {
		// store the previous position
		this.px = this.x;
		this.py = this.y;

		let distFromCenter = sdf_box([this.x, this.y], [this.centerX, height - 500], [100, 100], -150);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, height - 500], 100);

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		this.ang1 = parseInt(mapValue(distFromCenter, 150, 200, -50, 500));
		this.ang2 = parseInt(mapValue(distFromCenter, 150, 200, -50, 500));
		this.scl1 = map(distFromCenter, 150, 200, -0.01896, 0.0036, true);
		this.scl2 = map(distFromCenter, 150, 200, -0.01896, 0.0036, true);
		this.oct = parseInt(map(distFromCenter, 1, 151, 2, 6, true));
		this.ns = map(distFromCenter, 100, 200, 0.5, 1.0, true);

		//this.oct = map(distCircle, 0, 1, 1, 6, true);
		//this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, this.ang2Init * 2, this.ang2Init / 100, true));
		/*
		this.ang1 = parseInt(map(distFromCenter, 0, this.ang1Zone, this.ang1Init / 1000, this.ang1Init * 2, true));
		this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, this.ang2Init / 1000, this.ang2Init * 2, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, this.scl1Init / 1000, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, this.scl2Init / 1000, this.scl2Init * 3, true); */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct, this.ns);
		this.xRandDivider = fxrand() * mapValue(distFromCenter, 170, 200, 14, 6);
		this.yRandDivider = fxrand() * mapValue(distFromCenter, 170, 200, 14, 6);

		this.x += (p.x * MULTIPLIER) / this.xRandDivider;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider;

		if (this.x < (this.xMin - this.xLimit) * width) {
			this.x = (this.xMax + this.xLimit) * width;
		}
		if (this.x > (this.xMax + this.xLimit) * width) {
			this.x = (this.xMin - this.xLimit) * width;
		}
		if (this.y < (this.yMin - this.yLimit) * height) {
			this.y = (this.yMax + this.yLimit) * height;
		}
		if (this.y > (this.yMax + this.yLimit) * height) {
			this.y = (this.yMin - this.yLimit) * height;
		}
	}
}
function superCurve(x, y, scl1, scl2, ang1, ang2, octave, ns) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		noiseSpeed = ns,
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

	/* 	let u = clamp(un + 0.5, 0, 1) * 21 - 1;
	let v = clamp(vn + 0.5, 0, 1) * 21 - 20; */

	let rangeA = [10, 15, 20];
	let rangeB = [1, 2, 3];

	let aValue = rangeA[Math.floor(fxrand() * rangeA.length)];
	let bValue = rangeB[Math.floor(fxrand() * rangeB.length)];

	let u = mapValue(un, -noiseSpeed, noiseSpeed, -aValue, bValue);
	let v = mapValue(vn, -noiseSpeed, noiseSpeed, -bValue, aValue);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
