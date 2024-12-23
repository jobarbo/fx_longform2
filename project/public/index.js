//! winner hash = oodwWhL9sn9RpKdASE9vkH4m9BdZMuc4ikY5jrfJVvAmgYM46S7
// PARAMS
//* PARAMS *//
let fx = $fx;
let fxhash = $fx.hash;
let fxrand = $fx.rand;
let rand = fxrand;
let seed = parseInt(fxrand() * 10000000);
let features = $fx.getFeatures();
let composition_params;

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	["1", 60],
	["2", 35],
	["6", 5],
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
	["0.0001, 0.0008", 80],
	["0.0008, 0.002", 10],
	["0.002, 0.005", 5],
	["0.005, 0.01", 5],
];

const scaleValueNameArr = [
	["macro", 80],
	["close", 10],
	["mid", 5],
	["far", 5],
];

const clampvalueArr = [
	["0.015,0.015,0.0015,0.0015", 30],
	["0.025,0.025,0.0000015,0.0000015", 20],
	["0.0015,0.0015,0.015,0.015", 30],
	["0.0000015,0.0000015,0.025,0.025", 20],
	["0.0000015,0.0000015,0.0000015,0.0000015", 10],
	["1,1,1,1", 5],
];

const clampNameArr = [
	["original", 30],
	["drift", 5],
	["original-revert", 20],
	["drift-revert", 5],
	["stretch", 40],
	["smooth", 5],
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
	["transparent", 16],
	["same", 16],
	["complementary", 50],
	["analogous", 16],
];

const lazyMorningArr = [
	[true, 5],
	[false, 95],
];
composition_params = generate_composition_params();
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
	lazymorning
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

	if (lazymorning === undefined) {
		lazymorning = weighted_choice(lazyMorningArr);
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
		lazymorning: lazymorning,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}

// UTILS
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

let mapValue = (v, s, S, a, b) => ((v = Math.min(Math.max(v, s), S)), ((v - s) * (b - a)) / (S - s) + a);
const pmap = (v, cl, cm, tl, th, c) => (c ? Math.min(Math.max(((v - cl) / (cm - cl)) * (th - tl) + tl, tl), th) : ((v - cl) / (cm - cl)) * (th - tl) + tl);

let clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
let smoothstep = (a, b, x) => (((x -= a), (x /= b - a)) < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
let mix = (a, b, p) => a + p * (b - a);
let dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

let R = (a = 1) => Math.random() * a;
let L = (x, y) => (x * x + y * y) ** 0.5; // Elements by Euclid 300 BC
let k = (a, b) => (a > 0 && b > 0 ? L(a, b) : a > b ? a : b);

function sdf_box([x, y], [cx, cy], [w, h]) {
	x -= cx;
	y -= cy;
	return k(abs(x) - w, abs(y) - h);
}

function sdf_circle([x, y], [cx, cy], r) {
	x -= cx;
	y -= cy;
	return L(x, y) - r;
}

let dpi = (maxDPI = 3.0) => {
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		return 1.0;
	} else {
		return maxDPI;
	}
};
// fx(hash) utilities
const value = () => fxrand();
const range = (min, max) => min + value() * (max - min);
const rangeFloor = (min, max) => floor(range(min, max));
const pick = (arr) => arr[rangeFloor(0, arr.length)];
console.log("value: ", value());

// NOISE

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
R = (a = 1) => a * ((a = S[3]), (S[3] = S[2]), (S[2] = S[1]), (a ^= a << 11), (S[0] ^= a ^ (a >>> 8) ^ ((S[1] = S[0]) >>> 19)), S[0] / 2 ** 32); // random function
F = (N, f) => [...Array(N)].map((_, i) => f(i)); // for loop / map / list function
[...(seed + "ThxPiter")].map((c) => R((S[3] ^= c.charCodeAt() * 23205))); // seeding the random function

// general noise definitions =============================================
KNUTH = 0x9e3779b1; // prime number close to PHI * 2 ** 32
NSEED = R(2 ** 32); // noise seed, random 32 bit integer
// 3d noise grid function
ri = (i, j, k) => ((i = imul((((i & 1023) << 20) | ((j & 1023) << 10) | ((i ^ j ^ k) & 1023)) ^ NSEED, KNUTH)), (i <<= 3 + (i >>> 29)), (i >>> 1) / 2 ** 31 - 0.5);

// 3D value noise function ===============================================
no = F(99, (_) => R(1024)); // random noise offsets

