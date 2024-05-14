let particles = [];
let attractor;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB, 360, 100, 100, 100);

	// Place attractor at rule of thirds
	attractor = createVector(width / 2, height / 2);

	// Initialize particles
	for (let i = 0; i < 10; i++) {
		particles.push(new Particle(randomEdgePosition()));
	}
	background(5);
}

function draw() {
	// Display attractor
	fill(0, 0, 100, 100);
	noStroke();
	ellipse(attractor.x, attractor.y, 10, 10);

	for (let particle of particles) {
		particle.update(attractor);
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
		this.velocity = p5.Vector.sub(attractor, this.position).setMag(3); // Initial velocity towards attractor
		this.acceleration = createVector();
		this.size = 10;
		this.col = color(random(360), 100, 100, 50);
		this.diverged = false; // Flag to indicate if the particle has diverged
	}

	update(attractor) {
		if (!this.diverged) {
			let force = p5.Vector.sub(attractor, this.position);
			let distance = force.mag();
			let maxDistance = 100; // Distance at which particles start diverging
			if (distance < maxDistance) {
				let angle = map(distance, 0, maxDistance, PI / 1, PI / 1);
				this.velocity.rotate(random(-angle, angle));
				this.diverged = true; // Mark as diverged
			} else {
				force.setMag(0.2); // Constant attraction force
				this.acceleration.add(force);
			}
		}

		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.acceleration.mult(0); // Reset acceleration

		// Bounce off walls
		/*     if (this.position.x < 0 || this.position.x > width) {
      this.velocity.x *= -1;
      this.position.x = constrain(this.position.x, 0, width);
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.velocity.y *= -1;
      this.position.y = constrain(this.position.y, 0, height);
    } */
	}

	display() {
		noStroke();
		fill(this.col);
		ellipse(this.position.x, this.position.y, this.size);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	redraw(); // Redraw the canvas when the window is resized
}
