// ============================================================================
// COMPOSITION — scenes built from the perspective engine
// ============================================================================
// Uses p5 random() (seeded in setup) so a hash always gives the same scene.
//
// The eye always stands in a street, at eye level: the distance from the frame
// origin to the horizon is the eye height, which sets the size of a metre.
// Each lot gets a zone and a density from the zone map (zoning.js).

const EYE_HEIGHT_M = 2.1;
const NEAR_M = 1; // nothing is built closer than this in front of the eye
const FAR_M = 1450;
const TREE_NEAR_M = 15;

// Shade level per face: 0 lit, 1 half-tone, 2 shadow
const FACE_SHADES = {
	"1pt": {
		left: {a0: 0, a1: 2, b0: 1, b1: 2, k0: 2, k1: 0},
		right: {a0: 2, a1: 0, b0: 1, b1: 2, k0: 2, k1: 0},
	},
	"2pt": {
		left: {a0: 0, a1: 2, b0: 2, b1: 2, k0: 2, k1: 0},
		right: {a0: 2, a1: 2, b0: 0, b1: 2, k0: 2, k1: 0},
	},
};

// Window / mullion spacing per facade style, in metres
const FACADE_COLW = {house: [3.5, 4.5], grid: [3.5, 5], storefront: [4, 6], ribbon: [1.6, 2.4], curtain: [1.5, 2.2], industrial: [5, 8], chimney: [1, 1]};

const rr = ([lo, hi]) => random(lo, hi);
const ri = ([lo, hi]) => floor(random(lo, hi + 1));

function buildComposition(params, W, H) {
	const comp = params.perspective_type === "1pt" ? buildStreet1pt(params, W, H) : buildBlock2pt(params, W, H);
	comp.params = params;
	comp.shades = FACE_SHADES[params.perspective_type][params.light];
	comp.items = cullHidden(sortForPainter(comp.items, comp.frame.camera()));
	return comp;
}

/** Frame whose origin is on the ground at the bottom of the picture, with its metre scale. */
function eyeLevelFrame(scene, origin) {
	const frame = scene.frame(origin);
	frame.metre = frame.eyeHeight / EYE_HEIGHT_M;
	return frame;
}

function makeContext(scene, frame, params, W, H) {
	return {scene, frame, params, W, H, m: frame.metre, items: [], groundLines: []};
}

function footprintDepths(frame, {a, b, wa, wb}) {
	return [frame.depth(a, b), frame.depth(a + wa, b), frame.depth(a, b + wb), frame.depth(a + wa, b + wb)];
}

/** Footprint entirely in front of the near plane and closer than the far limit. */
function inRange(ctx, fp) {
	const d = footprintDepths(ctx.frame, fp);
	return Math.min(...d) >= NEAR_M * ctx.m && Math.min(...d) <= FAR_M * ctx.m;
}

function onCanvas(item, W, H) {
	const pts = Object.values(item.corners);
	const xs = pts.map((p) => p.x);
	const ys = pts.map((p) => p.y);
	return Math.max(...xs) > 0 && Math.min(...xs) < W && Math.max(...ys) > 0 && Math.min(...ys) < H;
}

/**
 * Cut a footprint at the near plane, along a or b, so it stays a rectangle in
 * front of the eye. Depth grows with a and b, so (a, b) is the nearest corner.
 */
function trimToNear(frame, spec, near) {
	const z = frame.depth(spec.a, spec.b);
	if (z >= near) return spec;
	const minSize = 2 * frame.metre;
	const options = [];
	const sa = frame.depth(spec.a + 1, spec.b) - z;
	const sb = frame.depth(spec.a, spec.b + 1) - z;
	if (sa > 1e-9) {
		const da = (near - z) / sa;
		if (spec.wa - da > minSize) options.push({...spec, a: spec.a + da, wa: spec.wa - da});
	}
	if (sb > 1e-9) {
		const db = (near - z) / sb;
		if (spec.wb - db > minSize) options.push({...spec, b: spec.b + db, wb: spec.wb - db});
	}
	if (!options.length) return null;
	return options.reduce((best, o) => (o.wa * o.wb > best.wa * best.wb ? o : best));
}

