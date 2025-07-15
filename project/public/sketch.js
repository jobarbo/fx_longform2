//let config_type = parseInt(fxrand() * 3 + 1);
let config_type = 1;
console.log(config_type);

let features = "";
let movers = [];
let scl1;
let scl2;
let ang1;
let ang2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let startTime;
let maxFrames = 800; //! can be 1000
let C_WIDTH;
let MULTIPLIER;
let RATIO = window.innerWidth / window.innerHeight;
RATIO = 1.25;
console.log(RATIO);

let centerX;
let centerY;
let borderX;
let borderY;

// Shader variables
let shaderCanvas;
let myShader;
let mainCanvas;

let animation;
let drawing = true;
let elapsedTime = 0;
let renderStart = Date.now();
let framesRendered = 0;
let totalElapsedTime = 0;

// Add shader animation variables
let shaderTime = 0;
let shaderIntensity = 0.01;
let waveSpeed = 1.0;

// Add a flag to track if the main particle animation should continue
let particleAnimationComplete = false;

({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i));

function preload() {
	// Initialize the shader manager
	shaderManager.init(this);

	// Set default vertex shader
	shaderManager.setDefaultVertex("chromatic-aberration/vertex.vert");

	// Load the shader we need
	shaderManager.loadShader("chromatic", "chromatic-aberration/fragment.frag");

	// For backward compatibility, still assign to myShader
	myShader = shaderManager.shaders["chromatic"];
}

function setup() {
	features = $fx.getFeatures();
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	if (iOSSafari) {
		pixelDensity(1.0);
	} else {
		pixelDensity(3.0);
	}

	C_WIDTH = min(windowWidth, windowHeight);
	MULTIPLIER = C_WIDTH / 1200;

	// Create main canvas for the artwork
	mainCanvas = createGraphics(C_WIDTH, C_WIDTH * RATIO);
	// Create shader canvas for the WEBGL renderer
	shaderCanvas = createCanvas(C_WIDTH, C_WIDTH * RATIO, WEBGL);

	// Set up the rendering properties
	mainCanvas.pixelDensity(3);
	shaderCanvas.pixelDensity(3);

	mainCanvas.rectMode(CENTER);
	rseed = randomSeed(fxrand() * 10000);
	nseed = noiseSeed(fxrand() * 10000);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);
	startTime = frameCount;
	//noCursor();

	centerX = mainCanvas.width / 2;
	centerY = mainCanvas.height / 2;
	borderX =
		features.composition === "compressed"
			? mainCanvas.width / 3.5
			: features.composition === "constrained"
			? mainCanvas.width / 3
			: features.composition === "semiconstrained"
			? mainCanvas.width / 2.35
			: mainCanvas.width / 1.9;
	borderY =
		features.composition === "compressed"
			? mainCanvas.height / 2.75
			: features.composition === "constrained"
			? mainCanvas.height / 2.5
			: features.composition === "semiconstrained"
			? mainCanvas.height / 2.25
			: mainCanvas.height / 1.9;

	// Set background for main canvas
	let bgCol = color(220, 100, 5);
	mainCanvas.background(bgCol);

	INIT(rseed);
}

function draw() {
	// Draw to the main canvas first
	if (!particleAnimationComplete) {
		mainCanvas.push();
		mainCanvas.blendMode(SCREEN);
		for (let i = 0; i < movers.length; i++) {
			movers[i].show(mainCanvas);
			movers[i].move();
		}
		mainCanvas.blendMode(BLEND);
		mainCanvas.noFill();
		mainCanvas.strokeWeight(0.1 * MULTIPLIER);
		mainCanvas.stroke(0, 0, 100, 100);
		mainCanvas.pop();
	}

	// Update shader animation parameters
	shaderTime += 0.01 * waveSpeed;

	// If particle animation is complete, make shader effect more pronounced
	if (particleAnimationComplete) {
		shaderIntensity = map(sin(frameCount * 0.01), -1, 1, 0.01, 0.03);
		waveSpeed = map(cos(frameCount * 0.005), -1, 1, 0.5, 1.5);
	}

	// Now apply the shader to the main canvas
	// Clear the shader canvas
	clear();

	// Apply the shader effect using the manager
	// Continue to animate shader with updated time even after particle animation stops
	shaderManager
		.apply("chromatic", {
			uTexture: mainCanvas,
			uTime: shaderTime,
			uResolution: [width, height],
			uIntensity: shaderIntensity, // Custom intensity uniform
			uWaveSpeed: waveSpeed, // Custom wave speed uniform
		})
		.drawFullscreenQuad();

	let elapsedTime = frameCount - startTime;
	showLoadingBar(elapsedTime, maxFrames, renderStart);

	if (elapsedTime > maxFrames && !particleAnimationComplete) {
		window.rendered = mainCanvas.canvas;
		document.complete = true;
		particleAnimationComplete = true;
		console.log("Particle animation complete, shader animation continues");
		// Don't call noLoop() - let the draw function continue for shader effects
	}
}

function INIT(seed) {
	scl1 = random([0.0021]);
	scl2 = scl1;

	ang1 = 1;
	ang2 = 1;

	xRandDivider = random([0.08, 0.09, 0.1, 0.11, 0.12]);
	yRandDivider = xRandDivider;
	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01;

	let hue = random(360);
	for (let i = 0; i < 20000; i++) {
		let x = random(xMin, xMax) * mainCanvas.width;
		let y = random(yMin, yMax) * mainCanvas.height;
		let initHue = hue + random(-1, 1);
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1 / MULTIPLIER, scl2 / MULTIPLIER, ang1 * MULTIPLIER, ang2 * MULTIPLIER, xMin, xMax, yMin, yMax, xRandDivider, yRandDivider, seed, features));
	}

	bgCol = color(random(0, 360), random([0, 2, 5]), features.theme == "bright" ? 93 : 5, 100);
	mainCanvas.background(220, 100, 5);
}

function showLoadingBar(elapsedTime, MAX_FRAMES, renderStart) {
	framesRendered++;
	let currentTime = Date.now();
	totalElapsedTime = currentTime - renderStart;

	let percent = (elapsedTime / MAX_FRAMES) * 100;
	if (percent > 100) percent = 100;

	let averageFrameTime = totalElapsedTime / framesRendered;

	let remainingFrames = MAX_FRAMES - framesRendered;
	let estimatedTimeRemaining = averageFrameTime * remainingFrames;

	// Convert milliseconds to seconds
	let timeLeftSec = Math.round(estimatedTimeRemaining / 1000);

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + "%";
	// show a loading bar on the bottom of the canvas
}

function windowResized() {
	// Calculate new dimensions
	C_WIDTH = min(windowWidth, windowHeight);
	let w = C_WIDTH;
	let h = C_WIDTH * RATIO;

	// Resize both canvases
	resizeCanvas(w, h);
	mainCanvas.resizeCanvas(w, h);

	// Recenter the WebGL canvas
	let x = (windowWidth - w) / 2;
	let y = (windowHeight - h) / 2;
	shaderCanvas.position(x, y);
}
