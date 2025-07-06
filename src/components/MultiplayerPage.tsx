import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameProvider } from '../context/GameContext';
import Board from './Board';
import Keyboard from './Keyboard';
import Message from './Message';
import Header from './Header';
import RoomInfo from './multiplayer/RoomInfo';
import PlayerScores from './multiplayer/PlayerScores';
import GameCompletionModal from './multiplayer/GameCompletionModal';
import { RoomService, RoomStatus } from '../services/RoomService';
import type { Room } from '../services/RoomService';
import { UserService } from '../services/UserService';
import '../styles/Multiplayer.css';
import '../styles/MultiplayerGame.css';

const MultiplayerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const currentUserId = UserService.getCurrentUserId();

  // Check if all players have completed the game
  const isGameCompleted = (roomData: Room): boolean => {
    const players = Object.values(roomData.players);
    return players.length > 0 && players.every(player => player.status === 'completed');
  };

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setError('Invalid room ID');
        setLoading(false);
        return;
      }

      try {
        // Get room data
        const roomData = await RoomService.getRoom(roomId);
        
        if (!roomData) {
          setError('Room not found');
          return;
        }
        
        // Check if the current user is in the room
        if (!currentUserId || !roomData.players[currentUserId]) {
          setError('You are not a player in this room');
          return;
        }
        
        // Set the room data regardless of status
        setRoom(roomData);
        
        // Check if the game is in PLAYING state
        if (roomData.status !== RoomStatus.PLAYING) {
          // If not playing, redirect to the lobby
          navigate(`/multiplayer/${roomId}`);
          return;
        }
        
        // Check if all players have completed
        if (isGameCompleted(roomData)) {
          setShowCompletionModal(true);
        }
        
        // Listen for room updates
        const unsubscribe = RoomService.listenToRoom(roomId, (updatedRoom) => {
          setRoom(updatedRoom);
          
          // Check if all players have completed
          if (isGameCompleted(updatedRoom)) {
            setShowCompletionModal(true);
          }
          
          // If game status changes from PLAYING to something else, handle accordingly
          if (updatedRoom.status !== RoomStatus.PLAYING) {
            if (updatedRoom.status === RoomStatus.COMPLETED) {
              // Game is completed, stay on this page to show results
              setShowCompletionModal(true);
            } else if (updatedRoom.status === RoomStatus.WAITING) {
              // Game went back to waiting, return to lobby
              navigate(`/multiplayer/${roomId}`);
            }
          }
        });
        
        return () => {
          // Clean up listener when component unmounts
          if (unsubscribe) unsubscribe();
        };
      } catch (err) {
        console.error('Error loading room:', err);
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    };
    
    loadRoom();
  }, [roomId, currentUserId, navigate]);

  const handleBackToLobby = () => {
    if (roomId) {
      navigate(`/multiplayer/${roomId}`);
    } else {
      navigate('/');
    }
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading game...</div>;
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBackToLobby}>
          {roomId ? 'Back to Lobby' : 'Back to Home'}
        </button>
      </div>
    );
  }

  return (
    <GameProvider>
      <Header />
      <div className="multiplayer-container">
        {/* Left side: Room stats */}
        <div className="multiplayer-sidebar room-stats">
          <RoomInfo room={room} />
        </div>
        
        {/* Center: Game board and keyboard */}
        <div className="multiplayer-main">
          <div className="multiplayer-board-container">
            <Board />
          </div>
          <div className="multiplayer-keyboard-container">
            <Keyboard />
          </div>
          <Message />
        </div>
        
        {/* Right side: Player scores */}
        <div className="multiplayer-sidebar player-scores">
          <PlayerScores room={room} />
        </div>
      </div>
      
      {/* Game Completion Modal */}
      <GameCompletionModal 
        show={showCompletionModal} 
        room={room} 
        onClose={handleCloseCompletionModal} 
      />
    </GameProvider>
  );
};

export default MultiplayerPage; 