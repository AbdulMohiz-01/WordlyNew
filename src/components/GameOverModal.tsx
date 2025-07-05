import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Modal.css';

const GameOverModal = () => {
  const { 
    showGameOverModal, 
    stats, 
    startNewGame, 
    currentWord,
    gameOver,
    currentRow
  } = useContext(GameContext);
  
  const won = gameOver && currentRow < 6;
  
  return (
    <div className={`modal ${showGameOverModal ? 'show' : ''}`}>
      <div className={`modal-content ${!won ? 'lose' : ''}`}>
        <div className="modal-header">
          <h2>{won ? 'Congratulations!' : 'Game Over'}</h2>
        </div>
        <div className="modal-body">
          <div>
            {won 
              ? `You guessed the word in ${currentRow} ${currentRow === 1 ? 'try' : 'tries'}!` 
              : `The word was ${currentWord}. Better luck next time!`
            }
          </div>
          <div className="game-over-stats">
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
            <button className="btn btn-primary" onClick={startNewGame}>Play Again</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal; 