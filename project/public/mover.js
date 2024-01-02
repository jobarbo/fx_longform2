class Mover {
	constructor(x, y, hue, scl1, scl2, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;

		this.initSat = [40, 45, 50, 55][Math.floor(fxrand() * 4)];

		this.initBri = [40, 45, 50, 55][Math.floor(fxrand() * 4)];
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.initS = 3 * MULTIPLIER;
		this.s = this.initS;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.seed = seed;
		this.xRandDivider = 0.5;
		this.yRandDivider = 0.5;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0;
		this.minSat = random(1, 20);
		this.minBri = random(20, 30);
		this.speedX = 0;
		this.speedY = 0;
		this.speed = 0;
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, 20%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.seed);

		this.xRandDivider = random(0.000001, 2.01) * MULTIPLIER;
		this.yRandDivider = random(0.000001, 2.01) * MULTIPLIER;
		this.xRandSkipperVal =
			random(-this.xRandSkipper, this.xRandSkipper) * MULTIPLIER;
		this.yRandSkipperVal =
			random(-this.yRandSkipper, this.yRandSkipper) * MULTIPLIER;

		this.speedX = (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipperVal;
		this.speedY = (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipperVal;

		this.speed = Math.abs(this.speedX + this.speedY);

		this.hue = map(this.speed, 0, 3, this.hue - 3, this.hue + 3, true);
		this.sat = map(this.speed, 0, 3, this.sat - 3, this.sat + 3, true);
		this.bri = map(this.speed, 0, 3, this.bri - 3, this.bri + 3, true);

		this.x += this.speedX;
		this.y += this.speedY;

		this.a = mapValue(this.speed, 0, 2.01, 0, 100, true);

		if (this.hue < 0) {
			this.hue = 360;
		}
		if (this.hue > 360) {
			this.hue = 0;
		}

		if (this.sat < this.minSat) {
			this.sat = random(25, 35);
		} else if (this.sat > random(80, 100)) {
			this.sat = random(50, 70);
		}
		if (this.bri < this.minBri) {
			this.bri = random(35, 45);
		} else if (this.bri > 100) {
			this.bri = random(70, 90);
		}
		if (this.s < 1 * MULTIPLIER) {
			this.s = 1 * MULTIPLIER;
		}
		if (this.s > 5 * MULTIPLIER) {
			this.s = 5 * MULTIPLIER;
		}
	}
}

function superCurve(x, y, scl1, scl2) {
	let nx = x,
		ny = y,
		a1 = 1,
		a2 = 1000,
		scale1 = scl1,
		scale2 = scl2,
		octave = 6,
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

	let sun = smoothstep(-0.00000015, 0.00000015, un);
	let svn = smoothstep(-0.00000015, 0.00000015, vn);

	let u = mapValue(sun, 0, 1, -1, 1);
	let v = mapValue(svn, 0, 1, -1, 1);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
