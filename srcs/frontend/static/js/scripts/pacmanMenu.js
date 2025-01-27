// All close buttons were removed. The modal can be closed by clicking outside of it.
// Here is the button div just in case though:

// with an icon
{/* <div class="col-12 d-flex justify-content-center mt-4 mb-3">
	<button type="button" class="btn btn-lg text-white text-center d-flex align-items-center justify-content-center p-3" data-bs-dismiss="modal" aria-p="Close"><img src="static/assets/UI/icons/cross.svg" alt="close" id="close-button" width="16"></button>
</div> */}

// with text
{/* <div class="col-12 d-flex justify-content-center mt-1">
	<button type="button" class="btn btn-lg text-white" data-bs-dismiss="modal" aria-p="Close">Close</button>
</div> */}

import { updateTexts } from "../utils/languages.js";
import { updateTextForElem, getText } from "../utils/languages.js";

export let eventListeners = { }

export class PacmanMenu {
	constructor () {
		this.keysButton = document.getElementById('btnKeys');
        this.pSkinButton = document.getElementById('btnPSkin');
        this.gSkinButton = document.getElementById('btnGSkin');
        this.gamemodeButton = document.getElementById('btnGamemode');
        this.mapButton = document.getElementById('btnMap');
        this.colorButton = document.getElementById('btnColor');
		this.settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
		this.settingsModalContent = document.getElementById('settingsModalContent');
		this.swapButton = document.getElementById('btnSwap');
		this.pacmanUsernameLabel = document.getElementById('pacmanName');
		this.pacmanInput = document.getElementById('pacmanInput');
		this.ghostUsernameLabel = document.getElementById('ghostName');
		this.ghostInput = document.getElementById('ghostInput');

		this.imgCurrentPacSkin = document.getElementById('imgCurrentPacSkin');
		this.imgCurrentGhostSkin = document.getElementById('imgCurrentGhostSkin');

		this.toastNotification = document.getElementById('liveToast');
		this.toastBootstrap = bootstrap.Toast.getOrCreateInstance(this.toastNotification);
		this.toastBody = document.getElementById('toastBody');
		this.toastValue = document.getElementById('toastValue');

		this.boundKeyDownSettings = this.keyDownSettings.bind(this);

		this.waitForKey = false;
		this.waitingKey = "";

		const usernamesString = localStorage.getItem('pacmanUsernames');
		this.usernames = usernamesString ? JSON.parse(usernamesString) : {
			pacman: "Player1", ghost: "Player2"
		};

		this.pacmanUsernameLabel.textContent = this.usernames.pacman;
		this.ghostUsernameLabel.textContent = this.usernames.ghost;

		const pacmanSkinString = localStorage.getItem('pacmanSkin');
		this.pacmanSkin = pacmanSkinString ? JSON.parse(pacmanSkinString) : "pac-man";

		const ghostSkinString = localStorage.getItem('ghostSkin');
		this.ghostSkin = ghostSkinString ? JSON.parse(ghostSkinString) : "blue-ghost";

		const gamemodeString = localStorage.getItem('pacmanGamemode');
		this.gamemode = gamemodeString ? JSON.parse(gamemodeString) : "objective";

		const objectiveString = localStorage.getItem('objective');
		this.objective = objectiveString ? JSON.parse(objectiveString) : "10000";

		const mapNameString = localStorage.getItem('mapName');
		this.mapName = mapNameString ? JSON.parse(mapNameString) : "maze";

		const themeString = localStorage.getItem('pacmanTheme');
		this.theme = themeString ? JSON.parse(themeString) : { name: 'obsidian',
			backgroundColor : 'rgb(10, 0, 20)', ghostWallColor1 : 'rgb(110, 55, 225)', ghostWallColor2 : 'rgb(75, 20, 200)',
			wallColor : 'rgb(60, 0, 120)', dotColor : 'rgb(105,55,165)', glowColor : 'rgb(145,85,210)'
		};

		const keybindsString = localStorage.getItem('pacmanKeybinds');
		this.keybinds = keybindsString ? JSON.parse(keybindsString) : {
			pUp : 'KeyW', pLeft : 'KeyA', pDown : 'KeyS', pRight : 'KeyD', pSpell : 'KeyE',
			gUp : 'ArrowUp', gLeft : 'ArrowLeft', gDown : 'ArrowDown', gRight : 'ArrowRight', gSpell : 'Numpad0'
		};

		this.swapButton.addEventListener('click', () => this.swapPlayers());
		this.pacmanInput.addEventListener('keypress', (event) => this.pacmanPlayerInputHandle(event));
		this.pacmanInput.addEventListener('blur', (event) => this.pacmanPlayerInputHandle(event));
		this.ghostInput.addEventListener('keypress', (event) => this.ghostPlayerInputHandle(event));
		this.ghostInput.addEventListener('blur', (event) => this.ghostPlayerInputHandle(event));

		localStorage.setItem('pacmanSkin', JSON.stringify(this.pacmanSkin));
		localStorage.setItem('ghostSkin', JSON.stringify(this.ghostSkin));
		localStorage.setItem('pacmanGamemode', JSON.stringify(this.gamemode));
		localStorage.setItem('mapName', JSON.stringify(this.mapName));
		localStorage.setItem('pacmanKeybinds', JSON.stringify(this.keybinds));
		localStorage.setItem('pacmanTheme', JSON.stringify(this.theme));
		localStorage.setItem('themeName', this.theme.name);

		this.setPacmanSkinImage();
		this.setGhostSkinImage();

		this.keysButton.addEventListener("click", () => this.showKeysConfig());
		this.pSkinButton.addEventListener("click", () => this.showPacmanSkinConfig());
		this.gSkinButton.addEventListener("click", () => this.showGhostSkinConfig());
		this.gamemodeButton.addEventListener("click", () => this.showGamemodeConfig());
		this.mapButton.addEventListener("click", () => this.showMapConfig());
		this.colorButton.addEventListener("click", () => this.showColorSchemeConfig());

		document.addEventListener("keydown", this.boundKeyDownSettings);
		eventListeners["keydown"] = this.boundKeyDownSettings;
	}

