import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Modal.css';

const StatsModal = () => {
  const { showStatsModal, toggleStatsModal, stats, startNewGame } = useContext(GameContext);
  
  return (
    <div className={`modal ${showStatsModal ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Statistics</h2>
          <button className="close-btn" onClick={toggleStatsModal}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number">{stats.gamesPlayed}</div>
              <div className="stat-label">Played</div>
            </div>
            <div className="stat">
              <div className="stat-number">{stats.winPercentage}</div>
              <div className="stat-label">Win %</div>
            </div>
            <div className="stat">
              <div className="stat-number">{stats.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat">
              <div className="stat-number">{stats.maxStreak}</div>
              <div className="stat-label">Max Streak</div>
            </div>
          </div>
          
          <div className="next-game">
            <button className="button-with-icon" onClick={() => startNewGame()}>
              <svg
                className="icon"
                id="Play"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="color000000 svgShape"
                  fill="#ffffff"
                  d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z"
                ></path>
              </svg>
              <span className="text">Play</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal; 