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
            <button className="btn btn-primary" onClick={startNewGame}>New Game</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal; 