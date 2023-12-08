//new Q5('global');
console.log(fxhash);
let urlParams = new URLSearchParams(window.location.search).get("parameters");
urlParams = JSON.parse(urlParams);
if (!urlParams) urlParams = {};

let features;
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
let MARGIN = 200;
let oldMARGIN = MARGIN;
let frameMargin;
let RATIO = 3;
let DEFAULT_SIZE = 4800 / RATIO;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let elapsedTime = 0;
let particleNum = 400000;

let drawing = true;
let renderMode = 1;
let cycle = parseInt((maxFrames * particleNum) / 1170);

let hue;
let bgCol;
let bgHue;
let bgSat;

let animation;
let dom_margin;
let dom_particleNum;
let dom_frameNum;
let dom_dpi;
let dom_ratio;

let debug = false;
let presentation = false;

// event listeners

// if d + any number is pressed, change the dpi for that number
document.addEventListener("keydown", function (event) {
	// Check if the pressed key is "d" and a number
	if (event.key === "m") {
		// toggle margin on or off
		if (MARGIN === 0) {
			MARGIN = oldMARGIN;
		} else {
			MARGIN = 0;
		}

		dom_margin.innerHTML = MARGIN;
		setTimeout(() => {
			initSketch();
		}, 10);
	}
	if (event.key === "r") {
		// change the ratio
		if (RATIO === 3) {
			RATIO = 3.88;
		} else if (RATIO === 3.88) {
			RATIO = 1;
			MARGIN = 300;
		} else if (RATIO === 1) {
			RATIO = 1.41;
			MARGIN = 250;
		} else if (RATIO === 1.41) {
			RATIO = 2;
			MARGIN = 250;
		} else if (RATIO === 2) {
			RATIO = 3;
			MARGIN = 200;
		}
		dom_ratio.innerHTML = RATIO;
		setTimeout(() => {
			initSketch();
		}, 10);
	}

	if (event.key === "p") {
		// change the particle number
		if (particleNum === 400000) {
			particleNum = 800000;
		} else if (particleNum === 800000) {
			particleNum = 1200000;
		} else if (particleNum === 1200000) {
			particleNum = 200000;
		} else if (particleNum === 200000) {
			particleNum = 400000;
		}
		dom_particleNum.innerHTML = particleNum;
		setTimeout(() => {
			initSketch();
		}, 10);
	}

	if (event.key === "f") {
		// change the frame number
		if (maxFrames === 10) {
			maxFrames = 20;
		} else if (maxFrames === 20) {
			maxFrames = 30;
		} else if (maxFrames === 30) {
			maxFrames = 10;
		}
		dom_frameNum.innerHTML = maxFrames;
		setTimeout(() => {
			initSketch();
		}, 10);
	}

	if (event.key === "d") {
		// change the dpi
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
		dom_dpi.innerHTML = dpi_val;
		setTimeout(() => {
			initSketch();
		}, 10);
	}
});

function preload() {
	dom_margin = document.querySelector(".kb-params.margin");
	dom_particleNum = document.querySelector(".kb-params.population");
	dom_frameNum = document.querySelector(".kb-params.exposure");
	dom_dpi = document.querySelector(".kb-params.dpi");
	dom_ratio = document.querySelector(".kb-params.ratio");
}

function setup() {
	fxfeatures = $fx.getFeatures();
	features = window.features;

	initSketch();
}