/** Add a box, cut at the near plane, when it shows on the canvas. Returns it (or null). */
function addBox(ctx, rawSpec) {
	const spec = trimToNear(ctx.frame, rawSpec, NEAR_M * ctx.m);
	if (!spec || Math.min(...footprintDepths(ctx.frame, spec)) > FAR_M * ctx.m) return null;
	// A cut-down roof would no longer sit on its ridge: drop it
	if (spec !== rawSpec) spec.roof = null;
	const box = new PBox(ctx.frame, spec);
	if (!onCanvas(box, ctx.W, ctx.H)) return null;
	ctx.items.push(box);
	return box;
}

function addTree(ctx, ca, cb, {crownR, trunkH, type}) {
	if (!inRange(ctx, {a: ca - crownR, b: cb - crownR, wa: crownR * 2, wb: crownR * 2})) return;
	// A tree right next to the eye would only be a blob over the picture
	if (ctx.frame.depth(ca, cb) < TREE_NEAR_M * ctx.m) return;
	const tree = new PTree(ctx.frame, {ca, cb, crownR, trunkH, type});
	if (tree.radius < 0.7 || !onCanvas(tree, ctx.W, ctx.H)) return;
	ctx.items.push(tree);
}

function addCylinder(ctx, spec) {
	if (!inRange(ctx, {a: spec.ca - spec.r, b: spec.cb - spec.r, wa: spec.r * 2, wb: spec.r * 2})) return;
	const cyl = new PCylinder(ctx.frame, spec);
	if (!onCanvas(cyl, ctx.W, ctx.H)) return;
	ctx.items.push(cyl);
}

function randomTree(ctx, density = "medium") {
	const m = ctx.m;
	const big = density === "high" ? 1.15 : 1;
	return {crownR: random(2, 4) * big * m, trunkH: random(2, 3.5) * m, type: random() < 0.25 ? "conifer" : "round"};
}

function facadeStyle(ctx, facade, floorH) {
	const style = {facade, floorH, colW: rr(FACADE_COLW[facade]) * ctx.m, windows: facade === "house" || facade === "grid" ? random() < 0.9 : true};
	// Most shops have an awning over their windows, plain or striped
	if (facade === "storefront" && random() < 0.75) style.awning = {striped: random() < 0.6, depth: random(1.2, 1.8) * ctx.m};
	return style;
}

function addLamp(ctx, spec) {
	if (ctx.frame.depth(spec.ca, spec.cb) < 8 * ctx.m) return;
	const lamp = new PLamp(ctx.frame, spec);
	if (Math.abs(lamp.poleTop.y - lamp.base.y) < 8 || !onCanvas(lamp, ctx.W, ctx.H)) return;
	ctx.items.push(lamp);
}

function addBench(ctx, spec) {
	const m = ctx.m;
	const fp = spec.axis === "a" ? {a: spec.a, b: spec.b, wa: spec.len, wb: 0.5 * m} : {a: spec.a, b: spec.b, wa: 0.5 * m, wb: spec.len};
	if (!inRange(ctx, fp) || ctx.frame.depth(fp.a, fp.b) < 3 * m) return;
	const bench = new PBench(ctx.frame, spec);
	const ends = [ctx.frame.point(fp.a, fp.b), ctx.frame.point(fp.a + fp.wa, fp.b + fp.wb)];
	if (Math.hypot(ends[1].x - ends[0].x, ends[1].y - ends[0].y) < 4 || !onCanvas(bench, ctx.W, ctx.H)) return;
	ctx.items.push(bench);
}

