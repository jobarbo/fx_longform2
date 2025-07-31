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

console.log(DEFAULT_SIZE);

// Helper function to truncate multiplier calculations to 2 decimals
function truncateMultiplier(value, decimals = 2) {
	return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

let movers = [];
let numMovers = 50;

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	const screenRatio = window.innerWidth / window.innerHeight;
	const baseRatio = BASE_WIDTH / BASE_HEIGHT;
	MULTIPLIER = screenRatio < baseRatio ? window.innerWidth / BASE_WIDTH : window.innerHeight / BASE_HEIGHT;

	c = createCanvas(BASE_WIDTH * MULTIPLIER, BASE_HEIGHT * MULTIPLIER);
	pixelDensity(dpi(5));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 10, 10);

	// Create movers using fixed coordinate system
	for (let i = 0; i < numMovers; i++) {
		const x = random(BASE_WIDTH) - BASE_WIDTH * 0.5;
		const y = random(BASE_HEIGHT) - BASE_HEIGHT * 0.5;
		movers.push(new Mover(x, y, random(1000)));
	}
}

function draw() {
	scale(MULTIPLIER);
	translate(BASE_WIDTH * 0.5, BASE_HEIGHT * 0.5);

	// Update and display all movers
	for (let mover of movers) {
		mover.update(frameCount);
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
			if (d < 100) {
				// Fixed distance, no multiplier
				line(pos1.x, pos1.y, pos2.x, pos2.y);
			}
		}
	}
}
