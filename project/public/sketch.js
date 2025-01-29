// Reaction-diffusion parameters
let grid, next;
const diffRateA = 1.2;
const diffRateB = 0.815;
const feedRate = 0.055;
const killRate = 0.062;

// Canvas settings
let dim;
const scale = 15; // Each cell will be 2x2 pixels
const padding = 2; // Extra cells around the visible area

function setup() {
	// Create square canvas that fits the window
	dim = floor(min(windowWidth, windowHeight) / scale);
	createCanvas(dim * scale, dim * scale);
	pixelDensity(1);

	// Initialize the grids with padding
	grid = [];
	next = [];
	for (let x = 0; x < dim + 2 * padding; x++) {
		grid[x] = [];
		next[x] = [];
		for (let y = 0; y < dim + 2 * padding; y++) {
			grid[x][y] = {a: 1, b: 0};
			next[x][y] = {a: 1, b: 0};
		}
	}

	// Add initial seed of chemical B in the center
	const centerX = floor((dim + 2 * padding) / 2);
	const centerY = floor((dim + 2 * padding) / 2);
	const seedSize = 1;
	for (let x = centerX - seedSize; x < centerX + seedSize; x++) {
		for (let y = centerY - seedSize; y < centerY + seedSize; y++) {
			if (x >= padding && x < dim + padding && y >= padding && y < dim + padding) {
				grid[x][y].b = 1;
			}
		}
	}

	// Add additional deterministic seeds in a cross pattern
	const offset = seedSize * 3;
	const smallSeedSize = 5;

	/* 		// Add some small random seeds for variety
		for (let i = 0; i < 5; i++) {
			const x = floor(random(dim));
			const y = floor(random(dim));
			grid[x][y].b = 1;
		} */

	// Top seed
	addSeed(centerX, centerY - offset, smallSeedSize);
	// Bottom seed
	addSeed(centerX, centerY + offset, smallSeedSize);
	// Left seed
	addSeed(centerX - offset, centerY, smallSeedSize);
	// Right seed
	addSeed(centerX + offset, centerY, smallSeedSize);

	background(0);
}

function addSeed(centerX, centerY, size) {
	for (let x = centerX - size; x < centerX + size; x++) {
		for (let y = centerY - size; y < centerY + size; y++) {
			if (x >= padding && x < dim + padding && y >= padding && y < dim + padding) {
				grid[x][y].b = 1;
			}
		}
	}
}

function draw() {
	// We'll update multiple times per frame for faster simulation
	for (let iter = 0; iter < 2; iter++) {
		updateGrid();
	}

	// Display the grid (only the visible portion)
	loadPixels();
	for (let x = padding; x < dim + padding; x++) {
		for (let y = padding; y < dim + padding; y++) {
			const value = floor((1 - grid[x][y].a) * 255);

			// Each cell is scale x scale pixels
			for (let i = 0; i < scale; i++) {
				for (let j = 0; j < scale; j++) {
					const idx = ((x - padding) * scale + i + ((y - padding) * scale + j) * width) * 4;
					pixels[idx] = value;
					pixels[idx + 1] = value;
					pixels[idx + 2] = value;
					pixels[idx + 3] = 255;
				}
			}
		}
	}
	updatePixels();
}

function updateGrid() {
	// Calculate next state for each cell, including padding
	for (let x = 1; x < dim + 2 * padding - 1; x++) {
		for (let y = 1; y < dim + 2 * padding - 1; y++) {
			const a = grid[x][y].a;
			const b = grid[x][y].b;

			// Calculate Laplacian (rate of diffusion)
			let laplaceA = 0;
			let laplaceB = 0;

			// Check all 8 neighbors plus center
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					const weight = i === 0 && j === 0 ? -1 : 0.2;
					laplaceA += grid[x + i][y + j].a * weight;
					laplaceB += grid[x + i][y + j].b * weight;
				}
			}

			// Reaction-diffusion formula
			next[x][y].a = a + (diffRateA * laplaceA - a * b * b + feedRate * (1 - a));
			next[x][y].b = b + (diffRateB * laplaceB + a * b * b - (killRate + feedRate) * b);

			// Keep values in valid range
			next[x][y].a = constrain(next[x][y].a, 0, 1);
			next[x][y].b = constrain(next[x][y].b, 0, 1);
		}
	}

	// Swap buffers
	[grid, next] = [next, grid];
}
