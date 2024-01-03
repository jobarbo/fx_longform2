let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let img;
let angle = 0;
let scaleFactor = 0.05;
let angle_speed = 30;

let pg;
function preload() {
	img = loadImage("assets/image19.png");
}

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pg = createGraphics(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	angleMode(DEGREES);
	imageMode(CENTER);
	rectMode(CENTER);
	pg.colorMode(HSB, 360, 100, 100, 100);
	pg.pixelDensity(dpi(3));

	pg.angleMode(DEGREES);
	pg.imageMode(CENTER);
	pg.rectMode(CENTER);
	pg.pg_r_h = 0;
	pg.pg_r_s = 0;
	pg.pg_r_b = 100;
	pg.alpha = 100;
	pg.alpha_speed = 0.0001;

	INIT();
}

function INIT() {}

function draw() {
	background(255, 0);
	translate(width / 2, height / 2);
	blendMode(LIGHTEST);
	pg.alpha = 100;
	drosteEffect(img, 0, 0, width * 1.5);

	blendMode(BLEND);
}

function drosteEffect(img, x, y, size) {
	push();
	//translate(x, y);
	pg.push();
	rotate(angle);
	tint(255, pg.alpha);
	image(img, 0, 0, size, size);

	pg.alpha += pg.alpha_speed;

	if (pg.alpha > 100) {
		pg.alpha = 100;
	}

	let new_size = size * scaleFactor;
	angle += angle_speed;

	if (size > 5) {
		drosteEffect(img, x, y, new_size);
	}
	pop();
}
