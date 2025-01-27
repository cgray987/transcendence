import { updateTextForElem } from "../../utils/languages.js";

export class Tournament {
	constructor(pNumber, usernames, pG) {
		this.playerNumber = pNumber;
		this.usernames = usernames;
		this.tournamentOver = false;
		this.tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
		this.tournamentMatchEndModal = new bootstrap.Modal(document.getElementById('tournamentMatchEndModal'));
		this.playersTournament =  document.getElementById('playersTournament');
		this.matchTournament =  document.getElementById('matchTournament');
		this.winner =  document.getElementById('matchWinner');
		this.matchIdModal =  document.getElementById('matchId');
		this.timeElapsed = document.getElementById('matchTimeElapsed')
		this.pG = pG;

		this.matchId = 0;
		this.maxMatchNb = this.playerNumber - 1;
		this.playerArray1 = this.playerNumber == 4 ? 
			["p1", "p2", "p3", "p4"] : ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"] ;
		this.playerArray1 = this.shuffleArray(this.playerArray1);
		this.currentMatch;
		this.playerArray2 = [];
    }

	getCurrentPlayers() {
		if (this.playerNumber == 4) {
			switch (this.matchId) {
				case 0:
					this.currentMatch = {left: this.playerArray1[0], right: this.playerArray1[1]};
					break;
				case 1:
					this.currentMatch = {left: this.playerArray1[2], right: this.playerArray1[3]};
					break;
				case 2:
					this.currentMatch = {left: this.playerArray2.left, right: this.playerArray2.right};
					break;
				default:
					break;
			}
			this.matchTournament.textContent = this.matchId + 1;
			this.playersTournament.textContent = this.usernames[this.currentMatch.left] + " VS " + this.usernames[this.currentMatch.right];
			this.tournamentModal.show();
			return this.currentMatch;
		}
	}

	setCurrentMatchWinner(side) {
		if (this.playerNumber == 4) {
			switch (this.matchId) {
				case 0:
					this.playerArray2.left = this.currentMatch[side];
					break;
				case 1:
					this.playerArray2.right = this.currentMatch[side];
					break;
				case 2:
					this.tournamentOver = true;
					break;
				default:
					break;
			}
		}
		if (!this.tournamentOver) {
			this.matchIdModal.textContent = this.matchId + 1;
			this.winner.textContent = this.usernames[this.currentMatch[side]];
			this.timeElapsed.textContent = this.pG.timer.getTime();
			this.tournamentMatchEndModal.show();

			this.matchId++;
		}
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
}

export class Timer {
	constructor(pongGame) {
		this.pG = pongGame;
		this.sec = 0;
		this.min = 0;
		this.interval = null;

		this.timer = document.getElementById('timer');
		this.lMinimizeLabel = document.getElementById('lMinimizeCD');
		this.rMinimizeLabel = document.getElementById('rMinimizeCD');
		if (this.pG.gamestyle != "enhanced") {
			this.lMinimizeLabel.style.display = "none";
			this.rMinimizeLabel.style.display = "none";
		}

		// Spells
		this.minimizeDuration = 10;
		this.minimizeCooldown = 20;
		this.leftMinimizeCD = 0;
		this.rightMinimizeCD = 0;
	}

	start() {
		if (!this.interval) {
			this.interval = setInterval(() => {
				this.updateTime();
			}, 1000);
		}
	}

	stop() {
		clearInterval(this.interval);
		this.interval = null;
	}

	reset() {
		this.stop();
		this.sec = 0;
		this.min = 0;
		this.leftMinimizeCD = 0;
		this.rightMinimizeCD = 0;
		this.updateDisplay();
	}

	updateTime() {
		this.sec++;
	
		if (this.leftMinimizeCD > 0) {
			this.leftMinimizeCD--;
			if (this.leftMinimizeCD + this.minimizeDuration == this.minimizeCooldown) {
				this.pG.leftPad.stopMinimize();
			}
		}
			
		if (this.rightMinimizeCD > 0) {
			this.rightMinimizeCD--;
			if (this.rightMinimizeCD + this.minimizeDuration == this.minimizeCooldown) {
				this.pG.rightPad.stopMinimize();
			}
		}

		// Update minutes if 60 seconds is reached
		if (this.sec == 60) {
			this.min++;
			this.sec = 0;
		}

		this.updateDisplay();
	}
	updateDisplay() {
		this.timer.textContent = this.getTime();

		if (this.leftMinimizeCD > 0)
			this.lMinimizeLabel.textContent = this.leftMinimizeCD.toString().padStart(2, '0');
		else
			updateTextForElem(this.lMinimizeLabel, "ready");

		if (this.rightMinimizeCD > 0)
			this.rMinimizeLabel.textContent = this.rightMinimizeCD.toString().padStart(2, '0');
		else
			updateTextForElem(this.rMinimizeLabel, "ready");
	}

