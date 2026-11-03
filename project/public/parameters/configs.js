//* LIGNIS CONFIGS *//
// Every config is a full description of one "look" (superCurve modes + motion + framing).
// Template chain: BASE_CONFIG → FAMILY_* → config. Each level only writes what changes.
// Values are ported from the commit listed in `commit` (git show <commit>:project/public/shapes/mover.js).

// ============================================================================
// TEMPLATE HELPERS
// ============================================================================

// Deep merge for plain objects. Arrays and primitives are replaced, never merged.
function defineConfig(parent, overrides = {}) {
	const out = {...parent};
	for (const [key, value] of Object.entries(overrides)) {
		const isObject = value && typeof value === "object" && !Array.isArray(value);
		out[key] = isObject && parent[key] && typeof parent[key] === "object" ? defineConfig(parent[key], value) : value;
	}
	return out;
}

// ============================================================================
// BASE (= current ex-lignis state, LIGNIS OG)
// ============================================================================

const BASE_CONFIG = {
	label: "",
	family: "",
	commit: "",
	// Domain warp (3 oct() passes) + un/vn generator — see FLOW_MODES in mover.js
	flow: {mode: "sine", octave: 1, a1: 1, a2: 1, scaleAmplitude: true},
	// scl are divided by the canvas multiplier in INIT
	noise: {scl: [0.002, 0.002, 0.002], sclOffset: [1, 1, 1], noiseScale: [1, 1, 1, 1]},
	// min/max flow bounds — see BOUNDS_MODES. input = oct() range mapped onto [lo, hi]
	bounds: {mode: "pNoise", octave: 1, input: 0.005, maxU: [-1, 1], maxV: [-1, 1], minU: [-1, 1], minV: [-1, 1]},
	// u/v mapping — see UV_MODES. Higher span = more binary / blocky
	uv: {mode: "introverted", inner: 0.0000001, span: 1.5},
	// ZZ zigzag — see ZZ_RULES. mapRange null = raw ZZ value (no map onto min/max)
	zz: {rule: "half", m: 35, b: 80, ku: 0.018, kv: 0.018, kNeg: null, mapRange: 1},
	// Divider = step size (bigger = slower). skipper = random jitter that fades over skipperFrames * maxFrames
	motion: {xDiv: 0.021, yDiv: 0.021, skipper: 0, skipperFrames: 0.5, reentryDecay: true, colorDivider: 1.25},
	// Wrap padding is a fraction of the short edge. yMode: "ratio" | "plain" | "fromX". reentry: number or [min, max]
	wrap: {padding: [0, 0], yMode: "ratio", multiplier: 1, reentry: [0.025, 0.08]},
	// sizeRef: short-edge reference of the MULTIPLIER used when the config was made (null = current layout)
	render: {particleSize: 0.75, particleNum: 500000, maxFrames: 25, drawFirstFrame: false, sizeRef: null},
	// Framing — scale = canvas zoom, padding = number (fraction of short edge) or {x, y} (fraction per axis)
	layout: {scale: 1, padding: 0.05},
};

// Shared by every config when the "Framing" control is set to uniform
const UNIFORM_LAYOUT = {scale: 1, padding: 0.05};

// MULTIPLIER references of older layouts (short edge that gave MULTIPLIER = 1)
const SIZE_REF_1185 = 1185; // BASE_WIDTH 948, MULTIPLIER = shortEdge / 1185 (july → october 2025)
const SIZE_REF_1250 = 1250; // BASE_WIDTH 1000, MULTIPLIER = shortEdge / 1250 (august → november 2025)
const SIZE_REF_1000 = 1000; // canvas sized on the long edge, MULTIPLIER = shortEdge / 1000 (april → june 2026)

// ============================================================================
// FAMILIES
// ============================================================================

//! LIGNIS — wood / fibre look, ZZ on positives only
const FAMILY_LIGNIS = defineConfig(BASE_CONFIG, {family: "Lignis"});

// Pre-refactor Lignis (before CANVAS_CONFIG): per-axis padding, fixed reentry
const FAMILY_LIGNIS_LEGACY = defineConfig(FAMILY_LIGNIS, {
	zz: {mapRange: null},
	motion: {xDiv: 0.01, yDiv: 0.01, reentryDecay: false},
	wrap: {padding: [0.05, 0.05], multiplier: 0.5, reentry: 0.002},
	render: {sizeRef: SIZE_REF_1185},
	layout: {padding: {x: 0.1, y: 0.1}},
});

