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
  completedAt?: number; // Timestamp when player completed the game
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
        
        // Check if player just completed the game
        let justWon = false;
        if (prevPlayer && 
            prevPlayer.status !== 'completed' && 
            player.status === 'completed' && 
            player.isWinner) {
          justWon = true;
          // setShowCelebration(`${player.name} has completed the game!`);
          
          // // Clear celebration message after 3 seconds
          // setTimeout(() => {
          //   setShowCelebration(null);
          // }, 3000);
        }
        
        return {
          ...player,
          guesses: player.guesses || [],
          isCurrentUser: player.id === currentUserId,
          scoreChange,
          justWon,
          finishTime: player.completedAt // Use completedAt as finishTime
        };
      });
      
      setPlayers(updatedPlayers);
    }
  }, [room, currentUserId]);

  // Update previous players reference after each render
  useEffect(() => {
    prevPlayersRef.current = players;
  }, [players]);

  // Get completed players (those who have completed the game)
  const completedPlayers = players.filter(player => player.status === 'completed');
  
  // Sort completed players by position if available, otherwise by score
  const sortedCompletedPlayers = [...completedPlayers].sort((a, b) => {
    // First try to sort by position
    if (a.position && b.position) {
      return a.position - b.position;
    }
    // Then by score (higher score first)
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    // Then by completion time if available
    if (a.completedAt && b.completedAt) {
      return a.completedAt - b.completedAt;
    }
    return 0;
  });
  
  // Assign positions to top 3 players if not already assigned
  const podiumPlayers = sortedCompletedPlayers.slice(0, 3).map((player, index) => ({
    ...player,
    position: player.position || index + 1
  }));
  
  // Get remaining players (not in top 3)
  const otherCompletedPlayers = sortedCompletedPlayers.length > 3 
    ? sortedCompletedPlayers.slice(3).map((player, index) => ({
        ...player,
        position: player.position || index + 4
      }))
    : [];
  
  // Get active players (still playing)
  const activePlayers = players.filter(player => player.status === 'playing');
  
  // Combine other completed players and active players for the main list
  const mainListPlayers = [...otherCompletedPlayers, ...activePlayers];
  
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
      // <div className="player-guess-count">
      //   <div className="guess-count-indicator">
      //     {player.guesses.length} {player.guesses.length === 1 ? 'guess' : 'guesses'} made
      //   </div>
      // </div>
      <></>
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
      
      {podiumPlayers.length > 0 && (
        <div className="winners-podium">
          {podiumPlayers.map((player) => (
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
            className={`player-score-card ${player.isCurrentUser ? 'current-user' : ''} ${getScoreChangeClass(player)} ${player.status === 'completed' ? 'finished' : ''}`}
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