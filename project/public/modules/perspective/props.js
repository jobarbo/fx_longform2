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

class PLamp {
	/** Street lamp at (ca, cb), height h, with an arm of length `arm` pointing along (da, db) over the road. */
	constructor(frame, {ca, cb, h, arm, da, db}) {
		this.kind = "lamp";
		this.frame = frame;
		const m = frame.metre;
		const ea = ca + da * arm;
		const eb = cb + db * arm;
		const r = 0.5 * m;
		this.a = Math.min(ca, ea) - r;
		this.b = Math.min(cb, eb) - r;
		this.wa = Math.abs(ea - ca) + 2 * r;
		this.wb = Math.abs(eb - cb) + 2 * r;
		this.z = 0;
		this.top = h + 0.4 * m;
		this.corners = bboxCorners(frame, this.a, this.b, this.wa, this.wb, 0, this.top);

		this.base = frame.lift(ca, cb, 0);
		this.poleTop = frame.lift(ca, cb, h);
		// The arm rises a little toward its end, where a flat head hangs
		this.armMid = frame.lift(ca + da * arm * 0.5, cb + db * arm * 0.5, h + 0.25 * m);
		this.armEnd = frame.lift(ea, eb, h + 0.15 * m);
		const len = 0.7 * m;
		const wid = 0.3 * m;
		const alongA = da !== 0;
		this.head = new PBox(frame, {
			a: ea - (alongA ? len / 2 : wid / 2),
			b: eb - (alongA ? wid / 2 : len / 2),
			wa: alongA ? len : wid,
			wb: alongA ? wid : len,
			z: h - 0.05 * m,
			h: 0.18 * m,
		});
		this.ppm = pixelsPerMetre(frame, ca, cb);
	}
}

class PBench {
	/**
	 * Bench whose seat runs along `axis` ("a" or "b") from (a, b), `len` long.
	 * back: -1 or 1, the side (across the seat) where the backrest stands.
	 */
	constructor(frame, {a, b, axis, len, back}) {
		this.kind = "bench";
		this.frame = frame;
		const m = frame.metre;
		const depth = 0.5 * m;
		const across = (o) => (axis === "a" ? {a, b: b + o, wa: len, wb: 0.06 * m} : {a: a + o, b, wa: 0.06 * m, wb: len});
		const seat = axis === "a" ? {a, b, wa: len, wb: depth} : {a, b, wa: depth, wb: len};
		this.a = seat.a;
		this.b = seat.b;
		this.wa = seat.wa;
		this.wb = seat.wb;
		this.z = 0;
		this.top = 0.9 * m;
		this.corners = bboxCorners(frame, this.a, this.b, this.wa, this.wb, 0, this.top);

		this.seat = new PBox(frame, {...seat, z: 0.42 * m, h: 0.06 * m});
		this.back = new PBox(frame, {...across(back > 0 ? depth - 0.06 * m : 0), z: 0.5 * m, h: 0.4 * m});
		// Legs at the four corners of the seat, from the ground up to it
		const legs = [];
		for (const [i, j] of [
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1],
		]) {
			const la = seat.a + i * seat.wa;
			const lb = seat.b + j * seat.wb;
			legs.push([frame.lift(la, lb, 0), frame.lift(la, lb, 0.42 * m)]);
		}
		this.legs = legs;
		// Draw the backrest first when it is the farther part
		const cam = frame.camera();
		const backCentre = axis === "a" ? b + (back > 0 ? depth : 0) : a + (back > 0 ? depth : 0);
		const eye = axis === "a" ? cam.b : cam.a;
		const seatCentre = axis === "a" ? b + depth / 2 : a + depth / 2;
		this.backFirst = Math.abs(backCentre - eye) > Math.abs(seatCentre - eye);
	}
}
