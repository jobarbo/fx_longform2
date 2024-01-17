let particles = [];

function setup() {
	createCanvas(2080, 2080);
	for (let i = 0; i < 10000; i++) {
		particles[i] = new Particle();
	}
	background(21);
}

function draw() {
	blendMode(ADD);
	for (let i = 0; i < particles.length; i++) {
		particles[i].update();
		particles[i].show();
	}
	blendMode(BLEND);
}

class Particle {
	constructor() {
		this.pos = createVector(random(width), random(height));
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);
	}

	update() {
		let r = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01) * TWO_PI * 4;
		this.acc = p5.Vector.fromAngle(r);
		this.vel.add(this.acc);
		this.vel.limit(1);
		this.pos.add(this.vel);
	}

	show() {
		noStroke();
		let col = noise(this.pos.x * 0.01, this.pos.y * 0.01) * 255;
		fill(col, 100, 255, 10);
		ellipse(this.pos.x, this.pos.y, 2);
	}
}
