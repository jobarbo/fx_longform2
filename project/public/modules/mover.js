// Helper function to truncate multiplier calculations to 2 decimals

// Mover class that uses noise for movement
class Mover {
	constructor(x, y, noiseOffset = 0, multiplier = 1) {
		this.x = x;
		this.y = y;
		this.noiseOffset = noiseOffset;
		this.noiseStep = 0.01;
		this.multiplier = multiplier;
		this.scl1 = 0.00385;
		this.scl2 = 0.00385;
		this.amp1 = 1;
		this.amp2 = 1;
		this.noiseSpeed = 0.00000001;
		this.octave = 1;
		this.size = 120;
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
				this.noiseSpeed, // noiseSpeed
			);

			this.x = truncateNoiseCoord(this.x + movement.x);
			this.y = truncateNoiseCoord(this.y + movement.y);
			this.noiseOffset += this.noiseStep;
		}
	}

	display(canvas) {
		canvas.fill(random([35, 195, 220, 320]), random(40, 50), random([10, 25, 50, 60, 80, 80, 90, 90, 100, 100]), random(10, 100));
		canvas.noStroke();
		canvas.rect(this.x, this.y, this.size * random(0.1, 225), this.size / 15);
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

		let rangeA = [0, 0, 0];
		let rangeB = [0, 0, 0];

		let aValue = rangeA[Math.floor(random() * rangeA.length)];
		let bValue = rangeB[Math.floor(random() * rangeB.length)];

		let u = mapValue(un, -noiseSpeed, noiseSpeed, -aValue, bValue);
		let v = mapValue(vn, -noiseSpeed, noiseSpeed, -bValue, aValue);

		return {x: u, y: v};
	}
}
