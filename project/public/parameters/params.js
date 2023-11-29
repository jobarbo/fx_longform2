//* PARAMS *//
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;
features = $fx.getFeatures();
seed = parseInt(fxrand() * 10000000);

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

const scaleValueArr = [
	['0.0001, 0.002', 33],
	['0.002, 0.005', 33],
	['0.005, 0.01', 33],
];

const scaleValueNameArr = [
	['Close', 40],
	['Mid', 35],
	['Far', 25],
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
	['Drift', 5],
	['Original-Revert', 30],
	['Drift-Revert', 5],
	['Stretch', 30],
];

const particleBehaviorNameArr = [
	['five-five', 5],
	['five-ten', 5],
	['five-fifteen', 5],
	['five-twenty', 5],
	['seven-seven', 5],
	['seven-ten DAB', 5],
	['seven-fifteen', 5],
	['seven-twenty', 5],
	['ten-five', 5],
	['ten-ten', 5],
	['ten-fifteen', 5],
	['ten-twenty', 5],
	['fifteen-five', 5],
	['fifteen-ten', 5],
	['fifteen-fifteen', 5],
	['fifteen-twenty', 5],
	['twenty-five', 5],
	['twenty-ten', 5],
	['twenty-fifteen', 5],
	['twenty-twenty', 5],
	['four-twenty BLAZE IT', 5],
];

const particleBehaviorArr = [
	['5,5,5,5', 5],
	['5,5,10,10', 5],
	['5,5,15,15', 5],
	['5,5,20,20', 5],
	['7,7,7,7', 5],
	['7,7,10,10', 5],
	['7,7,15,15', 5],
	['7,7,20,20', 5],
	['10,10,5,5', 5],
	['10,10,10,10', 5],
	['10,10,15,15', 5],
	['10,10,20,20', 5],
	['15,15,5,5', 5],
	['15,15,10,10', 5],
	['15,15,15,15', 5],
	['15,15,20,20', 5],
	['20,20,5,5', 5],
	['20,20,10,10', 5],
	['20,20,15,15', 5],
	['20,20,20,20', 5],
	['4,4,20,20', 5],
];

const amplitudeModeArr = [
	['none', 50],
	['low', 40],
	['high', 10],
];

const vibrancyModeArr = [
	['low', 20],
	['high', 20],
	['full', 60],
];

const lineModeArr = [
	['hairline', 10],
	['thin', 10],
	['fine', 10],
	['medium', 10],
	['thick', 10],
	['pillar', 10],
	['sixteenth', 10],
	['eight', 10],
	['quarter', 10],
	['full', 10],
];

const lineModeValueArr = [
	['1', 10],
	['3', 10],
	['5', 10],
	['10', 10],
	['25', 10],
	['50', 10],
	['75', 10],
	['100', 10],
	['100', 10],
	['width', 10],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(
	complexity,
	theme,
	colormode,
	clampvalue,
	clampname,
	scalevalue,
	scalename,
	behaviorname,
	behaviorvalue,
	amplitudemode,
	vibrancymode,
	linemodeName,
	linemode
) {
	// SET DEFAULTS IF NOT PASSED IN

	if (theme === undefined) {
		theme = weighted_choice(themeArr);
	}

	if (colormode === undefined) {
		colormode = weighted_choice(colorModeArr);
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

	if (behaviorname === undefined) {
		let behaviorContent = weighted_choice(particleBehaviorNameArr);
		behaviorname = behaviorContent;
		let index = -1;
		for (let i = 0; i < particleBehaviorNameArr.length; i++) {
			if (JSON.stringify(particleBehaviorNameArr[i][0]) === JSON.stringify(behaviorContent)) {
				index = i;
				break;
			}
		}

		// Assigning clampvalue based on the index found
		if (index !== -1) {
			behaviorvalue = particleBehaviorArr[index][0];
		}
	}

	if (complexity === undefined) {
		complexity = weighted_choice(complexityArr);
	}

	if (amplitudemode === undefined) {
		amplitudemode = weighted_choice(amplitudeModeArr);
	}

	if (vibrancymode === undefined) {
		vibrancymode = weighted_choice(vibrancyModeArr);
	}

	if (linemodeName === undefined) {
		let lineContent = weighted_choice(lineModeArr);
		linemodeName = lineContent;

		let index = -1;
		for (let i = 0; i < lineModeArr.length; i++) {
			if (JSON.stringify(lineModeArr[i][0]) === JSON.stringify(lineContent)) {
				index = i;
				break;
			}
		}

		// Assigning clampvalue based on the index found
		if (index !== -1) {
			linemode = lineModeValueArr[index][0];
		}
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		complexity: complexity,
		theme: theme,
		colormode: colormode,
		clampvalue: clampvalue,
		clampvalueArr: clampvalueArr,
		clampNameArr: clampNameArr,
		clampname: clampname,
		scalevalue: scalevalue,
		scaleValueArr: scaleValueArr,
		scaleValueNameArr: scaleValueNameArr,
		scalename: scalename,
		behaviorvalue: behaviorvalue,
		behaviorValueArr: particleBehaviorArr,
		behaviorNameArr: particleBehaviorNameArr,
		behaviorname: behaviorname,
		amplitudemode: amplitudemode,
		vibrancymode: vibrancymode,
		linemode: linemode,
		linemodeName: linemodeName,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
