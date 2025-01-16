class Mover {
	constructor(x, y, hue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = 0;
		this.initBri = 100;
		this.initAlpha = random(60, 100);
		this.hue = random([this.initHue, this.initHue / 2]);
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = 10;
		this.s = random([0.5]);
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.sclOffset1 = sclOffset1;
		this.sclOffset2 = sclOffset2;
		this.sclOffset3 = sclOffset3;
		this.seed = seed;
		this.xRandDivider = 0.01;
		this.yRandDivider = 0.01;
		this.xRandSkipper = 0.01;
		this.yRandSkipper = 0.01;
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
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.scl3, this.sclOffset1, this.sclOffset2, this.sclOffset3, this.seed);
		// after 1 second, change the scale

		//! crayon effect too
		/* 		this.xRandDivider = random(0.1, 4);
		this.yRandDivider = random(0.1, 4); */

		/* 		this.xRandSkipper = random(-1.001, 1.001);
		this.yRandSkipper = random(-1.001, 1.001);
 */
		this.x += p.x / this.xRandDivider + random(-this.xRandSkipper, this.xRandSkipper);
		this.y += p.y / this.yRandDivider + random(-this.yRandSkipper, this.yRandSkipper);

		//if the particle is out of bounds, put it back in a random position
		if (this.x < this.xMin * width || this.x > this.xMax * width || this.y < this.yMin * height || this.y > this.yMax * height) {
			this.x = random(this.xMin * width, this.xMax * width);
			this.y = random(this.yMin * height, this.yMax * height);
		}

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
		scaleOffset2 = sclOff2,
		scaleOffset3 = sclOff3,
		noiseScale1 = 0.05,
		noiseScale2 = 0.05,
		noiseScale3 = 0.05,
		nseed = seed;
	un = sin(nx * (scale1 * scaleOffset1) + nseed) + cos(nx * (scale2 * scaleOffset2) + nseed) + sin(nx * (scale3 * scaleOffset3) + nseed);
	vn = cos(ny * (scale1 * scaleOffset1) + nseed) + sin(ny * (scale2 * scaleOffset2) + nseed) + cos(ny * (scale3 * scaleOffset3) + nseed);

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
	/* 	let maxU = map(noise(ny * (scale1 * scaleOffset1) + nseed), 0, 1, 0, 3, true);
	let maxV = map(noise(nx * (scale2 * scaleOffset2) + nseed), 0, 1, 0, 3, true);
	let minU = map(noise(ny * (scale2 * scaleOffset3) + nseed), 0, 1, -3, 0, true);
	let minV = map(noise(nx * (scale3 * scaleOffset1) + nseed), 0, 1, -3, 0, true); */

	//! Crayon mode
	this.gaussOffset = map(frameCount, 0, 20, 0.1, 0.00000000001, true);
	let maxU = randomGaussian(1, this.gaussOffset);
	let maxV = randomGaussian(1, this.gaussOffset);
	let minU = randomGaussian(-1, this.gaussOffset);
	let minV = randomGaussian(-1, this.gaussOffset);

	//! Standard Mode
	/* 	let maxU = 1;
	let maxV = 1;
	let minU = -1;
	let minV = -1; */

	//! Introverted
	/* 	let u = map(vn, map(nx, 0, width, -0.0001, -0.0000001), map(nx, 0, width, 0.0000001, 0.0001), minU, maxU, true);
	let v = map(un, map(ny, 0, height, -0.0001, -0.0000001), map(ny, 0, height, 0.0000001, 0.0001), minV, maxV, true); */

	//! Extroverted
	let u = map(vn, map(ny, 0, width, -0.0001, -0.01), map(ny, 0, width, 0.01, 0.0001), minU, maxU, true);
	let v = map(un, map(nx, 0, height, -0.0001, -0.01), map(nx, 0, height, 0.01, 0.0001), minV, maxV, true);

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */

	let p = createVector(u, v);
	return p;
}
