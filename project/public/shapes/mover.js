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

		// Pre-calculate padding values - use global constant if available
		const wrapPaddingFactor = typeof WRAP_PADDING_FACTOR !== "undefined" ? WRAP_PADDING_FACTOR : 0.1;
		this.wrapPaddingX = (min(width, height) * wrapPaddingFactor) / width;
		this.wrapPaddingY = ((min(width, height) * wrapPaddingFactor) / height) * ARTWORK_RATIO;
		this.reentryOffsetX = (min(width, height) * 0.0025) / width;
		this.reentryOffsetY = (min(width, height) * 0.0025) / height;
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
		this.xRandDivider = 0.021;
		this.yRandDivider = 0.021;
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

	// Enhanced multi-layer octave calculations with cross-coupling and varied scales
	// Position-based bias correction to neutralize directional preference
	let biasCorrectionX = oct(ny * 0.01, nx * 0.01, 0.5, 19, octave) * 0.3;
	let biasCorrectionY = oct(nx * 0.01, ny * 0.01, 0.5, 20, octave) * 0.3;

	// Layer 1: Primary flow with cross-coupling and bias correction
	dx = oct(nx, ny, scale1, 0, octave) - biasCorrectionX;
	dy = oct(ny, nx, scale2, 2, octave) - biasCorrectionY; // Swapped coordinates for cross-coupling
	nx += dx * a1;
	ny += dy * a2;

	// Layer 2: Secondary flow with different scales and offsets
	dx = oct(nx * 0.7 + ny * 0.3, ny * 0.7 + nx * 0.3, scale1 * 1.3, 4, octave);
	dy = oct(ny * 0.7 + nx * 0.3, nx * 0.7 + ny * 0.3, scale2 * 1.3, 5, octave);
	nx += dx * a1 * 0.6;
	ny += dy * a2 * 0.6;

	// Layer 3: Fine detail layer with cross-coupling
	dx = oct(nx, ny, scale1 * 0.5, 6, octave);
	dy = oct(ny, nx, scale2 * 0.5, 7, octave);
	nx += dx * a1 * 0.4;
	ny += dy * a2 * 0.4;

	// Layer 4: Rotational component using mixed coordinates
	let rotAngle = oct(nx * 0.5, ny * 0.5, scale3, 8, octave) * PI;
	let rotX = cos(rotAngle) * nx - sin(rotAngle) * ny;
	let rotY = sin(rotAngle) * nx + cos(rotAngle) * ny;
	dx = oct(rotX, rotY, scale1 * 0.8, 9, octave);
	dy = oct(rotY, rotX, scale2 * 0.8, 10, octave);
	nx += dx * a1 * 0.3;
	ny += dy * a2 * 0.3;

	// Enhanced sine/cosine with cross-coupling and mixed scales
	un =
		sin(nx * (scale1 * scaleOffset1) + ny * (scale2 * scaleOffset2 * 0.5) + rseed) +
		cos(nx * (scale2 * scaleOffset2) + ny * (scale1 * scaleOffset1 * 0.5) + rseed) -
		sin(nx * (scale3 * scaleOffset3) + ny * (scale1 * scaleOffset1 * 0.3) + rseed) +
		oct(ny * (scale1 * scaleOffset1), nx * (scale2 * scaleOffset2), 0.5, 11, octave) * 0.5;

	vn =
		cos(ny * (scale1 * scaleOffset1) + nx * (scale2 * scaleOffset2 * 0.5) + rseed) +
		sin(ny * (scale2 * scaleOffset2) + nx * (scale1 * scaleOffset1 * 0.5) + rseed) -
		cos(ny * (scale3 * scaleOffset3) + nx * (scale1 * scaleOffset1 * 0.3) + rseed) +
		oct(nx * (scale2 * scaleOffset2), ny * (scale1 * scaleOffset1), 0.5, 11, octave) * 0.5;

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

	//! Enhanced pNoise x SineCos with cross-coupling and varied noise indices
	let maxU = map(
		oct(ny * (scale1 * scaleOffset1) + nx * (scale2 * scaleOffset2 * 0.3) + rseed, ny * (scale2 * scaleOffset2) + nx * (scale1 * scaleOffset1 * 0.3) + rseed, noiseScale1, 13, octave),
		-0.0000025,
		0.000025,
		-1,
		1,
		true
	);
	let maxV = map(
		oct(nx * (scale2 * scaleOffset2) + ny * (scale1 * scaleOffset1 * 0.3) + rseed, nx * (scale1 * scaleOffset1) + ny * (scale2 * scaleOffset2 * 0.3) + rseed, noiseScale2, 14, octave),
		-0.0000025,
		0.000025,
		-1,
		1,
		true
	);
	let minU = map(
		oct(ny * (scale3 * scaleOffset3) + nx * (scale1 * scaleOffset1 * 0.4) + rseed, ny * (scale1 * scaleOffset1) + nx * (scale3 * scaleOffset3 * 0.4) + rseed, noiseScale3, 15, octave),
		-0.0000025,
		0.000025,
		-1,
		1,
		true
	);
	let minV = map(
		oct(nx * (scale1 * scaleOffset1) + ny * (scale3 * scaleOffset3 * 0.4) + rseed, nx * (scale3 * scaleOffset3) + ny * (scale1 * scaleOffset1 * 0.4) + rseed, noiseScale4, 16, octave),
		-0.0000025,
		0.000025,
		-1,
		1,
		true
	);
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

	//! Enhanced introverted with cross-coupling and dynamic range variation
	//* Mix both nx/ny and ny/nx for more complex mapping
	let nxRangeMin = map(nx, xMin * width, xMax * width, -1.5, -0.001);
	let nxRangeMax = map(nx, xMin * width, xMax * width, 0.001, 1.5);
	let nyRangeMin = map(ny, yMin * height, yMax * height, -1.5, -0.001);
	let nyRangeMax = map(ny, yMin * height, yMax * height, 0.001, 1.5);

	// Position-based modulation to counter directional bias
	// Create alternating zones that reverse the bias
	let posModX = sin((nx / width) * PI * 2 + rseed * 0.1) * 0.2;
	let posModY = cos((ny / height) * PI * 2 + rseed * 0.1) * 0.2;

	// Dynamic mixing ratios that vary based on position to break bias
	let mixRatio1 = 0.5 + posModX; // Varies between 0.3 and 0.7
	let mixRatio2 = 0.5 + posModY; // Varies between 0.3 and 0.7
	let mixRatio3 = 0.5 - posModX; // Counter-balancing
	let mixRatio4 = 0.5 - posModY; // Counter-balancing

	// Cross-couple the mapping ranges with position-based variation
	let uRangeMin = nxRangeMin * mixRatio1 + nyRangeMin * mixRatio3;
	let uRangeMax = nxRangeMax * mixRatio1 + nyRangeMax * mixRatio3;
	let vRangeMin = nyRangeMin * mixRatio2 + nxRangeMin * mixRatio4;
	let vRangeMax = nyRangeMax * mixRatio2 + nxRangeMax * mixRatio4;

	// Mix vn and un with dynamic cross-coupling to break directional bias
	let u = map(vn * mixRatio1 + un * mixRatio3, uRangeMin, uRangeMax, minU, maxU, true);
	let v = map(un * mixRatio2 + vn * mixRatio4, vRangeMin, vRangeMax, minV, maxV, true);

	//! Extroverted
	/* 	let u = map(vn, map(ny, xMin * width, xMax * width, -5.4, -0.0001), map(ny, xMin * width, xMax * width, 0.0001, 5.4), minU, maxU, true);
	let v = map(un, map(nx, yMin * height, yMax * height, -5.4, -0.0001), map(nx, yMin * height, yMax * height, 0.0001, 5.4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */
	// Apply ZZ with enhanced symmetry - transform both positive and negative values
	// Add subtle asymmetry to break directional bias
	let zzuPos = map(ZZ(Math.abs(u), 35, 80, 0.018), -11, 11, minU, maxU, true);
	let zzvPos = map(ZZ(Math.abs(v), 35, 80, 0.018), -11, 11, minV, maxV, true);
	let zzuNeg = map(ZZ(Math.abs(u), 35, 80, 0.018), -11, 11, -minU, -maxU, true) * 0.95; // Slight asymmetry
	let zzvNeg = map(ZZ(Math.abs(v), 35, 80, 0.018), -11, 11, -minV, -maxV, true) * 0.95;

	// Apply transformation preserving sign but with variation for both directions
	let zu = u < 0 ? -zzuNeg : zzuPos;
	let zv = v < 0 ? -zzvNeg : zzvPos;

	// Position-based final cross-coupling to neutralize directional bias
	// Use noise-based modulation to create balanced mixing
	let finalMixX = 0.5 + oct(nx * 0.001, ny * 0.001, 1, 17, octave) * 0.3; // Varies 0.2-0.8
	let finalMixY = 0.5 + oct(ny * 0.001, nx * 0.001, 1, 18, octave) * 0.3; // Varies 0.2-0.8

	// Balanced cross-coupling that adapts to position
	let finalU = zu * finalMixX + zv * (1 - finalMixX);
	let finalV = zv * finalMixY + zu * (1 - finalMixY);

	// Add counter-balancing term based on position to neutralize bottom-right bias
	// Use a more subtle approach that creates balanced zones
	let counterX = sin((nx / width) * PI * 4 + rseed) * 0.05;
	let counterY = cos((ny / height) * PI * 4 + rseed) * 0.05;

	// Additional noise-based counter to break any remaining bias
	let noiseCounterX = oct(nx * 0.002, ny * 0.002, 0.3, 21, octave) * 0.03;
	let noiseCounterY = oct(ny * 0.002, nx * 0.002, 0.3, 22, octave) * 0.03;

	finalU += counterX + noiseCounterX;
	finalV += counterY + noiseCounterY;

	//! PAGODA (below is noiseScale and scaleOffset)
	//! 2
	//! 0.001
	//! 2
	/* 	let zu = ZZ(u, 2.1, 5.5, 0.01) * MULTIPLIER;
	let zv = ZZ(v, 2.1, 5.5, 0.01) * MULTIPLIER; */

	let p = createVector(finalU, finalV);
	return p;
}