	pacmanPlayerInputHandle(event) {
		if (((event.type == 'keypress' && event.key === 'Enter') || event.type == 'blur') && this.pacmanInput.value != "") {
			this.usernames.pacman = this.pacmanInput.value;
			this.pacmanInput.value = ""; // Clear the input box
			this.pacmanUsernameLabel.textContent = this.usernames.pacman;

			updateTextForElem(this.toastBody, "pacman-username-changed");
			this.toastValue.textContent = this.usernames.pacman;
			this.toastBootstrap.show();

			localStorage.setItem('pacmanUsernames', JSON.stringify(this.usernames))
		}
	}

	ghostPlayerInputHandle(event) {
		if (((event.type == 'keypress' && event.key === 'Enter') || event.type == 'blur') && this.ghostInput.value != "") {
			this.usernames.ghost = this.ghostInput.value;
			this.ghostInput.value = ""; // Clear the input box
			this.ghostUsernameLabel.textContent = this.usernames.ghost;

			updateTextForElem(this.toastBody, "ghost-username-changed");
			this.toastValue.textContent = this.usernames.ghost;
			this.toastBootstrap.show();

			localStorage.setItem('pacmanUsernames', JSON.stringify(this.usernames))
		}
	}

	showKeysConfig() {
		this.settingsModalContent.innerHTML = `
			<div class="row justify-content-center">
				<div class="modal-header">
					<h2 class="modal-title text-white w-100 text-center" data-translate="keybinds-settings">keybinds settings</h2>
				</div>
				<div class="modal-body">
					<div class="col-12 d-flex justify-content-center">
						<div class="col-6">
							<div class="row justify-content-center text-center mt-2">
								<p class="h3 text-white">${this.usernames.pacman}</p>
							</div>
							<div class="row justify-content-center text-center mt-2">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-up">move up</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="pUp">${this.keybinds.pUp !== "" ? this.keybinds.pUp : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-left">move left</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="pLeft">${this.keybinds.pLeft !== "" ? this.keybinds.pLeft : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-down">move down</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="pDown">${this.keybinds.pDown !== "" ? this.keybinds.pDown : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-right">move right</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="pRight">${this.keybinds.pRight !== "" ? this.keybinds.pRight : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="use-spell">use spell</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="pSpell">${this.keybinds.pSpell !== "" ? this.keybinds.pSpell : "none"}</p>
								</div>
							</div>
						</div>
						<div class="col-6">
							<div class="row justify-content-center text-center mt-2">
								<p class="h3 text-white">${this.usernames.ghost}</p>
							</div>
							<div class="row justify-content-center text-center mt-2">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-up">move up</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="gUp">${this.keybinds.gUp !== "" ? this.keybinds.gUp : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-left">move left</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="gLeft">${this.keybinds.gLeft !== "" ? this.keybinds.gLeft : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-down">move down</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="gDown">${this.keybinds.gDown !== "" ? this.keybinds.gDown : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="move-right">move right</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="gRight">${this.keybinds.gRight !== "" ? this.keybinds.gRight : "none"}</p>
								</div>
							</div>
							<div class="row justify-content-center text-center">
								<div class="col-6 d-flex justify-content-end">
									<p class="text-white" style="padding: 3px 0px;" data-translate="use-spell">use spell</p>
								</div>
								<div class="col-6 d-flex justify-content-start">
									<p role="button" tabindex="0" class="text-white clickable" style="border: 1px solid white; padding: 1px 5px; border-radius: 5px;" id="gSpell">${this.keybinds.gSpell !== "" ? this.keybinds.gSpell : "none"}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		let btnPUp = document.getElementById('pUp');
        let btnPLeft = document.getElementById('pLeft');
		let btnPDown = document.getElementById('pDown');
		let btnPRight = document.getElementById('pRight');
		let btnPSpell = document.getElementById('pSpell');
		let btnGUp = document.getElementById('gUp');
        let btnGLeft = document.getElementById('gLeft');
		let btnGDown = document.getElementById('gDown');
		let btnGRight = document.getElementById('gRight');
		let btnGSpell = document.getElementById('gSpell');

		const addEventListeners = (button, action) => {
			button.addEventListener("click", (event) => this.changeKeybind(event, action, button));
			button.addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					// wait for the next key press using settimeout
					setTimeout(() => {
						this.changeKeybind(event, action, button);
					}, 100);
				}
			});
		}
		
		addEventListeners(btnPUp, "pUp");
		addEventListeners(btnPLeft, "pLeft");
		addEventListeners(btnPDown, "pDown");
		addEventListeners(btnPRight, "pRight");
		addEventListeners(btnPSpell, "pSpell");
		addEventListeners(btnGUp, "gUp");
		addEventListeners(btnGLeft, "gLeft");
		addEventListeners(btnGDown, "gDown");
		addEventListeners(btnGRight, "gRight");
		addEventListeners(btnGSpell, "gSpell");

		this.settingsModal.show();
		updateTexts();
	}

	showPacmanSkinConfig() {
		this.settingsModalContent.innerHTML = `
			<div class="modal-header">
				<h2 class="modal-title text-white w-100 text-center" data-translate="pacman-skin">pacman skins</h2>
			</div>
			<div class="modal-body">
				<div class="modal-body">
				 <div class="row justify-content-center mt-2 mb-1">
					<div class="col-10 d-flex justify-content-center">
						<div class="d-flex justify-content-between w-100">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pPacmanSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/pac-man_high_res.png" alt="An image of pac-man." text="Pacman">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pPacWomanSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/pac-woman_high_res.png" alt="An image of pac-girl.">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pPacMIBSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/pac-MIB_high_res.png" alt="An image of Pac-Man-In-Black.">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pPacventurerSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/pac-venturer_high_res.png" alt="An image of pac-venturer.">
						</div>
					</div>
				</div>
				<div class="row justify-content-center"> 
					<div class="col-10 mt-3">
						<p class="h3 text-white text-center mb-3 mt-1" id="pacmanTitle">pac-man</p>
						<hr class="text-white">
						<div class="col-12 mb-1">
							<p class="h5 text-left text-white fw-bold" id="pacmanTitle1" style="display: inline; vertical-align: middle;">Title</p>
							<img src="/static/assets/UI/icons/time.svg" style="width: 22px; margin-left:5px;  margin-right: -8px; vertical-align: middle;" alt="Clock Icon"/>
							<p id="cooldown" class="h5 text-white" style="display: inline; vertical-align: middle;">00:00</p>
						</div>
						<p class="text-white text-left lh-sm" id="pacmanDesc1" style="min-height: 4em; line-height: 1;">Description 1</p>
						<p class="h5 text-white text-left fw-bold mb-1 mt-1" id="pacmanTitle2">Title 2</p>
						<p class="text-white text-left lh-sm" style="min-height: 4em; line-height: 1;" id="pacmanDesc2">Description 2</p>
					</div>
				</div>
			</div>
		`;

		let btnPacmanSkin = document.getElementById('pPacmanSkin');
        let btnPacWomanSkin = document.getElementById('pPacWomanSkin');
		let btnPacMIBSkin = document.getElementById('pPacMIBSkin');
        let btnPacventurerSkin = document.getElementById('pPacventurerSkin');
		let cooldown = document.getElementById('cooldown');
		let pacmanTitle = document.getElementById('pacmanTitle');
		let pacmanTitle1 = document.getElementById('pacmanTitle1');
		let pacmanDesc1 = document.getElementById('pacmanDesc1');
		let pacmanTitle2 = document.getElementById('pacmanTitle2');
		let pacmanDesc2 = document.getElementById('pacmanDesc2');

		this.addEventListeners(btnPacmanSkin, (event) => this.selectPacmanSkin(event, "pac-man"));
		this.addEventListeners(btnPacWomanSkin, (event) => this.selectPacmanSkin(event, "pac-woman"));
		this.addEventListeners(btnPacMIBSkin, (event) => this.selectPacmanSkin(event, "pac-MIB"));
		this.addEventListeners(btnPacventurerSkin, (event) => this.selectPacmanSkin(event, "pac-venturer"));

		switch (this.pacmanSkin) {
			case "pac-man":
				updateTextForElem(pacmanTitle, "pac-man-name");
				updateTextForElem(pacmanTitle1, "pac-man-passive");
				updateTextForElem(pacmanDesc1, "pac-man-passive-desc");
				updateTextForElem(pacmanTitle2, "pac-man-frenzy");
				updateTextForElem(pacmanDesc2, "pac-man-frenzy-desc");
				cooldown.textContent = "17";
				break;
			case "pac-woman":
				updateTextForElem(pacmanTitle, "pac-woman-name");
				updateTextForElem(pacmanTitle1, "pac-woman-active");
				updateTextForElem(pacmanDesc1, "pac-woman-active-desc");
				updateTextForElem(pacmanTitle2, "pac-woman-passive");
				updateTextForElem(pacmanDesc2, "pac-woman-passive-desc");
				cooldown.textContent = "25";
				break;
			case "pac-MIB":
				updateTextForElem(pacmanTitle, "pac-MIB-name");
				updateTextForElem(pacmanTitle1, "pac-MIB-active");
				updateTextForElem(pacmanDesc1, "pac-MIB-active-desc");
				updateTextForElem(pacmanTitle2, "pac-MIB-passive");
				updateTextForElem(pacmanDesc2, "pac-MIB-passive-desc");
				cooldown.textContent = "20";
				break;
			case "pac-venturer":
				updateTextForElem(pacmanTitle, "pac-venturer-name");
				updateTextForElem(pacmanTitle1, "pac-venturer-active");
				updateTextForElem(pacmanDesc1, "pac-venturer-active-desc");
				updateTextForElem(pacmanTitle2, "pac-venturer-passive");
				updateTextForElem(pacmanDesc2, "pac-venturer-passive-desc");
				cooldown.textContent = "12";
				break;
		}

		const pacmanSkins = {
			"pac-man": btnPacmanSkin,
			"pac-woman": btnPacWomanSkin,
			"pac-MIB": btnPacMIBSkin,
			"pac-venturer": btnPacventurerSkin
		}
		this.applySelectedSetting("pacmanSkin", pacmanSkins);

		this.settingsModal.show();

		updateTexts();
	}

	showGhostSkinConfig() {
		this.settingsModalContent.innerHTML = `
			<div class="modal-header">
				<h2 class="modal-title text-white w-100 text-center" data-translate="ghost-skin">ghost skins</h2>
			</div>
			<div class="modal-body">
				 <div class="row justify-content-center mt-2 mb-1">
					<div class="col-10 d-flex justify-content-center">
							<div class="d-flex justify-content-between w-100">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pBlueGhostSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/blue-ghost_high_res.png" alt="An image of a blue ghost.">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pOrangeGhostSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/orange-ghost_high_res.png" alt="An image of an orange ghost.">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pPinkGhostSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/pink-ghost_high_res.png" alt="An image of a pink ghost.">
							<img class="clickable" role="button" tabindex="0" width="64px" id="pGreenGhostSkin" style="border: 1px solid white; padding: 5px; border-radius: 5px;" src="/static/assets/pacman/images/green-ghost_high_res.png" alt="An image of a green ghost.">
						</div>
					</div>
				</div>
				<div class="row justify-content-center"> 
					<div class="col-10 mt-3">
						<p class="h3 text-white text-center mb-3 mt-1" id="ghostTitle">blue ghost</p>
						<hr class="text-white">
						<div class="col-12 mb-1">
							<p class="h5 text-left text-white fw-bold" id="ghostTitle1" style="display: inline; vertical-align: middle;">Title</p>
							<img src="/static/assets/UI/icons/time.svg" style="width: 22px; margin-left:5px;  margin-right: -8px; vertical-align: middle;" alt="Clock Icon"/>
							<p id="cooldown" class="h5 text-white" style="display: inline; vertical-align: middle;">00:00</p>
						</div>
						<p class="text-white text-left lh-sm" id="ghostDesc1" style="min-height: 4em; line-height: auto;">Description 1</p>
						<p class="h5 text-white text-left fw-bold mb-1" id="ghostTitle2">Title 2</p>
						<p class="text-white text-left lh-sm" style="min-height: 4em; line-height: auto;" id="ghostDesc2">Description 2</p>
					</div>
				</div>
			</div>
		`;

		let btnBlueSkin = document.getElementById('pBlueGhostSkin');
        let btnOrangeSkin = document.getElementById('pOrangeGhostSkin');
		let btnPinkSkin = document.getElementById('pPinkGhostSkin');
        let btnGreenSkin = document.getElementById('pGreenGhostSkin');
		let cooldown = document.getElementById('cooldown');
		let ghostTitle = document.getElementById('ghostTitle');
		let ghostTitle1 = document.getElementById('ghostTitle1');
		let ghostDesc1 = document.getElementById('ghostDesc1');
		let ghostTitle2 = document.getElementById('ghostTitle2');
		let ghostDesc2 = document.getElementById('ghostDesc2');

		this.addEventListeners(btnBlueSkin, (event) => this.selectGhostSkin(event, "blue-ghost"));
		this.addEventListeners(btnOrangeSkin, (event) => this.selectGhostSkin(event, "orange-ghost"));
		this.addEventListeners(btnPinkSkin, (event) => this.selectGhostSkin(event, "pink-ghost"));
		this.addEventListeners(btnGreenSkin, (event) => this.selectGhostSkin(event, "green-ghost"));

		switch (this.ghostSkin) {
			case "blue-ghost":
				updateTextForElem(ghostTitle, "blue-ghost-name");
				updateTextForElem(ghostTitle1, "blue-ghost-active");
				updateTextForElem(ghostDesc1, "blue-ghost-active-desc");
				updateTextForElem(ghostTitle2, "blue-ghost-passive");
				updateTextForElem(ghostDesc2, "blue-ghost-passive-desc");
				cooldown.textContent = "5";
				break;
			case "orange-ghost":
				updateTextForElem(ghostTitle, "orange-ghost-name");
				updateTextForElem(ghostTitle1, "orange-ghost-active");
				updateTextForElem(ghostDesc1, "orange-ghost-active-desc");
				updateTextForElem(ghostTitle2, "orange-ghost-passive");
				updateTextForElem(ghostDesc2, "orange-ghost-passive-desc");
				cooldown.textContent = "20";
				break;
			case "pink-ghost":
				updateTextForElem(ghostTitle, "pink-ghost-name");
				updateTextForElem(ghostTitle1, "pink-ghost-active");
				updateTextForElem(ghostDesc1, "pink-ghost-active-desc");
				updateTextForElem(ghostTitle2, "pink-ghost-effect");
				updateTextForElem(ghostDesc2, "pink-ghost-effect-desc");
				cooldown.textContent = "25";
				break;
			case "green-ghost":
				updateTextForElem(ghostTitle, "green-ghost-name");
				updateTextForElem(ghostTitle1, "green-ghost-active");
				updateTextForElem(ghostDesc1, "green-ghost-active-desc");
				updateTextForElem(ghostTitle2, "green-ghost-passive");
				updateTextForElem(ghostDesc2, "green-ghost-passive-desc");
				cooldown.textContent = "25";
				break;
		}

		// Get element that is selected from the local storage and apply the border
		const ghostSkins = {
			"blue-ghost": btnBlueSkin,
			"orange-ghost": btnOrangeSkin,
			"pink-ghost": btnPinkSkin,
			"green-ghost": btnGreenSkin
		}
		this.applySelectedSetting("ghostSkin", ghostSkins);

		this.settingsModal.show();

		updateTexts();
	}

	showGamemodeConfig() {
		this.settingsModalContent.innerHTML = `
			<div class="modal-header">
				<h2 class="modal-title text-white w-100 text-center" data-translate="gamemode">gamemodes</h2>
			</div>
			<div class="modal-body">
				<div class="col-auto mr-2 ml-3">
					<div class="row justify-content-center text-center mt-2 mb-1">
						<div class="col-4 d-flex justify-content-center">
							<button role="button" class="btn btn-lg text-white btn-filled" id="btnObjective" data-translate="objective"></button>
						</div>
						<div class="col-4 d-flex justify-content-center">
							<button role="button" class="btn btn-lg text-white btn-filled" id="btnEndless" data-translate="endless"></button>
						</div>
						<div class="col-10 mt-4 mb-3">
							<p class="text-white" id="gamemodeDescription"></p>
						</div>
						<div id="rangeContainer">
						</div>
					</div>
				</div>
			</div>
		`;


        let btnObjective = document.getElementById('btnObjective');
		let btnEndless = document.getElementById('btnEndless');
		let pDescription = document.getElementById('gamemodeDescription');
		let rangeContainer = document.getElementById('rangeContainer');

		btnObjective.addEventListener("click", (event) => this.selectGamemode(event, "objective"));
		btnEndless.addEventListener("click", (event) => this.selectGamemode(event, "endless"));

		switch (this.gamemode) {
			case "objective":
				updateTextForElem(pDescription, "objective-description");
				rangeContainer.innerHTML = `
					<div class="col-12 d-flex justify-content-center align-items-center mb-2">
						<p for="rangeInput" class="text-white h5 mb-0" id="rangeLabel" style="margin-right: 10px;">Label</p>
						<input type="range" class="form-range clickable" style="width: 70%;" min="1000" max="30000" step="1000" id="rangeInput">
					</div>
				`;
				let rangeInput = document.getElementById('rangeInput');
				let rangeLabel = document.getElementById('rangeLabel');

				rangeLabel.textContent = this.objective;
				rangeInput.value = this.objective;
				localStorage.setItem('objective', JSON.stringify(this.objective));

				rangeInput.addEventListener('input', (event) => {
					rangeLabel.textContent = event.target.value;
					this.objective = event.target.value;
					localStorage.setItem('objective', JSON.stringify(this.objective));
				});

				break;
			case "endless":
				updateTextForElem(pDescription, "endless-description");
				break;
			default:
				break;
		}

		this.settingsModal.show();

		const gamemodes = {
			"objective": document.getElementById('btnObjective'),
			"endless": document.getElementById('btnEndless')
		}
		this.applySelectedSetting("pacmanGamemode", gamemodes);
		updateTexts();
	}

	showMapConfig() {
		this.settingsModalContent.innerHTML = `
			<div class="modal-header">
				<h2 class="modal-title text-white w-100 text-center" data-translate="map">maps</h2>
			</div>
			<div class="modal-body p-4 pt-4 pb-4">
				<div class="col-auto mr-1 ml-1">
					<div class="row justify-content-center text-center mb-4">
						<div class="col-4 d-flex flex-column align-items-center">
							<p class="h4 text-white" data-translate="maze">maze</p>
							<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/maze.png" id="pMaze" alt="A map that has the form of a maze." tabindex="0"/>
						</div>
						<div class="col-4 d-flex flex-column align-items-center">
							<p class="h4 text-white" data-translate="spiral">spiral</p>
							<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/spiral.png" id="pSpiral" alt="A map that has the form of a spiral." tabindex="0"/>
						</div>
						<div class="col-4 d-flex flex-column align-items-center">
							<p class="h4 text-white" data-translate="butterfly">butterfly</p>
							<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/butterfly.png" id="pButterfly" alt="A map that has the form of a butterfly." tabindex="0"/>
						</div>
					</div>
					<div class="row justify-content-center text-center">
						<div class="col-4 d-flex flex-column align-items-center">
							<p class="h4 text-white" data-translate="battlefield"></p>
							<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/battlefield.png" id="pBattlefield" alt="A map that looks like a battlefield." tabindex="0"/>
						</div>
						<div class="col-4 d-flex flex-column align-items-center">
							<p class="h4 text-white" data-translate="trench"></p>
							<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/trench.png" id="pTrench" alt="A map that has a trench." tabindex="0"/>
						</div>
						<div class="col-4 d-flex flex-column align-items-center">
							<p class="h4 text-white" data-translate="flower"></p>
							<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/flower.png" id="pFlower" alt="A map that looks like a flower." tabindex="0"/>
						</div>
					</div>
				</div>
			</div>
		`;

		let btnMaze = document.getElementById('pMaze');
        let btnSpiral = document.getElementById('pSpiral');
		let btnButterfly = document.getElementById('pButterfly');
		let btnBattlefield = document.getElementById('pBattlefield');
		let btnTrench = document.getElementById('pTrench');
		let btnFlower = document.getElementById('pFlower');

		this.addEventListeners(btnMaze, (event) => this.selectMap(event, "maze"));
		this.addEventListeners(btnSpiral, (event) => this.selectMap(event, "spiral"));
		this.addEventListeners(btnButterfly, (event) => this.selectMap(event, "butterfly"));
		this.addEventListeners(btnBattlefield, (event) => this.selectMap(event, "battlefield"));
		this.addEventListeners(btnTrench, (event) => this.selectMap(event, "trench"));
		this.addEventListeners(btnFlower, (event) => this.selectMap(event, "flower"));

		const maps = {
			maze: btnMaze,
			spiral: btnSpiral,
			butterfly: btnButterfly,
			battlefield: btnBattlefield,
			trench: btnTrench,
			flower: btnFlower
		}
		this.applySelectedSetting("mapName", maps);

		this.settingsModal.show();

		updateTexts();
	}

	showColorSchemeConfig() {
		this.settingsModalContent.innerHTML = `
			<div class="modal-header">
				<h2 class="modal-title text-white w-100 text-center" data-translate="theme">themes</h2>
			</div>
			<div class="modal-body">
				<div class="col-12 justify-content-center">
					<div class="row justify-content-center text-center mt-2 mb-3">
						<div class="row justify-content-center text-center">
							<div class="col-3 d-flex flex-column align-items-center">
								<p class="h4 text-white" data-translate="obsidian">obsidian</p>
								<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/obsidian.png" id="pObsidian" alt="A map that has the color of obsidian." tabindex="0"/>
							</div>
							<div class="col-3 d-flex flex-column align-items-center">
								<p class="h4 text-white" data-translate="autumn">autumn</p>
								<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/autumn.png" id="pAutumn" alt="A map that has the color of autumn." tabindex="0"/>
							</div>
							<div class="col-3 d-flex flex-column align-items-center">
								<p class="h4 text-white" data-translate="garden">garden</p>
								<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/garden.png" id="pGarden" alt="A map that has the color of a garden." tabindex="0"/>
							</div>
							<div class="col-3 d-flex flex-column align-items-center">
								<p class="h4 text-white" data-translate="retro">retro</p>
								<img class="img-fluid clickable" style="max-height: 275px; border: 1px solid white; padding: 5px; border-radius: 5px;" role="button" src="/static/assets/pacman/images/retro.png" id="pRetro" alt="A map that has the color of the retro pac-man." tabindex="0"/>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		let btnObsidian = document.getElementById('pObsidian');
        let btnAutumn = document.getElementById('pAutumn');
		let btnGarden = document.getElementById('pGarden');
        let btnRetro = document.getElementById('pRetro');

		this.addEventListeners(btnObsidian, (event) => this.selectTheme(event, "obsidian"));
		this.addEventListeners(btnAutumn, (event) => this.selectTheme(event, "autumn"));
		this.addEventListeners(btnGarden, (event) => this.selectTheme(event, "garden"));
		this.addEventListeners(btnRetro, (event) => this.selectTheme(event, "retro"));

		const themes = {
			obsidian: btnObsidian,
			autumn: btnAutumn,
			garden: btnGarden,
			retro: btnRetro
		}
		this.applySelectedSetting("themeName", themes);

		this.settingsModal.show();

		updateTexts();
	}

