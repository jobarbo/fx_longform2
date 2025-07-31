let features = "";

let maxDPI = 3;
let RATIO = 1;

// Base artwork dimensions (width: 948, height: 948 * 1.41)
let ARTWORK_RATIO = 1.25;
let BASE_WIDTH = 948;
let BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;

// This is our reference size for scaling
let DEFAULT_SIZE = max(BASE_WIDTH, BASE_HEIGHT);

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

// Helper function to truncate multiplier calculations to 2 decimals
function truncateMultiplier(value, decimals = 2) {
	return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

let movers = [];
let numMovers = 50;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 10, 10);

	// Create movers using fixed coordinate system
	for (let i = 0; i < numMovers; i++) {
		// Use fixed reference coordinates that don't depend on screen size
		let x = random(-width / 2, width / 2);
		let y = random(-height / 2, height / 2);
		let noiseOffset = random(1000);
		movers.push(new Mover(x, y, noiseOffset, MULTIPLIER)); // Fixed multiplier of 1
	}
}

function draw() {
	translate(width / 2, height / 2);

	// Update and display all movers
	for (let mover of movers) {
		mover.update();
		mover.display(); // Fixed size, no multiplier
	}

	// Draw connections between nearby movers
	stroke(0, 0, 100, 30);
	strokeWeight(1 * MULTIPLIER); // Fixed stroke weight, no multiplier
	for (let i = 0; i < movers.length; i++) {
		for (let j = i + 1; j < movers.length; j++) {
			let pos1 = movers[i].getPos();
			let pos2 = movers[j].getPos();
			let d = dist(pos1.x, pos1.y, pos2.x, pos2.y);
			if (d < 100 * MULTIPLIER) {
				// Fixed distance, no multiplier
				line(pos1.x, pos1.y, pos2.x, pos2.y);
			}
		}
	}
}
