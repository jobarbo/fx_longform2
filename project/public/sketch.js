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

// Git data variables
let gitData = null;
let isDataLoaded = false;

// Add these variables at the top with other global variables
let MAX_DISPLAY_DEPTH = 10; // Adjustable depth limit
let START_FROM_BEGINNING = true; // Flag to determine direction
let branchColors = new Map(); // Map to store branch -> color
let nextHue = 0; // For generating new colors
let uniqueBranches = new Set(); // To track unique branches for the legend

class Node {
	constructor(x, y, isCommit = false, depth = 0, isMerge = false, branchLength = 100, message = "", branchName = "") {
		this.x = x;
		this.y = y;
		this.isCommit = isCommit;
		this.isMerge = isMerge;
		this.depth = depth;
		this.branchLength = branchLength;
		this.children = [];
		this.parents = [];
		this.message = message;
		this.branchName = branchName;
	}

	display() {
		push();
		strokeWeight(2);

		// Get color based on branch name or default to black
		if (this.branchName || (this.isCommit && this.message)) {
			const color = getBranchColor(this.branchName || "main");
			stroke(color.h, color.s, color.b);
			fill(color.h, color.s - 30, color.b + 15);
		} else {
			stroke(0);
			fill(255);
		}

		// Calculate sizes based on branch length
		let baseCircleSize = this.branchLength * 0.3;
		let baseSquareSize = this.branchLength * 0.2;
		let circleSize = constrain(baseCircleSize, 12, 30);
		let squareSize = constrain(baseSquareSize, 10, 20);

		// Draw based on whether this is a branch point (has multiple children)
		if (this.children.length > 1) {
			// Branch point - draw as circle
			ellipse(this.x, this.y, circleSize, circleSize);
		} else {
			// Regular commit - draw as square
			rectMode(CENTER);
			rect(this.x, this.y, squareSize, squareSize);
		}

		// Display commit message if it exists
		if (this.message) {
			noStroke();
			fill(0);
			textAlign(LEFT, CENTER);
			textSize(12);
			let displayMessage = this.message.length > 30 ? this.message.substring(0, 27) + "..." : this.message;
			text(displayMessage, this.x + squareSize + 5, this.y);
		}

		pop();
	}

	addChild(child) {
		this.children.push(child);
		child.parents.push(this);
	}
}

class Branch {
	constructor(start, end) {
		this.start = start;
		this.end = end;

		// Store branch name for coloring
		this.branchName = end.branchName || (end.isCommit ? "main" : null);

		// Calculate control points for curved line
		let dx = this.end.x - this.start.x;
		let dy = this.end.y - this.start.y;

		// Control points at 1/3 and 2/3 of the line with some offset
		this.ctrl1 = {
			x: this.start.x + dx / 3,
			y: this.start.y + dy / 3,
		};
		this.ctrl2 = {
			x: this.start.x + (2 * dx) / 3,
			y: this.start.y + (2 * dy) / 3,
		};

		// Create noise offsets for organic movement
		this.noiseOffsetX1 = random(1000);
		this.noiseOffsetY1 = random(1000);
		this.noiseOffsetX2 = random(1000);
		this.noiseOffsetY2 = random(1000);
	}

	display() {
		push();
		strokeWeight(2);

		// Use branch color
		if (this.branchName) {
			const color = getBranchColor(this.branchName);
			stroke(color.h, color.s, color.b);
		} else {
			stroke(0);
		}

		// Add subtle movement to control points
		let wobbleAmount = 1;
		let t = frameCount * 0.01;

		let offset1X = map(noise(this.noiseOffsetX1 + t), 0, 1, -wobbleAmount, wobbleAmount);
		let offset1Y = map(noise(this.noiseOffsetY1 + t), 0, 1, -wobbleAmount, wobbleAmount);
		let offset2X = map(noise(this.noiseOffsetX2 + t), 0, 1, -wobbleAmount, wobbleAmount);
		let offset2Y = map(noise(this.noiseOffsetY2 + t), 0, 1, -wobbleAmount, wobbleAmount);

		let currentCtrl1 = {
			x: this.ctrl1.x + offset1X,
			y: this.ctrl1.y + offset1Y,
		};
		let currentCtrl2 = {
			x: this.ctrl2.x + offset2X,
			y: this.ctrl2.y + offset2Y,
		};

		// Draw curved branch line
		noFill();
		beginShape();
		vertex(this.start.x, this.start.y);
		bezierVertex(currentCtrl1.x, currentCtrl1.y, currentCtrl2.x, currentCtrl2.y, this.end.x, this.end.y);
		endShape();
		pop();
	}
}

