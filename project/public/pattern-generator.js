/**
 * Pattern Generator Utility
 * Crée des patterns répétitifs à partir de l'œuvre générative
 */

class PatternGenerator {
	constructor() {
		this.patternSize = 2; // Default 2x2
		this.patternTypes = ["repeat", "mirror-h", "mirror-v", "mirror-both", "rotate"];
		this.currentPatternType = "repeat";
		this.symmetryModes = ["none", "horizontal", "vertical", "both", "radial"];
		this.currentSymmetryMode = "none";
		this.isGenerating = false;
		this.patternCanvas = null;
		this.originalCanvas = null;
		this.isShowingSymmetry = false;
		this.symmetryShader = null;
		this.shaderManager = null;

		this.setupUI();
	}

	setupUI() {
		// Créer l'interface utilisateur
		const uiContainer = document.createElement("div");
		uiContainer.id = "pattern-generator-ui";
		uiContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            min-width: 250px;
            backdrop-filter: blur(10px);
        `;

		uiContainer.innerHTML = `
            <h3 style="margin: 0 0 15px 0; font-size: 16px;">Pattern Generator</h3>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px;">Taille du pattern:</label>
                <select id="pattern-size" style="width: 100%; padding: 5px; border-radius: 5px; border: none;">
                    <option value="2">2x2</option>
                    <option value="3">3x3</option>
                    <option value="4">4x4</option>
                </select>
            </div>

			<div style="margin-bottom: 15px;">
				<label style="display: block; margin-bottom: 5px; font-size: 12px;">Type de pattern:</label>
				<select id="pattern-type" style="width: 100%; padding: 5px; border-radius: 5px; border: none;">
					<option value="repeat">Répétition</option>
					<option value="mirror-h">Miroir horizontal</option>
					<option value="mirror-v">Miroir vertical</option>
					<option value="mirror-both">Miroir double</option>
					<option value="rotate">Rotation</option>
				</select>
			</div>

			<div style="margin-bottom: 15px;">
				<label style="display: block; margin-bottom: 5px; font-size: 12px;">Mode de symétrie:</label>
				<select id="symmetry-mode" style="width: 100%; padding: 5px; border-radius: 5px; border: none;">
					<option value="none">Aucune</option>
					<option value="horizontal">Symétrie horizontale</option>
					<option value="vertical">Symétrie verticale</option>
					<option value="both">Symétrie double</option>
					<option value="radial">Symétrie radiale</option>
				</select>
			</div>

            <div style="margin-bottom: 15px;">
                <button id="generate-pattern" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Générer Pattern
                </button>
            </div>

            <div style="margin-bottom: 15px;">
                <button id="download-pattern" style="width: 100%; padding: 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; display: none;">
                    Télécharger Pattern
                </button>
            </div>

			<div style="margin-bottom: 15px;">
				<button id="preview-symmetry" style="width: 100%; padding: 10px; background: #9C27B0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
					Aperçu Symétrie
				</button>
				<p style="font-size: 10px; color: #ccc; margin: 5px 0 0 0; text-align: center;">
					Voir la symétrie avant de générer le pattern
				</p>
			</div>

			<div style="margin-bottom: 15px;">
				<button id="preview-pattern" style="width: 100%; padding: 10px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; display: none;">
					Aperçu Pattern
				</button>
			</div>

			<div style="margin-bottom: 15px;">
				<button id="toggle-ui" style="width: 100%; padding: 8px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
					Masquer Interface
				</button>
			</div>
        `;

		document.body.appendChild(uiContainer);

		// Event listeners
		document.getElementById("pattern-size").addEventListener("change", (e) => {
			this.patternSize = parseInt(e.target.value);
		});

		document.getElementById("pattern-type").addEventListener("change", (e) => {
			this.currentPatternType = e.target.value;
		});

		document.getElementById("symmetry-mode").addEventListener("change", (e) => {
			const newMode = e.target.value;

			// Si la symétrie est active, mettre à jour le shader
			if (this.isShowingSymmetry) {
				this.disableSymmetryShader();
				this.currentSymmetryMode = newMode;
				this.symmetryShader = null; // Reset pour forcer la recréation
				this.enableSymmetryShader();
			} else {
				this.currentSymmetryMode = newMode;
			}
		});

		document.getElementById("generate-pattern").addEventListener("click", () => {
			this.generatePattern();
		});

		document.getElementById("download-pattern").addEventListener("click", () => {
			this.downloadPattern();
		});

		document.getElementById("preview-symmetry").addEventListener("click", () => {
			this.toggleSymmetryPreview();
		});

		document.getElementById("preview-pattern").addEventListener("click", () => {
			this.previewPattern();
		});

		document.getElementById("toggle-ui").addEventListener("click", () => {
			this.toggleUI();
		});
	}

	toggleUI() {
		const ui = document.getElementById("pattern-generator-ui");
		const toggleBtn = document.getElementById("toggle-ui");

		if (ui.style.display === "none") {
			ui.style.display = "block";
			toggleBtn.textContent = "Masquer Interface";
		} else {
			ui.style.display = "none";
			toggleBtn.textContent = "Afficher Interface";
		}
	}

	toggleSymmetryPreview() {
		const previewBtn = document.getElementById("preview-symmetry");

		if (!this.isShowingSymmetry) {
			// Activer le shader de symétrie
			if (this.currentSymmetryMode !== "none") {
				this.enableSymmetryShader();
			} else {
				alert("Veuillez sélectionner un mode de symétrie autre que 'Aucune'");
				return;
			}

			this.isShowingSymmetry = true;
			previewBtn.textContent = "Désactiver Symétrie";
			previewBtn.style.background = "#E91E63";
		} else {
			// Désactiver le shader de symétrie
			this.disableSymmetryShader();

			this.isShowingSymmetry = false;
			previewBtn.textContent = "Aperçu Symétrie";
			previewBtn.style.background = "#9C27B0";
		}
	}

	enableSymmetryShader() {
		// Vérifier si le système de shaders est disponible
		if (typeof shaderEffects === "undefined" || !shaderEffects.shaderManager) {
			console.warn("Système de shaders non disponible, utilisation de l'overlay");
			this.fallbackToOverlay();
			return;
		}

		// Créer le shader de symétrie
		this.createSymmetryShader();

		// Enregistrer le shader dans le shader manager
		const shaderName = `symmetry_${this.currentSymmetryMode}`;
		shaderEffects.shaderManager.shaders[shaderName] = this.symmetryShader;

		// Ajouter le shader au pipeline
		if (shaderEffects.shaderPipeline) {
			shaderEffects.shaderPipeline.addPass(shaderName, () => ({
				uTime: shaderEffects.shaderTime || 0,
				uResolution: [width, height],
			}));
		}
	}

	disableSymmetryShader() {
		if (shaderEffects.shaderPipeline) {
			const shaderName = `symmetry_${this.currentSymmetryMode}`;

			// Supprimer le shader du pipeline en recréant les passes sans celui-ci
			const currentPasses = shaderEffects.shaderPipeline.passes;
			shaderEffects.shaderPipeline.clearPasses();

			// Réajouter tous les passes sauf celui de symétrie
			for (const pass of currentPasses) {
				if (pass.name !== shaderName) {
					shaderEffects.shaderPipeline.addPass(pass.name, pass.uniformsProvider);
				}
			}

			// Supprimer le shader du manager
			if (shaderEffects.shaderManager.shaders[shaderName]) {
				delete shaderEffects.shaderManager.shaders[shaderName];
			}
		}
	}

	createSymmetryShader() {
		if (typeof SymmetryShaders === "undefined") {
			console.error("SymmetryShaders non chargé");
			return;
		}

		const shaderData = SymmetryShaders[this.currentSymmetryMode];
		if (!shaderData) {
			console.error(`Shader de symétrie non trouvé pour le mode: ${this.currentSymmetryMode}`);
			return;
		}

		try {
			// Créer le shader directement dans le contexte du shaderManager
			const shaderName = `symmetry_${this.currentSymmetryMode}`;

			// Utiliser le p5Instance du shaderManager pour créer le shader dans le bon contexte
			const p5Instance = shaderEffects.shaderManager.p5Instance;
			this.symmetryShader = p5Instance.createShader(shaderData.vertex, shaderData.fragment);

			console.log(`Shader de symétrie ${this.currentSymmetryMode} créé avec succès`);
		} catch (error) {
			console.error("Erreur lors de la création du shader de symétrie:", error);
			this.fallbackToOverlay();
		}
	}

	fallbackToOverlay() {
		// Méthode de fallback utilisant l'overlay si les shaders ne sont pas disponibles
		const mainCanvas = document.querySelector("canvas");
		if (!mainCanvas) {
			alert("Canvas principal non trouvé");
			return;
		}

		// Sauvegarder le canvas original
		this.originalCanvas = document.createElement("canvas");
		this.originalCanvas.width = mainCanvas.width;
		this.originalCanvas.height = mainCanvas.height;
		this.originalCanvas.getContext("2d").drawImage(mainCanvas, 0, 0);

		// Appliquer la symétrie
		const symmetricCanvas = this.applySymmetry(this.originalCanvas);
		this.createSymmetryOverlay(symmetricCanvas);
	}

	createSymmetryOverlay(symmetricCanvas) {
		// Supprimer l'overlay existant s'il y en a un
		this.removeSymmetryOverlay();

		// Créer l'overlay
		const overlay = document.createElement("div");
		overlay.id = "symmetry-preview-overlay";
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			z-index: 1500;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
		`;

		const container = document.createElement("div");
		container.style.cssText = `
			background: white;
			padding: 20px;
			border-radius: 10px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			max-width: 90%;
			max-height: 90%;
		`;

		const title = document.createElement("h3");
		title.textContent = `Aperçu Symétrie - ${this.getSymmetryModeName()}`;
		title.style.cssText = `
			margin: 0 0 15px 0;
			text-align: center;
			color: #333;
			font-family: Arial, sans-serif;
		`;

		const canvas = document.createElement("canvas");
		canvas.width = symmetricCanvas.width;
		canvas.height = symmetricCanvas.height;
		canvas.style.cssText = `
			max-width: 100%;
			max-height: 70vh;
			border: 2px solid #333;
			display: block;
			margin: 0 auto;
		`;

		const ctx = canvas.getContext("2d");
		ctx.drawImage(symmetricCanvas, 0, 0);

		const instructions = document.createElement("p");
		instructions.textContent = "Cliquez n'importe où pour fermer l'aperçu";
		instructions.style.cssText = `
			text-align: center;
			margin: 15px 0 0 0;
			color: #666;
			font-size: 12px;
		`;

		container.appendChild(title);
		container.appendChild(canvas);
		container.appendChild(instructions);
		overlay.appendChild(container);
		document.body.appendChild(overlay);

		// Fermer l'overlay en cliquant
		overlay.addEventListener("click", () => {
			this.removeSymmetryOverlay();
			this.isShowingSymmetry = false;
			const previewBtn = document.getElementById("preview-symmetry");
			previewBtn.textContent = "Aperçu Symétrie";
			previewBtn.style.background = "#9C27B0";
		});

		// Fermer avec Escape
		const closeHandler = (e) => {
			if (e.key === "Escape") {
				this.removeSymmetryOverlay();
				this.isShowingSymmetry = false;
				const previewBtn = document.getElementById("preview-symmetry");
				previewBtn.textContent = "Aperçu Symétrie";
				previewBtn.style.background = "#9C27B0";
				document.removeEventListener("keydown", closeHandler);
			}
		};
		document.addEventListener("keydown", closeHandler);
	}

