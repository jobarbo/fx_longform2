// ============================================================================
// COMPOSITION — scenes built from the perspective engine
// ============================================================================
// Uses p5 random() (seeded in setup) so a hash always gives the same scene.

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

function addBuilding(boxes, frame, spec, opts) {
	const floorH = opts.floorH;
	const main = new PBox(frame, {...spec, windows: opts.windows, floorH, colW: opts.colW});
	boxes.push(main);
	// Occasional roof block (stair tower, water tank housing)
	if (random() < opts.roofChance && spec.wa > 60 && spec.wb > 60) {
		const wa = spec.wa * random(0.2, 0.45);
		const wb = spec.wb * random(0.2, 0.45);
		boxes.push(
			new PBox(frame, {
				a: spec.a + random(0.1, 0.9 - wa / spec.wa) * spec.wa,
				b: spec.b + random(0.1, 0.9 - wb / spec.wb) * spec.wb,
				wa,
				wb,
				h: random(25, 70),
				z: spec.h,
				windows: false,
			})
		);
	}
}

/** A street running toward a single VP, with a row of buildings on each side. */
function buildStreet1pt(params, W, H) {
	const horizonY = H * params.horizon_frac;
	const vpX = W * (0.5 + random(-0.12, 0.12));
	const scene = new PerspectiveScene({mode: "1pt", horizonY, vpX, viewingDistance: W * random(0.9, 1.35)});
	const origin = pt(vpX, H * 1.02);
	const frame = scene.frame(origin);

	const roadHalf = random(110, 200);
	const sidewalk = random(35, 70);
	const bMax = scene.d * 7;
	const boxes = [];
	const groundLines = [];
	const style = {floorH: random(55, 80), colW: random(45, 75), roofChance: 0.25 * params.density};
	// Heights follow the eye height, but fill the sky when the horizon is low
	const heightRef = Math.max(frame.eyeHeight, origin.y * 0.5);

	for (const side of [-1, 1]) {
		let b = random() < 0.5 ? random(0, 40) : random(150, 450);
		const inner = roadHalf + sidewalk;
		let count = 0;
		while (b < bMax && count < 22) {
			const wb = random(120, 420) * (1 + b / scene.d) ** 0.5;
			const wa = random(260, 650);
			const tall = random() < 0.15 * params.density;
			const h = tall ? random(1.2, 2.4) * heightRef : random(0.35, 1.3) * heightRef;
			const a = side < 0 ? -inner - wa : inner;
			addBuilding(boxes, frame, {a: a + (scene.vp.x - origin.x), b, wa, wb, h}, {...style, windows: random() < 0.85});
			b += wb + (random() < 0.3 ? random(30, 110) : 0);
			count++;
		}
	}

	// Curbs and sidewalk edges run straight to the VP
	const ax = scene.vp.x - origin.x;
	for (const a of [-roadHalf, roadHalf]) {
		groundLines.push({p: frame.point(ax + a, 0), q: frame.point(ax + a, bMax), preset: "ground"});
	}
	// Centre dashes, equal true length, foreshortened by construction
	const dash = random(50, 90);
	for (let b = random(0, dash); b < scene.d * 3.5; b += dash * 2) {
		groundLines.push({p: frame.point(ax, b), q: frame.point(ax, b + dash), preset: "detail"});
	}
	// Zebra crossing
	if (random() < 0.7) {
		const b0 = random(150, 500);
		const depth = random(110, 160);
		const stripe = 28;
		for (let a = -roadHalf + 15; a + stripe < roadHalf - 10; a += stripe * 2) {
			const quad = [frame.point(ax + a, b0), frame.point(ax + a + stripe, b0), frame.point(ax + a + stripe, b0 + depth), frame.point(ax + a, b0 + depth)];
			groundLines.push(...quadToLines(quad, "detail"));
		}
	}

	return {scene, frame, boxes, groundLines};
}

/** City blocks on a ground grid aligned to two VPs. */
function buildBlock2pt(params, W, H) {
	const horizonY = H * params.horizon_frac;
	const mid = W * (0.5 + random(-0.12, 0.12));
	const span = W * (params.vp_spread === "wide" ? random(2.2, 3.2) : random(1.3, 1.7));
	const bias = random(0.35, 0.65);
	const scene = new PerspectiveScene({
		mode: "2pt",
		horizonY,
		vpLeftX: mid - span * bias,
		vpRightX: mid + span * (1 - bias),
		centerX: W * 0.5,
	});
	const origin = pt(mid + random(-60, 60), H * random(0.9, 0.97));
	const frame = scene.frame(origin);

	const cell = random(170, 260);
	const street = random(55, 95);
	const pitch = cell + street;
	const nA = 7;
	const nB = 7;
	const heightRef = Math.max(frame.eyeHeight, origin.y * 0.45);
	const style = {floorH: random(45, 70), colW: random(35, 60), roofChance: 0.3 * params.density};
	const boxes = [];
	const groundLines = [];
	const off = street * 0.5; // origin sits at a street corner

	for (let i = 0; i < nA; i++) {
		for (let j = 0; j < nB; j++) {
			const a = off + i * pitch;
			const b = off + j * pitch;
			groundLines.push(...quadToLines([frame.point(a, b), frame.point(a + cell, b), frame.point(a + cell, b + cell), frame.point(a, b + cell)], "ground"));
			if (random() < 0.12) continue; // empty lot
			// Split the lot in one to three buildings along a or b
			const parts = random() < 0.5 * params.density ? floor(random(2, 4)) : 1;
			const alongA = random() < 0.5;
			const gap = parts > 1 ? random(0, 18) : 0;
			const size = (cell - gap * (parts - 1)) / parts;
			for (let p = 0; p < parts; p++) {
				const tall = random() < 0.1 * params.density;
				const h = tall ? random(1.3, 2.2) * heightRef : random(0.25, 1.1) * heightRef;
				const inset = random(0, 12);
				const spec = alongA
					? {a: a + p * (size + gap) + inset, b: b + inset, wa: size - inset * 2, wb: cell - inset * 2, h}
					: {a: a + inset, b: b + p * (size + gap) + inset, wa: cell - inset * 2, wb: size - inset * 2, h};
				addBuilding(boxes, frame, spec, {...style, windows: random() < 0.85});
			}
		}
	}

	return {scene, frame, boxes, groundLines};
}

function quadToLines(quad, preset) {
	return quad.map((p, i) => ({p, q: quad[(i + 1) % quad.length], preset}));
}
