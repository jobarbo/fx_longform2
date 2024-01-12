//* PARAMS *//
// put global settings here if needed
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;
features = $fx.getFeatures();
seed = parseInt(fxrand() * 10000000);
//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //
const paramTable = {
	pseed: () => 7265,
	x_rand_divider: () =>
		weighted_choice([
			[0.04, 6],
			[0.03, 6],
			[0.025, 90], // default
			[0.02, 6],
			[0.015, 6],
			[0.01, 6],
		]),
	y_rand_divider: () =>
		weighted_choice([
			[0.04, 6],
			[0.03, 6],
			[0.025, 90], // default
			[0.02, 6],
			[0.015, 6],
			[0.01, 6],
		]),
	bg_color: () =>
		weighted_choice([
			[[329, 98, 35, 100], 25], // default
			[[346, 68, 58, 100], 25],
			[[5, 43, 88, 100], 25],
			[[0, 0, 0, 100], 25],
		]),
	particle_num: () =>
		weighted_choice([
			[150, 5],
			[200, 85], // default
			[250, 5],
			[300, 5],
		]),
	stroke_weight: () =>
		weighted_choice([
			[0.75, 5],
			[1, 5],
			[1.5, 5],
			[2, 80], // default
			[2.5, 5],
		]),
	stroke_alpha: () =>
		weighted_choice([
			[20, 5],
			[40, 80], // default
			[60, 5],
			[80, 5],
			[100, 5],
		]),
	scale_min: () =>
		weighted_choice([
			[0.000071, 16],
			[0.00025, 16],
			[0.0005, 16],
			[0.00071, 70], // default
		]),
	scale_max: () =>
		weighted_choice([
			[0.0015, 15],
			[0.002, 15],
			[0.0025, 75], // default
			[0.0035, 15],
		]),
	amplitude: () =>
		weighted_choice([
			[750, 15],
			[1000, 15],
			[1250, 75], // default
			[1500, 15],
		]),
	ease_scalar: () =>
		weighted_choice([
			[0.05, 15],
			[0.075, 15],
			[0.1, 15],
			[0.25, 55], // default
		]),
	palette: () =>
		weighted_choice([
			["blackwhite", 12.5],
			["redblack", 12.5],
			["yellowblack", 12.5],
			["vintage", 12.5],
			["lavalamp", 1200000.5],
			["pop", 12.5],
			["shagg", 12.5],
			["neon", 12.5],
		]),
	// TODO add all parameters that need to be randomized
};

