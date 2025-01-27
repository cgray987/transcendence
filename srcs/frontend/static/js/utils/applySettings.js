import { setLanguage } from './languages.js';
import { moveNoise } from '../visual/effects.js';
import { ids, BIG_TEXT, DEFAULT_TEXT } from '../index.js';

// Backgorund gradients
const applyGraphics = () => {
	let graphicsSetting = localStorage.getItem('graphics');

	// If the graphics setting is not set, set it to "medium" by default
	if (!graphicsSetting) {
		localStorage.setItem('graphics', 'medium');
		graphicsSetting = 'medium';
	}

	const gradientsContainer = document.querySelector('.gradients-container');
	const videoBackground = document.querySelector('#video-background');

	if (graphicsSetting === 'ultra') {
		gradientsContainer.style.display = 'block';
		videoBackground.style.display = 'none';
	} else if (graphicsSetting === 'medium') {
		gradientsContainer.style.display = 'none';
		videoBackground.style.display = 'block';
	} else if (graphicsSetting === 'none') {
		gradientsContainer.style.display = 'none';
		videoBackground.style.display = 'none';
	}
}

// Background noise
const applyNoise = (interval) => {
	let noiseSetting = localStorage.getItem('noise');

	// If the noise setting is not set, set it to "on" by default
	if (!noiseSetting) {
		localStorage.setItem('noise', 'on');
		noiseSetting = 'on';
	}

	const noiseElement = document.querySelector('.background-noise');

	if (noiseSetting === 'on') {
		noiseElement.style.display = 'block';
		ids.moveNoiseInterval = setInterval(moveNoise, interval);
	} else  if (noiseSetting === 'off') {
		noiseElement.style.display = 'none';
	}
}

// Set text size
const applyTextSize = () => {
	if (localStorage.getItem('bigText') === 'on') {
		document.documentElement.style.fontSize = BIG_TEXT;
	} else {
		document.documentElement.style.fontSize = DEFAULT_TEXT;
	}
}

// Apply the settings from the local storage
export const applySettings = async () => {
	applyGraphics();
	applyNoise(100);
	applyTextSize();
	await setLanguage(localStorage.getItem('language') ? localStorage.getItem('language') : 'en');
}