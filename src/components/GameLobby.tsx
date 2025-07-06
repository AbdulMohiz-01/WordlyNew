import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoomService, PlayerStatus, RoomStatus } from '../services/RoomService';
import { UserService } from '../services/UserService';
import { getWordByDifficulty } from '../utils/wordService';
import RoomCodeDisplay from './RoomCodeDisplay';
import PlayerItem from './PlayerItem';
import '../styles/Multiplayer.css';

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
          
          // If room status changes to PLAYING, navigate to the game
          if (updatedRoom.status === RoomStatus.PLAYING) {
            navigate(`/multiplayer/${roomCode}/play`);
          }
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
  }, [roomCode, currentUserId, navigate]);
  
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
      // Get a random word based on the room's difficulty
      const difficulty = room.difficulty || 'medium';
      console.log(`Getting random word for difficulty: ${difficulty}`);
      const word = await getWordByDifficulty(difficulty);
      console.log(`Starting game with word: ${word}`);
      
      // Start the game in Firebase
      await RoomService.startGame(roomCode, word);
      
      // Navigation will happen automatically through the room listener
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

export default GameLobby; 