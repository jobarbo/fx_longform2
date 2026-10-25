// ============================================================================
// PERSPECTIVE SCENE — horizon, vanishing points and measuring points
// ============================================================================
//
// Everything is built the way it is drawn by hand: lines toward vanishing
// points (VP) and their intersections. True lengths are transferred with
// measuring points (2-point) or the distance point (1-point).
//
// Axes of a ground frame:
//   a — 1pt: frontal (parallel to the picture plane) / 2pt: toward vpRight
//   b — 1pt: depth, toward the central VP          / 2pt: toward vpLeft
//   k — vertical (heights stay vertical in 1pt and 2pt)

class PerspectiveScene {
	/**
	 * 1pt: {mode: "1pt", horizonY, vpX, viewingDistance}
	 * 2pt: {mode: "2pt", horizonY, vpLeftX, vpRightX, centerX}
	 */
	constructor(opts) {
		this.mode = opts.mode;
		this.horizonY = opts.horizonY;
		const hy = this.horizonY;

		if (this.mode === "1pt") {
			this.vp = pt(opts.vpX, hy);
			this.d = opts.viewingDistance;
			// Diagonals at 45° vanish at the distance point. Depth marks are laid to
			// the right of a point, so their diagonals run to the left distance point.
			this.dp = pt(this.vp.x - this.d, hy);
			this.centerX = this.vp.x;
			this.vpA = null;
			this.vpB = this.vp;
		} else {
			this.vpLeft = pt(opts.vpLeftX, hy);
			this.vpRight = pt(opts.vpRightX, hy);
			const cv = Math.min(Math.max(opts.centerX, opts.vpLeftX + 1), opts.vpRightX - 1);
			this.centerX = cv;
			// Station point: the VPs must subtend a right angle from the eye.
			this.d = Math.sqrt((cv - opts.vpLeftX) * (opts.vpRightX - cv));
			const distL = Math.hypot(cv - opts.vpLeftX, this.d);
			const distR = Math.hypot(opts.vpRightX - cv, this.d);
			this.mpRight = pt(opts.vpRightX - distR, hy);
			this.mpLeft = pt(opts.vpLeftX + distL, hy);
			// Angle of the a axis with the picture plane
			this.theta = Math.atan2(this.d, opts.vpRightX - cv);
			this.vpA = this.vpRight;
			this.vpB = this.vpLeft;
		}
	}

	vanishingPoints() {
		return this.mode === "1pt" ? [this.vp] : [this.vpLeft, this.vpRight];
	}

	/** Move p toward vp by fraction t. */
	toward(p, vp, t) {
		return lerpPt(p, vp, t);
	}

	/**
	 * The point at true length `len` from p along `axis`, measured at p's own
	 * scale (len is laid on the horizontal measuring line through p).
	 * Returns {point, mark, via}: `mark` is the tick on the measuring line and
	 * `via` the measuring/distance point used, for drawing the construction.
	 */
	measure(p, len, axis) {
		if (len === 0) return {point: pt(p.x, p.y), mark: pt(p.x, p.y), via: null};
		if (this.mode === "1pt") {
			if (axis === "a") return {point: pt(p.x + len, p.y), mark: null, via: null};
			const mark = pt(p.x + len, p.y);
			return {point: intersectLines(p, this.vp, mark, this.dp), mark, via: this.dp};
		}
		if (axis === "a") {
			const mark = pt(p.x + len, p.y);
			return {point: intersectLines(p, this.vpRight, mark, this.mpRight), mark, via: this.mpRight};
		}
		const mark = pt(p.x - len, p.y);
		return {point: intersectLines(p, this.vpLeft, mark, this.mpLeft), mark, via: this.mpLeft};
	}

	frame(origin) {
		return new GroundFrame(this, origin);
	}
}

/**
 * A ground grid anchored at `origin` (a screen point on the ground). Units are
 * true lengths at the origin's scale: the frontal plane through the origin is
 * the picture plane.
 */
class GroundFrame {
	constructor(scene, origin) {
		this.scene = scene;
		this.origin = origin;
		this.eyeHeight = origin.y - scene.horizonY;
	}

	alongA(a) {
		return this.scene.measure(this.origin, a, "a").point;
	}

	alongB(b) {
		return this.scene.measure(this.origin, b, "b").point;
	}

	/** Ground point (a, b): intersect the line from the a-mark toward vpB with the line from the b-mark toward vpA. */
	point(a, b) {
		const s = this.scene;
		const pa = this.alongA(a);
		const pb = this.alongB(b);
		if (s.mode === "1pt") {
			const [h0, h1] = horizontalThrough(pb);
			return intersectLines(pa, s.vp, h0, h1);
		}
		return intersectLines(pa, s.vpLeft, pb, s.vpRight);
	}

	/** Point (a, b) at height k, carried from the height line at the origin. */
	lift(a, b, k) {
		const g = this.point(a, b);
		if (k === 0) return g;
		const s = this.scene;
		const top = pt(this.origin.x, this.origin.y - k);
		if (s.mode === "1pt") {
			if (b === 0) return pt(g.x, top.y);
			// Height line set to the side of the VP so its rays never run vertical.
			const q = pt(s.vp.x + s.d, this.origin.y);
			const qTop = pt(q.x, q.y - k);
			const [h0, h1] = horizontalThrough(this.alongB(b));
			const qb = intersectLines(q, s.vp, h0, h1);
			const [v0, v1] = verticalThrough(qb);
			return pt(g.x, intersectLines(qTop, s.vp, v0, v1).y);
		}
		const pa = this.alongA(a);
		const [va0, va1] = verticalThrough(pa);
		const paTop = a === 0 ? top : intersectLines(top, s.vpRight, va0, va1);
		if (b === 0) return paTop;
		const [vg0, vg1] = verticalThrough(g);
		return intersectLines(paTop, s.vpLeft, vg0, vg1);
	}

	/** Distance in front of the eye (along the view axis) of ground point (a, b). */
	depth(a, b) {
		const s = this.scene;
		const c = this.camera();
		if (s.mode === "1pt") return b - c.b;
		return (a - c.a) * Math.sin(s.theta) + (b - c.b) * Math.cos(s.theta);
	}

	/** Eye position in frame coordinates (for face culling and painter order). */
	camera() {
		const s = this.scene;
		if (s.mode === "1pt") {
			return {a: s.vp.x - this.origin.x, b: -s.d, k: this.eyeHeight};
		}
		const xo = this.origin.x - s.centerX;
		const c = Math.cos(s.theta);
		const sn = Math.sin(s.theta);
		return {a: -xo * c - s.d * sn, b: xo * sn - s.d * c, k: this.eyeHeight};
	}
}
