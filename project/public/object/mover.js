class Mover {
	constructor(x, y, hue, scl1, scl2, ang1, ang2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, scl1Zone, scl2Zone, ang1Zone, ang2Zone, maxFrames) {
		this.x = x;
		this.y = y;
		this.maxFrames = maxFrames;
		this.initHue = parseInt(hue);
		this.initSat = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initBri = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initAlpha = 100;
		this.initS = 0.01 * MULTIPLIER;
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
	}

	show() {
		// draw a pixel

		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move(frameCount) {
		// get the distance from the particle to the chosen location using the sdf_box function (signed distance function).
		// the sdf_box function returns the distance from the particle to the chosen location.
		// the sdf_box function takes 3 arguments: the particle's x and y coordinates, the chosen location's x and y coordinates, and the chosen location's width and height.
		let distFromCenter = sdf_box([this.x, this.y], [this.centerX, height - 2000 * MULTIPLIER], [400 * MULTIPLIER, 400 * MULTIPLIER]);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY + 200], 600 * MULTIPLIER);

		let distHexagon = sdf_hexagon([this.x, this.y], [this.centerX, this.centerY], 200 * MULTIPLIER);

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		/* 		this.ang1 = map(distCircle, -500 * MULTIPLIER, 200 * MULTIPLIER, -this.ang1Init * 8, this.ang1Init, true);
		this.ang2 = map(distCircle, -500 * MULTIPLIER, 200 * MULTIPLIER, -this.ang2Init * 8, this.ang2Init, true); */
		/* 		this.scl1 = map(distCircle, -100 * MULTIPLIER, 200 * MULTIPLIER, -this.scl1Init, this.scl1Init * 1, true);
		this.scl2 = map(distCircle, -100 * MULTIPLIER, 200 * MULTIPLIER, -this.scl2Init, this.scl2Init * 1, true); */

		//! oct variant, not sure yet if it's good
		//this.oct = parseInt(map(distCircle, 0, 160, 6, 1, true));

		//! weird square variant
		/* 		this.ang1 = parseInt(map(distFromCenter, 0, this.ang1Zone, -this.ang1Init * 2, this.ang1Init * 1, true));
		this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, -this.ang2Init * 2, this.ang2Init * 1, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, -this.scl1Init * 2, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, -this.scl2Init * 2, this.scl2Init * 3, true); */

		//! hexagon variant
		/* 		this.ang1 = parseInt(map(distHexagon, -500, this.ang1Zone, -this.ang1Init * 8, this.ang1Init * 1, true));
		this.ang2 = parseInt(map(distHexagon, -500, this.ang2Zone, -this.ang2Init * 8, this.ang2Init * 1, true));
		this.scl1 = map(distHexagon, -100, this.scl1Zone, -this.scl1Init, this.scl1Init * 1, true);
		this.scl2 = map(distHexagon, -100, this.scl2Zone, -this.scl1Init, this.scl1Init * 1, true);
 */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct);
		let randMultX = map(frameCount, 0, this.maxFrames / 5, 6, 16, true);
		let randMultY = map(frameCount, 0, this.maxFrames / 5, 6, 16, true);
		this.xRandDivider = fxrand() * randMultX;
		this.yRandDivider = fxrand() * randMultY;

		this.speedX = (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipperVal;
		this.speedY = (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipperVal;

		this.speed = Math.abs(p.x + p.y);
		this.x += this.speedX;
		this.y += this.speedY;

		if (this.x < this.xMin * width || this.x > this.xMax * width || this.y < this.yMin * height || this.y > this.yMax * height) {
			this.a = 0;
		} else {
			//!complexion standard (vegetation variant)
			/* 		this.s = mapValue(this.speed, 0, 2.01, this.initS * 4, this.initS, true);
		this.a = mapValue(this.speed, 2, 2.01, 40, 100, true); */
			this.initS = map(frameCount, 0, this.maxFrames, 0.2, 0.1, true) * MULTIPLIER;
			/* 		let alpha_min = map(frameCount, 0, this.maxFrames / 2, 10, 70, true);
			let alpha_max = map(frameCount, 0, this.maxFrames / 2, 40, 100, true); */

			//!complexion inverser (goldenfold variant)
			this.s = mapValue(this.speed, 0, 1.01, this.initS * 2, this.initS * 3, true);
			this.a = mapValue(this.speed, 2, 2.01, 100, 70, true);

			//!complexion inverser (malachite variant)
			/* 		this.s = mapValue(this.speed, 0, 2.01, this.initS, this.initS * 2, true);
		this.a = mapValue(this.speed, 2, 2.01, 100, 40, true); */
		}

		//!goldenfold variant
		if (this.speed < 0.51) {
			this.hue = 15;
			this.sat = this.initSat + 100;
			this.bri = this.initBri + random([-30, -20, -10, 0, 10, 50]);
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

		// if this.x is outside of xmin and xmax, set the alpha to 0;

		if (this.x < (this.xMin - this.xLimit) * width - 50) {
			this.x = (this.xMax + this.xLimit) * width + 50;
		}
		if (this.x > (this.xMax + this.xLimit) * width + 50) {
			this.x = (this.xMin - this.xLimit) * width - 50;
		}
		if (this.y < (this.yMin - this.yLimit) * height - 50) {
			this.y = (this.yMax + this.yLimit) * height + 50;
		}
		if (this.y > (this.yMax + this.yLimit) * height + 50) {
			this.y = (this.yMin - this.yLimit) * height - 50;
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

	let sun = smoothstep(-0.5, 0.15, un);
	let svn = smoothstep(-0.15, 0.5, vn);

	/* 	let u = clamp(un, 0, 1) * 21 - 20;
	let v = clamp(vn, 0, 1) * 21 - 1; */

	let rangeA = [10, 15, 20];
	let rangeB = [1, 2, 3];

	let aValue = rangeA[Math.floor(fxrand() * rangeA.length)];
	let bValue = rangeB[Math.floor(fxrand() * rangeB.length)];

	/* 	let u = mapValue(un, -0.5, 0.5, -aValue, bValue);
	let v = mapValue(vn, -0.5, 0.5, -bValue, aValue);*/
	let u = mapValue(sun, 0, 1, -bValue, aValue);
	let v = mapValue(svn, 0, 1, -aValue, bValue);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