n3 = (
	x,
	y,
	z,
	s,
	i, // (x,y,z) = coordinate, s = scale, i = noise offset index
	xi = floor((x = x * s + no[(i *= 3)])), // (xi,yi,zi) = integer coordinates
	yi = floor((y = y * s + no[i + 1])),
	zi = floor((z = z * s + no[i + 2]))
) => (
	(x -= xi),
	(y -= yi),
	(z -= zi), // (x,y,z) are now fractional parts of coordinates
	(x *= x * (3 - 2 * x)), // smoothstep polynomial (comment out if true linear interpolation is desired)
	(y *= y * (3 - 2 * y)), // this is like an easing function for the fractional part
	(z *= z * (3 - 2 * z)),
	// calculate the interpolated value
	ri(xi, yi, zi) * (1 - x) * (1 - y) * (1 - z) +
		ri(xi, yi, zi + 1) * (1 - x) * (1 - y) * z +
		ri(xi, yi + 1, zi) * (1 - x) * y * (1 - z) +
		ri(xi, yi + 1, zi + 1) * (1 - x) * y * z +
		ri(xi + 1, yi, zi) * x * (1 - y) * (1 - z) +
		ri(xi + 1, yi, zi + 1) * x * (1 - y) * z +
		ri(xi + 1, yi + 1, zi) * x * y * (1 - z) +
		ri(xi + 1, yi + 1, zi + 1) * x * y * z
);
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
	xi = floor((([x, y] = [(x - noiseCanvasWidth / 2) * c + (y - noiseCanvasHeight * 2) * n + nox[i], (y - noiseCanvasHeight * 2) * c - (x - noiseCanvasWidth / 2) * n + noy[i]]), x)),
	yi = floor(y) // (x,y) = coordinate, s = scale, i = noise offset index
) => (
	(x -= xi),
	(y -= yi),
	(x *= x * (3 - 2 * x)),
	(y *= y * (3 - 2 * y)),
	ri(xi, yi, i) * (1 - x) * (1 - y) + ri(xi, yi + 1, i) * (1 - x) * y + ri(xi + 1, yi, i) * x * (1 - y) + ri(xi + 1, yi + 1, i) * x * y
);

//! Spell formula from Piter The Mage
ZZ = (x, m, b, r) => (x < 0 ? x : x > (b *= r * 4) ? x - b : ((x /= r), fract(x / 4) < 0.5 ? r : -r) * ((x = abs(fract(x / 2) - 0.5)), 1 - (x > m ? x * 2 : x * (x /= m) * x * (2 - x) + m)));

// the point of all the previous code is that now you have a very
// fast value noise function called nz(x,y,s,i). It has four parameters:
// x -- the x coordinate
// y -- the y coordinate
// s -- the scale (simply multiplies x and y by s)
// i -- the noise index, you get 99 different random noises! (but you
//      can increase this number by changing the 99s in the code above)
//      each of the 99 noises also has a random rotation which increases
//      the "randomness" if you add many together
//
// ohh also important to mention that it returns smooth noise values
// between -.5 and .5

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

// SAVE CANVAS
// if cmd + s is pressed, save the canvas'
// if cmd + s is pressed, save the canvas'
function saveCanvas(event) {
	console.log("saveCanvas function called");
	if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
		console.log("Save shortcut detected");
		saveArtwork();
		event.preventDefault();
		return false;
	}
}

// Example usage to add an event listener for key presses
document.addEventListener("keydown", saveCanvas);

// make a function to save the canvas as a png file with the git branch name and a timestamp
function saveArtwork() {
	var dom_spin = document.querySelector(".spin-container");
	var output_hash = fxhash;
	console.log(output_hash);
	var canvas = document.getElementById("defaultCanvas0");
	var d = new Date();
	var datestring = `${d.getMonth() + 1}` + "_" + d.getDate() + "_" + d.getFullYear() + "_" + `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}_${fxhash}`;
	console.log(canvas);
	var fileName = datestring + ".png";
	const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	const a = document.createElement("a");
	a.href = imageUrl;
	a.setAttribute("download", fileName);
	a.click();

	//dom_spin.classList.remove("active");
	console.log("saved " + fileName);
}

console.log(fxhash);
let urlParams = new URLSearchParams(window.location.search).get("parameters");
urlParams = JSON.parse(urlParams);
if (!urlParams) urlParams = {};

let fxfeatures;
let dpi_val = 1;

let movers = [];
let scl1;
let scl2;
let amp1;
let amp2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
let maxFrames = 10;
let frameIterator = 0;
let currentFrame = 0;

// viewport
// if url params has RATIO, use that, else use 3
let MARGIN = 100;
let oldMARGIN = MARGIN;
let frameMargin;
let RATIO = 3;
let DEFAULT_SIZE = 4800 / RATIO;
let DIM_OBJ = {
	3: 600,
	3.88: 800,
	1: 1000,
	1.414: 1200,
	2: 1400,
};
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;

let particleNum = 400000;

let drawing = true;
let renderMode = 1;
let cycle = parseInt((maxFrames * particleNum) / 1170);

let hue;
let bgCol;
let bgHue;
let bgSat;

