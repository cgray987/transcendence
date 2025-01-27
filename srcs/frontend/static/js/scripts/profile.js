import { navigateTo } from "../index.js";
import { BASE_URL } from "../index.js";

export async function profile() {
	async function renderLoggingInfo() {
		// Check if the user is logged in or not
		const response = await fetch(`${BASE_URL}/api/profile`);

		// If the user is not logged in, redirect to the login page
		if (response.status !== 200) {
			navigateTo('/signin');
		}
		// If the user is logged in, show the profile page
		else {
			const responseData = await response.json();
			const user = responseData.user;

			// Store the user id in the local storage
			localStorage.setItem('user_id', user.id);

			const usernameElem = document.getElementById('username-name');
			usernameElem.innerText = user.username;

			const emailElem = document.getElementById('username-email');
			emailElem.innerText = user.email;

			// Get the user's avatar
			const avatarElem = document.getElementById('avatar');
			const responseAvatar = await fetch(`${BASE_URL}/api/user_avatar`);

			if (responseAvatar.status !== 200) {
				avatarElem.src = 'static/assets/images/profile_pic_transparent.png';
			} else {
				const blob = await responseAvatar.blob();
				const url = URL.createObjectURL(blob);
				avatarElem.src = url;
			}

			// Show the profile page
			const profilePage = document.getElementById('profile-page');
			profilePage.style.display = 'flex';
		}
	}

	// Log out button
	const logoutButton = document.querySelector('#logout-button');
	logoutButton.addEventListener('click', async () => {
		await fetch(`${BASE_URL}/api/logout`, {
			method: 'POST',
		});
		// Empty the local storage
		localStorage.removeItem('user_id');
		localStorage.removeItem('pacmanSkin');
		localStorage.removeItem('ghostSkin');
		localStorage.removeItem('pacmanGamemode');
		localStorage.removeItem('mapName');
		localStorage.removeItem('pacmanKeybinds');
		localStorage.removeItem('pacmanTheme');
		localStorage.removeItem('themeName');
		localStorage.removeItem('pacmanUsernames');
		localStorage.removeItem('pongColors');
		localStorage.removeItem('pongUsernames');
		localStorage.removeItem('pongKeybinds');
		localStorage.removeItem('gamemode');
		localStorage.removeItem('pongGamestyle');
		
		// Redirect to the login page
		navigateTo('/signin');
		
	})

	await renderLoggingInfo();
}