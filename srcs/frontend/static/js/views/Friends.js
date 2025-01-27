import AbstractView from "./AbstractView.js";
import { friends } from "../scripts/friends.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("friends");
    }

    async getHtml() {
        return (await fetch("static/html/friends.html")).text();
    }

    loadJS() {
        friends();
    }
}
