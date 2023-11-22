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

const scaleValueArr = [
	['0.0001, 0.002', 33],
	['0.002, 0.005', 33],
	['0.005, 0.01', 33],
];

const scaleValueNameArr = [
	['Close', 50],
	['Mid', 35],
	['Far', 15],
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
	['Original-Revert', 30],
	['Drift-Revert', 20],
	['Stretch', 10],
];

const particleBehaviorNameArr = [
	['three-five', 3.57],
	['three-ten', 3.57],
	['three-fifteen', 3.57],
	['three-twenty', 3.57],
	['five-three', 3.57],
	['five-five', 3.57],
	['five-ten', 3.57],
	['five-fifteen', 3.57],
	['five-twenty', 3.57],
	['seven-seven', 3.57],
	['seven-ten DAB', 3.57],
	['seven-fifteen', 3.57],
	['seven-twenty', 3.57],
	['ten-three', 3.57],
	['ten-five', 3.57],
	['ten-ten', 3.57],
	['ten-fifteen', 3.57],
	['ten-twenty', 3.57],
	['fifteen-three', 3.57],
	['fifteen-five', 3.57],
	['fifteen-ten', 3.57],
	['fifteen-fifteen', 3.57],
	['fifteen-twenty', 3.57],
	['twenty-three', 3.57],
	['twenty-five', 3.57],
	['twenty-ten', 3.57],
	['twenty-fifteen', 3.57],
	['twenty-twenty', 3.57],
	['four-twenty BLAZE IT', 3.57],
];

const particleBehaviorArr = [
	['3,3,5,5', 3.57],
	['3,3,10,10', 3.57],
	['3,3,15,15', 3.57],
	['3,3,20,20', 3.57],
	['5,5,3,3', 3.57],
	['5,5,5,5', 3.57],
	['5,5,10,10', 3.57],
	['5,5,15,15', 3.57],
	['5,5,20,20', 3.57],
	['7,7,7,7', 3.57],
	['7,7,10,10', 3.57],
	['7,7,15,15', 3.57],
	['7,7,20,20', 3.57],
	['10,10,3,3', 3.57],
	['10,10,5,5', 3.57],
	['10,10,10,10', 3.57],
	['10,10,15,15', 3.57],
	['10,10,20,20', 3.57],
	['15,15,3,3', 3.57],
	['15,15,5,5', 3.57],
	['15,15,10,10', 3.57],
	['15,15,15,15', 3.57],
	['15,15,20,20', 3.57],
	['20,20,3,3', 3.57],
	['20,20,5,5', 3.57],
	['20,20,10,10', 3.57],
	['20,20,15,15', 3.57],
	['20,20,20,20', 3.57],
	['4,4,20,20', 3.57],
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
	behaviorvalue
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
		scalevalueArr: scaleValueArr,
		scaleNameArr: scaleValueNameArr,
		scalename: scalename,
		behaviorvalue: behaviorvalue,
		behaviorvalueArr: particleBehaviorArr,
		behaviorNameArr: particleBehaviorNameArr,
		behaviorname: behaviorname,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
