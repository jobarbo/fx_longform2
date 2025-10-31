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
let isBordered = false;
let mainCanvas; // P2D canvas for sketch drawing
let shaderCanvas; // WEBGL canvas for shader effects
let sketchComplete = false;
let generator; // Animation generator instance
let maxFrames = 100;
let startTime;

function preload() {
	// Initialize shader effects system
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.preload(this);
	}
}

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	let formatMode = features.format_mode;
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// Set canvas dimensions
	const canvasWidth = 12 * 100;
	const canvasHeight = 12 * 100;

	// if Safari mobile or any smartphone browser, use pixelDensity(0.5) to make the canvas bigger, else use pixelDensity(3.0)
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		pixelDensity(1);
	} else {
		pixelDensity(2);
	}

	// Create WEBGL canvas for shader effects (this will be the visible canvas)
	shaderCanvas = createCanvas(canvasWidth, canvasHeight, WEBGL);

	// Create P2D graphics buffer for sketch drawing (main canvas)
	mainCanvas = createGraphics(canvasWidth, canvasHeight);
	mainCanvas.colorMode(HSB, 360, 100, 100, 100);

	// Set pixel density for main canvas
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		mainCanvas.pixelDensity(1);
	} else {
		mainCanvas.pixelDensity(2);
	}

	// Initialize shader effects system
	if (typeof shaderEffects !== "undefined") {
		shaderEffects.setup(canvasWidth, canvasHeight, mainCanvas, shaderCanvas);
	}

	colorMode(HSB, 360, 100, 100, 100);
	seed = random(10000000);
	randomSeed(seed);

	startTime = frameCount;
	INIT(seed);

	// Calculate cycle length based on number of movers and max frames
	// Adjust cycle for smoother percentage updates (1% increments)
	let particleNum = movers.length;
	let cycle = parseInt((maxFrames * particleNum) / 1150);

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		renderItem: (mover, currentFrame) => {
			if (currentFrame > -1) {
				mainCanvas.fill(mover.hue, mover.sat, mover.bri, mover.a);
				mainCanvas.noStroke();
				mainCanvas.circle(mover.x, mover.y, mover.s);
			}
		},
		moveItem: (mover, currentFrame) => {
			mover.move();
		},
		onComplete: () => {
			sketchComplete = true;
			console.log("done");

			if (typeof shaderEffects !== "undefined" && shaderCanvas) {
				shaderEffects.setParticleAnimationComplete(true);
			}
		},
	};

	// Create the animation generator
	generator = createAnimationGenerator(animConfig);

	// Disable p5.js default draw loop
	noLoop();

	// Start the custom draw loop
	customDraw();
}

/**
 * Custom draw loop - advances sketch animation and applies shader effects
 * This replaces the p5.js draw() loop and uses the generator pattern
 */
function customDraw() {
	// Advance the generator
	const result = generator.next();

	// Render shader effects for this frame (if shaders are enabled)
	if (typeof shaderEffects !== "undefined" && shaderCanvas) {
		const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);

		// Continue animation if not complete
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		// No shaders - just copy mainCanvas to main display canvas
		clear();
		image(mainCanvas, -width / 2, -height / 2);

		/* // If FPS overlay is available, update/draw it even without shaders
		if (typeof shaderEffects !== "undefined") {
			shaderEffects.updateFPS();
			shaderEffects.drawFPS();
		} */

		// Continue animation if not complete
		if (!result.done) {
			requestAnimationFrame(customDraw);
		}
	}
}
/* function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(seed);
}
 */
function INIT(seed) {
	movers = [];
	scl1 = random([0.0035]);
	scl2 = random([0.0025]);
	scl3 = random([0.005]);

	let hue = random(360);

	let sclOffset1 = random([1]);
	let sclOffset2 = random([3]);
	let sclOffset3 = random([2]);

	console.log("sclOffset1", sclOffset1);
	console.log("sclOffset2", sclOffset2);
	console.log("sclOffset3", sclOffset3);

	console.log("scl1", scl1);
	console.log("scl2", scl2);
	console.log("scl3", scl3);

	xMin = -0.01;
	xMax = 1.01;
	yMin = 0.85;
	yMax = 1;
	/* 	xMin = -0.01;
	xMax = 1.01;
	yMin = -0.01;
	yMax = 1.01; */

	// Use mainCanvas dimensions if available, otherwise use global width/height
	const canvasWidth = mainCanvas ? mainCanvas.width : width;
	const canvasHeight = mainCanvas ? mainCanvas.height : height;

	for (let i = 0; i < 42000; i++) {
		// distribue the movers within a circle using polar coordinates
		/* 		let r = randomGaussian(4, 2);
		let theta = random(0, TWO_PI);
		let x = canvasWidth / 2 + r * cos(theta) * 50;
		let y = canvasHeight / 2 + r * sin(theta) * 50; */

		let x = random(xMin, xMax) * canvasWidth;
		let y = random(yMin, yMax) * canvasHeight;

		//let hueOffset = map(x, xMin * canvasWidth, xMax * canvasWidth, -10, 10);
		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, seed));
	}
	let bgCol = spectral.mix("#000", "#fff", 0.938);
	// Set background on main canvas if it exists, otherwise use default canvas
	if (mainCanvas) {
		mainCanvas.background(bgCol);
	} else {
		background(bgCol);
	}
}
