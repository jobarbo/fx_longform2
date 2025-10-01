class Mover {
	constructor(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, preCalculatedPalette) {
		this.x = x;
		this.initX = x;
		this.y = y;
		this.initY = y;
		this.palette = preCalculatedPalette;
		this.colorIndex = this.palette.length - 1;
		this.colorDirection = -1; // 1 for forward, -1 for backward
		this.initAlpha = 100; // Set opacity
		this.a = this.initAlpha;
		this.currentColor = this.palette[this.colorIndex];
		this.s = random([0.75]) * MULTIPLIER;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.sclOffset1 = sclOffset1;
		this.sclOffset2 = sclOffset2;
		this.sclOffset3 = sclOffset3;
		this.amplitude1 = amplitude1;
		this.amplitude2 = amplitude2;
		this.rseed = rseed;
		this.nseed = nseed;
		this.xRandDivider = 0.01;
		this.yRandDivider = 0.01;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperOffset = 0.0;
		this.yRandSkipperOffset = 0.0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.isBordered = isBordered;
		this.hasBeenOutside = false;

		// Start from the last color (inverted progression)
		this.colorIndex = this.palette.length - 1;

		// Pre-calculate padding values
		this.wrapPaddingX = (min(width, height) * 0.05) / width;
		this.wrapPaddingY = ((min(width, height) * 0.05) / height) * ARTWORK_RATIO;
		this.reentryOffsetX = (min(width, height) * 0.01) / width;
		this.reentryOffsetY = (min(width, height) * 0.01) / height;
		this.wrapPaddingMultiplier = 1; //! or 0.5

		// Pre-calculate bounds
		this.minBoundX = (this.xMin - this.wrapPaddingX) * width;
		this.maxBoundX = (this.xMax + this.wrapPaddingX) * width;
		this.minBoundY = (this.yMin - this.wrapPaddingY) * height;
		this.maxBoundY = (this.yMax + this.wrapPaddingY) * height;
	}

	show(canvas = null) {
		// Get the drawing context - either from provided canvas or default
		const drawingCtx = canvas ? canvas.drawingContext : drawingContext;

		// Use the original color format that preserves vibrancy
		drawingCtx.fillStyle = `hsla(${this.currentColor.h}, ${this.currentColor.s}%, ${this.currentColor.l}%, ${this.a}%)`;
		drawingCtx.fillRect(this.x, this.y, this.s, this.s);
	}

	move(frameCount, maxFrames) {
		let p = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.scl3,
			this.sclOffset1,
			this.sclOffset2,
			this.sclOffset3,
			this.amplitude1,
			this.amplitude2,
			this.xMin,
			this.yMin,
			this.xMax,
			this.yMax,
			this.rseed,
			this.nseed
		);

		// Update position with slight randomization
		this.xRandDivider = 0.4;
		this.yRandDivider = 0.01;
		this.xRandSkipper = random(-this.xRandSkipperOffset, this.xRandSkipperOffset) * MULTIPLIER;
		this.yRandSkipper = random(-this.yRandSkipperOffset, this.yRandSkipperOffset) * MULTIPLIER;
		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		// Map frame progression to color index, inverted (last to first)
		let maxColorIndex = this.palette.length - 1;
		let mappedFrame = map(frameCount, 0, maxFrames / 1.25, maxColorIndex, 0, true);
		this.colorIndex = Math.floor(mappedFrame);

		this.currentColor = this.palette[this.colorIndex];

		if (this.isBordered) {
			// Wrap to opposite side with slight offset
			if (this.isOutside()) {
				this.hasBeenOutside = true;
			}
			if (this.x < this.minBoundX) {
				this.x = (this.xMax + this.wrapPaddingX * this.wrapPaddingMultiplier - random(0, this.reentryOffsetX)) * width;
			} else if (this.x > this.maxBoundX) {
				this.x = (this.xMin - this.wrapPaddingX * this.wrapPaddingMultiplier + random(0, this.reentryOffsetX)) * width;
			}

			if (this.y < this.minBoundY) {
				this.y = (this.yMax + this.wrapPaddingY * this.wrapPaddingMultiplier - random(0, this.reentryOffsetY)) * height;
			} else if (this.y > this.maxBoundY) {
				this.y = (this.yMin - this.wrapPaddingY * this.wrapPaddingMultiplier + random(0, this.reentryOffsetY)) * height;
			}
		} else {
			// Reset to initial position if not bordered
			if (this.isOutside()) {
				this.x = this.initX;
				this.y = this.initY;
			}
		}

		this.a = this.isOutside() ? 0 : this.initAlpha;
	}
	isOutside() {
		return this.x < this.minBoundX || this.x > this.maxBoundX || this.y < this.minBoundY || this.y > this.maxBoundY;
	}
}

