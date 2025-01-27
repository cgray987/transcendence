import { updateTexts } from "../utils/languages.js";
import { Pacman, PacWoman, PacMIB, Pacventurer, BlueGhost, OrangeGhost, PinkGhost, GreenGhost} from "./pacman/characters.js";
import { Cell, Timer} from "./pacman/objects.js";
import { updateTextForElem } from "../utils/languages.js";
import { BASE_URL } from '../index.js';

let eventListeners = { }

class PacmanGame {
	constructor (){
		// Canvas
		this.pGamemode = document.getElementById('pGamemode');
		this.pScore = document.getElementById('pScore');
		this.startButton = document.getElementById('btnStart');
		this.swapButton = document.getElementById('btnSwap');

		this.pacmanSpellName = document.getElementById('pacmanSpellName');
		this.ghostSpellName = document.getElementById('ghostSpellName');
		this.pacmanUsername = document.getElementById('pacmanPlayerLabel');
		this.ghostUsername = document.getElementById('ghostPlayerLabel');
		this.imgPacmanSkin = document.getElementById('imgPacmanSkin');
		this.imgGhostSkin = document.getElementById('imgGhostSkin');

		this.endgameModalWinner = document.getElementById('endgameModalWinner');
    	this.endgameModalScore = document.getElementById('endgameModalScore');
    	this.endgameModalTime = document.getElementById('endgameModalTime');
		this.endgameModalPlayAgain = document.getElementById('playAgainButton');

		this.pauseModal = new bootstrap.Modal(document.getElementById('pauseModal'));
		this.endgameModal = new bootstrap.Modal(document.getElementById('endgameModal'));

		this.canvas = document.getElementById('cvsPacman');
		this.c = this.canvas.getContext('2d');

		this.toastNotification = document.getElementById('liveToast');
		this.toastBootstrap = bootstrap.Toast.getOrCreateInstance(this.toastNotification);
		this.toastBody = document.getElementById('toastBody');

		// Map data
		this.cells;
		this.fruitArray = [];
		this.starArray = [];
		this.width, this.height, this.tileSize;

		// Keys
		this.keybinds;

		// Characters objects
		this.pacman, this.ghost;

		// Image objects
		this.images = {
			imgPacman1 : new Image(), imgPacman2 : new Image(), imgPacman3 : new Image(),
			imgPacman1_frenzy : new Image(), imgPacman2_frenzy : new Image(), imgPacman3_frenzy : new Image(),
			imgPacwoman1_turbo : new Image(), imgPacwoman2_turbo : new Image(), imgPacwoman3_turbo : new Image(),
			imgGhost1 : new Image(), imgGhost2 : new Image(), imgGhost3 : new Image(), imgGhost4 : new Image(), imgGhostDisabled : new Image(),
			imgGhost1_intangible : new Image(), imgGhost2_intangible : new Image(), imgGhost3_intangible : new Image(), imgGhost4_intangible : new Image(),
			imgCherry : new Image(), imgBanana : new Image(), imgStrawberry : new Image(), imgStar : new Image(),
			imgPortal1 : new Image(), imgPortal2 : new Image(), imgPortal3 : new Image(), imgPortal4 : new Image(),
			imgBluePortal1 : new Image(), imgBluePortal2 : new Image(), imgBluePortal3 : new Image(), imgBluePortal4 : new Image()
		}

		// Utils
		this.timer;
		this.pSpeed = 1 / 20;
		this.gSpeed = 1 / 19;
		this.frame = 0; // The frame number
		this.gameOver = false;
		this.gamePaused = false;

		this.boundPacmanHandleKeyDown = this.pacmanHandleKeyDown.bind(this);

		this.swapButton.addEventListener('click', () => this.swapPlayers());
		this.startButton.addEventListener("click", () => this.StartGame());
		this.endgameModalPlayAgain.addEventListener("click", () => this.resetGame());

		const usernamesString = localStorage.getItem('pacmanUsernames');
		this.usernames = usernamesString ? JSON.parse(usernamesString) : {
			pacman: "Player1", ghost: "Player2"
		};

		this.pacmanUsername.textContent = this.usernames.pacman;
		this.ghostUsername.textContent = this.usernames.ghost;

		const keybindsString = localStorage.getItem('pacmanKeybinds');
		this.keybinds = keybindsString ? JSON.parse(keybindsString) : {
			pUp : 'KeyW', pLeft : 'KeyA', pDown : 'KeyS', pRight : 'KeyD', pSpell : 'KeyE',
			gUp : 'ArrowUp', gLeft : 'ArrowLeft', gDown : 'ArrowDown', gRight : 'ArrowRight', gSpell : 'Numpad0'
		};

		const pacmanSkinString = localStorage.getItem('pacmanSkin');
		this.pacmanSkin = pacmanSkinString ? JSON.parse(pacmanSkinString) : "pac-man";

		const ghostSkinString = localStorage.getItem('ghostSkin');
		this.ghostSkin = ghostSkinString ? JSON.parse(ghostSkinString) : "blue-ghost";

		const objectiveString = localStorage.getItem('objective');
		this.objective = objectiveString ? JSON.parse(objectiveString) : "10000";

		const gamemodeString = localStorage.getItem('pacmanGamemode');
		this.gamemode = gamemodeString ? JSON.parse(gamemodeString) : "objective";
		switch (this.gamemode) {
			case "objective":
				this.pGamemode.textContent = this.objective;
				break;
			case "endless":
				document.querySelectorAll('.total-score').forEach(elem => {
					elem.style.display = 'none';
				});
				break;
			default:
				break;
		}

		this.imgPacmanSkin.src = 'static/assets/pacman/images/' + this.pacmanSkin + '2.png';
		this.imgGhostSkin.src = this.images.imgGhost1.src = 'static/assets/pacman/images/' + this.ghostSkin + '1.png';

		const mapNameString = localStorage.getItem('mapName');
		this.mapName = mapNameString ? JSON.parse(mapNameString) : "maze";

		const themeString = localStorage.getItem('pacmanTheme');
		this.theme = themeString ? JSON.parse(themeString) : { name: 'obsidian',
			backgroundColor : 'rgb(10, 0, 20)', ghostWallColor1 : 'rgb(110, 55, 225)', ghostWallColor2 : 'rgb(75, 20, 200)',
			wallColor : 'rgb(60, 0, 120)', dotColor : 'rgb(105,55,165)', glowColor : 'rgb(145,85,210)'
		};

		this.createCharacter("pacman", 0, 0);
		this.createCharacter("ghost", 0, 0);
		updateTextForElem(this.pacmanSpellName, this.pacman.spellName);
		updateTextForElem(this.ghostSpellName, this.ghost.spellName);

		this.images.imgPacman1.src = 'static/assets/pacman/images/' + this.pacmanSkin + '1.png';
		this.images.imgPacman2.src = 'static/assets/pacman/images/' + this.pacmanSkin + '2.png';
		this.images.imgPacman3.src = 'static/assets/pacman/images/' + this.pacmanSkin + '3.png';
		this.images.imgPacman1_frenzy.src = 'static/assets/pacman/images/pac-man1_frenzy.png';
		this.images.imgPacman2_frenzy.src = 'static/assets/pacman/images/pac-man2_frenzy.png';
		this.images.imgPacman3_frenzy.src = 'static/assets/pacman/images/pac-man3_frenzy.png';
		this.images.imgPacwoman1_turbo.src = 'static/assets/pacman/images/pac-woman1-turbo.png';
		this.images.imgPacwoman2_turbo.src = 'static/assets/pacman/images/pac-woman2-turbo.png';
		this.images.imgPacwoman3_turbo.src = 'static/assets/pacman/images/pac-woman3-turbo.png';
		this.images.imgGhost1.src = 'static/assets/pacman/images/' + this.ghostSkin + '1.png';
		this.images.imgGhost2.src = 'static/assets/pacman/images/' + this.ghostSkin + '2.png';
		this.images.imgGhost3.src = 'static/assets/pacman/images/' + this.ghostSkin + '3.png';
		this.images.imgGhost4.src = 'static/assets/pacman/images/' + this.ghostSkin + '4.png';
		this.images.imgGhost1_intangible.src = 'static/assets/pacman/images/pink-ghost1_intangible.png';
		this.images.imgGhost2_intangible.src = 'static/assets/pacman/images/pink-ghost2_intangible.png';
		this.images.imgGhost3_intangible.src = 'static/assets/pacman/images/pink-ghost3_intangible.png';
		this.images.imgGhost4_intangible.src = 'static/assets/pacman/images/pink-ghost4_intangible.png';
		this.images.imgGhostDisabled.src = 'static/assets/pacman/images/ghost-disabled.png';
		this.images.imgCherry.src = 'static/assets/pacman/images/cherry.png';
		this.images.imgBanana.src = 'static/assets/pacman/images/banana.png';
		this.images.imgStrawberry.src = 'static/assets/pacman/images/strawberry.png';
		this.images.imgPortal1.src = 'static/assets/pacman/images/portal1.png';
		this.images.imgPortal2.src = 'static/assets/pacman/images/portal2.png';
		this.images.imgPortal3.src = 'static/assets/pacman/images/portal3.png';
		this.images.imgPortal4.src = 'static/assets/pacman/images/portal4.png';
		this.images.imgBluePortal1.src = 'static/assets/pacman/images/portalBlue1.png';
		this.images.imgBluePortal2.src = 'static/assets/pacman/images/portalBlue2.png';
		this.images.imgBluePortal3.src = 'static/assets/pacman/images/portalBlue3.png';
		this.images.imgBluePortal4.src = 'static/assets/pacman/images/portalBlue4.png';
		this.images.imgStar.src = 'static/assets/pacman/images/star.png';
	}

