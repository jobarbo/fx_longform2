let features = '';

let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let hueArr = [];
let hue;
let hueCount = {};

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * 1.375);
	dpi(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	background(0, 20, 100);

	// after 1000 frames, stop the sketch and sort the hueArr by the hue value that was the most common in the sketch
	// Run the sketch for 1000 frames
	for (let i = 0; i < 300; i++) {
		// Generate a new hue value and store it
		hue = parseInt(fxrand() * 360);
		background(hue, 20, 100);
		hueArr.push(hue);
	}

	// Count the occurrences of each hue value
	hueArr.forEach((hue) => {
		hueCount[hue] = (hueCount[hue] || 0) + 1;
	});

	// Convert object to array of [hue, frequency] pairs
	let hueCountArray = Object.entries(hueCount);

	// Sort by frequency in descending order
	hueCountArray.sort((a, b) => b[1] - a[1]);

	// Define canvas settings for grid display
	let cols = 10; // Number of columns in the grid
	let rows = Math.ceil(hueCountArray.length / cols); // Calculate rows based on the number of hues

	// Set the canvas size to display a grid of colored squares
	let squareSize = 40; // Adjust the size of each square as needed
	let canvasWidth = cols * squareSize;
	let canvasHeight = rows * squareSize;
	createCanvas(canvasWidth, canvasHeight);

	// Display the grid of colored squares
	for (let i = 0; i < hueCountArray.length; i++) {
		let x = (i % cols) * squareSize;
		let y = Math.floor(i / cols) * squareSize;
		let hueValue = hueCountArray[i][0];
		let frequency = hueCountArray[i][1];
		fill(hueValue, 100, 100);
		rect(x, y, squareSize, squareSize);

		// Display the frequency at the center of the square
		fill(0); // Set text color to black
		textSize(12); // Adjust text size as needed
		textAlign(CENTER, CENTER);
		text(frequency, x + squareSize / 2, y + squareSize / 2);
	}

	// Output sorted hue frequencies
	console.log(hueCountArray);
}

function draw() {}
