// ============================================================================
// SHAPES — boxes (with optional gable roof) constructed on a ground frame
// ============================================================================

// Corner key "ijk": i along a, j along b, k up (0 = min, 1 = max)
const BOX_FACES = {
	a0: {corners: ["000", "010", "011", "001"], axis: "b"},
	a1: {corners: ["100", "110", "111", "101"], axis: "b"},
	b0: {corners: ["000", "100", "101", "001"], axis: "a"},
	b1: {corners: ["010", "110", "111", "011"], axis: "a"},
	k0: {corners: ["000", "100", "110", "010"], axis: null},
	k1: {corners: ["001", "101", "111", "011"], axis: null},
};

class PBox {
	/**
	 * Footprint [a, a+wa] x [b, b+wb], walls from height z to z+h, in frame units.
	 * roof: {axis: "a" | "b", height} adds a gable roof whose ridge runs along axis.
	 */
	constructor(frame, {a, b, wa, wb, h, z = 0, roof = null, ...style}) {
		this.kind = "box";
		this.frame = frame;
		this.a = a;
		this.b = b;
		this.wa = wa;
		this.wb = wb;
		this.h = h;
		this.z = z;
		this.roof = roof;
		this.top = z + h + (roof ? roof.height : 0);
		this.style = style;

		this.corners = {};
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				for (let k = 0; k < 2; k++) {
					this.corners[`${i}${j}${k}`] = frame.lift(a + i * wa, b + j * wb, z + k * h);
				}
			}
		}
		if (roof) {
			const kr = this.top;
			const [r0, r1] =
				roof.axis === "a"
					? [frame.lift(a, b + wb / 2, kr), frame.lift(a + wa, b + wb / 2, kr)]
					: [frame.lift(a + wa / 2, b, kr), frame.lift(a + wa / 2, b + wb, kr)];
			this.corners.R0 = r0;
			this.corners.R1 = r1;
		}

		this.faces = this.visibleFaces(frame.camera());
		this.edges = this.collectEdges();
	}

	/** A face is visible when the eye sits on its outer side. */
	visibleFaces(cam) {
		const out = [];
		const add = (name, keys, kind, shadeAs, axis = null) => {
			out.push({name, kind, shadeAs, axis, keys, poly: keys.map((c) => this.corners[c])});
		};
		const test = {
			a0: cam.a < this.a,
			a1: cam.a > this.a + this.wa,
			b0: cam.b < this.b,
			b1: cam.b > this.b + this.wb,
			k0: cam.k < this.z,
			k1: cam.k > this.z + this.h,
		};
		for (const name in BOX_FACES) {
			if (!test[name]) continue;
			if (name === "k1" && this.roof) continue;
			const def = BOX_FACES[name];
			add(name, def.corners, def.axis ? "wall" : name === "k1" ? "top" : "bottom", name, def.axis);
		}
		if (!this.roof) return out;

		// Gable roof: two slopes, two triangular gables
		const hr = this.roof.height;
		const dk = cam.k - (this.z + this.h);
		if (this.roof.axis === "a") {
			const half = this.wb / 2;
			if ((cam.b - this.b) * -hr + dk * half > 0) add("rb0", ["001", "101", "R1", "R0"], "slope", "b0");
			if ((cam.b - this.b - this.wb) * hr + dk * half > 0) add("rb1", ["011", "111", "R1", "R0"], "slope", "b1");
			if (test.a0) add("ga0", ["001", "011", "R0"], "gable", "a0");
			if (test.a1) add("ga1", ["101", "111", "R1"], "gable", "a1");
		} else {
			const half = this.wa / 2;
			if ((cam.a - this.a) * -hr + dk * half > 0) add("ra0", ["001", "011", "R1", "R0"], "slope", "a0");
			if ((cam.a - this.a - this.wa) * hr + dk * half > 0) add("ra1", ["101", "111", "R1", "R0"], "slope", "a1");
			if (test.b0) add("gb0", ["001", "101", "R0"], "gable", "b0");
			if (test.b1) add("gb1", ["011", "111", "R1"], "gable", "b1");
		}
		return out;
	}

	/** Unique edges of the visible faces, tagged with the axis they run along. */
	collectEdges() {
		const seen = new Set();
		const edges = [];
		for (const face of this.faces) {
			const n = face.keys.length;
			for (let i = 0; i < n; i++) {
				const k0 = face.keys[i];
				const k1 = face.keys[(i + 1) % n];
				const id = k0 < k1 ? k0 + k1 : k1 + k0;
				if (seen.has(id)) continue;
				seen.add(id);
				let axis;
				if (k0[0] === "R" || k1[0] === "R") axis = k0[0] === k1[0] ? this.roof.axis : "slope";
				else axis = k0[0] !== k1[0] ? "a" : k0[1] !== k1[1] ? "b" : "k";
				edges.push({p: this.corners[k0], q: this.corners[k1], axis});
			}
		}
		return edges;
	}

	/** Map (u, v) in [0,1]² on a vertical face to the screen. */
	facePoint(faceName, u, v) {
		const z = this.z + v * this.h;
		switch (faceName) {
			case "a0":
				return this.frame.lift(this.a, this.b + u * this.wb, z);
			case "a1":
				return this.frame.lift(this.a + this.wa, this.b + u * this.wb, z);
			case "b0":
				return this.frame.lift(this.a + u * this.wa, this.b, z);
			case "b1":
				return this.frame.lift(this.a + u * this.wa, this.b + this.wb, z);
		}
		return null;
	}

	/** Map (u, t) on a roof slope to the screen: u along the ridge, t from eave (0) to ridge (1). */
	slopePoint(faceName, u, t) {
		const k = this.z + this.h + t * this.roof.height;
		switch (faceName) {
			case "rb0":
				return this.frame.lift(this.a + u * this.wa, this.b + (t * this.wb) / 2, k);
			case "rb1":
				return this.frame.lift(this.a + u * this.wa, this.b + this.wb - (t * this.wb) / 2, k);
			case "ra0":
				return this.frame.lift(this.a + (t * this.wa) / 2, this.b + u * this.wb, k);
			case "ra1":
				return this.frame.lift(this.a + this.wa - (t * this.wa) / 2, this.b + u * this.wb, k);
		}
		return null;
	}

	faceWidth(faceName) {
		return faceName[0] === "a" ? this.wb : this.wa;
	}
}