/** Ground segment from (a0,b0) to (a1,b1), cut where it passes too close to the eye. */
function groundSegment(frame, a0, b0, a1, b1, preset) {
	const near = NEAR_M * 0.5 * frame.metre;
	const z0 = frame.depth(a0, b0);
	const z1 = frame.depth(a1, b1);
	if (z0 < near && z1 < near) return null;
	let t0 = 0;
	let t1 = 1;
	if (z0 < near) t0 = (near - z0) / (z1 - z0);
	if (z1 < near) t1 = (near - z0) / (z1 - z0);
	const at = (t) => frame.point(a0 + (a1 - a0) * t, b0 + (b1 - b0) * t);
	return {p: at(t0), q: at(t1), preset};
}

function pushGroundQuad(lines, frame, a, b, wa, wb, preset) {
	const corners = [
		[a, b],
		[a + wa, b],
		[a + wa, b + wb],
		[a, b + wb],
	];
	for (let i = 0; i < 4; i++) {
		const [a0, b0] = corners[i];
		const [a1, b1] = corners[(i + 1) % 4];
		const seg = groundSegment(frame, a0, b0, a1, b1, preset);
		if (seg) lines.push(seg);
	}
}

// ----------------------------------------------------------------------------
// Lots
// ----------------------------------------------------------------------------

/**
 * Fill a lot according to its zone and density.
 * split: axis along which buildings stand side by side ("a" or "b").
 */
function layoutLot(ctx, lot, {zone, density}, split) {
	const arch = ZONES[zone][density];
	if (zone === "park") return buildPark(ctx, lot, arch, density);
	if (zone === "residential" && density === "low") return buildHouses(ctx, lot, arch);
	return buildBlockBuildings(ctx, lot, arch, split);
}

/** Detached houses on a grid of plots, gable roofs, trees in the yards. */
function buildHouses(ctx, lot, arch) {
	const m = ctx.m;
	const plot = rr(arch.plot) * m;
	const nA = Math.max(1, Math.floor(lot.wa / plot));
	const nB = Math.max(1, Math.floor(lot.wb / plot));
	const pa = lot.wa / nA;
	const pb = lot.wb / nB;
	const lotRidge = random() < 0.5 ? "a" : "b";
	for (let i = 0; i < nA; i++) {
		for (let j = 0; j < nB; j++) {
			const a0 = lot.a + i * pa;
			const b0 = lot.b + j * pb;
			const wa = Math.min(rr(arch.house) * m, pa - 2 * m);
			const wb = Math.min(rr(arch.house) * m, pb - 2 * m);
			if (wa < 4 * m || wb < 4 * m) continue;
			const a = a0 + random(m, pa - wa - m);
			const b = b0 + random(m, pb - wb - m);
			const floorH = rr(arch.floorH) * m;
			const h = ri(arch.floors) * floorH;
			const axis = random() < 0.75 ? lotRidge : lotRidge === "a" ? "b" : "a";
			const span = axis === "a" ? wb : wa;
			const roof = random() < arch.gable ? {axis, height: (span / 2) * random(0.55, 0.95)} : null;
			addBox(ctx, {a, b, wa, wb, h, roof, ...facadeStyle(ctx, arch.facade, floorH)});

			// Yard trees, kept clear of the house so they never interpenetrate it
			const house = {a, b, wa, wb};
			for (let t = ri(arch.yardTrees); t > 0; t--) {
				const tree = randomTree(ctx, "low");
				const clear = tree.crownR + 0.5 * m;
				for (let attempt = 0; attempt < 6; attempt++) {
					const ca = random(a0 + tree.crownR, a0 + pa - tree.crownR);
					const cb = random(b0 + tree.crownR, b0 + pb - tree.crownR);
					const outside = ca < house.a - clear || ca > house.a + house.wa + clear || cb < house.b - clear || cb > house.b + house.wb + clear;
					if (outside) {
						addTree(ctx, ca, cb, tree);
						break;
					}
				}
			}
		}
	}
}