function initSketch() {
	elapsedTime = 0;
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

	if (debug) {
		dom_margin.innerHTML = MARGIN;
		dom_particleNum.innerHTML = particleNum;
		dom_frameNum.innerHTML = maxFrames;
		dom_dpi.innerHTML = dpi_val;
		dom_ratio.innerHTML = RATIO;
	}

	DEFAULT_SIZE = 4800 / RATIO;

	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(dpi_val));

	frameMargin = MARGIN * MULTIPLIER;
	rectMode(CENTER);
	randomSeed(seed);
	noiseSeed(seed);
	colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;

	let hueArr = [0, 45, 90, 135, 180, 225, 270, 315];
	hue = hueArr[parseInt(fxrand() * hueArr.length)];

	//!check if we keep complimentary colors background

	bgHue =
		features.bgmode == "complimentary"
			? (hue + 180) % 360
			: features.bgmode == "analogous"
			? (hue + 30) % 360
			: hue;
	bgSat = features.bgmode == "transparent" ? 0 : random([2, 4, 6]);
	bgCol = color(bgHue, bgSat, features.theme == "bright" ? 93 : 10, 100);

	INIT_MOVERS();
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

	while (true) {
		for (let i = 0; i < particleNum; i++) {
			const mover = movers[i];
			//if (elapsedTime > 1) {
			mover.show();
			//}

			mover.move();
			if (count > draw_every) {
				count = 0;
				yield;
			}
			count++;
		}

		elapsedTime = frameCount - startTime;
		showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax);

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

	console.log("scl1", scl1);
	console.log("scl2", scl2);

	let amp1Max = 100;
	let amp2Max = 100;
	let macroMax = features.amplitudemode == "high" ? 16000 : 5000;
	let macroMin = features.amplitudemode == "high" ? 5000 : 1000;
	let closeMax = features.amplitudemode == "high" ? 5000 : 1000;
	let closeMin = features.amplitudemode == "high" ? 1000 : 500;
	let midMax = features.amplitudemode == "high" ? 1000 : 500;
	let midMin = features.amplitudemode == "high" ? 500 : 100;
	let farMax = features.amplitudemode == "high" ? 500 : 100;
	let farMin = features.amplitudemode == "high" ? 100 : 10;

	console.log(farMax, farMin);
	if (fxfeatures.scalename == "macro") {
		amp1Max = Math.floor(map(scl1, 0.0001, 0.0008, macroMax, macroMin, true));
		amp2Max = Math.floor(map(scl2, 0.0001, 0.0008, macroMax, macroMin, true));
	} else if (fxfeatures.scalename == "close") {
		amp1Max = Math.floor(map(scl1, 0.0008, 0.002, closeMax, closeMin, true));
		amp2Max = Math.floor(map(scl2, 0.0008, 0.002, closeMax, closeMin, true));
	} else if (fxfeatures.scalename == "mid") {
		amp1Max = Math.floor(map(scl1, 0.002, 0.005, midMax, midMin, true));
		amp2Max = Math.floor(map(scl2, 0.002, 0.005, midMax, midMin, true));
	} else if (fxfeatures.scalename == "far") {
		amp1Max = Math.floor(map(scl1, 0.005, 0.01, farMax, farMin, true));
		amp2Max = Math.floor(map(scl2, 0.005, 0.01, farMax, farMin, true));
	}

	amp1rnd1 = Math.floor(fxrand() * amp1Max);
	amp1rnd2 = Math.floor(fxrand() * amp1Max);
	amp2rnd1 = Math.floor(fxrand() * amp2Max);
	amp2rnd2 = Math.floor(fxrand() * amp2Max);
	let smallest1 = Math.min(amp1rnd1, amp1rnd2);
	let smallest2 = Math.min(amp2rnd1, amp2rnd2);
	let largest1 = Math.max(amp1rnd1, amp1rnd2);
	let largest2 = Math.max(amp2rnd1, amp2rnd2);

	if (features.amplitudemode == "none") {
		amp1 = int(random(1, 5));
		amp2 = int(random(1, 5));
	} else if (features.amplitudemode == "low") {
		amp1 = smallest1;
		amp2 = smallest2;
	} else if (features.amplitudemode == "high") {
		amp1 = largest1;
		amp2 = largest2;
	}
	console.log("amp1", amp1);
	console.log("amp2", amp2);

	//* create a random dividing number to add a bit of randomness to the particle movement.
	let xRandDivider = random([0.08, 0.09, 0.1, 0.11, 0.12]);
	let yRandDivider = random([0.08, 0.09, 0.1, 0.11, 0.12]);

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
		initHue =
			initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;

		movers.push(
			new Mover(
				x,
				y,
				initHue,
				scl1 / MULTIPLIER,
				scl2 / MULTIPLIER,
				amp1 * MULTIPLIER,
				amp2 * MULTIPLIER,
				xMin,
				xMax,
				yMin,
				yMax,
				xRandDivider,
				yRandDivider
			)
		);
	}
}

function loadURLParams() {
	window.location.search.includes("particleNum")
		? (particleNum = parseInt(window.location.search.split("particleNum=")[1]))
		: 800000;
	if (window.location.search.includes("dpi")) {
		dpi_val = parseInt(window.location.search.split("dpi=")[1]);
	}
	if (window.location.search.includes("ratio=")) {
		if (
			window.location.search.includes("ratio=a4") ||
			urlParams.ratio == "a4"
		) {
			RATIO = 1.41;
			MARGIN = 250;
		} else if (
			window.location.search.includes("ratio=skate") ||
			urlParams.ratio == "skate"
		) {
			RATIO = 3.888;
			MARGIN = 0;
		} else if (
			window.location.search.includes("ratio=square") ||
			window.location.search.includes("ratio=1") ||
			urlParams.ratio == "square" ||
			urlParams.ratio == "1"
		) {
			RATIO = 1;
			MARGIN = 300;
		} else if (
			window.location.search.includes("ratio=3") ||
			window.location.search.includes("ratio=bookmark") ||
			urlParams.ratio == "bookmark"
		) {
			RATIO = 3;
			MARGIN = 200;
		} else {
			RATIO = parseInt(window.location.search.split("ratio=")[1]);
			MARGIN = 200;
		}
	}

	if (window.location.search.includes("margin")) {
		MARGIN = parseInt(window.location.search.split("margin=")[1]);
	}
}

function drawTexture(hue) {
	// draw 200000 small rects to create a texture

	for (let i = 0; i < 600000; i++) {
		let x = fxrand() * width;
		let y = fxrand() * height;
		let sw = 0.45 * MULTIPLIER;
		let h = hue + fxrand() * 2 - 1;
		let s =
			features.colormode != "monochrome"
				? [0, 20, 40, 60, 80, 100][parseInt(fxrand() * 6)]
				: 0;
		let b = [0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100][
			parseInt(fxrand() * 11)
		];
		drawingContext.fillStyle = `hsla(${h}, ${s}%, ${b}%, 100%)`;
		drawingContext.fillRect(x, y, sw, sw);
	}
}

