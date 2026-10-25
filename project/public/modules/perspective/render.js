// ============================================================================
// RENDER — draws a composition in graphite on a p5.Graphics
// ============================================================================

const PAPER = [42, 9, 95];
const GRAPHITE = [225, 14, 20];
const HATCH_ANGLE = 62;

function renderPerspective(g, comp, {W, H, debug = false}) {
	setPencilBounds([-30, -30, W + 30, H + 30]);
	drawPaper(g, W, H, PAPER);

	for (const l of comp.groundLines) pencilLine(g, l.p, l.q, {...PENCIL_PRESETS[l.preset], ink: GRAPHITE});
	for (const it of comp.items) drawItem(g, it, comp);

	// Construction (horizon, VP marks, vanishing lines) only shows in debug mode
	if (debug) {
		drawConstruction(g, comp, W);
		drawDebug(g, comp, W, H);
	}
}

function drawItem(g, it, comp) {
	if (it.kind === "box") drawBox(g, it, comp);
	else if (it.kind === "cylinder") drawCylinder(g, it, comp);
	else if (it.kind === "tree") drawTree(g, it, comp);
	else if (it.kind === "lamp") drawLamp(g, it, comp);
	else if (it.kind === "bench") drawBench(g, it, comp);
}

function fillPaper(g, poly) {
	g.noStroke();
	g.fill(PAPER[0], PAPER[1], PAPER[2]);
	g.beginShape();
	for (const p of poly) g.vertex(p.x, p.y);
	g.endShape(CLOSE);
}

/** Hatching for a shade level: 0 lit, 1 half-tone, 2 shadow. */
function shadeHatch(g, poly, shade) {
	if (shade === 1) pencilHatch(g, poly, {angle: HATCH_ANGLE, spacing: 9, ink: GRAPHITE});
	if (shade === 2) pencilHatch(g, poly, {angle: HATCH_ANGLE, spacing: 4.5, alpha: 34, ink: GRAPHITE});
}

/** Walls and flat roofs follow the light table; gables like their wall; slopes one step lighter than the wall they face. */
function faceShade(face, shades) {
	if (face.kind === "slope") return Math.max(0, shades[face.shadeAs] - 1);
	return shades[face.shadeAs];
}

function drawBox(g, bx, comp, edgeOpts = {ink: GRAPHITE}) {
	const minFace = 1.5;
	for (const face of bx.faces) {
		fillPaper(g, face.poly);
		if (Math.abs(polygonSignedArea(face.poly)) < minFace) continue;
		shadeHatch(g, face.poly, faceShade(face, comp.shades));
		if (face.kind === "wall" && bx.style.windows && bx.style.facade) drawFacade(g, bx, face);
		if (face.kind === "slope") drawRoofCourses(g, bx, face);
	}
	for (const e of bx.edges) pencilLine(g, e.p, e.q, edgeOpts);
}

// ----------------------------------------------------------------------------
// Facades
// ----------------------------------------------------------------------------

const DETAIL = {...PENCIL_PRESETS.detail, ink: GRAPHITE};
const FAINT = {...PENCIL_PRESETS.detail, alpha: 26, ink: GRAPHITE};

function faceQuad(bx, face, u0, u1, v0, v1) {
	const f = face.name;
	return [bx.facePoint(f, u0, v0), bx.facePoint(f, u1, v0), bx.facePoint(f, u1, v1), bx.facePoint(f, u0, v1)];
}

/** Draw a window-like quad unless it is smaller than a pencil tip. */
function strokeQuad(g, quad, opts = DETAIL, minSize = 1.5) {
	if (Math.hypot(quad[2].x - quad[0].x, quad[2].y - quad[0].y) < minSize) return false;
	pencilPolyline(g, quad, opts, true);
	return true;
}

function faceLine(g, bx, face, u0, v0, u1, v1, opts = FAINT) {
	pencilLine(g, bx.facePoint(face.name, u0, v0), bx.facePoint(face.name, u1, v1), opts);
}

