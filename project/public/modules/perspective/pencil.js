// ============================================================================
// PENCIL — graphite-like strokes on a p5.Graphics
// ============================================================================
//
// Each stroke draws its randomness from a PRNG seeded by its own endpoints, so
// toggling a layer (construction, debug) never changes the other strokes.

let PENCIL_SEED = 1;

const PENCIL_PRESETS = {
	construction: {weight: 0.45, alpha: 16, passes: 1, wobble: 0.6, jitter: 0.6, overshoot: 0, freq: 0.004, step: 14, taper: 0.15},
	contour: {weight: 1.0, alpha: 62, passes: 2, wobble: 0.55, jitter: 0.9, overshoot: 7, freq: 0.012, step: 5, taper: 0.08},
	ground: {weight: 0.75, alpha: 38, passes: 2, wobble: 0.6, jitter: 0.8, overshoot: 12, freq: 0.01, step: 7, taper: 0.1},
	detail: {weight: 0.65, alpha: 48, passes: 1, wobble: 0.3, jitter: 0.5, overshoot: 2, freq: 0.02, step: 4, taper: 0.1},
	hatch: {weight: 0.5, alpha: 30, passes: 1, wobble: 0.35, jitter: 0, overshoot: 2.5, freq: 0.03, step: 8, taper: 0.25},
	debug: {weight: 0.9, alpha: 80, passes: 1, wobble: 0, jitter: 0, overshoot: 0, freq: 0, step: 1000, taper: 0},
};

function setPencilSeed(seed) {
	PENCIL_SEED = seed >>> 0;
}

function pencilRng(...values) {
	let h = PENCIL_SEED ^ 0x9e3779b9;
	for (const v of values) {
		h = Math.imul(h ^ Math.round(v * 1000), 0x85ebca6b);
		h ^= h >>> 13;
	}
	// mulberry32
	return function () {
		h = (h + 0x6d2b79f5) | 0;
		let t = Math.imul(h ^ (h >>> 15), 1 | h);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * A wobbly, pressure-varying line from a to b.
 * opts: preset fields above + {ink: [h, s, b], salt}
 */
function pencilLine(g, a, b, opts = {}) {
	const o = {...PENCIL_PRESETS.contour, ...opts};
	const ink = o.ink || [220, 15, 18];
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len = Math.hypot(dx, dy);
	if (len < 0.05) return;
	const ux = dx / len;
	const uy = dy / len;
	const nx = -uy;
	const ny = ux;
	const r = pencilRng(a.x, a.y, b.x, b.y, o.salt || 0);

	for (let pass = 0; pass < o.passes; pass++) {
		const start = -o.overshoot * r();
		const end = len + o.overshoot * r();
		const off0 = (r() - 0.5) * o.jitter;
		const off1 = (r() - 0.5) * o.jitter;
		const nOff = r() * 1000;
		const span = end - start;
		const steps = Math.max(2, Math.ceil(span / o.step));
		const taperLen = Math.max(1, span * o.taper);
		const passAlpha = o.alpha * (pass === 0 ? 1 : 0.7);

		let px = a.x + ux * start + nx * off0;
		let py = a.y + uy * start + ny * off0;
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const s = start + span * t;
			const w = (noise(nOff + s * o.freq) - 0.5) * 2 * o.wobble + off0 + (off1 - off0) * t;
			const x = a.x + ux * s + nx * w;
			const y = a.y + uy * s + ny * w;
			const pressure = noise(nOff + 500 + s * o.freq * 0.7);
			const fade = Math.min(1, (s - start) / taperLen, (end - s) / taperLen);
			g.stroke(ink[0], ink[1], ink[2], passAlpha * (0.45 + pressure) * (0.35 + 0.65 * fade));
			g.strokeWeight(o.weight * (0.6 + 0.8 * pressure));
			g.line(px, py, x, y);
			px = x;
			py = y;
		}
	}
}

function pencilPolyline(g, points, opts, closed = false) {
	const n = closed ? points.length : points.length - 1;
	for (let i = 0; i < n; i++) pencilLine(g, points[i], points[(i + 1) % points.length], opts);
}

/** Parallel hatching clipped to a convex polygon. */
function pencilHatch(g, poly, {angle = 60, spacing = 6, ...opts} = {}) {
	const rad = (angle * Math.PI) / 180;
	const d = {x: Math.cos(rad), y: Math.sin(rad)};
	const n = {x: -d.y, y: d.x};
	let lo = Infinity;
	let hi = -Infinity;
	for (const p of poly) {
		const s = p.x * n.x + p.y * n.y;
		lo = Math.min(lo, s);
		hi = Math.max(hi, s);
	}
	const r = pencilRng(poly[0].x, poly[0].y, angle, spacing);
	for (let s = lo + spacing * r(); s < hi; s += spacing * (0.75 + 0.5 * r())) {
		const seg = clipLineToConvex({x: n.x * s, y: n.y * s}, d, poly);
		if (seg) pencilLine(g, seg[0], seg[1], {...PENCIL_PRESETS.hatch, ...opts});
	}
}

/** Paper tone with a light graphite tooth. */
function drawPaper(g, w, h, paper) {
	g.background(paper[0], paper[1], paper[2]);
	const r = pencilRng(w, h, 7);
	g.noStroke();
	for (let i = 0; i < 9000; i++) {
		g.fill(paper[0], paper[1] + 6, paper[2] - 18 - r() * 25, 4 + r() * 8);
		const s = 0.4 + r() * 1.3;
		g.rect(r() * w, r() * h, s, s);
	}
}
