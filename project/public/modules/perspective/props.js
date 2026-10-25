// ============================================================================
// PROPS — cylinders (silos, tanks) and trees on a ground frame
// ============================================================================
// Like PBox, each prop exposes its bounding box in the frame (a, b, wa, wb, z,
// top) and its corners on screen, so sortForPainter can order everything.

function bboxCorners(frame, a, b, wa, wb, z, top) {
	const corners = {};
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 2; j++) {
			for (let k = 0; k < 2; k++) {
				corners[`${i}${j}${k}`] = frame.lift(a + i * wa, b + j * wb, k ? top : z);
			}
		}
	}
	return corners;
}

/** Screen pixels per metre at the depth of ground point (a, b). */
function pixelsPerMetre(frame, a, b) {
	return Math.abs(frame.lift(a, b, frame.metre).y - frame.lift(a, b, 0).y);
}

class PCylinder {
	/** Vertical cylinder centred on (ca, cb), radius r, from z to z+h, with an optional conical cap. */
	constructor(frame, {ca, cb, r, h, z = 0, cap = 0, ...style}) {
		this.kind = "cylinder";
		this.frame = frame;
		this.ca = ca;
		this.cb = cb;
		this.r = r;
		this.a = ca - r;
		this.b = cb - r;
		this.wa = 2 * r;
		this.wb = 2 * r;
		this.z = z;
		this.h = h;
		this.cap = cap;
		this.top = z + h + cap;
		this.style = style;
		this.corners = bboxCorners(frame, this.a, this.b, this.wa, this.wb, z, this.top);

		// The silhouette generators are the verticals through the tangent points seen from the eye
		const cam = frame.camera();
		const phi = Math.atan2(cam.b - cb, cam.a - ca);
		const alpha = Math.acos(Math.min(1, r / Math.hypot(cam.a - ca, cam.b - cb)));
		this.t0 = phi - alpha;
		this.t1 = phi + alpha;
		this.phi = phi;
		this.topVisible = cam.k > z + h;

		const zt = z + h;
		const bottom = this.arc(z, this.t0, this.t1);
		if (cap > 0) {
			this.apex = frame.lift(ca, cb, this.top);
			this.outline = [...bottom, this.rim(zt, this.t1), this.apex, this.rim(zt, this.t0)];
		} else {
			const top = this.topVisible ? this.arc(zt, this.t1, this.t0 + Math.PI * 2) : this.arc(zt, this.t1, this.t0);
			this.outline = [...bottom, ...top];
		}
		this.topEllipse = this.topVisible && cap === 0 ? this.arc(zt, 0, Math.PI * 2) : null;
	}

	rim(k, t) {
		return this.frame.lift(this.ca + this.r * Math.cos(t), this.cb + this.r * Math.sin(t), k);
	}

	arc(k, from, to, n = 24) {
		const out = [];
		for (let i = 0; i <= n; i++) out.push(this.rim(k, from + ((to - from) * i) / n));
		return out;
	}

	/** The visible body between two angles of the near side (for shading one half). */
	band(from, to) {
		return [...this.arc(this.z, from, to, 12), ...this.arc(this.z + this.h, to, from, 12)];
	}
}

class PTree {
	/** A tree at (ca, cb): round crown, or a conifer when type is "conifer". */
	constructor(frame, {ca, cb, trunkH, crownR, type = "round"}) {
		this.kind = "tree";
		this.frame = frame;
		this.ca = ca;
		this.cb = cb;
		this.type = type;
		this.trunkH = trunkH;
		this.crownR = crownR;
		const height = type === "conifer" ? trunkH + crownR * 3.2 : trunkH + crownR * 2;
		this.a = ca - crownR;
		this.b = cb - crownR;
		this.wa = 2 * crownR;
		this.wb = 2 * crownR;
		this.z = 0;
		this.top = height;
		this.corners = bboxCorners(frame, this.a, this.b, this.wa, this.wb, 0, height);

		const ppm = pixelsPerMetre(frame, ca, cb);
		const m = frame.metre;
		this.base = frame.lift(ca, cb, 0);
		this.radius = (crownR / m) * ppm;
		this.trunkHalf = Math.max(0.3, 0.18 * ppm);
		if (type === "conifer") {
			this.crownBase = frame.lift(ca, cb, trunkH * 0.6);
			this.apex = frame.lift(ca, cb, height);
			this.trunkTop = frame.lift(ca, cb, trunkH * 0.8);
		} else {
			this.centre = frame.lift(ca, cb, trunkH + crownR);
			this.trunkTop = frame.lift(ca, cb, trunkH + crownR * 0.4);
		}
	}
}
