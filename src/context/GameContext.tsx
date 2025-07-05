import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getRandomWord, isGameWord } from '../utils/words';

// Define types for our game state
export type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export interface Tile {
  letter: string;
  state: TileState;
}

export interface GameStats {
  gamesPlayed: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
}

interface GameContextType {
  // Game state
  currentWord: string;
  currentGuess: string;
  guesses: string[];
  currentRow: number;
  currentCol: number;
  gameOver: boolean;
  isValidating: boolean;
  isAnimating: boolean;
  lockedRows: number[];
  message: { text: string; type: 'success' | 'error' | 'info' | '' };
  
  // Game board state
  board: Tile[][];
  
  // Game statistics
  stats: GameStats;
  
  // Game actions
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => Promise<void>;
  startNewGame: () => void;
  
  // Modal states
  showHelpModal: boolean;
  showStatsModal: boolean;
  showGameOverModal: boolean;
  
  // Modal actions
  toggleHelpModal: () => void;
  toggleStatsModal: () => void;
  hideGameOverModal: () => void;
}

// Create context with default values
export const GameContext = createContext<GameContextType>({} as GameContextType);

// Create provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Game state
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [currentCol, setCurrentCol] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [lockedRows, setLockedRows] = useState<number[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | '' }>({ text: '', type: '' });
  
  // Board state - 6 rows of 5 tiles
  const [board, setBoard] = useState<Tile[][]>(
    Array(6).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ letter: '', state: 'empty' }))
    )
  );
  
  // Game statistics
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0
  });
  
  // Modal states
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  
  // Initialize game on component mount
  useEffect(() => {
    initGame();
    loadStatistics();
  }, []);
  
  // Initialize a new game
  const initGame = () => {
    const word = getRandomWord();
    setCurrentWord(word);
    console.log('%c TARGET WORD FOR TESTING: %c ' + word + ' ', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;', 'background: #bada55; color: #222; font-size: 16px; font-weight: bold;');
    setCurrentGuess('');
    setGuesses([]);
    setCurrentRow(0);
    setCurrentCol(0);
    setGameOver(false);
    setIsValidating(false);
    setIsAnimating(false);
    setLockedRows([]);
    setMessage({ text: '', type: '' });
    
    // Reset board
    setBoard(
      Array(6).fill(null).map(() => 
        Array(5).fill(null).map(() => ({ letter: '', state: 'empty' }))
      )
    );
  };
  
  // Start a new game
  const startNewGame = () => {
    initGame();
    setShowGameOverModal(false);
    setShowStatsModal(false);
  };
  
  // Load statistics from localStorage
  const loadStatistics = () => {
    const savedStats = localStorage.getItem('wordlyStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };
  
  // Save statistics to localStorage
  const saveStatistics = (newStats: GameStats) => {
    localStorage.setItem('wordlyStats', JSON.stringify(newStats));
    setStats(newStats);
  };
  
  // Update statistics after a game ends
  const updateStatistics = (won: boolean): void => {
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    
    if (won) {
      newStats.currentStreak += 1;
      if (newStats.currentStreak > newStats.maxStreak) {
        newStats.maxStreak = newStats.currentStreak;
      }
    } else {
      newStats.currentStreak = 0;
    }
    
    const wins = won ? (newStats.gamesPlayed * (newStats.winPercentage / 100)) + 1 : (newStats.gamesPlayed * (newStats.winPercentage / 100));
    newStats.winPercentage = Math.round((wins / newStats.gamesPlayed) * 100);
    
    saveStatistics(newStats);
  };
  
  // Check if the current row is locked
  const isRowLocked = (row: number) => {
    return lockedRows.includes(row);
  };
  
  // Add a letter to the current guess
  const addLetter = (letter: string) => {
    if (gameOver || isValidating || isAnimating || currentCol >= 5 || isRowLocked(currentRow)) return;
    
    const newBoard = [...board];
    newBoard[currentRow][currentCol] = {
      letter,
      state: 'filled'
    };
    
    setBoard(newBoard);
    setCurrentGuess(currentGuess + letter);
    setCurrentCol(currentCol + 1);
  };
  
  // Delete the last letter from the current guess
  const deleteLetter = () => {
    if (gameOver || isValidating || isAnimating || currentCol <= 0 || isRowLocked(currentRow)) return;
    
    const newCol = currentCol - 1;
    const newBoard = [...board];
    newBoard[currentRow][newCol] = {
      letter: '',
      state: 'empty'
    };
    
    setBoard(newBoard);
    setCurrentGuess(currentGuess.slice(0, -1));
    setCurrentCol(newCol);
  };
  
  // Show a message to the user
  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };
  
  // Check the guess against the target word
  const checkGuess = (guess: string, target: string) => {
    const result: ('correct' | 'present' | 'absent')[] = Array(5).fill('absent');
    const targetChars = target.split('');
    
    // First pass: check for correct positions
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
        targetChars[i] = '';  // Mark as used
      }
    }
    
    // Second pass: check for present letters
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'absent') {
        const charIndex = targetChars.indexOf(guess[i]);
        if (charIndex !== -1) {
          result[i] = 'present';
          targetChars[charIndex] = '';  // Mark as used
        }
      }
    }
    
    return result;
  };
  
  // Update the board with the results of the guess
  const updateBoard = (row: number, result: ('correct' | 'present' | 'absent')[]) => {
    // Set animating state to true
    setIsAnimating(true);
    
    // Apply the animations with a delay for each tile
    for (let i = 0; i < 5; i++) {
      // We'll apply the state changes with a delay
      setTimeout(() => {
        setBoard(prevBoard => {
          const updatedBoard = [...prevBoard];
          updatedBoard[row][i] = {
            ...updatedBoard[row][i],
            state: result[i]
          };
          return updatedBoard;
        });
        
        // Add bounce animation to correct tiles
        if (result[i] === 'correct') {
          const tile = document.querySelector(`[data-row="${row}"] [data-col="${i}"]`);
          if (tile) {
            tile.classList.add('bounce');
            setTimeout(() => {
              tile.classList.remove('bounce');
            }, 400);
          }
        }
        
        // After the last tile animation is complete, set animating to false
        if (i === 4) {
          setTimeout(() => {
            setIsAnimating(false);
          }, 400); // Wait for the animation to complete
        }
      }, i * 200); // 200ms delay between each tile flip (faster than before)
    }
  };
  
  // Submit the current guess
  const submitGuess = async () => {
    if (gameOver || isValidating || isAnimating || currentCol !== 5 || isRowLocked(currentRow)) {
      if (currentCol !== 5) {
        showMessage('Not enough letters', 'error');
      }
      return;
    }
    
    // Start validation
    setIsValidating(true);
    
    // Validate the word using the Dictionary API
    let isValid = false;
    
    try {
      console.log('Validating word with API:', currentGuess);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess.toLowerCase()}`);
      isValid = response.ok;
      console.log('API validation result:', isValid);
    } catch (error) {
      console.error('Word validation error:', error);
      // Fallback to local word list if API fails
      isValid = isGameWord(currentGuess);
      console.log('Fallback validation result:', isValid);
    }
    
    // Validation is complete - stop showing the validation animation
    setIsValidating(false);
    
    if (!isValid) {
      showMessage('Not a valid word', 'error');
      
      // Add shake animation to current row
      const currentRowEl = document.querySelector(`[data-row="${currentRow}"]`);
      if (currentRowEl) {
        currentRowEl.classList.add('shake');
        setTimeout(() => {
          currentRowEl.classList.remove('shake');
        }, 500);
      }
      
      return;
    }
    
    // Word is valid - lock this row immediately to prevent any changes
    setLockedRows(prev => [...prev, currentRow]);
    
    // Check the guess against the target word
    const result = checkGuess(currentGuess, currentWord);
    
    // Update the board with the results - this will trigger the flip animations
    updateBoard(currentRow, result);
    
    // Add the guess to the list of guesses
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    // Wait for animations to complete (5 tiles × 200ms delay + 400ms animation)
    const animationDelay = 5 * 200 + 400;
    
    // Check win condition
    if (currentGuess === currentWord) {
      setTimeout(() => {
        setGameOver(true);
        // Don't show congratulations message since we have good animations
        updateStatistics(true);
        
        // Create confetti animation
        createConfetti();
        
        // Apply win class to tiles in the winning row
        setTimeout(() => {
          // First, remove win class from any previous rows
          document.querySelectorAll('.tile.win').forEach((tile) => {
            tile.classList.remove('win');
          });
          
          // Get the winning row
          const winningRow = document.querySelector(`[data-row="${currentRow}"]`);
          if (winningRow) {
            // Get all tiles in the winning row
            const winningTiles = winningRow.querySelectorAll('.tile');
            // Add the win class to each tile with a slight delay
            winningTiles.forEach((tile, index) => {
              // Make sure the data-letter attribute is set
              const letter = tile.textContent || '';
              tile.setAttribute('data-letter', letter);
              
              setTimeout(() => {
                tile.classList.add('win');
              }, index * 50);
            });
          }
        }, 100);
        
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 2500); // Give more time to enjoy the animations
      }, animationDelay);
    } else {
      // Move to next row after animations complete
      setTimeout(() => {
        const newRow = currentRow + 1;
        setCurrentRow(newRow);
        setCurrentCol(0);
        setCurrentGuess('');
        
        // Check lose condition
        if (newRow >= 6) {
          setGameOver(true);
          showMessage(`The word was ${currentWord}... Don't give up!`, 'error');
          updateStatistics(false);
          
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
        }
      }, animationDelay);
    }
  };
  
  // Create confetti animation
  const createConfetti = () => {
    const colors = ['#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#ffd700', '#ffeb3b', '#ff9800'];
    
    // Create a moderate amount of confetti - not too overwhelming
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 1 + 's';
        
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Randomize confetti size and shape
        const size = Math.random() * 10 + 5;
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        
        // Randomly create different shapes
        if (Math.random() > 0.6) {
          piece.style.borderRadius = '50%'; // Circle
        } else if (Math.random() > 0.5) {
          piece.style.borderRadius = '0'; // Square
        } else {
          piece.style.width = size / 2 + 'px';
          piece.style.height = size + 'px';
          piece.style.borderRadius = '0';
          piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        confetti.appendChild(piece);
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          document.body.removeChild(confetti);
        }, 5000);
      }, i * 25);
    }
    
    // Add just a few golden stars for subtle flair
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'confetti';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = Math.random() * 1 + 's';
        star.style.zIndex = '10000';
        
        const starInner = document.createElement('div');
        starInner.className = 'star';
        starInner.innerHTML = '★';
        starInner.style.color = '#ffd700';
        starInner.style.fontSize = (Math.random() * 18 + 14) + 'px';
        starInner.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
        starInner.style.animation = `spin ${Math.random() * 2 + 1}s linear infinite`;
        
        star.appendChild(starInner);
        document.body.appendChild(star);
        
        setTimeout(() => {
          document.body.removeChild(star);
        }, 5000);
      }, i * 100 + 500);
    }
  };
  
  // Modal toggle functions
  const toggleHelpModal = () => setShowHelpModal(!showHelpModal);
  const toggleStatsModal = () => setShowStatsModal(!showStatsModal);
  const hideGameOverModal = () => setShowGameOverModal(false);
  
  // Context value
  const contextValue = {
    currentWord,
    currentGuess,
    guesses,
    currentRow,
    currentCol,
    gameOver,
    isValidating,
    isAnimating,
    lockedRows,
    message,
    board,
    stats,
    addLetter,
    deleteLetter,
    submitGuess,
    startNewGame,
    showHelpModal,
    showStatsModal,
    showGameOverModal,
    toggleHelpModal,
    toggleStatsModal,
    hideGameOverModal
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};