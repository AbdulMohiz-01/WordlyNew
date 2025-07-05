import { useContext, useEffect, useCallback, useState } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Keyboard.css';

const Keyboard = () => {
  const { 
    addLetter, 
    deleteLetter, 
    submitGuess, 
    gameOver, 
    isValidating,
    isAnimating,
    board
  } = useContext(GameContext);
  
  // Track highlighted key
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  // Define keyboard layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  // Handle physical keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Block inputs during validation or animations
    if (gameOver || isValidating || isAnimating) return;
    
    const key = e.key.toUpperCase();
    
    // Highlight the pressed key
    if (key === 'ENTER') {
      setHighlightedKey('ENTER');
      setTimeout(() => setHighlightedKey(null), 200);
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setHighlightedKey('⌫');
      setTimeout(() => setHighlightedKey(null), 200);
      deleteLetter();
    } else if (key.match(/^[A-Z]$/) && key.length === 1) {
      setHighlightedKey(key);
      setTimeout(() => setHighlightedKey(null), 200);
      addLetter(key);
    }
  }, [gameOver, isValidating, isAnimating, submitGuess, deleteLetter, addLetter]);

  // Set up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle virtual keyboard clicks
  const handleKeyClick = (key: string) => {
    // Block inputs during validation or animations
    if (gameOver || isValidating || isAnimating) return;
    
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === '⌫') {
      deleteLetter();
    } else {
      addLetter(key);
    }
  };

  // Determine key state (correct, present, absent)
  const getKeyState = (key: string) => {
    let state = '';
    
    // Check all guesses (completed rows) for this key
    for (let row = 0; row < board.length; row++) {
      // Only check rows that have been submitted
      if (board[row][0].state === 'empty' || board[row][0].state === 'filled') continue;
      
      for (let col = 0; col < board[row].length; col++) {
        const tile = board[row][col];
        if (tile.letter === key) {
          // Priority: correct > present > absent
          if (tile.state === 'correct') return 'correct';
          if (tile.state === 'present') state = 'present';
          else if (tile.state === 'absent' && state === '') state = 'absent';
        }
      }
    }
    
    return state;
  };

  // Check if keyboard is disabled
  const isKeyboardDisabled = gameOver || isValidating || isAnimating;

  return (
    <div className={`keyboard ${isKeyboardDisabled ? 'disabled' : ''}`}>
      {keyboardRows.map((row, rowIndex) => (
        <div key={`keyboard-row-${rowIndex}`} className="keyboard-row">
          {row.map((key, keyIndex) => (
            <button
              key={`key-${key}`}
              className={`key ${key === 'ENTER' || key === '⌫' ? 'key-large' : ''} ${getKeyState(key)} ${highlightedKey === key ? 'highlight' : ''}`}
              onClick={() => handleKeyClick(key)}
              data-key={key}
              disabled={isKeyboardDisabled}
            >
              {key === '⌫' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
                </svg>
              ) : key === 'ENTER' ? (
                'ENTER'
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard; 