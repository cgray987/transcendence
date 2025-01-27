import AbstractView from "./AbstractView.js";
import { profile } from "../scripts/profile.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("profile");
    }

    async getHtml() {
		return (await fetch("static/html/profile.html")).text();
    }

	async loadJS() {
		await profile();
	}

  stopJS(){
		// No loop in this view
	}

}