	pauseGame() {
		if (!this.gameOver) {
			if (!this.gamePaused) {
				this.timer.stop();
				this.c.fillStyle = "rgba(0, 0, 0, 0.5)";
				this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
				this.pauseModal.show();
				updateTexts();
			}
			else
				this.timer.start();
			this.gamePaused = !this.gamePaused;
		}
	}

	resetGame() {
		this.gameOver = false;
		this.gamePaused = false;

		this.fruitArray = [];
		this.starArray = [];

		if (this.pacman.cooldownTimer != null)
			this.pacman.cooldownTimer.resetCD();
		if (this.ghost.cooldownTimer != null)
			this.ghost.cooldownTimer.resetCD();
		this.timer.reset();

		this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.startButton.style.display = "block";
		this.startButton.disabled = false;
	}

	async sendPacmanData(winner) {
		const date = new Date();
		let matchData = {
			"pacman_player": this.usernames.pacman,
			"pacman_character": this.pacmanSkin,
			"ghost_player": this.usernames.ghost,
			"ghost_character": this.ghostSkin,
			"map_name": this.mapName,
			"match_duration": ((this.timer.min * 60) + this.timer.sec),
			"winner": winner,
			"pacman_score": this.pacman.score,
			"match_date": date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay(),
			"user": localStorage.getItem('user_id')
		};
		let response = await fetch(`${BASE_URL}/api/record_pacman_match`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(matchData)
		});
		if (response.status > 300) {
			console.log("Could not save game in user history. Is user logged ?");
		} else if (response.status < 300) {
			updateTextForElem(this.toastBody, "game-saved");
			this.toastBootstrap.show();
		}
		if (this.gamemode == "endless") {
			matchData = {
				"max_endless_score": this.pacman.score
			};
			response = await fetch(`${BASE_URL}/api/pacman_endless_update`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(matchData)
			});
		}
	}

	partyOver(winner) {
		this.gameOver = true;
		this.stopGameLoop();

		this.sendPacmanData(winner);

		this.endgameModalWinner.textContent = winner;
		this.endgameModalScore.textContent = this.pacman.score;
		this.endgameModalTime.textContent = this.timer.getTime();

		// Show the modal
		this.endgameModal.show();
	}

	updateGame() {
		this.pacman.move();
		this.ghost.move();
	}

	renderGame() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.cells[y][x].render();
			}
		}

		this.pacman.render();
		this.ghost.render();

		// Remove used objects from arrays
		this.fruitArray = this.fruitArray.filter(food => food.render());
		this.starArray = this.starArray.filter(star => star.render());

		this.frame++;
	}

	// Load the map from the JSON file specified as parameter
	async loadMap(mapPath) {
		try {
			const response = await fetch(mapPath);
			const mapData = await response.json();
			return mapData;
		} 
		catch (error) {
			console.error("Error loading map:", error);
		}
	}

	// Initialize everything needed for the game
	async StartGame() {
		// Hide the button
		this.startButton.style.display = "none";

		// Get the map's JSON data
		const mapData = await this.loadMap("static/assets/pacman/maps/" + this.mapName + ".json");
		const { tileSize: tmpTileSize, width: tmpWidth, height: tmpHeight, data: tmpData } = mapData;
		this.tileSize = tmpTileSize;
		this.width = tmpWidth;
		this.height = tmpHeight;

		// Set score to 0
		this.pScore.textContent = "00";

		document.addEventListener("keydown", this.boundPacmanHandleKeyDown);
		eventListeners["keydown"] = this.boundPacmanHandleKeyDown;

		// Create the timer object
		this.timer = new Timer(this);

		// Create the cells array
		this.cells = this.parseMap(tmpData);

		if (this.gamemode == "objective")
			this.pacman.objective = this.objective;

		if (this.pacman && this.ghost) {
			this.gameStart = true;
			this.startButton.disabled = true;
			// Start the timer, which starts the game
			this.timer.start();
		} 
		else {
			console.error("Pacman or Ghost is not initialized.");
		}
	}

	// Create the cells array
	parseMap(data) {
		let tmp = [];
		for (let y = 0; y < this.height; y++) {
			let row = [];
			for (let x = 0; x < this.width; x++) {
				if (data[y][x] === "p") {
					this.createCharacter("pacman", x, y);
					data[y][x] = 6;
				}
				else if (data[y][x] === "g") {
					this.createCharacter("ghost", x, y);
					data[y][x] = 6;
				}
				row.push(new Cell(x, y, data[y][x], this, this.tileSize));
			}
			tmp.push(row);
		}
		return tmp;
	}

	createCharacter(type, x, y) {
		const pacmanSkins = {
			"pac-man": Pacman,
			"pac-woman": PacWoman,
			"pac-MIB": PacMIB,
			"pac-venturer": Pacventurer,
		};
	
		const ghostSkins = {
			"blue-ghost": BlueGhost,
			"orange-ghost": OrangeGhost,
			"pink-ghost": PinkGhost,
			"green-ghost": GreenGhost,
		};
	
		if (type === "pacman") {
			const PacmanClass = pacmanSkins[this.pacmanSkin];
			if (PacmanClass) this.pacman = new PacmanClass(x, y, "none", this);
		} 
		else if (type === "ghost") {
			const GhostClass = ghostSkins[this.ghostSkin];
			if (GhostClass) this.ghost = new GhostClass(x, y, "none", this);
		}
	}

	pacmanHandleKeyDown = (event) => {
		// Prevent buttons from moving the page
		if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
			event.preventDefault();
		}
		if (event.code == "Escape")
			this.pauseGame();
		if (!this.gamePaused && this.gameStart) {
			switch (event.code) {
				case this.keybinds.pUp:
					this.pacman.setDirection("up");
					break;
				case this.keybinds.pDown:
					this.pacman.setDirection("down");
					break;
				case this.keybinds.pLeft:
					this.pacman.setDirection("left");
					break;
				case this.keybinds.pRight:
					this.pacman.setDirection("right");
					break;
				case this.keybinds.pSpell:
					this.pacman.useSpell();
					break;
				case this.keybinds.gUp:
					this.ghost.setDirection("up");
					break;
				case this.keybinds.gDown:
					this.ghost.setDirection("down");
					break;
				case this.keybinds.gLeft:
					this.ghost.setDirection("left");
					break;
				case this.keybinds.gRight:
					this.ghost.setDirection("right");
					break;
				case this.keybinds.gSpell:
					this.ghost.useSpell();
					break;
				default:
					break;
			}
		}
	}

	swapPlayers() {
		let tmpUsername = this.usernames.pacman;
		this.usernames.pacman = this.usernames.ghost;
		this.usernames.ghost = tmpUsername;
		localStorage.setItem('pacmanUsernames', JSON.stringify(this.usernames));

		this.oldKeys = this.keybinds;
		this.keybinds = {
			pUp : this.oldKeys.gUp, pLeft : this.oldKeys.gLeft, pDown : this.oldKeys.gDown, pRight : this.oldKeys.gRight, pSpell : this.oldKeys.gSpell,
			gUp : this.oldKeys.pUp, gLeft : this.oldKeys.pLeft, gDown : this.oldKeys.pDown, gRight : this.oldKeys.pRight, gSpell : this.oldKeys.pSpell
		}
		localStorage.setItem('pacmanKeybinds', JSON.stringify(this.keybinds));

		this.pacmanUsername.textContent = this.usernames.pacman;
		this.ghostUsername.textContent = this.usernames.ghost;

		updateTextForElem(this.toastBody, "swapped-usernames");
		this.toastBootstrap.show();

		this.resetGame();
	}

	stopGameLoop() {
		if (this.gameStart) {
			if (this.pacman.cooldownTimer != null)
				this.pacman.cooldownTimer.stopCD();
			if (this.ghost.cooldownTimer != null)
				this.ghost.cooldownTimer.stopCD();
			this.timer.stop();
		}
	}
}

export { PacmanGame, eventListeners };