//* LIGNIS CONFIGS *//
// BASE_CONFIG → FAMILY_* → config, each level only writes what changes.

// ============================================================================
// TEMPLATE HELPERS
// ============================================================================

// Deep merge, arrays are replaced
function defineConfig(parent, overrides = {}) {
	const out = {...parent};
	for (const [key, value] of Object.entries(overrides)) {
		const isObject = value && typeof value === "object" && !Array.isArray(value);
		out[key] = isObject && parent[key] && typeof parent[key] === "object" ? defineConfig(parent[key], value) : value;
	}
	return out;
}

// ============================================================================
// BASE (= LIGNIS OG)
// ============================================================================

const BASE_CONFIG = {
	label: "",
	family: "",
	commit: "",
	flow: {mode: "sine", octave: 1, a1: 1, a2: 1, scaleAmplitude: true},
	noise: {scl: [0.002, 0.002, 0.002], sclOffset: [1, 1, 1], noiseScale: [1, 1, 1, 1]},
	bounds: {mode: "pNoise", octave: 1, input: 0.005, maxU: [-1, 1], maxV: [-1, 1], minU: [-1, 1], minV: [-1, 1]},
	uv: {mode: "introverted", inner: 0.0000001, span: 1.5},
	// mapRange null = raw ZZ
	zz: {rule: "half", m: 35, b: 80, ku: 0.018, kv: 0.018, kNeg: null, mapRange: 1},
	motion: {xDiv: 0.021, yDiv: 0.021, skipper: 0, skipperFrames: 0.5, reentryDecay: true, colorDivider: 1.25},
	// reentry: number or [min, max]
	wrap: {reentry: [0.025, 0.08]},
	// sizeRef: MULTIPLIER reference of older layouts (null = current)
	render: {particleSize: 0.75, particleNum: 500000, maxFrames: 25, sizeRef: null},
};

const SIZE_REF_1185 = 1185; // BASE_WIDTH 948
const SIZE_REF_1250 = 1250; // BASE_WIDTH 1000
const SIZE_REF_1000 = 1000; // canvas sized on the long edge

// ============================================================================
// FAMILIES
// ============================================================================

//! LIGNIS
const FAMILY_LIGNIS = defineConfig(BASE_CONFIG, {family: "Lignis"});

// Before CANVAS_CONFIG
const FAMILY_LIGNIS_LEGACY = defineConfig(FAMILY_LIGNIS, {
	zz: {mapRange: null},
	motion: {xDiv: 0.01, yDiv: 0.01, reentryDecay: false},
	wrap: {reentry: 0.002},
	render: {sizeRef: SIZE_REF_1185},
});

//! EQUILIBRIUM
const FAMILY_EQUILIBRIUM = defineConfig(BASE_CONFIG, {
	family: "Equilibrium",
	flow: {a1: 21, a2: 21, scaleAmplitude: false},
	noise: {scl: [0.0019, 0.002, 0.0021], sclOffset: [0.75, 0.75, 0.75]},
	bounds: {input: 0.000000015, maxU: [-0.3, 0.35], maxV: [-0.3, 0.35], minU: [-0.3, 0.3], minV: [-0.3, 0.3]},
	zz: {rule: "raw", m: 50, b: 60, ku: 0.0015, kv: 0.0015, mapRange: null},
	motion: {xDiv: 0.0045, yDiv: 0.0045, reentryDecay: false, colorDivider: 1.5},
	wrap: {reentry: 0.003},
	render: {sizeRef: SIZE_REF_1185},
});

//! GRIDFALL
const FAMILY_GRIDFALL = defineConfig(BASE_CONFIG, {
	family: "Gridfall",
	noise: {scl: [0.0002, 0.0002, 0.0002], noiseScale: [12, 12, 12, 12]},
	bounds: {maxV: [0.25, 0.5], minV: [0, 0.25]},
	uv: {span: 25.5},
	zz: {ku: 0.0018, kv: 0.0018},
	motion: {xDiv: 0.01, yDiv: 0.01, reentryDecay: false},
	wrap: {reentry: 0.002},
	render: {sizeRef: SIZE_REF_1250},
});

//! HIGH AMP
const FAMILY_HIGH_AMP = defineConfig(FAMILY_GRIDFALL, {
	family: "High amp",
	noise: {scl: [0.002, 0.002, 0.002], noiseScale: [1, 1, 1, 1]},
	bounds: {maxU: [-11, 11], minU: [-11, 11]},
	zz: {rule: "sym", ku: 0.08, kv: 0.2},
	motion: {xDiv: 0.4, yDiv: 0.01},
	wrap: {reentry: 0.01},
});

