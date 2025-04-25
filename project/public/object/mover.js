class Mover {
	constructor(x, y, hue, s1, s2, a1, a2, xMin, xMax, yMin, yMax, xDiv, yDiv, seed, features) {
		this.x = x;
		this.y = 0;
		this.hue = 201;
		this.sat = 0;
		this.bri = 100;
		this.alpha = 100;
		this.size = 0.15 * mult;
		this.hueStep = features.colormode === "monochrome" || features.colormode === "fixed" ? 0 : features.colormode === "dynamic" ? 6 : 25;
		this.s1 = s1;
		this.s2 = s2;
		this.a1 = a1;
		this.a2 = a2;
		this.seed = seed;
		this.xDiv = xDiv;
		this.yDiv = yDiv;
		this.xSkipVal = random([0.01, random([0.1, 1, 2, 5, 10, 25, 50, 75, 100])]);
		this.ySkipVal = random([0.01, random([0.1, 1, 2, 5, 10, 25, 50, 75, 100])]);
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.lineWeight = random([0.1, 1, 2, 5, 10, 25, 50, 100]) * mult;
		this.uValues = [35, 35, 1, 1];
		this.nValues = [0.05, 0.05, 0.05, 0.05];
		this.nDir = [-1, -1, -1, -1];
		this.uDir = [1, 1, 1, 1];
	}

	show() {
		fill(this.hue, this.sat, this.bri, this.alpha);
		noStroke();
		rect(this.x, this.y, this.size);
	}

	move() {
		let p = superCurve(this.x, this.y, this.s1, this.s2, this.a1, this.a2, this.seed, 6, this.nValues, this.uValues);

		this.uValues.forEach((_, i) => {
			this.uValues[i] /= 1.00001 * this.uDir[i];
			this.nValues[i] += 0.0000015 * this.nDir[i];
		});

		this.x += (p.x * mult) / this.xDiv + random(-this.xSkipVal * mult, this.xSkipVal * mult);
		this.y += (p.y * mult) / this.yDiv + random(-this.ySkipVal * mult, this.ySkipVal * mult);

		if (this.x < this.xMin * width - this.lineWeight || this.x > this.xMax * width + this.lineWeight) {
			this.x = this.x < this.xMin * width ? this.xMax * width : this.xMin * width;
			this.x += fxrand() * this.lineWeight;
			this.y += fxrand() * this.lineWeight;
		}
		if (this.y < this.yMin * height - this.lineWeight || this.y > this.yMax * height + this.lineWeight) {
			this.y = this.y < this.yMin * height ? this.yMax * height : this.yMin * height;
			this.y += fxrand() * this.lineWeight;
			this.x += fxrand() * this.lineWeight;
			this.lineWeight /= 1.021;
			this.size *= 1.01;
		}
	}
}

function superCurve(x, y, s1, s2, a1, a2, seed, oct_value, nValues, uValues) {
	let nx = x,
		ny = y,
		octaves = oct_value,
		dx,
		dy;

	[0, 1, 1].forEach((_, i) => {
		dx = oct(nx, ny, s1, i, octaves);
		dy = oct(nx, ny, s2, i + 2, octaves);
		nx += dx * a1;
		ny += dy * a2;
	});

	let u = map(oct(nx, ny, s1, 0, octaves), -nValues[0], nValues[1], -uValues[0], uValues[1], true);
	let v = map(oct(nx, ny, s2, 1, octaves), -nValues[2], nValues[3], -uValues[2], -uValues[3], true);

	return createVector(u, v);
}
