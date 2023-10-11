let DEFAULT_SIZE = 3600;
let W = 1000;
let H = 1000;
let DIM;
let MULTIPLIER;

let logo;
let vehicles = [];

let orbit;
let orbit_center;
let angle = 0;
let radius = 600;

let starRays = [];
let starRaysCount = 88;

function preload() {
	logo = loadImage('Mono_revert.png');
}

function setup() {
	console.time('setup test');
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(3.0);
	}

	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM);
	colorMode(HSB, 360, 100, 100, 100);
	background(0);

	orbit_center = createVector(594, 435);

	orbit = new Orbit(orbit_center, radius, 0, 0.01);

	for (let index = 0; index < 3400; index++) {
		//vehicles[index] = new Vehicle(random(0, width), random(0, height));
		let rndYMin = randomGaussian(0, 100);
		let rndYMax = randomGaussian(height, 100);
		vehicles[index] = new Vehicle(random(-width, width * 2), random([rndYMin, rndYMax]));
	}

	for (let i = 0; i < starRaysCount; i++) {
		let angle = map(i, 0, starRaysCount, 0, TWO_PI);
		starRays[i] = new StarRay(orbit_center, angle, 0.1);
	}
}

function mousePressed() {
	let x = mouseX;
	let y = mouseY;
	console.log(x, y);
}

function draw() {
	// once every 20 frames, draw a black background with 20% opacity
	/* 	background(0, 10);
	fill(0, 10);
	rect(0, 0, width, height); */
	//background(0, 20);
	fill(255, 0, 0);
	noStroke();
	let target = createVector(mouseX, mouseY);
	if (frameCount > 500) {
		fill(0, 10);
		rect(0, 0, width, height);
	}
	//circle(target.x, target.y, 20);
	//blendMode(SCREEN);
	//orbit.show();
	orbit.update();
	let orbitPos = orbit.getPosition();

	blendMode(ADD);
	for (let vehicle of vehicles) {
		let seek = vehicle.arrive(orbitPos);
		vehicle.applyForce(seek);
		vehicle.update(orbitPos);
		vehicle.show();
	}

	blendMode(BLEND);
	for (let starRay of starRays) {
		starRay.show();

		if (frameCount > 600) {
			starRay.update();
		}
	}
	// show image in the middle of the canvas
	imageMode(CENTER);
	image(logo, width / 2, height / 2, width, height);

	//orbit.show();
}

class Orbit {
	constructor(center, radius, angle, angularVelocity) {
		this.center = center;
		this.radius = radius;
		this.angle = angle;
		this.angularVelocity = angularVelocity * 3;
		this.dividerX = 1;
		this.dividerY = 1;
	}

	update() {
		this.angle += this.angularVelocity;
		this.radius *= 0.992;
		//this.dividerX += 0.01;
		this.dividerY += 0.01;
		if (this.radius < 0) {
			this.radius = 0;
		}
	}

	getPosition() {
		let x = this.center.x + (this.radius / this.dividerX) * cos(this.angle);
		let y = this.center.y + (this.radius / this.dividerY) * sin(this.angle);
		return createVector(x, y);
	}

	show() {
		stroke(255);
		strokeWeight(1);
		noFill();
		let pos = this.getPosition();
		circle(pos.x, pos.y, 2);
	}
}

class StarRay {
	constructor(startPos, angle, angularVelocity) {
		// all star rays start from the center of the orbit to a set of evenly distributed points on the circumference of the orbit and then move away from the center to the edge of the canvas
		this.startPos = createVector(startPos.x, startPos.y);
		this.endPos = createVector(startPos.x, startPos.y);
		this.angle = angle;
		this.angularVelocity = angularVelocity;
	}

	show() {
		stroke(255);
		strokeWeight(1);
		line(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
	}
	update() {
		this.endPos.x += 10.5 * cos(this.angle);
		this.endPos.y += 10.5 * sin(this.angle);
	}
}
