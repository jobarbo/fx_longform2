let particles = [];
let attractor;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB, 360, 100, 100, 100);

	// Place attractor at rule of thirds
	attractor = createVector(width / 2, height / 2);

	// Initialize particles
	for (let i = 0; i < 1; i++) {
		particles.push(new Particle(randomEdgePosition()));
	}
	background(0, 0, 10);
}

function draw() {
	// Display attractor
	fill(0, 0, 100);
	noStroke();
	ellipse(attractor.x, attractor.y, 10, 10);

	for (let particle of particles) {
		particle.attracted(attractor);
		particle.update();
		particle.display();
	}
}

function randomEdgePosition() {
	let edge = floor(random(4));
	if (edge == 0) return createVector(random(width), 0); // Top edge
	if (edge == 1) return createVector(random(width), height); // Bottom edge
	if (edge == 2) return createVector(0, random(height)); // Left edge
	return createVector(width, random(height)); // Right edge
}

class Particle {
	constructor(position) {
		this.position = position.copy();
		this.prev_position = this.position.copy();
		if (attractor) {
			this.velocity = p5.Vector.sub(attractor, this.position).setMag(3); // Initial velocity towards attractor
		} else {
			this.velocity = p5.Vector.random2D().setMag(3); // Fallback initial velocity
		}
		this.acceleration = createVector();
		this.size = 10;
		this.col = color(0, 100, 100);
	}

	attracted(target) {
		let force = p5.Vector.sub(target, this.position);
		let distance = force.mag();
		let maxDistance = 300; // Distance at which particles start diverging
		if (distance < maxDistance) {
			let angle = map(distance, 0, maxDistance, PI / 4, 0);
			this.velocity.rotate(random(-angle, angle));
		} else {
			mag = map(distance, maxDistance, 0, 0.15, 0.15);
			force.setMag(mag); // Constant attraction force
			this.acceleration.add(force);
		}
	}

	update() {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.acceleration.mult(0); // Reset acceleration

		// Bounce off walls
		/* 		if (this.position.x < 0 || this.position.x > width) {
			this.velocity.x *= -1;
			this.position.x = constrain(this.position.x, 0, width);
		}
		if (this.position.y < 0 || this.position.y > height) {
			this.velocity.y *= -1;
			this.position.y = constrain(this.position.y, 0, height);
		} */
	}

	display() {
		stroke(this.col);
		strokeWeight(this.size);
		fill(this.col);
		line(this.position.x, this.position.y, this.prev_position.x, this.prev_position.y);
		this.prev_position = this.position.copy();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	redraw(); // Redraw the canvas when the window is resized
}
