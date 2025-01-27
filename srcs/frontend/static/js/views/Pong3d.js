import AbstractView from "./AbstractView.js";
//import { basePong }  from "../scripts/pong/basicPong.js";
import { pongThree, eventListeners } from "../scripts/pong/pong3d/main.js";

export default class Pong extends AbstractView {
    constructor() {
        super();
        this.setTitle("pong");
        this.pongThree;
    }

    async getHtml() {
        return (await fetch("/static/html/pong3d.html")).text();
    }

    loadJS() {
        this.pongThree = new pongThree();
    }

    stopJS() {
        this.pongThree.stopGameLoop();
    }

    cleanUpEventListeners() {
        for (const [event, listener] of Object.entries(eventListeners)) {
            document.removeEventListener(event, listener);
        }
    }

}