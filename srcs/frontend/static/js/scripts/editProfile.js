import { updateTextForElem } from "../utils/languages.js";
import { navigateTo } from '../index.js';
import { BASE_URL } from '../index.js';
import { isUserConnected } from "../utils/utils.js";
import { validateUsername, validateEmail, validatePassword } from "../utils/validateInput.js";

// Function that will be called when the view is loaded
export async function editProfile () {
	if (!(await isUserConnected())) {
		navigateTo('/signin');
		return;
	}
	
	// State of all forms
	const changes = {
		profilePicture: false,
		username: false,
		email: false,
		password: false
	};

    // Get the form elements from the HTML
	const avatarElem = document.getElementById('avatar');
	const avatarInputElem = document.getElementById('avatar-input');
	const usernameElem = document.getElementById('username');
	const emailElem = document.getElementById('email');
	const passwordElem = document.getElementById('password');
	
	const usernameErrorElem = document.getElementById('username-error');
	const emailErrorElem = document.getElementById('email-error');
	const passwordErrorElem = document.getElementById('password-error');
	const avatarErrorElem = document.getElementById('avatar-error');
	
	// Add event listeners for when the user leaves the input fields
	usernameElem.addEventListener('blur', () => validateUsername(usernameElem, usernameErrorElem));
	emailElem.addEventListener('blur', () => validateEmail(emailElem, emailErrorElem));
	passwordElem.addEventListener('blur', () => validatePassword(passwordElem, passwordErrorElem));

	avatarInputElem.addEventListener('change', () => {
		changes.profilePicture = true;
		// change the image if its valid
		if (validateAvatar()) {
			const avatar = avatarInputElem.files[0];
			const url = URL.createObjectURL(avatar);
			avatarElem.src = url;
		}
	});
	usernameElem.addEventListener('change', () => {
		changes.username = true;
	});
	emailElem.addEventListener('change', () => {
		changes.email = true;
	});
	passwordElem.addEventListener('change', () => {
		changes.password = true;
	});
	
	// Add event listener for the submit button
	const saveButtonElem = document.getElementById('save-button');
	saveButtonElem.addEventListener('click', submitForm);

	// Get the user's avatar
	const responseAvatar = await fetch(`${BASE_URL}/api/user_avatar`);

	if (responseAvatar.status !== 200) {
		avatarElem.src = 'static/assets/images/profile_pic_transparent.png';
	} else {
		const blob = await responseAvatar.blob();
		const url = URL.createObjectURL(blob);
		avatarElem.src = url;
	}

	// Get the user's data
	const response = await fetch(`${BASE_URL}/api/profile`);

	if (response.status === 200) {
		const responseData = await response.json();
		const user = responseData.user;

		usernameElem.value = user.username;
		emailElem.value = user.email;
	}

	// Validates profile picture
	function validateAvatar() {
		const avatar = avatarInputElem.files[0];
		const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
		if (!avatar) {
			updateTextForElem(avatarErrorElem, 'avatar-empty-error');
			return false;
		}
		if (!allowedExtensions.exec(avatar.name)) {
			updateTextForElem(avatarErrorElem, 'avatar-invalid-error');
			return false;
		}
		// check if the file is less than 2MB
		if (avatar.size > 1024 * 1024) {
			updateTextForElem(avatarErrorElem, 'avatar-size-error');
			return false;
		}
		avatarErrorElem.textContent = '\u00A0';
		return true;
	}

	async function submitForm(e) {
		// Prevent the default behavior of the form
		e.preventDefault();

		// Check if at least one input has changed
		let changesAvailable = false;

		for (let value of Object.values(changes)) {
			if (value === true) {
				changesAvailable = true;
				break;
			}
		}

		if (!changesAvailable) {
			return;
		}

		// Data to be sent to the server
		const formData = new FormData();

		// Validate only the fields that have been changed
		let formValid = true;
		if (changes.profilePicture) {
			if (!validateAvatar()) {
				formValid = false;
			}
			formData.append('profile_picture', avatarInputElem.files[0]);
		}
		if (changes.username) {
			if (!validateUsername(usernameElem, usernameErrorElem)) {
				formValid = false;
			}
			formData.append('username', usernameElem.value);
		}
		if (changes.email) {
			if (!validateEmail(emailElem, emailErrorElem)) {
				formValid = false;
			}
			formData.append('email', emailElem.value);
		}
		if (changes.password) {
			if (!validatePassword(passwordElem, passwordErrorElem)) {
				formValid = false;
			}
			formData.append('password', passwordElem.value);
		}

		if (formValid) {
			// Send the data to the server
			const response = await fetch(`${BASE_URL}/api/update_user`, {
				method: 'PUT',
				body: formData
			})

			// If the status is an error, show the error message in the correct fields
			if (response.status === 400) {
				// Get the response data into json
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
				const containerEdit = document.querySelector('.container-edit');
				containerEdit.innerHTML = `
					<div class="success text-center">
						<h1 id="success-message" class="text-white" data-translate"save-success">Sign up successful!</h1>
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
				updateTextForElem(document.getElementById('success-message'), 'save-success');
				setTimeout(() => {
					navigateTo('/profile');
				}, 1000);
			} else {
				const containerLogin = document.querySelector('.container-edit');
				containerLogin.innerHTML = `
					<div class="error text-center">
						<h1 id="failure-message" class="text-white">An error occured in the server</h1>
						<p class="text-white"></p>
					</div>
				`;
				updateTextForElem(document.getElementById('failure-message'), 'save-failure');
			}
		}
	};
}