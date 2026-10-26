// ============================================================================
// SUN — light direction, its vanishing points, shading and cast shadows
// ============================================================================
// As in a perspective drawing class: sun rays are parallel, so they meet at a
// vanishing point (the sun itself when it is ahead, the anti-solar point below
// the horizon when it is behind). Shadows of vertical edges on the ground meet
// on the horizon right under it.

// Sun position ranges, in degrees. Azimuth 0 = straight ahead (backlit).
const SUN_HEIGHTS = {low: [5, 15], mid: [15, 35], high: [35, 60]};

class Sun {
	/** azimuth: degrees from the view direction (positive to the right); elevation: degrees above the horizon. */
	constructor(frame, {azimuth, elevation}) {
		this.frame = frame;
		this.azimuth = azimuth;
		this.elevation = elevation;
		const s = frame.scene;
		const az = (azimuth * Math.PI) / 180;
		const el = (elevation * Math.PI) / 180;
		// Toward the sun, in view space (X right, Y up, Z ahead)
		this.view = {x: Math.sin(az) * Math.cos(el), y: Math.sin(el), z: Math.cos(az) * Math.cos(el)};
		const o = frame.fromView(0, 0);
		const p = frame.fromView(this.view.x, this.view.z);
		// Frame axes are orthonormal and share the vertical with the view
		this.dir = {a: p.a - o.a, b: p.b - o.b, k: this.view.y};

		if (Math.abs(this.view.z) > 1e-6) {
			this.rayVP = pt(s.centerX + (s.d * this.view.x) / this.view.z, s.horizonY - (s.d * this.view.y) / this.view.z);
			this.shadowVP = pt(this.rayVP.x, s.horizonY);
		} else {
			this.rayVP = null;
			this.shadowVP = null;
		}
		this.ahead = this.view.z > 0;
	}

	/** The sun disc can be drawn: ahead, above the horizon and on the canvas (with a margin). */
	inFrame(W, margin = 40) {
		return this.ahead && this.rayVP && this.rayVP.x > margin && this.rayVP.x < W - margin && this.rayVP.y > margin && this.rayVP.y < this.frame.scene.horizonY;
	}

	/** Frame point where the shadow of (a, b, k) falls on the ground. */
	groundShadow(a, b, k) {
		if (k <= 0) return {a, b};
		const t = k / this.dir.k;
		return {a: a - this.dir.a * t, b: b - this.dir.b * t};
	}

	/**
	 * Shadow of (a, b, k) on the vertical plane `axis` = value, or null when the
	 * point is not between the sun and the plane.
	 */
	planeShadow(a, b, k, axis, value) {
		const da = this.dir[axis];
		if (Math.abs(da) < 1e-9) return null;
		const t = ((axis === "a" ? a : b) - value) / da;
		if (t <= 0) return null;
		return {a: a - this.dir.a * t, b: b - this.dir.b * t, k: k - this.dir.k * t};
	}

	/** Cosine between a unit normal {a, b, k} and the sun. */
	lambert(n) {
		return n.a * this.dir.a + n.b * this.dir.b + n.k * this.dir.k;
	}

	/** 0 lit, 1 half-tone, 2 in its own shadow. */
	shadeLevel(n) {
		const c = this.lambert(n);
		return c < 0.02 ? 2 : c < 0.35 ? 1 : 0;
	}
}

/** Pick the sun for a composition from the params (azimuth jitter drawn with p5 random). */
function makeSun(frame, params, W) {
	const s = frame.scene;
	const [lo, hi] = SUN_HEIGHTS[params.sun_height];
	let elevation = random(lo, hi);
	let azimuth;
	if (params.sun_position === "backlit") {
		// Keep the disc on the canvas, at least 60 px from the edges and the top
		const tMin = Math.atan((80 - s.centerX) / s.d);
		const tMax = Math.atan((W - 80 - s.centerX) / s.d);
		azimuth = (Math.max(tMin, Math.min(tMax, (random(-25, 25) * Math.PI) / 180)) * 180) / Math.PI;
		const maxTan = ((s.horizonY - 60) * Math.cos((azimuth * Math.PI) / 180)) / s.d;
		elevation = Math.min(elevation, (Math.atan(maxTan) * 180) / Math.PI);
	} else if (params.sun_position === "side") azimuth = (random() < 0.5 ? -1 : 1) * random(60, 110);
	else azimuth = 180 + random(-30, 30);
	return new Sun(frame, {azimuth, elevation});
}

