import { Ball, Pad, Tournament, Timer }  from "./objects.js";
import { BASE_URL } from '../../index.js';
import { updateTextForElem } from "../../utils/languages.js";

export let eventListeners = { }

export class PongGame {
	constructor() {
		this.cvs = document.getElementById('canvas');
		this.ctx = this.cvs.getContext('2d');
		this.startButton= document.getElementById('btnStart');
		this.objectiveLabel = document.getElementById('objectiveLabel');

		this.endgameModalWinner = document.getElementById('endgameModalWinner');
		this.endgameModalScore = document.getElementById('endgameModalScore');
		this.endgameModalTime = document.getElementById('endgameModalTime');
		this.endgameModalPlayAgain = document.getElementById('playAgainButton');
		this.tournamentModalNextMatch = document.getElementById('nextMatchButton');
		this.pauseModal = new bootstrap.Modal(document.getElementById('pauseModal'));
		this.endgameModal = new bootstrap.Modal(document.getElementById('endgameModal'));
		this.matchScore =  document.getElementById('matchScore');
		this.modalColorBox1 = document.getElementById('colorBox1');
		this.modalColorBox2 = document.getElementById('colorBox2');
		this.colorBoxLeft = document.getElementById('colorBoxLeft');
		this.colorBoxRight = document.getElementById('colorBoxRight');
		this.matchEndLabel = document.getElementById('matchEndLabel');

		this.leftScore = document.getElementById("leftScore");
		this.rightScore = document.getElementById("rightScore");
		this.leftPaddleName = document.getElementById('leftPaddleName');
		this.rightPaddleName = document.getElementById('rightPaddleName');

		this.toastNotification = document.getElementById('liveToast');
		this.toastBootstrap = bootstrap.Toast.getOrCreateInstance(this.toastNotification);
		this.toastBody = document.getElementById('toastBody');

		this.pWidth = 12, this.pHeight = 80, this.bSize = 12, this.pSpeed = 1.6, this.bSpeed = 1.1;
		this.gameStarted = false, this.gameOver = false;
		this.paused = false;
		this.totalTime = 0;
		this.tournament;
		this.currentMatch;


		const gamemodeString = localStorage.getItem('pongGamemode');
		this.gamemode = gamemodeString ? JSON.parse(gamemodeString) : "pvp";

		const gamestyleString = localStorage.getItem('pongGamestyle');
		this.gamestyle = gamestyleString ? JSON.parse(gamestyleString) : "enhanced";

		if (this.gamestyle != "enhanced") {
			document.getElementById("pMinimize1").style.display = "none";
			document.getElementById("pMinimize2").style.display = "none";
		}

		const usernamesString = localStorage.getItem('pongUsernames');
		this.usernames = usernamesString ? JSON.parse(usernamesString) : {
			p1: "player1", p2: "player2", p3: "player3", p4: "player4"
		};

		this.leftPaddleName.textContent = this.usernames.p1;
		if (this.gamemode != "AI")
			this.rightPaddleName.textContent = this.usernames.p2;
		else
			this.rightPaddleName.textContent = "AI";

		const colorsString = localStorage.getItem('pongColors');
		this.colors = colorsString ? JSON.parse(colorsString) : {
			p1: "#ff0000", p2: "#00ff00", p3: "#266fff", p4: "#ff00ff"
		};

		const aiDifficultyString = localStorage.getItem('pongAIDifficulty');
		this.aiDifficulty = aiDifficultyString ? JSON.parse(aiDifficultyString) : "easy";
		localStorage.setItem('pongAIDifficulty', JSON.stringify(this.aiDifficulty));

		const keybindsString = localStorage.getItem('pongKeybinds');
		this.keybinds = keybindsString ? JSON.parse(keybindsString) : {
			lUp : 'KeyW', lDown : 'KeyS', lMini: 'KeyE',
			rUp : 'ArrowUp', rDown : 'ArrowDown', rMini: 'ArrowRight'
		};

		const objectiveString = localStorage.getItem('pongObjective');
		this.objective = objectiveString ? JSON.parse(objectiveString) : 3;
		this.objectiveLabel.textContent = this.objective;

		this.boundPongHandleKeyDown = this.handleKeyDown.bind(this);
		this.boundPongHandleKeyUp = this.handleKeyUp.bind(this);
		
		this.drawObjects = this.drawObjects.bind(this);

		this.startButton.addEventListener("click", () => this.startGame());
		this.endgameModalPlayAgain.addEventListener("click", () => this.resetGame());
		this.tournamentModalNextMatch.addEventListener("click", () => this.initTournamentMatch());
		this.gameOver = false;

		document.addEventListener("keydown", this.boundPongHandleKeyDown);
		eventListeners["keydown"] = this.boundPongHandleKeyDown;

		document.addEventListener("keyup", this.boundPongHandleKeyUp);
		eventListeners["keyup"] = this.boundPongHandleKeyUp;

		this.timer = new Timer(this);

		if (this.gamemode == "tournament") {
			this.setupTournament();
		}
		else {
			this.setupGame();
		}
	}

