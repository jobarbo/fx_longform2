let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let font;
let points = [];
let angle = 0;
let r = 20;
function preload() {
	font = loadFont("./Roboto-Black.ttf");
}

function setup() {
	// canvas setup
	features = $fx.getFeatures();
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	//rectMode(CENTER);
	angleMode(DEGREES);
	background(0, 1, 10);

	// text to points

	points = font.textToPoints("GENUARY", 0, width / 2, 150, {
		sampleFactor: 3,
		simplifyThreshold: 0,
	});

	let box = font.textBounds("GENUARY", 0, width / 2, 150);
	let xOffset = width / 2 - box.x - box.w / 2;
	let yOffset = height / 2 - box.y - box.h / 2;

	// make the letters into points and make it fit inside the rectangle
	for (let i = 0; i < points.length; i++) {
		points[i].x += xOffset;
		points[i].y += yOffset;
	}

	console.log(points);
}

function draw() {
	blendMode(ADD);
	//background(220);
	for (let i = 0; i < points.length; i++) {
		fill(0, 1, 100, 100);
		noStroke();
		ellipse(points[i].x + r * (sin(angle + i * 1) * random()), points[i].y + r * (sin(angle + i * 1) * random()), 0.1, 0.1);
	}
	angle += 0.1;
	r += random(-0.5, 0.5);
	blendMode(BLEND);
}
