// ============================================================================
// LANDSCAPE — terrain beyond the city, and the waterfront
// ============================================================================
// A terrain layer is a ridge at a constant depth from the eye, built point by
// point with frame.lift, so mountains 30 km away are in the same exact
// perspective as the street. Heights and distances are real (metres).

const CITY_RADIUS_M = {small: [150, 300], medium: [350, 700], large: [900, 1450]};

/** p5 noise stretched to use the whole [0, 1] range. */
function nz(x) {
	return Math.min(1, Math.max(0, (noise(x) - 0.5) * 2.2 + 0.5));
}

function smoothNoise(x, off, octaves = 3) {
	let sum = 0;
	let amp = 1;
	let total = 0;
	for (let o = 0; o < octaves; o++) {
		sum += nz(x * 2.1 ** o + off + o * 31.7) * amp;
		total += amp;
		amp *= 0.5;
	}
	return sum / total;
}

/** Visible lateral range [X0, X1] at view depth Z (frame units), with a margin in pixels. */
function viewSpan(ctx, Z, marginPx = 60) {
	const s = ctx.scene;
	return [((-marginPx - s.centerX) * Z) / s.d, ((ctx.W + marginPx - s.centerX) * Z) / s.d];
}

class PTerrainLayer {
	/**
	 * Ridge at view depth Z, from lateral X0 to X1, heights profile(X) (all frame
	 * units). style: {kind, hatch, strata, snowLine, faceHatch, reflect}.
	 */
	constructor(frame, {Z, X0, X1, profile, style, samplePx = 4}) {
		this.kind = "terrain";
		this.frame = frame;
		this.depth = Z;
		this.style = style;
		const n = Math.max(8, Math.ceil(((X1 - X0) * frame.scene.d) / Z / samplePx));
		this.ridge = [];
		this.maxK = 0;
		for (let i = 0; i <= n; i++) {
			const X = X0 + ((X1 - X0) * i) / n;
			const k = Math.max(0, profile(X));
			const p = this.point(X, k);
			p.X = X;
			p.k = k;
			this.ridge.push(p);
			this.maxK = Math.max(this.maxK, k);
		}
		this.base = [this.point(X1, 0), this.point(X0, 0)];
		this.outline = [...this.ridge, ...this.base];
	}

	/** Screen point at lateral X and height k on this layer's plane. */
	point(X, k) {
		const {a, b} = this.frame.fromView(X, this.depth);
		return this.frame.lift(a, b, k);
	}
}

// ----------------------------------------------------------------------------
// Backgrounds (5–30 km)
// ----------------------------------------------------------------------------

/**
 * Add a ridge layer at Zm metres. profileM(Xm) gives heights in metres; with
 * `peakM`, the profile is rescaled so its highest visible point reaches it.
 */
function addTerrain(ctx, Zm, profileM, style, {spanMarginPx = 60, peakM = null} = {}) {
	const m = ctx.m;
	const Z = Zm * m;
	const [X0, X1] = viewSpan(ctx, Z, spanMarginPx);
	let scale = 1;
	if (peakM) {
		let top = 0;
		for (let i = 0; i <= 200; i++) top = Math.max(top, profileM((X0 + ((X1 - X0) * i) / 200) / m));
		if (top > 0) scale = peakM / top;
	}
	const profile = (X) => profileM(X / m) * scale * m;
	const layer = new PTerrainLayer(ctx.frame, {Z, X0, X1, profile, style});
	if (layer.maxK > 0) ctx.terrain.push(layer);
	return layer;
}

