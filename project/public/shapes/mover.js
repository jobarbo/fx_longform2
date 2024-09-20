class Mover {
	constructor(x, y, hue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, seed) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat = random([0, 0, 5, 10]);
		this.initBri = random([0, 10, 20, 30, 40]);
		this.initAlpha = random(60, 100);
		this.hue = random([this.initHue, this.initHue / 2]);
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = 100;
		this.s = random([0.75]);
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.sclOffset1 = sclOffset1;
		this.sclOffset2 = sclOffset2;
		this.sclOffset3 = sclOffset3;
		this.seed = seed;
		this.xRandDivider = 0.1;
		this.yRandDivider = 0.1;
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
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.scl3, this.sclOffset1, this.sclOffset2, this.sclOffset3, this.xMin, this.yMin, this.xMax, this.yMax, this.seed);
		// after 1 second, change the scale

		//! crayon effect too
		this.xRandDivider = random(0.1, 0.1025);
		this.yRandDivider = random(0.1, 0.1025);

		/* 	this.xRandSkipper = random(-0.0001, 0.0001);
		this.yRandSkipper = random(-0.0001, 0.0001); */

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		/* 		if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
			this.s += 0.5;

			if (this.s >= 3) {
				this.s = 3;
			}
		} */

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		/* 		this.x = this.x < -this.s ? width + this.s : this.x > width + this.s ? -this.s : this.x;
		this.y = this.y < -this.s ? height + this.s : this.y > height + this.s ? -this.s : this.y; */

		if (this.isBordered) {
			if (this.x < (this.xMin - 0.015) * width) {
				this.x = (this.xMax - 0.015) * width;
			}
			if (this.x > (this.xMax + 0.015) * width) {
				this.x = (this.xMin + 0.015) * width;
			}
			if (this.y < (this.yMin - 0.015) * height) {
				this.y = (this.yMax - 0.015) * height;
			}
			if (this.y > (this.yMax + 0.015) * height) {
				this.y = (this.yMin + 0.015) * height;
			}
		}
	}
}

function superCurve(x, y, scl1, scl2, scl3, sclOff1, sclOff2, sclOff3, xMin, yMin, xMax, yMax, seed) {
	let nx = x,
		ny = y,
		scale1 = scl1,
		scale2 = scl2,
		scale3 = scl3,
		scaleOffset1 = sclOff1,
		scaleOffset2 = sclOff2,
		scaleOffset3 = sclOff3,
		noiseScale1 = 1,
		noiseScale2 = 1,
		noiseScale3 = 111,
		nseed = seed;
	un = sin(nx * (scale1 * scaleOffset1) + nseed) + cos(nx * (scale2 * scaleOffset2) + nseed) - sin(nx * (scale3 * scaleOffset3) + nseed);
	vn = cos(ny * (scale1 * scaleOffset1) + nseed) + sin(ny * (scale2 * scaleOffset2) + nseed) - cos(ny * (scale3 * scaleOffset3) + nseed);

	//! center focused introverted
	/* let maxU = map(ny, xMin * width, xMax * width, 3, -3, true);
	let maxV = map(nx, yMin * height, yMax * height, 3, -3, true);
	let minU = map(ny, xMin * width, xMax * width, -3, 3, true);
	let minV = map(nx, yMin * height, yMax * height, -3, 3, true); */

	//! center focused extroverted
	/* 	let maxU = map(nx, xMin * width, xMax * width, 3, -3, true);
	let maxV = map(ny, yMin * height, yMax * height, 3, -3, true);
	let minU = map(nx, xMin * width, xMax * width, -3, 3, true);
	let minV = map(ny, yMin * height, yMax * height, -3, 3, true); */

	//! pNoise x SineCos
	let maxU = map(oct(ny * (scale1 * scaleOffset1) + nseed, ny * (scale2 * scaleOffset3) + nseed, noiseScale1, 1, 1), -0.005, 0.005, -4, 4, true);
	let maxV = map(oct(nx * (scale2 * scaleOffset1) + nseed, nx * (scale1 * scaleOffset2) + nseed, noiseScale2, 2, 1), -0.005, 0.005, -4, 4, true);
	let minU = map(oct(ny * (scale3 * scaleOffset1) + nseed, ny * (scale1 * scaleOffset3) + nseed, noiseScale3, 0, 1), -0.005, 0.005, -4, 4, true);
	let minV = map(oct(nx * (scale1 * scaleOffset2) + nseed, nx * (scale3 * scaleOffset3) + nseed, noiseScale2, 3, 1), -0.005, 0.005, -4, 4, true);

	//! Wobbly noise square and stuff
	/* 	let maxU = map(noise(ny * (scale1 * scaleOffset1) + nseed), 0, 1, 0, 3, true);
	let maxV = map(noise(nx * (scale2 * scaleOffset2) + nseed), 0, 1, 0, 3, true);
	let minU = map(noise(ny * (scale2 * scaleOffset3) + nseed), 0, 1, -3, 0, true);
	let minV = map(noise(nx * (scale3 * scaleOffset1) + nseed), 0, 1, -3, 0, true); */

	//! Crayon mode
	/* 	let maxU = random(0.001, 4);
	let maxV = random(0.001, 4);
	let minU = random(-4, -0.001);
	let minV = random(-4, -0.001); */

	//! Standard Mode
	/* 	let maxU = 0.11;
	let maxV = 0.11;
	let minU = -0.11;
	let minV = -0.11; */

	//! Introverted
	let u = map(vn, map(nx, xMin * width, xMax * width, -1.5, -0.0000001), map(nx, xMin * width, xMax * width, 0.0000001, 1.5), minU, maxU, true);
	let v = map(un, map(ny, yMin * height, yMax * height, -1.5, -0.0000001), map(ny, yMin * height, yMax * height, 0.0000001, 1.5), minV, maxV, true);

	//! Extroverted
	/* 	let u = map(vn, map(ny, xMin * width, xMax * width, -5.4, -0.0001), map(ny, xMin * width, xMax * width, 0.0001, 5.4), minU, maxU, true);
	let v = map(un, map(nx, yMin * height, yMax * height, -5.4, -0.0001), map(nx, yMin * height, yMax * height, 0.0001, 5.4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */

	let p = createVector(u, v);
	return p;
}
