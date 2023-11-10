let features = '';

let debug = true;

let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let origin;
let movers = [];
let moons = [];

let moon_angle = -90;
let moon_num = 13;
let moon_radius = 2;
let stroke_length = 0.15;
let moon_multiplier = 1.1;

let scl1, scl2, ang1, ang2, scl1Zone, scl2Zone, ang1Zone, ang2Zone;

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

	background(160, 3, 95, 0);

	scl1 = fxrand() * (0.0032 - 0.001) + 0.001;
	scl2 = fxrand() * (0.0032 - 0.001) + 0.001;
	ang1 = parseInt(fxrand() * (1500, 2200) + 1500);
	ang2 = parseInt(fxrand() * (1000, 2200) + 1000);

	origin = new Origin();
	if (debug) {
		origin.display();
	}

	// translate to origin
	push();
	translate(origin.pos.x, origin.pos.y);
	rotate(moon_angle);

	for (let i = 0; i <= moon_num; i++) {
		let pos = createVector(0, -height * stroke_length);
		moon_radius = map(i, 0, moon_num, 15, 100);
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
		this.pos = createVector(width / 2.5, height * 0.6);
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
		this.graphics = createGraphics(this.r, this.r);
		this.context = this.graphics.canvas.getContext('2d');
		this.startTime = frameCount;
		this.maxFrames = 64 * 120;
		this.particleNum = (1000 * r) / 10;
		this.cycle = (this.maxFrames * this.particleNum) / 600;
		this.drawing = true;
		this.n_index = [
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
			Math.floor(fxrand() * 4),
		];
		this.movers = [];
		this.init();
	}

	init() {
		console.log('INIT');
		movers = [];
		seed = random(10000);
		let xRandDivider = 0.1;
		let yRandDivider = xRandDivider;
		let hue = fxrand() * 360;
		let xMin = 0.05;
		let xMax = 0.95;
		let yMin = 0.05;
		let yMax = 0.95;

		for (let i = 0; i < this.particleNum; i++) {
			/* 			let x = fxrand() * (xMax - xMin) * width + xMin * width;
			let y = fxrand() * (yMax - yMin) * height + yMin * height; */

			// position the particles inside the circle (this.graphics), this.r is the radius of the circle
			let x = fxrand() * this.r;
			let y = fxrand() * this.r;
			let initHue = hue + fxrand() * 2 - 1;
			initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
			movers.push(
				new Mover(
					this.n_index,
					this.graphics,
					x,
					y,
					initHue,
					scl1 / MULTIPLIER,
					scl2 / MULTIPLIER,
					ang1 * MULTIPLIER,
					ang2 * MULTIPLIER,
					xMin,
					xMax,
					yMin,
					yMax,
					xRandDivider,
					yRandDivider,
					scl1Zone * MULTIPLIER,
					scl2Zone * MULTIPLIER,
					ang1Zone * MULTIPLIER,
					ang2Zone * MULTIPLIER
				)
			);
		}
	}

	display() {
		noFill();
		noStroke();
		ellipse(this.pos.x, this.pos.y, this.r);

		if (this.debug) {
			stroke(0, 0, 0, 100);
			line(0, 0, this.pos.x, this.pos.y);
		}

		this.graphics.colorMode(HSB, 360, 100, 100, 100);
		this.graphics.background(0, 0, 0, 0);
		this.graphics.noStroke();
		this.graphics.fill(0, 0, 0, 1);
		this.graphics.circle(this.r / 2, this.r / 2, this.r);
		this.context.clip();

		let sketch = this.drawGenerator();

		// use requestAnimationFrame to call the generator function and pass it the sketch function
		function animate() {
			//requestAnimationFrame(animate);
			setTimeout(animate, 0);
			sketch.next();

			//if done drawing, stop the animation
		}
		animate();

		// draw the image to the canvas
		image(this.graphics, this.pos.x - this.r / 2, this.pos.y - this.r / 2);
	}

	*drawGenerator() {
		let count = 0;
		let frameCount = 0;
		let draw_every = this.cycle;

		// draw the particles and make them move until draw_every is reached then yield and wait for the next frame, also check if the maxFrames is reached and stop the sketch if it is and also show the loading bar
		while (true) {
			for (let i = 0; i < this.particleNum; i++) {
				const mover = movers[i];
				mover.show();
				mover.move();
				if (count > draw_every) {
					count = 0;
					yield;
				}
				count++;
			}

			let elapsedTime = frameCount - this.startTime;

			frameCount++;

			if (elapsedTime > this.maxFrames && this.drawing) {
				this.drawing = false;
				// close the generator
				return;
			}
		}
	}
}

class Mover {
	constructor(
		n_index,
		graphic,
		x,
		y,
		hue,
		scl1,
		scl2,
		ang1,
		ang2,
		xMin,
		xMax,
		yMin,
		yMax,
		xRandDivider,
		yRandDivider,
		scl1Zone,
		scl2Zone,
		ang1Zone,
		ang2Zone
	) {
		this.graphics = graphic;
		this.ctx = this.graphics.canvas.getContext('2d');
		this.n_index = n_index;
		this.x = x;
		this.y = y;
		this.initHue = parseInt(hue);
		this.initSat = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initBri = [0, 0, 10, 20][Math.floor(fxrand() * 4)];
		this.initAlpha = 0;
		this.initS = 1 * MULTIPLIER;
		this.s = this.initS;
		this.hue = this.initHue;
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.a = this.initAlpha;
		this.hueStep = 0.0001;
		this.satStep = 0.0001;
		this.briStep = 0.0001;
		this.scl1Init = scl1;
		this.scl2Init = scl2;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.ang1Init = ang1;
		this.ang2Init = ang2;
		this.ang1 = ang1;
		this.ang2 = ang2;
		this.xRandDivider = xRandDivider;
		this.yRandDivider = yRandDivider;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperVal = 0;
		this.yRandSkipperVal = 0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.xLimit = 0.00015;
		this.yLimit = 0.00015;
		this.oct = 6;
		this.centerX = this.graphics.width / 2;
		this.centerY = this.graphics.height / 2;
		this.borderX = this.graphics.width / 2;
		this.borderY = this.graphics.height / 2.75;
		this.uvalue = 4;
		this.isBordered = true;

		this.ang1Zone = ang1Zone;
		this.ang2Zone = ang2Zone;
		this.scl1Zone = scl1Zone;
		this.scl2Zone = scl2Zone;

		// make the limit relative to the radius of the circle
		this.distLimit = this.graphics.width * 2;

		this.ns = 0.5;
	}

