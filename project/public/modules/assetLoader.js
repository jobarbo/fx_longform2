/**
 * Asset Loader Module
 *
 * Loads images from assets/images/ and provides a draw API so they can be
 * drawn onto the main canvas and altered by the shader pipeline.
 */

const ASSET_BASE_PATH = "./assets/";
const ASSET_IMAGE_PATHS = ["images/quebec_map.jpg"];

const assetLoader = {
	/** @type {Record<string, p5.Image>} */
	loadedImages: {},
	/** @type {string[]} */
	_keys: [],

	/**
	 * Preload all configured images. Call from p5 preload().
	 * @param {p5} p5Instance - The p5 instance
	 */
	preload(p5Instance) {
		this.loadedImages = {};
		this._keys = [];
		for (const relativePath of ASSET_IMAGE_PATHS) {
			const fullPath = ASSET_BASE_PATH + relativePath;
			const img = p5Instance.loadImage(fullPath);
			const key = relativePath.split("/").pop() || relativePath;
			this.loadedImages[key] = img;
			this._keys.push(key);
		}
		return this;
	},

	/**
	 * Get a loaded image by key (filename) or index.
	 * @param {string|number} keyOrIndex - Filename key (e.g. 'stroch.jpeg') or index
	 * @returns {p5.Image|undefined}
	 */
	getImage(keyOrIndex) {
		if (typeof keyOrIndex === "number") {
			const key = this._keys[keyOrIndex];
			return key ? this.loadedImages[key] : undefined;
		}
		return this.loadedImages[keyOrIndex];
	},

	/**
	 * Get list of loaded image keys (filenames).
	 * @returns {string[]}
	 */
	getLoadedKeys() {
		return [...this._keys];
	},

	/**
	 * Get cover dimensions for a viewport (for a buffer that holds the full image with no clipping).
	 * @param {number} viewportW - Viewport width
	 * @param {number} viewportH - Viewport height
	 * @param {string|number} [keyOrIndex=0] - Image key or index
	 * @returns {{ w: number, h: number }|null} - Cover size or null if no image
	 */
	getCoverDimensions(viewportW, viewportH, keyOrIndex = 0) {
		const img = this.getImage(keyOrIndex);
		if (!img) return null;
		const rect = this._computeFit(img.width, img.height, viewportW, viewportH, "cover");
		return {w: Math.round(rect.w), h: Math.round(rect.h)};
	},

	/**
	 * Compute destination rect for fit mode (cover, contain, stretch).
	 * @param {number} imgW - Image width
	 * @param {number} imgH - Image height
	 * @param {number} destW - Destination width
	 * @param {number} destH - Destination height
	 * @param {string} fit - 'cover' | 'contain' | 'stretch'
	 * @returns {{ x: number, y: number, w: number, h: number }}
	 */
	_computeFit(imgW, imgH, destW, destH, fit) {
		if (fit === "stretch") {
			return {x: 0, y: 0, w: destW, h: destH};
		}
		const imgRatio = imgW / imgH;
		const destRatio = destW / destH;
		let w, h, x, y;
		if (fit === "cover") {
			// Cover: scale so the canvas is fully covered; smallest axis = 100%, overflow cropped
			if (imgRatio > destRatio) {
				h = destH;
				w = destH * imgRatio;
			} else {
				w = destW;
				h = destW / imgRatio;
			}
			x = (destW - w) / 2;
			y = (destH - h) / 2;
		} else {
			// contain: scale so the whole image fits; may have letterboxing
			if (imgRatio > destRatio) {
				w = destW;
				h = destW / imgRatio;
			} else {
				h = destH;
				w = destH * imgRatio;
			}
			x = (destW - w) / 2;
			y = (destH - h) / 2;
		}
		return {x, y, w, h};
	},

	/**
	 * Draw an asset onto a p5.Graphics (e.g. mainCanvas).
	 * @param {p5.Graphics} destCanvas - Destination canvas
	 * @param {Object} options - Draw options
	 * @param {string|number} [options.keyOrIndex] - Image key or index (default: first image)
	 * @param {string} [options.fit='cover'] - 'cover' | 'contain' | 'stretch'
	 * @param {number} [options.x] - Override x (optional)
	 * @param {number} [options.y] - Override y (optional)
	 * @param {number} [options.width] - Override width (optional)
	 * @param {number} [options.height] - Override height (optional)
	 */
	drawAsset(destCanvas, options = {}) {
		const keyOrIndex = options.keyOrIndex !== undefined ? options.keyOrIndex : 0;
		const img = this.getImage(keyOrIndex);
		if (!img || !destCanvas) return this;

		const destW = destCanvas.width;
		const destH = destCanvas.height;
		const fit = options.fit || "cover";

		let x, y, w, h;
		if (options.x !== undefined && options.y !== undefined && options.width !== undefined && options.height !== undefined) {
			x = options.x;
			y = options.y;
			w = options.width;
			h = options.height;
		} else {
			const rect = this._computeFit(img.width, img.height, destW, destH, fit);
			x = rect.x;
			y = rect.y;
			w = rect.w;
			h = rect.h;
		}

		destCanvas.image(img, x, y, w, h);
		return this;
	},
};