// ----------------------------------------------------------------------------
// Shadow casters
// ----------------------------------------------------------------------------

/** 3D points ({a, b, k}) outlining an item, for its cast shadow. */
function casterPoints(it) {
	const pts = [];
	if (it.kind === "box") {
		for (const i of [0, 1]) for (const j of [0, 1]) for (const k of [0, 1]) pts.push({a: it.a + i * it.wa, b: it.b + j * it.wb, k: it.z + k * it.h});
		if (it.roof) {
			const kr = it.top;
			if (it.roof.axis === "a") pts.push({a: it.a, b: it.b + it.wb / 2, k: kr}, {a: it.a + it.wa, b: it.b + it.wb / 2, k: kr});
			else pts.push({a: it.a + it.wa / 2, b: it.b, k: kr}, {a: it.a + it.wa / 2, b: it.b + it.wb, k: kr});
		}
	} else if (it.kind === "cylinder") {
		for (let i = 0; i < 12; i++) {
			const t = (i / 12) * Math.PI * 2;
			const a = it.ca + it.r * Math.cos(t);
			const b = it.cb + it.r * Math.sin(t);
			pts.push({a, b, k: it.z}, {a, b, k: it.z + it.h});
		}
		if (it.cap) pts.push({a: it.ca, b: it.cb, k: it.top});
	} else if (it.kind === "tree") {
		const R = it.crownR;
		pts.push({a: it.ca, b: it.cb, k: 0});
		if (it.type === "conifer") {
			const kb = it.trunkH * 0.6;
			for (let i = 0; i < 8; i++) {
				const t = (i / 8) * Math.PI * 2;
				pts.push({a: it.ca + R * 0.9 * Math.cos(t), b: it.cb + R * 0.9 * Math.sin(t), k: kb});
			}
			pts.push({a: it.ca, b: it.cb, k: it.top});
		} else {
			const kc = it.trunkH + R;
			for (let i = 0; i < 8; i++) {
				const t = (i / 8) * Math.PI * 2;
				pts.push({a: it.ca + R * Math.cos(t), b: it.cb + R * Math.sin(t), k: kc});
			}
			pts.push({a: it.ca, b: it.cb, k: kc + R}, {a: it.ca, b: it.cb, k: kc - R * 0.8});
		}
	} else if (it.kind === "bench") {
		for (const i of [0, 1]) for (const j of [0, 1]) pts.push({a: it.a + i * it.wa, b: it.b + j * it.wb, k: 0}, {a: it.a + i * it.wa, b: it.b + j * it.wb, k: 0.9 * it.frame.metre});
	}
	return pts;
}

/** Convex hull (monotone chain) of points with fields x, y. */
function convexHull(points) {
	const p = points.slice().sort((u, v) => u.x - v.x || u.y - v.y);
	if (p.length < 3) return p;
	const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
	const lower = [];
	for (const q of p) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
		lower.push(q);
	}
	const upper = [];
	for (let i = p.length - 1; i >= 0; i--) {
		const q = p[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
		upper.push(q);
	}
	upper.pop();
	lower.pop();
	return lower.concat(upper);
}

/** Sutherland–Hodgman: keep the part of a polygon where f(p) >= 0 (f linear). */
function clipPolygon(poly, f) {
	const out = [];
	for (let i = 0; i < poly.length; i++) {
		const p = poly[i];
		const q = poly[(i + 1) % poly.length];
		const fp = f(p);
		const fq = f(q);
		if (fp >= 0) out.push(p);
		if (fp >= 0 !== fq >= 0) {
			const t = fp / (fp - fq);
			const r = {};
			for (const key in p) if (typeof p[key] === "number") r[key] = p[key] + (q[key] - p[key]) * t;
			out.push(r);
		}
	}
	return out;
}

/** Ground shadow of an item: a convex polygon in frame coordinates ({x: a, y: b}). */
function groundShadowPolygon(sun, it) {
	const pts = casterPoints(it).map(({a, b, k}) => {
		const g = sun.groundShadow(a, b, k);
		return {x: g.a, y: g.b};
	});
	return pts.length >= 3 ? convexHull(pts) : null;
}

