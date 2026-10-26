// ============================================================================
// PENCIL — graphite-like strokes on a p5.Graphics
// ============================================================================
//
// Each stroke draws its randomness from a PRNG seeded by its own endpoints, so
// toggling a layer (construction, debug) never changes the other strokes.

let PENCIL_SEED = 1;
let PENCIL_BOUNDS = null; // [x0, y0, x1, y1]: strokes are clipped to this rectangle
// Distance thinning: strokes get finer the farther they are from the eye (the haze
// that washes them out is laid by render.js). Points may carry a depth `d` (frame
// units); PENCIL_ITEM_DEPTH stands in for those that don't.
let PENCIL_DEPTH = null; // {metre, near, falloff, min}
let PENCIL_ITEM_DEPTH = null;

const PENCIL_PRESETS = {
	construction: {weight: 0.45, alpha: 16, passes: 1, wobble: 0.6, jitter: 0.6, overshoot: 0, freq: 0.004, step: 14, taper: 0.15, fade: false},
	contour: {weight: 1.0, alpha: 62, passes: 2, wobble: 0.55, jitter: 0.9, overshoot: 7, freq: 0.012, step: 5, taper: 0.08},
	ground: {weight: 0.75, alpha: 38, passes: 2, wobble: 0.6, jitter: 0.8, overshoot: 12, freq: 0.01, step: 7, taper: 0.1},
	detail: {weight: 0.65, alpha: 48, passes: 1, wobble: 0.3, jitter: 0.5, overshoot: 2, freq: 0.02, step: 4, taper: 0.1},
	hatch: {weight: 0.5, alpha: 30, passes: 1, wobble: 0.35, jitter: 0, overshoot: 2.5, freq: 0.03, step: 8, taper: 0.25},
	ridge: {weight: 1.5, alpha: 70, passes: 1, wobble: 0.25, jitter: 0, overshoot: 0, freq: 0.02, step: 4, taper: 0.1},
	water: {weight: 0.8, alpha: 44, passes: 1, wobble: 0.2, jitter: 0.3, overshoot: 0, freq: 0.05, step: 5, taper: 0.35},
	reflect: {weight: 0.5, alpha: 22, passes: 1, wobble: 0.3, jitter: 0.3, overshoot: 0, freq: 0.05, step: 4, taper: 0.3},
	debug: {weight: 0.9, alpha: 80, passes: 1, wobble: 0, jitter: 0, overshoot: 0, freq: 0, step: 1000, taper: 0, fade: false},
};

function setPencilSeed(seed) {
	PENCIL_SEED = seed >>> 0;
}

function setPencilBounds(bounds) {
	PENCIL_BOUNDS = bounds;
}

/** cfg: {metre, near (m), falloff (m), min}, or null to turn the distance fade off. */
function setPencilDepth(cfg) {
	PENCIL_DEPTH = cfg;
}

/** Depth used for points without their own (the item being drawn), or null. */
function setPencilItemDepth(d) {
	PENCIL_ITEM_DEPTH = d;
}

/** Stroke width factor: 1 up close, easing toward `min` with distance. */
function depthFade(d) {
	if (!PENCIL_DEPTH || d === null || d === undefined) return 1;
	const {metre, near, falloff, min} = PENCIL_DEPTH;
	return min + (1 - min) * Math.exp(-Math.max(0, d / metre - near) / falloff);
}

function pointDepth(p) {
	return p.d !== undefined ? p.d : PENCIL_ITEM_DEPTH;
}

/** Depth of a point lying on the outline of a polygon whose vertices carry depths. */
function depthOnPolygon(p, poly) {
	let best = null;
	let bestDist = Infinity;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len2 = dx * dx + dy * dy;
		const t = len2 > 0 ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
		const dist = Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y);
		if (dist < bestDist) {
			bestDist = dist;
			const da = pointDepth(a);
			const db = pointDepth(b);
			best = da && db ? lerpDepth(da, db, t) : null;
		}
	}
	return best;
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
 * opts: preset fields above + {ink: [h, s, b], salt, capStart, capEnd}
 * capStart / capEnd: false when the stroke continues another piece there (no overshoot, no taper).
 */
