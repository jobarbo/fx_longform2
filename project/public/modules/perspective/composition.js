// ============================================================================
// COMPOSITION — scenes built from the perspective engine
// ============================================================================
// Uses p5 random() (seeded in setup) so a hash always gives the same scene.
//
// The eye always stands in a street, at eye level: the distance from the frame
// origin to the horizon is the eye height, which sets the size of a metre.

const EYE_HEIGHT_M = 2.1;
const NEAR_M = 1; // nothing is built closer than this in front of the eye
const FAR_M = 1450;

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

function buildComposition(params, W, H) {
	const comp = params.perspective_type === "1pt" ? buildStreet1pt(params, W, H) : buildBlock2pt(params, W, H);
	comp.params = params;
	comp.shades = FACE_SHADES[params.perspective_type][params.light];
	comp.boxes = sortForPainter(comp.boxes, comp.frame.camera());
	return comp;
}

/** Frame whose origin is on the ground at the bottom of the picture, with its metre scale. */
function eyeLevelFrame(scene, origin) {
	const frame = scene.frame(origin);
	frame.metre = frame.eyeHeight / EYE_HEIGHT_M;
	return frame;
}

function footprintDepths(frame, {a, b, wa, wb}) {
	return [frame.depth(a, b), frame.depth(a + wa, b), frame.depth(a, b + wb), frame.depth(a + wa, b + wb)];
}

