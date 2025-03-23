let features = "";

let DEFAULT_SIZE = 2600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let animation;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.33);
	pixelDensity(2);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	let seed = fxrand() * 10000;
	INIT(seed);

	// Setup animation with generator configuration
	blendMode(ADD);
	background(30, 5, 5);

	// Configure the animation generator
	const config = {
		items: movers,
		maxFrames: 100,
		startTime: 0,
		cycleLength: 1000, // Process 1000 items before yielding
		renderItem: (item) => {
			item.show();
		},
		moveItem: (item) => {
			item.move();
		},
		onComplete: () => {
			console.log("Animation completed");
			if (animation) {
				clearTimeout(animation);
			}
			// Any cleanup code

			exporting = true;
			if (!exporting && bleed > 0) {
				stroke(0, 100, 100);
				noFill();
				strokeWeight(10);
				rect(bleed, bleed, trimWidth, trimHeight);
			}
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(config);
	animation = startAnimation(generator);
}

function INIT(seed) {
	movers = [];
	scl1 = random(0.001, 0.001);
	scl2 = random(0.001, 0.001);
	a1 = int(random(777, 1100) * MULTIPLIER);
	a2 = int(random(777, 1100) * MULTIPLIER);
	let hue = random(360);
	for (let i = 0; i < 100000; i++) {
		let x = random(-0.1, 1.1) * width;
		let y = random(-0.1, 1.1) * height;
		movers.push(new Mover(x, y, hue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, a1, a2, seed));
	}
	background(30, 5, 5);
}
