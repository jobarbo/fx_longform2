class Mover {
	constructor(x, y, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, amplitude1, amplitude2, xMin, xMax, yMin, yMax, isBordered, rseed, nseed, preCalculatedPalette) {
		this.cfg = ACTIVE_CONFIG;
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
		// Scaled by pixel density so the particles keep the same visual weight — see
		// particleDensityScale() in library/utils/utils.js for why the raw size does not.
		const baseSize = this.cfg.render.particleSize;
		const densityScale = typeof particleDensityScale === "function" ? particleDensityScale() : 1;
		this.s = random([baseSize]) * CONFIG_MULTIPLIER * densityScale;
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
		this.curve = {
			scale1: scl1,
			scale2: scl2,
			scale3: scl3,
			scaleOffset1: sclOffset1,
			scaleOffset2: sclOffset2,
			scaleOffset3: sclOffset3,
			noiseScale: this.cfg.noise.noiseScale,
			xMin,
			yMin,
			xMax,
			yMax,
			rseed,
			nseed,
		};
		this.xRandDivider = this.cfg.motion.xDiv;
		this.yRandDivider = this.cfg.motion.yDiv;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperOffset = this.cfg.motion.skipper;
		this.yRandSkipperOffset = this.cfg.motion.skipper;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.isBordered = isBordered;
		this.hasBeenOutside = false;

		// Start from the last color (inverted progression)
		this.colorIndex = this.palette.length - 1;

		// Pre-calculate padding values
		const [wrapFactorX, wrapFactorY] = this.cfg.wrap.padding;
		this.wrapPaddingX = (min(width, height) * wrapFactorX) / width;
		this.wrapPaddingY = WRAP_Y_MODES[this.cfg.wrap.yMode](this.wrapPaddingX, wrapFactorY);
		this.reentryOffsetX = (min(width, height) * reentryFactor(this.cfg.wrap.reentry)) / width;
		this.reentryOffsetY = (min(width, height) * reentryFactor(this.cfg.wrap.reentry)) / height;
		this.wrapPaddingMultiplier = this.cfg.wrap.multiplier;

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
		let p = superCurve(this.x, this.y, this.amplitude1, this.amplitude2, this.curve, this.cfg);

		// Update position with slight randomization
		const motion = this.cfg.motion;
		if (motion.skipper) {
			this.xRandSkipperOffset = map(frameCount, 0, maxFrames * motion.skipperFrames, motion.skipper, 0, true);
			this.yRandSkipperOffset = map(frameCount, 0, maxFrames * motion.skipperFrames, motion.skipper, 0, true);
		}
		this.xRandSkipper = random(-this.xRandSkipperOffset, this.xRandSkipperOffset) * CONFIG_MULTIPLIER;
		this.yRandSkipper = random(-this.yRandSkipperOffset, this.yRandSkipperOffset) * CONFIG_MULTIPLIER;
		if (motion.reentryDecay) {
			this.reentryOffsetX = map(frameCount, 0, maxFrames / 1.01, this.reentryOffsetX, 0.001);
			this.reentryOffsetY = map(frameCount, 0, maxFrames / 1.01, this.reentryOffsetY, 0.001);
		}
		this.x += (p.x * CONFIG_MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * CONFIG_MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		// Map frame progression to color index, inverted (last to first)
		let maxColorIndex = this.palette.length - 1;
		let mappedFrame = map(frameCount, 0, maxFrames / motion.colorDivider, maxColorIndex, 0, true);
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

// ============================================================================
// WRAP HELPERS
// ============================================================================

const WRAP_Y_MODES = {
	ratio: (padX, factorY) => ((min(width, height) * factorY) / height) * ARTWORK_RATIO,
	plain: (padX, factorY) => (min(width, height) * factorY) / height,
	fromX: (padX) => padX * ARTWORK_RATIO,
};

function reentryFactor(reentry) {
	return Array.isArray(reentry) ? random(reentry[0], reentry[1]) : reentry;
}

// ============================================================================
// SUPERCURVE MODES
// ============================================================================

//! un / vn
const FLOW_MODES = {
	//! sine x cos
	sine: (nx, ny, s) => [
		sin(nx * (s.scale1 * s.scaleOffset1) + s.rseed) + cos(nx * (s.scale2 * s.scaleOffset2) + s.rseed) - sin(nx * (s.scale3 * s.scaleOffset3) + s.rseed),
		cos(ny * (s.scale1 * s.scaleOffset1) + s.rseed) + sin(ny * (s.scale2 * s.scaleOffset2) + s.rseed) - cos(ny * (s.scale3 * s.scaleOffset3) + s.rseed),
	],
	//! noise
	noise: (nx, ny, s) => [
		noise(nx * (s.scale1 * s.scaleOffset1) + s.rseed) + noise(nx * (s.scale2 * s.scaleOffset2) + s.rseed) - noise(nx * (s.scale3 * s.scaleOffset3) + s.rseed),
		noise(cos(ny * (s.scale1 * s.scaleOffset1) + s.rseed)) + noise(ny * (s.scale2 * s.scaleOffset2) + s.rseed) - noise(ny * (s.scale3 * s.scaleOffset3) + s.rseed),
	],
	//! noise x SineCos
	noiseSine: (nx, ny, s) => [
		noise(sin(nx * (s.scale1 * s.scaleOffset1) + s.rseed)) + noise(cos(nx * (s.scale2 * s.scaleOffset2) + s.rseed)) - noise(sin(nx * (s.scale3 * s.scaleOffset3) + s.rseed)),
		noise(cos(ny * (s.scale1 * s.scaleOffset1) + s.rseed)) + noise(sin(ny * (s.scale2 * s.scaleOffset2) + s.rseed)) - noise(cos(ny * (s.scale3 * s.scaleOffset3) + s.rseed)),
	],
};

//! [maxU, maxV, minU, minV]
const BOUNDS_MODES = {
	//! pNoise x SineCos
	pNoise: (nx, ny, s, b) => {
		const ns = s.noiseScale;
		return [
			map(oct(ny * (s.scale1 * s.scaleOffset1) + s.rseed, ny * (s.scale2 * s.scaleOffset3) + s.rseed, ns[0], 1, b.octave), -b.input, b.input, b.maxU[0], b.maxU[1], true),
			map(oct(nx * (s.scale2 * s.scaleOffset1) + s.rseed, nx * (s.scale1 * s.scaleOffset2) + s.rseed, ns[1], 2, b.octave), -b.input, b.input, b.maxV[0], b.maxV[1], true),
			map(oct(ny * (s.scale3 * s.scaleOffset1) + s.rseed, ny * (s.scale1 * s.scaleOffset3) + s.rseed, ns[2], 0, b.octave), -b.input, b.input, b.minU[0], b.minU[1], true),
			map(oct(nx * (s.scale1 * s.scaleOffset2) + s.rseed, nx * (s.scale3 * s.scaleOffset3) + s.rseed, ns[3], 3, b.octave), -b.input, b.input, b.minV[0], b.minV[1], true),
		];
	},
	//! center focused introverted
	centerIntroverted: (nx, ny, s) => [
		map(ny, s.xMin * width, s.xMax * width, 3, -3, true),
		map(nx, s.yMin * height, s.yMax * height, 3, -3, true),
		map(ny, s.xMin * width, s.xMax * width, -3, 3, true),
		map(nx, s.yMin * height, s.yMax * height, -3, 3, true),
	],
	//! center focused extroverted
	centerExtroverted: (nx, ny, s) => [
		map(nx, s.xMin * width, s.xMax * width, 3, -3, true),
		map(ny, s.yMin * height, s.yMax * height, 3, -3, true),
		map(nx, s.xMin * width, s.xMax * width, -3, 3, true),
		map(ny, s.yMin * height, s.yMax * height, -3, 3, true),
	],
	//! Wobbly noise square and stuff
	wobbly: (nx, ny, s) => [
		map(noise(ny * (s.scale1 * s.scaleOffset1) + s.nseed), 0, 1, 0, 3, true),
		map(noise(nx * (s.scale2 * s.scaleOffset2) + s.nseed), 0, 1, 0, 3, true),
		map(noise(ny * (s.scale2 * s.scaleOffset3) + s.nseed), 0, 1, -3, 0, true),
		map(noise(nx * (s.scale3 * s.scaleOffset1) + s.nseed), 0, 1, -3, 0, true),
	],
	//! Crayon mode
	crayon: () => [random(0.001, 4), random(0.001, 4), random(-4, -0.001), random(-4, -0.001)],
	//! Standard Mode
	standard: () => [1, 1, -1, -1],
};

//! [u, v]
const UV_MODES = {
	//! Introverted
	introverted: (un, vn, nx, ny, s, uv, [maxU, maxV, minU, minV]) => [
		map(vn, map(nx, s.xMin * width, s.xMax * width, -uv.span, -uv.inner), map(nx, s.xMin * width, s.xMax * width, uv.inner, uv.span), minU, maxU, true),
		map(un, map(ny, s.yMin * height, s.yMax * height, -uv.span, -uv.inner), map(ny, s.yMin * height, s.yMax * height, uv.inner, uv.span), minV, maxV, true),
	],
	//! Extroverted
	extroverted: (un, vn, nx, ny, s, uv, [maxU, maxV, minU, minV]) => [
		map(vn, map(ny, s.xMin * width, s.xMax * width, -uv.span, -uv.inner), map(ny, s.xMin * width, s.xMax * width, uv.inner, uv.span), minU, maxU, true),
		map(un, map(nx, s.yMin * height, s.yMax * height, -uv.span, -uv.inner), map(nx, s.yMin * height, s.yMax * height, uv.inner, uv.span), minV, maxV, true),
	],
	//! Equilibrium
	equilibrium: (un, vn, nx, ny, s, uv, [maxU, maxV, minU, minV]) => [
		map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true),
		map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true),
	],
};

//! ZZ → [zu, zv]
const ZZ_RULES = {
	//! raw
	raw: (u, v, zzu, zzv) => [zzu, zzv],
	//! half (LIGNIS OG)
	half: (u, v, zzu, zzv) => [u < 0 ? u : zzu, v < 0 ? v : zzv],
	//! sym
	sym: (u, v, zzu, zzv) => [u < 0 ? -zzu : zzu, v < 0 ? -zzv : zzv],
	//! cross
	cross: (u, v, zzu, zzv) => [u < 0 ? -zzv : zzu, v < 0 ? -zzu : zzv],
	//! abs (negatives use zz.kNeg)
	abs: (u, v, zzu, zzv, zz, bounds) => [u < 0 ? -zzValue(Math.abs(u), zz.kNeg ?? zz.ku, zz, bounds[2], bounds[0]) : zzu, v < 0 ? -zzValue(Math.abs(v), zz.kNeg ?? zz.kv, zz, bounds[3], bounds[1]) : zzv],
};

function zzValue(x, k, zz, min, max) {
	const z = ZZ(x, zz.m, zz.b, k);
	return zz.mapRange ? map(z, -zz.mapRange, zz.mapRange, min, max, true) : z;
}

// ============================================================================
// SUPERCURVE
// ============================================================================

function superCurve(x, y, amplitude1, amplitude2, s, cfg) {
	let nx = x,
		ny = y,
		octave = cfg.flow.octave,
		a1 = amplitude1,
		a2 = amplitude2;

	let dx = oct(nx, ny, s.scale1, 0, octave);
	let dy = oct(nx, ny, s.scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, s.scale1, 1, octave);
	dy = oct(nx, ny, s.scale2, 3, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, s.scale1, 1, octave);
	dy = oct(nx, ny, s.scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	const [un, vn] = FLOW_MODES[cfg.flow.mode](nx, ny, s);
	const bounds = BOUNDS_MODES[cfg.bounds.mode](nx, ny, s, cfg.bounds);
	const [maxU, maxV, minU, minV] = bounds;
	const [u, v] = UV_MODES[cfg.uv.mode](un, vn, nx, ny, s, cfg.uv, bounds);

	const zz = cfg.zz;
	const zzu = zzValue(u, zz.ku, zz, minU, maxU);
	const zzv = zzValue(v, zz.kv, zz, minV, maxV);
	const [zu, zv] = ZZ_RULES[zz.rule](u, v, zzu, zzv, zz, bounds);

	let p = createVector(zu, zv);
	return p;
}