let palettes = {
	// name of the palette
	broadleaf: {
		abyss: [220, 200, 45],
		open_sea: [210, 75, 65],
		shallow_sea: [210, 50, 100],
		coast: [40, 40, 90],
		beach: [45, 35, 100],
		lowland: [70, 35, 85],
		grassland: [75, 35, 80],
		deciduous_forest: [95, 80, 60],
		coniferous_forest: [100, 75, 40],
		mountain_base: [15, 10, 25],
		mountain_high: [15, 15, 50],
		mountain_top: [10, 0, 100],
	},
	lava: {
		veryhotlava: [40, 100, 100],
		hotlava: [30, 100, 100],
		lava: [0, 100, 100],
		cold_lava: [0, 60, 60],
		plateau1: [0, 100, 10],
		plateau: [0, 100, 20],
		mountain_base: [15, 10, 25],
		mountain_high: [15, 15, 50],
		mountain_top: [10, 0, 100],
	},
	blackwhite: {
		black: [0, 0, 10],
		white: [30, 10, 100],
		black1: [0, 0, 10],
		white1: [30, 10, 100],
		black2: [0, 0, 10],
		white2: [30, 10, 100],
		black3: [0, 0, 10],
		white3: [30, 10, 100],
		black4: [0, 0, 10],
		white4: [30, 10, 100],
		black5: [0, 0, 10],
	},

	redblack: {
		black: [0, 0, 10],
		white: [30, 10, 100],
		black2: [0, 0, 10],
		white2: [30, 10, 100],
		red: [0, 70, 100],
		white3: [30, 10, 100],
		black4: [0, 0, 10],
		white4: [30, 10, 100],
		black5: [0, 0, 10],
		white5: [30, 10, 100],
	},
	yellowblack: {
		black: [0, 0, 10],
		white: [30, 10, 100],
		white2: [30, 10, 100],
		black2: [0, 0, 10],
		yellow: [50, 100, 100],
		black4: [0, 0, 10],
		white3: [30, 10, 100],
		white4: [30, 10, 100],
		black5: [0, 0, 10],
		white5: [30, 10, 100],
	},

	blueyellow: {
		black: [0, 0, 10],
		yellow1: [50, 70, 100],
		black2: [0, 0, 10],
		yellow2: [50, 70, 100],
		blue1: [200, 90, 50],
		blue2: [200, 90, 100],
		blue3: [200, 90, 50],
		yellow3: [50, 70, 100],
		black4: [0, 0, 10],
		yellow4: [50, 70, 100],
		black5: [0, 0, 10],
		yellow5: [50, 70, 100],
	},
	vintage: {
		1: [2, 90, 95],
		2: [12, 82, 97],
		3: [23, 61, 96],
		4: [35, 32, 96],
		5: [170, 42, 59],
		6: [186, 100, 54],
		7: [196, 100, 49],
		8: [214, 100, 26],
	},
	pop: {
		1: [11, 88, 95],
		2: [42, 82, 95],
		3: [169, 20, 78],
		4: [339, 56, 96],
		5: [28, 14, 95],
		6: [138, 73, 50],
		7: [305, 15, 88],
		8: [28, 14, 95],
		9: [42, 82, 95],
		10: [11, 88, 95],
		11: [339, 56, 96],
		12: [28, 14, 95],
		13: [169, 20, 78],
		14: [28, 14, 95],
	},
	shagg: {
		1: [25, 45, 96],
		2: [5, 94, 97],
		3: [27, 87, 98],
		4: [359, 97, 37],
		5: [25, 45, 96],
		6: [359, 97, 37],
		7: [27, 87, 98],
		8: [5, 94, 97],
		9: [25, 45, 96],
		10: [359, 97, 37],
	},
	lavalamp: {
		1: [250, 79, 25],
		2: [238, 69, 38],
		3: [239, 68, 55],
		4: [268, 66, 55],
		5: [307, 77, 58],
		6: [326, 92, 89],
		7: [351, 67, 90],
		8: [18, 71, 92],
		9: [24, 74, 94],
		10: [34, 80, 94],
		7: [44, 88, 95],
		8: [50, 86, 95],
		9: [50, 40, 100],
		10: [52, 17, 100],
	},

	neon: {
		1: [30, 10, 98],
		2: [0, 0, 0],
		3: [338, 100, 97],
		4: [183, 100, 95],
		5: [145, 100, 96],
		6: [58, 77, 96],
		7: [244, 89, 92],
		8: [0, 0, 0],
		9: [30, 10, 98],
		10: [0, 0, 0],
		11: [244, 89, 92],
		12: [58, 77, 96],
		13: [145, 100, 96],
		14: [183, 100, 95],
		15: [338, 100, 97],
		16: [0, 0, 0],
		17: [30, 10, 98],
	},
};

const gridTypeArr = [
	[1, 20],
	[2, 20],
	[4, 20],
	[8, 20],
	[12, 20],
	[24, 20],
	[36, 20],
	[72, 20],
];

const octaveArr = [
	[1, 16.6],
	[2, 16.6],
	[3, 16.6],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(params) {
	const randomizedParams = Object.fromEntries(
		Object.keys(paramTable).map((key) => [key, paramTable[key]()])
	);
	console.log("Randomized params", randomizedParams);
	params !== undefined && console.log("Override params", params);

	return {
		max_scale: 0.0025,
		min_scale: 0.00071,
		max_amp: 1200,
		min_amp: 1,
		ease_scalar: 0.25,
		palette: "lavalamp",
		...randomizedParams, // randomized on the table
		...params, // explicit overrides
	};
}
