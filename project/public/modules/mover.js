// Helper function to truncate multiplier calculations to 2 decimals

// Mover class that uses noise for movement
class Mover {
	constructor(x, y, noiseOffset = 0, multiplier = 1) {
		this.x = x;
		this.y = y;
		this.noiseOffset = noiseOffset;
		this.noiseStep = 0.01;
		this.multiplier = multiplier;
		this.scl1 = 0.00185;
		this.scl2 = 0.00185;
		this.amp1 = 1;
		this.amp2 = 1;
		this.noiseSpeed = 0.1;
		this.octave = 1;
		this.size = 1;
		//console.log(this.scl1, this.scl2, this.ang1, this.ang2);
	}

	update(frameCount) {
		// Use superCurve for movement
		if (frameCount > 1) {
			let movement = this.superCurve(
				this.x,
				this.y,
				this.scl1, // scale1
				this.scl2, // scale2
				this.amp1, // angle1
				this.amp2, // angle2
				1, // octaves
				this.noiseSpeed // noiseSpeed
			);

			this.x = truncateNoiseCoord(this.x + movement.x);
			this.y = truncateNoiseCoord(this.y + movement.y);
			this.noiseOffset += this.noiseStep;
		}
	}

	display(canvas) {
		canvas.noFill();
		canvas.noStroke();
		canvas.ellipse(this.x, this.y, this.size, this.size);
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

		let rangeA = [2, 3, 5];
		let rangeB = [1, 2, 3];

		let aValue = rangeA[Math.floor(random() * rangeA.length)];
		let bValue = rangeB[Math.floor(random() * rangeB.length)];

		let u = mapValue(un, -noiseSpeed, noiseSpeed, -aValue, bValue);
		let v = mapValue(vn, -noiseSpeed, noiseSpeed, -bValue, aValue);

		return {x: u, y: v};
	}
}