/** Rows of buildings, high-rises with podium or tiers, industrial halls with chimneys and silos. */
function buildBlockBuildings(ctx, lot, arch, split) {
	const m = ctx.m;
	const depthAxis = split === "a" ? "b" : "a";
	const inset = rr(arch.inset) * m;
	const inner = {a: lot.a + inset, b: lot.b + inset, wa: lot.wa - inset * 2, wb: lot.wb - inset * 2};
	if (inner.wa < 4 * m || inner.wb < 4 * m) return;

	// Rows and towers face the streets on both long sides of the block (a courtyard
	// in between); a single high-rise or an industrial strip leaves the rest open
	const fullDepth = depthAxis === "a" ? inner.wa : inner.wb;
	const depthStart = depthAxis === "a" ? inner.a : inner.b;
	const twoRows = !arch.podium && !arch.tiers && arch.facade !== "industrial";
	const rows = [];
	let free = {start: depthStart, size: 0};
	if (twoRows) {
		const depth = Math.min((fullDepth * rr(arch.depthFill)) / 2, 20 * m);
		rows.push({start: depthStart, depth}, {start: depthStart + fullDepth - depth, depth});
	} else {
		const depth = fullDepth * rr(arch.depthFill);
		const side = random() < 0.5 ? 0 : 1;
		const start = depthStart + (side === 1 ? fullDepth - depth : 0);
		rows.push({start, depth});
		free = {start: side === 1 ? depthStart : start + depth, size: fullDepth - depth};
	}

	const length = split === "a" ? inner.wa : inner.wb;
	const floorH = rr(arch.floorH) * m;
	const splitStart = split === "a" ? inner.a : inner.b;
	const rect = (s0, ss, d0, ds) => (split === "a" ? {a: s0, wa: ss, b: d0, wb: ds} : {b: s0, wb: ss, a: d0, wa: ds});

	const halls = [];
	for (const row of rows) {
		const parts = ri(arch.parts);
		const gap = parts > 1 && arch.gap ? rr(arch.gap) * m : 0;
		const size = (length - gap * (parts - 1)) / parts;
		if (size < 4 * m) continue;
		for (let p = 0; p < parts; p++) {
			const fp = rect(splitStart + p * (size + gap), size, row.start, row.depth);
			const floors = ri(arch.floors);
			const style = facadeStyle(ctx, arch.facade, floorH);
			let topBox = null;

			if (arch.podium) {
				// Residential tower on a podium
				const podFloors = ri(arch.podium);
				addBox(ctx, {...fp, h: podFloors * floorH, ...facadeStyle(ctx, "grid", floorH)});
				const share = rr(arch.towerShare);
				const tw = fp.wa * share;
				const tb = fp.wb * share;
				const tower = {a: fp.a + random(0, fp.wa - tw), b: fp.b + random(0, fp.wb - tb), wa: tw, wb: tb};
				topBox = addBox(ctx, {...tower, z: podFloors * floorH, h: Math.max(1, floors - podFloors) * floorH, ...style});
			} else if (arch.tiers) {
				// Skyscraper: a base, then tiers stepping back
				const tiers = ri(arch.tiers);
				let remaining = floors;
				let z = 0;
				let cur = fp;
				for (let t = 0; t <= tiers && remaining > 0; t++) {
					const n = t === tiers ? remaining : Math.max(2, Math.round(remaining * random(0.3, 0.5)));
					topBox = addBox(ctx, {...cur, z, h: n * floorH, ...style}) || topBox;
					z += n * floorH;
					remaining -= n;
					const sa = cur.wa * random(0.08, 0.18);
					const sb = cur.wb * random(0.08, 0.18);
					cur = {a: cur.a + sa, b: cur.b + sb, wa: cur.wa - sa * 2, wb: cur.wb - sb * 2};
				}
			} else {
				const roof = arch.gable && random() < arch.gable ? {axis: split, height: ((split === "a" ? fp.wb : fp.wa) / 2) * random(0.4, 0.7)} : null;
				topBox = addBox(ctx, {...fp, h: floors * floorH, roof, ...style});
				if (topBox && arch.facade === "industrial") halls.push(topBox);
			}

			if (topBox && !topBox.roof && random() < arch.roofBlock) addRoofBlock(ctx, topBox);
		}
	}

	if (arch.chimneys) {
		for (let c = ri(arch.chimneys); c > 0; c--) addChimney(ctx, halls, inner, free, depthAxis);
	}
	if (arch.silos) addSilos(ctx, inner, free, depthAxis, ri(arch.silos));
}