	setupGame() {
		this.leftPad = new Pad(0, this.cvs.height / 2 - this.pHeight / 2, 
			this.pWidth, this.pHeight, "left", this.colors.p1, this.pSpeed, this.cvs.height, 
			false, this);

		this.rightPad = new Pad(this.cvs.width - this.pWidth, this.cvs.height / 2 - this.pHeight / 2, 
			this.pWidth, this.pHeight,  "right", this.gamemode == "AI" ? "#FFF" : this.colors.p2, this.pSpeed, this.cvs.height,
			this.gamemode == "AI" ? true : false, this);

		this.ball = new Ball(this.bSize, "#FFF", this.bSpeed, this.cvs.height, this.cvs.width, this);
		this.colorBoxLeft.style.backgroundColor = this.colors.p1;
		this.colorBoxRight.style.backgroundColor = this.colors.p2;

		if (this.gamemode == "AI") {
			this.colorBoxRight.style.backgroundColor = "#FFF";
			this.rightPad.ball = this.ball;
		}
	}

	setupTournament() {
		this.tournament = new Tournament(4, this.usernames, this);
		this.initTournamentMatch();
	}

	winMatch(side) {
		this.stopGameLoop();
		this.totalTime += (this.timer.min * 60) + this.timer.sec;
		this.gameOver = true;
		this.matchScore.textContent = this.leftPad.score + "-" + this.rightPad.score;
		this.tournament.setCurrentMatchWinner(side);
		if (this.tournament.tournamentOver) {
			this.endTournament(side);
		}
	}
	
	initTournamentMatch() {
		this.currentMatch = this.tournament.getCurrentPlayers();
		this.leftPaddleName.textContent = this.usernames[this.currentMatch.left];
		this.rightPaddleName.textContent = this.usernames[this.currentMatch.right];
		this.modalColorBox1.style.backgroundColor = this.colors[this.currentMatch.left];
		this.colorBoxLeft.style.backgroundColor = this.colors[this.currentMatch.left];
		this.modalColorBox2.style.backgroundColor = this.colors[this.currentMatch.right];
		this.colorBoxRight.style.backgroundColor = this.colors[this.currentMatch.right];
		this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
		
		this.leftPad = new Pad(0, this.cvs.height / 2 - this.pHeight / 2, 
			this.pWidth, this.pHeight, "left", this.colors[this.currentMatch.left], this.pSpeed, this.cvs.height, 
			false, this);

		this.rightPad = new Pad(this.cvs.width - this.pWidth, this.cvs.height / 2 - this.pHeight / 2, 
			this.pWidth, this.pHeight, "right", this.colors[this.currentMatch.right], this.pSpeed, this.cvs.height,
			false, this);	
		
		this.ball = new Ball(this.bSize, "#FFF", this.bSpeed, this.cvs.height, this.cvs.width, this);

		this.leftScore.textContent = "0";
		this.rightScore.textContent = "0";
		
		this.gameStarted = false;
		this.startButton.style.display = "block";
		this.startButton.disabled = false;
		this.timer.reset();
	}

	resetGame() {
		if (this.gamemode == "tournament") {
			this.totalTime = 0;
			this.setupTournament();
		}
		else {
			this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
		
			this.setupGame();
	
			this.leftScore.textContent = "0";
			this.rightScore.textContent = "0";
			
			this.gameStarted = false;
			this.startButton.style.display = "block";
			this.startButton.disabled = false;
			this.timer.reset();
		}
	}

	startGame() {
		this.startButton.disabled = true;
		this.startButton.style.display = "none";
		this.gameStarted = true;
		this.gameOver = false;
		this.timer.start();
		this.startGameLoop();
	}

	endTournament(side) {
		updateTextForElem(this.matchEndLabel, "won-the-tournament");
		this.endgameModalWinner.textContent = this.usernames[this.currentMatch[side]];
		this.endgameModalScore.textContent = this.leftPad.score + "-" + this.rightPad.score;
		this.endgameModalTime.textContent = this.timer.getTime();

		this.sendMatchData(this.usernames[this.currentMatch[side]]);

		this.endgameModal.show();
	}

	endGame(winner) {
		this.stopGameLoop();
		this.gameOver = true;

		this.sendMatchData(winner);

		updateTextForElem(this.matchEndLabel, "won-the-game");
		this.endgameModalWinner.textContent = winner;
		this.endgameModalScore.textContent = this.leftPad.score + "-" + this.rightPad.score;
		this.endgameModalTime.textContent = this.timer.getTime();

		this.endgameModal.show();
	}

