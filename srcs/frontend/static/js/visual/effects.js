// ------------------------------- FRONTEND EYE CANDIES -------------------------------
// Changing letter animation

export const animateLetters = () => {
    const text = document.querySelector("[animated-letters]");
    if (!text) return;
	const letters = "Baddass 42 Prague students";
	const initialText = text.innerText;

    let interval = null;
    let iteration = 0;

	interval = setInterval(() => {
		text.innerText = text.innerText
			.split("")
			.map((letter, index) => {
				if (index < iteration) {
					return initialText[index];
				}
				return letters[Math.floor(Math.random() * 26)];
			})
			.join("");

		if (iteration >= initialText.length) { 
			clearInterval(interval);
		}

		iteration += 1 / 3;
	}, 30);
};

// Background interactive bubble
export const initInteractiveBubble = () => {
	const interBubble = document.querySelector('.interactive');
	if (!interBubble) return;

    let curX = window.innerWidth / 2;
    let curY = window.innerHeight / 2;
    let tgX = 0;
    let tgY = 0;

    function move() {
		const easingFactor = 30;

        curX += (tgX - curX) / easingFactor;
        curY += (tgY - curY) / easingFactor;
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(() => {
            move();
        });
    }

    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    move();
};

// Background noise animation
export const moveNoise = () => {
	const noiseElement = document.querySelector('.background-noise');
	
	const randomX = Math.floor(Math.random() * window.innerWidth);
	const randomY = Math.floor(Math.random() * window.innerHeight);

	noiseElement.style.backgroundPosition = `${randomX}px ${randomY}px`;
}

// init load transition
export const initLoadTransition = () => {
	const upperRect = document.getElementById("upper-transition-rectangle");
	const lowerRect = document.getElementById("lower-transition-rectangle");
  
	upperRect.addEventListener("animationend", function () {
	  upperRect.style.display = "none";
	});
  
	lowerRect.addEventListener("animationend", function () {
	  lowerRect.style.display = "none";
	});
  }

  // Load transition
export const loadTransition = () => {
	const upperRect = document.getElementById("upper-transition-rectangle");
	const lowerRect = document.getElementById("lower-transition-rectangle");
  
	upperRect.style.display = "block";
	upperRect.style.top = "0";

	lowerRect.style.display = "block";
	lowerRect.style.top = "50%";
}

export const initCursorClickEffect = () => {
	let body = document.querySelector('body');
	let canvas = document.querySelector('canvas');
	if (!canvas) return;
	canvas.addEventListener('click', (event) => {
		for (let i = 0; i < 50; i++){
			let spark = document.createElement('div');
			spark.className = 'spark';

			spark.style.top = (event.clientY) + 'px';
			spark.style.left = (event.clientX) + 'px';

			let randomX = (Math.random() - 0.5) * window.innerWidth / 3;
			let randomY = (Math.random() - 0.5) * window.innerHeight / 3;

			spark.style.setProperty('--randomX', randomX + 'px');
			spark.style.setProperty('--randomY', randomY + 'px');

			// change animation duration as a varible
			let duration = Math.random() * 1.5 + 0.5;
			spark.style.animation = `animate ${duration}s ease-out forwards`;

			body.appendChild(spark);

			setTimeout(() => {
				spark.remove();
			}, 2000);
		}
	});
}