/** Facade layout: storeys, columns, and the on-screen size of one column at the near end. */
function facadeMetrics(bx, face) {
	const floors = Math.max(1, Math.round(bx.h / bx.style.floorH));
	const cols = Math.max(1, Math.round(bx.faceWidth(face.name) / bx.style.colW));
	const size = (u, v) => {
		const p = bx.facePoint(face.name, u, v);
		const q = bx.facePoint(face.name, Math.min(1, u + 1 / cols), Math.min(1, v + 1 / floors));
		return Math.max(Math.abs(q.x - p.x), Math.abs(q.y - p.y));
	};
	return {floors, cols, px: Math.max(size(0, 0), size(1 - 1 / cols, 0))};
}

function drawFacade(g, bx, face) {
	const fm = facadeMetrics(bx, face);
	if (fm.px < 3) return;
	const r = pencilRng(bx.a, bx.b, bx.z, face.name.charCodeAt(0) + face.name.charCodeAt(1));
	switch (bx.style.facade) {
		case "house":
			return facadeHouse(g, bx, face, fm, r);
		case "storefront":
			return facadeStorefront(g, bx, face, fm, r);
		case "ribbon":
			return facadeRibbon(g, bx, face, fm, r);
		case "curtain":
			return facadeCurtain(g, bx, face, fm, r);
		case "industrial":
			return facadeIndustrial(g, bx, face, fm, r);
		case "chimney":
			return facadeChimney(g, bx, face);
		default:
			return facadeGrid(g, bx, face, fm, r, 0, true);
	}
}

/**
 * A door on the ground floor, centred at u, sized in metres. Only boxes standing
 * on the ground get doors. Returns false when it is too small to draw.
 */
function drawDoor(g, bx, face, u, widthM, heightM, {double = false, glass = false, canopy = false} = {}) {
	if (bx.z > 0) return false;
	const m = bx.frame.metre;
	const hu = (widthM * m) / bx.faceWidth(face.name) / 2;
	const v1 = Math.min((heightM * m) / bx.h, 0.9);
	const quad = faceQuad(bx, face, u - hu, u + hu, 0, v1);
	if (!strokeQuad(g, quad, DETAIL, 2)) return false;
	if (double) faceLine(g, bx, face, u, 0, u, v1);
	if (glass) pencilHatch(g, quad, {angle: HATCH_ANGLE + 20, spacing: 3, alpha: 20, ink: GRAPHITE});
	else faceLine(g, bx, face, u - hu * 0.6, v1 * 0.55, u - hu * 0.45, v1 * 0.55, DETAIL); // handle
	if (canopy) {
		const vc = v1 + (0.25 * m) / bx.h;
		faceLine(g, bx, face, u - hu * 1.6, vc, u + hu * 1.6, vc, DETAIL);
	}
	return true;
}

/** Column centres where a facade gets its entrances: one every `spacingM` metres, at least one. */
function entranceColumns(bx, face, cols, spacingM, r) {
	const count = Math.max(1, Math.round(bx.faceWidth(face.name) / (spacingM * bx.frame.metre)));
	const out = new Set();
	for (let k = 0; k < count; k++) {
		const jitter = count === 1 ? floor(r() * cols) : Math.round(((k + 0.5) * cols) / count - 0.5);
		out.add(Math.min(cols - 1, Math.max(0, jitter)));
	}
	return out;
}

/** Punched windows on every storey from `firstRow` up, some dark panes; entrance doors on the ground floor. */
function facadeGrid(g, bx, face, {floors, cols}, r, firstRow, doors = false) {
	const mu = 0.24;
	const mv = 0.28;
	const entrances = doors && bx.z === 0 ? entranceColumns(bx, face, cols, 25, r) : new Set();
	for (const c of entrances) drawDoor(g, bx, face, (c + 0.5) / cols, 1.8, 2.4, {double: true, canopy: true});
	for (let row = firstRow; row < floors; row++) {
		for (let c = 0; c < cols; c++) {
			if (row === 0 && entrances.has(c)) continue;
			const quad = faceQuad(bx, face, (c + mu) / cols, (c + 1 - mu) / cols, (row + mv) / floors, (row + 1 - mv * 0.6) / floors);
			if (strokeQuad(g, quad) && r() < 0.35) pencilHatch(g, quad, {angle: HATCH_ANGLE, spacing: 2.4, alpha: 40, ink: GRAPHITE});
		}
	}
}

