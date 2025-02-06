let features = "";
let movers = [];
let scl1;
let scl2;
let scl3;
let ang1;
let ang2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let isBordered = true;

let img;
let mask;

let DEFAULT_SIZE = 2600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

function preload() {
	img = loadImage("./image/Mono.png");
}

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.41);
	pixelDensity(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	INIT(rseed, nseed);
}

function draw() {
	//blendMode(ADD);
	for (let i = 0; i < movers.length; i++) {
		movers[i].show();
		movers[i].move();
	}
	blendMode(BLEND);
	if (frameCount > 1500) {
		console.log("done");
		noLoop();
	}
}
/* function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(seed);
}
 */
function INIT(rseed, nseed) {
	movers = [];

	scl1 = 0.002;
	scl2 = 0.002;
	scl3 = 0.002;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;

	console.log("sclOffset1", sclOffset1);
	console.log("sclOffset2", sclOffset2);
	console.log("sclOffset3", sclOffset3);

	console.log("scl1", scl1);
	console.log("scl2", scl2);
	console.log("scl3", scl3);

	xMin = -0.1;
	xMax = 1.1;
	yMin = -0.1;
	yMax = 1.1;

	let hue = random(360); // Define base hue for particles

	for (let i = 0; i < 500000; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed));
	}
	let bgCol = spectral.mix("#000", "#fff", 0.88);
	background(bgCol);
}
