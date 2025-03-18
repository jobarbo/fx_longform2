let features = "";
let movers = [];
let startTime;
let maxFrames = 25;
let elapsedTime = 0;
let particleNum = 500000;
// Adjust cycle for smoother percentage updates (1% increments)
let cycle = parseInt((maxFrames * particleNum) / 1170);
let executionTimer = new ExecutionTimer();

// Shader variables
let shaderCanvas;
let myShader;
let mainCanvas;

let scl1;
let scl2;
let scl3;
let ang1;
let ang2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let isBordered = true;

let img;
let mask;

// Base artwork dimensions (width: 948, height: 948 * 1.41)
let ARTWORK_RATIO = 1.41;
let BASE_WIDTH = 248;
let BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;

// This is our reference size for scaling
let DEFAULT_SIZE = BASE_WIDTH;

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

function preload() {
	// Load shaders
	myShader = loadShader("shaders/vertex.vert", "shaders/fragment.frag");
}

function setup() {
	console.log(features);
	features = $fx.getFeatures();
	startTime = frameCount;
	executionTimer.start();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);

	// Create main canvas for the artwork
	mainCanvas = createGraphics(DIM, DIM * ARTWORK_RATIO);
	// Create shader canvas
	shaderCanvas = createCanvas(DIM, DIM * ARTWORK_RATIO, WEBGL);

	// Set up the main canvas
	mainCanvas.pixelDensity(1);
	shaderCanvas.pixelDensity(1);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);

	// Set background for main canvas
	let bgCol = spectral.mix("#000", "#fff", 0.88);
	mainCanvas.background(bgCol);

	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;

	// Apply transformations to main canvas
	mainCanvas.push();
	mainCanvas.translate(mainCanvas.width / 2, mainCanvas.height / 2);
	mainCanvas.scale(1);
	mainCanvas.translate(-mainCanvas.width / 2, -mainCanvas.height / 2);
	mainCanvas.pop();

	INIT(rseed, nseed);

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		currentFrame: 0,
		renderItem: (mover, currentFrame) => {
			if (currentFrame > -1) {
				mover.show(mainCanvas);
			}
		},
		moveItem: (mover, currentFrame) => {
			mover.move(currentFrame, maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			$fx.preview();
			document.complete = true;
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(animConfig);
	startAnimation(generator);
}

function windowResized() {
	// Calculate new dimensions
	DIM = min(windowWidth, windowHeight);
	let w = DIM;
	let h = DIM * ARTWORK_RATIO;

	// Resize both canvases
	resizeCanvas(w, h);
	mainCanvas.resizeCanvas(w, h);

	// Recenter the WebGL canvas
	let x = (windowWidth - w) / 2;
	let y = (windowHeight - h) / 2;
	shaderCanvas.position(x, y);

	INIT(seed);
}

function INIT(rseed, nseed) {
	movers = [];

	// Scale noise values based on MULTIPLIER
	scl1 = 0.005 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.005 / MULTIPLIER;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;
	// Calculate padding based on the reference size and scale it
	let paddingRatioX = -0.05; // 45% padding for X axis
	let paddingRatioY = -0.05; // 45% padding for Y axis
	let basePaddingX = DEFAULT_SIZE * paddingRatioX;
	let basePaddingY = DEFAULT_SIZE * paddingRatioY;
	let paddingX = basePaddingX * MULTIPLIER;
	let paddingY = basePaddingY * MULTIPLIER;

	// Calculate bounds in absolute coordinates with equal padding
	let bounds = {
		left: paddingX,
		right: width - paddingX,
		top: paddingY,
		bottom: height - paddingY,
	};

	// Convert to relative coordinates
	xMin = bounds.left / width;
	xMax = bounds.right / width;
	yMin = bounds.top / height;
	yMax = bounds.bottom / height;

	let hue = random(360); // Define base hue for particles

	// Scale number of particles based on canvas size
	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed));
	}

	let bgCol = spectral.mix("#000", "#fff", 0.88);
	background(bgCol);
	//initGrid(0);
}

function draw() {
	// Clear the shader canvas
	clear();

	// Apply shader effects
	shader(myShader);

	// Pass uniforms to the shader
	myShader.setUniform("uTexture", mainCanvas);
	myShader.setUniform("uTime", millis() / 1000.0);
	myShader.setUniform("uResolution", [width, height]);

	// Draw a rectangle that covers the entire viewport
	push();
	noStroke();

	// Draw the quad with correct texture coordinates
	beginShape();
	// Format: vertex(x, y, z, textureU, textureV)
	vertex(-1, 1, 0, 0, 0); // top-left
	vertex(1, 1, 0, 1, 0); // top-right
	vertex(1, -1, 0, 1, 1); // bottom-right
	vertex(-1, -1, 0, 0, 1); // bottom-left
	endShape(CLOSE);

	pop();
}
