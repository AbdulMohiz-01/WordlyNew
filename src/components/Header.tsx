import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import DifficultyModal from './DifficultyModal';
import '../styles/Header.css';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { 
    toggleHelpModal, 
    toggleStatsModal,
    difficulty,
    startNewGame,
    currentUserName
  } = useContext(GameContext);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const location = useLocation();
  
  const toggleDifficultyModal = () => {
    setShowDifficultyModal(!showDifficultyModal);
  };
  
  const handleSelectDifficulty = (newDifficulty: typeof difficulty) => {
    console.log(`Header: Selected difficulty: ${newDifficulty}`);
    
    // Validate the difficulty value
    if (!newDifficulty || !['easy', 'medium', 'hard'].includes(newDifficulty)) {
      console.error(`Invalid difficulty selected: ${newDifficulty}`);
      return;
    }
    
    // Directly start a new game with the selected difficulty
    startNewGame(newDifficulty);
  };
  
  const getDifficultyIcon = () => {
    switch (difficulty) {
      case 'easy':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
        );
      case 'medium':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-6h2v2h-2zm0-8h2v6h-2z"/>
          </svg>
        );
      case 'hard':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        );
    }
  };
  
  const isMultiplayerPage = location.pathname === '/multiplayer';
  
  return (
    <header className="header">
      <div className="header-content">
        <button className="icon-btn" onClick={toggleHelpModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
        </button>
        
        <div className="title-container">
          <h1 className={`title ${difficulty}`}>
            WORDLY
            <div className={`difficulty-badge ${difficulty}`}>
              {difficulty}
            </div>
          </h1>
          {currentUserName && (
            <div className="user-welcome">
              Hello, <span className="user-name">{currentUserName}</span>!
            </div>
          )}
        </div>
        
        <div className="header-buttons">
          {/* Multiplayer button */}
          <Link 
            to={isMultiplayerPage ? "/" : "/multiplayer"} 
            className="icon-btn multiplayer-btn"
            title={isMultiplayerPage ? "Single Player" : "Multiplayer"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d={isMultiplayerPage 
                ? "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
                : "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"} 
              />
            </svg>
          </Link>
          
          <button className={`icon-btn difficulty-${difficulty}`} onClick={toggleDifficultyModal}>
            {getDifficultyIcon()}
          </button>
          
          <button className="icon-btn" onClick={toggleStatsModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <DifficultyModal 
        show={showDifficultyModal}
        onClose={toggleDifficultyModal}
        currentDifficulty={difficulty}
        onSelectDifficulty={handleSelectDifficulty}
      />
    </header>
  );
};

export default Header; 