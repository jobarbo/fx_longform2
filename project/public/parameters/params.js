//* PARAMS *//
// put global settings here if needed

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	['1', 16],
	['2', 16],
	['3', 16],
	['4', 16],
	['5', 16],
	['6', 16],
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
	['0.015,0.015,0.0015,0.0015', 16],
	['0.25,0.25,0.0000015,0.0000015,', 16],
	['0.0000015,0.025,0.025,0.0000015', 16],
	['0.05,0.05,0.05,0.05', 16],
	['0.15,0.15,0.15,0.15', 16],
	['0.0000015,0.0000015,0.0000015,0.0000015', 16],
];

const clampNameArr = [
	['Original', 16],
	['Smooth', 16],
	['Drift', 16],
	['Decimal', 16],
	['Quarter', 16],
	['Stretched', 16],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(complexity, theme, colormode, strokestyle, clampvalue, clampname) {
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

	if (clampname === undefined) {
		let clampContent = weighted_choice(clampNameArr);
		clampname = clampContent;
		let index = -1;
		for (let i = 0; i < clampNameArr.length; i++) {
			if (JSON.stringify(clampNameArr[i][0]) === JSON.stringify(clampContent)) {
				index = i;
				break;
			}
		}

		// Assigning clampvalue based on the index found
		if (index !== -1) {
			clampvalue = clampvalueArr[index][0];
		}
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
		clampvalueArr: clampvalueArr,
		clampNameArr: clampNameArr,
		clampname: clampname,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
