// Piecewise speed → value knots [speed, output]. Linear within each segment, not one global map().
// Y-values are tuned for FELT_REFERENCE_PARTICLE_SIZE; scaled at runtime by CURRENT_PARAMS.particleSize.
const FELT_REFERENCE_PARTICLE_SIZE = CURRENT_PARAMS.particleSize ?? 0.75;

const FELT_SKIPPER_KNOTS = [
	[0, 1.5],
	[0.0005, 1.5],
	[0.0015, 0.0],
	[0.005, 1.15],
	[0.015, 0.0],
];
const FELT_SIZE_KNOTS = [
	[0, FELT_REFERENCE_PARTICLE_SIZE * 0.12],
	[0.00005, FELT_REFERENCE_PARTICLE_SIZE * 0.12],
	[0.000055, FELT_REFERENCE_PARTICLE_SIZE * 0.4],
	[0.00006, FELT_REFERENCE_PARTICLE_SIZE * 0.16],
	[0.0005, FELT_REFERENCE_PARTICLE_SIZE * 0.15],
	[0.0015, FELT_REFERENCE_PARTICLE_SIZE * 0.4],
	[0.005, FELT_REFERENCE_PARTICLE_SIZE * 0.3],
	[0.015, FELT_REFERENCE_PARTICLE_SIZE * 0.4],
	[0.0151, FELT_REFERENCE_PARTICLE_SIZE],
];
const FELT_JITTER_KNOTS = [
	[0, 0.5],
	[0.0015, 0.5],
	[0.005, 1.0],
	[0.015, 0.0],
];

function feltParticleScale() {
	return (CURRENT_PARAMS.particleSize ?? FELT_REFERENCE_PARTICLE_SIZE) / FELT_REFERENCE_PARTICLE_SIZE;
}

