let features = '';
let DEFAULT_SIZE = 1000;
let WIDTH = window.innerHeight;
let HEIGHT = window.innerHeight;
let DIM;
var M = 1;
let posX, posY;
let posXoff, posYoff;
let balls = [];
let ballHue, ballBright, ballSat;
let frame = 0;

let textures = [];

let hueIteration = 0;
let modeIteration = 0;

function setup() {
	features = $fx.getFeatures();
	console.log(features);

	hueIteration = features.hue_type;
	// moditeraion = if straight use 0 else use 1
	if (features.mode_type == 'straight') {
		modeIteration = 0;
	} else if (features.mode_type == 'moderate') {
		modeIteration = 0.00013;
	} else if (features.mode_type == 'crazy') {
		modeIteration = 0.0013;
	}

	let formatMode = features.format_mode;
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

	DIM = min(WIDTH, HEIGHT);
	M = DIM / DEFAULT_SIZE;
	c = createCanvas(WIDTH, HEIGHT);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	background(random(0, 360), 10, 100);
	posXoff = random(1000000);
	posYoff = random(1000000);
	coff = random(1000000);

	posY = height / 2;
	posX = width / 2;

	ballHue = random(0, 360);
	ballBright = random(10, 30);
	ballSat = random(50, 100);

	console.log(ballHue);

	for (let num = 0; num < 60000; num++) {
		posX = map(noise(posXoff), 0, 0.91, width / 2 - width / 2, width / 2 + width / 2, true);
		posY = map(noise(posYoff), 0, 0.91, height / 2 - height / 2, height / 2 + height / 2, true);
		ballHue += map(noise(coff), 0, 0.8, -hueIteration, hueIteration);
		ballSat += map(noise(coff), 0, 0.91, -0.01, 0.01);
		ballBright += map(noise(coff), 0, 0.91, -0.05, 0.05);
		ballSat = constrain(ballSat, 50, 100);
		ballBright = constrain(ballBright, 10, 80);

		if (ballHue > 360) {
			ballHue = 0;
		} else if (ballHue < 0) {
			ballHue = 360;
		}

		balls[num] = new Balle_MC(posX, posY, ballHue, ballSat, ballBright);

		balls[num].display();

		posXoff += 0.001;
		posYoff += modeIteration;
		coff += 0.001;
	}
	for (let num = 0; num < 500000; num++) {
		textures[num] = new Smudge(random(0, width), random(0, height), random(1, 2) * M, color(random(0, 360), 0, 10));
		textures[num].display();
	}
	let timer = setTimeout(() => {
		fxpreview();
		console.log('preview');
	}, 1000);

	/* 	noStroke();
	fill(200, 80, 100, 100);
	rect(0, height / 2, width, height / 2); */
}

class Balle_MC {
	constructor(x, y, h, s, b) {
		this.x = x;
		this.y = y;
		this.w = random(0.5, 2.5) * M;
		this.h = h;
		this.s = s;
		this.b = b;
	}

	display() {
		noStroke();
		fill(this.h, this.s, this.b, 10);
		ellipse(this.x, height / 2, this.w, this.y / 1.5);
	}
}

class Texture_MC {
	constructor() {
		this.x = random(0, width);
		this.y = random(0, height);
		this.w = random(0.1, 0.7) * M;
		this.b = random(100);
		this.a = random(2, 20);
	}

	display() {
		stroke(0, 0, this.b, this.a);
		strokeWeight(this.w);
		noFill();
		rect(this.x, this.y, this.w, this.w);
	}
}