//! RUG
const FAMILY_RUG = defineConfig(FAMILY_EQUILIBRIUM, {
	family: "Rug",
	flow: {mode: "noise", octave: 6, a1: 1, a2: 1},
	noise: {sclOffset: [2.75, 2.75, 2.75]},
	bounds: {octave: 6},
	uv: {span: 1111.5},
	motion: {xDiv: 0.45, yDiv: 0.45, colorDivider: 1.5},
	render: {particleSize: 0.25, particleNum: 150000},
});

//! PSYCHÉ
const FAMILY_PSYCH = defineConfig(BASE_CONFIG, {
	family: "Psyché",
	flow: {scaleAmplitude: false},
	noise: {scl: [0.0019, 0.002, 0.0021]},
	bounds: {input: 1.000000015, maxU: [-2.3, 2.35], maxV: [-2.3, 2.35], minU: [2.3, -2.3], minV: [0.3, -12.3]},
	uv: {span: 1230.00005},
	zz: {rule: "sym", ku: 0.08, kv: 0.2},
	motion: {xDiv: 0.9, yDiv: 0.2, colorDivider: 1.1},
	wrap: {reentry: [0.005, 0.02]},
	render: {particleSize: 0.35, particleNum: 550000, maxFrames: 35, sizeRef: SIZE_REF_1185},
});

//! MOIRÉ
const FAMILY_MOIRE = defineConfig(FAMILY_PSYCH, {
	family: "Moiré",
	flow: {a1: 121, a2: 1},
	noise: {sclOffset: [2.75, 2.75, 2.75]},
	bounds: {input: 0.000000015, maxU: [-4.3, 4.35], maxV: [-4.3, 4.35], minU: [4.3, -4.3], minV: [-4.3, 4.3]},
	uv: {span: 1.00005},
	zz: {m: 30, ku: 0.08, kv: 0.02},
	motion: {xDiv: 0.24, yDiv: 0.2},
	wrap: {reentry: [0.005, 0.02]},
});

// ============================================================================
// CONFIGS (dropdown order)
// ============================================================================

