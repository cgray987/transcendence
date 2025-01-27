import AbstractView from "./AbstractView.js";
import { PongMenu, eventListeners } from "../scripts/pongMenu.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("pong menu");
    }

    async getHtml() {
        return (await fetch("static/html/pongMenu.html")).text();
    }

	loadJS() {
		var pongMenu = new PongMenu();
	}
	
	stopJS(){
		// No loop in this view
	}


	cleanUpEventListeners() {
		for (const [event, listener] of Object.entries(eventListeners)) {
			document.removeEventListener(event, listener);
		}
	}
}