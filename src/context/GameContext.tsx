import { createContext, useState, useEffect } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { isGameWord } from '../utils/words';
import { getWordByDifficulty } from '../utils/wordService';
import type { DifficultyLevel } from '../utils/wordService';
import { UserService } from '../services/UserService';
import { RoomService } from '../services/RoomService';
import type { UserData } from '../components/UserRegistrationModal';
import { useParams } from 'react-router-dom';

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
  
  // Difficulty settings
  difficulty: DifficultyLevel;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  
  // Game actions
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => Promise<void>;
  startNewGame: (newDifficultyOrEvent?: DifficultyLevel | MouseEvent) => Promise<void>;
  
  // Modal states
  showHelpModal: boolean;
  showStatsModal: boolean;
  showGameOverModal: boolean;
  showUserRegistrationModal: boolean;
  
  // Modal actions
  toggleHelpModal: () => void;
  toggleStatsModal: () => void;
  hideGameOverModal: () => void;
  
  // User registration
  isUserRegistered: boolean;
  currentUserName: string | null;
  registerUser: (userData: UserData) => Promise<void>;
  
  // Multiplayer
  isMultiplayer: boolean;
  roomId: string | null;
}

// Create context with default values
export const GameContext = createContext<GameContextType>({} as GameContextType);