/** A few windows per storey; the front door is on one of the walls the eye sees. */
function facadeHouse(g, bx, face, fm, r) {
	const {floors, cols} = fm;
	const walls = bx.faces.filter((f) => f.kind === "wall");
	const doorWall = walls[floor(pencilRng(bx.a, bx.b, 11)() * walls.length)];
	const door = doorWall === face ? floor(r() * cols) : -1;
	if (door >= 0) drawDoor(g, bx, face, (door + 0.5) / cols, 1, 2.1, {canopy: r() < 0.5});
	for (let row = 0; row < floors; row++) {
		for (let c = 0; c < cols; c++) {
			if (row === 0 && c === door) continue;
			const quad = faceQuad(bx, face, (c + 0.3) / cols, (c + 0.7) / cols, (row + 0.32) / floors, (row + 0.78) / floors);
			if (strokeQuad(g, quad)) faceLineQuadCross(g, quad);
		}
	}
}

/** Window bars: a cross in the pane. */
function faceLineQuadCross(g, quad) {
	pencilLine(g, lerpPt(quad[0], quad[1], 0.5), lerpPt(quad[3], quad[2], 0.5), FAINT);
}

/** Shop windows and a sign band on the ground floor, punched windows above. */
function facadeStorefront(g, bx, face, fm, r) {
	const {floors, cols} = fm;
	const f = 1 / floors;
	strokeQuad(g, faceQuad(bx, face, 0.02, 0.98, 0.8 * f, 0.95 * f));
	// One shop door per face, the other bays are shop windows
	const door = bx.z === 0 ? floor(r() * cols) : -1;
	for (let c = 0; c < cols; c++) {
		if (c === door && drawDoor(g, bx, face, (c + 0.5) / cols, 1.6, 2.4, {double: true, glass: true})) continue;
		const quad = faceQuad(bx, face, (c + 0.06) / cols, (c + 0.94) / cols, 0.06 * f, 0.7 * f);
		if (strokeQuad(g, quad) && r() < 0.4) pencilHatch(g, quad, {angle: HATCH_ANGLE + 20, spacing: 3.5, alpha: 24, ink: GRAPHITE});
	}
	if (floors > 1) facadeGrid(g, bx, face, fm, r, 1);
	if (bx.style.awning && bx.z === 0) for (let c = 0; c < cols; c++) drawAwning(g, bx, face, (c + 0.03) / cols, (c + 0.97) / cols);
}

/**
 * Shop awning from the wall above the window out over the sidewalk, with a
 * hanging valance. Seen from eye level it shows its underside.
 */
function drawAwning(g, bx, face, u0, u1) {
	const m = bx.frame.metre;
	const {depth, striped} = bx.style.awning;
	const zTop = 0.78 * bx.style.floorH;
	const zLow = Math.max(2.3 * m, zTop - 0.8 * m);
	const vt = zTop / bx.h;
	const vb = zLow / bx.h;
	const vv = (zLow - 0.25 * m) / bx.h;
	const P = (u, v, out) => bx.facePointOut(face.name, u, v, out);
	const T0 = P(u0, vt, 0);
	const T1 = P(u1, vt, 0);
	const B0 = P(u0, vb, depth);
	const B1 = P(u1, vb, depth);
	if (Math.hypot(B0.x - T0.x, B0.y - T0.y) < 2) return;

	const canvas = [T0, T1, B1, B0];
	fillPaper(g, canvas);
	if (bx.frame.camera().k < zTop) pencilHatch(g, canvas, {angle: HATCH_ANGLE, spacing: 6, alpha: 24, ink: GRAPHITE});
	if (striped) {
		// Stripes run from the wall to the edge, so they head for the VP of the wall's normal
		const n = Math.max(2, Math.round((bx.faceWidth(face.name) * (u1 - u0)) / (0.5 * m)));
		for (let i = 0; i < n; i += 2) {
			const ua = u0 + ((u1 - u0) * i) / n;
			const ub = u0 + ((u1 - u0) * (i + 1)) / n;
			pencilHatch(g, [P(ua, vt, 0), P(ub, vt, 0), P(ub, vb, depth), P(ua, vb, depth)], {angle: HATCH_ANGLE + 25, spacing: 2.6, alpha: 30, ink: GRAPHITE});
		}
	}
	pencilPolyline(g, canvas, DETAIL, true);

	// End panels the eye can see (outer side toward the eye along the wall)
	const cam = bx.frame.camera();
	const alongB = face.name[0] === "a";
	const camU = alongB ? cam.b : cam.a;
	const uAt = (u) => (alongB ? bx.b + u * bx.wb : bx.a + u * bx.wa);
	for (const [u, show] of [
		[u0, camU < uAt(u0)],
		[u1, camU > uAt(u1)],
	]) {
		if (!show) continue;
		const side = [P(u, vt, 0), P(u, vb, depth), P(u, vv, depth), P(u, vv, 0)];
		fillPaper(g, side);
		pencilPolyline(g, side, DETAIL, true);
	}

	// Valance hanging from the front edge
	const valance = [B0, B1, P(u1, vv, depth), P(u0, vv, depth)];
	fillPaper(g, valance);
	pencilPolyline(g, valance, DETAIL, true);
}