	removeSymmetryOverlay() {
		const overlay = document.getElementById("symmetry-preview-overlay");
		if (overlay) {
			document.body.removeChild(overlay);
		}
	}

	getSymmetryModeName() {
		const names = {
			none: "Aucune",
			horizontal: "Symétrie horizontale",
			vertical: "Symétrie verticale",
			both: "Symétrie double",
			radial: "Symétrie radiale",
		};
		return names[this.currentSymmetryMode] || this.currentSymmetryMode;
	}

	generatePattern() {
		if (this.isGenerating) return;

		this.isGenerating = true;
		const generateBtn = document.getElementById("generate-pattern");
		generateBtn.textContent = "Génération...";
		generateBtn.disabled = true;

		// Attendre que l'animation soit terminée
		if (typeof document.complete !== "undefined" && document.complete) {
			this.createPattern();
		} else {
			// Attendre la fin de l'animation
			const checkComplete = setInterval(() => {
				if (typeof document.complete !== "undefined" && document.complete) {
					clearInterval(checkComplete);
					this.createPattern();
				}
			}, 100);
		}
	}

	createPattern() {
		try {
			// Utiliser le canvas original pour la génération du pattern
			const sourceCanvas = this.originalCanvas || document.querySelector("canvas");
			if (!sourceCanvas) {
				throw new Error("Canvas source non trouvé");
			}

			// Appliquer la symétrie au canvas source si nécessaire
			const symmetricSourceCanvas = this.applySymmetry(sourceCanvas);

			// Créer le canvas pour le pattern
			const tileWidth = symmetricSourceCanvas.width;
			const tileHeight = symmetricSourceCanvas.height;
			const patternWidth = tileWidth * this.patternSize;
			const patternHeight = tileHeight * this.patternSize;

			this.patternCanvas = document.createElement("canvas");
			this.patternCanvas.width = patternWidth;
			this.patternCanvas.height = patternHeight;
			const patternCtx = this.patternCanvas.getContext("2d");

			// Générer le pattern selon le type sélectionné
			for (let row = 0; row < this.patternSize; row++) {
				for (let col = 0; col < this.patternSize; col++) {
					const x = col * tileWidth;
					const y = row * tileHeight;

					this.drawTile(patternCtx, symmetricSourceCanvas, x, y, row, col);
				}
			}

			// Afficher le pattern dans une nouvelle fenêtre
			this.displayPattern();

			// Activer les boutons
			document.getElementById("download-pattern").style.display = "block";
			document.getElementById("preview-pattern").style.display = "block";
		} catch (error) {
			console.error("Erreur lors de la génération du pattern:", error);
			alert("Erreur lors de la génération du pattern: " + error.message);
		} finally {
			this.isGenerating = false;
			const generateBtn = document.getElementById("generate-pattern");
			generateBtn.textContent = "Générer Pattern";
			generateBtn.disabled = false;
		}
	}

