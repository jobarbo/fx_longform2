class Vehicle {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.prevPos = createVector(x, y);
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);
		this.hue = random([320, 340, 350]);
		this.sat = random(0, 60);
		this.bri = random(60, 100);
		this.maxSpeed = 5;
		this.maxForce = 0.2;
		this.r = 1;
		this.a = 40;
	}

	evade(vehicle) {
		let pursuit = this.pursue(vehicle);
		pursuit.mult(-1);
		return pursuit;
	}

	pursue(vehicle) {
		let target = vehicle.pos.copy();
		let prediction = vehicle.vel.copy();
		prediction.mult(10);
		target.add(prediction);
		fill(0, 255, 0);
		circle(target.x, target.y, 16);
		return this.seek(target);
	}

	arrive(target) {
		// 2nd argument true enables the arrival behavior
		return this.seek(target, true);
	}

	flee(target) {
		return this.seek(target).mult(-1);
	}

	seek(target, arrival = false) {
		let force = p5.Vector.sub(target, this.pos);
		let desiredSpeed = this.maxSpeed;
		if (arrival) {
			let slowRadius = 100;
			let distance = force.mag();
			if (distance < slowRadius) {
				desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
			}
		}
		force.setMag(desiredSpeed);
		force.sub(this.vel);
		force.limit(this.maxForce);
		return force;
	}

	applyForce(force) {
		this.acc.add(force);
	}

	update(orbitPos) {
		this.prevPos = this.pos.copy();
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.set(0, 0);
		this.maxSpeed = map(frameCount, 300, 500, 1, 70, true);
		this.maxForce = map(frameCount, 500, 600, 0.2, 100, true);
		// make the vehicle more opaque once it's closer to the target
		let target = orbitPos;
		let distance = p5.Vector.dist(this.pos, target);
		let maxDistance = map(frameCount, 0, 800, 0, 1000, true);
		//this.a = map(distance, 0, maxDistance, 255, 0, true);
	}

	show() {
		stroke(this.hue, this.sat, this.bri, this.a);
		fill(255, 255);
		strokeWeight(0.55);
		line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
	}

	edges() {
		if (this.pos.x > width + this.r) {
			this.pos.x = -this.r;
		} else if (this.pos.x < -this.r) {
			this.pos.x = width + this.r;
		}
		if (this.pos.y > height + this.r) {
			this.pos.y = -this.r;
		} else if (this.pos.y < -this.r) {
			this.pos.y = height + this.r;
		}
	}
}

class Target extends Vehicle {
	constructor(x, y) {
		super(x, y);
		this.vel = p5.Vector.random2D();
		this.vel.mult(5);
	}

	show() {
		stroke(255);
		strokeWeight(2);
		fill('#F063A4');
		push();
		translate(this.pos.x, this.pos.y);
		circle(0, 0, this.r * 2);
		pop();
	}
}