function pencilLine(g, a, b, opts = {}) {
	const o = {...PENCIL_PRESETS.contour, ...opts};
	const ink = o.ink || [220, 15, 18];
	const r = pencilRng(a.x, a.y, b.x, b.y, o.salt || 0);
	let da = o.fade === false ? null : pointDepth(a);
	let db = o.fade === false ? null : pointDepth(b);
	// Near the eye, edges can run far past the canvas: only draw what can show
	if (PENCIL_BOUNDS) {
		const seg = clipSegmentToRect(a, b, PENCIL_BOUNDS);
		if (!seg) return;
		if (da && db) {
			const ex = b.x - a.x;
			const ey = b.y - a.y;
			const l2 = ex * ex + ey * ey || 1;
			const at = (p) => ((p.x - a.x) * ex + (p.y - a.y) * ey) / l2;
			[da, db] = [lerpDepth(da, db, at(seg[0])), lerpDepth(da, db, at(seg[1]))];
		}
		[a, b] = seg;
	}
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len = Math.hypot(dx, dy);
	if (len < 0.05) return;
	const ux = dx / len;
	const uy = dy / len;
	const nx = -uy;
	const ny = ux;

	for (let pass = 0; pass < o.passes; pass++) {
		const overStart = o.overshoot * r();
		const overEnd = o.overshoot * r();
		const start = o.capStart === false ? 0 : -overStart;
		const end = len + (o.capEnd === false ? 0 : overEnd);
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
			const fadeIn = o.capStart === false ? 1 : (s - start) / taperLen;
			const fadeOut = o.capEnd === false ? 1 : (end - s) / taperLen;
			const fade = Math.min(1, fadeIn, fadeOut);
			const far = da && db ? depthFade(lerpDepth(da, db, Math.min(1, Math.max(0, s / len)))) : depthFade(da || db);
			g.stroke(ink[0], ink[1], ink[2], passAlpha * (0.45 + pressure) * (0.35 + 0.65 * fade));
			g.strokeWeight(o.weight * (0.6 + 0.8 * pressure) * far);
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

/** One continuous stroke through several points (no overshoot or taper at the joints). */
function pencilPath(g, points, opts) {
	const n = points.length - 1;
	for (let i = 0; i < n; i++) {
		pencilLine(g, points[i], points[i + 1], {...opts, capStart: i === 0 ? undefined : false, capEnd: i === n - 1 ? undefined : false});
	}
}

/**
 * Parallel hatching clipped to a convex polygon. With `aligned`, the lines sit
 * on one screen-wide grid, so overlapping polygons share them instead of
 * stacking denser patterns (cast shadows).
 */
function pencilHatch(g, poly, {angle = 60, spacing = 6, aligned = false, ...opts} = {}) {
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
	if (PENCIL_BOUNDS) {
		const [x0, y0, x1, y1] = PENCIL_BOUNDS;
		const corners = [x0 * n.x + y0 * n.y, x1 * n.x + y0 * n.y, x0 * n.x + y1 * n.y, x1 * n.x + y1 * n.y];
		lo = Math.max(lo, Math.min(...corners));
		hi = Math.min(hi, Math.max(...corners));
	}
	const r = pencilRng(poly[0].x, poly[0].y, angle, spacing);
	const first = aligned ? Math.ceil(lo / spacing) * spacing : lo + spacing * r();
	for (let s = first; s < hi; s += aligned ? spacing : spacing * (0.75 + 0.5 * r())) {
		const seg = clipLineToConvex({x: n.x * s, y: n.y * s}, d, poly);
		if (!seg) continue;
		// Hatch ends sit on the polygon outline: give them its depth for the distance fade
		if (poly[0].d !== undefined) for (const p of seg) p.d = depthOnPolygon(p, poly) ?? undefined;
		pencilLine(g, seg[0], seg[1], {...PENCIL_PRESETS.hatch, ...opts});
	}
}

function paperBackground(g, paper) {
	g.background(paper[0], paper[1], paper[2]);
}

/** A light graphite tooth over the whole sheet. */
function paperTooth(g, w, h, paper) {
	const r = pencilRng(w, h, 7);
	g.noStroke();
	for (let i = 0; i < 9000; i++) {
		g.fill(paper[0], paper[1] + 6, paper[2] - 18 - r() * 25, 4 + r() * 8);
		const s = 0.4 + r() * 1.3;
		g.rect(r() * w, r() * h, s, s);
	}
}