	//#region EVENT LISTENERS HANDLERS

	swapPlayers() {
		let tmpUsername = this.usernames.pacman;
		this.usernames.pacman = this.usernames.ghost;
		this.usernames.ghost = tmpUsername;
		localStorage.setItem('pacmanUsernames', JSON.stringify(this.usernames));

		this.pacmanUsernameLabel.textContent = this.usernames.pacman;
		this.ghostUsernameLabel.textContent = this.usernames.ghost;

		this.oldKeys = this.keybinds;
		this.keybinds = {
			pUp : this.oldKeys.gUp, pLeft : this.oldKeys.gLeft, pDown : this.oldKeys.gDown, pRight : this.oldKeys.gRight, pSpell : this.oldKeys.gSpell,
			gUp : this.oldKeys.pUp, gLeft : this.oldKeys.pLeft, gDown : this.oldKeys.pDown, gRight : this.oldKeys.pRight, gSpell : this.oldKeys.pSpell
		}
		localStorage.setItem('pacmanKeybinds', JSON.stringify(this.keybinds));

		updateTextForElem(this.toastBody, "swapped-usernames");
		this.toastValue.textContent = "";
		this.toastBootstrap.show();
	}

	selectPacmanSkin(event, skin) {
		updateTextForElem(this.toastBody, "chosen-pacman");
		this.toastValue.textContent = getText(skin + "-name");
		this.toastBootstrap.show();
		this.pacmanSkin = skin;
		localStorage.setItem('pacmanSkin', JSON.stringify(this.pacmanSkin));

		const pacmanSkins = {
			"pac-man": document.getElementById('pPacmanSkin'),
			"pac-woman": document.getElementById('pPacWomanSkin'),
			"pac-MIB": document.getElementById('pPacMIBSkin'),
			"pac-venturer": document.getElementById('pPacventurerSkin')
		}
		this.applySelectedSetting("pacmanSkin", pacmanSkins);
		this.setPacmanSkinImage();
		this.showPacmanSkinConfig();
	}

