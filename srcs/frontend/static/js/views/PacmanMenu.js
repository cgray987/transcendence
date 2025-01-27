import AbstractView from "./AbstractView.js";
import { PacmanMenu, eventListeners } from "../scripts/pacmanMenu.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("pacman menu");
    }

    async getHtml() {
        return (await fetch("static/html/pacmanMenu.html")).text();
    }

	loadJS() {
		var pacmanMenu = new PacmanMenu();
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