/**
 * Shadows cast by other items on the lit walls of each box. Stores, for each
 * box, castShadows[faceName] = list of convex polygons in face coordinates (u, v).
 */
function computeFacadeShadows(sun, items, allItems = items) {
	const casters = allItems.filter((it) => it.kind === "box" || it.kind === "cylinder" || it.kind === "tree");
	const pointsOf = new Map(casters.map((it) => [it, casterPoints(it)]));
	for (const B of items) {
		if (B.kind !== "box" || B.h <= 0) continue;
		B.castShadows = {};
		for (const face of B.faces) {
			if (face.kind !== "wall") continue;
			if (sun.shadeLevel(faceNormal(B, face)) === 2) continue;
			const axis = face.name[0];
			const value = face.name[1] === "0" ? B[axis] : B[axis] + (axis === "a" ? B.wa : B.wb);
			const outward = face.name[1] === "0" ? -1 : 1;
			const along = axis === "a" ? "b" : "a";
			const u0 = B[along];
			const uw = along === "a" ? B.wa : B.wb;
			const polys = [];
			for (const A of casters) {
				if (A === B) continue;
				// The caster must stand on the outer side of the wall...
				const lo = A[axis];
				const hi = A[axis] + (axis === "a" ? A.wa : A.wb);
				if (outward > 0 ? hi <= value + 1e-6 : lo >= value - 1e-6) continue;
				// ...close enough for its shadow to reach the wall above its foot...
				const dist = Math.max(0, outward > 0 ? lo - value : value - hi);
				const slope = Math.abs(sun.dir[axis]) / sun.dir.k;
				if (dist > A.top * slope) continue;
				// ...and, shifted by the light, overlap the face sideways
				const tMax = (dist + (hi - lo)) / Math.abs(sun.dir[axis]);
				const shift = -sun.dir[along] * tMax;
				const aLo = A[along] + Math.min(0, shift);
				const aHi = A[along] + (along === "a" ? A.wa : A.wb) + Math.max(0, shift);
				if (aHi <= u0 || aLo >= u0 + uw) continue;
				const uv = [];
				for (const p of pointsOf.get(A)) {
					const s = sun.planeShadow(p.a, p.b, p.k, axis, value);
					if (s) uv.push({x: (s[along] - u0) / uw, y: (s.k - B.z) / B.h});
				}
				if (uv.length < 3) continue;
				const xs = uv.map((q) => q.x);
				const ys = uv.map((q) => q.y);
				if (Math.max(...xs) <= 0 || Math.min(...xs) >= 1 || Math.max(...ys) <= 0 || Math.min(...ys) >= 1) continue;
				let poly = convexHull(uv);
				for (const f of [(q) => q.x, (q) => 1 - q.x, (q) => q.y, (q) => 1 - q.y]) poly = clipPolygon(poly, f);
				if (poly.length >= 3 && Math.abs(polygonSignedArea(poly)) > 1e-4) polys.push(poly);
			}
			if (polys.length) B.castShadows[face.name] = polys;
		}
	}
}

/** Unit outward normal of a PBox face (walls, flat roof, roof slopes, gables). */
function faceNormal(bx, face) {
	const n = face.name;
	if (n === "a0" || n === "ga0") return {a: -1, b: 0, k: 0};
	if (n === "a1" || n === "ga1") return {a: 1, b: 0, k: 0};
	if (n === "b0" || n === "gb0") return {a: 0, b: -1, k: 0};
	if (n === "b1" || n === "gb1") return {a: 0, b: 1, k: 0};
	if (n === "k1") return {a: 0, b: 0, k: 1};
	if (n === "k0") return {a: 0, b: 0, k: -1};
	// Slopes: rise `height` over half the span across the ridge
	const hr = bx.roof.height;
	const half = n[1] === "b" ? bx.wb / 2 : bx.wa / 2;
	const len = Math.hypot(hr, half);
	const side = n[2] === "0" ? -1 : 1;
	return n[1] === "b" ? {a: 0, b: (side * hr) / len, k: half / len} : {a: (side * hr) / len, b: 0, k: half / len};
}
