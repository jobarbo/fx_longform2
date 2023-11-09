class Mover {
	constructor(x, y, hue, scl1, scl2, seed) {
		this.x = x;
		this.y = y;
		this.hue = hue;
		this.sat = random([0, 10, 20]);
		this.bri = random([0, 5, 5, 10, 20]);
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.s = 0.15;
		this.a = 100;
		this.xRandDivider = random(0.0001, 2);
		this.yRandDivider = random(0.00001, 1.1);
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.seed = seed;
	}

	show() {
		//
		//blendMode(SCREEN);
		fill(this.hue, this.sat, this.bri, this.a);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, 250, 250, 6, 1);

		//this.hue = map(p.x, -4, 4, this.hue - 3, this.hue + 3, true);
		//this.sat = map(p.x, -4, 4, this.sat + 2, this.sat - 2, true);
		//this.bri = map(p.x, -4, 4, this.bri - 2, this.bri + 2, true);
		this.xRandDivider = random(0.0001, 2);
		this.yRandDivider = random(0.00001, 1.5);
		this.xRandSkipper = random(-0, 0);
		this.yRandSkipper = random(0, 0);
		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;
		this.a = map(abs(p.x + p.y), 1.99, 2, 50, 100, true);
		this.s = map(abs(p.x + p.y), 1.99, 2, 0.45, 0.25, true);

		/* 		if (this.hue < 0) {
			this.hue = 360;
		} else if (this.hue > 360) {
			this.hue = 0;
		}
		if (this.sat < 0) {
			60;
		} else if (this.sat > 60) {
			this.sat = 0;
		}
		if (this.bri > 30) {
			this.bri = 30;
		} else if (this.bri < 0) {
			this.bri = 0;
		} */

		if (this.s > 10) {
			this.s = 10;
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

	let rangeA = [1, 2, 3];
	let rangeB = [1, 3, 5];

	let aValue = rangeA[Math.floor(fxrand() * rangeA.length)];
	let bValue = rangeB[Math.floor(fxrand() * rangeB.length)];

	let u = mapValue(un, 0, noiseSpeed, -aValue, aValue);
	let v = mapValue(vn, 0, noiseSpeed, 1, bValue);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