// Dom text elements
let animation;
let dom_margin;
let dom_particleNum;
let dom_frameNum;
let dom_dpi;
let dom_ratio;
let dom_tilt;
let dom_presentation;
let dom_radius;
let dom_dashboard;
let dom_hash;
let dom_spin;
let edits = 0;

// Modes
let dashboard_mode = false;
let rotation_mode = false;
let border_mode = 0;
let presentation = false;
let ratio_name = "Bookmark";
let dom_toggle = "";

// buttons
let buttons = [];

function preload() {
	setupDomElements();
	setupBundler();
}

function setupBundler() {
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
		lazymorning,
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

		if (urlParams.location) {
			location = urlParams.location;
			// fetch behaviorvalue based on behaviorname from behaviorValueArr
			let index = -1;
			for (let i = 0; i < behaviorNameArr.length; i++) {
				if (JSON.stringify(behaviorNameArr[i][0]) === JSON.stringify(location)) {
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

		if (urlParams.lazymorning) {
			lazymorning = urlParams.lazymorning;
		}
	}

	// this is how features can be defined

	$fx.features({
		complexity: complexity,
		theme: theme,
		colormode: colormode,
		clampname: clampname,
		scalename: scalename,
		location: behaviorname,
		amplitudemode: amplitudemode,
		amplitudelockmode: amplitudelockmode,
		vibrancymode: vibrancymode,
		lineMode: linemodeName,
		jdlmode: jdlmode,
		bgmode: bgmode,
		lazymorning: lazymorning,
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
		lazymorning: lazymorning,
	};
}

function setup() {
	fxfeatures = $fx.getFeatures();
	features = window.features;
	initSketch();
}

function initSketch() {
	elapsedTime = 0;
	framesRendered = 0;
	console.table(fxfeatures);
	drawing = true;
	$fx.rand.reset();
	fx = $fx;
	fxhash = $fx.hash;
	fxrand = $fx.rand;
	rand = fxrand;
	if (animation) clearTimeout(animation);

	movers = [];

	loadURLParams();
	if (ratio_name == "Skateboard" && edits == 0) {
		MARGIN = 0;
		border_mode = 500;
		document.querySelector("canvas").style.borderRadius = `${border_mode}px`;
		edits++;
	} else if (ratio_name != "Skateboard") {
		border_mode = 0;
		document.querySelector("canvas").style.borderRadius = `${border_mode}px`;
	}
	dom_margin.innerHTML = `${MARGIN}px`;
	dom_particleNum.innerHTML = particleNum;
	dom_frameNum.innerHTML = `${maxFrames} Frames`;
	dom_dpi.innerHTML = dpi_val;
	dom_ratio.innerHTML = ratio_name;
	dom_tilt.innerHTML = rotation_mode ? "ON" : "OFF";
	dom_presentation.innerHTML = presentation ? "ON" : "OFF";
	dom_radius.innerHTML = `${border_mode}px`;
	dom_dashboard.innerHTML = "Rendering...";
	dom_hash.innerHTML = fxhash;
	dom_spin.classList.add("active");
	// make DIMENSIONS equal to a minimum value relative to the ratio chosen

	DEFAULT_SIZE = 4800 / RATIO;
	console.log(RATIO);
	// Calculate DIM with a minimum value based on the current DPI level
	DIM = DIM_OBJ[RATIO];
	console.log(DIM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	console.log(width, height);
	pixelDensity(dpi(dpi_val));

	frameMargin = MARGIN * MULTIPLIER;
	rectMode(CENTER);
	randomSeed(seed);
	noiseSeed(seed);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;

	let hueArr = [0, 45, 90, 135, 180, 225, 270, 315];
	hue = hueArr[parseInt(fxrand() * hueArr.length)];

	//!check if we keep complementary colors background

	bgHue = features.bgmode == "complementary" ? (hue + 180) % 360 : features.bgmode == "analogous" ? (hue + 30) % 360 : hue;
	bgSat = features.bgmode == "transparent" ? 0 : random([2, 4, 6]);
	bgCol = color(bgHue, bgSat, features.theme == "bright" ? 93 : 10, 100);
	INIT_MOVERS();
	renderStart = Date.now();
	let sketch = drawGenerator();
	function animate() {
		animation = setTimeout(animate, 0);
		sketch.next();
	}

	animate();
}

function* drawGenerator() {
	let count = 0;
	let frameCount = 0;
	let draw_every = cycle;
	let looptime = 0;
	while (true) {
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];
			if (features.lazymorning) {
				if (elapsedTime > 1) {
					mover.show();
				}
			} else {
				mover.show();
			}

			mover.move();
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = frameCount - startTime;

		showLoadingBar(elapsedTime, maxFrames, renderStart);

		frameCount++;
		if (elapsedTime > maxFrames && drawing) {
			drawing = false;
			$fx.preview();
			document.complete = true;
			return;
		}
	}
}

function INIT_MOVERS() {
	movers = [];
	background(bgCol);
	drawTexture(bgHue);
	sclVal = features.scalevalue.split(",").map(Number);
	scl1 = random(sclVal[0], sclVal[1]);
	scl2 = random(sclVal[0], sclVal[1]);

	let amplitudeLock = features.amplitudelockmode;
	let amplitudeMode = features.amplitudemode;
	let scale_mode = fxfeatures.scalename;
	let thresholds = {
		macro: [0.0001, 0.0008],
		close: [0.0008, 0.002],
		mid: [0.002, 0.005],
		far: [0.005, 0.01],
	};

	let values = {
		macro: [features.amplitudemode == "high" ? 16000 : 5000, features.amplitudemode == "high" ? 5000 : 1000],
		close: [features.amplitudemode == "high" ? 5000 : 1000, features.amplitudemode == "high" ? 1000 : 500],
		mid: [features.amplitudemode == "high" ? 1000 : 500, features.amplitudemode == "high" ? 500 : 100],
		far: [features.amplitudemode == "high" ? 500 : 100, features.amplitudemode == "high" ? 100 : 10],
	};

	let thresholdsArr = thresholds[scale_mode];
	let valuesArr = values[scale_mode];

	let amp1Max = Math.floor(map(scl1, thresholdsArr[0], thresholdsArr[1], valuesArr[0], valuesArr[1], true));
	let amp2Max = Math.floor(map(scl2, thresholdsArr[0], thresholdsArr[1], valuesArr[0], valuesArr[1], true));

	amp1rnd1 = Math.floor(fxrand() * amp1Max);
	amp1rnd2 = Math.floor(fxrand() * amp1Max);
	amp2rnd1 = Math.floor(fxrand() * amp2Max);
	amp2rnd2 = Math.floor(fxrand() * amp2Max);
	let smallest1 = Math.min(amp1rnd1, amp1rnd2);
	let smallest2 = Math.min(amp2rnd1, amp2rnd2);
	let largest1 = Math.max(amp1rnd1, amp1rnd2);
	let largest2 = Math.max(amp2rnd1, amp2rnd2);

	if (amplitudeMode == "none") {
		amp1 = int(random(1, 5));
		amp2 = int(random(1, 5));
	} else if (amplitudeMode == "low") {
		if (amplitudeLock == "true") {
			amp1 = smallest1;
			amp2 = amp1;
		} else {
			amp1 = smallest1;
			amp2 = smallest2;
		}
	} else if (amplitudeMode == "high") {
		if (amplitudeLock == "true") {
			amp1 = largest1;
			amp2 = amp1;
		} else {
			amp1 = largest1;
			amp2 = largest2;
		}
	}

	//* create a random dividing number to add a bit of randomness to the particle movement.
	let xRandDivider = random([0.05]);
	let yRandDivider = random([0.05]);

	//* convert the margin to a percentage of the width
	xMarg = frameMargin / width;
	yMarg = frameMargin / height;

	xMin = xMarg;
	xMax = 1 - xMarg;
	yMin = yMarg;
	yMax = 1 - yMarg;

	for (let i = 0; i < particleNum; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let initHue = hue;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;

		movers.push(new Mover(x, y, initHue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, amp1 * MULTIPLIER, amp2 * MULTIPLIER, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider));
	}
}

function loadURLParams() {
	window.location.search.includes("population") ? (particleNum = parseInt(window.location.search.split("population=")[1])) : 800000;
	if (window.location.search.includes("dpi")) {
		dpi_val = parseInt(window.location.search.split("dpi=")[1]);
	}
	if (window.location.search.includes("ratio=")) {
		if (document.querySelector("span.frame")) {
			document.querySelector("span.frame").classList.remove("hidden");
		}
		if (window.location.search.includes("ratio=a4") || urlParams.ratio == "a4") {
			RATIO = 1.414;
			MARGIN = 150;
		} else if (window.location.search.includes("ratio=skate") || urlParams.ratio == "skate") {
			RATIO = 3.888;
			MARGIN = 0;
			// add a class to the frame
			document.querySelector("span.frame").classList.add("hidden");
		} else if (window.location.search.includes("ratio=square") || window.location.search.includes("ratio=1") || urlParams.ratio == "square" || urlParams.ratio == "1") {
			RATIO = 1;
			MARGIN = 150;
		} else if (window.location.search.includes("ratio=3") || window.location.search.includes("ratio=bookmark") || urlParams.ratio == "bookmark") {
			RATIO = 3;
			MARGIN = 100;
		} else {
			RATIO = parseInt(window.location.search.split("ratio=")[1]);
			MARGIN = 150;
		}
	}

	if (window.location.search.includes("margin")) {
		MARGIN = parseInt(window.location.search.split("margin=")[1]);
	}
}

function drawTexture(hue) {
	for (let i = 0; i < 600000; i++) {
		let x = fxrand() * (width * 1.2) - width * 0.1;
		let y = fxrand() * (height * 1.2) - height * 0.1;
		let sw = 3 * MULTIPLIER;
		let h = hue + fxrand() * 2 - 1;
		let s = 0;
		let b = [0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100][parseInt(fxrand() * 11)];
		drawingContext.fillStyle = `hsla(${h}, ${s}%, ${b}%, 10%)`;
		drawingContext.fillRect(x, y, sw, sw);
	}
}
function showLoadingBar(elapsedTime, maxFrames, renderStart) {
	framesRendered++;
	let currentTime = Date.now();
	totalElapsedTime = currentTime - renderStart;

	let percent = (elapsedTime / maxFrames) * 100;
	if (percent > 100) percent = 100;

	let averageFrameTime = totalElapsedTime / framesRendered;

	let remainingFrames = maxFrames - framesRendered;
	let estimatedTimeRemaining = averageFrameTime * remainingFrames;

	// Convert milliseconds to seconds
	let timeLeftSec = Math.round(estimatedTimeRemaining / 1000);

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + "%";
	dom_dashboard.innerHTML = percent.toFixed(0) + "%" + " - Time left : " + timeLeftSec + "s";

	if (percent.toFixed(0) >= 100) {
		dom_dashboard.innerHTML = "Done!";
		dom_spin.classList.remove("active");
	}
}

class Mover {
	constructor(x, y, hue, scl1, scl2, amp1, amp2, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, bgColArr) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat =
			features.vibrancymode === "high"
				? [60, 70, 80, 80, 90, 100][Math.floor(fxrand() * 6)]
				: features.vibrancymode === "low"
				? [0, 10, 20, 20, 30, 40][Math.floor(fxrand() * 6)]
				: [0, 10, 20, 30, 40, 40, 60, 80, 80, 90, 100][Math.floor(fxrand() * 11)];

		this.initBri =
			features.theme === "bright" && features.colormode !== "monochrome"
				? [0, 10, 20, 20, 30, 35, 40, 40, 50, 50, 50, 60, 60, 70, 80, 90][Math.floor(fxrand() * 16)]
				: features.theme === "bright" && features.colormode === "monochrome"
				? [0, 0, 10, 20, 20, 30, 40, 50, 60, 70][Math.floor(fxrand() * 10)]
				: features.theme === "dark" && features.colormode !== "monochrome"
				? [50, 50, 50, 50, 60, 60, 70, 80, 90, 100][Math.floor(fxrand() * 10)]
				: [60, 60, 70, 80, 80, 90, 90, 100, 100, 100][Math.floor(fxrand() * 10)];

		this.initAlpha = 12;
		this.initS = 1 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat = features.colormode === "monochrome" || features.colormode === "duotone" ? 0 : this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep = features.colormode === "monochrome" || features.colormode === "fixed" ? 1 : features.colormode === "dynamic" || features.colormode === "duotone" ? 10 : 20;
		this.satStep = features.colorMode === "duotone" ? 0.1 : 1;
		this.briStep = 0;
		this.s = this.initS;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.amp1 = amp1;
		this.amp2 = amp2;
		this.xRandDivider = xRandDivider;
		this.yRandDivider = yRandDivider;
		this.xRandDividerOffset = 0.0;
		this.yRandDividerOffset = 0.0;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.oct = features.complexity;
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.borderX = width / 2;
		this.borderY = height / 2.75;
		this.clampvaluearray = features.clampvalue.split(",").map(Number);
		this.uvalueArr = features.behaviorvalue.split(",").map(Number);
		this.uvalue = Math.min(...this.uvalueArr);
		this.bgCol = bgColArr;
		this.zombie = false;
		this.zombieAlpha = features.jdlmode === "true" ? this.initAlpha : 0;
		this.lineWeight = typeof features.lineModeValue === "string" ? eval(features.lineModeValue) * MULTIPLIER : features.lineModeValue * MULTIPLIER;
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move() {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.amp1, this.amp2, this.oct, this.clampvaluearray, this.uvalueArr);

		this.xRandSkipper = fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) - this.xRandSkipperVal * MULTIPLIER;
		this.yRandSkipper = fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) - this.xRandSkipperVal * MULTIPLIER;

		this.x += (p.x * MULTIPLIER) / randomGaussian(this.xRandDivider, this.xRandDividerOffset);
		this.y += (p.y * MULTIPLIER) / randomGaussian(this.yRandDivider, this.yRandDividerOffset);
		this.xRandDividerOffset = mapValue(elapsedTime, 0, maxFrames / 4, 0.0, 0, true);
		this.yRandDividerOffset = mapValue(elapsedTime, 0, maxFrames / 4, 0.0, 0, true);
		this.a = mapValue(elapsedTime, maxFrames / 4, maxFrames, 100, 100, true);
		this.s = mapValue(elapsedTime, 0, maxFrames / 4, 1.25, 1.25, true) * MULTIPLIER;
		let pxy = p.x - p.y;
		this.hue += mapValue(pxy, -this.uvalue * 2, this.uvalue * 2, -this.hueStep, this.hueStep, true);
		this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue;
		this.bri += mapValue(p.y, -this.uvalue * 2, this.uvalue * 2, -this.briStep, this.briStep, true);
		this.bri = this.bri > 100 ? 0 : this.bri < 0 ? 100 : this.bri;
		this.sat += mapValue(p.x, -this.uvalue * 2, this.uvalue * 2, -this.satStep, this.satStep, true);
		if (features.colormode != "monochrome" && features.colormode != "duotone") {
			this.sat = this.sat > 100 ? 0 : this.sat < 0 ? 100 : this.sat;
		} else if (features.colormode === "duotone") {
			this.sat = this.sat > this.initSat * 1.5 ? 0 : this.sat < 0 ? this.initSat * 1.5 : this.sat;
		}

		if (this.x < this.xMin * width || this.x > this.xMax * width || this.y < this.yMin * height || this.y > this.yMax * height) {
			this.a = 0;
			this.zombie = true;
		} else {
			//this.a = this.zombie ? this.zombieAlpha : this.initAlpha;
		}

		if (this.x < this.xMin * width - this.lineWeight) {
			this.x = this.xMax * width + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.x > this.xMax * width + this.lineWeight) {
			this.x = this.xMin * width - fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.y < this.yMin * height - this.lineWeight) {
			this.y = this.yMax * height + fxrand() * this.lineWeight;
			//this.a = 100;
		}
		if (this.y > this.yMax * height + this.lineWeight) {
			this.y = this.yMin * height - fxrand() * this.lineWeight;
			//this.a = 100;
		}

		//! if out of bounds, reset to random position inside canvas
		/* 		if (this.x < this.xMin * width || this.x > this.xMax * width || this.y < this.yMin * height || this.y > this.yMax * height) {
			//this.s = 0;
			this.x = random(this.xMin, this.xMax) * width;
			this.y = random(this.yMin, this.yMax) * height;
		} */
	}
}
function superCurve(x, y, scl1, scl2, amp1, amp2, octave, clampvalueArr, uvalueArr) {
	let nx = x - 1,
		ny = y - 1,
		a1 = amp1,
		a2 = amp2,
		scale1 = scl1,
		scale2 = scl2,
		dx,
		dy;

	dx = oct(nx, ny, scale1, 0, octave);
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 3, octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, 1, octave);
	dy = oct(nx, ny, scale2, 5, octave);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 4, octave);
	let vn = oct(ny, nx, scale2, 6, octave);
	let timeX = (millis() * 0.0000000000001) / MULTIPLIER;
	let timeY = (millis() * 0.0000000000001) / MULTIPLIER;
	let noiseScaleX = 0.1 / MULTIPLIER;
	let noiseScaleY = 0.1 / MULTIPLIER;

	// Modify the calculations to include time and noise
	//! test between nx/ny and x/y
	/* 	let sun =
		sin(y * scl1 * 1 + seed + timeX) +
		cos(y * scl2 * 1 + seed + timeX) +
		sin(y * scl1 * 1 + seed + timeX) +
		oct(vn * scl1 + seed + timeX, un * scl2 + seed + timeX, noiseScaleX, 2, octave) * MULTIPLIER;
	let svn =
		sin(x * scl2 * 1 + seed + timeY) +
		cos(x * scl1 * 1 + seed + timeY) +
		sin(x * scl2 * 1 + seed + timeY) +
		oct(un * scl2 + seed + timeY, vn * scl1 + seed + timeY, noiseScaleY, 3, octave) * MULTIPLIER;
 */
	//! interesting comp where lines goes thoward center
	/* 	let sun =
		sin(ny * noiseScaleX * 1 + seed + timeX) +
		cos(ny * noiseScaleY * 1 + seed + timeX) +
		sin(ny * noiseScaleX * 1 + seed + timeX) +
		oct(ny * noiseScaleX + seed + timeX, nx * noiseScaleY + seed + timeX, scl1, 2, octave);
	let svn =
		sin(nx * noiseScaleY * 1 + seed + timeY) +
		cos(nx * noiseScaleX * 1 + seed + timeY) +
		sin(nx * noiseScaleY * 1 + seed + timeY) +
		oct(nx * noiseScaleY + seed + timeY, ny * noiseScaleX + seed + timeY, scl2, 3, octave);
 */
	// Tighter, more frequent patterns
	//! move the last value between 0.1 and below
	//! move the first value between 20 and 0.00001
	let zun = ZZ(un, 20, 120, 0.5);
	let zvn = ZZ(vn, 20, 120, 0.007);

	let u = mapValue(zun, -1.000000001, 0.000000001, -10, 10, true);
	let v = mapValue(zvn, -0.000000001, 1.000000001, -10, 10, true);

	return {x: u, y: v};
}

