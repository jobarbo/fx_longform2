//* PARAMS *//
// put global settings here if needed

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	['1', 70],
	['2', 20],
	['3', 5],
	['4', 2],
	['5', 2],
	['6', 1],
];

const themeArr = [
	['bright', 75],
	['dark', 25],
];

const colorModeArr = [
	['monochrome', 4],
	['duotone', 30],
	['fixed', 5],
	['dynamic', 30],
	['iridescent', 30],
];

const strokestyleArr = [
	['thin', 33],
	['regular', 33],
	['bold', 33],
];

const clampvalueArr = [
	['0.015,0.015,0.0015,0.0015', 500000],
	['0.0000015,0.25,0.25,0.0000015', 0],
	['0.0000015,0.025,0.025,0.0000015', 0],
	['0.00015,0.015,0.015,0.00015', 0],
	['0.15,0.00000015,0.15,0.0000015', 0],
	['0.0015,0.000015,0.0015,0.000015', 0],
	['0.05,0.05,0.05,0.05', 0],
	['0.15,0.15,0.15,0.15', 0],
	['0.015,0.015,0.015,0.015', 0],
	['0.0015,0.0015,0.0015,0.0015', 0],
	['0.0000015,0.0000015,0.0000015,0.0000015', 0],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(complexity, theme, composition, colormode, strokestyle, clampvalue) {
	// SET DEFAULTS IF NOT PASSED IN
	if (complexity === undefined) {
		complexity = weighted_choice(complexityArr);
	}

	if (theme === undefined) {
		theme = weighted_choice(themeArr);
	}

	if (colormode === undefined) {
		colormode = weighted_choice(colorModeArr);
	}

	if (strokestyle === undefined) {
		strokestyle = weighted_choice(strokestyleArr);
	}

	if (clampvalue === undefined) {
		clampvalue = weighted_choice(clampvalueArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		complexity: complexity,
		theme: theme,
		colormode: colormode,
		strokestyle: strokestyle,
		clampvalue: clampvalue,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
