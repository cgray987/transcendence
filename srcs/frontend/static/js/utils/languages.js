// Switch language setting
let translations = {};

async function loadTranslations(language) {
	const response = await fetch(`static/languages/${language}.json`);
	const translations = await response.json();
	return translations;
}

export async function setLanguage(language) {
	translations = await loadTranslations(language);
	updateTexts();
}

export function updateTexts() {
	document.querySelectorAll('[data-translate]').forEach(element => {
		const key = element.getAttribute('data-translate');
		if (element.getAttribute('placeholder')) {
			element.setAttribute('placeholder', translations[key]);
			return;
		} else {
			element.textContent = translations[key];
		}
	});
}

export function updateTextForElem(elem, key) {
	elem.textContent = translations[key];
}

export function getText(key) {
	return translations[key];
}