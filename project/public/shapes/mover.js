class Mover {
	constructor(
		x,
		y,
		hue,
		scl1,
		scl2,
		scl3,
		sclOffset1,
		sclOffset2,
		sclOffset3,
		xMin,
		xMax,
		yMin,
		yMax,
		isBordered,
		seed
	) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 0, 5, 10, 80]);
		this.initBri = random([0, 10, 15, 20, 25, 35]);
		this.initAlpha = random(60, 100);
		this.hue = random([this.initHue, this.initHue / 2]);
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = 30;
		this.s = random([0.5]);
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.sclOffset1 = sclOffset1;
		this.sclOffset2 = sclOffset2;
		this.sclOffset3 = sclOffset3;
		this.seed = seed;
		this.xRandDivider = 0.02;
		this.yRandDivider = 0.02;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.isBordered = isBordered;
	}

	show() {
		//
		//blendMode(SCREEN);
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		circle(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.scl3,
			this.sclOffset1,
			this.sclOffset2,
			this.sclOffset3,
			this.seed
		);
		// after 1 second, change the scale

		//! crayon effect too
		/* 		this.xRandDivider = random(0.1, 4);
		this.yRandDivider = random(0.1, 4); */

		/* 		this.xRandSkipper = random(-1.001, 1.001);
		this.yRandSkipper = random(-1.001, 1.001);
 */
		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		this.x = this.x < 0 ? width : this.x > width ? 0 : this.x;
		this.y = this.y < 0 ? height : this.y > height ? 0 : this.y;

		if (this.isBordered) {
			if (this.x < (this.xMin - 0.015) * width) {
				this.x = (this.xMax + 0.015) * width;
			}
			if (this.x > (this.xMax + 0.015) * width) {
				this.x = (this.xMin - 0.015) * width;
			}
			if (this.y < (this.yMin - 0.015) * height) {
				this.y = (this.yMax + 0.015) * height;
			}
			if (this.y > (this.yMax + 0.015) * height) {
				this.y = (this.yMin - 0.015) * height;
			}
		}
	}
}

function superCurve(x, y, scl1, scl2, scl3, sclOff1, sclOff2, sclOff3, seed) {
	let nx = x,
		ny = y,
		scale1 = scl1,
		scale2 = scl2,
		scale3 = scl3,
		scaleOffset1 = sclOff1,
		scaleOffset2 = sclOff1,
		scaleOffset3 = sclOff2,
		noiseScale1 = 0.05,
		noiseScale2 = 0.05,
		noiseScale3 = 0.05,
		nseed = seed;
	un =
		sin(nx * (scale1 * scaleOffset1) + nseed) +
		cos(nx * (scale2 * scaleOffset2) + nseed) -
		sin(nx * (scale3 * scaleOffset3) + nseed);
	vn =
		cos(ny * (scale1 * scaleOffset1) + nseed) +
		sin(ny * (scale2 * scaleOffset2) + nseed) -
		cos(ny * (scale3 * scaleOffset3) + nseed);

	//! center focused
	/* 	let maxU = map(ny, 0, height, 3, -3, true);
	let maxV = map(nx, 0, width, 3, -3, true);
	let minU = map(ny, 0, height, -3, 3, true);
	let minV = map(nx, 0, width, -3, 3, true);
 */
	//! pNoise x SineCos
	/* 	let maxU = map(
		oct(ny * (scale1 * scaleOffset1) + nseed, ny * (scale2 * scaleOffset3) + nseed, noiseScale1, 1, 6),
		-0.5,
		0.5,
		0,
		4,
		true
	);
	let maxV = map(
		oct(nx * (scale2 * scaleOffset1) + nseed, nx * (scale1 * scaleOffset2) + nseed, noiseScale2, 2, 6),
		-0.5,
		0.5,
		0,
		4,
		true
	);
	let minU = map(
		oct(ny * (scale3 * scaleOffset1) + nseed, ny * (scale1 * scaleOffset3) + nseed, noiseScale3, 0, 6),
		-0.5,
		0.5,
		-4,
		0,
		true
	);
	let minV = map(
		oct(nx * (scale1 * scaleOffset2) + nseed, nx * (scale3 * scaleOffset3) + nseed, noiseScale2, 3, 6),
		-0.5,
		0.5,
		-4,
		0,
		true
	); */

	//! Wobbly noise square and stuff
	/* let maxU = map(noise(ny * (scale1 * scaleOffset1) + nseed), 0, 1, 0, 3, true);
	let maxV = map(noise(nx * (scale2 * scaleOffset2) + nseed), 0, 1, 0, 3, true);
	let minU = map(noise(ny * (scale2 * scaleOffset3) + nseed), 0, 1, -3, 0, true);
	let minV = map(noise(nx * (scale3 * scaleOffset1) + nseed), 0, 1, -3, 0, true); */

	//! Crayon mode
	/* 	let maxU = random(0.001, 4);
	let maxV = random(0.001, 4);
	let minU = random(-4, -0.001);
	let minV = random(-4, -0.001); */

	//! Standard Mode
	let maxU = 1;
	let maxV = 1;
	let minU = -1;
	let minV = -1;

	//! Introverted
	let u = map(vn, map(nx, 0, width, -4, -0.1), map(nx, 0, width, 0.1, 4), minU, maxU, true);
	let v = map(un, map(ny, 0, height, -4, -0.1), map(ny, 0, height, 0.1, 4), minV, maxV, true);

	//! Extroverted
	/* 	let u = map(vn, map(ny, 0, width, -4, -0.1), map(ny, 0, width, 0.1, 4), minU, maxU, true);
	let v = map(un, map(nx, 0, height, -4, -0.1), map(nx, 0, height, 0.1, 4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -3, 3, minU, maxU, true);
	let v = map(un, -3, 3, minV, maxV, true); */

	let p = createVector(u, v);
	return p;
}
