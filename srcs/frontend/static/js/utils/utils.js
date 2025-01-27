import { BASE_URL, navigateTo } from '../index.js';

export const isUserConnected = async () => {
	const response = await fetch(`${BASE_URL}/api/profile`);

	if (response.status === 401 || response.status === 400) {
		return (false);
	}
	return (true);
}

// Function to attach event listeners to the links
// Overwrite the default behavior of the links (<a> tags)
// When a link is clicked, the navigateTo function is called
// The navigateTo function changes the URL and calls the router function 
// to load the new view without reloading the page.
export const attachEventListenersToLinks = () => {
	// Select all links with the attribute data-link
	const links = document.querySelectorAll('[data-link]');

	// Attach event listener to each link
	links.forEach(link => {
		link.addEventListener("click", e => {
			e.preventDefault();
			navigateTo(link.href);
		});
	});
}