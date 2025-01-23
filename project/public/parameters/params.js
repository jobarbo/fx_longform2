//* PARAMS *//
// put global settings here if needed
fx = $fx;
fxrand = $fx.rand;
rand = fxrand;
fxhash = $fx.hash;
seed = fxrand() * 1000000;
//* COMPOSITION TYPE DEFINITION *//
//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const paletteArr = [
	//['broadleaf', 10],
	//['lava', 10],
	["blackwhite", 12.5],
	["redblack", 12.5],
	["yellowblack", 12.5],
	["vintage", 12.5],
	["pop", 12.5],
	["shagg", 11212.5],
	["neon", 12.5],
];

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
		1: [25, 10, 96],
		2: [20, 25, 96],
		3: [15, 45, 96],
		4: [10, 65, 96],
		5: [5, 85, 97],
		6: [11, 82, 87],
		7: [16, 80, 77],
		8: [21, 78, 67],
		9: [27, 76, 57],
		10: [32, 74, 37],
		11: [37, 72, 27],
		12: [42, 70, 17],
		13: [47, 68, 7],
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
	[4, 16.6],
	[5, 16.6],
	[6, 16.6],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(palette_type, cell_type, octave_type) {
	// SET DEFAULTS IF NOT PASSED IN
	if (palette_type === undefined) {
		palette_type = weighted_choice(paletteArr);
	}

	if (cell_type === undefined) {
		cell_type = weighted_choice(gridTypeArr);
		console.log(cell_type);
	}

	if (octave_type === undefined) {
		octave_type = weighted_choice(octaveArr);
		console.log(octave_type);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		palette_type: palette_type,
		cell_type: cell_type,
		octave_type: octave_type,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
