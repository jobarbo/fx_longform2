// ============================================================================
// GEOMETRY — pure 2D helpers (no p5 dependency)
// ============================================================================

function pt(x, y) {
	return {x, y};
}

function lerpPt(a, b, t) {
	return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
}

/** Intersection of the infinite lines (p1,p2) and (p3,p4). Null when parallel. */
function intersectLines(p1, p2, p3, p4) {
	const d1x = p2.x - p1.x;
	const d1y = p2.y - p1.y;
	const d2x = p4.x - p3.x;
	const d2y = p4.y - p3.y;
	const den = d1x * d2y - d1y * d2x;
	if (Math.abs(den) < 1e-12) return null;
	const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / den;
	return {x: p1.x + d1x * t, y: p1.y + d1y * t};
}

/** Distance from p to the infinite line (a,b). */
function distPointToLine(p, a, b) {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len = Math.hypot(dx, dy);
	if (len < 1e-12) return Math.hypot(p.x - a.x, p.y - a.y);
	return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len;
}

/** Vertical line through p, as two points (for intersectLines). */
function verticalThrough(p) {
	return [p, {x: p.x, y: p.y + 1}];
}

/** Horizontal line through p, as two points (for intersectLines). */
function horizontalThrough(p) {
	return [p, {x: p.x + 1, y: p.y}];
}

/**
 * Clip the infinite line through p with direction d against a convex polygon
 * (Cyrus-Beck). Returns [a, b] or null when the line misses the polygon.
 */
function clipLineToConvex(p, d, poly) {
	let tMin = -Infinity;
	let tMax = Infinity;
	const sign = polygonSignedArea(poly) > 0 ? 1 : -1;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		// Inward normal of edge (a,b)
		const nx = -(b.y - a.y) * sign;
		const ny = (b.x - a.x) * sign;
		const num = (p.x - a.x) * nx + (p.y - a.y) * ny;
		const den = d.x * nx + d.y * ny;
		if (Math.abs(den) < 1e-12) {
			if (num < 0) return null;
			continue;
		}
		const t = -num / den;
		if (den > 0) tMin = Math.max(tMin, t);
		else tMax = Math.min(tMax, t);
		if (tMin > tMax) return null;
	}
	if (!isFinite(tMin) || !isFinite(tMax)) return null;
	return [
		{x: p.x + d.x * tMin, y: p.y + d.y * tMin},
		{x: p.x + d.x * tMax, y: p.y + d.y * tMax},
	];
}

function polygonSignedArea(poly) {
	let s = 0;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		s += a.x * b.y - b.x * a.y;
	}
	return s * 0.5;
}