function buildMountains(ctx) {
	const n = random() < 0.5 ? 3 : 4;
	for (let i = 0; i < n; i++) {
		const t = n === 1 ? 1 : i / (n - 1);
		const Zm = (18000 + (5000 - 18000) * t) * random(0.85, 1.15);
		const H = random(2200, 3800) + (random(800, 1400) - random(2200, 3800)) * t;
		const scale = random(4000, 8000) * (Zm / 12000);
		const off = random(1000);
		const snowLine = i === 0 && H > 2000 && random() < 0.7 ? H * random(0.62, 0.78) : null;
		// Rounded slopes from smooth noise (as in Haute Montagne): more octaves, so more
		// detail, on the far ranges, broad soft shapes in front
		const octaves = Math.max(2, 5 - i);
		addTerrain(
			ctx,
			Zm,
			(X) => H * (0.1 + 0.9 * smoothNoise(X / scale, off, octaves) ** 1.6) * (0.6 + 0.4 * smoothNoise(X / (scale * 3), off + 50, 2)),
			{kind: "mountain", hatch: true, snowLine: snowLine && snowLine * ctx.m},
			{peakM: H}
		);
	}
}

function buildHills(ctx) {
	const n = random() < 0.5 ? 1 : 2;
	for (let i = 0; i < n; i++) {
		const Zm = random(3000, 8000) / (1 + i * 0.6);
		const H = random(200, 600) / (1 + i * 0.5);
		const scale = random(1500, 3500);
		const off = random(1000);
		addTerrain(ctx, Zm, (X) => H * (0.25 + 0.75 * smoothNoise(X / scale, off)), {kind: "hills", hatch: true}, {peakM: H});
	}
}

/** One long flat-topped escarpment with its scree slope in front. */
function buildCliff(ctx) {
	const Zm = random(2500, 6000);
	const H = random(250, 600);
	const [X0, X1] = viewSpan(ctx, Zm * ctx.m).map((x) => x / ctx.m);
	const width = X1 - X0;
	const start = X0 + width * random(-0.3, 0.25);
	const end = X0 + width * random(0.75, 1.3);
	const edge = width * 0.03;
	const off = random(1000);
	const inside = (X) => Math.min(1, Math.max(0, Math.min(X - start, end - X) / edge));
	// Plateau with a few steps in its rim
	addTerrain(ctx, Zm, (X) => H * (0.88 + 0.12 * (Math.floor(smoothNoise(X / 900, off) * 5) / 5)) * inside(X) ** 0.3, {
		kind: "cliff",
		hatch: false,
		faceHatch: true,
		strata: {from: 0.3, to: 0.95, count: 6, height: H * ctx.m},
	});
	addTerrain(ctx, Zm * 0.94, (X) => H * (0.18 + 0.15 * smoothNoise(X / 400, off + 9)) * inside(X), {kind: "scree", hatch: true});
}

/** Isolated buttes: flat top, steep walls, scree skirts; each one its own layer. */
function buildMesas(ctx) {
	const count = floor(random(3, 7));
	for (let i = 0; i < count; i++) {
		const Zm = random(2000, 10000);
		const [X0, X1] = viewSpan(ctx, Zm * ctx.m, -40).map((x) => x / ctx.m);
		const Xc = random(X0, X1);
		const h = random(150, 450) * (0.7 + Zm / 10000);
		const top = random(200, 900) * (0.6 + Zm / 8000);
		const off = random(1000);
		const profile = (X) => {
			const d = Math.abs(X - Xc);
			if (d < top) return h * (0.97 + 0.03 * smoothNoise(X / 150, off));
			if (d < top * 1.08) return h + (0.35 * h - h) * ((d - top) / (top * 0.08));
			if (d < top * 1.6) return 0.35 * h * (1 - (d - top * 1.08) / (top * 0.52)) ** 1.3;
			return 0;
		};
		addTerrain(ctx, Zm, profile, {kind: "mesa", hatch: true, strata: {from: 0.4, to: 0.95, count: 5, height: h * ctx.m}});
	}
}

const BACKGROUND_BUILDERS = {mountains: buildMountains, hills: buildHills, cliff: buildCliff, mesas: buildMesas, none: () => {}};

