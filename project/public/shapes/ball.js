class Ball {
	constructor(margin, colorArr, bgColor, ballNum, all_shapes_num, id, tries, r = 0) {
		this.margin = margin;
		this.base = width;
		if (width > height) {
			this.base = height;
		}

		this.w_shape = (this.base / 1.5 - this.margin) / (all_shapes_num / 5 + id) / ((tries + 1) / 10);
		this.w_shape = constrain(this.w_shape, this.base / 6 - this.margin, this.base / 1.5 - this.margin);
		if (r === 0) {
			this.d = this.w_shape;
			this.r = this.d / 2;
		} else {
			this.r = r;
			this.d = this.r * 2;
		}
		this.x = random(margin + this.d / 1.35, width - margin - this.d / 1.35);
		this.y = random(margin + this.d / 1.35, height - margin - this.d / 1.35);
		this.sHue = hue(bgColor);
		this.sSat = saturation(bgColor);
		this.sBright = brightness(bgColor);
		this.color = random(colorArr);
		this.hue = hue(this.color);
		this.sat = saturation(this.color);
		this.bri = brightness(this.color);
		this.alpha = 100;
		this.margin = margin;
		this.textureDone = false;
		this.runs = this.d * 100;
		this.id = id;
	}

	draw() {
		// draw a preview of the ball
		push();
		translate(this.x, this.y);
		//rotate(this.rotation);
		noStroke();
		fill(this.hue, this.sat, this.bri, this.alpha);
		ellipse(0, 0, this.d, this.d);
		pop();

		var ua = window.navigator.userAgent;
		var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
		var webkit = !!ua.match(/WebKit/i);
		var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

		// create a new canvas graphics the same size as the canvas to draw textures on
		this.mask = createGraphics(width, height);
		// if safari mobile use pixelDensity(2.0) to make the canvas bigger else use pixelDensity(3.0)
		if (iOSSafari) {
			this.mask.pixelDensity(1.0);
		} else {
			this.mask.pixelDensity(3.0);
		}
		this.mask.colorMode(HSB, 360, 100, 100, 100);
		this.mask.background(this.color);

		if (!this.textureDone) {
			this.createTexture();
		}
	}

	createTexture() {
		let texture = [];
		// make texture num relative to the size of the rectangle (the width and the height)
		let texture_num = int(map(this.d, this.base / 4 - this.margin, this.base / 1.25 - this.margin, 3, 10, true));

		for (let index = 0; index < texture_num; index++) {
			let rdnX = random(-this.d, this.d);
			let rdnY = random(-this.d, this.d);
			const rdnW1 = random(this.d / 8, this.d / 2);

			texture[index] = new Texture(0, this.x, this.y, this.d, this.d, rdnX, rdnY, rdnW1, this.color, this.mask);
		}
		let sketch_texture = this.drawTexture(texture);
		let interval = setInterval(() => {
			let result = sketch_texture.next();

			if (result.done) {
				this.mask.drawingContext.globalCompositeOperation = 'destination-in';
				this.mask.noStroke();
				this.mask.fill(this.color);
				this.mask.ellipse(this.x, this.y, this.r * 2, this.r * 2);
				image(this.mask, 0, 0);

				noFill();
				// make the stroke width relative to the size of the circle
				let sw = map(this.d, 0, width - this.margin, 0.25, 2, true);
				let shue = this.hue;
				let ssaturation = constrain(this.sat + 40, 10, 100);
				let sbrightness = constrain(this.bri - 40, 10, 100);
				let sbrightnessInc = 0.5;
				let ssaturationInc = 0.5;
				if (this.sBright > 50) {
					sbrightness = constrain(this.bri + 50, 10, 100);
					sbrightnessInc = -0.15;
					ssaturation = constrain(this.sat - 50, 10, 100);
					ssaturationInc = +0.15;
				}
				let salpha = 50;
				let incr = sw;
				let sElWidth = this.d;
				// slowly reduce the rect size and the stroke alpha to create a gradient effect
				for (let i = 0; i < 50; i++) {
					stroke(shue, ssaturation, sbrightness, salpha);
					strokeWeight(sw);
					ellipse(this.x, this.y, sElWidth - sw + 1, sElWidth - sw + 1);
					salpha = salpha - 1;
					sElWidth = sElWidth - sw;
					sbrightness += sbrightnessInc;
					ssaturation += ssaturationInc;
				}
				this.textureDone = true;
				clearInterval(interval);
			}
		}, 0);
	}

	*drawTexture(texture) {
		let count = 0;
		let draw_every = 1000;
		for (let index = 0; index < texture.length; index++) {
			for (let j = 0; j < this.runs; j++) {
				texture[index].display();
				count++;
				if (count > draw_every) {
					count = 0;
					yield;
				}
			}
		}
	}
	isTextureDone() {
		return this.textureDone;
	}
}