/** Small block on a flat roof (stairs, tanks, machinery). */
function addRoofBlock(ctx, box) {
	const m = ctx.m;
	if (box.wa < 6 * m || box.wb < 6 * m) return;
	const wa = box.wa * random(0.2, 0.45);
	const wb = box.wb * random(0.2, 0.45);
	addBox(ctx, {
		a: box.a + random(0.1, 0.9 - wa / box.wa) * box.wa,
		b: box.b + random(0.1, 0.9 - wb / box.wb) * box.wb,
		wa,
		wb,
		h: random(2.5, 4) * m,
		z: box.z + box.h,
		windows: false,
	});
}

/** Tall thin stack, in the open part of the lot or on a hall roof. */
function addChimney(ctx, halls, inner, free, depthAxis) {
	const m = ctx.m;
	const w = random(1.6, 3) * m;
	const h = random(20, 50) * m;
	const style = {facade: "chimney", floorH: h, colW: m, windows: true};
	if (free.size > w + 2 * m && random() < 0.6) {
		const d = free.start + random(m, free.size - w - m);
		const s = (depthAxis === "a" ? inner.b : inner.a) + random(m, (depthAxis === "a" ? inner.wb : inner.wa) - w - m);
		const fp = depthAxis === "a" ? {a: d, b: s} : {a: s, b: d};
		addBox(ctx, {...fp, wa: w, wb: w, h, ...style});
	} else if (halls.length) {
		const hall = halls[floor(random(halls.length))];
		addBox(ctx, {a: hall.a + random(0.15, 0.85) * (hall.wa - w), b: hall.b + random(0.15, 0.85) * (hall.wb - w), wa: w, wb: w, z: hall.z + hall.h, h, ...style});
	}
}

/** A row of silos in the open part of the lot. */
function addSilos(ctx, inner, free, depthAxis, count) {
	const m = ctx.m;
	const r = Math.min(random(3, 5.5) * m, free.size / 2 - m);
	if (r < 2 * m) return;
	const h = random(14, 30) * m;
	const cap = random() < 0.5 ? r * random(0.3, 0.6) : 0;
	const along = depthAxis === "a" ? inner.wb : inner.wa;
	const n = Math.min(count, Math.floor(along / (2 * r + m)));
	const centreD = free.start + free.size / 2;
	for (let i = 0; i < n; i++) {
		const s = (depthAxis === "a" ? inner.b : inner.a) + r + m * 0.5 + i * (2 * r + m);
		const [ca, cb] = depthAxis === "a" ? [centreD, s] : [s, centreD];
		addCylinder(ctx, {ca, cb, r, h, cap, facade: "silo"});
	}
}