// ----------------------------------------------------------------------------
// Foregrounds (city edge to a few km)
// ----------------------------------------------------------------------------

/** Points scattered over the visible ground between two depths (metres), in frame coordinates. */
function scatterGround(ctx, nearM, farM, count) {
	const m = ctx.m;
	const out = [];
	for (let i = 0; i < count; i++) {
		// Uniform in 1/depth: as many points per screen row
		const Z = 1 / (1 / (nearM * m) + random() * (1 / (farM * m) - 1 / (nearM * m)));
		const [X0, X1] = viewSpan(ctx, Z, 20);
		out.push(ctx.frame.fromView(random(X0, X1), Z));
	}
	return out;
}

/** Hedgerows, lone trees and a few farmhouses. */
function buildPlain(ctx, {cityR}) {
	const m = ctx.m;
	const startM = Math.max(cityR / m, 150) * 1.15;
	for (let row = 0; row < 6; row++) {
		const Z = startM * 1.45 ** row * random(0.9, 1.1) * m;
		if (Z > 3000 * m) break;
		const [X0, X1] = viewSpan(ctx, Z, 20);
		const gapAt = random();
		for (let X = X0; X < X1; X += random(10, 22) * m) {
			const t = (X - X0) / (X1 - X0);
			if (Math.abs(t - gapAt) < 0.12 || random() < 0.15) continue;
			const {a, b} = ctx.frame.fromView(X, Z);
			addTree(ctx, a, b, {crownR: random(2.5, 4.5) * m, trunkH: random(2, 3.5) * m, type: random() < 0.2 ? "conifer" : "round"});
		}
	}
	for (const {a, b} of scatterGround(ctx, startM, 1200, 25)) addTree(ctx, a, b, randomTree(ctx));
	for (const {a, b} of scatterGround(ctx, startM, 1500, floor(random(2, 6)))) {
		const wa = random(9, 14) * m;
		const wb = random(7, 10) * m;
		addBox(ctx, {a, b, wa, wb, h: random(4, 6) * m, roof: {axis: wa > wb ? "a" : "b", height: random(3, 5) * m}, facade: "house", floorH: 3 * m, colW: 4 * m, windows: true});
	}
}

/** Shrubs, scattered stones, low dunes. */
function buildDesert(ctx, {cityR}) {
	const m = ctx.m;
	const startM = Math.max(cityR / m, 150) * 1.15;
	for (const {a, b} of scatterGround(ctx, startM, 1500, 160)) addTree(ctx, a, b, {crownR: random(0.6, 1.4) * m, trunkH: 0.2 * m, type: "round"});
	const dunes = floor(random(2, 4));
	for (let i = 0; i < dunes; i++) {
		const Zm = Math.max(startM * 1.4, 700) * (1 + i * random(0.6, 1.2));
		const H = random(6, 25);
		const scale = random(200, 500);
		const off = random(1000);
		addTerrain(ctx, Zm, (X) => H * smoothNoise(X / scale, off, 2) ** 2, {kind: "dune", hatch: true}, {peakM: H});
	}
}

/** Two near slopes framing a notch where the background shows. */
function buildValley(ctx) {
	const s = ctx.scene;
	const xv = ctx.W * (0.5 + random(-0.15, 0.15));
	const Z1m = random(3000, 6000);
	for (const [side, Zm] of [
		[-1, Z1m],
		[1, Z1m * random(1.2, 1.6)],
	]) {
		const Z = Zm * ctx.m;
		const Xv = ((xv - s.centerX) * Z) / s.d / ctx.m;
		const half = (ctx.W * 0.6 * Z) / s.d / ctx.m;
		const H = random(300, 800);
		const off = random(1000);
		const profile = (X) => {
			const t = Math.min(1, Math.max(0, (side < 0 ? Xv - X : X - Xv) / half));
			return H * t ** 0.75 * (0.75 + 0.35 * smoothNoise(X / 1200, off));
		};
		addTerrain(ctx, Zm, profile, {kind: "flank", hatch: true});
	}
}