	selectGhostSkin(event, skin) {
		updateTextForElem(this.toastBody, "chosen-ghost");
		this.toastValue.textContent = getText(skin + "-name");
		this.toastBootstrap.show();
		this.ghostSkin = skin;
		localStorage.setItem('ghostSkin', JSON.stringify(this.ghostSkin));

		// Get element that is selected from the local storage and apply the border
		const ghostSkins = {
			"blue-ghost": document.getElementById('pBlueGhostSkin'),
			"orange-ghost": document.getElementById('pOrangeGhostSkin'),
			"pink-ghost": document.getElementById('pPinkGhostSkin'),
			"green-ghost": document.getElementById('pGreenGhostSkin')
		}
		this.applySelectedSetting("ghostSkin", ghostSkins);
		this.setGhostSkinImage();
		this.showGhostSkinConfig();
	}

	setPacmanSkinImage() {
		this.imgCurrentPacSkin.src = "/static/assets/pacman/images/" + this.pacmanSkin + "_high_res.png";
	}

	setGhostSkinImage() {
		this.imgCurrentGhostSkin.src = "/static/assets/pacman/images/" + this.ghostSkin + "_high_res.png";
	}

	selectGamemode(event, gamemode) {
		updateTextForElem(this.toastBody, "chosen-gamemode");
		this.toastValue.textContent = getText(gamemode);
		this.toastBootstrap.show();
		this.gamemode = gamemode;
		localStorage.setItem('pacmanGamemode', JSON.stringify(this.gamemode));

		this.showGamemodeConfig();
	}