function preload() {
	// Load git log data before setup
	loadStrings("git-log.txt", function (lines) {
		console.log("Git log loaded, number of lines:", lines.length);
		gitData = parseGitLog(lines);
		console.log("Parsed git data, number of commits:", gitData.size);
		isDataLoaded = true;
	});
}

function parseGitLog(lines) {
	const commits = new Map();
	let branchNames = new Map(); // Map to store hash -> branch name
	let branchPositions = new Map(); // Map to track branch positions in the graph

	// First pass: analyze the graph structure and collect branch names
	lines.forEach((line, lineIndex) => {
		// Get commit hash
		const hashMatch = line.match(/[|* ]*([a-f0-9]+)/);
		if (!hashMatch) return;

		const hash = hashMatch[1];
		let branchName = null;

		// 1. Check for explicit branch names in parentheses
		if (line.includes("(")) {
			const branchMatch = line.match(/\((HEAD ->|->)?\s*([^),]+)/);
			if (branchMatch && branchMatch[2]) {
				branchName = branchMatch[2].replace(/^origin\//, "").trim();
			}
		}

		// 2. Check for merge commits
		if (line.includes("Merge")) {
			const mergeMatch = line.match(/Merge (branch|pull request) ['"]([^'"]+)['"]/);
			if (mergeMatch) {
				branchName = mergeMatch[2];
			}
		}

		// 3. Analyze graph structure
		const graphStructure = line.substring(0, line.indexOf("*"));
		const position = graphStructure.length;

		// If we don't have an explicit branch name, use the graph structure
		if (!branchName) {
			// Look ahead a few lines to see if this position has a branch name
			for (let i = lineIndex + 1; i < Math.min(lines.length, lineIndex + 5); i++) {
				const futureLine = lines[i];
				if (futureLine && futureLine.length > position) {
					const futureChar = futureLine[position];
					if (futureChar === "|") {
						// This is part of a continuing branch
						if (!branchPositions.has(position)) {
							branchName = `branch-${position}`;
							branchPositions.set(position, branchName);
						} else {
							branchName = branchPositions.get(position);
						}
						break;
					}
				}
			}
		}

		// Store the branch name
		if (branchName) {
			branchNames.set(hash, branchName);
			if (position >= 0) {
				branchPositions.set(position, branchName);
			}
		}
	});

	// Second pass: create commits
	lines.forEach((line, index) => {
		const match = line.match(/[|* ]*([a-f0-9]+)\s+([a-f0-9 ]*?)\s+(.*)/);
		if (!match) return;

		const [_, hash, parents, message] = match;
		const parentHashes = parents
			.trim()
			.split(" ")
			.filter((h) => h);
		const depth = (line.match(/\|/g) || []).length;

		// Get branch name from our map or determine from structure
		let branchName = branchNames.get(hash);
		if (!branchName) {
			const starPosition = line.indexOf("*");
			if (starPosition >= 0) {
				branchName = branchPositions.get(starPosition) || `branch-${starPosition}`;
			}
		}

		commits.set(hash, {
			hash,
			parents: parentHashes,
			message: message.trim(),
			depth: depth,
			node: null,
			distanceFromRoot: 0,
			branchName: branchName || "main",
		});
	});

	// Calculate distances from root
	function calculateDistanceFromRoot(hash, visited = new Set()) {
		if (visited.has(hash)) return;
		visited.add(hash);

		const commit = commits.get(hash);
		if (!commit) return;

		if (commit.parents.length === 0) {
			commit.distanceFromRoot = 0;
		} else {
			let maxParentDistance = -1;
			commit.parents.forEach((parentHash) => {
				if (!visited.has(parentHash)) {
					calculateDistanceFromRoot(parentHash, visited);
				}
				const parent = commits.get(parentHash);
				if (parent) {
					maxParentDistance = Math.max(maxParentDistance, parent.distanceFromRoot);
				}
			});
			commit.distanceFromRoot = maxParentDistance + 1;
		}
	}

	// Find root commits and calculate distances
	const rootCommits = Array.from(commits.values())
		.filter((commit) => commit.parents.length === 0)
		.map((commit) => commit.hash);

	rootCommits.forEach((hash) => calculateDistanceFromRoot(hash));

	return commits;
}

function createCladogram() {
	if (!gitData) {
		console.log("No git data available");
		return;
	}

	nodes = [];
	branches = [];
	branchColors.clear(); // Reset colors on each creation
	uniqueBranches.clear(); // Clear unique branches set

	const commits = Array.from(gitData.values());
	const firstCommit = commits.find((commit) => commit.parents.length === 0);

	if (firstCommit) {
		// Start with the first commit
		let currentNode = new Node(width / 2, height / 4, true, 0, false, 100, firstCommit.message, firstCommit.branchName);
		nodes.push(currentNode);
		console.log("Created first node with branch:", firstCommit.branchName);

		// Process subsequent commits
		let processedHashes = new Set([firstCommit.hash]);
		let depth = 1;

		while (depth <= MAX_DISPLAY_DEPTH) {
			let nextCommits = commits.filter((commit) => !processedHashes.has(commit.hash) && commit.parents.some((parentHash) => processedHashes.has(parentHash)));

			if (nextCommits.length === 0) break;

			// Sort commits by branch name to group them
			nextCommits.sort((a, b) => (a.branchName || "").localeCompare(b.branchName || ""));

			let xOffset = -((nextCommits.length - 1) * 100) / 2;
			nextCommits.forEach((commit, index) => {
				let x = width / 2 + xOffset + index * 100;
				let y = height / 4 + depth * 100;

				// Create branch node if this is a new branch
				if (commit.branchName && commit.branchName !== "") {
					let branchNode = new Node(x, y - 50, false, depth, false, 100, "", commit.branchName);
					nodes.push(branchNode);

					// Find parent node to connect branch
					let parentCommit = commits.find((c) => c.hash === commit.parents[0]);
					if (parentCommit) {
						let parentNode = nodes.find((n) => n.message.includes(parentCommit.message));
						if (parentNode) {
							branches.push(new Branch(parentNode, branchNode));
						}
					}
				}

				// Create commit node
				let commitNode = new Node(x, y, true, depth, commit.parents.length > 1, 100, commit.message);
				nodes.push(commitNode);

				// Connect to parent commits
				commit.parents.forEach((parentHash) => {
					let parentCommit = commits.find((c) => c.hash === parentHash);
					if (parentCommit) {
						let parentNode = nodes.find((n) => n.message.includes(parentCommit.message));
						if (parentNode) {
							branches.push(new Branch(parentNode, commitNode));
						}
					}
				});

				processedHashes.add(commit.hash);

				if (commit.branchName) {
					uniqueBranches.add(commit.branchName);
				}
			});

			depth++;
		}
	}
}

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM * 1, DIM * 2);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	angleMode(DEGREES);
	background(50, 10, 100);

	console.log("Canvas created with dimensions:", DIM, DIM * RATIO);

	// Initialize cladogram
	createCladogram();
}