	show() {
		// draw a pixel using drawingContext but it need to be inside this.graphics

		/* 		this.graphics.noStroke();
		this.graphics.circle(this.graphics.width / 2 - 2, this.graphics.height / 2, 10); */
		this.graphics.fill(this.hue, this.sat, this.bri, this.a);

		this.graphics.rect(this.x, this.y, this.s, this.s);
	}

	move() {
		// get the distance from the particle to the chosen location using the sdf_box function (signed distance function).
		// the sdf_box function returns the distance from the particle to the chosen location.
		// the sdf_box function takes 3 arguments: the particle's x and y coordinates, the chosen location's x and y coordinates, and the chosen location's width and height.
		let distFromCenter = sdf_box([this.x, this.y], [this.centerX, this.centerY], [10 * MULTIPLIER, 1 * MULTIPLIER]);
		let distCircle = sdf_circle([this.x, this.y], [this.centerX, this.centerY], this.distLimit * MULTIPLIER);
		// smoothstep the distance from the particle to the chosen location.

		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		/* 		this.ang1 = parseInt(
			mapValue(distCircle, -100 * MULTIPLIER, 700 * MULTIPLIER, -this.ang1Init / 3, this.ang1Init * 4)
		);
		this.ang2 = parseInt(
			mapValue(distCircle, -100 * MULTIPLIER, 700 * MULTIPLIER, -this.ang2Init / 3, this.ang2Init * 4)
		);
		this.scl1 = map(distCircle, -700 * MULTIPLIER, 200 * MULTIPLIER, -this.scl1Init * 3, this.scl1Init, true);
		this.scl2 = map(distCircle, -700 * MULTIPLIER, 200 * MULTIPLIER, -this.scl2Init * 3, this.scl2Init, true); */

		//this.oct = parseInt(map(distCircle, 0, 1, 1, 6, true));

		//this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, this.ang2Init * 2, this.ang2Init / 100, true));
		/*
		this.ang1 = parseInt(map(distFromCenter, 0, this.ang1Zone, this.ang1Init / 1000, this.ang1Init * 2, true));
		this.ang2 = parseInt(map(distFromCenter, 0, this.ang2Zone, this.ang2Init / 1000, this.ang2Init * 2, true));
		this.scl1 = map(distFromCenter, 0, this.scl1Zone, this.scl1Init / 1000, this.scl1Init * 3, true);
		this.scl2 = map(distFromCenter, 0, this.scl2Zone, this.scl2Init / 1000, this.scl2Init * 3, true); */
		//! CHECK WHY ANG AND SCL IS NOT AGNOSTIC TO MULTIPLIER
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.ang1, this.ang2, this.oct, this.ns, this.n_index);
		this.xRandDivider = fxrand() * 2;
		this.yRandDivider = fxrand() * 2;

		this.x += (p.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper;

		this.y += (p.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper;

		this.a = map(distCircle, -this.distLimit / 2, -this.distLimit / 35, 100, 0, true);

		/* 		if (this.isBordered) {
			if (distCircle > fxrand() * 8 - 4) {
				let r = fxrand() * 2 * PI;
				this.x = this.centerX + cos(r) * random(this.distLimit - 4, this.distLimit + 4);
				this.y = this.centerY + sin(r) * random(this.distLimit - 4, this.distLimit + 4);
			}
		} */
	}
}

function superCurve(x, y, scl1, scl2, ang1, ang2, octave, ns, ni) {
	let nx = x,
		ny = y,
		a1 = ang1,
		a2 = ang2,
		scale1 = scl1,
		scale2 = scl2,
		noiseSpeed = ns,
		noise_index = ni,
		dx,
		dy;

	dx = oct(nx, ny, scale1, noise_index[0], octave);
	dy = oct(nx, ny, scale2, noise_index[1], octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, noise_index[2], octave);
	dy = oct(nx, ny, scale2, noise_index[3], octave);
	nx += dx * a1;
	ny += dy * a2;

	dx = oct(nx, ny, scale1, noise_index[4], octave);
	dy = oct(nx, ny, scale2, noise_index[5], octave);
	nx += dx * a1;
	ny += dy * a2;

	let un = oct(nx, ny, scale1, noise_index[6], octave);
	let vn = oct(nx, ny, scale2, noise_index[7], octave);

	/* 	let u = clamp(un + 0.5, 0, 1) * 21 - 1;
	let v = clamp(vn + 0.5, 0, 1) * 21 - 20; */

	let rangeA = [10, 15, 20];
	let rangeB = [1, 2, 3];

	let aValue = rangeA[Math.floor(fxrand() * rangeA.length)];
	let bValue = rangeB[Math.floor(fxrand() * rangeB.length)];

	let u = mapValue(un, -noiseSpeed, noiseSpeed, -aValue, bValue);
	let v = mapValue(vn, -noiseSpeed, noiseSpeed, -bValue, aValue);

	//let p = createVector(u, v);
	return {x: u, y: v};
}
