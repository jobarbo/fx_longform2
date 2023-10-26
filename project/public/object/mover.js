class Mover {
	constructor(
		x,
		y,
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
		scl1Zone,
		scl2Zone,
		ang1Zone,
		ang2Zone
	) {
		this.x = x;
		this.y = y;
		this.initHue = int(hue);
		this.initSat = random([0, 0, 10, 20]);
		this.initBri = random([0, 0, 10, 20]);
		this.initAlpha = 100;
		this.initS = random([0.45]) * MULTIPLIER;
		this.s = this.initS;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep = 0.0001;
		this.satStep = 0.0001;
		this.briStep = 0.0001;
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

		this.ang1Zone = ang1Zone;
		this.ang2Zone = ang2Zone;
		this.scl1Zone = scl1Zone;
		this.scl2Zone = scl2Zone;

		this.ns = 0.5;
	}

	show() {
		// draw a pixel
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);

		/* 		noStroke();
		fill(this.hue, this.sat, this.bri, this.a);
		rect(this.x, this.y, this.s, this.s); */
	}

	move() {
		// get the distance from the particle to the chosen location using the sdf_box function (signed distance function).
		// the sdf_box function returns the distance from the particle to the chosen location.
		// the sdf_box function takes 3 arguments: the particle's x and y coordinates, the chosen location's x and y coordinates, and the chosen location's width and height.
		let distFromCenter = sdf_box([this.x, this.y], [this.centerX, height - 500], [1000, 10]);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, height - 500], 100);
		// smoothstep the distance from the particle to the chosen location.

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		this.ang1 = int(map(distCircle, 0, 200, 100, 300, true));
		this.ang2 = int(map(distCircle, 0, 200, -500, 900, true));
		/*this.scl1 = map(distCircle, 0, 30, 0.006, 0.0012, true);
		this.scl2 = map(distCircle, 0, 30, 0.006, 0.0012, true);

		this.ns = map(distCircle, 0, 30, -0.000000001, -0.5, true); */

		//this.oct = map(distCircle, 0, 1, 1, 6, true);
		//this.ang2 = int(map(distFromCenter, 0, this.ang2Zone, this.ang2Init * 2, this.ang2Init / 100, true));
		/*
		this.ang1 = int(map(distFromCenter, 0, this.ang1Zone, this.ang1Init / 1000, this.ang1Init * 2, true));
		this.ang2 = int(map(distFromCenter, 0, this.ang2Zone, this.ang2Init / 1000, this.ang2Init * 2, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, this.scl1Init / 1000, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, this.scl2Init / 1000, this.scl2Init * 3, true); */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct, this.ns);
		this.xRandDivider = fxrand() * 6;
		this.yRandDivider = fxrand() * 6;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		/* 		let pxy = p.x - p.y;
		this.hue += map(pxy, -this.uvalue * 2, this.uvalue * 2, this.hueStep, -this.hueStep, true);
		this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue;
		this.sat += map(pxy, -this.uvalue * 2, this.uvalue * 2, -this.satStep, this.satStep, true);
		this.sat = this.sat > 100 ? 0 : this.sat < 0 ? 100 : this.sat;
		this.bri += map(pxy, -this.uvalue * 2, this.uvalue * 2, this.briStep, -this.briStep, true);
		this.bri = this.bri > 100 ? 100 : this.bri < 0 ? 0 : this.bri; */

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

	let u = map(un, -noiseSpeed, noiseSpeed, -random([10, 15, 20]), random([1, 2, 3]), true);
	let v = map(vn, -noiseSpeed, noiseSpeed, -random([1, 2, 3]), random([10, 15, 20]), true);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
let R = (a = 1) => Math.random() * a;
let L = (x, y) => (x * x + y * y) ** 0.5; // Elements by Euclid 300 BC
let k = (a, b) => (a > 0 && b > 0 ? L(a, b) : a > b ? a : b);

function sdf_box([x, y], [cx, cy], [w, h]) {
	x -= cx;
	y -= cy;
	return k(abs(x) - w, abs(y) - h);
}

function sdf_circle([x, y], [cx, cy], r) {
	x -= cx;
	y -= cy;
	return L(x, y) - r;
}
