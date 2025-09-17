
// start screen 

const startButton = document.getElementById('start-button');
const startScreen = document.querySelector('.start-screen');

startButton.addEventListener('click', () => {
    startScreen.style.display = 'none'; // hides the overlay
  });

// popups when user clicks on area of image

let gamePopup = null;

function initializePopup() {
    gamePopup = document.createElement('div');
    gamePopup.classList.add('popup');
    gamePopup.style.display = 'none';
    
    const gameContainer = document.querySelector('.game-container');
    gameContainer.addEventListener('click', handleGameClick);
    gameContainer.appendChild(gamePopup);
}

function showPopupWithClue(clueText) {
    gamePopup.textContent = '';
    gamePopup.style.display = 'block';
    typeWriter(clueText, gamePopup, 50); // set speed of animation 
}

function handleGameClick(event) {
    if (event.target.closest('.popup')) {
        return; 
    }
    
    if (event.target.classList.contains('clickable-area')) {
        return; 
    }
    
    if (gamePopup && gamePopup.style.display !== 'none') {
        gamePopup.style.display = 'none';
    }
}

initializePopup();

// clickable areas

const clickableAreas = document.querySelectorAll('.clickable-area');
clickableAreas.forEach(area => {
    area.addEventListener('click', e => {
        e.stopPropagation()
        const clue = area.dataset.clue;
        showPopupWithClue(clue);
    });
});

//finish investigation button 

document.getElementById('finish-button').addEventListener('click', () => {
  document.querySelector('.guess-screen').style.display = 'flex';
});

const foundClues = new Set();
const totalClues = 6;

document.querySelectorAll('.clickable-area').forEach(area => {
  area.addEventListener('click', () => {
    const clueText = area.dataset.clue;
    if (!foundClues.has(clueText)) {
      foundClues.add(clueText);
    }

    if (foundClues.size === totalClues) {
      document.getElementById('finish-button').style.display = 'block';
    }
  });
});

// guesses logic

document.getElementById('submit-guess').addEventListener('click', () => {
  const cause = document.getElementById('cause-guess').value;
  const location = document.getElementById('location-guess').value;
  const resultMessage = document.getElementById('guess-result');

  const correctCause = "carelessly left campfire";
  const correctLocation = "Near the riverbank";

  if (cause === correctCause && location === correctLocation) {
    resultMessage.textContent = "Correct. The fire started from a carelessly left campfire near the riverbank.";
    resultMessage.style.color = "limegreen";
  } else {
    resultMessage.textContent = "Not quite. Check the clues again.";
    resultMessage.style.color = "red";
  }
});

// sounds

let currentAudio = null; 

const playSound = (src) => {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = new Audio(src);
  currentAudio = audio;
  audio.play();
};
document.querySelectorAll('.clickable-area').forEach(area => {
  area.addEventListener('click', (e) => {
    e.stopPropagation(); 

    const soundSrc = area.dataset.sound;
    if (soundSrc) {
      playSound(soundSrc);
    }
  });
});

document.querySelector('.game-container').addEventListener('click', () => {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

});



// typewriter animation for clue text 

let currentTypewriterTimeout = null;

function typeWriter(text, element, speed) {
    if (currentTypewriterTimeout) {
        clearTimeout(currentTypewriterTimeout);
    }
    
    let i = 0; 
    element.textContent = '';

    function typeNextCharacter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            currentTypewriterTimeout = setTimeout(typeNextCharacter, speed);
        } else {
            currentTypewriterTimeout = null; 
        }
    }
    
    typeNextCharacter();
}

// "skip to story" button function

document.getElementById('skip-link').addEventListener('click', function (e) {
  e.preventDefault();

  document.body.style.overflow = 'auto';

  document.getElementById('main-article').scrollIntoView({ behavior: 'smooth' });
});
