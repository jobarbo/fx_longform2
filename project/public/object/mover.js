class Mover {
	constructor(x, y, hue, scl1, scl2, seed) {
		this.x = x;
		this.y = y;
		this.hue = hue;
		this.sat = 50;
		this.bri = random(0, 30);
		//this.s = random(random(random(random(min(width, height) * 0.01)))) + 1;
		this.s = 0.3;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.seed = seed;
	}

	show() {
		//
		//blendMode(SCREEN);
		fill(this.hue, this.sat, this.bri, 40);
		noStroke();
		rect(this.x, this.y, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.seed);

		//this.hue = map(p.x, -4, 4, this.hue - 3, this.hue + 3, true);
		//this.sat = map(p.x, -4, 4, this.sat + 2, this.sat - 2, true);
		//this.bri = map(p.x, -4, 4, this.bri - 2, this.bri + 2, true);

		this.x += p.x / 0.01 + random(-0.1, 0.1);
		this.y += p.y / 0.15 + random(-0.1, 0.1);
		//this.s += map(p.x, -4, 4, -0.01, 0.01);

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
		/* 		if (this.s < 1) {
			this.s = 1;
		}
		if (this.s > 10) {
			this.s = 10;
		} */
	}
}

function superCurve(x, y, scl1, scl2, seed) {
	noiseDetail(1);
	let u = map(noise(x * scl1, y * scl1, seed), 0, 0.8, -10, 15, true);
	let v = map(noise(y * scl2, x * scl2, seed), 0.2, 1, -15, 13, true);
	//let u = sin(y * scl1 + seed) + cos(y * scl2 + seed) + sin(y * scl2 * 0.2 + seed);
	//let v = sin(x * scl1 + seed) + cos(x * scl2 + seed) - sin(x * scl2 * 0.2 + seed);
	let p = createVector(u, v);
	return p;
}
