const fs = require("fs");
const path = require("path");

// Function to update the manifest file
function updateManifest() {
	const swatchesDir = __dirname;
	const manifestPath = path.join(swatchesDir, "manifest.json");

	// Read all PNG files in the swatches directory
	const files = fs
		.readdirSync(swatchesDir)
		.filter((file) => file.endsWith(".png"))
		.sort(); // Sort alphabetically for consistent ordering

	// Create manifest object
	const manifest = {
		swatches: files,
	};

	// Write the manifest file
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

	console.log(`Updated manifest with ${files.length} swatches:`);
	files.forEach((file) => console.log(`  - ${file}`));
}

// Run the update
updateManifest();
