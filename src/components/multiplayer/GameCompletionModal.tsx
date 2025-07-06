import { useNavigate } from 'react-router-dom';
import type { Room } from '../../services/RoomService';
import { UserService } from '../../services/UserService';
import '../../styles/Modal.css';
import '../../styles/MultiplayerGame.css';

interface GameCompletionModalProps {
  show: boolean;
  room: Room | null;
  onClose: () => void;
}

const GameCompletionModal = ({ show, room, onClose }: GameCompletionModalProps) => {
  const navigate = useNavigate();
  const currentUserId = UserService.getCurrentUserId();

  if (!show || !room) {
    return null;
  }

  // Sort players by score in descending order
  const sortedPlayers = Object.values(room.players)
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      position: index + 1,
      isCurrentUser: player.id === currentUserId
    }));

  // Get the winner (highest score)
  const winner = sortedPlayers[0];
  
  // Get top 3 players for the podium
  const podiumPlayers = sortedPlayers.slice(0, 3);
  
  // Check if current user is in top 3
  const currentUserInTop3 = podiumPlayers.some(player => player.id === currentUserId);
  
  // Get the current user's position
  const currentUserPosition = sortedPlayers.find(player => player.id === currentUserId)?.position || 0;

  // Function to get position suffix (1st, 2nd, 3rd, etc.)
  const getPositionSuffix = (position: number) => {
    if (position === 1) return 'st';
    if (position === 2) return 'nd';
    if (position === 3) return 'rd';
    return 'th';
  };

  const handlePlayAgain = () => {
    // Navigate back to the lobby
    if (room) {
      navigate(`/multiplayer/${room.id}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="modal-overlay">
      <div className="modal game-completion-modal">
        <div className="modal-header">
          <h2>Game Completed!</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="game-result-message">
            {winner.id === currentUserId ? (
              <h3 className="winner-message">
                Congratulations! You won! 🏆
              </h3>
            ) : (
              <h3>
                {winner.name} won the game!
              </h3>
            )}
            
            <p className="result-info">
              {currentUserInTop3 ? (
                <>You finished in <span className="highlight">{currentUserPosition}{getPositionSuffix(currentUserPosition)}</span> place!</>
              ) : (
                <>You finished in {currentUserPosition}{getPositionSuffix(currentUserPosition)} place</>
              )}
            </p>
          </div>
          
          <div className="winners-podium podium-large">
            {podiumPlayers.map((player) => (
              <div 
                key={player.id}
                className={`winner-card position-${player.position} ${player.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="position-badge">{player.position}</div>
                <div className="winner-content">
                  <div 
                    className="player-avatar" 
                    style={{ backgroundColor: player.avatar.color }}
                  >
                    <span>{player.avatar.emoji}</span>
                    {player.position === 1 && <div className="crown-icon">👑</div>}
                  </div>
                  
                  <div className="player-info">
                    <div className="player-name">
                      {player.name}
                    </div>
                    <div className="winner-score">
                      {player.score} pts
                    </div>
                    <div className="guesses-info">
                      {player.guesses?.length || 0}/{6} guesses
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="all-players-results">
            <h4>All Players</h4>
            <div className="results-list">
              {sortedPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className={`player-result-item ${player.isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="player-position">{player.position}</div>
                  <div 
                    className="player-avatar small" 
                    style={{ backgroundColor: player.avatar.color }}
                  >
                    {player.avatar.emoji}
                  </div>
                  <div className="player-name">{player.name}</div>
                  <div className="player-result-score">{player.score} pts</div>
                  <div className="player-result-guesses">{player.guesses?.length || 0}/{6}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="game-completion-actions">
            <button className="action-button play-again" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="action-button back-home" onClick={handleBackToHome}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCompletionModal; 