function setupDomElements() {
	dom_margin = document.querySelector(".kb-params.margin");
	dom_particleNum = document.querySelector(".kb-params.population");
	dom_frameNum = document.querySelector(".kb-params.exposure");
	dom_dpi = document.querySelector(".kb-params.dpi");
	dom_ratio = document.querySelector(".kb-params.ratio");
	dom_tilt = document.querySelector(".kb-params.tilt");
	dom_presentation = document.querySelector(".kb-params.presentation");
	dom_radius = document.querySelector(".kb-params.radius");
	dom_dashboard = document.querySelector(".kb-params.dashboard");
	dom_toggle = document.querySelector(".info-toggle");
	dom_hash = document.querySelector(".hash");
	dom_spin = document.querySelector(".spin-container");

	if ($fx.context === "standalone") {
		if (!dom_toggle.classList.contains("show")) {
			dom_toggle.classList.add("show");
		}
	} else {
		if (dom_toggle.classList.contains("show")) {
			dom_toggle.classList.remove("show");
		}
	}
	// buttons
	buttons = document.querySelectorAll("[data-button]");
	handleEvent();
}

function handleEvent() {
	if (dom_toggle) {
		dom_toggle.addEventListener("click", function (event) {
			if (dom_toggle.classList.contains("active")) {
				dom_toggle.classList.remove("active");
				document.querySelector(".container").classList.remove("show");
				document.querySelector(".info-wrapper").classList.remove("show");
				document.querySelector(".save-wrapper").classList.remove("show");
				document.querySelector(".button-wrapper").classList.remove("show");
				document.querySelector(".icon").innerHTML = "i";
			} else {
				dom_toggle.classList.add("active");
				document.querySelector(".container").classList.add("show");
				document.querySelector(".info-wrapper").classList.add("show");
				document.querySelector(".save-wrapper").classList.add("show");
				document.querySelector(".button-wrapper").classList.add("show");
				document.querySelector(".icon").innerHTML = "X";
			}
		});
	}

	// put an event listener on all the buttons

	buttons.forEach((button) => {
		button.addEventListener("click", function (event) {
			if (button.classList.contains("btn-radius")) {
				mod_border_radius();
			}
			if (button.classList.contains("btn-presentation")) {
				mod_pres_mode();
			}
			if (button.classList.contains("btn-info")) {
				mod_info_mode();
			}
			if (button.classList.contains("btn-tilt")) {
				mod_tilt_mode();
			}
			if (button.classList.contains("btn-margin")) {
				dom_dashboard.innerHTML = "Please wait...";
				dom_spin.classList.add("active");
				mod_margin_mode();
			}
			if (button.classList.contains("btn-ratio")) {
				dom_dashboard.innerHTML = "Please wait...";
				dom_spin.classList.add("active");
				mod_ratio_mode();
			}
			if (button.classList.contains("btn-population")) {
				dom_dashboard.innerHTML = "Please wait...";
				dom_spin.classList.add("active");
				mod_particle_mode();
			}
			if (button.classList.contains("btn-exposure")) {
				dom_dashboard.innerHTML = "Please wait...";
				dom_spin.classList.add("active");
				mod_exposure_mode();
			}
			if (button.classList.contains("btn-dpi")) {
				dom_dashboard.innerHTML = "Please wait...";
				dom_spin.classList.add("active");
				mod_dpi_mode();
			}
			if (button.classList.contains("btn-save")) {
				dom_spin.classList.add("active");
				saveArtwork();
			}
		});
	});

	// if d + any number is pressed, change the dpi for that number
	document.addEventListener("keydown", function (event) {
		if (event.key === "b") {
			mod_border_radius();
		}

		// Check if the pressed key is "d" and a number
		if (event.key === "v") {
			// toggle presentation mode on or off
			mod_pres_mode();
		}

		if (event.key === "i") {
			// toggle info dashboard
			mod_info_mode();
		}

		if (event.key === "t") {
			mod_tilt_mode();
		}

		if (event.key === "m") {
			// toggle margin on or off
			mod_margin_mode();
		}
		if (event.key === "r") {
			// change the ratio
			mod_ratio_mode();
		}

		if (event.key === "p") {
			// change the particle number
			mod_particle_mode();
		}

		if (event.key === "f") {
			// change the frame number
			mod_exposure_mode();
		}

		if (event.key === "d") {
			// change the dpi
			mod_dpi_mode();
		}
	});
}

