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
		this.reentryOffsetX = (min(width, height) * 0.001) / width;
		this.reentryOffsetY = (min(width, height) * 0.001) / height;
		this.wrapPaddingMultiplier = 0.8; //! or 0.5

		// Pre-calculate bounds
		this.minBoundX = (this.xMin - this.wrapPaddingX) * width;
		this.maxBoundX = (this.xMax + this.wrapPaddingX) * width;
		this.minBoundY = (this.yMin - this.wrapPaddingY) * height;
		this.maxBoundY = (this.yMax + this.wrapPaddingY) * height;

		// Precompute rotation sin/cos once (rseed/nseed are constant for this mover)
		const inputRot = (rseed * 0.000137 + nseed * 0.000024) % TAU;
		this._rotSin = Math.sin(inputRot);
		this._rotCos = Math.cos(inputRot);
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
			this.nseed,
			width / 2,
			height / 2,
			this._rotSin,
			this._rotCos,
		);

		// Update position with slight randomization
		this.xRandDivider = 0.046;
		this.yRandDivider = 0.046;
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

function superCurve(x, y, scl1, scl2, scl3, sclOff1, sclOff2, sclOff3, amplitude1, amplitude2, xMin, yMin, xMax, yMax, rseed, nseed, centerX, centerY, sinIn, cosIn) {
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
		octave = 1,
		a1 = amplitude1,
		a2 = amplitude2;

	// Precompute repeated scale * scaleOffset and scale factors
	const s1o1 = scale1 * scaleOffset1,
		s2o2 = scale2 * scaleOffset2,
		s3o3 = scale3 * scaleOffset3,
		scale1_13 = scale1 * 1.3,
		scale2_13 = scale2 * 1.3,
		scale1_05 = scale1 * 0.5,
		scale2_05 = scale2 * 0.5,
		scale1_08 = scale1 * 0.8,
		scale2_08 = scale2 * 0.8,
		a1_06 = a1 * 0.6,
		a2_06 = a2 * 0.6,
		a1_04 = a1 * 0.4,
		a2_04 = a2 * 0.4,
		a1_03 = a1 * 0.3,
		a2_03 = a2 * 0.3;

	// Rotate inputs by a stable seed-based angle around composition center to avoid persistent 45° bias
	const cx = centerX ?? width / 2;
	const cy = centerY ?? height / 2;
	if (sinIn === undefined) {
		const inputRot = (rseed * 0.000137 + nseed * 0.000024) % TAU;
		sinIn = sin(inputRot);
		cosIn = cos(inputRot);
	}
	const rx = nx - cx;
	const ry = ny - cy;
	nx = cosIn * rx - sinIn * ry + cx;
	ny = sinIn * rx + cosIn * ry + cy;

	// Enhanced multi-layer octave calculations with cross-coupling and varied scales
	// Layer 1: Primary flow with cross-coupling
	dx = oct(nx, ny, scale1, 0, octave);
	dy = oct(ny, nx, scale2, 2, octave); // Swapped coordinates for cross-coupling
	nx += dx * a1;
	ny += dy * a2;

	// Layer 2: Secondary flow with different scales and offsets
	const mx1 = nx * 0.7 + ny * 0.3,
		my1 = ny * 0.7 + nx * 0.3;
	dx = oct(mx1, my1, scale1_13, 4, octave);
	dy = oct(my1, mx1, scale2_13, 5, octave);
	nx += dx * a1_06;
	ny += dy * a2_06;

	// Layer 3: Fine detail layer with cross-coupling
	dx = oct(nx, ny, scale1_05, 6, octave);
	dy = oct(ny, nx, scale2_05, 7, octave);
	nx += dx * a1_04;
	ny += dy * a2_04;

	// Layer 4: Rotational component using mixed coordinates
	const rotAngle = oct(nx * 0.5, ny * 0.5, scale3, 8, octave) * PI,
		crot = cos(rotAngle),
		srot = sin(rotAngle),
		rotX = crot * nx - srot * ny,
		rotY = srot * nx + crot * ny;
	dx = oct(rotX, rotY, scale1_08, 9, octave);
	dy = oct(rotY, rotX, scale2_08, 10, octave);
	nx += dx * a1_03;
	ny += dy * a2_03;

	// Enhanced sine/cosine with cross-coupling and mixed scales
	un = sin(nx * s1o1 + ny * (s2o2 * 0.5) + rseed) + cos(nx * s2o2 + ny * (s1o1 * 0.5) + rseed) - sin(nx * s3o3 + ny * (s1o1 * 0.3) + rseed) + oct(ny * s1o1, nx * s2o2, 0.5, 11, octave) * 0.5;

	vn = cos(ny * s1o1 + nx * (s2o2 * 0.5) + rseed) + sin(ny * s2o2 + nx * (s1o1 * 0.5) + rseed) - cos(ny * s3o3 + nx * (s1o1 * 0.3) + rseed) + oct(nx * s2o2, ny * s1o1, 0.5, 11, octave) * 0.5;

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
	const mapIn = -0.000000025,
		mapOut = 0.000000025;
	let maxU = map(oct(ny * s1o1 + nx * (s2o2 * 1.3) + rseed, ny * s2o2 + nx * (s1o1 * 1.3) + rseed, noiseScale1, 13, octave), mapIn, mapOut, -1, 1, true);
	let maxV = map(oct(nx * s2o2 + ny * (s1o1 * 1.3) + rseed, nx * s1o1 + ny * (s2o2 * 1.3) + rseed, noiseScale2, 14, octave), mapIn, mapOut, -1, 1, true);
	let minU = map(oct(ny * s3o3 + nx * (s1o1 * 1.4) + rseed, ny * s1o1 + nx * (s3o3 * 1.4) + rseed, noiseScale3, 15, octave), mapIn, mapOut, -1, 1, true);
	let minV = map(oct(nx * s1o1 + ny * (s3o3 * 1.4) + rseed, nx * s3o3 + ny * (s1o1 * 1.4) + rseed, noiseScale4, 16, octave), mapIn, mapOut, -1, 1, true);
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
	const xMinW = xMin * width,
		xMaxW = xMax * width,
		yMinH = yMin * height,
		yMaxH = yMax * height;
	let nxRangeMin = map(nx, xMinW, xMaxW, -1.5, -0.001);
	let nxRangeMax = map(nx, xMinW, xMaxW, 0.001, 1.5);
	let nyRangeMin = map(ny, yMinH, yMaxH, -1.5, -0.001);
	let nyRangeMax = map(ny, yMinH, yMaxH, 0.001, 1.5);

	// Cross-couple the mapping ranges for more intricate movement
	//! really interesting to change the multipliers here
	let uRangeMin = nxRangeMin * 10.7 + nyRangeMin * 100.3;
	let uRangeMax = nxRangeMax * 10.7 + nyRangeMax * 100.3;
	let vRangeMin = nyRangeMin * 10.7 + nxRangeMin * 100.3;
	let vRangeMax = nyRangeMax * 10.7 + nxRangeMax * 100.3;

	// Mix vn and un with cross-coupling
	let u = map(vn * 0.7 + un * 0.3, uRangeMin, uRangeMax, minU, maxU, true);
	let v = map(un * 0.7 + vn * 0.3, vRangeMin, vRangeMax, minV, maxV, true);

	//! Extroverted
	/* 	let u = map(vn, map(ny, xMin * width, xMax * width, -5.4, -0.0001), map(ny, xMin * width, xMax * width, 0.0001, 5.4), minU, maxU, true);
	let v = map(un, map(nx, yMin * height, yMax * height, -5.4, -0.0001), map(nx, yMin * height, yMax * height, 0.0001, 5.4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */
	// Apply ZZ with enhanced symmetry - transform both positive and negative values
	// Add subtle asymmetry to break directional bias

	//! really interesting to change the multipliers at the end here
	const zzU = ZZ(Math.abs(u), 35, 80, 0.0058),
		zzV = ZZ(Math.abs(v), 35, 80, 0.0058);

	//! to test the effect of the multipliers with zzPos and zzNeg
	/* 	let zzuMult = map(zzU, -1, 1, 0.000001, 1, true);
	let zzvMult = map(zzV, -1, 1, 0.000001, 1, true); */

	let zzuPos = map(zzU, -11, 11, minU, maxU, true) * 0.0001;
	let zzvPos = map(zzV, -11, 11, minV, maxV, true) * 0.001;
	let zzuNeg = map(zzU, -11, 11, minU, maxU, true) * 1; // Slight asymmetry
	let zzvNeg = map(zzV, -11, 11, minV, maxV, true) * 1;

	// Apply transformation preserving sign but with variation for both directions
	let zu = u < 0 ? zzuNeg : zzuPos;
	let zv = v < 0 ? zzvNeg : zzvPos;

	// Add final cross-coupling layer for more intricate movement
	let finalU = zu * 0.85 + zv * 0.15;
	let finalV = zv * 0.85 + zu * 0.15;

	//! PAGODA (below is noiseScale and scaleOffset)
	//! 2
	//! 0.001
	//! 2
	/* 	let zu = ZZ(u, 2.1, 5.5, 0.01) * MULTIPLIER;
	let zv = ZZ(v, 2.1, 5.5, 0.01) * MULTIPLIER; */

	let p = createVector(finalU, finalV);
	return p;
}
