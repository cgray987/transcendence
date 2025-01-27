import { BASE_URL } from '../index.js';
import { updateTextForElem } from '../utils/languages.js';
import { navigateTo } from '../index.js';
import { validateUsername, validateEmail, validatePassword } from '../utils/validateInput.js';

// Function that will be called when the view is loaded
export function signUp () {
	// Get the form elements from the HTML
	const usernameElem = document.getElementById('username');
	const emailElem = document.getElementById('email');
	const passwordElem = document.getElementById('password');
	
	const usernameErrorElem = document.getElementById('username-error');
	const emailErrorElem = document.getElementById('email-error');
	const passwordErrorElem = document.getElementById('password-error');
	
	// Add event listeners for when the user leaves the input fields
	usernameElem.addEventListener('blur', () => validateUsername(usernameElem, usernameErrorElem));
	emailElem.addEventListener('blur', () => validateEmail(emailElem, emailErrorElem));
	passwordElem.addEventListener('blur', () => validatePassword(passwordElem, passwordErrorElem));
	
	// Add event listener for the submit button
	const signUpButtonElem = document.getElementById('sign-up-button');
	signUpButtonElem.addEventListener('click', submitForm);

	async function submitForm(e) {
		// Prevent the default behavior of the form
		e.preventDefault();

		// Make sure that all the fields are valid (at least front-end-wise)
		const usernameValid = validateUsername(usernameElem, usernameErrorElem);
		const emailValid = validateEmail(emailElem, emailErrorElem);
		const passwordValid = validatePassword(passwordElem, passwordErrorElem);

		// If all the fields are valid, send the data to the server
		if (usernameValid && emailValid && passwordValid) {
			const username = usernameElem.value;
			const email = emailElem.value;
			const password = passwordElem.value;

			const data = {
				username,
				email,
				password
			};

			// Send the data to the server
			const response = await fetch(`${BASE_URL}/api/signup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})

			// If the status is an error, show the error message in the correct fields
			if (response.status === 400) {
				const responseData = await response.json();
				if (responseData.username) {
					updateTextForElem(document.getElementById('username-error'), responseData.username[0]);
				}
				if (responseData.email) {
					updateTextForElem(document.getElementById('email-error'), responseData.email[0]);
				}
				if (responseData.password) {
					updateTextForElem(document.getElementById('password-error'), responseData.password[0]);
				}
			} else if (response.status === 200) {
				// If the response status is success, show success message and navigate to the login page
				const containerLogin = document.querySelector('.container-login');
				containerLogin.innerHTML = `
					<div class="success text-center">
						<h1 id="success-message" class="text-white" data-translate"sign-up-success">Sign up successful!</h1>
						<div class="d-flex align-items-center justify-content-center p-5">
							<svg class='loading-icon' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24" id="Timer-Zero--Streamline-Sharp">
								<desc>Timer Zero Streamline Icon: https://streamlinehq.com</desc>
								<g id="timer-zero--whole-midnight-hour-clock-time">
									<path id="Union" fill="#FFFFFF" fillRule="evenodd" d="M10.75 5V1h2.5v4h-2.5Zm-7.134 0.384 2.5 2.5 1.768 -1.768 -2.5 -2.5 -1.768 1.768Zm14.268 2.5 2.5 -2.5 -1.768 -1.768 -2.5 2.5 1.768 1.768Zm0 8.232 2.5 2.5 -1.768 1.768 -2.5 -2.5 1.768 -1.768Zm-11.768 0 -2.5 2.5 1.768 1.768 2.5 -2.5 -1.768 -1.768ZM10.75 19v4h2.5v-4h-2.5ZM5 13.25H1v-2.5h4v2.5Zm14 0h4v-2.5h-4v2.5Z" clipRule="evenodd" strokeWidth="1"></path>
								</g>
							</svg>
						</div>
					</div>
				`;
				updateTextForElem(document.getElementById('success-message'), 'sign-up-success');
				setTimeout(() => {
					navigateTo('/signin');
				}, 1000);
			} else {
				const responseData = await response.json();
				// If the response status is unknown, show an error message
				const containerLogin = document.querySelector('.container-login');
				containerLogin.innerHTML = `
					<div class="error text-center">
						<h1 id="failure-message" class="text-white">An error occured in the server</h1>
						<p class="text-white">${responseData.error}</p>
					</div>
				`;
				updateTextForElem(document.getElementById('failure-message'), 'sign-up-failure');
			}
		}
	};
}
