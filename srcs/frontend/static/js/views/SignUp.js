import AbstractView from "./AbstractView.js";
import { signUp } from "../scripts/signUp.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("sign up");
    }

    async getHtml() {
        return (await fetch("static/html/signUp.html")).text();
    }

    loadJS() {
        signUp();
    }

    stopJS(){
		// No loop in this view
	}

}