/** Continuous glazed band on every storey, with mullions; a lobby entrance below. */
function facadeRibbon(g, bx, face, {floors, cols}, r) {
	const lobby = drawDoor(g, bx, face, 0.3 + r() * 0.4, 3.6, 3, {double: true, glass: true, canopy: true});
	for (let row = lobby ? 1 : 0; row < floors; row++) {
		const v0 = (row + 0.3) / floors;
		const v1 = (row + 0.82) / floors;
		const band = faceQuad(bx, face, 0.015, 0.985, v0, v1);
		if (!strokeQuad(g, band)) continue;
		if (r() < 0.3) pencilHatch(g, band, {angle: HATCH_ANGLE + 20, spacing: 3.2, alpha: 20, ink: GRAPHITE});
		for (let c = 1; c < cols; c++) faceLine(g, bx, face, c / cols, v0, c / cols, v1);
	}
}

/** Glass curtain wall: mullions and floor lines over the whole face, a few reflections. */
function facadeCurtain(g, bx, face, {floors, cols, px}, r) {
	// Thin out the grid when it would turn into a grey smudge
	const stepC = px < 6 ? 4 : px < 10 ? 2 : 1;
	for (let c = stepC; c < cols; c += stepC) faceLine(g, bx, face, c / cols, 0, c / cols, 1);
	for (let row = 1; row < floors; row++) faceLine(g, bx, face, 0, row / floors, 1, row / floors);
	drawDoor(g, bx, face, 0.3 + r() * 0.4, 4.2, 3.4, {double: true, glass: true, canopy: true});
	const streaks = floor(r() * 3);
	for (let s = 0; s < streaks; s++) {
		const u = r() * 0.8;
		const quad = faceQuad(bx, face, u, u + 0.12, r() * 0.5, 0.5 + r() * 0.5);
		pencilHatch(g, quad, {angle: HATCH_ANGLE + 30, spacing: 3, alpha: 18, ink: GRAPHITE});
	}
}

/** Clerestory strip windows and roller-shutter loading doors. */
function facadeIndustrial(g, bx, face, {cols}, r) {
	const m = bx.frame.metre;
	for (let c = 0; c < cols; c++) strokeQuad(g, faceQuad(bx, face, (c + 0.08) / cols, (c + 0.92) / cols, 0.68, 0.84));

	const width = bx.faceWidth(face.name);
	// Staff door next to the loading bays
	drawDoor(g, bx, face, (1.6 * m) / width, 1, 2.1);
	const doorW = 4.2 * m;
	const doorH = Math.min(4.6 * m, bx.h * 0.6) / bx.h;
	if (width < doorW * 2) return;
	const pitch = (11 + 4 * r()) * m;
	for (let d = 3 * m; d + doorW < width - 2 * m; d += pitch) {
		if (r() < 0.25) continue;
		const u0 = d / width;
		const u1 = (d + doorW) / width;
		if (!strokeQuad(g, faceQuad(bx, face, u0, u1, 0, doorH))) continue;
		for (let s = 1; s < 4; s++) faceLine(g, bx, face, u0, (doorH * s) / 4, u1, (doorH * s) / 4);
	}
}

/** Two bands near the top of a stack. */
function facadeChimney(g, bx, face) {
	for (const v of [0.86, 0.91]) faceLine(g, bx, face, 0, v, 1, v, DETAIL);
}

/** Tile courses parallel to the ridge (they run to the ridge's vanishing point). */
function drawRoofCourses(g, bx, face) {
	const n = 6;
	for (let i = 1; i < n; i++) {
		const t = i / n;
		pencilLine(g, bx.slopePoint(face.name, 0, t), bx.slopePoint(face.name, 1, t), FAINT);
	}
}

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

