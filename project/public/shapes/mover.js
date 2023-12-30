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
		this.startX = x;
		this.startY = y;
		this.x = x;
		this.y = y;
		this.px = x;
		this.py = y;
		this.initHue = hue;
		this.initSat = random([0, 0, 5, 10, 10, 80, 90, 100, 100]);
		this.initBri = random([10, 15, 20, 40, 50, 70, 90, 100]);
		this.initAlpha = random(10, 60);
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.s = random([0.5, 1, 1, 1, 2, 2, 2, 2]);
		//this.s = random([0.05, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.5, 0.5, 1,2]);
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.sclOffset1 = sclOffset1;
		this.sclOffset2 = sclOffset2;
		this.sclOffset3 = sclOffset3;

		this.seed = seed;
		this.xRandDivider = 1;
		this.yRandDivider = 1;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.isBordered = true;
		this.randBorderAlpha = 10;
		this.zombie = false;
		this.randRespawn = 10;
	}

	show() {
		//
		//blendMode(SCREEN);
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		strokeCap(PROJECT);
		if (abs(this.x - this.px) < 5 && abs(this.y - this.py) < 5) {
			strokeWeight(this.s);
			stroke(this.hue, this.sat, this.bri, this.a);
			line(this.x, this.y, this.px, this.py);
		}
	}

	move() {
		this.px = this.x;
		this.py = this.y;
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
		/* 		this.xRandDivider = random(0.1, 1.1);
		this.yRandDivider = random(0.1, 1.1); */
		/* 		this.xRandDivider = 0.1;
		this.yRandDivider = 0.1; */

		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		//shortand for if this.x is less than 0, set this.x to width and vice versa
		/* 		this.x = this.x < 0 ? width : this.x > width ? 0 : this.x;
		this.y = this.y < 0 ? height : this.y > height ? 0 : this.y; */
		this.randRespawn += random([-10, 10]);
		if (this.s > 3) {
			this.s = 0.1;
		}
		if (this.zombie) {
			this.s += 0.1;
			if (this.a < 100) {
				this.a += 10;
			} else {
				this.a = 100;
				this.zombie = false;
			}
		} else if (
			this.isBordered &&
			(this.x < this.xMin * width ||
				this.x > this.xMax * width ||
				this.y < this.yMin * height ||
				this.y > this.yMax * height)
		) {
			this.a -= this.randBorderAlpha;
			if (this.a < 0) {
				this.x = this.startX + random(-this.randRespawn, this.randRespawn);
				this.y = this.startY + random(-this.randRespawn, this.randRespawn);
				this.a = 0;
				this.zombie = true;
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
		scaleOffset1 = 1,
		scaleOffset2 = 1,
		scaleOffset3 = 1,
		noiseScale1 = 0.05,
		noiseScale2 = 0.05,
		noiseScale3 = 0.05,
		un =
			sin(nx * (scale1 * scaleOffset1)) +
			cos(nx * (scale2 * scaleOffset2)) -
			sin(nx * (scale3 * scaleOffset3)),
		vn =
			cos(ny * (scale1 * scaleOffset1)) +
			sin(ny * (scale2 * scaleOffset2)) -
			cos(ny * (scale3 * scaleOffset3));
	//! center focused
	/* 	let maxU = map(ny, 0, height, 3, -3, true);
	let maxV = map(nx, 0, width, 3, -3, true);
	let minU = map(ny, 0, height, -3, 3, true);
	let minV = map(nx, 0, width, -3, 3, true); */

	//! pNoise x SineCos
	/* 	let maxU = map(
		oct6(ny * (scale1 * scaleOffset1) + nseed, ny * (scale2 * scaleOffset3) + nseed, noiseScale1, 1),
		-0.5,
		0.5,
		0,
		4,
		true
	);
	let maxV = map(
		oct6(nx * (scale2 * scaleOffset1) + nseed, nx * (scale1 * scaleOffset2) + nseed, noiseScale2, 2),
		-0.5,
		0.5,
		0,
		4,
		true
	);
	let minU = map(
		oct6(ny * (scale3 * scaleOffset1) + nseed, ny * (scale1 * scaleOffset3) + nseed, noiseScale3, 0),
		-0.5,
		0.5,
		-4,
		0,
		true
	);
	let minV = map(
		oct6(nx * (scale1 * scaleOffset2) + nseed, nx * (scale3 * scaleOffset3) + nseed, noiseScale2, 3),
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
	/* 	let maxU = random(0.001, 4);
	let maxV = random(0.001, 4);
	let minU = random(-4, -0.001);
	let minV = random(-4, -0.001); */

	//! Standard Mode
	let maxU = 3;
	let maxV = 3;
	let minU = -3;
	let minV = -3;

	//! Introverted
	/* 	let u = map(vn, map(nx, 0, width, -4, -0.001), map(nx, 0, width, 0.001, 4), minU, maxU, true);
	let v = map(un, map(ny, 0, height, -4, -0.001), map(ny, 0, height, 0.001, 4), minV, maxV, true); */

	//! Extroverted
	let u = map(
		vn,
		map(nx, 0, width, 4, 0.1),
		map(nx, 0, width, -0.1, -4),
		maxU,
		minU,
		true
	);
	let v = map(
		un,
		map(ny, 0, height, 4, 0.1),
		map(ny, 0, height, -0.1, -4),
		maxV,
		minV,
		true
	);

	//! Equilibrium
	/* 	let u = map(vn, -3, 3, minU, maxU, true);
	let v = map(un, -3, 3, minV, maxV, true); */

	let p = createVector(u, v);
	return p;
}
