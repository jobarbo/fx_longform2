let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let vehicles = [];

function setup() {
	console.time('setup');
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(2.0);
	}

	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM);
	background(0);

	for (let index = 0; index < 1000; index++) {
		vehicles[index] = new Vehicle(random(width), random([0, height]));
	}
}

function draw() {
	//background(0);
	fill(255, 0, 0);
	noStroke();

	target = createVector(mouseX, mouseY);
	//circle(target.x, target.y, 20);
	blendMode(ADD);
	for (let vehicle of vehicles) {
		vehicle.seek(target);
		vehicle.update();
		vehicle.show();
	}
	blendMode(BLEND);
}
