import AbstractView from "./AbstractView.js";
import { pacmanStatistics } from "../scripts/pacmanStatistics.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("pacman statistics");
    }

    async getHtml() {
        return (await fetch("static/html/pacmanStatistics.html")).text();
    }

    loadJS() {
        pacmanStatistics();
    }
}