function onCanvas(box, W, H) {
	const pts = Object.values(box.corners);
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

/** Add a building (and maybe a roof block), cut at the near plane, when it shows on the canvas. */
function addBuilding(boxes, frame, rawSpec, opts, W, H) {
	const m = frame.metre;
	const spec = trimToNear(frame, rawSpec, NEAR_M * m);
	if (!spec || Math.min(...footprintDepths(frame, spec)) > FAR_M * m) return;
	const main = new PBox(frame, {...spec, windows: opts.windows, floorH: opts.floorH, colW: opts.colW});
	if (!onCanvas(main, W, H)) return;
	boxes.push(main);
	// Occasional roof block (stair tower, water tank housing)
	if (random() < opts.roofChance && spec.wa > 6 * m && spec.wb > 6 * m) {
		const wa = spec.wa * random(0.2, 0.45);
		const wb = spec.wb * random(0.2, 0.45);
		boxes.push(
			new PBox(frame, {
				a: spec.a + random(0.1, 0.9 - wa / spec.wa) * spec.wa,
				b: spec.b + random(0.1, 0.9 - wb / spec.wb) * spec.wb,
				wa,
				wb,
				h: random(2.5, 4) * m,
				z: spec.h,
				windows: false,
			}),
		);
	}
}

function randomHeight(params, floorH) {
	const floors = random() < 0.12 * params.density ? floor(random(12, 35)) : floor(random(2, 9));
	return floors * floorH;
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

/** Standing in a street that runs toward a single VP, buildings on both sides. */
function buildStreet1pt(params, W, H) {
	const horizonY = H * params.horizon_frac;
	const vpX = W * (0.5 + random(-0.12, 0.12));
	const scene = new PerspectiveScene({mode: "1pt", horizonY, vpX, viewingDistance: W * random(0.9, 1.35)});
	const frame = eyeLevelFrame(scene, pt(vpX, H * 1.02));
	const m = frame.metre;
	const cam = frame.camera();

	const roadHalf = random(3.5, 7) * m;
	const sidewalk = random(2, 4) * m;
	// The eye stands on the road, not always in the middle
	const centre = cam.a + random(-0.7, 0.7) * roadHalf;
	const bNear = cam.b + NEAR_M * m;
	const bFar = cam.b + FAR_M * m;
	const boxes = [];
	const groundLines = [];
	const style = {floorH: random(3, 3.6) * m, colW: random(3.5, 5) * m, roofChance: 0.25 * params.density};

	for (const side of [-1, 1]) {
		// Start behind the eye so the row runs past it (cut at the near plane)
		let b = cam.b - random(0, 15) * m;
		const inner = roadHalf + sidewalk;
		let count = 0;
		while (b < bFar && count < 40) {
			const wb = random(8, 30) * m;
			const wa = random(10, 25) * m;
			const a = side < 0 ? centre - inner - wa : centre + inner;
			const h = randomHeight(params, style.floorH);
			addBuilding(boxes, frame, {a, b, wa, wb, h}, {...style, windows: random() < 0.85}, W, H);
			// Alleys and side streets
			b += wb + (random() < 0.25 ? random(3, 14) * m : 0);
			count++;
		}
	}

	// Curbs run straight to the VP
	for (const a of [centre - roadHalf, centre + roadHalf]) {
		const seg = groundSegment(frame, a, bNear, a, bFar, "ground");
		if (seg) groundLines.push(seg);
	}
	// Centre dashes, equal true length, foreshortened by construction
	const dash = 3 * m;
	for (let b = bNear + random(0, dash); b < cam.b + 150 * m; b += dash * 3) {
		groundLines.push({p: frame.point(centre, b), q: frame.point(centre, b + dash), preset: "detail"});
	}
	// Zebra crossing a few steps ahead
	if (random() < 0.7) {
		const b0 = cam.b + random(8, 25) * m;
		const stripe = 0.5 * m;
		for (let a = centre - roadHalf + stripe; a + stripe < centre + roadHalf; a += stripe * 2) {
			pushGroundQuad(groundLines, frame, a, b0, stripe, 3 * m, "detail");
		}
	}

	return {scene, frame, boxes, groundLines};
}

/** Standing in a street of a city grid aligned to two VPs. */
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
	const m = frame.metre;
	const cam = frame.camera();

	const street = random(12, 24) * m;
	const cell = random(25, 50) * m;
	const pitch = cell + street;
	const style = {floorH: random(3, 3.6) * m, colW: random(3.5, 5) * m, roofChance: 0.3 * params.density};

	// Street centre lines: the eye stands at the near corner of a crossing,
	// looking across it at the opposite corner block
	const aLine0 = cam.a + random(0.2, 0.45) * street;
	const bLine0 = cam.b + random(0.2, 0.45) * street;

	const boxes = [];
	const groundLines = [];
	const reach = Math.ceil((FAR_M * m) / pitch);
	for (let i = -reach; i <= reach; i++) {
		for (let j = -reach; j <= reach; j++) {
			const a = aLine0 + i * pitch + street * 0.5;
			const b = bLine0 + j * pitch + street * 0.5;
			const lot = {a, b, wa: cell, wb: cell};
			const depths = footprintDepths(frame, lot);
			if (Math.max(...depths) < NEAR_M * m || Math.min(...depths) > FAR_M * m) continue;
			pushGroundQuad(groundLines, frame, a, b, cell, cell, "ground");
			if (random() < 0.1) continue; // empty lot

			// One to three buildings per lot, split along a or b
			const parts = random() < 0.5 * params.density ? floor(random(2, 4)) : 1;
			const alongA = random() < 0.5;
			const gap = parts > 1 ? random(0, 2) * m : 0;
			const size = (cell - gap * (parts - 1)) / parts;
			for (let p = 0; p < parts; p++) {
				const inset = random(0, 1.5) * m;
				const h = randomHeight(params, style.floorH);
				const spec = alongA
					? {a: a + p * (size + gap) + inset, b: b + inset, wa: size - inset * 2, wb: cell - inset * 2, h}
					: {a: a + inset, b: b + p * (size + gap) + inset, wa: cell - inset * 2, wb: size - inset * 2, h};
				addBuilding(boxes, frame, spec, {...style, windows: random() < 0.85}, W, H);
			}
		}
	}

	// Zebra crossings on the arms of the eye's crossing (stripes follow the traffic)
	const stripe = 0.5 * m;
	const zebra = 3 * m;
	for (const side of [-1, 1]) {
		const a = aLine0 + side * (street * 0.5 + m) - (side < 0 ? zebra : 0);
		const b = bLine0 + side * (street * 0.5 + m) - (side < 0 ? zebra : 0);
		for (let t = -street * 0.5 + stripe; t + stripe < street * 0.5; t += stripe * 2) {
			pushGroundQuad(groundLines, frame, a, bLine0 + t, zebra, stripe, "detail");
			pushGroundQuad(groundLines, frame, aLine0 + t, b, stripe, zebra, "detail");
		}
	}

	return {scene, frame, boxes, groundLines};
}