//! EQUILIBRIUM — strong warp (a = 21), thresholded bounds
const FAMILY_EQUILIBRIUM = defineConfig(BASE_CONFIG, {
	family: "Equilibrium",
	flow: {a1: 21, a2: 21, scaleAmplitude: false},
	noise: {scl: [0.0019, 0.002, 0.0021], sclOffset: [0.75, 0.75, 0.75]},
	bounds: {input: 0.000000015, maxU: [-0.3, 0.35], maxV: [-0.3, 0.35], minU: [-0.3, 0.3], minV: [-0.3, 0.3]},
	zz: {rule: "raw", m: 50, b: 60, ku: 0.0015, kv: 0.0015, mapRange: null},
	motion: {xDiv: 0.0045, yDiv: 0.0045, reentryDecay: false, colorDivider: 1.5},
	wrap: {padding: [0.1, 0.1], multiplier: 0.5, reentry: 0.003},
	render: {sizeRef: SIZE_REF_1185},
	layout: {padding: {x: 0.3, y: 0.3}},
});

//! GRIDFALL — tiny scl, V constrained to positives = vertical fall
const FAMILY_GRIDFALL = defineConfig(BASE_CONFIG, {
	family: "Gridfall",
	noise: {scl: [0.0002, 0.0002, 0.0002], noiseScale: [12, 12, 12, 12]},
	bounds: {maxV: [0.25, 0.5], minV: [0, 0.25]},
	uv: {span: 25.5},
	zz: {ku: 0.0018, kv: 0.0018},
	motion: {xDiv: 0.01, yDiv: 0.01, reentryDecay: false},
	wrap: {padding: [0.05, 0.05], reentry: 0.002},
	render: {sizeRef: SIZE_REF_1250},
	layout: {padding: {x: 0.1, y: 0.1}},
});

//! HIGH AMP — wide U, strong horizontal direction (xDiv >> yDiv)
const FAMILY_HIGH_AMP = defineConfig(FAMILY_GRIDFALL, {
	family: "High amp",
	noise: {scl: [0.002, 0.002, 0.002], noiseScale: [1, 1, 1, 1]},
	bounds: {maxU: [-11, 11], minU: [-11, 11]},
	zz: {rule: "sym", ku: 0.08, kv: 0.2},
	motion: {xDiv: 0.4, yDiv: 0.01},
	wrap: {reentry: 0.01},
});

//! RUG — noise-based un/vn, 6 octaves
const FAMILY_RUG = defineConfig(FAMILY_EQUILIBRIUM, {
	family: "Rug",
	flow: {mode: "noise", octave: 6, a1: 1, a2: 1},
	noise: {sclOffset: [2.75, 2.75, 2.75]},
	bounds: {octave: 6},
	uv: {span: 1111.5},
	motion: {xDiv: 0.45, yDiv: 0.45, colorDivider: 1.5},
	wrap: {multiplier: 1},
	render: {particleSize: 0.25, particleNum: 150000},
});

//! PSYCHÉ — divinorum, wide bounds, x2 zoom
const FAMILY_PSYCH = defineConfig(BASE_CONFIG, {
	family: "Psyché",
	flow: {scaleAmplitude: false},
	noise: {scl: [0.0019, 0.002, 0.0021]},
	bounds: {input: 1.000000015, maxU: [-2.3, 2.35], maxV: [-2.3, 2.35], minU: [2.3, -2.3], minV: [0.3, -12.3]},
	uv: {span: 1230.00005},
	zz: {rule: "sym", ku: 0.08, kv: 0.2},
	motion: {xDiv: 0.9, yDiv: 0.2, colorDivider: 1.1},
	wrap: {padding: [0.0001, 0.0001], yMode: "fromX", reentry: [0.005, 0.02]},
	render: {particleSize: 0.35, particleNum: 550000, maxFrames: 35, sizeRef: SIZE_REF_1185},
	layout: {scale: 2, padding: {x: 0.3, y: 0.3}},
});

//! MOIRÉ — divinorum, a1 >> a2, thresholded bounds
const FAMILY_MOIRE = defineConfig(FAMILY_PSYCH, {
	family: "Moiré",
	flow: {a1: 121, a2: 1},
	noise: {sclOffset: [2.75, 2.75, 2.75]},
	bounds: {input: 0.000000015, maxU: [-4.3, 4.35], maxV: [-4.3, 4.35], minU: [4.3, -4.3], minV: [-4.3, 4.3]},
	uv: {span: 1.00005},
	zz: {m: 30, ku: 0.08, kv: 0.02},
	motion: {xDiv: 0.24, yDiv: 0.2},
	wrap: {padding: [0.015, 0.015], yMode: "ratio", reentry: [0.005, 0.02]},
	render: {drawFirstFrame: true},
});

// ============================================================================
// CONFIGS (dropdown order)
// ============================================================================

