import * as THREE from 'three';
import { setupScene } from './setupScene.js';
import { loadModels, loadFonts } from './setupAsset.js';
import { setupBallMovement } from './ballMove.js';
import { setupLighting } from './setupLight.js';
import { createTextGeometry } from './textGeometry.js';
import { Timer }  from "./timer.js";
import { BASE_URL } from '../../../index.js';
import { updateTextForElem } from "../../../utils/languages.js";

export let eventListeners = { }

export class pongThree {
    constructor () {
        this.canvasRef = document.getElementById('canvas');
		this.startButton= document.getElementById('btnStart');
		this.leftPaddleNameLabel = document.getElementById('leftPaddleName');
		this.rightPaddleNameLabel = document.getElementById('rightPaddleName');
		this.objectiveLabel = document.getElementById('objectiveLabel');
		this.pauseModal = new bootstrap.Modal(document.getElementById('pauseModal'));
		this.endgameModalWinner = document.getElementById('endgameModalWinner');
		this.endgameModalScore = document.getElementById('endgameModalScore');
		this.endgameModalTime = document.getElementById('endgameModalTime');
		this.endgameModalPlayAgain = document.getElementById('playAgainButton');
		this.endgameModal = new bootstrap.Modal(document.getElementById('endgameModal'));
		this.matchEndLabel = document.getElementById('matchEndLabel');

		this.toastNotification = document.getElementById('liveToast');
		this.toastBootstrap = bootstrap.Toast.getOrCreateInstance(this.toastNotification);
		this.toastBody = document.getElementById('toastBody');

        this.scoreLeftValue = 0;
        this.scoreRightValue = 0;
		this.controller = setupScene(this.canvasRef);
        this.objects;
        this.scores;
        this.gameStop = false;
		this.gamePaused = false;
		this.gameStart = false;
		this.timer = new Timer();
		
		const usernamesString = localStorage.getItem('pongUsernames');
		this.usernames = usernamesString ? JSON.parse(usernamesString) : {
			p1: "player1", p2: "player2", p3: "player3", p4: "player4"
		};
		this.leftPaddleNameLabel.textContent = this.usernames.p1;
		this.rightPaddleNameLabel.textContent = this.usernames.p2;

		const keybindsString = localStorage.getItem('pongKeybinds');
		this.keybinds = keybindsString ? JSON.parse(keybindsString) : {
			lUp : 'KeyW', lDown : 'KeyS', lMini: 'KeyE',
			rUp : 'ArrowUp', rDown : 'ArrowDown', rMini: 'ArrowRight'
		};
		this.keys = {
			[this.keybinds.rUp]: false,
			[this.keybinds.rDown]: false,
			[this.keybinds.lUp]: false,
			[this.keybinds.lDown]: false
		};

		const objectiveString = localStorage.getItem('pongObjective');
		this.objective = objectiveString ? JSON.parse(objectiveString) : 3;
		this.objectiveLabel.textContent = this.objective;

		this.boundKeyDownHandler = this.keyDownHandler.bind(this);
		this.boundKeyUpHandler = this.keyUpHandler.bind(this);

		this.startButton.addEventListener("click", () => this.startGame());
		this.endgameModalPlayAgain.addEventListener("click", () => this.resetGame());
		document.addEventListener("keydown", this.boundKeyDownHandler);
		document.addEventListener("keyup", this.boundKeyUpHandler);
		eventListeners["keydown"] = this.boundKeyDownHandler;
		eventListeners["keyup"] = this.boundKeyUpHandler;
		this.loadObjects();
    }

	async startGame() {
		this.startButton.disabled = true;
		this.startButton.style.display = "none";
		this.gameStart = true;

		this.timer.start();
		this.startGameLoop();
	}

    async loadObjects() {
        this.objects = await loadModels(this.controller.scene);
        this.scores = await loadFonts(this.controller.scene);
        this.moveBall = setupBallMovement(this.objects.ball, this.objects.paddleLeft, this.objects.paddleRight, this.updateScore.bind(this));

		setupLighting(this.controller.scene);
    }

    updateScore(side) {
        if (side === 'left') {
            this.scoreLeftValue++;
            this.updateTextGeometry(this.scores.scoreLeft, this.scoreLeftValue);
			if (this.scoreLeftValue >= this.objective) {
				this.endGame(this.usernames.p1)
			}
        } else if (side === 'right') {
            this.scoreRightValue++;
            this.updateTextGeometry(this.scores.scoreRight, this.scoreRightValue);
			if (this.scoreRightValue >= this.objective) {
				this.endGame(this.usernames.p2)
			}
        }
    }