function superCurve(x, y, scl1, scl2, scl3, sclOff1, sclOff2, sclOff3, amplitude1, amplitude2, xMin, yMin, xMax, yMax, rseed, nseed) {
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
		noiseScale3 = 1,
		noiseScale4 = 1,
		x_sine_scale = 1,
		y_sine_scale = 1,
		octave = 1,
		a1 = amplitude1,
		a2 = amplitude2;

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

	un = sin(nx * (scale1 * scaleOffset1) + rseed) + cos(nx * (scale2 * scaleOffset2) + rseed) - sin(nx * (scale3 * scaleOffset3) + rseed);
	vn = cos(ny * (scale1 * scaleOffset1) + rseed) + sin(ny * (scale2 * scaleOffset2) + rseed) - cos(ny * (scale3 * scaleOffset3) + rseed);

	//! sine x cos x oct
	/*
	let time = millis() * 0.000000001; // Introduce a time variable for dynamic movement
	let un =
		sin(y * scl1 * scaleOffset1 + time) +
		cos(y * scl2 * scaleOffset2 + time) +
		sin(y * scl2 * 1.05 + time) +
		oct(ny * scl1 * scaleOffset1 + time, nx * scl2 * scaleOffset2 + time, x_sine_scale, 2, octave);
	let vn =
		sin(x * scl1 * scaleOffset1 + time) +
		cos(x * scl2 * scaleOffset2 + time) -
		sin(x * scl2 * 1.05 + time) +
		oct(nx * scl2 * scaleOffset2 + time, ny * scl1 * scaleOffset1 + time, y_sine_scale, 3, octave);
	*/
	//! noise x SineCos
	/* un = noise(sin(nx * (scale1 * scaleOffset1) + rseed)) + noise(cos(nx * (scale2 * scaleOffset2) + rseed)) - noise(sin(nx * (scale3 * scaleOffset3) + rseed));
	vn = noise(cos(ny * (scale1 * scaleOffset1) + rseed)) + noise(sin(ny * (scale2 * scaleOffset2) + rseed)) - noise(cos(ny * (scale3 * scaleOffset3) + rseed)); */

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
	let maxU = map(oct(ny * (scale1 * scaleOffset1) + rseed, ny * (scale2 * scaleOffset2) + rseed, noiseScale1, 1, octave), -0.005, 0.005, -11, 11, true);
	let maxV = map(oct(nx * (scale2 * scaleOffset2) + rseed, nx * (scale1 * scaleOffset1) + rseed, noiseScale2, 2, octave), -0.005, 0.005, 0.25, 0.5, true);
	let minU = map(oct(ny * (scale3 * scaleOffset3) + rseed, ny * (scale1 * scaleOffset1) + rseed, noiseScale3, 0, octave), -0.005, 0.005, -11, 11, true);
	let minV = map(oct(nx * (scale1 * scaleOffset1) + rseed, nx * (scale3 * scaleOffset3) + rseed, noiseScale4, 3, octave), -0.005, 0.005, 0.0, 0.25, true);
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
	/* 	let maxU = 1;
	let maxV = 1;
	let minU = -1;
	let minV = -1; */

	//! Introverted
	//* higher max gives particles a more introverted movement
	let u = map(vn, map(nx, xMin * width, xMax * width, -1125.5, -0.0000001), map(nx, xMin * width, xMax * width, 0.0000001, 1125.5), minU, maxU, true);
	let v = map(un, map(ny, yMin * height, yMax * height, -1125.5, -0.0000001), map(ny, yMin * height, yMax * height, 0.0000001, 1125.5), minV, maxV, true);

	//! Extroverted
	/* 	let u = map(vn, map(ny, xMin * width, xMax * width, -5.4, -0.0001), map(ny, xMin * width, xMax * width, 0.0001, 5.4), minU, maxU, true);
	let v = map(un, map(nx, yMin * height, yMax * height, -5.4, -0.0001), map(nx, yMin * height, yMax * height, 0.0001, 5.4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */
	// Apply ZZ symmetrically - preserve sign but apply transformation to absolute value
	let zzu = map(ZZ(u, 35, 80, 0.08), -1, 1, minU, maxU, true);
	let zzv = map(ZZ(v, 35, 80, 0.2), -1, 1, minV, maxV, true);

	let zu = u < 0 ? -zzu : zzu;
	let zv = v < 0 ? -zzv : zzv;

	//! PAGODA (below is noiseScale and scaleOffset)
	//! 2
	//! 0.001
	//! 2
	/* 	let zu = ZZ(u, 2.1, 5.5, 0.01) * MULTIPLIER;
	let zv = ZZ(v, 2.1, 5.5, 0.01) * MULTIPLIER; */

	let p = createVector(zu, zv);
	return p;
}
