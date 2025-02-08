let features = "";
let movers = [];
let startTime;
let maxFrames = 35;
let frameIterator = 0;
let currentFrame = 0;

let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;
let particleNum = 150000;
let drawing = true;
let renderMode = 1;
let cycle = parseInt((maxFrames * particleNum) / 1170);

let DEFAULT_SIZE = 2600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;
let frameCount = 0;

function setup() {
	console.log(features);
	features = $fx.getFeatures();
	elapsedTime = 0;
	framesRendered = 0;
	startTime = frameCount;
	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.41);
	pixelDensity(2);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	INIT();
	renderStart = Date.now();

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		renderItem: (mover) => mover.show(),
		moveItem: (mover, elapsedTime, maxFrames) => mover.move(elapsedTime, maxFrames),
		onComplete: () => {
			$fx.preview();
			document.complete = true;
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(animConfig);
	startAnimation(generator);
}

function INIT(seed) {
	movers = [];
	scl1 = random(0.000175, 0.001);
	scl2 = random(0.000175, 0.001);
	a1 = int(random(50, 400) * MULTIPLIER);
	a2 = int(random(50, 400) * MULTIPLIER);

	let hue = random(360);
	for (let i = 0; i < particleNum; i++) {
		let x = random(-0.1, 1.1) * width;
		let y = random(-0.1, 1.1) * height;
		movers.push(new Mover(x, y, hue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, a1, a2, seed));
	}

	background(35, 5, 100);
}