function showLoadingBar(elapsedTime, maxFrames, xMin, xMax, yMin, yMax) {
	let percent = (elapsedTime / maxFrames) * 100;
	if (percent > 100) percent = 100;

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + "%" + " (mode " + renderMode + ")";
}

class Mover {
	constructor(
		x,
		y,
		hue,
		scl1,
		scl2,
		amp1,
		amp2,
		xMin,
		xMax,
		yMin,
		yMax,
		xRandDivider,
		yRandDivider,
		bgColArr
	) {
		this.x = x;
		this.y = y;
		this.initHue = hue;
		this.initSat =
			features.vibrancymode === "high"
				? [60, 70, 80, 80, 90, 100][Math.floor(fxrand() * 6)]
				: features.vibrancymode === "low"
				? [0, 10, 20, 20, 30, 40][Math.floor(fxrand() * 6)]
				: [0, 10, 20, 30, 40, 40, 60, 80, 80, 90, 100][
						Math.floor(fxrand() * 11)
				  ];

		this.initBri =
			features.theme === "bright" && features.colormode !== "monochrome"
				? [0, 10, 20, 20, 40, 40, 60, 70, 80, 90, 100][
						Math.floor(fxrand() * 11)
				  ]
				: features.theme === "bright" && features.colormode === "monochrome"
				? [0, 0, 10, 20, 20, 30, 40, 60, 80][Math.floor(fxrand() * 9)]
				: [40, 40, 60, 70, 70, 80, 80, 90, 100][Math.floor(fxrand() * 9)];
		this.initAlpha = 50;
		this.initS = 1 * MULTIPLIER;
		this.hue = this.initHue;
		this.sat =
			features.colormode === "monochrome" || features.colormode === "duotone"
				? 0
				: this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep =
			features.colormode === "monochrome" || features.colormode === "fixed"
				? 1
				: features.colormode === "dynamic" || features.colormode === "duotone"
				? 10
				: 20;
		this.satStep = features.colorMode === "duotone" ? 0.1 : 1;
		this.briStep = 0;
		this.s = this.initS;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.amp1 = amp1;
		this.amp2 = amp2;
		this.xRandDivider = xRandDivider;
		this.yRandDivider = yRandDivider;
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
		this.lineWeight =
			typeof features.lineModeValue === "string"
				? eval(features.lineModeValue) * MULTIPLIER
				: features.lineModeValue * MULTIPLIER;
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move() {
		let p = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.amp1,
			this.amp2,
			this.oct,
			this.clampvaluearray,
			this.uvalueArr
		);

		this.xRandSkipper =
			fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) -
			this.xRandSkipperVal * MULTIPLIER;
		this.yRandSkipper =
			fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) -
			this.xRandSkipperVal * MULTIPLIER;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;
		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		let pxy = p.x - p.y;
		this.hue += mapValue(
			pxy,
			-this.uvalue * 2,
			this.uvalue * 2,
			-this.hueStep,
			this.hueStep,
			true
		);
		this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue;
		this.bri += mapValue(
			p.y,
			-this.uvalue * 2,
			this.uvalue * 2,
			-this.briStep,
			this.briStep,
			true
		);
		this.bri = this.bri > 100 ? 0 : this.bri < 0 ? 100 : this.bri;
		this.sat += mapValue(
			p.x,
			-this.uvalue * 2,
			this.uvalue * 2,
			-this.satStep,
			this.satStep,
			true
		);
		if (features.colormode != "monochrome" && features.colormode != "duotone") {
			this.sat = this.sat > 100 ? 0 : this.sat < 0 ? 100 : this.sat;
		} else if (features.colormode === "duotone") {
			this.sat =
				this.sat > this.initSat * 1.5
					? 0
					: this.sat < 0
					? this.initSat * 1.5
					: this.sat;
		}

		if (
			this.x < this.xMin * width ||
			this.x > this.xMax * width ||
			this.y < this.yMin * height ||
			this.y > this.yMax * height
		) {
			this.a = 0;
			this.zombie = true;
		} else {
			this.a = this.zombie ? this.zombieAlpha : this.initAlpha;
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
	}
}
function superCurve(
	x,
	y,
	scl1,
	scl2,
	amp1,
	amp2,
	octave,
	clampvalueArr,
	uvalueArr
) {
	let nx = x,
		ny = y,
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
	dy = oct(nx, ny, scale2, 2, octave);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, 3, octave);
	let vn = oct(nx, ny, scale2, 2, octave);

	let u = mapValue(
		un,
		-clampvalueArr[0],
		clampvalueArr[1],
		-uvalueArr[0],
		uvalueArr[1],
		true
	);
	let v = mapValue(
		vn,
		-clampvalueArr[2],
		clampvalueArr[3],
		-uvalueArr[2],
		uvalueArr[3],
		true
	);

	return {x: u, y: v};
}
