let myShader;
let w = Math.floor(1080 * 1);
let h = Math.floor(1920 * 1);
function preload() {
	myShader = loadShader('shaders/vertexShader.vert', 'shaders/fragmentShader.frag');
}

function setup() {
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if Safari mobile or any smartphone browser, use pixelDensity(0.5) to make the canvas bigger, else use pixelDensity(3.0)
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		pixelDensity(2);
	} else {
		pixelDensity(3);
	}
	createCanvas(w, h, WEBGL);
	noStroke();

	// Set the shader program using the shader() function
	shader(myShader);
}

function draw() {
	background(0);

	// Set the uniform values
	myShader.setUniform('u_resolution', [width, height]);
	myShader.setUniform('u_time', millis() / 1000.0);

	// Render the shader
	quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
