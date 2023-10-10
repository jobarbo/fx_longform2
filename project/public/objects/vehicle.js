class Vehicle {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.prevPos = createVector(x, y);
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);
		this.maxSpeed = 2;
		this.maxForce = 0.2;
		this.r = 1;
		this.a = 100;
	}

	seek(target) {
		let desired = p5.Vector.sub(target, this.pos);
		desired.setMag(this.maxSpeed);
		let steering = p5.Vector.sub(desired, this.vel);
		console.log(steering);
		steering.limit(this.maxForce);
		this.applyForce(steering);
	}

	applyForce(force) {
		this.acc.add(force);
	}

	update() {
		this.prevPos = this.pos.copy();
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.set(0, 0);
		// make the alpha higher when closer to the target
		this.a = map(this.pos.dist(target), 20, 100, 255, 255);
	}

	show() {
		stroke(255, this.a);
		strokeWeight(2);
		fill(255);
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		//triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);

		pop();
		strokeWeight(0.25);
		line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
	}
}