function mod_border_radius() {
	// toggle border radius from 0, 5, 10, 20,50
	if (border_mode === 0) {
		border_mode = 5;
		document.querySelector("canvas").style.borderRadius = "5px";
	} else if (border_mode === 5) {
		border_mode = 10;
		document.querySelector("canvas").style.borderRadius = "10px";
	} else if (border_mode === 10) {
		border_mode = 20;
		document.querySelector("canvas").style.borderRadius = "20px";
	} else if (border_mode === 20) {
		border_mode = 50;
		document.querySelector("canvas").style.borderRadius = "50px";
	} else if (border_mode === 50) {
		border_mode = 500;
		document.querySelector("canvas").style.borderRadius = "500px";
	} else if (border_mode === 500) {
		border_mode = 0;
		document.querySelector("canvas").style.borderRadius = "0px";
	}
	dom_radius.innerHTML = `${border_mode}px`;
}

function mod_pres_mode() {
	if (presentation) {
		presentation = false;
		document.querySelector(".frame").classList.remove("presentation");
		document.querySelector("canvas").classList.remove("presentation");
	} else {
		presentation = true;
		document.querySelector(".frame").classList.add("presentation");
		document.querySelector("canvas").classList.add("presentation");
	}
	dom_presentation.innerHTML = presentation ? "ON" : "OFF";
}

