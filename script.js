// Game state
let currentWord = '';
let currentGuess = '';
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let isValidating = false;

// Game elements
const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

// Modal elements
const helpModal = document.getElementById('help-modal');
const statsModal = document.getElementById('stats-modal');
const gameOverModal = document.getElementById('game-over-modal');

// Statistics elements
const gamesPlayedEl = document.getElementById('games-played');
const winPercentageEl = document.getElementById('win-percentage');
const currentStreakEl = document.getElementById('current-streak');
const maxStreakEl = document.getElementById('max-streak');

// Game over elements
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');
const finalGamesPlayedEl = document.getElementById('final-games-played');
const finalWinPercentageEl = document.getElementById('final-win-percentage');
const finalCurrentStreakEl = document.getElementById('final-current-streak');
const finalMaxStreakEl = document.getElementById('final-max-streak');

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    setupEventListeners();
    loadStatistics();
});

function initGame() {
    currentWord = getRandomWord();
    currentGuess = '';
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    isValidating = false;
    
    // Clear the board and remove all game end animations
    gameBoard.classList.remove('win', 'lose');
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile';
    });
    
    // Remove lose class from rows
    document.querySelectorAll('.tile-row').forEach(row => {
        row.classList.remove('lose');
    });
    
    // Reset keyboard
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.className = key.classList.contains('key-large') ? 'key key-large' : 'key';
    });
    
    // Clear message
    hideMessage();
    
    console.log('New game started. Word:', currentWord); // For debugging
}

function setupEventListeners() {
    // Physical keyboard
    document.addEventListener('keydown', handleKeyPress);
    
    // Virtual keyboard
    keyboard.addEventListener('click', handleKeyboardClick);
    
    // Modal controls
    document.getElementById('help-btn').addEventListener('click', () => showModal('help-modal'));
    document.getElementById('stats-btn').addEventListener('click', () => showModal('stats-modal'));
    document.getElementById('new-game-btn').addEventListener('click', () => {
        hideModal('stats-modal');
        initGame();
    });
    document.getElementById('play-again-btn').addEventListener('click', () => {
        hideModal('game-over-modal');
        initGame();
    });
    
    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal');
            hideModal(modalId);
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

function handleKeyPress(e) {
    if (gameOver || isValidating) return;
    
    const key = e.key.toUpperCase();
    
    // Add visual feedback for the pressed key
    let keyElement;
    if (key === 'BACKSPACE') {
        keyElement = document.querySelector('[data-key="⌫"]');
    } else {
        keyElement = document.querySelector(`[data-key="${key}"]`);
    }
    
    if (keyElement) {
        keyElement.classList.add('pressed');
        setTimeout(() => {
            keyElement.classList.remove('pressed');
        }, 150);
    }
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (key.match(/[A-Z]/) && key.length === 1) {
        addLetter(key);
    }
}

function handleKeyboardClick(e) {
    if (gameOver || isValidating) return;
    
    const key = e.target.closest('.key')?.getAttribute('data-key');
    if (!key) return;
    
    // Add visual feedback
    const keyElement = e.target.closest('.key');
    keyElement.classList.add('pressed');
    setTimeout(() => {
        keyElement.classList.remove('pressed');
    }, 150);
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === '⌫') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentCol < 5) {
        const tile = getTile(currentRow, currentCol);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentGuess += letter;
        currentCol++;
    }
}

function deleteLetter() {
    if (currentCol > 0) {
        currentCol--;
        const tile = getTile(currentRow, currentCol);
        tile.textContent = '';
        tile.classList.remove('filled');
        currentGuess = currentGuess.slice(0, -1);
    }
}

async function submitGuess() {
    if (currentCol !== 5) {
        showMessage('Not enough letters', 'error');
        shakeRow(currentRow);
        return;
    }
    
    // Add validating state to current row
    const currentRowEl = document.querySelector(`[data-row="${currentRow}"]`);
    currentRowEl.classList.add('validating');
    
    // Validate word using dictionary API
    const isValid = await validateWord(currentGuess);
    
    // Remove validating state
    currentRowEl.classList.remove('validating');
    
    if (!isValid) {
        showMessage('Not a valid word', 'error');
        shakeRow(currentRow);
        return;
    }
    
    // Check the guess
    const result = checkGuess(currentGuess, currentWord);
    
    // Update tiles with feedback
    updateTiles(currentRow, result);
    
    // Update keyboard
    updateKeyboard(currentGuess, result);
    
    // Check win condition
    if (currentGuess === currentWord) {
        gameOver = true;
        showMessage('Congratulations! 🎉', 'success');
        updateStatistics(true, currentRow + 1);
        
        // Add win animations
        const winningRow = document.querySelector(`[data-row="${currentRow}"]`);
        winningRow.querySelectorAll('.tile').forEach(tile => {
            tile.classList.add('win');
        });
        gameBoard.classList.add('win');
        
        setTimeout(() => {
            showGameOverModal(true);
        }, 2000);
        return;
    }
    
    // Move to next row
    currentRow++;
    currentCol = 0;
    currentGuess = '';
    
    // Check lose condition
    if (currentRow >= 6) {
        gameOver = true;
        
        // Add lose animations
        gameBoard.classList.add('lose');
        const lastRow = document.querySelector(`[data-row="${currentRow - 1}"]`);
        lastRow.classList.add('lose');
        
        // Show dramatic message with the word
        showMessage(`The word was ${currentWord}... Don't give up!`, 'error');
        updateStatistics(false, 0);
        
        setTimeout(() => {
            showGameOverModal(false);
        }, 2000);
    }
}

