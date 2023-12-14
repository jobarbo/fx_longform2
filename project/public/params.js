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
	["1", 40],
	["2", 35],
	["6", 25],
];

const themeArr = [
	["bright", 55],
	["dark", 45],
];

const colorModeArr = [
	["monochrome", 4],
	["duotone", 30],
	["fixed", 5],
	["dynamic", 30],
	["iridescent", 30],
];

const scaleValueArr = [
	["0.0001, 0.0008", 25],
	["0.0008, 0.002", 25],
	["0.002, 0.005", 25],
	["0.005, 0.01", 25],
];

const scaleValueNameArr = [
	["macro", 35],
	["close", 25],
	["mid", 25],
	["far", 15],
];

const clampvalueArr = [
	["0.015,0.015,0.0015,0.0015", 30],
	["0.025,0.025,0.0000015,0.0000015", 20],
	["0.0015,0.0015,0.015,0.015", 30],
	["0.0000015,0.0000015,0.025,0.025", 20],
	["0.0000015,0.0000015,0.0000015,0.0000015", 10],
];

const clampNameArr = [
	["original", 30],
	["drift", 5],
	["original-revert", 20],
	["drift-revert", 5],
	["stretch", 40],
];

const particleBehaviorNameArr = [
	["four-twenty BLAZE-IT!", 5],
	["five-five", 5],
	["five-ten", 5],
	["five-fifteen", 5],
	["five-twenty", 5],
	["seven-seven", 5],
	["seven-ten DAB IT", 5],
	["seven-fifteen", 5],
	["seven-twenty", 5],
	["ten-five", 5],
	["ten-ten", 5],
	["ten-fifteen", 5],
	["ten-twenty", 5],
	["fifteen-five", 5],
	["fifteen-ten", 5],
	["fifteen-fifteen", 5],
	["fifteen-twenty", 5],
	["twenty-five", 5],
	["twenty-ten", 5],
	["twenty-fifteen", 5],
	["twenty-twenty", 5],
];

const particleBehaviorArr = [
	["4,4,20,20", 5],
	["5,5,5,5", 5],
	["5,5,10,10", 5],
	["5,5,15,15", 5],
	["5,5,20,20", 5],
	["7,7,7,7", 5],
	["7,7,10,10", 5],
	["7,7,15,15", 5],
	["7,7,20,20", 5],
	["10,10,5,5", 5],
	["10,10,10,10", 5],
	["10,10,15,15", 5],
	["10,10,20,20", 5],
	["15,15,5,5", 5],
	["15,15,10,10", 5],
	["15,15,15,15", 5],
	["15,15,20,20", 5],
	["20,20,5,5", 5],
	["20,20,10,10", 5],
	["20,20,15,15", 5],
	["20,20,20,20", 5],
];

const amplitudeModeArr = [
	["none", 50],
	["low", 30],
	["high", 20],
];

const amplitudeLockModeArr = [
	["true", 50],
	["false", 50],
];

const vibrancyModeArr = [
	["low", 20],
	["high", 20],
	["full", 60],
];

const lineModeArr = [
	["hairline", 10],
	["thin", 10],
	["fine", 10],
	["medium", 10],
	["thick", 10],
	["post", 10],
	["column", 10],
	["pillar", 10],
	["beam", 10],
	["wall", 10],
];

const lineModeValueArr = [
	["1", 10],
	["3", 10],
	["5", 10],
	["10", 10],
	["15", 10],
	["25", 10],
	["50", 10],
	["75", 10],
	["100", 10],
	["125", 10],
];

const jdlModeArr = [
	["true", 85],
	["false", 15],
];

const bgModeArr = [
	["transparent", 25],
	["same", 25],
	["complementary", 25],
	["analogous", 25],
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
	amplitudelockmode,
	vibrancymode,
	linemodeName,
	linemode,
	jdlMode,
	bgMode
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
			if (
				JSON.stringify(scaleValueNameArr[i][0]) === JSON.stringify(scaleContent)
			) {
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
			if (
				JSON.stringify(particleBehaviorNameArr[i][0]) ===
				JSON.stringify(behaviorContent)
			) {
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
		if (scalename === "macro") {
			let ampArray = [
				["none", 10],
				["low", 30],
				["high", 50],
			];
			amplitudemode = weighted_choice(ampArray);
		} else if (scalename === "close") {
			let ampArray = [
				["none", 33],
				["low", 33],
				["high", 33],
			];
			amplitudemode = weighted_choice(ampArray);
		} else {
			amplitudemode = weighted_choice(amplitudeModeArr);
		}
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

	if (jdlMode === undefined) {
		jdlMode = weighted_choice(jdlModeArr);
	}

	if (bgMode === undefined) {
		bgMode = weighted_choice(bgModeArr);
	}

	if (amplitudelockmode === undefined) {
		amplitudelockmode = weighted_choice(amplitudeLockModeArr);
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
		amplitudelockmode: amplitudelockmode,
		vibrancymode: vibrancymode,
		linemode: linemode,
		linemodeName: linemodeName,
		jdlmode: jdlMode,
		bgmode: bgMode,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