	async sendMatchData(winner) {
		const date = new Date();
		let matchData;
		let response;
		switch (this.gamemode) {
			case "pvp":
				matchData = {
					"player_one": this.usernames.p1,
					"player_two": this.usernames.p2,
					"winner": winner,
					"match_score": this.leftPad.score + "-" + this.rightPad.score,
					"match_duration": ((this.timer.min * 60) + this.timer.sec),
					"match_date": date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay(),
					"user": localStorage.getItem('user_id')
				};
				response = await fetch(`${BASE_URL}/api/record_PvPong_match/`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(matchData)
				})
				break;
			case "AI":
				matchData = {
					"player_one": this.usernames.p1,
					"ai_level" : this.aiDifficulty,
					"winner": winner,
					"match_score": this.leftPad.score + "-" + this.rightPad.score,
					"match_duration": ((this.timer.min * 60) + this.timer.sec),
					"match_date": date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay(),
					"user": localStorage.getItem('user_id')
				};
				response = await fetch(`${BASE_URL}/api/record_AIpong_match/`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(matchData)
				})
				break;
			case "tournament":
				matchData = {
					"date": date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay(),
					"player_one": this.usernames.p1,
					"player_two": this.usernames.p2,
					"player_three": this.usernames.p3,
					"player_four": this.usernames.p4,
					"winner": winner,
					"duration": this.totalTime,
					"user": localStorage.getItem('user_id')
				};
				response = await fetch(`${BASE_URL}/api/record_tournament/`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(matchData)
				})
				break;
			default:
				break;
		}
		if (response.status > 300) {
			console.log("Could not save game in user history. Is user logged ?")
		} else if (response.status < 300) {
			updateTextForElem(this.toastBody, "game-saved");
			this.toastBootstrap.show();
		}
	}
	
	pauseGame() {
		if (this.gameStarted && !this.gameOver) {
			if (!this.paused) {
				this.stopInterval();
				this.pauseModal.show();
			} 
			else {
				this.startGameLoop();
			}
			this.paused = !this.paused;
		}	
	}

	drawRect(x, y, w, h, color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, w, h);
	}

	drawSquare(x, y, size, color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, size, size);
	}

	drawNet() {
		for (let i = 5; i <= this.cvs.height; i += 20) {
			this.drawRect(this.cvs.width / 2 - 5, i, 10, 10, "#bfbfbf");
		}
	}

	scorePoint = (pad) => {
		if (pad == "left") {
			this.leftPad.score++;
			this.leftScore.textContent = this.leftPad.score;
			if (this.leftPad.score >= this.objective) {
				if (this.gamemode == "tournament")
					this.winMatch(pad);
				else
					this.endGame(this.usernames.p1);
			}
		}
		else if (pad == "right") {
			this.rightPad.score++;
			this.rightScore.textContent = this.rightPad.score;
            if (this.rightPad.score >= this.objective) {
				if (this.gamemode == "tournament")
					this.winMatch(pad);
				else if (this.gamemode == "AI")
                	this.endGame("AI");
				else
					this.endGame(this.usernames.p2);
            }
		}
		this.ball.resetPosition();
	}	

	drawObjects() {
		this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

		// Make the canvas background more opaque
		this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

		this.drawNet();

		this.drawRect(this.leftPad.x, this.leftPad.y, this.leftPad.width, this.leftPad.height, this.leftPad.color);
		this.drawRect(this.rightPad.x, this.rightPad.y, this.rightPad.width, this.rightPad.height, this.rightPad.color);

		this.drawSquare(this.ball.x, this.ball.y, this.ball.size, this.ball.color);
		if (!this.gameOver)
			requestAnimationFrame(this.drawObjects);
	}

	update() {
		this.leftPad.move();
		this.rightPad.move();
		this.ball.move();
	}

	startGameLoop() {
		if (!this.interval) {
			this.interval = setInterval(() => {
				this.update();
			}, 5);
		}
		requestAnimationFrame(this.drawObjects);
	}

	stopInterval() {
		clearInterval(this.interval);
		this.interval = null;
	}

	handleKeyDown = (event) => {
		// Prevent buttons from moving the page
		if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
			event.preventDefault();
		}
		if (!this.paused && this.gameStarted) {
			switch (event.code) {
				case this.keybinds.lUp:
					this.leftPad.direction = "up";
					break;
				case this.keybinds.lDown:
					this.leftPad.direction = "down";
					break;
				case this.keybinds.lMini: 
					if (this.gamestyle == "enhanced")
						this.leftPad.useMinimize();
					break;
				case this.keybinds.rUp:
					this.rightPad.direction = "up";
					break;
				case this.keybinds.rDown:
					this.rightPad.direction = "down";
					break;
				case this.keybinds.rMini:
					if (this.gamestyle == "enhanced" && this.gamemode != "AI")
						this.rightPad.useMinimize();
					break;
				default:
					break;
			}
		}
		if (event.code == 'Escape') {
			this.pauseGame();
		}	
	};

	handleKeyUp = (event) => {
		if (!this.paused && this.gameStarted) {
			switch (event.code) {
				case this.keybinds.lUp:
					if (this.leftPad.direction == "up")
						this.leftPad.direction = "";
					break;
				case this.keybinds.lDown:
					if (this.leftPad.direction == "down")
						this.leftPad.direction = "";
					break;
				case this.keybinds.rUp:
					if (this.rightPad.direction == "up")
						this.rightPad.direction = "";
					break;
				case this.keybinds.rDown:
					if (this.rightPad.direction == "down")	
						this.rightPad.direction = "";
					break;
				default:
					break;
			}
		}
	};

	stopGameLoop() {
		this.timer.stop();
		this.stopInterval();
		this.gameOver = true;
	}
}