    updateTextGeometry(scoreMesh, scoreValue) {
        if (scoreMesh.geometry) {
            scoreMesh.geometry.dispose(); // Dispose of old geometry
        }
        scoreMesh.geometry = createTextGeometry(scoreValue, this.scores.font);
    }

	movePaddles() {
		const paddleSpeed = 0.1;
		const zBound = 8.5 - 2.5;

		if (this.keys[this.keybinds.rUp]) this.objects.paddleRight.position.z -= paddleSpeed;
		if (this.keys[this.keybinds.rDown]) this.objects.paddleRight.position.z += paddleSpeed;
		if (this.keys[this.keybinds.lUp]) this.objects.paddleLeft.position.z -= paddleSpeed;
		if (this.keys[this.keybinds.lDown]) this.objects.paddleLeft.position.z += paddleSpeed;

		this.objects.paddleLeft.position.z = Math.max(-zBound, Math.min(zBound, this.objects.paddleLeft.position.z));
		this.objects.paddleRight.position.z = Math.max(-zBound, Math.min(zBound, this.objects.paddleRight.position.z));
	}

	endGame(winner) {
		this.stopGameLoop();
		this.gameOver = true;
		this.gameStart = false;

		this.sendMatchData(winner);

		updateTextForElem(this.matchEndLabel, "won-the-game");
		this.endgameModalWinner.textContent = winner;
		this.endgameModalScore.textContent = this.scoreLeftValue + "-" + this.scoreRightValue;
		this.endgameModalTime.textContent = this.timer.getTime();

		this.endgameModal.show();
	}

	resetGame() {
		this.startButton.disabled = false;
		this.startButton.style.display = "block";
		this.gameStop = false;

		this.objects.paddleLeft.position.z = 0;
		this.objects.paddleRight.position.z = 0;

		this.scoreLeftValue = 0;
		this.scoreRightValue = 0;
		this.updateTextGeometry(this.scores.scoreLeft, this.scoreLeftValue);
		this.updateTextGeometry(this.scores.scoreRight, this.scoreRightValue);

		this.controller.renderer.clear();
	}

    startGameLoop() {
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.update();
            }, 5);
        }
        this.animate();
    }

    stopInterval() {
        clearInterval(this.interval);
		this.interval = null;
	}

    update() {
        this.movePaddles();
        this.moveBall();
    }

    animate() {
        if (!this.gameStop)
            requestAnimationFrame(this.animate.bind(this));
       
        // controls.update();
        this.controller.renderer.render(this.controller.scene, this.controller.camera);
        this.controller.composer.render();
    }

	pauseGame() {
		if (this.gameStart) {
			if (!this.gamePaused) {
				this.stopInterval();
				this.pauseModal.show();
				this.timer.stop();
				this.gamePaused = true;
			}
			else {
				this.startGameLoop();
				this.timer.start();
				this.gamePaused = false;
			}
		}
	}

    stopGameLoop() {
        this.gameStop = true;
        this.timer.stop();
		this.stopInterval();
    }

	async sendMatchData(winner) {
		const date = new Date();
		let matchData = {
			"player_one": this.usernames.p1,
			"player_two": this.usernames.p2,
			"winner": winner,
			"match_score": this.scoreLeftValue + "-" + this.scoreRightValue,
			"match_duration": ((this.timer.min * 60) + this.timer.sec),
			"match_date": date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay(),
			"user": localStorage.getItem('user_id')
		};
		let response = await fetch(`${BASE_URL}/api/record_PvPong_match/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(matchData)
		})
		if (response.status > 300) {
			console.log("Could not save game in user history. Is user logged ?")
		} else if (response.status < 300) {
			updateTextForElem(this.toastBody, "game-saved");
			this.toastBootstrap.show();
		}
	}

	// HANDLERS

	keyDownHandler(event) {
		if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
			event.preventDefault();
		}
		if (this.gameStart) {
			if (event.code == 'Escape'){
				this.pauseGame();
			}
			this.keys[event.code] = true;
		}		
	}

	keyUpHandler(event) {
		if (this.gameStart) {
			this.keys[event.code] = false;
		}
	}
}