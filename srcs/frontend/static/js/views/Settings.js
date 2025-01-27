import AbstractView from "./AbstractView.js";
import { settings } from "../scripts/settings.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("settings");
    }

    async getHtml() {
        return (await fetch("static/html/settings.html")).text();
    }

	loadJS() {
		settings();
	}

    stopJS(){
		// No loop in this view
	}

}