/** Trees on a jittered grid, with one or two paths. */
function buildPark(ctx, lot, arch, density) {
	const m = ctx.m;
	const paths = [];
	if (arch.paths === 1) paths.push([lot.a, lot.b, lot.a + lot.wa, lot.b + lot.wb]);
	if (arch.paths === 2) {
		paths.push([lot.a + lot.wa / 2, lot.b, lot.a + lot.wa / 2, lot.b + lot.wb]);
		paths.push([lot.a, lot.b + lot.wb / 2, lot.a + lot.wa, lot.b + lot.wb / 2]);
	}
	const half = 1.2 * m;
	for (const [a0, b0, a1, b1] of paths) {
		const len = Math.hypot(a1 - a0, b1 - b0);
		const na = (-(b1 - b0) / len) * half;
		const nb = ((a1 - a0) / len) * half;
		for (const s of [-1, 1]) {
			const seg = groundSegment(ctx.frame, a0 + na * s, b0 + nb * s, a1 + na * s, b1 + nb * s, "detail");
			if (seg) ctx.groundLines.push(seg);
		}
	}

	const spacing = arch.treeSpacing * m;
	for (let a = lot.a + spacing / 2; a < lot.a + lot.wa; a += spacing) {
		for (let b = lot.b + spacing / 2; b < lot.b + lot.wb; b += spacing) {
			if (random() > 0.8) continue;
			const tree = randomTree(ctx, density);
			const ca = Math.min(Math.max(a + random(-0.35, 0.35) * spacing, lot.a + tree.crownR), lot.a + lot.wa - tree.crownR);
			const cb = Math.min(Math.max(b + random(-0.35, 0.35) * spacing, lot.b + tree.crownR), lot.b + lot.wb - tree.crownR);
			const onPath = paths.some(([a0, b0, a1, b1]) => distPointToLine({x: ca, y: cb}, {x: a0, y: b0}, {x: a1, y: b1}) < half + tree.crownR * 0.6);
			if (!onPath) addTree(ctx, ca, cb, tree);
		}
	}
}

// ----------------------------------------------------------------------------
// Scenes
// ----------------------------------------------------------------------------

/**
 * A grid of blocks. Streets of width `streetA` separate the blocks along a,
 * streets of width `streetB` along b; `aLine0` / `bLine0` are the centre lines
 * of one street of each direction. Each block gets a zone from `zoneAt(i, j)`.
 */
function buildGrid(ctx, {aLine0, bLine0, streetA, streetB, cellA, cellB, sidewalk, zoneAt}) {
	const {frame, m, W} = ctx;
	const pitchA = cellA + streetA;
	const pitchB = cellB + streetB;
	const reachA = Math.ceil((FAR_M * m) / pitchA);
	const reachB = Math.ceil((FAR_M * m) / pitchB);

	for (let i = -reachA; i <= reachA; i++) {
		for (let j = -reachB; j <= reachB; j++) {
			const lot = {a: aLine0 + i * pitchA + streetA / 2, b: bLine0 + j * pitchB + streetB / 2, wa: cellA, wb: cellB};
			const depths = footprintDepths(frame, lot);
			if (Math.max(...depths) < NEAR_M * m || Math.min(...depths) > FAR_M * m) continue;
			// Verticals stay vertical, so a block whose ground lies beside the canvas can't show
			if (Math.min(...depths) > NEAR_M * m) {
				const xs = [frame.point(lot.a, lot.b), frame.point(lot.a + lot.wa, lot.b), frame.point(lot.a, lot.b + lot.wb), frame.point(lot.a + lot.wa, lot.b + lot.wb)].map((p) => p.x);
				if (Math.max(...xs) < -20 || Math.min(...xs) > W + 20) continue;
			}

			// Building line and curb around the block
			pushGroundQuad(ctx.groundLines, frame, lot.a, lot.b, lot.wa, lot.wb, "detail");
			pushGroundQuad(ctx.groundLines, frame, lot.a - sidewalk, lot.b - sidewalk, lot.wa + sidewalk * 2, lot.wb + sidewalk * 2, "ground");

			const zoneInfo = zoneAt(i, j);
			const longer = cellA > cellB ? "a" : "b";
			const split = random() < 0.75 ? longer : longer === "a" ? "b" : "a";
			layoutLot(ctx, lot, zoneInfo, split);
			if (zoneInfo.zone === "residential" && random() < 0.5) addStreetTrees(ctx, lot, sidewalk);
			addStreetFurniture(ctx, lot, sidewalk, zoneInfo);
		}
	}
}

