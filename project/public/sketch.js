let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let palettes = ["f08080", "f4978e", "f8ad9d", "fbc4ab", "ffdab9"];

var Engine = Matter.Engine,
	//    Render = Matter.Render,
	World = Matter.World,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	Bodies = Matter.Bodies;

let engine;
let world;
let box_num = 1000;
let boxes = [];
let circles = [];
let grounds = [];
let mConstraint;

let canvas;
let sizes = [
	20, 10, 25, 50, 35, 10, 25, 50, 15, 10, 25, 50, 50, 10, 25, 70, 90, 10, 25, 50, 15, 10, 25, 50, 20, 10, 25, 50, 35, 10, 25, 50, 15, 10, 25, 50, 50, 10, 25, 70, 90, 10, 25, 50, 15, 10, 25, 50, 20,
	10, 25, 50, 35, 10, 25, 50, 15, 10, 25, 50, 50, 200, 500, 700, 1000,
];

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	canvas = createCanvas(DIM, DIM * 1);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	colorMode(HSB, 360, 100, 100, 100);
	engine = Engine.create();
	world = engine.world;
	grounds.push(new Boundary(0, height / 2, 10, height));
	grounds.push(new Boundary(width, height / 2, 10, height));
	grounds.push(new Boundary(width / 2, height + 25, width, 50));
	World.add(world, grounds);

	let mouse = Mouse.create(canvas.elt);
	mouse.pixelRatio = pixelDensity(); // for retina displays etc
	let options = {
		mouse: mouse,
	};
	mConstraint = MouseConstraint.create(engine, options);
	World.add(world, mConstraint);
}

let count = 0;

function draw() {
	background(220, 50, 35);
	let size = random(sizes);
	let size2 = random(sizes);
	if (size2 >= 100) {
		size2 = random([20, 10, 25, 50, 35, 10, 25, 50, 15, 10, 25]);
	}
	if (random() < 1) {
		if (boxes.length < box_num) {
			boxes.push(new Box(random(width), random(-4000, -1000), size, size2));
		}
	}

	Engine.update(engine);
	//blendMode(LIGHTEST);
	for (let box of boxes) {
		box.show();
	}
	//blendMode(BLEND);
	for (let ground of grounds) {
		ground.show();
	}
}

class Box {
	constructor(x, y, w, h) {
		let options = {
			friction: 0.5,
			restitution: 0,
			density: 1,
			slop: 0,
		};
		this.body = Bodies.rectangle(x + random(-1, 1), y + random(-1, 1), w, h, options);
		this.w = w;
		this.h = h;
		this.color = color(`#${random(palettes)}`);
		this.color.setAlpha(100);
		this.angle;
		World.add(world, this.body);
	}

	show() {
		let pos = this.body.position;
		let angle = this.body.angle;

		push();
		translate(pos.x, pos.y);
		rotate(angle);
		rectMode(CENTER);
		strokeWeight(3);
		stroke(220, 50, 35);
		fill(this.color);
		rect(0, 0, this.w, this.h);
		pop();
	}
}

class Boundary {
	constructor(x, y, w, h) {
		let options = {
			friction: 0.5,
			restitution: 0,
			density: 1,
			slop: 0,
			isStatic: true,
		};
		this.body = Bodies.rectangle(x, y, w, h, options);
		this.w = w;
		this.h = h;
		World.add(world, this.body);
	}

	show() {
		let pos = this.body.position;
		let angle = this.body.angle;

		push();
		translate(pos.x, pos.y);
		rotate(angle);
		rectMode(CENTER);
		strokeWeight(0);
		noStroke();
		fill(0, 30, 100, 0);
		rect(0, 0, this.w, this.h);
		pop();
	}
}
