let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

// Cladogram variables
let startNode;
let nodes = [];
let branches = [];

class Node {
	constructor(x, y, isCommit = false, depth = 0) {
		this.x = x;
		this.y = y;
		this.isCommit = isCommit;
		this.depth = depth;
		this.children = [];
		this.parent = null;
	}

	display() {
		push();
		stroke(0);
		strokeWeight(2);
		fill(255);

		// Calculate sizes based on depth
		// Start with larger sizes and reduce by each level
		let baseCircleSize = 30;
		let baseSquareSize = 20;
		let squareReductionPerLevel = 4;
		let circleReductionPerLevel = 6;

		// Ensure minimum sizes
		let circleSize = max(baseCircleSize - this.depth * circleReductionPerLevel, 8);
		let squareSize = max(baseSquareSize - this.depth * squareReductionPerLevel, 6);

		if (this.isCommit) {
			rectMode(CENTER);
			rect(this.x, this.y, squareSize, squareSize);
		} else {
			ellipse(this.x, this.y, circleSize, circleSize);
		}
		pop();
	}

	addChild(child) {
		this.children.push(child);
		child.parent = this;
	}
}

class Branch {
	constructor(start, end) {
		this.start = start;
		this.end = end;
		this.commits = [];

		// Generate control points for wobbly effect
		let dx = this.end.x - this.start.x;
		let dy = this.end.y - this.start.y;
		let distance = dist(this.start.x, this.start.y, this.end.x, this.end.y);

		// Create noise offsets for control points
		this.noiseOffsetX1 = random(1000);
		this.noiseOffsetY1 = random(1000);
		this.noiseOffsetX2 = random(1000);
		this.noiseOffsetY2 = random(1000);

		// Calculate control points with some perpendicular offset
		let perpX = -dy / distance; // Perpendicular vector
		let perpY = dx / distance;

		// Control points at 1/3 and 2/3 of the line
		this.ctrl1 = {
			x: this.start.x + dx / 3,
			y: this.start.y + dy / 3,
		};
		this.ctrl2 = {
			x: this.start.x + (2 * dx) / 3,
			y: this.start.y + (2 * dy) / 3,
		};

		// Store commit positions as ratios (0-1) along the curve
		this.commitRatios = [];
		let numCommits = floor(random(0, 4));
		for (let i = 1; i <= numCommits; i++) {
			this.commitRatios.push(i / (numCommits + 1));
		}
	}

	display() {
		push();
		stroke(0);
		strokeWeight(2);

		// Update control points with noise
		let wobbleAmount = 55;
		let t = frameCount * 0.01;

		let offset1X = map(noise(this.noiseOffsetX1 + t), 0, 1, -wobbleAmount, wobbleAmount);
		let offset1Y = map(noise(this.noiseOffsetY1 + t), 0, 1, -wobbleAmount, wobbleAmount);
		let offset2X = map(noise(this.noiseOffsetX2 + t), 0, 1, -wobbleAmount, wobbleAmount);
		let offset2Y = map(noise(this.noiseOffsetY2 + t), 0, 1, -wobbleAmount, wobbleAmount);

		// Current control points with noise
		let currentCtrl1 = {
			x: this.ctrl1.x + offset1X,
			y: this.ctrl1.y + offset1Y,
		};
		let currentCtrl2 = {
			x: this.ctrl2.x + offset2X,
			y: this.ctrl2.y + offset2Y,
		};

		// Draw curved line
		noFill();
		beginShape();
		vertex(this.start.x, this.start.y);
		bezierVertex(currentCtrl1.x, currentCtrl1.y, currentCtrl2.x, currentCtrl2.y, this.end.x, this.end.y);
		endShape();

		// Update and draw commits along the curve using current control points
		this.commits = []; // Clear existing commits
		for (let t of this.commitRatios) {
			let x = bezierPoint(this.start.x, currentCtrl1.x, currentCtrl2.x, this.end.x, t);
			let y = bezierPoint(this.start.y, currentCtrl1.y, currentCtrl2.y, this.end.y, t);
			let commit = new Node(x, y, true, this.end.depth);
			this.commits.push(commit);
			commit.display();
		}
		pop();
	}
}

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 10, 100);

	// Initialize cladogram
	createCladogram();
}

function createCladogram() {
	// Create starting node at the center (depth 0)
	startNode = new Node(width / 2, height / 2, false, 0);
	nodes.push(startNode);

	// Create initial branches spreading in all directions
	let numInitialBranches = floor(random(4, 7));

	// Random starting angle for the first branch
	let startingAngle = random(0, 360);

	let angles = [];
	let angleStep = 360 / numInitialBranches;

	for (let i = 0; i < numInitialBranches; i++) {
		angles.push(startingAngle + i * angleStep);
	}

	// Create branches at calculated angles
	for (let angle of angles) {
		createBranch(startNode, 3, angle, 200, angle - 15, angle + 15, true);
	}
}

function createBranch(parent, depth, startAngle, length, minAngle, maxAngle, isInitialBranch = false) {
	if (depth <= 0) return;

	if (isInitialBranch) {
		let endX = parent.x + cos(startAngle) * length;
		let endY = parent.y + sin(startAngle) * length;

		// Create end node with depth 1
		let newNode = new Node(endX, endY, false, 1);
		nodes.push(newNode);
		parent.addChild(newNode);

		branches.push(new Branch(parent, newNode));

		if (depth > 1) {
			createBranch(newNode, depth - 1, startAngle, length * 0.8, startAngle - 25, startAngle + 25, false);
		}
	} else {
		let numBranches = floor(random(1, 4));

		// Reduce angle variation based on depth
		let baseVariation = 30;
		let reductionPerLevel = 8;
		let maxDepth = 3;
		let angleVariation = max(baseVariation - (maxDepth - depth) * reductionPerLevel, 5);

		for (let i = 0; i < numBranches; i++) {
			let angleOffset = map(i, 0, numBranches - 1, -angleVariation, angleVariation);
			let angle = startAngle + angleOffset;

			let endX = parent.x + cos(angle) * length;
			let endY = parent.y + sin(angle) * length;

			// Create new node with incremented depth
			let newNode = new Node(endX, endY, false, parent.depth + 1);
			nodes.push(newNode);
			parent.addChild(newNode);

			branches.push(new Branch(parent, newNode));

			if (depth > 1) {
				createBranch(newNode, depth - 1, angle, length * 0.8, angle - angleVariation / 2, angle + angleVariation / 2, false);
			}
		}
	}
}

function draw() {
	background(50, 10, 100);

	// Draw all branches first
	for (let branch of branches) {
		branch.display();
	}

	// Draw all nodes on top
	for (let node of nodes) {
		node.display();
	}

	noLoop();
}
