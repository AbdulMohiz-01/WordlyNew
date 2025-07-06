import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoomService } from '../services/RoomService';
import '../styles/Multiplayer.css';

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
      const { getWordByDifficulty } = await import('../utils/wordService');
      
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

export default RoomCreationPage; 