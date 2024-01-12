let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let graphicsArray = [];
let cols = 4;
let rows = 4;
let cellSize = 350;
let angleArray = [0,90,180,270];
let configNum = 10;
let angle = 0;
let margin = 0;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	//imageMode(CENTER)
	pixelDensity(dpi(6));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	angleMode(DEGREES);
	//rectMode(CENTER);


	INIT();
}


function INIT() {

	background(40, 10, 100);
	margin = 0;
	cellSize = (width - margin * 2) / 14;
	cols = int((width-margin) / cellSize);
	rows = int((height-margin) / cellSize);
	console.log(cols, rows)

	let letter = random(['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P', 'Q','R','S','T','U','V','W','X','Y','Z']);

	
	let index = 0;
	let bgHue = random(0, 360);
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
		let angle_index = int(random(angleArray.length));

		let x = (width - cols * cellSize) / 2 + i * cellSize ;
		let y = (height - rows * cellSize) / 2 + j * cellSize ;

		graphicsArray[index] = createGraphics(cellSize, cellSize);
		graphicsArray[index].angleMode(DEGREES);
		graphicsArray[index].displayDensity(2);
		graphicsArray[index].colorMode(HSB, 360, 100, 100, 100);
	
		graphicsArray[index].background(bgHue, 30, 85, 100);


		// Apply rotation directly to the graphics object before drawing the 'A'
		graphicsArray[index].push();
		graphicsArray[index].translate(cellSize / 2, cellSize / 2);
		graphicsArray[index].rotate(angleArray[angle_index]);
		// make the fill always complemantary to the background
		graphicsArray[index].fill((bgHue + 180) % 360, 30, 35, 100);
		graphicsArray[index].noStroke();
		// draw a triangle with a point on the bottom left corner, the top right corner, and the top left corner
		graphicsArray[index].triangle(-cellSize / 2, cellSize / 2, cellSize / 2, -cellSize / 2, -cellSize / 2, -cellSize / 2);

		image(graphicsArray[index], x, y, cellSize+1, cellSize+1);
		stroke(0);
		strokeWeight(0);
		noFill();
		rect(x, y, cellSize, cellSize);
		index++;
		}
	}


}