/** Pole, curved arm over the road, and a flat lamp head at its end. */
function drawLamp(g, lamp, comp) {
	const edge = {...PENCIL_PRESETS.contour, passes: 1, alpha: 58, weight: 0.85, overshoot: 3, ink: GRAPHITE};
	const w = 0.08 * lamp.ppm;
	if (w > 0.8) {
		pencilLine(g, pt(lamp.base.x - w, lamp.base.y), pt(lamp.poleTop.x - w * 0.6, lamp.poleTop.y), edge);
		pencilLine(g, pt(lamp.base.x + w, lamp.base.y), pt(lamp.poleTop.x + w * 0.6, lamp.poleTop.y), edge);
	} else pencilLine(g, lamp.base, lamp.poleTop, edge);
	pencilPolyline(g, [lamp.poleTop, lamp.armMid, lamp.armEnd], edge);
	drawBox(g, lamp.head, comp, edge);
}

/** Legs, then the farther of seat and backrest, then the nearer one. */
function drawBench(g, bench, comp) {
	const edge = {...PENCIL_PRESETS.detail, ink: GRAPHITE};
	for (const [p, q] of bench.legs) pencilLine(g, p, q, FAINT);
	const parts = bench.backFirst ? [bench.back, bench.seat] : [bench.seat, bench.back];
	for (const part of parts) drawBox(g, part, comp, edge);
}

/** Which of two screen points is on the shadow side (away from the light). */
function shadowSide(comp, p, q) {
	const lightLeft = comp.params.light === "left";
	return (p.x > q.x) === lightLeft ? p : q;
}

function drawCylinder(g, cyl, comp) {
	fillPaper(g, cyl.outline);
	pencilHatch(g, cyl.outline, {angle: HATCH_ANGLE, spacing: 10, alpha: 22, ink: GRAPHITE});

	// Darker half on the side away from the light
	const zt = cyl.z + cyl.h;
	const p0 = cyl.rim(zt, cyl.t0);
	const p1 = cyl.rim(zt, cyl.t1);
	const dark = shadowSide(comp, p0, p1) === p0 ? cyl.band(cyl.t0, cyl.phi) : cyl.band(cyl.phi, cyl.t1);
	pencilHatch(g, dark, {angle: HATCH_ANGLE, spacing: 4.5, alpha: 32, ink: GRAPHITE});

	// Ring bands on the near side
	for (const v of [0.33, 0.66]) pencilPolyline(g, cyl.arc(cyl.z + cyl.h * v, cyl.t0, cyl.t1, 16), FAINT);

	const edge = {ink: GRAPHITE};
	pencilLine(g, cyl.rim(cyl.z, cyl.t0), p0, edge);
	pencilLine(g, cyl.rim(cyl.z, cyl.t1), p1, edge);
	pencilPolyline(g, cyl.arc(cyl.z, cyl.t0, cyl.t1), edge);
	if (cyl.apex) {
		pencilLine(g, p0, cyl.apex, edge);
		pencilLine(g, p1, cyl.apex, edge);
		pencilPolyline(g, cyl.arc(zt, cyl.t0, cyl.t1), DETAIL);
	} else if (cyl.topEllipse) pencilPolyline(g, cyl.topEllipse, edge, true);
	else pencilPolyline(g, cyl.arc(zt, cyl.t0, cyl.t1), edge);
}

