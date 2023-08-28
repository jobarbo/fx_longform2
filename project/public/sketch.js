let features = '';
let shapesArr = [];
function preload() {}

function setup() {
	features = $fx.getFeatures();
	pixelDensity(dpi(3));
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	background(20, 30, 100, 100);

	for (let i = 0; i < 1; i++) {
		shapesArr.push(new CustomShape(width / 2, height / 2, 200, 12));
		shapesArr[i].display();
	}
}

function draw() {
	// put drawing code here
}

class CustomShape {
	constructor(x, y, r, node_num) {
		this.center = createVector(x, y);
		this.node_num = node_num;
		this.posOffset = random(1000000);
		this.debug_mode = false;
		this.radius = r;
	}

	display() {
		let nodes = [];
		let c_nodes = [];

		for (let i = 0; i < this.node_num; i++) {
			// distribute nodes evenly around the center
			// calculate the random offset for each node using noise

			let shape_radius = this.radius; // Adjust this value for the desired shape size
			let n = noise(this.posOffset);
			let offset = map(n, 0, 1, 0, shape_radius, true);

			let angle = map(i, 0, this.node_num, 0, TWO_PI);
			// make the nodes distribute evenly around the center with some being closer and some being further away from the center using noise

			let node = createVector(this.center.x + cos(angle) * offset, this.center.y + sin(angle) * offset);
			nodes.push(node);

			this.posOffset += 0.2;
		}

		// draw the shape
		stroke(0);
		strokeWeight();
		fill(180, 100, 40, 100);
		beginShape();
		curveVertex(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
		for (let i = 0; i < nodes.length; i++) {
			curveVertex(nodes[i].x, nodes[i].y);
		}
		curveVertex(nodes[0].x, nodes[0].y);
		curveVertex(nodes[1].x, nodes[1].y);

		endShape();

		if (this.debug_mode) {
			console.log(nodes.length);
			stroke(0, 100, 100);
			strokeWeight(1);
			noFill();
			circle(this.center.x, this.center.y, 10);
			for (let i = 0; i < nodes.length; i++) {
				let node = nodes[i];
				let c_node = c_nodes[i];

				stroke(0, 100, 100);
				line(this.center.x, this.center.y, node.x, node.y);
				stroke(0, 0, 100);
				noFill();
				circle(node.x, node.y, 10);
				fill(0, 0, 20);
				text(i, node.x, node.y);
				noStroke();
			}
		}
	}
}