	startMinimizeCD(placement) {
		if (placement == "left") {
			if (this.leftMinimizeCD > 0)
				return false;
			this.leftMinimizeCD = this.minimizeCooldown;
			this.lMinimizeLabel.textContent = this.leftMinimizeCD.toString().padStart(2, '0');
			return true;
		}
		else if (placement =="right") {
			if (this.rightMinimizeCD > 0)
				return false;
			this.rightMinimizeCD = this.minimizeCooldown;
			this.rMinimizeLabel.textContent = this.rightMinimizeCD.toString().padStart(2, '0');
			return true;
		}
		return false;
	}

	getTime() {
		return (this.min.toString().padStart(2, '0') + ":" + this.sec.toString().padStart(2, '0'));
	}
}

export class Ball {
    constructor(size, color, baseSpeed, maxY, maxX, pongGame) {
        this.x;
		this.y;
		this.size = size;
		this.color = color;
		this.speed;
		this.baseSpeed = baseSpeed;
		this.dx = baseSpeed;
		this.maxY = maxY;
		this.maxX = maxX;
		this.pG = pongGame;

		this.resetPosition();
	}

	collisionDetect(pad) {
		pad.top = pad.y;
		pad.bottom = pad.y + pad.height;
		pad.left = pad.x;
		pad.right = pad.x + pad.width;

		this.top = this.y;
		this.bottom = this.y + this.size;
		this.left = this.x;
		this.right = this.x + this.size;

		return pad.left < this.right && pad.top < this.bottom && pad.right > this.left && pad.bottom > this.top;
	}

	move() {
		this.x += this.dx;
		this.y += this.dy;

		let movesRight = this.dx > 0 ? true : false;

		if (this.y + this.size > this.maxY || this.y < 0) {
			this.dy *= -1;
		}

		let currentPad = movesRight ? this.pG.rightPad : this.pG.leftPad;

		if (this.collisionDetect(currentPad)) {
			this.dx *= -1;
			this.speed += 0.2;
			this.dx = this.dx > 0 ? this.speed : -this.speed;

			if (this.pG.gamestyle == "enhanced" && currentPad.direction != "") {
				// Apply a velocity change 
				this.dy *= 	((this.dy > 0 && currentPad.direction == "down") || 
							(this.dy < 0 && currentPad.direction == "up")) ?
							1.2 : -0.9;
				// Keep the values acceptable
				if (this.dy > 0) {
					this.dy = Math.max(0.3, Math.min(this.dy, 4));
				} else {
					this.dy = Math.min(-0.3, Math.max(this.dy, -4));
				}
			}
		}

		if (this.x + this.size > this.maxX) {
			this.pG.scorePoint("left");
		} 
		else if (this.x < 0) {
			this.pG.scorePoint("right");
		}
	}

	resetPosition() {
		this.x = this.maxX / 2;
		this.y = this.maxY / 2;
		this.speed = this.baseSpeed + 0.3;

		if (Math.random() > 0.5) {
			this.dx = this.baseSpeed;
		} 
		else {
			this.dx = -this.baseSpeed;
		}

		if (Math.random() > 0.5) {
			this.dy = (Math.random() * 1.3 + 0.5);
		} 
		else {
			this.dy = -(Math.random() * 1.3 + 0.5);
		}
	}
}

export class Pad {
	constructor(x, y, width, height, placement, color, dy, maxY, isAI, pongGame) {
        this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.placement = placement;
		this.color = color;
		this.dy = dy;
		this.maxY = maxY;
		this.isAI = isAI;
		this.ball;
		this.score = 0;
		this.direction = "";
		this.pG = pongGame;
		this.isMinimized = false;
		this.refresh_rate = 1000;
		this.lastAIUpdate = Date.now();
		this.predictedPosition = null;
    }

