//* PARAMS *//
// put global settings here if needed

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	['1', 40],
	['2', 30],
	['6', 30],
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
	['thin', 1000000],
	['regular', 0],
	['bold', 0],
];

const scaleValueArr = [
	['0.0001, 0.002', 33],
	['0.002, 0.005', 33],
	['0.005, 0.01', 33],
];

const scaleValueNameArr = [
	['Close', 33],
	['Mid', 33],
	['Far', 33],
];

const clampvalueArr = [
	['0.015,0.015,0.0015,0.0015', 30],
	['0.025,0.025,0.0000015,0.0000015', 20],
	['0.0015,0.0015,0.015,0.015', 30],
	['0.0000015,0.0000015,0.025,0.025', 20],
	['0.0000015,0.0000015,0.0000015,0.0000015', 10],
];

const clampNameArr = [
	['Original', 30],
	['Drift', 20],
	['Orevert', 30],
	['Drirevert', 20],
	['Decimal', 10],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(
	complexity,
	theme,
	colormode,
	strokestyle,
	clampvalue,
	clampname,
	scalevalue,
	scalename
) {
	// SET DEFAULTS IF NOT PASSED IN

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

	if (scalename === undefined) {
		let scaleContent = weighted_choice(scaleValueNameArr);
		scalename = scaleContent;
		let index = -1;
		for (let i = 0; i < scaleValueNameArr.length; i++) {
			if (JSON.stringify(scaleValueNameArr[i][0]) === JSON.stringify(scaleContent)) {
				index = i;
				break;
			}
		}

		// Assigning clampvalue based on the index found
		if (index !== -1) {
			scalevalue = scaleValueArr[index][0];
		}
	}

	if (complexity === undefined) {
		/* 		if (scalename === 'Close') {
			complexityArr.push(['6', 50]);
		} else if (scalename === 'Mid') {
			complexityArr.push(['6', 50]);
		} else if (scalename === 'Far') {
			complexityArr.push(['6', 50]);
		}
		console.log(complexityArr); */
		complexity = weighted_choice(complexityArr);
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
		scalevalue: scalevalue,
		scalevalueArr: scaleValueArr,
		scaleNameArr: scaleValueNameArr,
		scalename: scalename,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
