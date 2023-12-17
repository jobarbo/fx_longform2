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
	["monochrome", 5],
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
	["420/69 gas station", 5],
	["chinati foundation", 5],
	["saint-george pool", 5],
	["el paisano", 5],
	["planet marfa", 5],
	["glitch gallery", 5],
	["the sentinel", 5],
	["aster's", 5],
	["the techno barn", 5],
	["planet marfa", 5],
	["marfa burritos", 5],
	["marfa spirits", 5],
	["prada marfa", 5],
	["art blocks gallery", 5],
	["thunderbird hotel", 5],
	["wrong store", 5],
	["the otherside", 5],
	["el cosmico", 5],
	["crowley theater", 5],
	["convenience west", 5],
	["love, marfa", 5],
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
	["true", 20],
	["false", 80],
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
	["transparent", 17],
	["same", 16],
	["complementary", 40],
	["analogous", 25],
];

const skipBreakfastArr = [
	[true, 10],
	[false, 90],
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
	bgMode,
	skipbreakfast
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
				["low", 50],
				["high", 40],
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

	if (skipbreakfast === undefined) {
		skipbreakfast = weighted_choice(skipBreakfastArr);
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
		skipbreakfast: skipbreakfast,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}

function weighted_choice(data) {
	let total = 0;
	for (let i = 0; i < data.length; ++i) {
		total += data[i][1];
	}
	const threshold = rand() * total;
	total = 0;
	for (let i = 0; i < data.length - 1; ++i) {
		total += data[i][1];
		if (total >= threshold) {
			return data[i][0];
		}
	}
	return data[data.length - 1][0];
}

let mapValue = (v, s, S, a, b) => (
	(v = Math.min(Math.max(v, s), S)), ((v - s) * (b - a)) / (S - s) + a
);
const pmap = (v, cl, cm, tl, th, c) =>
	c
		? Math.min(Math.max(((v - cl) / (cm - cl)) * (th - tl) + tl, tl), th)
		: ((v - cl) / (cm - cl)) * (th - tl) + tl;

let clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
let smoothstep = (a, b, x) =>
	((x -= a), (x /= b - a)) < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
let mix = (a, b, p) => a + p * (b - a);
let dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

let R = (a = 1) => Math.random() * a;
let L = (x, y) => (x * x + y * y) ** 0.5; // Elements by Euclid 300 BC
let k = (a, b) => (a > 0 && b > 0 ? L(a, b) : a > b ? a : b);

let dpi = (maxDPI = 3.0) => {
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
	let mobileDPI = maxDPI * 2;
	if (iOSSafari) {
		if (mobileDPI > 6) {
			mobileDPI = 6;
		}
		return mobileDPI;
	} else {
		return maxDPI;
	}
};
let noiseCanvasWidth = 1;
let noiseCanvasHeight = 1;

// Definitions ===========================================================
({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i)); // for loop / map / list function

// A seeded PRNG =========================================================
//seed = 'das9d7as9d7as'; // random seed]
//seed = Math.random() * 2 ** 32;

S = Uint32Array.of(9, 7, 5, 3); // PRNG state
R = (a = 1) =>
	a *
	((a = S[3]),
	(S[3] = S[2]),
	(S[2] = S[1]),
	(a ^= a << 11),
	(S[0] ^= a ^ (a >>> 8) ^ ((S[1] = S[0]) >>> 19)),
	S[0] / 2 ** 32); // random function
[...(seed + "ThxPiter")].map((c) => R((S[3] ^= c.charCodeAt() * 23205))); // seeding the random function

// general noise definitions =============================================
KNUTH = 0x9e3779b1; // prime number close to PHI * 2 ** 32
NSEED = R(2 ** 32); // noise seed, random 32 bit integer
// 3d noise grid function
ri = (i, j, k) => (
	(i = imul(
		(((i & 1023) << 20) | ((j & 1023) << 10) | ((i ^ j ^ k) & 1023)) ^ NSEED,
		KNUTH
	)),
	(i <<= 3 + (i >>> 29)),
	(i >>> 1) / 2 ** 31 - 0.5
);

// 3D value noise function ===============================================
no = F(99, (_) => R(1024)); // random noise offsets

// 2D value noise function ===============================================
na = F(99, (_) => R(TAU)); // random noise angles
ns = na.map(sin);
nc = na.map(cos); // sin and cos of those angles
nox = F(99, (_) => R(1024)); // random noise x offset
noy = F(99, (_) => R(1024)); // random noise y offset

n2 = (
	x,
	y,
	s,
	i,
	c = nc[i] * s,
	n = ns[i] * s,
	xi = floor(
		(([x, y] = [
			(x - noiseCanvasWidth / 2) * c + (y - noiseCanvasHeight * 2) * n + nox[i],
			(y - noiseCanvasHeight * 2) * c - (x - noiseCanvasWidth / 2) * n + noy[i],
		]),
		x)
	),
	yi = floor(y) // (x,y) = coordinate, s = scale, i = noise offset index
) => (
	(x -= xi),
	(y -= yi),
	(x *= x * (3 - 2 * x)),
	(y *= y * (3 - 2 * y)),
	ri(xi, yi, i) * (1 - x) * (1 - y) +
		ri(xi, yi + 1, i) * (1 - x) * y +
		ri(xi + 1, yi, i) * x * (1 - y) +
		ri(xi + 1, yi + 1, i) * x * y
);

function oct(x, y, s, i, octaves = 1) {
	let result = 0;
	let sm = 1;
	i *= octaves;
	for (let j = 0; j < octaves; j++) {
		result += n2(x, y, s * sm, i + j) / sm;
		sm *= 2;
	}
	return result;
}
// if cmd + s is pressed, save the canvas'
function saveCanvas(event) {
	if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
		saveArtwork();
		// Prevent the browser from saving the page
		event.preventDefault();
		return false;
	}
}

// Example usage to add an event listener for key presses
document.addEventListener("keydown", saveCanvas);

// make a function to save the canvas as a png file with the git branch name and a timestamp
function saveArtwork() {
	var dom_spin = document.querySelector(".spin-container");
	var canvas = document.getElementById("defaultCanvas0");
	var d = new Date();
	var datestring =
		d.getDate() +
		"_" +
		`${d.getMonth() + 1}` +
		"_" +
		d.getFullYear() +
		"_" +
		`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
	console.log(canvas);
	var fileName = datestring + ".png";
	const imageUrl = canvas
		.toDataURL("image/png")
		.replace("image/png", "image/octet-stream");
	const a = document.createElement("a");
	a.href = imageUrl;
	a.setAttribute("download", fileName);
	a.click();

	dom_spin.classList.remove("active");
	console.log("saved " + fileName);
}
