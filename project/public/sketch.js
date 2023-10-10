let edge_arr = [];
let node_arr = [];
let edge_num = 1;
let node_num = 30;

let edge_length = 400;

function setup() {
	createCanvas(1000, 1000);
	pixelDensity(3);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	background(0, 10, 100, 100);

	let edge_start = createVector(width / 2, height / 2);
	let edge_end = createVector(width / 2, edge_start.y - edge_length);

	for (let j = 0; j < node_num; j++) {
		// distribute nodes along the edge, the first node is at the edge_start and the last node is at the edge_end. All other nodes are evenly distributed.
		let node_distance = edge_length / (node_num - 1); // Adjusted to include the last node

		// if this is the first node, store the edge_start position, else store the previous node position
		let prev_node_x = j == 0 ? edge_start.x : node_arr[j - 1].pos.x;
		let prev_node_y = j == 0 ? edge_start.y : node_arr[j - 1].pos.y;
		// calculate the current node position based on the previous node position + the distance between nodes
		let node_x = prev_node_x;
		let node_y = prev_node_y - node_distance;

		node_arr.push(new Node(node_x, node_y, prev_node_x, prev_node_y, node_distance * j));
	}
}

function draw() {
	background(0, 10, 100, 100);

	for (let i = 0; i < edge_num; i++) {
		for (let j = 0; j < node_arr.length; j++) {
			node_arr[j].draw();
			node_arr[j].update();
		}
	}

	//ellipse(width / 2, height / 2, 5, 5);
}

class Node {
	constructor(x, y, px, py, distance) {
		// if not the first node, store the previous node position
		this.prev_node_pos = createVector(px, py);
		this.pos = createVector(x, y);
		this.angle = 270;
		this.distance = distance;
		this.xoff = random(1000);
		this.yoff = random(1000);
	}

	draw() {
		stroke(0, 0, 0, 100);
		strokeWeight(1);
		line(this.prev_node_pos.x, this.prev_node_pos.y, this.pos.x, this.pos.y);
		stroke(0, 0, 100, 100);
		strokeWeight(5);
		point(this.pos.x, this.pos.y);
	}

	update() {
		this.prev_pos.x = this.pos.x;
		this.prev_pos.y = this.pos.y;
		this.pos.x += random(-1, 1);
		this.pos.y += random(-1, 1);
	}
}