const LIGNIS_CONFIGS = {
	//! Lignis
	"og-masterpiece": defineConfig(FAMILY_LIGNIS_LEGACY, {label: "OG masterpiece", commit: "a9eed96", flow: {scaleAmplitude: false}, wrap: {reentry: 0.01}}),
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
		wrap: {reentry: 0.0075},
		render: {sizeRef: SIZE_REF_1000},
	}),
	degrade: defineConfig(FAMILY_LIGNIS, {
		label: "Dégradé dans les étapes",
		commit: "6933e54",
		bounds: {input: 0.0025},
		uv: {inner: 0.001},
		zz: {ku: 0.0058, kv: 0.0058, mapRange: 11},
		render: {sizeRef: SIZE_REF_1000},
	}),

	//! Equilibrium
	"zz-equilibrium": defineConfig(FAMILY_EQUILIBRIUM, {label: "ZZ equilibrium", commit: "f5a649a", zz: {rule: "abs", kNeg: 0.00000025}}),
	"zz-even": defineConfig(FAMILY_EQUILIBRIUM, {label: "ZZ even on both sides", commit: "f599cb5", zz: {rule: "abs"}}),

	//! Gridfall
	gridfall: defineConfig(FAMILY_GRIDFALL, {label: "Gridfall", commit: "8127d7f", bounds: {minV: [-0.2, 0.25]}}),
	"gridfall-fix": defineConfig(FAMILY_GRIDFALL, {label: "Gridfall fix", commit: "2cb5451"}),
	"gridfall-2": defineConfig(FAMILY_GRIDFALL, {label: "Gridfall 2.0", commit: "7f5570b", noise: {noiseScale: [12, 1, 12, 12]}, zz: {ku: 0.008, kv: 0.028}, motion: {xDiv: 0.02, yDiv: 0.02}}),
	"gridfall-toned": defineConfig(FAMILY_GRIDFALL, {label: "Tone down vertical lines", commit: "99457ba", noise: {noiseScale: [12, 1, 12, 12]}, zz: {ku: 0.008, kv: 0.02}, motion: {xDiv: 0.02, yDiv: 0.02}}),

	//! High amp
	"high-amp": defineConfig(FAMILY_HIGH_AMP, {label: "High amp + large line", commit: "ea7035b", flow: {a1: 11122, a2: 11122}, noise: {scl: [0.0002, 0.0002, 0.0002], noiseScale: [12, 1, 12, 12]}, zz: {rule: "half"}, wrap: {reentry: 0.02}}),
	"blocky-grid": defineConfig(FAMILY_HIGH_AMP, {label: "Blocky grid", commit: "68e42df", uv: {span: 1125.5}}),
	"blocky-grid-fix": defineConfig(FAMILY_HIGH_AMP, {label: "Blocky grid fix", commit: "756f9a5"}),
	stacked: defineConfig(FAMILY_HIGH_AMP, {label: "Stacked", commit: "75fdf71", bounds: {input: 0.015}, zz: {rule: "cross", kv: 0.02}}),

	//! Rug
	rug: defineConfig(FAMILY_RUG, {label: "Nice rug", commit: "e4107cb"}),
	landscape: defineConfig(FAMILY_RUG, {
		label: "Landscape (lascau)",
		commit: "96cd30c",
		flow: {a1: 221, a2: 1221},
		noise: {noiseScale: [1, 1, 1, 122]},
		bounds: {input: 1.000000015, maxU: [-2.3, 2.35], maxV: [-2.3, 2.35], minU: [2.3, -2.3], minV: [2.3, -12.3]},
		uv: {span: 1230.00005},
		zz: {ku: 0.0000015, kv: 0.0000015},
		motion: {skipper: 10, colorDivider: 1.2},
		wrap: {reentry: 0.000003},
		render: {particleSize: 0.35, maxFrames: 35},
	}),
	realism: defineConfig(FAMILY_RUG, {
		label: "Realism fix",
		commit: "9b4e06d",
		flow: {a1: 221, a2: 1221},
		bounds: {input: 1.000000015, maxU: [-2.3, 2.35], maxV: [-2.3, 2.35], minU: [2.3, -2.3], minV: [0.3, -12.3]},
		uv: {span: 1230.00005},
		zz: {ku: 0.0000015, kv: 0.0000015},
		motion: {xDiv: 0.9, yDiv: 0.9, skipper: 10, colorDivider: 1.1},
		wrap: {reentry: [0.005, 0.02]},
		render: {particleSize: 0.35, maxFrames: 35},
	}),

	//! Psyché
	"retro-psych": defineConfig(FAMILY_PSYCH, {label: "Retro psychedelic", commit: "ae6c173", noise: {sclOffset: [2.75, 2.75, 2.75]}}),
	"psych-60": defineConfig(FAMILY_PSYCH, {
		label: "Very psych 60",
		commit: "40d3dcc",
		bounds: {minV: [-0.3, 12.3]},
		motion: {yDiv: 0.02, colorDivider: 1.01},
		wrap: {reentry: [0.05, 0.02]},
	}),
	whirlpool: defineConfig(FAMILY_PSYCH, {
		label: "Whirlpool",
		commit: "e18eff2",
		noise: {noiseScale: [1, 2, 1, 1]},
		bounds: {minV: [-2.3, 2.3]},
		zz: {rule: "half", m: 70, ku: 0.8, kv: 0.2},
		motion: {xDiv: 0.09, yDiv: 0.02, colorDivider: 1.01},
		wrap: {reentry: [0.015, 0.02]},
	}),
	architectural: defineConfig(FAMILY_PSYCH, {
		label: "Architectural recursion",
		commit: "dbca0d0",
		bounds: {maxU: [-12.3, 12.35], maxV: [-12.3, 12.35], minU: [12.3, -12.3], minV: [-12.3, 12.3]},
		uv: {span: 0.00005},
		zz: {rule: "half", m: 70, ku: 0.8, kv: 0.2},
		motion: {xDiv: 0.2, yDiv: 0.2, colorDivider: 1.01},
		wrap: {reentry: [0.015, 0.02]},
	}),

	//! Moiré
	moire: defineConfig(FAMILY_MOIRE, {label: "Flowy yet blocky", commit: "112be02"}),
	"moire-even-better": defineConfig(FAMILY_MOIRE, {label: "Even better", commit: "5de7c39", bounds: {minV: [4.3, -4.3]}}),
};

const DEFAULT_CONFIG_ID = "og";
