export class Timer {
	constructor(pongGame) {
		this.pG = pongGame;
		this.sec = 0;
		this.min = 0;
		this.interval = null;

		this.timer = document.getElementById('timer');
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
		this.updateDisplay();
	}

	updateTime() {
		this.sec++;

		// Update minutes if 60 seconds is reached
		if (this.sec == 60) {
			this.min++;
			this.sec = 0;
		}

		this.updateDisplay();
	}
	updateDisplay() {
		this.timer.textContent = this.getTime();
	}

	getTime() {
		return (this.min.toString().padStart(2, '0') + ":" + this.sec.toString().padStart(2, '0'));
	}
}