	selectMap(event, map) {
		updateTextForElem(this.toastBody, "chosen-map");
		this.toastValue.textContent = getText(map);
		this.toastBootstrap.show();
		this.mapName = map;

		localStorage.setItem('mapName', JSON.stringify(this.mapName));

		const maps = {
			maze: document.getElementById('pMaze'),
			spiral: document.getElementById('pSpiral'),
			butterfly: document.getElementById('pButterfly'),
			battlefield: document.getElementById('pBattlefield'),
			trench: document.getElementById('pTrench'),
			flower: document.getElementById('pFlower')
		}
		this.applySelectedSetting("mapName", maps);
	}

	selectTheme(event, theme) {
		updateTextForElem(this.toastBody, "chosen-theme");
		this.toastValue.textContent = getText(theme);
		this.toastBootstrap.show();
		switch (theme) {
			case "obsidian":
				this.theme = { name: 'obsidian',
					backgroundColor : 'rgb(10, 0, 20)', ghostWallColor1 : 'rgb(110, 55, 225)', ghostWallColor2 : 'rgb(75, 20, 200)',
					wallColor : 'rgb(60, 0, 120)', dotColor : 'rgb(105,55,165)', glowColor : 'rgb(145,85,210)'
				};
				break;
			case "autumn":
				this.theme = { name: 'autumn',
					backgroundColor : 'rgb(15, 0, 0)', ghostWallColor1 : 'rgb(138, 22, 1)', ghostWallColor2 : 'rgb(181, 32, 2)',
					wallColor : 'rgb(143, 34, 1)', dotColor : 'rgb(145, 67, 3)', glowColor : 'rgb(194, 90, 6)'
				};
				break;
			case "garden":
				this.theme = { name: 'garden',
					backgroundColor : 'rgb(0, 8, 2)', ghostWallColor1 : 'rgb(38, 82, 0)', ghostWallColor2 : 'rgb(58, 125, 0)',
					wallColor : 'rgb(0, 54, 12)', dotColor : 'rgb(2, 56, 173)', glowColor : 'rgb(0, 66, 209)'
				};
				break;
			case "retro":
				this.theme = { name: 'retro',
					backgroundColor : 'rgb(1, 1, 26)', ghostWallColor1 : 'rgb(14, 58, 179)', ghostWallColor2 : 'rgb(18, 71, 219)',
					wallColor : 'rgb(0, 0, 176)', dotColor : 'rgb(145, 135, 19)', glowColor : 'rgb(186, 173, 20)'
				};
				break;
			default:
				break;
		}

		localStorage.setItem('pacmanTheme', JSON.stringify(this.theme));
		localStorage.setItem('themeName', theme);

		const themes = {
			obsidian: document.getElementById('pObsidian'),
			autumn: document.getElementById('pAutumn'),
			garden: document.getElementById('pGarden'),
			retro: document.getElementById('pRetro')
		}
		this.applySelectedSetting("themeName", themes);
	}

