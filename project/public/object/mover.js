class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 10, 20]);
		this.initBri = random([0, 10, 20, 20, 40]);
		this.initAlpha = 100;
		this.initS = 0.5 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep = 10;
		this.satStep = 0;
		this.briStep = 0;
		this.s = this.initS;
		this.scl1Init = scl1;
		this.scl2Init = scl2;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1Init = ang1;
		this.ang2Init = ang2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.xRandDivider = random(0.001, 2);
		this.yRandDivider = random(0.001, 2);
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperVal = 0.1;
		this.yRandSkipperVal = 0.1;
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
		this.isBordered = true;
	}

	show() {
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s, this.s);
	}

	move() {
		// make ang1 smaller when around the center of the canvas both horizontally and vertically using mapValue
		let distFromCenter = int(dist(this.x, this.y, this.centerX, this.centerY));

		this.ang1 = int(map(distFromCenter, 0, 400, this.ang1Init / 15, this.ang1Init * 3, true));
		this.ang2 = int(map(distFromCenter, 0, 400, this.ang1Init / 15, this.ang1Init * 3, true));
		this.scl1 = map(distFromCenter, 0, 500, 0.0002, 0.005, true);
		this.scl2 = map(distFromCenter, 0, 500, 0.0002, 0.005, true);
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct);

		this.xRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);
		this.yRandSkipper = random(-this.xRandSkipperVal * MULTIPLIER, this.xRandSkipperVal * MULTIPLIER);
		this.xRandDivider = random(0.0000001, 1);
		this.yRandDivider = random(0.0000001, 1);
		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		let pxy = p.x - p.y;
		this.hue += mapValue(pxy, -this.uvalue * 2, this.uvalue * 2, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue;
		this.sat += mapValue(pxy, -this.uvalue * 2, this.uvalue * 2, -this.satStep, this.satStep, true);
		this.sat = this.sat > 100 ? 0 : this.sat < 0 ? 100 : this.sat;
		this.bri += mapValue(pxy, -this.uvalue * 2, this.uvalue * 2, this.briStep, -this.briStep, true);
		this.bri = this.bri > 100 ? 100 : this.bri < 0 ? 0 : this.bri;

		/* 		this.x = this.x <= 0 ? width - 2 : this.x >= width ? 0 : this.x;
		this.y = this.y <= 0 ? height - 2 : this.y >= height ? 0 : this.y; */

		if (this.isBordered) {
			if (this.x < (this.xMin - this.xLimit) * width) {
				this.x = (this.xMax + this.xLimit) * width;
				//this.a = 0;
			}
			if (this.x > (this.xMax + this.xLimit) * width) {
				this.x = (this.xMin - this.xLimit) * width;
				//this.a = 0;
			}
			if (this.y < (this.yMin - this.yLimit) * height) {
				this.y = (this.yMax + this.yLimit) * height;
				//this.a = 0;
			}
			if (this.y > (this.yMax + this.yLimit) * height) {
				this.y = (this.yMin - this.yLimit) * height;
				//this.a = 0;
			}
		}
	}
}
function superCurve(x, y, scl1, scl2, ang1, ang2, octave) {
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

	let u = map(un, -0.0000000000015, 0.0000000000015, -1, 1, true);
	let v = map(vn, -0.0000000000015, 0.0000000000015, -1, 1, true);

	let p = createVector(u, v);
	return p;
}