function mod_info_mode() {
	if (dashboard_mode) {
		dashboard_mode = false;
		document.querySelector(".info-wrapper").classList.remove("show");
	} else {
		dashboard_mode = true;
		document.querySelector(".info-wrapper").classList.add("show");
	}
	dom_dashboard.innerHTML = dashboard_mode ? "ON" : "OFF";
}

function mod_tilt_mode() {
	if (rotation_mode) {
		rotation_mode = false;
		document.querySelector(".frame").classList.remove("horizontal");
		document.querySelector("canvas").classList.remove("horizontal");
	} else {
		rotation_mode = true;
		document.querySelector(".frame").classList.add("horizontal");
		document.querySelector("canvas").classList.add("horizontal");
	}
	dom_tilt.innerHTML = rotation_mode ? "ON" : "OFF";
}

function mod_margin_mode() {
	MARGIN += 50;
	if (MARGIN > 300) {
		MARGIN = 0;
	}
	dom_dashboard.innerHTML = "Please wait...";
	dom_margin.innerHTML = `${MARGIN}px`;
	setTimeout(() => {
		initSketch();
	}, 10);
}

function mod_ratio_mode() {
	document.querySelector("span.frame").classList.remove("hidden");
	if (RATIO === 3) {
		RATIO = 3.88;
		ratio_name = "Skateboard";
		document.querySelector("span.frame").classList.add("hidden");
	} else if (RATIO === 3.88) {
		RATIO = 1;
		MARGIN = 150;
		ratio_name = "Square";
	} else if (RATIO === 1) {
		RATIO = 1.414;
		MARGIN = 150;
		ratio_name = "A4";
	} else if (RATIO === 1.414) {
		RATIO = 2;
		MARGIN = 150;
		ratio_name = "Univisium";
	} else if (RATIO === 2) {
		RATIO = 3;
		MARGIN = 100;
		ratio_name = "Bookmark";
	}
	dom_dashboard.innerHTML = "Please wait...";
	dom_ratio.innerHTML = ratio_name;
	setTimeout(() => {
		initSketch();
	}, 10);
}