	changeKeybind(event, key, btn) {
		btn.textContent = "...";
		this.waitForKey = true;
		this.waitingKey = key;
	}

	keyDownSettings = (event) => {
		if(["Space","ArrowUp","ArrowDown"].indexOf(event.code) > -1) {
			event.preventDefault();
		}
		if (this.waitForKey) {
			for (const key in this.keybinds) {
				if (this.keybinds[key] == event.code)
					this.keybinds[key] = "";
			}
			let key;
			switch (this.waitingKey) {
				case "pUp":
					key = getText("p-move-up");
					this.keybinds.pUp = event.code;
					break;
				case "pLeft":
					key = getText("p-move-left");
					this.keybinds.pLeft = event.code;
					break;
				case "pDown":
					key = getText("p-move-down");
					this.keybinds.pDown = event.code;
					break;
				case "pRight":
					key = getText("p-move-right");
					this.keybinds.pRight = event.code;
					break;
				case "pSpell":
					key = getText("p-spell");
					this.keybinds.pSpell = event.code;
					break;
				case "gUp":
					key = getText("g-move-up");
					this.keybinds.gUp = event.code;
					break;
				case "gLeft":
					key = getText("g-move-left");
					this.keybinds.gLeft = event.code;
					break;
				case "gDown":
					key = getText("g-move-down");
					this.keybinds.gDown = event.code;
					break;
				case "gRight":
					key = getText("g-move-right");
					this.keybinds.gRight = event.code;
					break;
				case "gSpell":
					key = getText("g-move-up");	
					this.keybinds.gSpell = event.code;
					break;
				default:
					return ;
			}
			this.waitForKey = false;
			updateTextForElem(this.toastBody, "changed-key");
			this.toastValue.textContent = key + " -> " + event.code;
			this.toastBootstrap.show();
			localStorage.setItem('pacmanKeybinds', JSON.stringify(this.keybinds));
			this.showKeysConfig();
		}
	}

	// Add the "selected" class to to correct element based on the setting in the local storage
	// settingType is for example "pacmanSkin", "ghostSkin", "pacmanGamemode", "mapName", "pacmanTheme"
	// elementMapping is an object with the settings as keys and the elements as values
	// for example { "pacman": btnPacmanSkin, "pac-woman": btnPacWomanSkin }
	applySelectedSetting(settingType, elementMapping) {
		const selectedSetting = localStorage.getItem(settingType)?.replace(/"/g, '');
	
		Object.keys(elementMapping).forEach(setting => {
			if (setting === selectedSetting) {
				elementMapping[setting].classList.add("selected");
			} else {
				elementMapping[setting].classList.remove("selected");
			}
		});
	}

	// Function to add event listeners to the selections (click add enter key)
	// button is the element to add the event listener to
	// action is the function to call when the event listener is triggered
	addEventListeners(button, action) {
		button.addEventListener("click", (event) => action(event));
		button.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				action(event);
			}
		});
	}

	//#endregion

}