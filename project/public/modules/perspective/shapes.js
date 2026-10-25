// ============================================================================
// SHAPES — boxes constructed on a ground frame
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
	/** Footprint [a, a+wa] x [b, b+wb], from height z to z+h, in frame units. */
	constructor(frame, {a, b, wa, wb, h, z = 0, ...style}) {
		this.frame = frame;
		this.a = a;
		this.b = b;
		this.wa = wa;
		this.wb = wb;
		this.h = h;
		this.z = z;
		this.style = style;

		this.corners = {};
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				for (let k = 0; k < 2; k++) {
					this.corners[`${i}${j}${k}`] = frame.lift(a + i * wa, b + j * wb, z + k * h);
				}
			}
		}

		this.faces = this.visibleFaces(frame.camera());
		this.edges = this.collectEdges();
	}

	/** A face is visible when the eye sits on its outer side. */
	visibleFaces(cam) {
		const out = [];
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
			const def = BOX_FACES[name];
			out.push({name, axis: def.axis, keys: def.corners, poly: def.corners.map((c) => this.corners[c])});
		}
		return out;
	}

	/** Unique edges of the visible faces, tagged with the axis they run along. */
	collectEdges() {
		const seen = new Set();
		const edges = [];
		for (const face of this.faces) {
			for (let i = 0; i < 4; i++) {
				const k0 = face.keys[i];
				const k1 = face.keys[(i + 1) % 4];
				const id = k0 < k1 ? k0 + k1 : k1 + k0;
				if (seen.has(id)) continue;
				seen.add(id);
				const axis = k0[0] !== k1[0] ? "a" : k0[1] !== k1[1] ? "b" : "k";
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

	faceWidth(faceName) {
		return faceName[0] === "a" ? this.wb : this.wa;
	}
}

/**
 * Order boxes back to front. Boxes are axis aligned in the frame: when a plane
 * along an axis separates two boxes, the one on the far side of the eye can't
 * hide the other.
 */
function sortForPainter(boxes, cam) {
	const n = boxes.length;
	const ranges = boxes.map((bx) => ({
		a: [bx.a, bx.a + bx.wa],
		b: [bx.b, bx.b + bx.wb],
		k: [bx.z, bx.z + bx.h],
	}));
	const bounds = boxes.map((bx) => {
		const xs = Object.values(bx.corners).map((p) => p.x);
		const ys = Object.values(bx.corners).map((p) => p.y);
		return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
	});

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
	const ready = [];
	for (let i = 0; i < n; i++) if (indeg[i] === 0) ready.push(i);
	const order = [];
	while (ready.length) {
		ready.sort((x, y) => dist[x] - dist[y]);
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

/** Check every receding edge runs through its VP and verticals stay vertical. */
function validatePerspective(scene, boxes, eps = 1e-6) {
	let checked = 0;
	const errors = [];
	for (const bx of boxes) {
		for (const e of bx.edges) {
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