/** Trees on the sidewalk all around a block. */
function addStreetTrees(ctx, lot, sidewalk) {
	const m = ctx.m;
	const off = sidewalk * 0.5;
	const edges = [
		[lot.a - off, lot.b, 0, 1, lot.wb],
		[lot.a + lot.wa + off, lot.b, 0, 1, lot.wb],
		[lot.a, lot.b - off, 1, 0, lot.wa],
		[lot.a, lot.b + lot.wb + off, 1, 0, lot.wa],
	];
	for (const [a0, b0, da, db, len] of edges) {
		for (let s = random(2, 6) * m; s < len - 2 * m; s += random(8, 12) * m) {
			const tree = randomTree(ctx);
			addTree(ctx, a0 + da * s, b0 + db * s, {...tree, crownR: Math.min(tree.crownR, sidewalk * 1.2)});
		}
	}
}

// Chance of benches along a block, per zone and density
const BENCH_CHANCE = {commercial: {low: 0.8, medium: 0.6, high: 0.5}, residential: {low: 0, medium: 0.4, high: 0.5}, park: {low: 0.7, medium: 0.8, high: 0.6}, industrial: {low: 0, medium: 0, high: 0}};

/**
 * Street lamps at the curb, their arms over the road, and benches against the
 * building line, backs to the block, on each of the four sides of a block.
 */
function addStreetFurniture(ctx, lot, sidewalk, {zone, density}) {
	const m = ctx.m;
	const lampH = random(6, 8) * m;
	const lampPitch = random(25, 35) * m;
	const curb = sidewalk * 0.85;
	const near = sidewalk * 0.3;
	const benchLen = 1.8 * m;
	const benchD = 0.5 * m;
	const benches = random() < BENCH_CHANCE[zone][density];
	// [start a, start b, along a?, length, outward da, outward db]
	const sides = [
		[lot.a, lot.b, false, lot.wb, -1, 0],
		[lot.a + lot.wa, lot.b, false, lot.wb, 1, 0],
		[lot.a, lot.b, true, lot.wa, 0, -1],
		[lot.a, lot.b + lot.wb, true, lot.wa, 0, 1],
	];
	for (const [a0, b0, alongA, len, da, db] of sides) {
		const at = (s, off) => (alongA ? [a0 + s, b0 + db * off] : [a0 + da * off, b0 + s]);
		for (let s = random(0.3, 0.7) * lampPitch; s < len; s += lampPitch) {
			const [ca, cb] = at(s, curb);
			addLamp(ctx, {ca, cb, h: lampH, arm: random(1, 1.6) * m, da, db});
		}
		if (!benches) continue;
		for (let s = random(5, 15) * m; s + benchLen < len; s += random(25, 50) * m) {
			// The seat footprint starts on the street side of the bench, the back faces the block
			const [ca, cb] = at(s, near + (da + db > 0 ? 0 : benchD));
			addBench(ctx, {a: ca, b: cb, axis: alongA ? "a" : "b", len: benchLen, back: da + db > 0 ? -1 : 1});
		}
	}
}

/**
 * Zebra crossings on the arms of the crossing of street centre lines aLine and
 * bLine: the ones across the street along a, and across the street along b.
 */
function addCrossings(ctx, aLine, bLine, streetA, streetB, {acrossA = true, acrossB = true} = {}) {
	const m = ctx.m;
	const stripe = 0.5 * m;
	const zebra = 3 * m;
	for (const side of [-1, 1]) {
		const a = aLine + side * (streetA * 0.5 + m) - (side < 0 ? zebra : 0);
		const b = bLine + side * (streetB * 0.5 + m) - (side < 0 ? zebra : 0);
		for (let t = -streetB * 0.5 + stripe; acrossA && t + stripe < streetB * 0.5; t += stripe * 2) {
			pushGroundQuad(ctx.groundLines, ctx.frame, a, bLine + t, zebra, stripe, "detail");
		}
		for (let t = -streetA * 0.5 + stripe; acrossB && t + stripe < streetA * 0.5; t += stripe * 2) {
			pushGroundQuad(ctx.groundLines, ctx.frame, aLine + t, b, stripe, zebra, "detail");
		}
	}
}

