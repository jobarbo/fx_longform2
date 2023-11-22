let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {
	complexity,
	theme,
	colormode,
	strokestyle,
	clampvalue,
	clampvalueArr,
	clampNameArr,
	clampname,
	scalename,
	scalevalue,
	scaleValueArr,
	scaleValueNameArr,
} = composition_params; // unpacking parameters we need in main.js and turning them into globals

// decode window location search
let urlParams = new URLSearchParams(window.location.search).get('parameters');
// objectify urlParams
console.log(urlParams);
urlParams = JSON.parse(urlParams);

if (urlParams) {
	if (urlParams.complexity) {
		complexity = urlParams.complexity;
	}

	if (urlParams.theme) {
		theme = urlParams.theme;
	}

	if (urlParams.colormode) {
		colormode = urlParams.colormode;
	}

	if (urlParams.strokestyle) {
		strokestyle = urlParams.strokestyle;
	}

	if (urlParams.clampname) {
		clampname = urlParams.clampname;
		console.log('clampname', clampname);
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
		console.log('scalename', scalename);
		// fetch scalevalue based on scalename from scaleValueArr
		let index = -1;
		for (let i = 0; i < scaleValueNameArr.length; i++) {
			if (JSON.stringify(scaleValueNameArr[i][0]) === JSON.stringify(scalename)) {
				index = i;
				break;
			}
		}

		// Assigning scalevalue based on the index found

		if (index !== -1) {
			scalevalue = scaleValueArr[index][0];
		}
	}
}

// this is how features can be defined

$fx.features({
	complexity: complexity,
	theme: theme,
	colormode: colormode,
	strokestyle: strokestyle,
	clampname: clampname,
	scalename: scalename,
});

window.features = {
	complexity: complexity,
	theme: theme,
	colormode: colormode,
	strokestyle: strokestyle,
	clampvalue: clampvalue,
	scalevalue: scalevalue,
};
