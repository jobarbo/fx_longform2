// P_1_2_2_01
//
// Generative Gestaltung – Creative Coding im Web
// ISBN: 978-3-87439-902-9, First Edition, Hermann Schmidt, Mainz, 2018
// Benedikt Groß, Hartmut Bohnacker, Julia Laub, Claudius Lazzeroni
// with contributions by Joey Lee and Niels Poldervaart
// Copyright 2018
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * extract and sort the color palette of an image
 *
 * MOUSE
 * position x          : resolution
 *
 * KEYS
 * 1-4                 : load different images
 * 5                   : no color sorting
 * 6                   : sort colors on hue
 * 7                   : sort colors on saturation
 * 8                   : sort colors on brightness
 * 9                   : sort colors on greyscale (luminance)
 * s                   : save png
 * c                   : save color palette
 */
"use strict";

var img;
var colors = [];
var sortMode = null;

let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let c;

let v_p;
let v_p_pos = {x: 0, y: 0};

function preload() {
	loadImage("images/pic1.png", setImage);
}

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(3));
	noStroke();
	rectMode(CORNER); // Ensure we're using CORNER mode for precise placement
}

function draw() {
	background(0);

	// Calculate tile count based on mouse position
	var tileCount = floor(map(mouseX, 0, width, 2, 600));
	tileCount = max(tileCount, 2);

	// Calculate rect size to fit canvas exactly
	var rectSize = ceil(width / tileCount); // Use ceil instead of floor to ensure complete coverage

	img.loadPixels();
	colors = [];

	// Sample colors from the image
	for (var gridY = 0; gridY < tileCount; gridY++) {
		for (var gridX = 0; gridX < tileCount; gridX++) {
			var px = floor(map(gridX, 0, tileCount - 1, 0, img.width - 1));
			var py = floor(map(gridY, 0, tileCount - 1, 0, img.height - 1));
			var i = (py * img.width + px) * 4;
			var c = color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3]);
			colors.push(c);
		}
	}

	// Sort colors based on mode
	if (sortMode === "hue") {
		colors.sort((a, b) => hue(b) - hue(a));
	} else if (sortMode === "saturation") {
		colors.sort((a, b) => saturation(b) - saturation(a));
	} else if (sortMode === "brightness") {
		colors.sort((a, b) => brightness(b) - brightness(a));
	} else if (sortMode === "grayscale") {
		colors.sort((a, b) => red(b) + green(b) + blue(b) - (red(a) + green(a) + blue(a)));
	}

	// Draw the sorted colors with 1px overlap to prevent gaps
	var i = 0;
	for (var gridY = 0; gridY < tileCount; gridY++) {
		for (var gridX = 0; gridX < tileCount; gridX++) {
			fill(colors[i]);
			rect(
				gridX * rectSize,
				gridY * rectSize,
				rectSize + 1, // Always add 1px overlap
				rectSize + 1 // Always add 1px overlap
			);
			i++;
		}
	}
}

function keyReleased() {
	if (key == "c" || key == "C") writeFile([gd.ase.encode(colors)], gd.timestamp(), "ase");
	if (key == "s" || key == "S") saveCanvas(gd.timestamp(), "png");

	if (key == "1") loadImage("images/pic1.png", setImage);
	if (key == "2") loadImage("images/pic2.png", setImage);
	if (key == "3") loadImage("images/pic3.png", setImage);
	if (key == "4") loadImage("images/pic4.png", setImage);

	if (key == "5") sortMode = null;
	if (key == "6") sortMode = "hue";
	if (key == "7") sortMode = "saturation";
	if (key == "8") sortMode = "brightness";
	if (key == "9") sortMode = "grayscale";
}

function setImage(loadedImageFile) {
	img = loadedImageFile;
}
