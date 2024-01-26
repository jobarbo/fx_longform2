let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let v_p;
let v_p_pos = {x: 0, y: 0};

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO, WEBGL);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	//rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 40, 100);
	brush.scaleBrushes(1);
	brush.field("seabed");
	translate(-width / 2, -height / 2);
	let available_brushes = brush.box();
	console.log(available_brushes);
	brush.set("rotring", "#002185", 11);
	brush.noStroke();
	brush.fill("#002185", 255);
	brush.circle(width / 4, height / 2, 140, true);
	brush.field("seabed");

	brush.noHatch();

	brush.rect(width / 2, height / 2, 2, 550, CENTER);

	brush.noHatch();

	brush.rect(width / 1.25, height / 2, 300, 750, CENTER);
}

function draw() {}