	useMinimize() {
		if (this.pG.timer.startMinimizeCD(this.placement)) {
			if (this.placement == "left") {
				this.pG.rightPad.height /= 2;
				this.pG.rightPad.isMinimized = true;
				this.pG.rightPad.y += this.pG.rightPad.height / 2;
			}				
			else {
				this.pG.leftPad.height /= 2;
				this.pG.leftPad.isMinimized = true;
				this.pG.leftPad.y += this.pG.leftPad.height / 2;
			}
		}	
	}

	stopMinimize() {
		if (this.placement == "left") {
			this.pG.rightPad.y -= this.pG.rightPad.height / 2;
			this.pG.rightPad.height *= 2;
			this.pG.rightPad.isMinimized = false;

		}				
		else {
			this.pG.leftPad.y -= this.pG.leftPad.height / 2;
			this.pG.leftPad.height *= 2;
			this.pG.leftPad.isMinimized = false;

		}
	}

	move() {
		if (!this.isAI) {
			if (this.direction == "up" && this.y > 0) {
				this.y -= this.dy;
			}
			else if (this.direction == "down" && this.y < this.maxY - this.height) {
				this.y += this.dy;
			}
		}
		else {
			this.checkMinimize();
			if (this.ball && ((this.placement === "left" && this.ball.dx > 0) || 
			(this.placement === "right" && this.ball.dx < 0))) {
				this.goMid();
			} else {

				this.AiPredictPaddle();
			}
		}

		this.paddleEdgeCollision();
	}
	
	checkMinimize() {
		const cvsPortion = this.pG.cvs.width / 5;
		if (this.pG.timer.rightMinimizeCD == 0 && this.ball.dx < 0 && this.ball.x < cvsPortion && this.pG.gamestyle == "enhanced") {
            this.useMinimize();
		}
	}

	AiPredictPaddle() {
		const currentTime = Date.now();
		// Checks the image once per second 
		if (currentTime - this.lastAIUpdate >= this.refresh_rate) {
			this.lastAIUpdate = currentTime;
			if (this.ball && this.ball.dx > 0) {
				this.predictedPosition = this.predictBallPosition();
				// console.log("Predicted Position:", this.predictedPosition);
			}
		}
		if (this.predictedPosition && this.ball && this.ball.dx > 0) {
			let targetY;
			if (this.pG.rightPad.isMinimized) {
				targetY = this.predictedPosition.y - (this.height / 2);
			} else {
				const paddleThird = this.height / 3;
				if (this.ball.dy > 0) {
					// Ball moving down, aim for top third
					targetY = this.predictedPosition.y - paddleThird;
				} else {
					// Ball moving up, aim for bottom third
					targetY = this.predictedPosition.y - (2 * paddleThird);
				}
			}
			// Move paddle towards target
			if (this.y < targetY - 1) {
				this.y += this.dy;
			} else if (this.y > targetY + 1) {
				this.y -= this.dy;
			}
		}
		
	}

predictBallPosition() {
    if (!this.ball) {
        return null;
    }
    let futureX = this.ball.x;
    let futureY = this.ball.y;
    let velocityX = this.ball.dx;
    let velocityY = this.ball.dy;
	const paddleX = this.x;

    if (this.pG.aiDifficulty === 'easy') {
        const framesAhead = 60;

        for (let i = 0; i < framesAhead; i++) {
            futureX += velocityX;
            futureY += velocityY;

            if (futureX >= paddleX) {
                return { y: futureY };
            }

            if (futureY + this.ball.size / 2 >= this.pG.cvs.height || futureY - this.ball.size / 2 <= 0) {
                velocityY *= -1;
            }
        }
		return { y: futureY };
    } else {
        while (futureX < paddleX) {
            futureX += velocityX;
            futureY += velocityY;
            if (futureY + this.ball.size / 2 >= this.pG.cvs.height || futureY - this.ball.size / 2 <= 0) {
                velocityY *= -1;
            }
        }
        return { y: futureY };
    }
}



	paddleEdgeCollision() {
		if (this.y < 0) {
			this.y = 0;
		} else if (this.y + this.height > this.maxY) {
			this.y = this.maxY - this.height;
		}
	}

	// Return Paddle in the middle after hitting the ball
	goMid() {
		const middleY = (this.maxY - this.height) / 2;
		const moveSpeed = this.dy; 
	
		if (Math.abs(this.y - middleY) > moveSpeed) {
			if (this.y < middleY) {
				this.y += moveSpeed;
			} else {
				this.y -= moveSpeed;
			}
		} else {
			this.y = middleY;
		}
	}
	
}


