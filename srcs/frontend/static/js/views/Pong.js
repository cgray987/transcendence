import AbstractView from "./AbstractView.js";
import { PongGame, eventListeners }  from "../scripts/pong/pong.js";
import { initCursorClickEffect } from "../visual/effects.js";

export default class Pong extends AbstractView {
    constructor() {
        super();
        this.setTitle("pong");
		this.pongGame;
    }

    async getHtml() {
        return (await fetch("/static/html/pong.html")).text();
    }

	loadJS() {
		this.pongGame = new PongGame();
		initCursorClickEffect();
	}

	stopJS(){
		this.pongGame.stopGameLoop();
	}

	cleanUpEventListeners() {
		for (const [event, listener] of Object.entries(eventListeners)) {
			document.removeEventListener(event, listener);
		}
	}
}