// ----------------------------------------------------------------------------
// Waterfront
// ----------------------------------------------------------------------------

/**
 * Quay along a street of the grid: water where coordinate `axis` exceeds
 * `quay`. Draws the quay edge, bollards, promenade lamps and benches facing the water.
 */
function buildQuay(ctx, {axis, quay}) {
	const m = ctx.m;
	const frame = ctx.frame;
	const cam = frame.camera();
	const other = axis === "a" ? "b" : "a";
	const span = 3000 * m;
	const along = (o, s) => (axis === "a" ? {a: o, b: s} : {a: s, b: o});
	const seg = (o) => {
		const p = along(o, cam[other] - span);
		const q = along(o, cam[other] + span);
		return groundSegment(frame, p.a, p.b, q.a, q.b, "ground");
	};
	for (const o of [quay, quay - 0.5 * m]) {
		const l = seg(o);
		if (l) ctx.groundLines.push(l);
	}
	for (let s = cam[other] - 200 * m + random(0, 12) * m; s < cam[other] + 200 * m; s += random(10, 14) * m) {
		const {a, b} = along(quay - 0.7 * m, s);
		addBox(ctx, {a, b, wa: 0.35 * m, wb: 0.35 * m, h: 0.6 * m});
	}
	for (let s = cam[other] - 500 * m + random(0, 30) * m; s < cam[other] + 500 * m; s += random(25, 35) * m) {
		const {a, b} = along(quay - 1.5 * m, s);
		addLamp(ctx, {ca: a, cb: b, h: random(5, 6.5) * m, arm: m, da: axis === "a" ? -1 : 0, db: axis === "b" ? -1 : 0});
	}
	for (let s = cam[other] - 200 * m + random(5, 20) * m; s < cam[other] + 200 * m; s += random(30, 60) * m) {
		const {a, b} = along(quay - 3.2 * m, s);
		addBench(ctx, {a, b, axis: other, len: 1.8 * m, back: -1});
	}
}

/**
 * Short horizontal ripples over the water, packed tighter toward the horizon.
 * Under a sun ahead, a path of glints runs down from the horizon toward the eye.
 */
function addRipples(ctx, isWater) {
	const s = ctx.scene;
	const frame = ctx.frame;
	const sun = ctx.sun;
	const glitter = sun.ahead && sun.rayVP && sun.rayVP.x > -100 && sun.rayVP.x < ctx.W + 100;
	for (let y = s.horizonY + 0.8; y < ctx.H + 10; y += Math.max(2.2, (y - s.horizonY) * 0.07)) {
		const dy = y - s.horizonY;
		const len = Math.min(45, Math.max(3, dy * 0.45));
		const count = Math.ceil((ctx.W / (len * 3)) * random(0.6, 1.2));
		// The glitter path widens toward the eye, more so when the sun is low
		const half = glitter ? (14 + dy * 0.35) * (1.2 - sun.elevation / 90) : 0;
		const inPath = (x) => glitter && Math.abs(x - sun.rayVP.x) < half;
		if (glitter) {
			for (let i = 0; i < Math.ceil(half / 3); i++) {
				const x = sun.rayVP.x + random(-1, 1) * random() * half;
				const gl = Math.max(1.5, len * random(0.08, 0.25));
				const g0 = frame.groundAt(x - gl / 2, y);
				const g1 = frame.groundAt(x + gl / 2, y);
				if (isWater(g0) && isWater(g1)) ctx.groundLines.push({p: frame.point(g0.a, g0.b), q: frame.point(g1.a, g1.b), preset: "detail"});
			}
		}
		for (let i = 0; i < count; i++) {
			const x = random(-20, ctx.W + 20);
			if (inPath(x) && random() < 0.8) continue;
			const g0 = frame.groundAt(x - len / 2, y);
			const g1 = frame.groundAt(x + len / 2, y);
			if (!isWater(g0) || !isWater(g1) || frame.depth(g0.a, g0.b) < NEAR_M * ctx.m * 3) continue;
			ctx.groundLines.push({p: frame.point(g0.a, g0.b), q: frame.point(g1.a, g1.b), preset: "water"});
		}
	}
}