function mod_particle_mode() {
	if (particleNum === 400000) {
		particleNum = 800000;
	} else if (particleNum === 800000) {
		particleNum = 1200000;
	} else if (particleNum === 1200000) {
		particleNum = 200000;
	} else if (particleNum === 200000) {
		particleNum = 400000;
	}
	dom_dashboard.innerHTML = "Please wait...";
	dom_particleNum.innerHTML = particleNum;
	setTimeout(() => {
		initSketch();
	}, 10);
}

function mod_exposure_mode() {
	if (maxFrames === 10) {
		maxFrames = 12;
	} else if (maxFrames === 12) {
		maxFrames = 15;
	} else if (maxFrames === 15) {
		maxFrames = 18;
	} else if (maxFrames === 18) {
		maxFrames = 20;
	}
	dom_dashboard.innerHTML = "Please wait...";
	dom_frameNum.innerHTML = `${maxFrames} Frames`;
	setTimeout(() => {
		initSketch();
	}, 10);
}

function mod_dpi_mode() {
	if (dpi_val === 1) {
		dpi_val = 2;
	} else if (dpi_val === 2) {
		dpi_val = 3;
	} else if (dpi_val === 3) {
		dpi_val = 4;
	} else if (dpi_val === 4) {
		dpi_val = 5;
	} else if (dpi_val === 5) {
		dpi_val = 1;
	}
	dom_dashboard.innerHTML = "Please wait...";
	dom_dpi.innerHTML = dpi_val;
	setTimeout(() => {
		initSketch();
	}, 10);
}