/**
 * Order items back to front. Every item (box, cylinder, tree) has an axis
 * aligned bounding box in the frame (a, b, wa, wb, z, top) and its corners on
 * screen. When a plane along an axis separates two items, the one on the far
 * side of the eye can't hide the other.
 */
function sortForPainter(boxes, cam) {
	const n = boxes.length;
	const ranges = boxes.map((bx) => ({
		a: [bx.a, bx.a + bx.wa],
		b: [bx.b, bx.b + bx.wb],
		k: [bx.z, bx.top],
	}));
	const bounds = boxes.map(screenBounds);

	// +1: draw i after j, -1: draw j after i, 0: no constraint
	function compare(i, j) {
		const bi = bounds[i];
		const bj = bounds[j];
		if (bi[2] <= bj[0] || bj[2] <= bi[0] || bi[3] <= bj[1] || bj[3] <= bi[1]) return 0;
		let verdict = 0;
		for (const axis of ["a", "b", "k"]) {
			const ri = ranges[i][axis];
			const rj = ranges[j][axis];
			const c = cam[axis];
			let v = 0;
			if (ri[1] <= rj[0]) v = c <= ri[1] ? 1 : c >= rj[0] ? -1 : 0;
			else if (rj[1] <= ri[0]) v = c <= rj[1] ? -1 : c >= ri[0] ? 1 : 0;
			if (v === 0) continue;
			// Separating planes that disagree mean the boxes can't overlap on screen
			if (verdict !== 0 && v !== verdict) return 0;
			verdict = v;
		}
		return verdict;
	}

	// Kahn's topological sort: an edge j -> i means draw j before i
	const after = Array.from({length: n}, () => []);
	const indeg = new Array(n).fill(0);
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const c = compare(i, j);
			if (c === 1) {
				after[j].push(i);
				indeg[i]++;
			} else if (c === -1) {
				after[i].push(j);
				indeg[j]++;
			}
		}
	}

	// Fallback ordering: farthest from the eye first
	const dist = ranges.map((r) => {
		const da = Math.max(r.a[0] - cam.a, 0, cam.a - r.a[1]);
		const db = Math.max(r.b[0] - cam.b, 0, cam.b - r.b[1]);
		return Math.hypot(da, db);
	});
	const ready = new MaxHeap((i) => dist[i]);
	for (let i = 0; i < n; i++) if (indeg[i] === 0) ready.push(i);
	const order = [];
	while (ready.size) {
		const i = ready.pop();
		order.push(boxes[i]);
		for (const j of after[i]) if (--indeg[j] === 0) ready.push(j);
	}
	// Cycles (should not happen for disjoint boxes): append what is left
	if (order.length < n) {
		const placed = new Set(order);
		boxes.filter((bx) => !placed.has(bx)).forEach((bx) => order.push(bx));
	}
	return order;
}

