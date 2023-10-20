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
		this.initHue = hue;
		this.initSat = random([50, 60, 70, 80, 90, 100]);
		//this.initBri = random([0, 0, 10, 20]);
		this.initBri = random([0, 10, 20, 30, 40, 50, 60, 70, 70, 70, 80, 80, 80, 80, 90, 90, 100]);
		this.initAlpha = 100;
		this.initS = 0.45 * MULTIPLIER;
		this.s = this.initS;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep = 8;
		this.satStep = 1;
		this.briStep = 1;
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
		this.uvalue = 15;
		this.isBordered = true;

		this.ang1Zone = ang1Zone;
		this.ang2Zone = ang2Zone;
		this.scl1Zone = scl1Zone;
		this.scl2Zone = scl2Zone;
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
		let distFromCenter = sdf_box([this.x, this.y], [this.centerX, this.centerY], [1000, 10]);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY], 300);
		// smoothstep the distance from the particle to the chosen location.

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		this.ang1 = int(map(distCircle, -300, -2, 700, 4000, true));

		this.ang2 = 500;

		this.scl1 = map(distCircle, -300, -2, 0.005, 0.003, true);
		//this.scl2 = 0.002;

		//this.ang2 = int(map(distFromCenter, 0, this.ang2Zone, this.ang2Init * 2, this.ang2Init / 100, true));
		/*
		this.ang1 = int(map(distFromCenter, 0, this.ang1Zone, this.ang1Init / 1000, this.ang1Init * 2, true));
		this.ang2 = int(map(distFromCenter, 0, this.ang2Zone, this.ang2Init / 1000, this.ang2Init * 2, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, this.scl1Init / 1000, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, this.scl2Init / 1000, this.scl2Init * 3, true); */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct);
		this.xRandDivider = fxrand() * 6 + 0.000001;
		this.yRandDivider = fxrand() * 6 + 0.000001;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		let pxy = p.x - p.y;
		this.hue += map(p.x, -this.uvalue, 1, this.hueStep, -this.hueStep, true);
		this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue;
		/* 		this.sat += map(p.y, -1, this.uvalue, -this.satStep, this.satStep, true);
		this.sat = this.sat > 100 ? 100 : this.sat < 0 ? 0 : this.sat;
		this.bri += map(p.y, -1, this.uvalue, this.briStep, -this.briStep, true);
		this.bri = this.bri > 100 ? 100 : this.bri < 0 ? 0 : this.bri; */

		this.a = map(distCircle, 0, 3, 100, 0, true);

		// check where the mouse is according to distCircle and console log the distCircle value according to the mouse position.

		if (this.isBordered) {
			if (distCircle > random(-4, 4)) {
				// put the particle back inside the circle if it's outside the circle using a random position on the circle. PUT THE ON THE OPPSITE SIDE OF THE CIRCLE FROM WHERE IT WENT OUT.
				let r = random(0, 2 * PI);
				this.x = this.centerX + cos(r) * 298;
				this.y = this.centerY + sin(r) * 298;
			}
			/* 			if (this.x < (this.xMin - this.xLimit) * width) {
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
			} */
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

	/* 	let u = clamp(un + 0.5, 0, 1) * 21 - 1;
	let v = clamp(vn + 0.5, 0, 1) * 21 - 20; */

	let u = map(un, -0.5, 0.5, -15, 1, true);
	let v = map(vn, -0.5, 0.5, -1, 15, true);

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