	applySymmetry(sourceCanvas) {
		if (this.currentSymmetryMode === "none") {
			return sourceCanvas;
		}

		// Créer un nouveau canvas pour la tuile symétrique
		const symmetricCanvas = document.createElement("canvas");
		symmetricCanvas.width = sourceCanvas.width;
		symmetricCanvas.height = sourceCanvas.height;
		const ctx = symmetricCanvas.getContext("2d");

		// Appliquer la symétrie selon le mode sélectionné
		switch (this.currentSymmetryMode) {
			case "horizontal":
				// Symétrie horizontale - miroir vertical au centre
				// Dessiner la moitié gauche (originale)
				ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width / 2, sourceCanvas.height, 0, 0, sourceCanvas.width / 2, sourceCanvas.height);

				// Dessiner la moitié droite (miroir de la gauche)
				ctx.save();
				ctx.scale(-1, 1);
				ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width / 2, sourceCanvas.height, -sourceCanvas.width, 0, sourceCanvas.width / 2, sourceCanvas.height);
				ctx.restore();
				break;

			case "vertical":
				// Symétrie verticale - miroir horizontal au centre
				// Dessiner la moitié haute (originale)
				ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height / 2, 0, 0, sourceCanvas.width, sourceCanvas.height / 2);

				// Dessiner la moitié basse (miroir du haut)
				ctx.save();
				ctx.scale(1, -1);
				ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height / 2, 0, -sourceCanvas.height, sourceCanvas.width, sourceCanvas.height / 2);
				ctx.restore();
				break;

			case "both":
				// Symétrie double - créer une tuile avec symétrie horizontale ET verticale
				// D'abord créer la symétrie horizontale
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = sourceCanvas.width;
				tempCanvas.height = sourceCanvas.height;
				const tempCtx = tempCanvas.getContext("2d");

				// Moitié gauche originale
				tempCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width / 2, sourceCanvas.height, 0, 0, sourceCanvas.width / 2, sourceCanvas.height);

				// Moitié droite miroir
				tempCtx.save();
				tempCtx.scale(-1, 1);
				tempCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width / 2, sourceCanvas.height, -sourceCanvas.width, 0, sourceCanvas.width / 2, sourceCanvas.height);
				tempCtx.restore();

				// Maintenant appliquer la symétrie verticale sur le résultat
				// Moitié haute (résultat de la symétrie horizontale)
				ctx.drawImage(tempCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height / 2, 0, 0, sourceCanvas.width, sourceCanvas.height / 2);

				// Moitié basse (miroir vertical)
				ctx.save();
				ctx.scale(1, -1);
				ctx.drawImage(tempCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height / 2, 0, -sourceCanvas.height, sourceCanvas.width, sourceCanvas.height / 2);
				ctx.restore();
				break;

			case "radial":
				// Symétrie radiale - créer une tuile avec symétrie radiale parfaite
				// Créer un canvas carré basé sur la plus grande dimension
				const radialCanvas = document.createElement("canvas");
				const size = Math.max(sourceCanvas.width, sourceCanvas.height);
				radialCanvas.width = size;
				radialCanvas.height = size;
				const radialCtx = radialCanvas.getContext("2d");

				// Centrer l'image originale
				const offsetX = (size - sourceCanvas.width) / 2;
				const offsetY = (size - sourceCanvas.height) / 2;
				radialCtx.drawImage(sourceCanvas, offsetX, offsetY);

				// Créer les 3 autres quadrants par rotation
				for (let i = 1; i < 4; i++) {
					radialCtx.save();
					radialCtx.translate(size / 2, size / 2);
					radialCtx.rotate((i * Math.PI) / 2);
					radialCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
					radialCtx.restore();
				}

				return radialCanvas;
		}

		return symmetricCanvas;
	}

	drawTile(patternCtx, sourceCanvas, x, y, row, col) {
		patternCtx.save();

		// Calculer les transformations selon le type de pattern
		let transformX = x;
		let transformY = y;
		let scaleX = 1;
		let scaleY = 1;
		let rotation = 0;

		switch (this.currentPatternType) {
			case "repeat":
				// Pas de transformation, juste répétition
				break;

			case "mirror-h":
				// Miroir horizontal pour les colonnes impaires
				if (col % 2 === 1) {
					scaleX = -1;
					transformX = x + sourceCanvas.width;
				}
				break;

			case "mirror-v":
				// Miroir vertical pour les lignes impaires
				if (row % 2 === 1) {
					scaleY = -1;
					transformY = y + sourceCanvas.height;
				}
				break;

			case "mirror-both":
				// Miroir double (damier)
				if ((row + col) % 2 === 1) {
					scaleX = -1;
					scaleY = -1;
					transformX = x + sourceCanvas.width;
					transformY = y + sourceCanvas.height;
				}
				break;

			case "rotate":
				// Rotation de 90° pour chaque tuile
				rotation = (row * this.patternSize + col) * 90;
				transformX = x + sourceCanvas.width / 2;
				transformY = y + sourceCanvas.height / 2;
				break;
		}

		// Appliquer les transformations
		patternCtx.translate(transformX, transformY);
		patternCtx.scale(scaleX, scaleY);

		if (rotation !== 0) {
			patternCtx.rotate((rotation * Math.PI) / 180);
			patternCtx.translate(-sourceCanvas.width / 2, -sourceCanvas.height / 2);
		}

		// Dessiner la tuile
		patternCtx.drawImage(sourceCanvas, 0, 0);

		patternCtx.restore();
	}

	displayPattern() {
		// Créer une fenêtre pour afficher le pattern
		const patternWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes");

		patternWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pattern Généré - ${this.patternSize}x${this.patternSize}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: #f0f0f0;
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    canvas {
                        border: 2px solid #333;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        max-width: 100%;
                        height: auto;
                    }
                    .info {
                        margin-top: 20px;
                        padding: 15px;
                        background: white;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body>
                <h1>Pattern ${this.patternSize}x${this.patternSize} - ${this.getPatternTypeName()}</h1>
                <canvas id="pattern-canvas"></canvas>
                <div class="info">
                    <p><strong>Taille:</strong> ${this.patternSize}x${this.patternSize}</p>
                    <p><strong>Type:</strong> ${this.getPatternTypeName()}</p>
                    <p><strong>Dimensions:</strong> ${this.patternCanvas.width}x${this.patternCanvas.height}px</p>
                </div>
            </body>
            </html>
        `);

		// Dessiner le pattern dans la nouvelle fenêtre
		const canvas = patternWindow.document.getElementById("pattern-canvas");
		canvas.width = this.patternCanvas.width;
		canvas.height = this.patternCanvas.height;
		canvas.getContext("2d").drawImage(this.patternCanvas, 0, 0);
	}

	getPatternTypeName() {
		const names = {
			repeat: "Répétition",
			"mirror-h": "Miroir horizontal",
			"mirror-v": "Miroir vertical",
			"mirror-both": "Miroir double",
			rotate: "Rotation",
		};

		const symmetryNames = {
			none: "",
			horizontal: " + Symétrie H",
			vertical: " + Symétrie V",
			both: " + Symétrie double",
			radial: " + Symétrie radiale",
		};

		const patternName = names[this.currentPatternType] || this.currentPatternType;
		const symmetryName = symmetryNames[this.currentSymmetryMode] || "";

		return patternName + symmetryName;
	}

	previewPattern() {
		if (!this.patternCanvas) {
			alert("Aucun pattern généré. Veuillez d'abord générer un pattern.");
			return;
		}

		// Créer un aperçu en overlay sur la page principale
		const overlay = document.createElement("div");
		overlay.id = "pattern-preview-overlay";
		overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        `;

		const previewCanvas = document.createElement("canvas");
		previewCanvas.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border: 2px solid white;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        `;

		// Redimensionner le canvas pour l'aperçu
		const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
		const aspectRatio = this.patternCanvas.width / this.patternCanvas.height;

		if (aspectRatio > 1) {
			previewCanvas.width = maxSize;
			previewCanvas.height = maxSize / aspectRatio;
		} else {
			previewCanvas.height = maxSize;
			previewCanvas.width = maxSize * aspectRatio;
		}

		const ctx = previewCanvas.getContext("2d");
		ctx.drawImage(this.patternCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

		overlay.appendChild(previewCanvas);
		document.body.appendChild(overlay);

		// Fermer l'aperçu en cliquant
		overlay.addEventListener("click", () => {
			document.body.removeChild(overlay);
		});

		// Fermer avec Escape
		const closeHandler = (e) => {
			if (e.key === "Escape") {
				document.body.removeChild(overlay);
				document.removeEventListener("keydown", closeHandler);
			}
		};
		document.addEventListener("keydown", closeHandler);
	}

	downloadPattern() {
		if (!this.patternCanvas) {
			alert("Aucun pattern généré. Veuillez d'abord générer un pattern.");
			return;
		}

		// Créer un lien de téléchargement
		const link = document.createElement("a");
		link.download = `pattern-${this.patternSize}x${this.patternSize}-${this.currentPatternType}-${Date.now()}.png`;
		link.href = this.patternCanvas.toDataURL("image/png");

		// Déclencher le téléchargement
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

// Initialiser le générateur de patterns quand le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
	// Attendre que p5.js soit chargé
	if (typeof p5 !== "undefined") {
		window.patternGenerator = new PatternGenerator();
	} else {
		// Attendre que p5.js soit chargé
		const checkP5 = setInterval(() => {
			if (typeof p5 !== "undefined") {
				clearInterval(checkP5);
				window.patternGenerator = new PatternGenerator();
			}
		}, 100);
	}
});
