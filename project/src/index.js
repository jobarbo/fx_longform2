let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {
	complexity,
	theme,
	colormode,
	clampvalue,
	clampvalueArr,
	clampNameArr,
	clampname,
	scalename,
	scalevalue,
	scaleValueArr,
	scaleValueNameArr,
	behaviorvalue,
	behaviorValueArr,
	behaviorNameArr,
	behaviorname,
	amplitudemode,
	amplitudelockmode,
	vibrancymode,
	linemode,
	linemodeName,
	jdlmode,
	bgmode,
} = composition_params; // unpacking parameters we need in main.js and turning them into globals

// decode window location search
let urlParams = new URLSearchParams(window.location.search).get("parameters");
// objectify urlParams
if (urlParams) {
	urlParams = JSON.parse(urlParams);

	if (urlParams.complexity) {
		complexity = urlParams.complexity;
	}

	if (urlParams.theme) {
		theme = urlParams.theme;
	}

	if (urlParams.colormode) {
		colormode = urlParams.colormode;
	}

	if (urlParams.clampname) {
		clampname = urlParams.clampname;
		// fetch clampvalue based on clampname from clampvalueArr
		let index = -1;
		for (let i = 0; i < clampNameArr.length; i++) {
			if (JSON.stringify(clampNameArr[i][0]) === JSON.stringify(clampname)) {
				index = i;
				break;
			}
		}

		// Assigning clampvalue based on the index found

		if (index !== -1) {
			clampvalue = clampvalueArr[index][0];
		}
	}

	if (urlParams.scalename) {
		scalename = urlParams.scalename;
		// fetch scalevalue based on scalename from scaleValueArr
		let index = -1;
		for (let i = 0; i < scaleValueNameArr.length; i++) {
			if (
				JSON.stringify(scaleValueNameArr[i][0]) === JSON.stringify(scalename)
			) {
				index = i;
				break;
			}
		}

		// Assigning scalevalue based on the index found

		if (index !== -1) {
			scalevalue = scaleValueArr[index][0];
		}
	}

	if (urlParams.behaviorname) {
		behaviorname = urlParams.behaviorname;
		// fetch behaviorvalue based on behaviorname from behaviorValueArr
		let index = -1;
		for (let i = 0; i < behaviorNameArr.length; i++) {
			if (
				JSON.stringify(behaviorNameArr[i][0]) === JSON.stringify(behaviorname)
			) {
				index = i;
				break;
			}
		}

		// Assigning behaviorvalue based on the index found

		if (index !== -1) {
			behaviorvalue = behaviorValueArr[index][0];
		}
	}

	if (urlParams.amplitudemode) {
		amplitudemode = urlParams.amplitudemode;
	}

	if (urlParams.amplitudelockmode) {
		amplitudelockmode = urlParams.amplitudelockmode;
	}

	if (urlParams.vibrancymode) {
		vibrancymode = urlParams.vibrancymode;
	}

	if (urlParams.linemode) {
		lineMode = urlParams.linemode;

		// fetch lineMode based on lineModeName from lineModeArr
		let index = -1;
		for (let i = 0; i < lineModeName.length; i++) {
			if (JSON.stringify(lineModeName[i][0]) === JSON.stringify(lineMode)) {
				index = i;
				break;
			}
		}

		// Assigning lineMode based on the index found

		if (index !== -1) {
			lineMode = lineModeValueArr[index][0];
		}
	}

	if (urlParams.jdlmode) {
		jdlmode = urlParams.jdlmode;
	}

	if (urlParams.bgmode) {
		bgmode = urlParams.bgmode;
	}
}

// this is how features can be defined

$fx.features({
	complexity: complexity,
	theme: theme,
	colormode: colormode,
	clampname: clampname,
	scalename: scalename,
	behaviorname: behaviorname,
	amplitudemode: amplitudemode,
	amplitudelockmode: amplitudelockmode,
	vibrancymode: vibrancymode,
	lineMode: linemodeName,
	jdlmode: jdlmode,
	bgmode: bgmode,
});

window.features = {
	complexity: complexity,
	theme: theme,
	colormode: colormode,
	clampvalue: clampvalue,
	scalevalue: scalevalue,
	behaviorvalue: behaviorvalue,
	amplitudemode: amplitudemode,
	amplitudelockmode: amplitudelockmode,
	vibrancymode: vibrancymode,
	lineModeValue: linemode,
	jdlmode: jdlmode,
	bgmode: bgmode,
};
