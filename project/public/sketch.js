let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let flock;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	imageMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	flock = new Flock();
	let hue = random(360);
	for (let i = 0; i < 100; i++) {
		flock.addBoid(new Boid(random(width), random(height), hue));
	}
	background(45, 5, 100);
}

function draw() {
	flock.run();
}

class Boid {
	constructor(x, y, hue) {
		this.position = createVector(x, y);
		this.prevPosition = createVector(x, y);
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		this.acceleration = createVector();
		this.maxForce = 0.1;
		this.maxSpeed = 3;
		this.detect = false;
		this.hue = hue + random(-10, 10);
		this.sat = random([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
		this.bri = random([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
		console.log(this.hue);
	}

	applyForce(force) {
		this.acceleration.add(force);
	}

	flock(boids) {
		let alignment = createVector();
		let cohesion = createVector();
		let separation = createVector();

		let perceptionRadius = 50;

		let total = 0;

		for (let other of boids) {
			let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
			if (other != this && d < perceptionRadius) {
				this.detect = true;
				alignment.add(other.velocity);
				cohesion.add(other.position);
				separation.add(p5.Vector.sub(this.position, other.position));
				total++;
				line(this.position.x, this.position.y, other.position.x, other.position.y);
			} else {
				this.detect = false;
			}
		}

		if (total > 0) {
			alignment.div(total);
			alignment.setMag(this.maxSpeed);
			alignment.sub(this.velocity);
			alignment.limit(this.maxForce);

			cohesion.div(total);
			cohesion.sub(this.position);
			cohesion.setMag(this.maxSpeed);
			cohesion.sub(this.velocity);
			cohesion.limit(this.maxForce);

			separation.div(total);
			separation.setMag(this.maxSpeed);
			separation.sub(this.velocity);
			separation.limit(this.maxForce);
		}

		this.applyForce(alignment);
		this.applyForce(cohesion);
		this.applyForce(separation);
	}

	update() {
		this.prevPosition.x = this.position.x;
		this.prevPosition.y = this.position.y;
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.acceleration.mult(0);
	}

	edges() {
		if (this.position.x > width + 50) this.position.x = -50;
		else if (this.position.x < -50) this.position.x = width + 50;

		if (this.position.y > height + 50) this.position.y = -50;
		else if (this.position.y < -50) this.position.y = height + 50;
	}

	show() {
		stroke(this.hue, this.sat, this.bri, 100);
		strokeWeight(0.01);
		//point(this.position.x, this.position.y);
		//point(this.prevPosition.x, this.prevPosition.y);

		//line(this.position.x, this.position.y, this.prevPosition.x, this.prevPosition.y);
	}
}

class Flock {
	constructor() {
		this.boids = [];
	}

	addBoid(boid) {
		this.boids.push(boid);
	}

	run() {
		for (let boid of this.boids) {
			boid.edges();
			boid.flock(this.boids);
			boid.update();
			boid.show();
		}
	}
}