function drawTree(g, tree, comp) {
	const r = pencilRng(tree.ca, tree.cb, 3);
	const edge = {...PENCIL_PRESETS.detail, alpha: 55, ink: GRAPHITE};

	// Trunk
	const tw = tree.trunkHalf;
	if (tw > 0.8) {
		pencilLine(g, pt(tree.base.x - tw, tree.base.y), pt(tree.trunkTop.x - tw * 0.7, tree.trunkTop.y), edge);
		pencilLine(g, pt(tree.base.x + tw, tree.base.y), pt(tree.trunkTop.x + tw * 0.7, tree.trunkTop.y), edge);
	} else pencilLine(g, tree.base, tree.trunkTop, edge);

	if (tree.type === "conifer") return drawConifer(g, tree, comp, r, edge);

	// Round crown: a lumpy outline, a few inner clumps, shadow on one half
	const c = tree.centre;
	const R = tree.radius;
	const n = R < 4 ? 8 : Math.min(48, Math.max(18, Math.round(R / 3)));
	// Foliage clumps: a few smooth lobes rather than random spikes
	const ph1 = r() * Math.PI * 2;
	const ph2 = r() * Math.PI * 2;
	const crown = [];
	for (let i = 0; i < n; i++) {
		const t = (i / n) * Math.PI * 2;
		const k = 0.9 + 0.1 * Math.sin(t * 5 + ph1) + 0.05 * Math.sin(t * 9 + ph2) + 0.04 * r();
		crown.push(pt(c.x + Math.cos(t) * R * k, c.y + Math.sin(t) * R * k * 0.92));
	}
	fillPaper(g, crown);
	pencilPolyline(g, crown, edge, true);
	if (R < 4) return;

	const side = comp.params.light === "left" ? 1 : -1;
	const half = [];
	for (let i = 0; i <= 10; i++) {
		const t = -Math.PI / 2 + (i / 10) * Math.PI;
		half.push(pt(c.x + side * Math.cos(t) * R * 0.85, c.y + Math.sin(t) * R * 0.8));
	}
	pencilHatch(g, half, {angle: HATCH_ANGLE, spacing: Math.max(2.5, R / 6), alpha: 30, ink: GRAPHITE});
	for (let k = 0; k < 4; k++) {
		const a0 = r() * Math.PI * 2;
		const rr = R * (0.25 + 0.4 * r());
		const cx = c.x + Math.cos(a0) * R * 0.35;
		const cy = c.y + Math.sin(a0) * R * 0.35;
		const arc = [];
		for (let i = 0; i <= 5; i++) {
			const t = a0 + (i / 5) * Math.PI * 0.9;
			arc.push(pt(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr));
		}
		pencilPolyline(g, arc, FAINT);
	}
}

/** Stacked jagged tiers. */
function drawConifer(g, tree, comp, r, edge) {
	const apex = tree.apex;
	const base = tree.crownBase;
	const R = tree.radius * 0.9;
	const tiers = R < 4 ? 1 : 4;
	const left = [];
	const right = [];
	for (let i = 0; i <= tiers; i++) {
		const t = i / tiers;
		const y = apex.y + (base.y - apex.y) * t;
		const w = R * t;
		left.push(pt(apex.x - w, y));
		right.push(pt(apex.x + w, y));
		if (i > 0 && i < tiers) {
			left.push(pt(apex.x - w * 0.6, y + 0.01));
			right.push(pt(apex.x + w * 0.6, y + 0.01));
		}
	}
	const outline = [...right, ...left.reverse()];
	fillPaper(g, outline);
	pencilPolyline(g, outline, edge, true);
	if (R < 4) return;
	const side = comp.params.light === "left" ? 1 : -1;
	pencilHatch(g, [apex, pt(apex.x + side * R, base.y), pt(apex.x, base.y)], {angle: HATCH_ANGLE, spacing: Math.max(2.5, R / 5), alpha: 32, ink: GRAPHITE});
}

// ----------------------------------------------------------------------------
// Construction and debug
// ----------------------------------------------------------------------------

function drawConstruction(g, comp, W) {
	const s = comp.scene;
	const hy = s.horizonY;
	const opts = {...PENCIL_PRESETS.construction, ink: GRAPHITE};
	pencilLine(g, pt(-40, hy), pt(W + 40, hy), {...opts, alpha: 34, weight: 0.6});
	for (const vp of s.vanishingPoints()) drawVpMark(g, vp, opts);

	// Every receding edge is carried on to its vanishing point
	for (const bx of comp.items) {
		for (const e of bx.edges || []) {
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
	for (const bx of comp.items) {
		for (const e of bx.edges || []) {
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
	for (const bx of comp.items.slice(-6)) {
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
	g.text(`${s.mode}  items ${comp.items.length}  eye ${cam.k.toFixed(0)}  d ${s.d.toFixed(0)}`, 12, H - 12);
	g.pop();
}

function markCross(g, p, r, opts) {
	pencilLine(g, pt(p.x - r, p.y), pt(p.x + r, p.y), opts);
	pencilLine(g, pt(p.x, p.y - r), pt(p.x, p.y + r), opts);
}
