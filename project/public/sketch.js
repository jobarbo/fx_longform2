let myShader;

function preload() {
	myShader = loadShader('shaders/vertexShader.vert', 'shaders/fragmentShader.frag');
}

function setup() {
	createCanvas(1500, 1500, WEBGL);
	noStroke();

	// Set the shader program using the shader() function
	shader(myShader);
}

function draw() {
	background(0);

	// Set the uniform values
	myShader.setUniform('u_resolution', [width, height]);
	myShader.setUniform('u_time', millis() / 100.0);

	// Render the shader
	quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
