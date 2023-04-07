class Rect {
	constructor(margin, colorArr, angleArr, bgColor, rectType, rectNum, all_shapes_num, id, tries, w = 0, h = 0) {
		this.type = rectType;
		this.margin = margin;
		// if width is bigger than height, it's a landscape rectangle use height as the base
		// if height is bigger than width, it's a portrait rectangle use width as the base
		// if width and height are the same, it's a square use width as the base\
		this.base = width;
		if (width > height) {
			this.base = height;
		}

		this.w_shape = (this.base / 2 - this.margin) / (all_shapes_num / 10 + id) / ((tries + 1) / 10);
		this.w_shape = constrain(this.w_shape, this.base / 4 - this.margin, this.base / 2 - this.margin);
		// I want to make the width of the shape smaller as the number of shapes increases and the number of tries increases

		if (this.type === 'rectangle') {
			if (w === 0 && h === 0) {
				// make the rectangle a random size but always 16:9 ratio
				this.ratio = random([1 / 1, 2 / 3, 3 / 4, 9 / 16, 10 / 16]);
				this.w = this.w_shape;
				this.h = this.w * this.ratio;
			} else {
				this.ratio = w / h;
				this.w = w;
				this.h = h;
			}
		} else {
			if (w === 0 && h === 0) {
				this.ratio = random([1 / 40, 1 / 50, 1 / 70, 1 / 100]);
				this.w = random(this.base / 5, this.base / 3);
				this.h = this.w * this.ratio;
			} else {
				this.ratio = w / h;
				this.w = w;
				this.h = h;
			}
		}
		this.x = random(margin + this.w / 1.35, width - margin - this.w / 1.35);
		this.y = random(margin + this.w / 1.35, height - margin - this.w / 1.35);
		this.bgHue = hue(bgColor);
		this.bgSat = saturation(bgColor);
		this.bgBright = brightness(bgColor);
		this.sHue = hue(bgColor);
		this.sSat = saturation(bgColor);
		this.sBright = brightness(bgColor);
		this.rotation = radians(random(angleArr));
		this.color = random(colorArr);
		this.hue = hue(this.color);
		this.saturation = saturation(this.color);
		this.brightness = brightness(this.color);
		this.padding = 0;
		this.center = createVector(this.x, this.y);
		this.margin = margin;

		this.mask = '';
		this.textureDone = false;
		this.runs = this.h * 100;

		// store the 4 corners of the rectangle
		this.top_left = createVector(this.x - this.w / 2, this.y - this.h / 2);
		this.top_right = createVector(this.x + this.w / 2, this.y - this.h / 2);
		this.bottom_right = createVector(this.x + this.w / 2, this.y + this.h / 2);
		this.bottom_left = createVector(this.x - this.w / 2, this.y + this.h / 2);
		this.points = [this.top_left, this.top_right, this.bottom_right, this.bottom_left];

		// store the left and right x positions of the rectangle
		this.left = this.x - this.w / 2;
		this.right = this.x + this.w / 2;
		// store the top and bottom y positions of the rectangle
		this.top = this.y - this.h / 2;
		this.bottom = this.y + this.h / 2;

		this.id = id;

		// rotate each point around the center of the rectangle
		for (let i = 0; i < 4; i++) {
			this.points[i] = this.rotatePoint(this.points[i], this.center, this.rotation);
		}
	}

	draw() {
		// draw a preview of the rectangle

		push();
		translate(this.x, this.y);
		rotate(this.rotation);
		noStroke();
		fill(this.color);
		rect(0, 0, this.w, this.h);

		// make the stroke inside the rectangle
		strokeWeight(15);
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
		this.mask.rectMode(CENTER);
		this.mask.background(this.color);
		// run the createTexture function and wait for this.textureDone to be true to continue executing the rest of the code, this is to prevent the rest of the code from running before the texture is done being drawn
		if (!this.textureDone) {
			this.createTexture();
		}
	}

	rotatePoint(point, center, angle) {
		// translate point to origin
		point.sub(center);

		// rotate point
		point.rotate(angle);

		// translate point back to original position
		point.add(center);

		return point;
	}

	createTexture() {
		let texture = [];
		// make texture num relative to the size of the rectangle (the width and the height)
		let texture_num = int(map(this.w, this.base / 5 - this.margin, this.base / 1.35 - this.margin, 3, 10, true));

		this.mask.push();
		this.mask.translate(this.x, this.y);
		this.mask.rotate(this.rotation);
		for (let index = 0; index < texture_num; index++) {
			let rdnX = random(-this.w, this.w);
			let rdnY = random(-this.w, this.w);
			const rdnW1 = random(this.w / 8, this.w / 2);

			texture[index] = new Texture(this.rotation, 0, 0, this.w, this.h, rdnX, rdnY, rdnW1, this.color, this.mask);
		}
		let sketch_texture = this.drawTexture(texture);
		let interval = setInterval(() => {
			let result = sketch_texture.next();
			if (result.done) {
				this.mask.noStroke();

				this.mask.drawingContext.globalCompositeOperation = 'destination-in';
				this.mask.noStroke();

				this.mask.fill(this.color);
				this.mask.rect(0, 0, this.w, this.h);

				this.mask.pop();

				image(this.mask, 0, 0);

				//blendMode(HARD_LIGHT);
				push();
				translate(this.x, this.y);
				rotate(this.rotation);
				noFill();
				// make the stroke width relative to the size of the rectangle
				let sw = map(this.h, 0, width - this.margin, 0.01, 2, true);
				let shue = this.hue;
				let ssaturation = constrain(this.saturation + 40, 10, 100);
				let sbrightness = constrain(this.brightness - 40, 10, 100);
				let sbrightnessInc = 0.5;
				let ssaturationInc = 0.5;
				if (this.sBright > 50) {
					sbrightness = constrain(this.brightness + 50, 10, 100);
					sbrightnessInc = -0.15;
					ssaturation = constrain(this.saturation - 50, 10, 100);
					ssaturationInc = +0.15;
				}
				let salpha = 50;
				let incr = sw;
				let sRectWidth = this.w;
				let sRectHeight = this.h;
				// slowly reduce the rect size and the stroke alpha to create a gradient effect
				for (let i = 0; i < 50; i++) {
					stroke(shue, ssaturation, sbrightness, salpha);
					strokeWeight(sw);
					rect(0, 0, sRectWidth, sRectHeight);
					salpha = salpha - 1;
					sRectWidth = sRectWidth - sw;
					sRectHeight = sRectHeight - sw;
					sbrightness += sbrightnessInc;
					ssaturation += ssaturationInc;
				}
				pop();
				//blendMode(BLEND);
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
