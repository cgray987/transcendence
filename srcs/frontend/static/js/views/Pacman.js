import AbstractView from "./AbstractView.js";
import { PacmanGame, eventListeners } from "../scripts/pacman.js";
import { initCursorClickEffect } from "../visual/effects.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("pacman");
		this.pacmanGame;
    }

    async getHtml() {
        return (await fetch("static/html/pacman.html")).text();
    }

	loadJS() {
		this.pacmanGame = new PacmanGame();
		initCursorClickEffect();
	}

	stopJS(){
		this.pacmanGame.stopGameLoop();
	}


	cleanUpEventListeners() {
		for (const [event, listener] of Object.entries(eventListeners)) {
			document.removeEventListener(event, listener);
		}
	}
}