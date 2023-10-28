let features = '';

let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let petals_arr = [];
let pistils_arr = [];

let total_angle = 360;
let total_petals = total_angle / 90;
let total_pistils = total_angle;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM);
	dpi(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	angleMode(DEGREES);

	// setup petals
	for (let i = 0; i < total_petals; i++) {
		let ang = i * 90;
		let petal = new Petal(ang);
		petals_arr.push(petal);
	}

	// setup pistils
	/* 	for (let i = 0; i < total_pistils; i++) {
		let pistil = new Pistil();
		pistils_arr.push(pistil);
	} */

	// draw
	background(0);
	translate(width / 2, height / 2);
	blendMode(ADD);
	for (let i = 0; i < total_petals; i++) {
		petals_arr[i].draw();
	}
	blendMode(BLEND);
}

function draw() {
	noLoop();
}

class Petal {
	// petals are made with arcs rotated around the center
	constructor(angle) {
		this.x = random(-width / 20, width / 20);
		this.y = 0;
		this.r = width / 2 + random(-10, 10);
		this.w = width / 2 + random(-10, 10);
		this.h = width / 2 + random(-10, 10);
		this.start = 0;
		this.end = 90;
		this.hue = random(0, 360);
		this.sat = random(0, 100);
		this.bri = 80;
		this.alpha = 100;
		this.angle = angle;
	}

	draw() {
		push();
		rotate(this.angle);
		noFill();
		strokeWeight(150);
		stroke(this.hue, this.sat, this.bri, this.alpha);
		arc(this.x, this.y, this.w, this.h, this.start, this.end);
		pop();
	}
}
