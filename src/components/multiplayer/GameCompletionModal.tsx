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

const GameCompletionModal = ({ show, room }: GameCompletionModalProps) => {
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
  
  // Get top 3 players for the podium
  const podiumPlayers = sortedPlayers.slice(0, 3);

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
          <h2>Game Complete!</h2>
        </div>
        
        <div className="modal-content">
          <div className="podium-container">
            {podiumPlayers.map((player) => (
              <div 
                key={player.id} 
                className={`podium-player position-${player.position} ${player.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="player-avatar" style={{ backgroundColor: player.avatar.color }}>
                  {player.avatar.emoji}
                </div>
                <div className="player-name">{player.name}</div>
                <div className="player-score">{player.score}</div>
              </div>
            ))}
          </div>
          
          <div className="player-rankings">
            <h3>Final Rankings</h3>
            <div className="rankings-list">
              {sortedPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className={`ranking-item ${player.isCurrentUser ? 'current-user' : ''}`}
                >
                  <span className="position">{player.position}</span>
                  <span className="player-avatar" style={{ backgroundColor: player.avatar.color }}>
                    {player.avatar.emoji}
                  </span>
                  <span className="player-name">{player.name}</span>
                  <span className="player-score">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handlePlayAgain}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompletionModal; 