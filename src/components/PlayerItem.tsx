import { PlayerStatus } from '../services/RoomService';

interface PlayerItemProps {
  player: any;
  isHost: boolean;
  currentUserId: string;
  onToggleReady: (playerId: string) => void;
  index: number;
}

const PlayerItem = ({ 
  player, 
  isHost, 
  currentUserId,
  onToggleReady,
  index
}: PlayerItemProps) => {
  const isCurrentUser = player.id === currentUserId;
  
  return (
    <div className={`player-item ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="player-avatar-and-info">
        <div 
          className="player-avatar" 
          style={{ 
            backgroundColor: player.avatar?.color || '#333',
            animationDelay: `${index * 0.1}s`
          }}
        >
          <span className="avatar-emoji">{player.avatar?.emoji || '👤'}</span>
        </div>
        
        <div className="player-info">
          <div className="player-name">
            {player.name} {isHost && <span className="host-badge">Host</span>}
            {isCurrentUser && <span className="you-badge">You</span>}
          </div>
          <div className={`player-status status-${player.status.toLowerCase()}`}>
            {player.status}
          </div>
        </div>
      </div>
      
      {isCurrentUser && !isHost && (
        <button 
          className={`ready-button ${player.status === PlayerStatus.READY ? 'ready' : ''}`}
          onClick={() => onToggleReady(player.id)}
        >
          {player.status === PlayerStatus.READY ? 'Not Ready' : 'Ready'}
        </button>
      )}
      
      {isCurrentUser && isHost && (
        <div className="host-controls">
          <button 
            className={`ready-button ${player.status === PlayerStatus.READY ? 'ready' : ''}`}
            onClick={() => onToggleReady(player.id)}
          >
            {player.status === PlayerStatus.READY ? 'Not Ready' : 'Ready'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerItem; 