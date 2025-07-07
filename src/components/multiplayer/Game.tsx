import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Board from '../Board';
import Keyboard from '../Keyboard';
import { GameContext } from '../../context/GameContext';
import { RoomService } from '../../services/RoomService';
import type { Room } from '../../services/RoomService';
import { UserService } from '../../services/UserService';
import PlayerScores from './PlayerScores';
import '../../styles/PlayerScores.css';
import '../../styles/MultiplayerGame.css';
import GameCompletionModal from './GameCompletionModal';

interface GameProps {
  // Add any props if needed
}

const Game: React.FC<GameProps> = () => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const { 
    guesses, 
    currentRow, 
    gameOver,
    addLetter,
    deleteLetter,
    submitGuess
  } = useContext(GameContext);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [currentUserId] = useState<string>(UserService.getCurrentUserId() || '');

  // Effect to load room data and set up real-time listeners
  useEffect(() => {
    if (!roomId) {
      setError('Room ID is missing');
      return;
    }

    const loadRoom = async () => {
      try {
        setLoading(true);
        
        // Get initial room data
        const roomData = await RoomService.getRoom(roomId);
        if (!roomData) {
          setError('Room not found');
          return;
        }
        
        setRoom(roomData);
        
        // Subscribe to real-time updates
        const unsubscribe = RoomService.listenToRoom(roomId, (updatedRoom) => {
          setRoom(updatedRoom);
          
          // Check if all players have completed the game
          const allCompleted = Object.values(updatedRoom.players).every(
            (player) => player.status === 'completed'
          );
          
          if (allCompleted && Object.keys(updatedRoom.players).length > 1) {
            setShowCompletionModal(true);
          }
        });
        
        setLoading(false);
        
        // Clean up subscription on unmount
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error('Error loading room:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };
    
    loadRoom();
  }, [roomId]);

  // Effect to update player's guesses in the database
  useEffect(() => {
    if (!roomId || !currentUserId || !room) return;
    
    const updatePlayerGuesses = async () => {
      try {
        // Use updatePlayerProgress to update guesses
        if (guesses.length > 0) {
          await RoomService.updatePlayerProgress(
            roomId, 
            currentRow + 1, 
            0, // No score change for just updating guesses
            guesses[guesses.length - 1] // Latest guess
          );
        }
      } catch (err) {
        console.error('Error updating player guesses:', err);
      }
    };
    
    // Only update when guesses array changes length (new guess added)
    if (guesses.length > 0) {
      updatePlayerGuesses();
    }
  }, [guesses.length, roomId, currentUserId, room, currentRow, guesses]);

  // Effect to update player status when game is won or lost
  useEffect(() => {
    if (!roomId || !currentUserId || !room || !gameOver) return;
    
    const updatePlayerStatus = async () => {
      try {
        // Calculate score based on remaining attempts
        const score = 100 + ((6 - currentRow) * 20);
        
        // Use completeGame to update player status
        await RoomService.completeGame(
          roomId,
          score,
          true // isWinner
        );
      } catch (err) {
        console.error('Error updating player status:', err);
      }
    };
    
    updatePlayerStatus();
  }, [gameOver, roomId, currentUserId, currentRow, room]);

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="multiplayer-game-container">
      <div className="game-area">
        <Board />
        <Keyboard onKeyPress={(key: string) => {
          if (key === 'ENTER') {
            submitGuess();
          } else if (key === 'BACKSPACE') {
            deleteLetter();
          } else {
            addLetter(key);
          }
        }} />
      </div>
      
      <div className="sidebar">
        <PlayerScores room={room} />
      </div>
      
      {showCompletionModal && (
        <GameCompletionModal 
          show={showCompletionModal}
          room={room}
          onClose={() => setShowCompletionModal(false)}
        />
      )}
    </div>
  );
};

export default Game; 