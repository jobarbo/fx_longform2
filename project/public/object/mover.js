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
		this.initHue = parseInt(hue);
		this.initSat = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initBri = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initAlpha = 100;
		this.initS = 0.5 * MULTIPLIER;
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
		this.xRandSkipper = 1.1;
		this.yRandSkipper = 1.1;
		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.speed = 0;
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

		this.ns = 1;
	}

	show() {
		// draw a pixel
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move() {
		// get the distance from the particle to the chosen location using the sdf_box function (signed distance function).
		// the sdf_box function returns the distance from the particle to the chosen location.
		// the sdf_box function takes 3 arguments: the particle's x and y coordinates, the chosen location's x and y coordinates, and the chosen location's width and height.
		let distFromCenter = sdf_box(
			[this.x, this.y],
			[this.centerX, height - 2000 * MULTIPLIER],
			[400 * MULTIPLIER, 400 * MULTIPLIER]
		);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY], 500 * MULTIPLIER);

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		/* 		this.ang1 = parseInt(
			mapValue(distCircle, -100 * MULTIPLIER, 700 * MULTIPLIER, -this.ang1Init * 2, this.ang1Init * 4)
		);
		this.ang2 = parseInt(
			mapValue(distCircle, -100 * MULTIPLIER, 700 * MULTIPLIER, -this.ang2Init * 4, this.ang1Init * 2)
		); */
		/* 		this.scl1 = map(distCircle, -700 * MULTIPLIER, 200 * MULTIPLIER, -this.scl1Init * 3, this.scl1Init, true);
		this.scl2 = map(distCircle, -700 * MULTIPLIER, 200 * MULTIPLIER, -this.scl2Init * 3, this.scl2Init, true); */

		//! oct variant, not sure yet if it's good
		//this.oct = parseInt(map(distCircle, 0, 160, 6, 1, true));

		//! weird square variant
		/* 		this.ang1 = parseInt(map(distFromCenter, 0, this.ang1Zone, -this.ang1Init * 2, this.ang1Init * 1, true));
		this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, -this.ang2Init * 2, this.ang2Init * 1, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, -this.scl1Init * 2, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, -this.scl2Init * 2, this.scl2Init * 3, true); */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct, this.ns);
		this.xRandDivider = fxrand() * 6;
		this.yRandDivider = fxrand() * 6;

		this.speedX = (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipperVal;
		this.speedY = (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipperVal;

		this.speed = Math.abs(p.x + p.y);
		this.x += this.speedX;
		this.y += this.speedY;

		//!complexion standard (vegetation variant)
		/* 		this.s = mapValue(this.speed, 0, 2.01, this.initS * 4, this.initS, true);
		this.a = mapValue(this.speed, 2, 2.01, 40, 100, true); */

		//!complexion inverser (goldenfold variant)
		this.s = mapValue(this.speed, 0, 2.01, this.initS, this.initS * 2, true);
		this.a = mapValue(this.speed, 2, 2.01, 100, 70, true);

		//!complexion inverser (malachite variant)
		/* 		this.s = mapValue(this.speed, 0, 2.01, this.initS, this.initS * 2, true);
		this.a = mapValue(this.speed, 2, 2.01, 100, 10, true); */

		//!goldenfold variant
		if (this.speed < 1) {
			this.hue = 35;
			this.sat = this.initSat + 80;
			this.bri = this.initBri + 30;
		} else {
			this.hue = this.initHue;
			this.sat = this.initSat;
			this.bri = this.initBri;
		}

		//!malachite variant
		/* 		if (this.speed < 1) {
			this.hue = random(100, 220);
			this.sat = this.initSat + 80;
			this.bri = this.initBri + random(-20, 30);
		} else {
			this.hue = this.initHue;
			this.sat = this.initSat;
			this.bri = this.initBri;
		} */

		//!vegetation variant
		/* 		if (this.speed < 1) {
			this.hue = random(25, 125);
			this.sat = this.initSat + random(50, 80);
			this.bri = this.initBri + random(-30, 10);
		} else {
			this.hue = this.initHue;
			this.sat = this.initSat;
			this.bri = this.initBri;
		} */

		//!black variant
		/* 		this.sat = map(this.speed, 1, 1.01, this.initSat + 80, this.initSat, true);
		this.bri = map(this.speed, 1, 6.01, this.initBri + 50, this.initBri, true);
		this.hue = map(this.speed, 1, 1.01, 45, 130, true); */

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

	let un = oct(nx, ny, scale1, 3, octave) + 0.5;
	let vn = oct(nx, ny, scale2, 2, octave) + 0.5;

	/* 	let u = clamp(un, 0, 1) * 21 - 20;
	let v = clamp(vn, 0, 1) * 21 - 1; */

	let rangeA = [10, 15, 20];
	let rangeB = [1, 2, 3];

	let aValue = rangeA[Math.floor(fxrand() * rangeA.length)];
	let bValue = rangeB[Math.floor(fxrand() * rangeB.length)];

	let u = mapValue(un, 0, noiseSpeed, -aValue, bValue);
	let v = mapValue(vn, 0, noiseSpeed, -bValue, aValue);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
