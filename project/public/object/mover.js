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
	}

	move() {
		// get the distance from the particle to the chosen location using the sdf_box function (signed distance function).
		// the sdf_box function returns the distance from the particle to the chosen location.
		// the sdf_box function takes 3 arguments: the particle's x and y coordinates, the chosen location's x and y coordinates, and the chosen location's width and height.
		let distFromCenter = sdf_box(
			[this.x, this.y],
			[this.centerX, height - 2000 * MULTIPLIER],
			[4000 * MULTIPLIER, 40 * MULTIPLIER]
		);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY + 1700 * MULTIPLIER], 2200 * MULTIPLIER);
		// smoothstep the distance from the particle to the chosen location.

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		this.ang1 = parseInt(
			mapValue(distCircle, -100 * MULTIPLIER, 700 * MULTIPLIER, -this.ang1Init / 3, this.ang1Init * 4)
		);
		this.ang2 = parseInt(
			mapValue(distCircle, -100 * MULTIPLIER, 700 * MULTIPLIER, -this.ang2Init / 3, this.ang2Init * 4)
		);
		this.scl1 = map(distCircle, -700 * MULTIPLIER, 200 * MULTIPLIER, -this.scl1Init * 3, this.scl1Init, true);
		this.scl2 = map(distCircle, -700 * MULTIPLIER, 200 * MULTIPLIER, -this.scl2Init * 3, this.scl2Init, true);

		//this.oct = parseInt(map(distCircle, 0, 1, 1, 6, true));

		//this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, this.ang2Init * 2, this.ang2Init / 100, true));
		/*
		this.ang1 = parseInt(map(distFromCenter, 0, this.ang1Zone, this.ang1Init / 1000, this.ang1Init * 2, true));
		this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, this.ang2Init / 1000, this.ang2Init * 2, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, this.scl1Init / 1000, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, this.scl2Init / 1000, this.scl2Init * 3, true); */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct, this.ns);
		this.xRandDivider = fxrand() * 6;
		this.yRandDivider = fxrand() * 6;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

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
