import { useState, useEffect, useRef } from 'react';
import type { Room } from '../../services/RoomService';
import { UserService } from '../../services/UserService';

interface Player {
  id: string;
  name: string;
  status: string;
  avatar: {
    emoji: string;
    color: string;
  };
  score: number;
  currentRow: number;
  guesses?: string[];
  isCurrentUser?: boolean;
  result?: 'won' | 'lost';
  scoreChange?: {
    value: number;
    timestamp: number;
  };
  position?: number; // Position for winners
  justWon?: boolean; // Flag to indicate player just won for animation
  finishTime?: number; // Timestamp when player reached target score
}

interface PlayerScoresProps {
  room?: Room | null;
}

const PlayerScores = ({ room }: PlayerScoresProps) => {
  const currentUserId = UserService.getCurrentUserId();
  
  // Initial mock data for UI demonstration with more players - all starting with 0 score
  const initialPlayers: Player[] = [
    { 
      id: '1', 
      name: 'Player 1', 
      status: 'playing', 
      avatar: { emoji: '😎', color: '#3498db' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: true
    },
    { 
      id: '2', 
      name: 'Player 2', 
      status: 'playing', 
      avatar: { emoji: '🚀', color: '#e74c3c' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    },
    { 
      id: '3', 
      name: 'Player 3', 
      status: 'playing', 
      avatar: { emoji: '🎮', color: '#2ecc71' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    },
    { 
      id: '4', 
      name: 'Player 4', 
      status: 'playing', 
      avatar: { emoji: '🏆', color: '#f39c12' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    },
    { 
      id: '5', 
      name: 'Player 5', 
      status: 'playing', 
      avatar: { emoji: '🦊', color: '#9b59b6' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    },
    { 
      id: '6', 
      name: 'Player 6', 
      status: 'playing', 
      avatar: { emoji: '🐼', color: '#1abc9c' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    },
    { 
      id: '7', 
      name: 'Player 7', 
      status: 'playing', 
      avatar: { emoji: '🦁', color: '#d35400' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    },
    { 
      id: '8', 
      name: 'Player 8', 
      status: 'playing', 
      avatar: { emoji: '🐯', color: '#27ae60' },
      score: 0,
      currentRow: 0,
      guesses: [],
      isCurrentUser: false
    }
  ];

  // Initialize players from room data if available, otherwise use mock data
  const initializePlayers = () => {
    if (room) {
      return Object.values(room.players).map(player => ({
        ...player,
        guesses: player.guesses || [],
        isCurrentUser: player.id === currentUserId
      }));
    }
    return initialPlayers;
  };

  // State to hold players data
  const [players, setPlayers] = useState<Player[]>(initializePlayers());
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const prevPlayersRef = useRef<Player[]>(initializePlayers());
  const [showCelebration] = useState<string | null>(null);

  // Update players when room data changes
  useEffect(() => {
    if (room) {
      const updatedPlayers = Object.values(room.players).map(player => {
        // Find previous player data to detect changes
        const prevPlayer = prevPlayersRef.current.find(p => p.id === player.id);
        
        // Check if score has changed
        let scoreChange = undefined;
        if (prevPlayer && prevPlayer.score !== player.score) {
          scoreChange = {
            value: player.score - prevPlayer.score,
            timestamp: Date.now()
          };
          
          // Update last updated message
          if (scoreChange.value > 0) {
            setLastUpdated(`${player.name}: +${scoreChange.value} points`);
          }
        }
        
        return {
          ...player,
          guesses: player.guesses || [],
          isCurrentUser: player.id === currentUserId,
          scoreChange
        };
      });
      
      setPlayers(updatedPlayers);
    }
  }, [room, currentUserId]);

  // Update previous players reference after each render
  useEffect(() => {
    prevPlayersRef.current = players;
  }, [players]);

  // Get all completed players (those who reached the target score)
  const completedPlayers = players.filter(player => player.result === 'won' && player.position);
  
  // Get top 3 players for the podium
  const podiumPlayers = completedPlayers.filter(player => player.position && player.position <= 3);
  const sortedPodiumPlayers = [...podiumPlayers].sort((a, b) => (a.position || 999) - (b.position || 999));
  
  // Get players who finished but aren't in the top 3
  const otherFinishedPlayers = completedPlayers.filter(player => player.position && player.position > 3);
  
  // Get active players (still playing)
  const activePlayers = players.filter(player => player.status === 'playing');
  
  // Combine other finished players and active players for the main list
  const mainListPlayers = [...otherFinishedPlayers, ...activePlayers];
  
  // Sort main list by score in descending order
  const sortedMainListPlayers = [...mainListPlayers].sort((a, b) => b.score - a.score);

  // Helper function to determine score change class
  const getScoreChangeClass = (player: Player) => {
    if (!player.scoreChange) return '';
    
    // Only apply animation if the change happened in the last 2 seconds
    if (Date.now() - player.scoreChange.timestamp > 2000) return '';
    
    return player.scoreChange.value > 0 ? 'score-increased' : 'score-decreased';
  };
  
  // Helper function to render score change indicator
  const renderScoreChangeIndicator = (player: Player) => {
    if (!player.scoreChange || Date.now() - player.scoreChange.timestamp > 2000) {
      return null;
    }
    
    const isPositive = player.scoreChange.value > 0;
    
    return (
      <div className={`score-change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{player.scoreChange.value}
      </div>
    );
  };

  // Helper function to render player's guess count
  const renderPlayerGuessCount = (player: Player) => {
    if (!player.guesses || player.guesses.length === 0) {
      return null;
    }

    return (
      <div className="player-guess-count">
        <div className="guess-count-indicator">
          {player.guesses.length} {player.guesses.length === 1 ? 'guess' : 'guesses'} made
        </div>
      </div>
    );
  };

  return (
    <div className="player-scores-container">
      <h2 className="player-scores-title">Player Scores</h2>
      
      {lastUpdated && (
        <div className="score-update-notification">
          {lastUpdated}
        </div>
      )}
      
      {showCelebration && (
        <div className="celebration-message">
          🎉 {showCelebration} 🎉
        </div>
      )}
      
      {sortedPodiumPlayers.length > 0 && (
        <div className="winners-podium">
          {sortedPodiumPlayers.map((player) => (
            <div 
              key={player.id}
              className={`winner-card position-${player.position} ${player.isCurrentUser ? 'current-user' : ''} ${player.justWon ? 'just-won' : ''}`}
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
                </div>
              </div>
              {renderPlayerGuessCount(player)}
            </div>
          ))}
        </div>
      )}
      
      <div className="player-scores-list">
        {sortedMainListPlayers.map((player) => (
          <div 
            key={player.id} 
            className={`player-score-card ${player.isCurrentUser ? 'current-user' : ''} ${getScoreChangeClass(player)} ${player.result === 'won' ? 'finished' : ''}`}
          >
            {player.position && (
              <div className="regular-position-badge">{player.position}</div>
            )}
            <div className="player-score-header">
              <div 
                className="player-avatar" 
                style={{ backgroundColor: player.avatar.color }}
              >
                <span>{player.avatar.emoji}</span>
              </div>
              
              <div className="player-info">
                <div className="player-name">
                  {player.name}
                </div>
                <div className="guesses-info">
                  {player.guesses?.length || 0}/{6} guesses
                </div>
              </div>
              
              <div className="player-score">
                <span className="score-value">{player.score}</span>
                <span className="score-label">pts</span>
                {renderScoreChangeIndicator(player)}
              </div>
            </div>
            
            {renderPlayerGuessCount(player)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerScores; 