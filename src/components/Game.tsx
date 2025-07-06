import Header from './Header';
import Board from './Board';
import Keyboard from './Keyboard';
import Message from './Message';
import HelpModal from './HelpModal';
import StatsModal from './StatsModal';
import GameOverModal from './GameOverModal';
import UserRegistrationModal from './UserRegistrationModal';
import { useContext, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Game.css';
import '../styles/WinAnimations.css';
import '../styles/BorderPulse.css';

const Game = () => {
  const { 
    showUserRegistrationModal, 
    registerUser,
    isUserRegistered 
  } = useContext(GameContext);
  
  // Disable keyboard events when registration modal is shown
  useEffect(() => {
    if (showUserRegistrationModal) {
      // Create a transparent overlay that captures all events
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'transparent';
      overlay.style.zIndex = '9000';
      overlay.style.pointerEvents = 'all';
      overlay.id = 'event-blocker';
      
      // Add it to the body
      document.body.appendChild(overlay);
      
      // Handle keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        if (showUserRegistrationModal) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
      
      return () => {
        // Remove the overlay
        if (document.getElementById('event-blocker')) {
          document.body.removeChild(overlay);
        }
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [showUserRegistrationModal]);
  
  // If user is not registered, only show the registration modal
  if (!isUserRegistered) {
    return (
      <UserRegistrationModal 
        show={true}
        onClose={() => {}} // Cannot be closed - user must register
        onRegister={registerUser}
      />
    );
  }
  
  // User is registered, show the game
  return (
    <>
      <div className="container">
        <Header />
        
        <main className="game-container">
          <Board />
          <div className="keyboard-container">
            <Keyboard />
          </div>
          <Message />
        </main>
        
        <HelpModal />
        <StatsModal />
        <GameOverModal />
      </div>
    </>
  );
};

export default Game; 