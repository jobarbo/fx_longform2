let features = '';

let debug = true;

let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let origin;
let moons = [];

let moon_angle = -90;
let moon_num = 13;
let moon_radius = 2;
let stroke_length = 0.15;
let moon_multiplier = 1.1;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM * 1.275, DIM);
	angleMode(DEGREES);
	dpi(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	background(160, 3, 95, 100);

	origin = new Origin();
	if (debug) {
		origin.display();
	}

	// translate to origin
	push();
	translate(origin.pos.x, origin.pos.y);
	rotate(moon_angle);

	for (let i = 0; i <= moon_num; i++) {
		let pos = createVector(0, -DIM * stroke_length);
		moon_radius = map(i, 0, moon_num, 5, 60);
		moons[i] = new Moon(pos.x, pos.y, moon_radius);
		moons[i].display();

		rotate(200 / moon_num);
		stroke_length += 0.025;
	}
	pop();
}

function draw() {
	noLoop();
}

class Origin {
	constructor() {
		this.pos = createVector(width / 3, height * 0.7);
		this.r = 10;
		this.c = color(0, 100, 100, 100);
		this.debug = false;
	}

	display() {
		if (this.debug) {
			fill(this.c);
			noStroke();
			ellipse(this.pos.x, this.pos.y, this.r);
		}
	}
}

class Moon {
	constructor(x, y, r) {
		this.pos = createVector(x, y);
		this.r = r;
		this.c = color(0, 0, 0, 100);
		this.debug = false;
		this.particleNum = 700;
		this.graphics = createGraphics(this.r, this.r);
		this.context = this.graphics.canvas.getContext('2d');

		this.particle_size = 1;
	}

	display() {
		fill(this.c);
		noStroke();
		ellipse(this.pos.x, this.pos.y, this.r);

		if (this.debug) {
			stroke(0, 0, 0, 100);
			line(0, 0, this.pos.x, this.pos.y);
		}
		this.graphics.colorMode(HSB, 360, 100, 100, 100);
		this.graphics.noStroke();
		this.graphics.circle(this.r / 2, this.r / 2, this.r);
		this.context.clip();
		this.graphics.background(0, 0, 85, 100);

		let h = 50;
		let s = 0;
		let b = 50;
		let vary = 120;
		for (let i = 0; i < this.particleNum; i++) {
			let x = random(this.graphics.width);
			let y = random(this.graphics.height);

			this.graphics.fill(h + random(-vary, vary), s, b + random(-vary, vary), 2);

			// make particle size relative to the size of the moon (r)
			this.particle_size = map(this.r, 5, 60, 1, 12);
			this.graphics.circle(x, y, this.particle_size);
		}
		image(this.graphics, this.pos.x - this.r / 2, this.pos.y - this.r / 2);
	}
}
