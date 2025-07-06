import { GameProvider } from './context/GameContext';
import Game from './components/Game';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/BorderPulse.css';
import { useState, useEffect } from 'react';
import { RoomService } from './services/RoomService';
import { UserService } from './services/UserService';
import { PlayerStatus } from './services/RoomService';

// Create Room Button Component
const CreateRoomButton = () => {
  const location = useLocation();
  
  // Hide button on lobby and room creation pages
  if (location.pathname.includes('/lobby') || location.pathname === '/create-room') {
    return null;
  }
  
  return (
    <div className="create-room-floating-btn-container">
      <Link to="/create-room" className="create-room-floating-btn">
        Create Room
      </Link>
    </div>
  );
};

// Room Creation Page Component
const RoomCreationPage = () => {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '', form: '' });
  const navigate = useNavigate();
  
  // Generate a random 6-digit room code
  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setMessage({ text: 'Please enter a room name', type: 'error', form: 'create' });
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Generate a 6-digit room code
      const newRoomCode = generateRoomCode();
      
      // Import getWordByDifficulty
      const { getWordByDifficulty } = await import('./utils/wordService');
      
      // Get a random word based on difficulty
      const word = await getWordByDifficulty(difficulty);
      
      // Create the room with the generated code as ID, including word and difficulty
      await RoomService.createRoom(roomName, newRoomCode, difficulty, word);
      
      // Navigate to the lobby page
      navigate(`/lobby/${newRoomCode}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setMessage({ 
        text: 'Failed to create room. Please try again.', 
        type: 'error',
        form: 'create'
      });
      setIsCreating(false);
    }
  };
  
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim() || roomCode.length !== 6) {
      setMessage({ text: 'Please enter a valid 6-digit room code', type: 'error', form: 'join' });
      return;
    }
    
    try {
      setIsJoining(true);
      
      // Check if room exists
      const room = await RoomService.getRoom(roomCode);
      
      if (!room) {
        setMessage({ text: 'Room not found', type: 'error', form: 'join' });
        setIsJoining(false);
        return;
      }
      
      // Join the room
      await RoomService.joinRoom(roomCode);
      
      // Navigate to the lobby page
      navigate(`/lobby/${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setMessage({ 
        text: 'Failed to join room. Please try again.', 
        type: 'error',
        form: 'join'
      });
      setIsJoining(false);
    }
  };
  
  return (
    <div className="room-creation-page">
      <h1>Multiplayer</h1>
      
      <div className="forms-container">
        {/* Create Room Form */}
        <div className="room-creation-form">
          <h2>Create Room</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group">
              <label htmlFor="roomName">Room Name</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                disabled={isCreating}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                disabled={isCreating}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            {message.form === 'create' && message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <button 
              type="submit" 
              className="create-room-submit-btn"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        </div>
        
        {/* Join Room Form */}
        <div className="room-creation-form join-form">
          <h2>Join Room</h2>
          <form onSubmit={handleJoinSubmit}>
            <div className="form-group">
              <label htmlFor="roomCode">Room Code</label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.slice(0, 6))}
                placeholder="Enter 6-digit room code"
                disabled={isJoining}
                maxLength={6}
                pattern="\d{6}"
                required
              />
            </div>
            
            {message.form === 'join' && message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <button 
              type="submit" 
              className="join-room-submit-btn"
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </form>
        </div>
      </div>
      
      <Link to="/" className="back-to-game-btn">
        Back to Game
      </Link>
    </div>
  );
};

// Room Code Display Component
const RoomCodeDisplay = ({ code }: { code: string }) => {
  return (
    <div className="room-code-container">
      <div className="room-code-label">ROOM CODE</div>
      <div className="room-code-blocks">
        {code.split('').map((digit, index) => (
          <div key={index} className={`room-code-block color-${index % 5}`}>
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
};

// Player Item Component
const PlayerItem = ({ 
  player, 
  isHost, 
  currentUserId,
  onToggleReady,
  index
}: { 
  player: any, 
  isHost: boolean,
  currentUserId: string,
  onToggleReady: (playerId: string) => void,
  index: number
}) => {
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

// Game Lobby Component
const GameLobby = () => {
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Get room code from URL
  const roomCode = window.location.pathname.split('/').pop() || '';
  const currentUserId = UserService.getCurrentUserId() || '';
  
  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        
        // Get room data
        const roomData = await RoomService.getRoom(roomCode);
        
        if (!roomData) {
          setError('Room not found');
          return;
        }
        
        setRoom(roomData);
        
        // Check if current user is host
        setIsHost(roomData.createdBy === currentUserId);
        
        // Convert players object to array
        const playersArray = Object.values(roomData.players || {});
        setPlayers(playersArray);
        
        // Listen for room updates
        const unsubscribe = RoomService.listenToRoom(roomCode, (updatedRoom) => {
          setRoom(updatedRoom);
          setPlayers(Object.values(updatedRoom.players || {}));
        });
        
        return () => {
          // Clean up listener when component unmounts
          if (unsubscribe) unsubscribe();
        };
      } catch (err) {
        console.error('Error loading room:', err);
        setError('Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoom();
  }, [roomCode, currentUserId]);
  
  const handleToggleReady = async (playerId: string) => {
    if (!room) return;
    
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      
      const newStatus = player.status === PlayerStatus.READY 
        ? PlayerStatus.WAITING 
        : PlayerStatus.READY;
      
      await RoomService.updatePlayerStatus(roomCode, newStatus);
    } catch (error) {
      console.error('Error updating player status:', error);
    }
  };
  
  const handleStartGame = async () => {
    if (!room || !isHost) return;
    
    try {
      // Logic to start the game will be implemented later
      console.log('Starting game...');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };
  
  const handleLeaveRoom = async () => {
    try {
      await RoomService.leaveRoom(roomCode);
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };
  
  if (isLoading) {
    return <div className="lobby-loading">Loading lobby...</div>;
  }
  
  if (error) {
    return (
      <div className="lobby-error">
        <p>{error}</p>
        <Link to="/" className="back-to-game-btn">Back to Game</Link>
      </div>
    );
  }
  
  // Check if all players are ready
  const allPlayersReady = players.every(player => player.status === PlayerStatus.READY);
  
  return (
    <div className="lobby-page">
      <div className="game-lobby">
        <RoomCodeDisplay code={roomCode} />
        
        <div className="lobby-header">
          <h2>{room?.name || 'Game Room'}</h2>
          <p className="lobby-subtitle">Waiting for players...</p>
        </div>
        
        <div className="players-list">
          <h3>Players ({players.length})</h3>
          {players.map((player, index) => (
            <PlayerItem 
              key={player.id} 
              player={player} 
              isHost={room?.createdBy === player.id}
              currentUserId={currentUserId}
              onToggleReady={handleToggleReady}
              index={index}
            />
          ))}
        </div>
        
        <div className="lobby-controls">
          {isHost && (
            <button 
              className="start-game-btn"
              disabled={!allPlayersReady || players.length < 1}
              onClick={handleStartGame}
            >
              Start Game
            </button>
          )}
          
          <button className="leave-room-btn" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

// App Layout Component
const AppLayout = () => {
  return (
    <>
      <CreateRoomButton />
      <GameProvider>
        <Game />
      </GameProvider>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route 
          path="/create-room" 
          element={
            <GameProvider>
              <RoomCreationPage />
            </GameProvider>
          } 
        />
        <Route 
          path="/lobby/:roomCode" 
          element={
            <GameProvider>
              <GameLobby />
            </GameProvider>
          } 
        />
        <Route 
          path="/admin/:password" 
          element={<AdminDashboard />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