const LIGNIS_CONFIGS = {
	//! Lignis
	"og-masterpiece": defineConfig(FAMILY_LIGNIS_LEGACY, {label: "OG masterpiece", commit: "a9eed96", flow: {scaleAmplitude: false}, wrap: {multiplier: 0.001, reentry: 0.01}}),
	"toned-down": defineConfig(FAMILY_LIGNIS_LEGACY, {label: "Toned down amplitude", commit: "93ceea4", flow: {a1: 10, a2: 10}}),
	"new-zz": defineConfig(FAMILY_LIGNIS_LEGACY, {label: "New ZZ config", commit: "255e355", zz: {mapRange: 1}, motion: {xDiv: 0.02, yDiv: 0.02}, render: {sizeRef: SIZE_REF_1250}}),
	og: defineConfig(FAMILY_LIGNIS, {label: "OG", commit: "b3e3bba"}),
	organics: defineConfig(FAMILY_LIGNIS, {label: "Organics", commit: "d3290be", bounds: {input: 0.004}, uv: {inner: 0.001}, zz: {ku: 0.0028, kv: 0.0028}}),
	hardline: defineConfig(FAMILY_LIGNIS, {label: "Hardline", commit: "395f287", bounds: {input: 0.0025}, uv: {inner: 0.001}, zz: {ku: 0.0058, kv: 0.0058, mapRange: 11}}),
	larger: defineConfig(FAMILY_LIGNIS, {
		label: "Larger composition",
		commit: "d86f0a7",
		bounds: {input: 0.0025},
		uv: {inner: 0.001},
		zz: {ku: 0.0038, kv: 0.0038, mapRange: 11},
		motion: {reentryDecay: false},
		wrap: {padding: [0.01, 0.01], reentry: 0.0075},
		render: {drawFirstFrame: true, sizeRef: SIZE_REF_1000},
		layout: {padding: {x: 0.02, y: 0.02}},
	}),
	degrade: defineConfig(FAMILY_LIGNIS, {
		label: "Dégradé dans les étapes",
		commit: "6933e54",
		bounds: {input: 0.0025},
		uv: {inner: 0.001},
		zz: {ku: 0.0058, kv: 0.0058, mapRange: 11},
		wrap: {padding: [0.015, 0.015]},
		render: {drawFirstFrame: true, sizeRef: SIZE_REF_1000},
		layout: {padding: {x: 0.02, y: 0.02}},
	}),

	//! Equilibrium
	"smaller-comps": defineConfig(FAMILY_EQUILIBRIUM, {label: "Smaller comps", commit: "cfc64be", wrap: {yMode: "plain"}, layout: {padding: 0.3}}),
	"zz-equilibrium": defineConfig(FAMILY_EQUILIBRIUM, {label: "ZZ equilibrium", commit: "f5a649a", zz: {rule: "abs", kNeg: 0.00000025}, layout: {scale: 1.5}}),
	"zz-even": defineConfig(FAMILY_EQUILIBRIUM, {label: "ZZ even on both sides", commit: "f599cb5", zz: {rule: "abs"}, wrap: {multiplier: 1}, layout: {scale: 1.5}}),

	//! Gridfall
	gridfall: defineConfig(FAMILY_GRIDFALL, {label: "Gridfall", commit: "8127d7f", bounds: {minV: [-0.2, 0.25]}, wrap: {multiplier: 0.5}}),
	"gridfall-fix": defineConfig(FAMILY_GRIDFALL, {label: "Gridfall fix", commit: "2cb5451"}),
	"gridfall-2": defineConfig(FAMILY_GRIDFALL, {label: "Gridfall 2.0", commit: "7f5570b", noise: {noiseScale: [12, 1, 12, 12]}, zz: {ku: 0.008, kv: 0.028}, motion: {xDiv: 0.02, yDiv: 0.02}}),
	"gridfall-toned": defineConfig(FAMILY_GRIDFALL, {label: "Tone down vertical lines", commit: "99457ba", noise: {noiseScale: [12, 1, 12, 12]}, zz: {ku: 0.008, kv: 0.02}, motion: {xDiv: 0.02, yDiv: 0.02}}),

	//! High amp
	"high-amp": defineConfig(FAMILY_HIGH_AMP, {label: "High amp + large line", commit: "ea7035b", flow: {a1: 11122, a2: 11122}, noise: {scl: [0.0002, 0.0002, 0.0002], noiseScale: [12, 1, 12, 12]}, zz: {rule: "half"}, wrap: {reentry: 0.02}}),
	"blocky-grid": defineConfig(FAMILY_HIGH_AMP, {label: "Blocky grid", commit: "68e42df", uv: {span: 1125.5}}),
	"blocky-grid-fix": defineConfig(FAMILY_HIGH_AMP, {label: "Blocky grid fix", commit: "756f9a5"}),
	"fun-trippy": defineConfig(FAMILY_HIGH_AMP, {label: "Fun trippy", commit: "78e24f4", wrap: {padding: [-0.000001, -0.000001]}, render: {drawFirstFrame: true}, layout: {scale: 1.25}}),
	stacked: defineConfig(FAMILY_HIGH_AMP, {label: "Stacked", commit: "75fdf71", bounds: {input: 0.015}, zz: {rule: "cross", kv: 0.02}, wrap: {padding: [0.03, 0.03]}, layout: {padding: {x: 0.05, y: 0.05}}}),

	//! Rug
	rug: defineConfig(FAMILY_RUG, {label: "Nice rug", commit: "e4107cb", wrap: {yMode: "plain"}, layout: {padding: 0.3}}),
	landscape: defineConfig(FAMILY_RUG, {
		label: "Landscape (lascau)",
		commit: "96cd30c",
		flow: {a1: 221, a2: 1221},
		noise: {noiseScale: [1, 1, 1, 122]},
		bounds: {input: 1.000000015, maxU: [-2.3, 2.35], maxV: [-2.3, 2.35], minU: [2.3, -2.3], minV: [2.3, -12.3]},
		uv: {span: 1230.00005},
		zz: {ku: 0.0000015, kv: 0.0000015},
		motion: {skipper: 10, colorDivider: 1.2},
		wrap: {padding: [0.0001, 0.0001], yMode: "fromX", reentry: 0.000003},
		render: {particleSize: 0.35, maxFrames: 35},
		layout: {scale: 2},
	}),
	realism: defineConfig(FAMILY_RUG, {
		label: "Realism fix",
		commit: "9b4e06d",
		flow: {a1: 221, a2: 1221},
		bounds: {input: 1.000000015, maxU: [-2.3, 2.35], maxV: [-2.3, 2.35], minU: [2.3, -2.3], minV: [0.3, -12.3]},
		uv: {span: 1230.00005},
		zz: {ku: 0.0000015, kv: 0.0000015},
		motion: {xDiv: 0.9, yDiv: 0.9, skipper: 10, colorDivider: 1.1},
		wrap: {padding: [0.0001, 0.0001], yMode: "fromX", reentry: [0.005, 0.02]},
		render: {particleSize: 0.35, maxFrames: 35},
		layout: {scale: 2},
	}),

	//! Psyché
	"retro-psych": defineConfig(FAMILY_PSYCH, {label: "Retro psychedelic", commit: "ae6c173", noise: {sclOffset: [2.75, 2.75, 2.75]}}),
	"psych-60": defineConfig(FAMILY_PSYCH, {
		label: "Very psych 60",
		commit: "40d3dcc",
		bounds: {minV: [-0.3, 12.3]},
		motion: {yDiv: 0.02, colorDivider: 1.01},
		wrap: {padding: [0.05, 0.015], yMode: "ratio", multiplier: 2, reentry: [0.05, 0.02]},
		render: {drawFirstFrame: true},
	}),
	whirlpool: defineConfig(FAMILY_PSYCH, {
		label: "Whirlpool",
		commit: "e18eff2",
		noise: {noiseScale: [1, 2, 1, 1]},
		bounds: {minV: [-2.3, 2.3]},
		zz: {rule: "half", m: 70, ku: 0.8, kv: 0.2},
		motion: {xDiv: 0.09, yDiv: 0.02, colorDivider: 1.01},
		wrap: {padding: [0.015, 0.015], yMode: "ratio", reentry: [0.015, 0.02]},
		render: {drawFirstFrame: true},
	}),
	architectural: defineConfig(FAMILY_PSYCH, {
		label: "Architectural recursion",
		commit: "dbca0d0",
		bounds: {maxU: [-12.3, 12.35], maxV: [-12.3, 12.35], minU: [12.3, -12.3], minV: [-12.3, 12.3]},
		uv: {span: 0.00005},
		zz: {rule: "half", m: 70, ku: 0.8, kv: 0.2},
		motion: {xDiv: 0.2, yDiv: 0.2, colorDivider: 1.01},
		wrap: {padding: [0.015, 0.015], yMode: "ratio", reentry: [0.015, 0.02]},
		render: {drawFirstFrame: true},
	}),

	//! Moiré
	moire: defineConfig(FAMILY_MOIRE, {label: "Flowy yet blocky", commit: "112be02"}),
	"moire-even-better": defineConfig(FAMILY_MOIRE, {label: "Even better", commit: "5de7c39", bounds: {minV: [4.3, -4.3]}}),
};

const DEFAULT_CONFIG_ID = "og";