/** Standing on a street of the grid that runs toward the single VP; cross streets are frontal. */
function buildStreet1pt(params, W, H) {
	const horizonY = H * params.horizon_frac;
	const vpX = W * (0.5 + random(-0.12, 0.12));
	const scene = new PerspectiveScene({mode: "1pt", horizonY, vpX, viewingDistance: W * random(0.9, 1.35)});
	const frame = eyeLevelFrame(scene, pt(vpX, H * 1.02));
	const ctx = makeContext(scene, frame, params, W, H);
	const m = ctx.m;
	const cam = frame.camera();

	const roadHalf = random(3.5, 7) * m;
	const sidewalk = random(2, 4) * m;
	const streetA = (roadHalf + sidewalk) * 2;
	const streetB = random(12, 20) * m;
	// Blocks are long along the street the eye looks down
	const cellA = random(35, 60) * m;
	const cellB = random(60, 120) * m;
	// The eye stands on the road, not always in the middle; the next cross street is ahead
	const aLine0 = cam.a + random(-0.7, 0.7) * roadHalf;
	const bLine0 = cam.b + random(15, 70) * m;
	const zoneAt = makeZoneMap(params.district, {x: 0, y: random(2, 6)});

	buildGrid(ctx, {aLine0, bLine0, streetA, streetB, cellA, cellB, sidewalk, zoneAt});
	// Only the crossings over the eye's street: the others are seen edge-on
	addCrossings(ctx, aLine0, bLine0, streetA, streetB, {acrossA: false});

	// Centre dashes along the eye's street, broken at the crossings
	const dash = 3 * m;
	const pitchB = cellB + streetB;
	for (let b = cam.b + NEAR_M * m + random(0, dash); b < cam.b + 200 * m; b += dash * 3) {
		const inBlock = (((b - bLine0 - streetB / 2) % pitchB) + pitchB) % pitchB;
		if (inBlock > cellB - dash) continue;
		ctx.groundLines.push({p: frame.point(aLine0, b), q: frame.point(aLine0, b + dash), preset: "detail"});
	}

	return {scene, frame, items: ctx.items, groundLines: ctx.groundLines};
}

/** Standing at a crossing of a city grid aligned to two VPs. */
function buildBlock2pt(params, W, H) {
	const horizonY = H * params.horizon_frac;
	const mid = W * (0.5 + random(-0.12, 0.12));
	// VPs close together give the wide angle of a view from the street
	const span = W * (params.vp_spread === "wide" ? random(1.6, 2.2) : random(1.2, 1.5));
	const bias = random(0.35, 0.65);
	const scene = new PerspectiveScene({
		mode: "2pt",
		horizonY,
		vpLeftX: mid - span * bias,
		vpRightX: mid + span * (1 - bias),
		centerX: W * 0.5,
	});
	const frame = eyeLevelFrame(scene, pt(mid, H * 1.02));
	const ctx = makeContext(scene, frame, params, W, H);
	const m = ctx.m;
	const cam = frame.camera();

	const streetA = random(12, 24) * m;
	const streetB = random(12, 24) * m;
	const sidewalk = random(2, 4) * m;
	const cellA = random(30, 60) * m;
	const cellB = random(30, 60) * m;

	// Street centre lines: the eye stands at the near corner of a crossing,
	// looking across it at the opposite corner block
	const aLine0 = cam.a + random(0.2, 0.45) * streetA;
	const bLine0 = cam.b + random(0.2, 0.45) * streetB;
	// The densest quarter lies a few blocks ahead
	const zoneAt = makeZoneMap(params.district, {x: random(1, 5), y: random(1, 5)});

	buildGrid(ctx, {aLine0, bLine0, streetA, streetB, cellA, cellB, sidewalk, zoneAt});
	addCrossings(ctx, aLine0, bLine0, streetA, streetB);

	return {scene, frame, items: ctx.items, groundLines: ctx.groundLines};
}
