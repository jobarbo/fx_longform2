// ============================================================================
// RENDER — draws a composition in graphite on a p5.Graphics
// ============================================================================

const PAPER = [42, 9, 95];
const GRAPHITE = [225, 14, 20];
const HATCH_ANGLE = 62;

function renderPerspective(g, comp, {W, H, construction = true, debug = false}) {
	drawPaper(g, W, H, PAPER);

	for (const l of comp.groundLines) pencilLine(g, l.p, l.q, {...PENCIL_PRESETS[l.preset], ink: GRAPHITE});
	for (const bx of comp.boxes) drawBox(g, bx, comp);

	// Construction goes on top: like a hand drawing, it is never erased
	if (construction) drawConstruction(g, comp, W);
	if (debug) drawDebug(g, comp, W, H);
}

function drawBox(g, bx, comp) {
	const minFace = 1.5;
	for (const face of bx.faces) {
		g.noStroke();
		g.fill(PAPER[0], PAPER[1], PAPER[2]);
		g.beginShape();
		for (const p of face.poly) g.vertex(p.x, p.y);
		g.endShape(CLOSE);

		if (Math.abs(polygonSignedArea(face.poly)) < minFace) continue;
		const shade = comp.shades[face.name];
		if (shade === 1) pencilHatch(g, face.poly, {angle: HATCH_ANGLE, spacing: 9, ink: GRAPHITE});
		if (shade === 2) pencilHatch(g, face.poly, {angle: HATCH_ANGLE, spacing: 4.5, alpha: 34, ink: GRAPHITE});
		if (bx.style.windows && face.axis) drawWindows(g, bx, face);
	}
	for (const e of bx.edges) pencilLine(g, e.p, e.q, {ink: GRAPHITE});
}

function drawWindows(g, bx, face) {
	const floorH = bx.style.floorH;
	const floors = Math.floor(bx.h / floorH);
	const cols = Math.max(1, Math.round(bx.faceWidth(face.name) / bx.style.colW));
	if (floors < 2) return;

	// Skip windows that would be smaller than a pencil tip
	const probe = [bx.facePoint(face.name, 0, 0), bx.facePoint(face.name, 1 / cols, 0)];
	if (Math.hypot(probe[1].x - probe[0].x, probe[1].y - probe[0].y) < 4) return;

	const r = pencilRng(bx.a, bx.b, bx.wa, face.name.charCodeAt(0) + face.name.charCodeAt(1));
	const mu = 0.24;
	const mv = 0.28;
	for (let row = 1; row < floors; row++) {
		for (let c = 0; c < cols; c++) {
			const u0 = (c + mu) / cols;
			const u1 = (c + 1 - mu) / cols;
			const v0 = (row + mv) / floors;
			const v1 = (row + 1 - mv * 0.6) / floors;
			const quad = [bx.facePoint(face.name, u0, v0), bx.facePoint(face.name, u1, v0), bx.facePoint(face.name, u1, v1), bx.facePoint(face.name, u0, v1)];
			pencilPolyline(g, quad, {...PENCIL_PRESETS.detail, ink: GRAPHITE}, true);
			if (r() < 0.35) pencilHatch(g, quad, {angle: HATCH_ANGLE, spacing: 2.4, alpha: 40, ink: GRAPHITE});
		}
	}
}

function drawConstruction(g, comp, W) {
	const s = comp.scene;
	const hy = s.horizonY;
	const opts = {...PENCIL_PRESETS.construction, ink: GRAPHITE};
	pencilLine(g, pt(-40, hy), pt(W + 40, hy), {...opts, alpha: 34, weight: 0.6});
	for (const vp of s.vanishingPoints()) drawVpMark(g, vp, opts);

	// Every receding edge is carried on to its vanishing point
	for (const bx of comp.boxes) {
		for (const e of bx.edges) {
			const vp = e.axis === "a" ? s.vpA : e.axis === "b" ? s.vpB : null;
			if (!vp) continue;
			if (Math.hypot(e.q.x - e.p.x, e.q.y - e.p.y) < 2) continue;
			const near = Math.hypot(e.p.x - vp.x, e.p.y - vp.y) < Math.hypot(e.q.x - vp.x, e.q.y - vp.y) ? e.p : e.q;
			pencilLine(g, near, vp, opts);
		}
	}
}

function drawVpMark(g, vp, opts) {
	const r = 7;
	const strong = {...opts, alpha: 55, weight: 0.7};
	pencilLine(g, pt(vp.x - r * 1.6, vp.y), pt(vp.x + r * 1.6, vp.y), strong);
	pencilLine(g, pt(vp.x, vp.y - r * 1.6), pt(vp.x, vp.y + r * 1.6), strong);
	const ring = [];
	for (let i = 0; i < 18; i++) ring.push(pt(vp.x + Math.cos((i / 18) * Math.PI * 2) * r, vp.y + Math.sin((i / 18) * Math.PI * 2) * r));
	pencilPolyline(g, ring, strong, true);
}

/** Straight coloured overlay: VPs, measuring points, measuring line, edge rays. */
function drawDebug(g, comp, W, H) {
	const s = comp.scene;
	const fr = comp.frame;
	const dbg = (hue, alpha = 80) => ({...PENCIL_PRESETS.debug, ink: [hue, 85, 85], alpha});

	g.push();
	for (const bx of comp.boxes) {
		for (const e of bx.edges) {
			const vp = e.axis === "a" ? s.vpA : e.axis === "b" ? s.vpB : null;
			if (vp) pencilLine(g, e.p, vp, dbg(e.axis === "a" ? 20 : 205, 14));
		}
	}

	const marks = s.mode === "1pt" ? [s.dp] : [s.mpLeft, s.mpRight];
	for (const vp of s.vanishingPoints()) markCross(g, vp, 12, dbg(0));
	for (const m of marks) markCross(g, m, 9, dbg(280));

	// Measuring line through the frame origin, with the ticks of the first boxes
	const o = fr.origin;
	pencilLine(g, pt(o.x - W, o.y), pt(o.x + W, o.y), dbg(280, 40));
	for (const bx of comp.boxes.slice(-6)) {
		for (const [axis, len] of [
			["a", bx.a],
			["b", bx.b],
		]) {
			const m = s.measure(o, len, axis);
			if (!m.via) continue;
			markCross(g, m.mark, 4, dbg(280, 60));
			pencilLine(g, m.mark, m.via, dbg(280, 25));
		}
	}
	markCross(g, o, 6, dbg(120));

	g.noStroke();
	g.fill(0, 0, 10, 90);
	g.textSize(12);
	g.textAlign(LEFT, BOTTOM);
	const cam = fr.camera();
	g.text(`${s.mode}  boxes ${comp.boxes.length}  eye ${cam.k.toFixed(0)}  d ${s.d.toFixed(0)}`, 12, H - 12);
	g.pop();
}

function markCross(g, p, r, opts) {
	pencilLine(g, pt(p.x - r, p.y), pt(p.x + r, p.y), opts);
	pencilLine(g, pt(p.x, p.y - r), pt(p.x, p.y + r), opts);
}
