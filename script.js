// Game state variables
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;
let currentLevel = 1;
let hintsRemaining = 3;
let totalMoves = 0;
let totalTime = 0;
let levelStars = {};
let starsEarned = 3;

// Level configurations
const levelConfigs = {
    1: { grid: [4, 4], pairs: 8, maxMoves: 20, timeLimit: 180 },
    2: { grid: [4, 5], pairs: 10, maxMoves: 25, timeLimit: 240 },
    3: { grid: [5, 5], pairs: 12, maxMoves: 30, timeLimit: 300 },
    4: { grid: [5, 6], pairs: 15, maxMoves: 35, timeLimit: 360 },
    5: { grid: [6, 6], pairs: 18, maxMoves: 40, timeLimit: 420 }
};

// Card themes
const cardThemes = {
    default: ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🍑', '🍍', '🥭', '🍉', '🥝', '🍋', '🥥', '🫐', '🍐'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    food: ['🍕', '🌭', '🍔', '🍟', '🌮', '🌯', '🍦', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭', '🍿', '🧁'],
    travel: ['🚗', '✈️', '🚂', '🚲', '🚁', '🚀', '🛶', '🚤', '🛸', '🚜', '🏎️', '🚢', '🛴', '🚎', '🚂']
};

// DOM elements
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const matchesDisplay = document.getElementById('matches');
const levelDisplay = document.getElementById('level');
const starsDisplay = document.getElementById('stars');
const restartBtn = document.getElementById('restartBtn');
const hintBtn = document.getElementById('hintBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const levelComplete = document.getElementById('levelComplete');
const winMessage = document.getElementById('winMessage');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const completeMoves = document.getElementById('completeMoves');
const completeTime = document.getElementById('completeTime');
const nextLevel = document.getElementById('nextLevel');
const totalMovesDisplay = document.getElementById('totalMoves');
const totalTimeDisplay = document.getElementById('totalTime');
const averageStarsDisplay = document.getElementById('averageStars');
const soundToggle = document.getElementById('soundToggle');
const animationToggle = document.getElementById('animationToggle');
const themeSelect = document.getElementById('themeSelect');

// Initialize the game
function initGame() {
    resetGame();
    createCards();
    renderCards();
    updateDisplay();
}

// Reset game state for current level
function resetGame() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    gameStarted = false;
    starsEarned = 3;
    
    // Reset hints to 3 for each new level
    hintsRemaining = 3;
    
    clearInterval(timerInterval);
    updateDisplay();
}

// Update all displays
function updateDisplay() {
    movesDisplay.textContent = moves;
    timerDisplay.textContent = `${timer}s`;
    levelDisplay.textContent = currentLevel;
    starsDisplay.textContent = '★'.repeat(starsEarned);
    
    const config = levelConfigs[currentLevel];
    matchesDisplay.textContent = `${matchedPairs}/${config.pairs}`;
    
    // Update hint button
    updateHintButton();
}