// Create provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Get roomId from URL params for multiplayer mode
  const { roomId } = useParams<{ roomId?: string }>();
  const isMultiplayer = !!roomId;
  
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
  
  // Difficulty settings
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  
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
  const [showUserRegistrationModal, setShowUserRegistrationModal] = useState<boolean>(false);
  
  // User registration state
  const [isUserRegistered, setIsUserRegistered] = useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  
  // Initialize component on mount
  useEffect(() => {
    const initialize = async () => {
      // Check if user is registered
      const isRegistered = UserService.isUserRegistered();
      setIsUserRegistered(isRegistered);
      
      if (isRegistered) {
        // Load user name
        const userName = UserService.getCurrentUserName();
        setCurrentUserName(userName);
        
        // Initialize game only if user is registered
        await initGame();
        
        // Only load statistics in single player mode
        if (!isMultiplayer) {
          loadStatistics();
        }
        
        // Track session
        const userId = UserService.getCurrentUserId();
        if (userId) {
          UserService.trackSession(userId, {
            action: 'game_start',
            difficulty,
            isMultiplayer
          });
        }
      } else {
        // Show registration modal
        setShowUserRegistrationModal(true);
      }
    };
    
    initialize();
  }, [isMultiplayer]);
  
  // Register user
  const registerUser = async (userData: UserData) => {
    try {
      console.log('Registering user in GameContext:', userData.name);
      
      // Register user
      const userId = await UserService.registerUser(userData);
      
      // Update state first to trigger UI changes
      setIsUserRegistered(true);
      setCurrentUserName(userData.name);
      setShowUserRegistrationModal(false);
      
      console.log('User registered, initializing game...');
      
      // Initialize game after registration
      await initGame();
      
      // Only load statistics in single player mode
      if (!isMultiplayer) {
        loadStatistics();
      }
      
      // Track session
      UserService.trackSession(userId, {
        action: 'game_start',
        difficulty,
        isMultiplayer
      });
      
      // Show welcome message
      showMessage(`Welcome, ${userData.name}!`, 'success');
      
      return;
    } catch (error) {
      console.error('Error registering user:', error);
      showMessage('Error registering user. Please try again.', 'error');
      throw error; // Re-throw to let the component handle it
    }
  };
  
  // Start a new game
  const startNewGame = async (newDifficultyOrEvent?: DifficultyLevel | MouseEvent) => {
    // Check if the parameter is a React event (from button click) or a difficulty level
    const isEvent = newDifficultyOrEvent && typeof newDifficultyOrEvent === 'object' && 'target' in newDifficultyOrEvent;
    
    // If it's a valid difficulty and not an event, update the difficulty
    const newDifficulty = !isEvent ? newDifficultyOrEvent as DifficultyLevel : undefined;
    
    if (newDifficulty) {
      console.log(`Setting difficulty to: ${newDifficulty}`);
      setDifficulty(newDifficulty);
    }
    
    // Use the provided difficulty or current state
    const difficultyToUse = newDifficulty || difficulty;
    console.log(`Starting new game with difficulty: ${difficultyToUse}`);
    
    try {
      // In multiplayer mode, get the word from the room
      let word: string;
      
      if (isMultiplayer && roomId) {
        const room = await RoomService.getRoom(roomId);
        if (!room || !room.currentWord) {
          console.error('Failed to get word from room');
          return;
        }
        word = room.currentWord;
      } else {
        // Fetch word with the specified difficulty for single player
        console.log(`Fetching word for difficulty: ${difficultyToUse}`);
        word = await getWordByDifficulty(difficultyToUse);
        
        if (!word) {
          console.error('Failed to get word for difficulty:', difficultyToUse);
          return;
        }
      }
      
      setCurrentWord(word);
      console.log('%c TARGET WORD FOR TESTING: %c ' + word + ' ', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;', 'background: #bada55; color: #222; font-size: 16px; font-weight: bold;');
      console.log(`%c Difficulty: %c ${difficultyToUse} `, 'background: #222; color: #bada55; font-size: 12px;', 'background: #bada55; color: #222; font-size: 12px;');
      
      // Reset game state
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
      
      setShowGameOverModal(false);
      setShowStatsModal(false);
      
      // Track game session if user is registered
      if (isUserRegistered) {
        const userId = UserService.getCurrentUserId();
        if (userId) {
          UserService.trackSession(userId, {
            action: 'new_game',
            difficulty: difficultyToUse,
            word: word,
            isMultiplayer
          });
        }
      }
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };
  
  // Initialize game
  const initGame = async () => {
    // Start a new game
    await startNewGame();
  };
  
  // Load statistics from local storage
  const loadStatistics = () => {
    const statsData = localStorage.getItem('wordlyStats');
    if (statsData) {
      setStats(JSON.parse(statsData));
    }
  };
  
  // Save statistics to local storage
  const saveStatistics = (newStats: GameStats) => {
    localStorage.setItem('wordlyStats', JSON.stringify(newStats));
    setStats(newStats);
  };
  
  // Update statistics after game completion
  const updateStatistics = (won: boolean): void => {
    // Only update statistics in single player mode
    if (isMultiplayer) return;
    
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    
    if (won) {
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
    } else {
      newStats.currentStreak = 0;
    }
    
    newStats.winPercentage = Math.round((newStats.maxStreak / newStats.gamesPlayed) * 100);
    saveStatistics(newStats);
  };
  
  // Check if a row is locked (already submitted)
  const isRowLocked = (row: number) => {
    return lockedRows.includes(row);
  };
  
  // Add a letter to the current guess
  const addLetter = (letter: string) => {
    if (gameOver || isValidating || isAnimating || currentCol >= 5 || isRowLocked(currentRow)) {
      return;
    }
    
    // Add the letter to the current guess
    const newGuess = currentGuess + letter;
    setCurrentGuess(newGuess);
    
    // Update the board
    const newBoard = [...board];
    newBoard[currentRow][currentCol] = { letter, state: 'filled' };
    setBoard(newBoard);
    
    // Move to the next column
    setCurrentCol(currentCol + 1);
  };
  
  // Delete the last letter from the current guess
  const deleteLetter = () => {
    if (gameOver || isValidating || isAnimating || currentCol <= 0 || isRowLocked(currentRow)) {
      return;
    }
    
    // Remove the last letter from the current guess
    const newGuess = currentGuess.slice(0, -1);
    setCurrentGuess(newGuess);
    
    // Update the board
    const newCol = currentCol - 1;
    const newBoard = [...board];
    newBoard[currentRow][newCol] = { letter: '', state: 'empty' };
    setBoard(newBoard);
    
    // Move to the previous column
    setCurrentCol(newCol);
  };
  
  // Show a message to the user
  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    
    // Clear the message after 2 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 2000);
  };
  
  // Check the guess against the target word
  const checkGuess = (guess: string, target: string) => {
    const result: ('correct' | 'present' | 'absent')[] = [];
    const guessArray = guess.split('');
    const targetArray = target.split('');
    
    // First pass: Mark correct letters
    for (let i = 0; i < guessArray.length; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = '#'; // Mark as used
      }
    }
    
    // Second pass: Mark present letters
    for (let i = 0; i < guessArray.length; i++) {
      if (result[i]) continue; // Skip already marked letters
      
      const letterIndex = targetArray.indexOf(guessArray[i]);
      if (letterIndex !== -1) {
        result[i] = 'present';
        targetArray[letterIndex] = '#'; // Mark as used
      } else {
        result[i] = 'absent';
      }
    }
    
    return result;
  };
  
  // Update the board with the results of a guess
  const updateBoard = (row: number, result: ('correct' | 'present' | 'absent')[]) => {
    // Start the animation sequence
    setIsAnimating(true);
    
    // Update each tile with a delay
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const newBoardUpdate = [...board];
        newBoardUpdate[row][i] = {
          ...newBoardUpdate[row][i],
          state: result[i]
        };
        setBoard(newBoardUpdate);
        
        // If this is the last tile, end the animation sequence
        if (i === 4) {
          setTimeout(() => {
            setIsAnimating(false);
          }, 400); // Wait for the flip animation to complete
        }
      }, i * 200); // 200ms delay between each tile
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
    
    // For multiplayer mode, update the player's progress in the database
    if (isMultiplayer && roomId) {
      // Calculate score based on correct letters
      const correctCount = result.filter(r => r === 'correct').length;
      const presentCount = result.filter(r => r === 'present').length;
      
      // Score: 10 points for each correct letter, 2 points for each present letter
      const scoreForThisGuess = (correctCount * 10) + (presentCount * 2);
      
      try {
        // Update player progress in the database
        await RoomService.updatePlayerProgress(
          roomId,
          currentRow + 1,  // currentRow is 0-based, but we store 1-based for display
          scoreForThisGuess,
          currentGuess
        );
      } catch (error) {
        console.error('Error updating player progress:', error);
      }
    }
    
    // Wait for animations to complete (5 tiles × 200ms delay + 400ms animation)
    const animationDelay = 5 * 200 + 400;
    
    // Check win condition
    if (currentGuess === currentWord) {
      setTimeout(() => {
        setGameOver(true);
        // Don't show congratulations message since we have good animations
        
        // In multiplayer mode, update the player's status to completed
        if (isMultiplayer && roomId) {
          try {
            RoomService.completeGame(roomId, currentRow + 1 * 50, true);
          } catch (error) {
            console.error('Error completing game:', error);
          }
        } else {
          // Only update statistics in single player mode
          updateStatistics(true);
        }
        
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
        
        // Track game completion if user is registered
        if (isUserRegistered) {
          const userId = UserService.getCurrentUserId();
          if (userId) {
            UserService.trackSession(userId, {
              action: 'game_win',
              difficulty,
              word: currentWord,
              attempts: currentRow + 1,
              isMultiplayer
            });
          }
        }
        
        // Only show game over modal in single player mode
        if (!isMultiplayer) {
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 2500); // Give more time to enjoy the animations
        }
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
          
          // In multiplayer mode, update the player's status to completed
          if (isMultiplayer && roomId) {
            try {
              RoomService.completeGame(roomId, 0, false);
            } catch (error) {
              console.error('Error completing game:', error);
            }
          } else {
            // Only update statistics in single player mode
            updateStatistics(false);
          }
          
          // Track game completion if user is registered
          if (isUserRegistered) {
            const userId = UserService.getCurrentUserId();
            if (userId) {
              UserService.trackSession(userId, {
                action: 'game_lose',
                difficulty,
                word: currentWord,
                attempts: 6,
                isMultiplayer
              });
            }
          }
          
          // Only show game over modal in single player mode
          if (!isMultiplayer) {
            setTimeout(() => {
              setShowGameOverModal(true);
            }, 1500);
          }
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
        
        const piece = document.createElement('div');
        piece.className = 'confetti-piece star';
        piece.style.color = '#ffd700';
        piece.textContent = '★';
        piece.style.fontSize = (Math.random() * 15 + 10) + 'px';
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        star.appendChild(piece);
        document.body.appendChild(star);
        
        setTimeout(() => {
          document.body.removeChild(star);
        }, 5000);
      }, i * 100);
    }
  };
  
  // Modal toggle functions
  const toggleHelpModal = () => setShowHelpModal(!showHelpModal);
  const toggleStatsModal = () => setShowStatsModal(!showStatsModal);
  const hideGameOverModal = () => setShowGameOverModal(false);
  
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    startNewGame(newDifficulty);
  };
  
  return (
    <GameContext.Provider value={{
      // Game state
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
      
      // Game board state
      board,
      
      // Game statistics
      stats,
      
      // Difficulty settings
      difficulty,
      setDifficulty: handleDifficultyChange,
      
      // Game actions
      addLetter,
      deleteLetter,
      submitGuess,
      startNewGame,
      
      // Modal states
      showHelpModal,
      showStatsModal,
      showGameOverModal,
      showUserRegistrationModal,
      
      // Modal actions
      toggleHelpModal,
      toggleStatsModal,
      hideGameOverModal,
      
      // User registration
      isUserRegistered,
      currentUserName,
      registerUser,
      
      // Multiplayer
      isMultiplayer,
      roomId: roomId || null
    }}>
      {children}
    </GameContext.Provider>
  );
};