/** Screen bounding rectangle [x0, y0, x1, y1] of an item's corners. */
function screenBounds(it) {
	const pts = Object.values(it.corners);
	const xs = pts.map((p) => p.x);
	const ys = pts.map((p) => p.y);
	return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function pointInConvex(p, poly) {
	let sign = 0;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const c = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
		if (c === 0) continue;
		if (sign === 0) sign = Math.sign(c);
		else if (Math.sign(c) !== sign) return false;
	}
	return true;
}

/**
 * Drop items that a single opaque face drawn later covers completely: in
 * painter order they would be painted over anyway. `margin` keeps the pencil
 * overshoot of the hidden item covered too.
 */
function cullHidden(items, margin = 10) {
	const bounds = items.map(screenBounds).map(([x0, y0, x1, y1]) => [x0 - margin, y0 - margin, x1 + margin, y1 + margin]);
	const occluders = items.map((it) => (it.kind === "box" ? it.faces.map((f) => f.poly) : it.kind === "cylinder" ? [it.outline] : []));
	const occBounds = occluders.map((polys) => polys.map((poly) => [Math.min(...poly.map((p) => p.x)), Math.min(...poly.map((p) => p.y)), Math.max(...poly.map((p) => p.x)), Math.max(...poly.map((p) => p.y))]));
	return items.filter((it, i) => {
		const [x0, y0, x1, y1] = bounds[i];
		const corners = [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)];
		for (let j = i + 1; j < items.length; j++) {
			for (let f = 0; f < occluders[j].length; f++) {
				const ob = occBounds[j][f];
				if (ob[0] > x0 || ob[1] > y0 || ob[2] < x1 || ob[3] < y1) continue;
				if (corners.every((c) => pointInConvex(c, occluders[j][f]))) return false;
			}
		}
		return true;
	});
}

/** Binary max-heap of indices, keyed by `key(i)`. */
class MaxHeap {
	constructor(key) {
		this.key = key;
		this.data = [];
	}

	get size() {
		return this.data.length;
	}

	push(i) {
		const d = this.data;
		d.push(i);
		let c = d.length - 1;
		while (c > 0) {
			const p = (c - 1) >> 1;
			if (this.key(d[p]) >= this.key(d[c])) break;
			[d[p], d[c]] = [d[c], d[p]];
			c = p;
		}
	}

	pop() {
		const d = this.data;
		const topItem = d[0];
		const last = d.pop();
		if (d.length) {
			d[0] = last;
			let p = 0;
			for (;;) {
				const l = p * 2 + 1;
				const r = l + 1;
				let m = p;
				if (l < d.length && this.key(d[l]) > this.key(d[m])) m = l;
				if (r < d.length && this.key(d[r]) > this.key(d[m])) m = r;
				if (m === p) break;
				[d[p], d[m]] = [d[m], d[p]];
				p = m;
			}
		}
		return topItem;
	}
}

/** Check every receding edge runs through its VP and verticals stay vertical (pitched roof edges excepted). */
function validatePerspective(scene, boxes, eps = 1e-6) {
	let checked = 0;
	const errors = [];
	for (const bx of boxes) {
		if (bx.kind !== "box") continue;
		for (const e of bx.edges) {
			if (e.axis === "slope") continue;
			const len = Math.hypot(e.q.x - e.p.x, e.q.y - e.p.y);
			if (len < 1e-9) continue;
			let err;
			if (e.axis === "k") err = Math.abs(e.q.x - e.p.x);
			else {
				const vp = e.axis === "a" ? scene.vpA : scene.vpB;
				err = vp ? distPointToLine(vp, e.p, e.q) : Math.abs(e.q.y - e.p.y);
			}
			checked++;
			if (err > eps * Math.max(1, len)) errors.push({box: bx, edge: e, err});
		}
	}
	if (errors.length) console.warn(`[perspective] ${errors.length}/${checked} edges off their VP`, errors);
	else console.log(`[perspective] ${checked} edges validated against their VPs`);
	return errors;
}