/** Far shore of a lake: low hills, the water line, and their broken reflection. */
function buildFarShore(ctx) {
	const Zm = random(2000, 6000);
	const H = random(30, 120);
	const scale = random(500, 1500);
	const off = random(1000);
	const layer = addTerrain(ctx, Zm, (X) => H * (0.3 + 0.7 * smoothNoise(X / scale, off)), {kind: "hills", hatch: true}, {peakM: H});
	const Zr = layer.depth * 0.999;
	const tag = (p) => ({x: p.x, y: p.y, d: Zr});
	ctx.groundLines.push({p: tag(layer.base[1]), q: tag(layer.base[0]), preset: "ground"});
	const r = layer.ridge;
	for (let i = 0; i < r.length - 1; i++) {
		if (random() < 0.45) continue;
		const p = layer.point(r[i].X, -r[i].k * 0.9);
		const q = layer.point(r[i + 1].X, -r[i + 1].k * 0.9);
		const jitter = random(-2, 2);
		ctx.groundLines.push({p: tag({x: p.x + jitter, y: p.y}), q: tag({x: q.x + jitter, y: q.y}), preset: "reflect"});
	}
	return layer;
}

// ----------------------------------------------------------------------------
// Entry point
// ----------------------------------------------------------------------------

/**
 * Everything beyond the city: the roads that leave it, the foreground and the
 * background. roads: [{axis, line, half}] streets running along `axis` at
 * `line` (their centre) with half-width `half`; shore: {axis, quay} or null.
 */
function buildLandscape(ctx, params, {cityR, roads, shore}) {
	const m = ctx.m;
	const frame = ctx.frame;
	const cam = frame.camera();

	// Roads leave the city toward the horizon (or end at the quay)
	for (const road of roads) {
		const other = road.axis === "a" ? "b" : "a";
		const s0 = cam[road.axis] + cityR * 0.85;
		const s1 = shore && shore.axis === road.axis ? shore.quay : cam[road.axis] + 3000 * m;
		if (s1 <= s0) continue;
		const at = (o, s) => (road.axis === "a" ? [s, o] : [o, s]);
		for (const o of [road.line - road.half, road.line + road.half]) {
			const [a0, b0] = at(o, s0);
			const [a1, b1] = at(o, s1);
			const l = groundSegment(frame, a0, b0, a1, b1, "ground");
			if (l) ctx.groundLines.push(l);
		}
		for (let s = s0; s < Math.min(s1, cam[road.axis] + 600 * m); s += 9 * m) {
			const [a0, b0] = at(road.line, s);
			const [a1, b1] = at(road.line, s + 3 * m);
			ctx.groundLines.push({p: frame.point(a0, b0), q: frame.point(a1, b1), preset: "detail"});
		}
	}

	const fg = params.foreground;
	if (fg === "ocean" || fg === "lake") {
		buildQuay(ctx, shore);
		addRipples(ctx, (g) => g[shore.axis] > shore.quay + 0.3 * m);
		if (fg === "lake") buildFarShore(ctx);
		else {
			// The sea line is the horizon itself
			const far = 1e6 * m;
			ctx.groundLines.push({p: {x: -40, y: ctx.scene.horizonY, d: far}, q: {x: ctx.W + 40, y: ctx.scene.horizonY, d: far}, preset: "ground"});
		}
	} else if (fg === "plain") buildPlain(ctx, {cityR});
	else if (fg === "desert") buildDesert(ctx, {cityR});
	else if (fg === "valley") buildValley(ctx);

	BACKGROUND_BUILDERS[params.background](ctx);
}
