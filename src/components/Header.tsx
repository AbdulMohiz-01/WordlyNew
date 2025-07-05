import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Header.css';

const Header = () => {
  const { toggleHelpModal, toggleStatsModal } = useContext(GameContext);
  
  return (
    <header className="header">
      <div className="header-content">
        <button className="icon-btn" onClick={toggleHelpModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
        </button>
        
        <h1 className="title">WORDLY</h1>
        
        <button className="icon-btn" onClick={toggleStatsModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header; 