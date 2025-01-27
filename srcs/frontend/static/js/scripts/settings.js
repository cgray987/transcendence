import { setLanguage } from '../utils/languages.js';
import { moveNoise } from '../visual/effects.js';
import { ids } from '../index.js';
import { BIG_TEXT, DEFAULT_TEXT } from '../index.js';

// Function that will be called when the view is loaded
export function settings() {
	// Graphics settings
	const ultraRadio = document.getElementById("graphics-ultra-radio");
	const mediumRadio = document.getElementById("graphics-medium-radio");
	const noneRadio = document.getElementById("graphics-none-radio");
	const noiseCheckbox = document.getElementById("graphics-noise-checkbox");
	
	const gradientsContainer = document.querySelector('.gradients-container');
	const videoBackground = document.querySelector('#video-background');

	ultraRadio.addEventListener("change", () => {
		if (ultraRadio.checked) {
			localStorage.setItem('graphics', 'ultra');
			gradientsContainer.style.display = 'block';
			videoBackground.style.display = 'none';
		}
	});

	mediumRadio.addEventListener("change", () => {
		if (mediumRadio.checked) {
			localStorage.setItem('graphics', 'medium');
			gradientsContainer.style.display = 'none';
			videoBackground.style.display = 'block';
		}
	});

	noneRadio.addEventListener("change", () => {
		if (noneRadio.checked) {
			localStorage.setItem('graphics', 'none');
			gradientsContainer.style.display = 'none';
			videoBackground.style.display = 'none';
		}
	});

	noiseCheckbox.addEventListener("change", () => {
		if (noiseCheckbox.checked) {
			localStorage.setItem('noise', 'on');
			document.querySelector('.background-noise').style.display = 'block';
			ids.moveNoiseInterval = setInterval(moveNoise, 100);

		} else {
			localStorage.setItem('noise', 'off');
			document.querySelector('.background-noise').style.display = 'none';
			clearInterval(ids.moveNoiseInterval);
		}
	});

	// Apply the graphics setting from the local storage
	let graphicsSetting = localStorage.getItem('graphics');

	if (graphicsSetting === 'ultra') {
		ultraRadio.checked = true;
	} else if (graphicsSetting === 'medium') {
		mediumRadio.checked = true;
	} else {
		noneRadio.checked = true;
	}

	let noiseSetting = localStorage.getItem('noise');

	if (noiseSetting === 'on') {
		noiseCheckbox.checked = true;
	}		
	
	// Switch language setting
	document.getElementById('languageSwitcher').addEventListener('change', (event) => {
		setLanguage(event.target.value);
		// Save the language setting in the local storage
		localStorage.setItem('language', event.target.value);
	});

	// Apply the language setting from the local storage
	const languageSetting = localStorage.getItem('language');
	document.getElementById('languageSwitcher').value = languageSetting ? languageSetting : 'en';

	// Big text setting
	const bigTextCheckbox = document.getElementById('big-text-checkbox');
	bigTextCheckbox.addEventListener('change', (event) => {
		if (event.target.checked) {
			document.documentElement.style.fontSize = BIG_TEXT;
			localStorage.setItem('bigText', 'on');
		} else {
			document.documentElement.style.fontSize = DEFAULT_TEXT;
			localStorage.setItem('bigText', 'off');
		}
	});

	// Apply the big text setting from the local storage
	const bigTextSetting = localStorage.getItem('bigText');
	if (bigTextSetting === 'on') {
		bigTextCheckbox.checked = true;
	} else {
		bigTextCheckbox.checked = false;
	}
}