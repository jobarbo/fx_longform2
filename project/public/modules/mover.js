// Helper function to truncate multiplier calculations to 2 decimals
function truncateMultiplier(value) {
	return Math.round(value * 100) / 100;
}

// Mover class that uses noise for movement
class Mover {
	constructor(x, y, noiseOffset = 0, multiplier = 1) {
		this.x = x;
		this.y = y;
		this.noiseOffset = noiseOffset;
		this.noiseStep = 0.01;
		this.speed = 2;
		this.multiplier = multiplier;
		this.scl1 = truncateMultiplier(0.001 / this.multiplier, 14);
		this.scl2 = truncateMultiplier(0.001 / this.multiplier, 14);
		this.ang1 = truncateMultiplier(2 * this.multiplier);
		this.ang2 = truncateMultiplier(2 * this.multiplier);
		this.noiseSpeed = 0.5;
		this.octave = 1;
		console.log(this.scl1, this.scl2, this.ang1, this.ang2);
	}

	update() {
		// Use superCurve for movement
		let movement = this.superCurve(
			this.x,
			this.y,
			this.scl1, // scale1
			this.scl2, // scale2
			this.ang1, // angle1
			this.ang2, // angle2
			1, // octaves
			this.noiseSpeed // noiseSpeed
		);

		this.x += truncateMultiplier(movement.x * this.multiplier);
		this.y += truncateMultiplier(movement.y * this.multiplier);
		this.noiseOffset += this.noiseStep;
	}

	display(size = 10) {
		fill(0, 0, 100, 100);
		stroke(0, 0, 0, 100);
		strokeWeight(truncateMultiplier(1 * this.multiplier));
		ellipse(this.x, this.y, size, size);
	}

	// Get position for drawing lines between movers
	getPos() {
		return {x: this.x, y: this.y};
	}

	superCurve(x, y, scl1, scl2, ang1, ang2, octave, ns) {
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
}
