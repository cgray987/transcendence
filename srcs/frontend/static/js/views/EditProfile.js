import AbstractView from "./AbstractView.js";
import { editProfile } from "../scripts/editProfile.js";
// import { eventListeners } from "../scripts/editProfile.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("dit profile");
    }

    async getHtml() {
        return (await fetch("static/html/editProfile.html")).text();
    }

    loadJS() {
        editProfile();
    }

    stopJS(){
		// No loop in this view
	}


    // cleanUpEventListeners() {
    //  for (const [event, listener] of Object.entries(eventListeners)) {
    //      document.removeEventListener(event, listener);
    //  }
    // }
}
