import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomInfoModal from './RoomInfoModal';
import type { Room } from '../../services/RoomService';
import { RoomService } from '../../services/RoomService';
import { UserService } from '../../services/UserService';

interface RoomInfoProps {
  room?: Room | null;
}

const RoomInfo = ({ room }: RoomInfoProps) => {
  const [showRoomInfoModal, setShowRoomInfoModal] = useState(false);
  const navigate = useNavigate();
  const currentUserId = UserService.getCurrentUserId();
  
  // Use mock data if room is not provided (for standalone page)
  const mockRoomData = {
    id: '123456',
    name: 'Game Room',
    difficulty: 'medium',
    createdAt: '7/6/2025, 6:40:00 PM',
    players: [
      { id: '1', name: 'Player 1', status: 'playing', avatar: { emoji: '😎', color: '#3498db' }, isCurrentUser: true },
      { id: '2', name: 'Player 2', status: 'waiting', avatar: { emoji: '🚀', color: '#e74c3c' }, isCurrentUser: false },
      { id: '3', name: 'Player 3', status: 'ready', avatar: { emoji: '🎮', color: '#2ecc71' }, isCurrentUser: false },
      { id: '4', name: 'Player 4', status: 'completed', avatar: { emoji: '🏆', color: '#f39c12' }, isCurrentUser: false },
      { id: '5', name: 'Player 5', status: 'playing', avatar: { emoji: '🦊', color: '#9b59b6' }, isCurrentUser: false },
      { id: '6', name: 'Player 6', status: 'waiting', avatar: { emoji: '🐼', color: '#1abc9c' }, isCurrentUser: false },
      { id: '7', name: 'Player 7', status: 'playing', avatar: { emoji: '🦁', color: '#d35400' }, isCurrentUser: false },
      { id: '8', name: 'Player 8', status: 'completed', avatar: { emoji: '🐯', color: '#27ae60' }, isCurrentUser: false }
    ]
  };

  const roomData = room || mockRoomData;

  const openRoomInfoModal = () => {
    setShowRoomInfoModal(true);
  };

  const closeRoomInfoModal = () => {
    setShowRoomInfoModal(false);
  };
  
  const handleLeaveRoom = async () => {
    if (room) {
      try {
        await RoomService.leaveRoom(room.id);
        navigate('/');
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    } else {
      navigate('/');
    }
  };

  // Transform players object to array with isCurrentUser flag
  const playersArray = room 
    ? Object.values(room.players).map(player => ({
        ...player,
        isCurrentUser: player.id === currentUserId
      }))
    : mockRoomData.players;

  return (
    <div className="room-info-container">
      <div className="room-header">
        <h2 className="room-info-title">Room Information</h2>
        <button className="info-button" onClick={openRoomInfoModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
      </div>
      
      <div className="room-players-section">
        <h3 className="section-title">Players</h3>
        <div className="room-players-list">
          {playersArray.map((player) => (
            <div 
              key={player.id} 
              className={`player-item status-${player.status} ${player.isCurrentUser ? 'current-user' : ''}`}
            >
              <div 
                className="player-avatar" 
                style={{ backgroundColor: player.avatar.color }}
              >
                <span>{player.avatar.emoji}</span>
              </div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-status">{player.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="room-actions">
        <button className="room-action-button leave-button" onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </div>
      
      <RoomInfoModal 
        isOpen={showRoomInfoModal}
        onClose={closeRoomInfoModal}
        roomData={roomData}
      />
    </div>
  );
};

export default RoomInfo; 