async function validateWord(word) {
    if (isValidating) return false;
    
    isValidating = true;
    
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        const isValid = response.ok;
        
        isValidating = false;
        return isValid;
    } catch (error) {
        console.error('Word validation error:', error);
        isValidating = false;
        
        // Fallback to local word list if API fails
        return isGameWord(word);
    }
}

function checkGuess(guess, target) {
    const result = [];
    const targetArray = target.split('');
    const guessArray = guess.split('');
    
    // First pass: mark correct letters
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === targetArray[i]) {
            result[i] = 'correct';
            targetArray[i] = null; // Mark as used
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (result[i]) continue; // Skip if already marked as correct
        
        const letterIndex = targetArray.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
            result[i] = 'present';
            targetArray[letterIndex] = null; // Mark as used
        } else {
            result[i] = 'absent';
        }
    }
    
    return result;
}

function updateTiles(row, result) {
    for (let i = 0; i < 5; i++) {
        const tile = getTile(row, i);
        
        setTimeout(() => {
            tile.classList.add(result[i]);
            if (result[i] === 'correct') {
                tile.classList.add('bounce');
            }
        }, i * 100);
    }
}

function updateKeyboard(guess, result) {
    for (let i = 0; i < 5; i++) {
        const letter = guess[i];
        const key = document.querySelector(`[data-key="${letter}"]`);
        
        if (key) {
            // Only update if the new state is "better" than current
            const currentState = key.classList.contains('correct') ? 'correct' :
                                 key.classList.contains('present') ? 'present' :
                                 key.classList.contains('absent') ? 'absent' : '';
            
            const newState = result[i];
            
            if (!currentState || 
                (currentState === 'absent' && (newState === 'present' || newState === 'correct')) ||
                (currentState === 'present' && newState === 'correct')) {
                
                key.classList.remove('correct', 'present', 'absent');
                key.classList.add(newState);
            }
        }
    }
}

function getTile(row, col) {
    return document.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
}

function shakeRow(row) {
    const rowElement = document.querySelector(`[data-row="${row}"]`);
    rowElement.classList.add('shake');
    setTimeout(() => {
        rowElement.classList.remove('shake');
    }, 500);
}

function showMessage(text, type = 'info') {
    message.textContent = text;
    message.className = `message ${type} show`;
    
    setTimeout(() => {
        hideMessage();
    }, 3000);
}

function hideMessage() {
    message.classList.remove('show');
    setTimeout(() => {
        message.className = 'message';
    }, 300);
}

function showLoading() {
    loading.classList.add('show');
}

function hideLoading() {
    loading.classList.remove('show');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    
    if (modalId === 'stats-modal') {
        updateStatisticsDisplay();
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

function showGameOverModal(won) {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    
    if (won) {
        title.textContent = 'Congratulations!';
        message.textContent = `You found the word in ${currentRow + 1} ${currentRow === 0 ? 'try' : 'tries'}!`;
    } else {
        title.textContent = 'Game Over';
        message.textContent = `The word was: ${currentWord}`;
    }
    
    updateGameOverStats();
    showModal('game-over-modal');
}

// Statistics functions
function getStatistics() {
    const stats = localStorage.getItem('wordly-stats');
    return stats ? JSON.parse(stats) : {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0
    };
}

function saveStatistics(stats) {
    localStorage.setItem('wordly-stats', JSON.stringify(stats));
}

function updateStatistics(won, attempts) {
    const stats = getStatistics();
    
    stats.gamesPlayed++;
    
    if (won) {
        stats.gamesWon++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    } else {
        stats.currentStreak = 0;
    }
    
    saveStatistics(stats);
}

function loadStatistics() {
    updateStatisticsDisplay();
}

function updateStatisticsDisplay() {
    const stats = getStatistics();
    const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    
    gamesPlayedEl.textContent = stats.gamesPlayed;
    winPercentageEl.textContent = winPercentage;
    currentStreakEl.textContent = stats.currentStreak;
    maxStreakEl.textContent = stats.maxStreak;
}

function updateGameOverStats() {
    const stats = getStatistics();
    const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    
    finalGamesPlayedEl.textContent = stats.gamesPlayed;
    finalWinPercentageEl.textContent = winPercentage;
    finalCurrentStreakEl.textContent = stats.currentStreak;
    finalMaxStreakEl.textContent = stats.maxStreak;
}

// Confetti animation
function createConfetti() {
    const colors = ['#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = (Math.random() * 10 + 5) + 'px';
            piece.style.height = piece.style.width;
            
            confetti.appendChild(piece);
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                document.body.removeChild(confetti);
            }, 5000);
        }, i * 50);
    }
} 