function mapPiecewise(value, knots, yScale = 1) {
	const v = constrain(value, knots[0][0], knots[knots.length - 1][0]);
	for (let i = 0; i < knots.length - 1; i++) {
		const [x0, y0] = knots[i];
		const [x1, y1] = knots[i + 1];
		if (v <= x1) return map(v, x0, x1, y0, y1, true) * yScale;
	}
	return knots[knots.length - 1][1] * yScale;
}

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
		this.s = (CURRENT_PARAMS.particleSize ?? 0.75) * MULTIPLIER;
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
		// Base randomization dividers are driven by UI speeds (horizontal/vertical)
		this.xRandDivider = CURRENT_PARAMS.horizontalSpeed ?? 0.046;
		this.yRandDivider = CURRENT_PARAMS.verticalSpeed ?? 0.046;
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
		this.wrapPaddingY = ((min(width, height) * wrapPaddingFactor) / height) * ARTWORK_ASPECT;
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

	attachFace(face) {
		this.face = face;
		const local = face.unproject(this.x, this.y);
		this.localX = local.x;
		this.localY = local.y;
		this.rseed = face.field.seed;
		this.nseed = face.field.noiseSeed;
		this.scl1 *= face.field.scale[0];
		this.scl2 *= face.field.scale[1];
		this.scl3 *= face.field.scale[2];
		this.amplitude1 *= face.field.amplitude[0];
		this.amplitude2 *= face.field.amplitude[1];
		const rotation = (this.rseed * 0.000137 + this.nseed * 0.000024) % TAU;
		this._rotSin = Math.sin(rotation);
		this._rotCos = Math.cos(rotation);
	}

	show(canvas = null) {
		if (this.landscape && !this.landscape.contains(this.x, this.y)) return;
		const ctx = canvas ? canvas.drawingContext : drawingContext;
		const ink = this.currentColor;
		ctx.fillStyle = `hsla(${ink.h}, ${ink.s}%, ${ink.l}%, ${this.a}%)`;
		const size = this.s * (this.landscape ? 0.4 + this.landscape.depth * 0.6 : 1);
		if (this.face) {
			// The renderer has installed this face's clip and local-to-world transform.
			const face = this.face;
			const localSize = size / face.projectedScale;
			ctx.fillRect(this.localX, this.localY,
				Math.min(localSize, face.localWidth - this.localX),
				Math.min(localSize, face.localHeight - this.localY));
		} else {
			ctx.fillRect(this.x, this.y, size, size);
		}
	}

	move(frameCount, maxFrames) {
		const p = superCurve(
			this.face ? this.localX : this.x,
			this.face ? this.localY : this.y,
			this.scl1,
			this.scl2,
			this.scl3,
			this.sclOffset1,
			this.sclOffset2,
			this.sclOffset3,
			this.amplitude1,
			this.amplitude2,
			this.face ? 0 : this.xMin,
			this.face ? 0 : this.yMin,
			this.face ? 1 : this.xMax,
			this.face ? 1 : this.yMax,
			this.rseed,
			this.nseed,
			this.face ? this.face.localWidth / 2 : width / 2,
			this.face ? this.face.localHeight / 2 : height / 2,
			this._rotSin,
			this._rotCos,
			this.face?.localWidth,
			this.face?.localHeight,
			this.face?.field,
		);

		this._applyFieldDisplacement(p);
		this._updateColor(frameCount, maxFrames);
		this._handleBounds();
		this.a = this.isOutside() ? 0 : this.initAlpha;
	}

	_applyFieldDisplacement(p) {
		if (this.landscape && !this.face) {
			const depthScale = 0.25 + this.landscape.depth * 0.75;
			p.x *= depthScale;
			p.y *= depthScale;
		}
		const speed = abs(p.x + p.y);
		const speedX = abs(p.x);
		const speedY = abs(p.y);

		// Multi-stage felt → soft → transition → flow (piecewise, not one linear map)
		const feltScale = feltParticleScale();
		this.xRandSkipperOffset = mapPiecewise(speedX, FELT_SKIPPER_KNOTS, feltScale);
		this.yRandSkipperOffset = mapPiecewise(speedY, FELT_SKIPPER_KNOTS, feltScale);
		// ZZ line patterns stay at reference size; felt/slow paths keep the speed curve.
		this.s = p._zzLine ? FELT_REFERENCE_PARTICLE_SIZE * feltScale * MULTIPLIER : mapPiecewise(speed, FELT_SIZE_KNOTS, feltScale) * MULTIPLIER;

		const jitterStrength = mapPiecewise(speed, FELT_JITTER_KNOTS);
		if (jitterStrength > 0) {
			const rng = this.face ? this.face.field.random : random;
			this.xRandSkipper = (rng() * 2 - 1) * this.xRandSkipperOffset * MULTIPLIER * jitterStrength;
			this.yRandSkipper = (rng() * 2 - 1) * this.yRandSkipperOffset * MULTIPLIER * jitterStrength;
		} else {
			this.xRandSkipper = 0;
			this.yRandSkipper = 0;
		}

		const dx = (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		const dy = (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;
		if (this.face) {
			this.localX += dx;
			this.localY += dy;
		} else {
			this.x += dx;
			this.y += dy;
		}
	}

	_updateColor(frameCount, maxFrames) {
		if (this.landscape) {
			this.currentColor = this.landscape.ink;
			return;
		}
		const maxColorIndex = this.palette.length - 1;
		const mappedFrame = map(frameCount, 0, maxFrames / 1.25, maxColorIndex, 0, true);
		this.colorIndex = Math.floor(mappedFrame);
		this.currentColor = this.palette[this.colorIndex];
	}

	_handleBounds() {
		if (this.face) {
			const {localWidth: w, localHeight: h} = this.face;
			// Wrap inside this surface only; never cross a building edge onto another face.
			this.localX = ((this.localX % w) + w) % w;
			this.localY = ((this.localY % h) + h) % h;
			const projected = this.face.project(this.localX, this.localY);
			this.x = projected.x;
			this.y = projected.y;
			return;
		}
		if (this.landscape) {
			if (!this.landscape.contains(this.x, this.y)) {
				this.x = this.initX;
				this.y = this.initY;
			}
			return;
		}
		if (this.isBordered) {
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
		} else if (this.isOutside()) {
			this.x = this.initX;
			this.y = this.initY;
		}
	}

	isOutside() {
		return this.x < this.minBoundX || this.x > this.maxBoundX || this.y < this.minBoundY || this.y > this.maxBoundY;
	}
}

function superCurve(x, y, scl1, scl2, scl3, sclOff1, sclOff2, sclOff3, amplitude1, amplitude2, xMin, yMin, xMax, yMax, rseed, nseed, centerX, centerY, sinIn, cosIn, fieldWidth = width, fieldHeight = height, field = null) {
	const params = field?.params ?? CURRENT_PARAMS;
	const sampleOct = field?.oct ?? oct;
	let nx = x,
		ny = y,
		scale1 = scl1,
		scale2 = scl2,
		scale3 = scl3,
		scaleOffset1 = sclOff1,
		scaleOffset2 = sclOff2,
		scaleOffset3 = sclOff3,
		noiseScale1 = params.noiseScale1 ?? 2,
		noiseScale2 = params.noiseScale2 ?? 1,
		noiseScale3 = params.noiseScale3 ?? 2,
		noiseScale4 = params.noiseScale4 ?? 3,
		octave = params.octave ?? 1,
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
		a1_06 = a1 * 10.6,
		a2_06 = a2 * 10.6,
		a1_04 = a1 * 10.4,
		a2_04 = a2 * 10.4,
		a1_03 = a1 * 10.3,
		a2_03 = a2 * params.swirlFactor;

	// Rotate inputs by a stable seed-based angle around composition center to avoid persistent 45° bias
	const cx = centerX ?? fieldWidth / 2;
	const cy = centerY ?? fieldHeight / 2;
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
	let dx = sampleOct(nx, ny, scale1, 0, octave);
	let dy = sampleOct(ny, nx, scale2, 2, octave); // Swapped coordinates for cross-coupling
	nx += dx * a1;
	ny += dy * a2;

	// Layer 2: Secondary flow with different scales and offsets
	const mx1 = nx * 0.7 + ny * 0.3,
		my1 = ny * 0.7 + nx * 0.3;
	dx = sampleOct(mx1, my1, scale1_13, 4, octave);
	dy = sampleOct(my1, mx1, scale2_13, 5, octave);
	nx += dx * a1_06;
	ny += dy * a2_06;

	// Layer 3: Fine detail layer with cross-coupling
	dx = sampleOct(nx, ny, scale1_05, 6, octave);
	dy = sampleOct(ny, nx, scale2_05, 7, octave);
	nx += dx * a1_04;
	ny += dy * a2_04;

	// Layer 4: Rotational component using mixed coordinates
	const rotAngle = sampleOct(nx * 0.5, ny * 0.5, scale3, 8, octave) * PI,
		crot = cos(rotAngle),
		srot = sin(rotAngle),
		rotX = crot * nx - srot * ny,
		rotY = srot * nx + crot * ny;
	dx = sampleOct(rotX, rotY, scale1_08, 9, octave);
	dy = sampleOct(rotY, rotX, scale2_08, 10, octave);
	nx += dx * a1_03;
	ny += dy * a2_03;

	// Enhanced sine/cosine with cross-coupling and mixed scales
	const un = sin(nx * s1o1 + ny * (s2o2 * 0.5) + rseed) + cos(nx * s2o2 + ny * (s1o1 * 0.5) + rseed) - sin(nx * s3o3 + ny * (s1o1 * 0.3) + rseed) + sampleOct(ny * s1o1, nx * s2o2, 0.5, 11, octave) * 0.5;

	const vn = cos(ny * s1o1 + nx * (s2o2 * 0.5) + rseed) + sin(ny * s2o2 + nx * (s1o1 * 0.5) + rseed) - cos(ny * s3o3 + nx * (s1o1 * 0.3) + rseed) + sampleOct(nx * s2o2, ny * s1o1, 0.5, 11, octave) * 0.5;

	//! sine x cos x oct
	/*
	let time = millis() * 0.000000001; // Introduce a time variable for dynamic movement
	let un =
		sin(y * scl1 * scaleOffset1 + time) +
		cos(y * scl2 * scaleOffset2 + time) +
		sin(y * scl2 * 1.05 + time) +
		sampleOct(ny * scl1 * scaleOffset1 + time, nx * scl2 * scaleOffset2 + time, x_sine_scale, 2, octave);
	let vn =
		sin(x * scl1 * scaleOffset1 + time) +
		cos(x * scl2 * scaleOffset2 + time) -
		sin(x * scl2 * 1.05 + time) +
		sampleOct(nx * scl2 * scaleOffset2 + time, ny * scl1 * scaleOffset1 + time, y_sine_scale, 3, octave);
	*/
	//! noise x SineCos
	/* un = noise(sin(nx * (scale1 * scaleOffset1) + rseed)) + noise(cos(nx * (scale2 * scaleOffset2) + rseed)) - noise(sin(nx * (scale3 * scaleOffset3) + rseed));
	vn = noise(cos(ny * (scale1 * scaleOffset1) + rseed)) + noise(sin(ny * (scale2 * scaleOffset2) + rseed)) - noise(cos(ny * (scale3 * scaleOffset3) + rseed)); */

	//! center focused introverted
	/* let maxU = map(ny, xMin * fieldWidth, xMax * fieldWidth, 3, -3, true);
	let maxV = map(nx, yMin * fieldHeight, yMax * fieldHeight, 3, -3, true);
	let minU = map(ny, xMin * fieldWidth, xMax * fieldWidth, -3, 3, true);
	let minV = map(nx, yMin * fieldHeight, yMax * fieldHeight, -3, 3, true); */

	//! center focused extroverted
	/* 	let maxU = map(nx, xMin * fieldWidth, xMax * fieldWidth, 3, -3, true);
	let maxV = map(ny, yMin * fieldHeight, yMax * fieldHeight, 3, -3, true);
	let minU = map(nx, xMin * fieldWidth, xMax * fieldWidth, -3, 3, true);
	let minV = map(ny, yMin * fieldHeight, yMax * fieldHeight, -3, 3, true); */

	//! Enhanced pNoise x SineCos with cross-coupling and varied noise indices
	const mapIn = -0.000000025,
		mapOut = 0.000000025;
	let maxU = map(sampleOct(ny * s1o1 + nx * (s2o2 * 1.3) + rseed, ny * s2o2 + nx * (s1o1 * 1.3) + rseed, noiseScale1, 13, octave), mapIn, mapOut, -1, 1, true);
	let maxV = map(sampleOct(nx * s2o2 + ny * (s1o1 * 1.3) + rseed, nx * s1o1 + ny * (s2o2 * 1.3) + rseed, noiseScale2, 14, octave), mapIn, mapOut, -1, 1, true);
	let minU = map(sampleOct(ny * s3o3 + nx * (s1o1 * 1.4) + rseed, ny * s1o1 + nx * (s3o3 * 1.4) + rseed, noiseScale3, 15, octave), mapIn, mapOut, -1, 1, true);
	let minV = map(sampleOct(nx * s1o1 + ny * (s3o3 * 1.4) + rseed, nx * s3o3 + ny * (s1o1 * 1.4) + rseed, noiseScale4, 16, octave), mapIn, mapOut, -1, 1, true);
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
	const xMinW = xMin * fieldWidth,
		xMaxW = xMax * fieldWidth,
		yMinH = yMin * fieldHeight,
		yMaxH = yMax * fieldHeight;
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
	/* 	let u = map(vn, map(ny, xMin * fieldWidth, xMax * fieldWidth, -5.4, -0.0001), map(ny, xMin * fieldWidth, xMax * fieldWidth, 0.0001, 5.4), minU, maxU, true);
	let v = map(un, map(nx, yMin * fieldHeight, yMax * fieldHeight, -5.4, -0.0001), map(nx, yMin * fieldHeight, yMax * fieldHeight, 0.0001, 5.4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */
	// Apply ZZ with enhanced symmetry - transform both positive and negative values
	// Add subtle asymmetry to break directional bias

	//! really interesting to change the multipliers at the end here
	const zzU = ZZ(Math.abs(u), 35, 300, params.horizontalZigzagStrength),
		zzV = ZZ(Math.abs(v), 35, 300, params.verticalZigzagStrength);

	//! to test the effect of the multipliers with zzPos and zzNeg
	/* 	let zzuMult = map(zzU, -1, 1, 0.000001, 1, true);
	let zzvMult = map(zzV, -1, 1, 0.000001, 1, true); */

	// Pattern intensity controls (UI-driven). Lower numeric value = stronger intensity.
	const hPattern = params.horizontalPatternIntensity ?? 10; // "normal"
	const vPattern = params.verticalPatternIntensity ?? 10; // "normal"

	let zzuPos = map(zzU, -hPattern, hPattern, minU, maxU, true) * 0.0001;
	let zzvPos = map(zzV, -vPattern, vPattern, minV, maxV, true) * 0.001;
	let zzuNeg = map(zzU, -hPattern, hPattern, minU, maxU, true) * 1; // Slight asymmetry retained via base values
	let zzvNeg = map(zzV, -vPattern, vPattern, minV, maxV, true) * 1;

	// User-controlled thresholds for when to use inner vs outer flow
	const innerThreshold = params.innerFlowThreshold ?? 0;
	const outerThreshold = params.outerFlowThreshold ?? 0;

	// Apply transformation preserving sign but with variation for both directions.
	// Neg path = full-strength ZZ (visible line patterns); pos path = tiny felt step.
	const zzLineU = u < innerThreshold;
	const zzLineV = v < outerThreshold;
	let zu = zzLineU ? zzuNeg : zzuPos;
	let zv = zzLineV ? zzvNeg : zzvPos;

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
	p._zzLine = zzLineU || zzLineV;
	return p;
}