// Update hint button display
function updateHintButton() {
    hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Hint (${hintsRemaining})`;
    hintBtn.disabled = hintsRemaining === 0;
}

// Create cards based on current level
function createCards() {
    const config = levelConfigs[currentLevel];
    const selectedTheme = themeSelect.value;
    const themeIcons = cardThemes[selectedTheme];
    
    // Create pairs of cards
    for (let i = 0; i < config.pairs; i++) {
        const icon = themeIcons[i % themeIcons.length];
        cards.push({ id: i * 2, icon: icon, flipped: false, matched: false });
        cards.push({ id: i * 2 + 1, icon: icon, flipped: false, matched: false });
    }
    
    // Shuffle cards
    shuffleCards();
}

// Shuffle cards using Fisher-Yates algorithm
function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Render cards on the game board
function renderCards() {
    gameBoard.innerHTML = '';
    
    const config = levelConfigs[currentLevel];
    const [cols, rows] = config.grid;
    
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameBoard.style.maxWidth = `${cols * 100}px`;
    
    // Create card elements
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = card.icon;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        const backIcon = document.createElement('i');
        backIcon.className = 'fas fa-question';
        cardBack.appendChild(backIcon);
        
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        cardElement.addEventListener('click', () => flipCard(card, cardElement));
        
        gameBoard.appendChild(cardElement);
    });
}

// Flip a card
function flipCard(card, cardElement) {
    if (card.flipped || card.matched || flippedCards.length >= 2) return;
    
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    card.flipped = true;
    cardElement.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        moves++;
        updateStars();
        updateDisplay();
        checkForMatch();
    }
}

// Check if flipped cards match
function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.icon === card2.icon) {
        // Match found
        card1.matched = true;
        card2.matched = true;
        matchedPairs++;
        
        updateDisplay();
        
        // Check for level completion
        if (matchedPairs === levelConfigs[currentLevel].pairs) {
            completeLevel();
        }
        
        flippedCards = [];
    } else {
        // No match - flip cards back after delay
        setTimeout(() => {
            card1.flipped = false;
            card2.flipped = false;
            
            const card1Element = document.querySelector(`.card[data-id="${card1.id}"]`);
            const card2Element = document.querySelector(`.card[data-id="${card2.id}"]`);
            
            if (card1Element) card1Element.classList.remove('flipped');
            if (card2Element) card2Element.classList.remove('flipped');
            
            flippedCards = [];
        }, 1000);
    }
}

// Update star rating based on moves
function updateStars() {
    const config = levelConfigs[currentLevel];
    const optimalMoves = config.pairs * 2;
    const moveLimit = config.maxMoves;
    
    const efficiency = (moveLimit - moves) / (moveLimit - optimalMoves);
    
    if (efficiency > 0.66) {
        starsEarned = 3;
    } else if (efficiency > 0.33) {
        starsEarned = 2;
    } else {
        starsEarned = 1;
    }
}

// Start the game timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateDisplay();
    }, 1000);
}

// Complete current level
function completeLevel() {
    clearInterval(timerInterval);
    
    totalMoves += moves;
    totalTime += timer;
    levelStars[currentLevel] = starsEarned;
    
    // Hints will automatically reset to 3 when initGame() is called for the next level
    
    setTimeout(() => {
        completeMoves.textContent = moves;
        completeTime.textContent = `${timer}s`;
        nextLevel.textContent = currentLevel + 1;
        
        // Show earned stars
        const starIcons = document.querySelectorAll('.star-rating .fa-star');
        starIcons.forEach((star, index) => {
            if (index < starsEarned) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        levelComplete.classList.add('active');
    }, 1000);
}

// Move to next level
function nextLevelAction() {
    levelComplete.classList.remove('active');
    
    if (currentLevel < Object.keys(levelConfigs).length) {
        currentLevel++;
        initGame(); // This will reset hints to 3
    } else {
        showWinMessage();
    }
}

// Show win message when all levels are completed
function showWinMessage() {
    const averageStars = Object.values(levelStars).reduce((a, b) => a + b, 0) / Object.keys(levelStars).length;
    
    totalMovesDisplay.textContent = totalMoves;
    totalTimeDisplay.textContent = `${totalTime}s`;
    averageStarsDisplay.textContent = averageStars.toFixed(1);
    
    winMessage.classList.add('active');
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Hint system
function useHint() {
    if (hintsRemaining === 0) return;
    
    hintsRemaining--;
    
    // Find two unmatched cards and briefly show them
    const unmatchedCards = cards.filter(card => !card.matched && !card.flipped);
    if (unmatchedCards.length >= 2) {
        const card1 = unmatchedCards[0];
        const card2 = unmatchedCards.find(card => card.icon === card1.icon && card.id !== card1.id);
        
        if (card2) {
            const card1Element = document.querySelector(`.card[data-id="${card1.id}"]`);
            const card2Element = document.querySelector(`.card[data-id="${card2.id}"]`);
            
            card1Element.classList.add('flipped');
            card2Element.classList.add('flipped');
            
            setTimeout(() => {
                card1Element.classList.remove('flipped');
                card2Element.classList.remove('flipped');
            }, 1500);
        }
    }
    
    updateDisplay();
}

// Add touch support for mobile devices
function addTouchSupport() {
    // Prevent default touch behaviors that might interfere
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('card') || 
            e.target.classList.contains('btn')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Event listeners
restartBtn.addEventListener('click', initGame);

hintBtn.addEventListener('click', useHint);

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});

nextLevelBtn.addEventListener('click', nextLevelAction);

playAgainBtn.addEventListener('click', () => {
    winMessage.classList.remove('active');
    currentLevel = 1;
    hintsRemaining = 3;
    totalMoves = 0;
    totalTime = 0;
    levelStars = {};
    initGame();
});

// Close settings when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsPanel.classList.remove('active');
    }
});

// Theme change handler
themeSelect.addEventListener('change', initGame);

// Initialize the game on load
window.addEventListener('DOMContentLoaded', function() {
    initGame();
    addTouchSupport();
});