function draw() {
	if (!isDataLoaded) {
		console.log("Waiting for data to load...");
		return;
	}

	background(50, 10, 100);

	// Draw branches first
	branches.forEach((branch) => branch.display());

	// Draw nodes on top
	nodes.forEach((node) => node.display());

	// Draw the branch legend
	drawBranchLegend();
}

// Add error handling for loadStrings
window.addEventListener("error", function (e) {
	console.error("Error loading git-log.txt:", e);
});

// Add keyboard controls to adjust depth
function keyPressed() {
	if (keyCode === UP_ARROW) {
		MAX_DISPLAY_DEPTH = Math.min(MAX_DISPLAY_DEPTH + 1, 30);
		createCladogram();
	} else if (keyCode === DOWN_ARROW) {
		MAX_DISPLAY_DEPTH = Math.max(MAX_DISPLAY_DEPTH - 1, 1);
		createCladogram();
	}
}

// Helper function to get a color for a branch
function getBranchColor(branchName) {
	if (!branchColors.has(branchName)) {
		// Create a new color with good saturation and brightness
		const hue = (branchColors.size * 137.5) % 360; // Golden ratio angle
		branchColors.set(branchName, {
			h: hue,
			s: 70,
			b: 85,
		});
		console.log("Created new color for branch:", branchName, "hue:", hue);
	}
	return branchColors.get(branchName);
}

// Add this new function to draw the branch legend
function drawBranchLegend() {
	const padding = 20;
	const lineHeight = 25;
	const boxSize = 15;
	const textOffset = 25;

	push();
	// Position in top right corner
	translate(width - 200 - padding, padding);

	// Draw background
	fill(255, 255, 255, 200);
	stroke(0);
	strokeWeight(1);
	rect(0, 0, 200, (uniqueBranches.size + 1) * lineHeight);

	// Draw title
	noStroke();
	fill(0);
	textAlign(LEFT, TOP);
	textSize(14);
	text("Branches:", 10, 10);

	// Draw branch entries
	let y = lineHeight;
	Array.from(uniqueBranches)
		.sort()
		.forEach((branchName) => {
			const color = getBranchColor(branchName);

			// Draw color box
			stroke(color.h, color.s, color.b);
			fill(color.h, color.s - 30, color.b + 15);
			rect(10, y + 2, boxSize, boxSize);

			// Draw branch name
			noStroke();
			fill(0);
			textAlign(LEFT, CENTER);
			textSize(12);
			text(branchName, 10 + boxSize + textOffset, y + boxSize / 2);

			y += lineHeight;
		});
	pop();
}
