let features = '';

let MARGIN = 0.1;
let RATIO = 1;
let DEFAULT_SIZE = 3600;
let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

let minY = 0;
let maxY = 0;
let minX = 0;
let maxX = 0;
let recWidth = 0;
let recHeight = 0;
let halfWidth = 0;
let halfHeight = 0;

let points = [];

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	dpi(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	// background
	background(40, 15, 100);

	createEdge();

	createMountains();





}

function draw() {
	noLoop();
}


function createEdge(){
	 rectWidth = DIM * (1 - MARGIN);
   rectHeight = DIM * (1 - MARGIN);
   halfWidth = rectWidth / 2;
   halfHeight = rectHeight / 2;
  let cx = DIM / 2; // Center x-coordinate of the rectangle
  let cy = DIM / 2; // Center y-coordinate of the rectangle

  let numPoints = 2100; // Adjust this number for more or fewer points

  // Generate points on each edge of the rectangle
  for (let i = 0; i < numPoints; i++) {
    // Top edge
    let tx = random(-halfWidth, halfWidth) + cx;
    let ty = -halfHeight + cy;
    points.push(createVector(tx, ty));

    // Right edge
    let rx = halfWidth + cx;
    let ry = random(-halfHeight, halfHeight) + cy;
    points.push(createVector(rx, ry));

    // Bottom edge
    let bx = random(-halfWidth, halfWidth) + cx;
    let by = halfHeight + cy;
    points.push(createVector(bx, by));

    // Left edge
    let lx = -halfWidth + cx;
    let ly = random(-halfHeight, halfHeight) + cy;
    points.push(createVector(lx, ly));
  }

	// minx, miny, maxx, maxy are the bounds considering the margin
	minX = -halfWidth + cx;
	minY = -halfHeight + cy;
	maxX = halfWidth + cx;
	maxY = halfHeight + cy;
	let widthX = maxX - minX;
	let widthY = maxY - minY;

	stroke(150, 100, 100);
	strokeWeight(8);
	point(minX, minY);
	point(minX, maxY);
	point(maxX, minY);
	point(maxX, maxY);
	stroke(0, 100, 100);
	strokeWeight(8);
	point(widthX + minX, widthY + minY);

	console.log(minX, minY, maxX, maxY);

	// Rect that fits the canvas including margin * width
	rectMode(CENTER);
	noFill();
	stroke(0, 0, 0);
	strokeWeight(2);
	// rect corners radius
	let r = DIM * MARGIN / 12;
	rect(DIM / 2, DIM / 2, DIM * (1 - MARGIN), DIM * (1 - MARGIN), r, r, r, r);
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    let pointSize = random(2, 6); // Adjust the size of the points
    fill(0,0,0); // Adjust the color of the points
    noStroke();
    ellipse(point.x, point.y, pointSize, pointSize);
  }
}

function createMountains(){


	let mtnBaseArray = [rectHeight/2,rectHeight/1.5, rectHeight];
	let mtnHeightArray = [rectHeight/4, rectHeight/7];
	let mtnMaxY = random(mtnHeightArray);
	let mtnBaseY = random(mtnBaseArray);
	let mtnMidY = random(mtnBaseY, mtnMaxY);




	strokeWeight(3);
	stroke(0,0,0);
	point(width/2, mtnMaxY);
	point(width/2, mtnBaseY);
	point(width/2, mtnMidY);

	// create the mountain shape
	fill(0,0,0);
	beginShape();
	vertex(minX, mtnMidY);
	vertex(width/2, mtnMaxY);
	vertex(maxX, mtnMidY);
	vertex(maxX, mtnBaseY);
	vertex(minX, mtnBaseY);

	endShape(CLOSE);



}