import RoomCodeDisplay from '../RoomCodeDisplay';
import type { Room } from '../../services/RoomService';

// Define a type that can handle both our mock data and the Room type
type RoomData = {
  id: string;
  name: string;
  difficulty: string | 'easy' | 'medium' | 'hard';
  createdAt: string | number;
  players?: Record<string, any> | {
    id: string;
    name: string;
    status: string;
    avatar: {
      emoji: string;
      color: string;
    };
    isCurrentUser?: boolean;
  }[];
};

interface RoomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: RoomData | Room;
}

const RoomInfoModal = ({ isOpen, onClose, roomData }: RoomInfoModalProps) => {
  if (!isOpen) return null;

  // Format createdAt timestamp if it's a number
  const createdAtDisplay = typeof roomData.createdAt === 'number'
    ? new Date(roomData.createdAt).toLocaleString()
    : roomData.createdAt;

  // Get players count - handle both array and object
  const playersCount = Array.isArray(roomData.players)
    ? roomData.players.length
    : roomData.players ? Object.keys(roomData.players).length : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="room-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Room Information</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="room-code-section">
            <RoomCodeDisplay code={roomData.id} />
          </div>
          
          <div className="room-details">
            <div className="room-detail-item">
              <span className="detail-label">Room Name:</span>
              <span className="detail-value">{roomData.name}</span>
            </div>
            
            <div className="room-detail-item">
              <span className="detail-label">Difficulty:</span>
              <span className="detail-value capitalize">{roomData.difficulty}</span>
            </div>
            
            <div className="room-detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{createdAtDisplay}</span>
            </div>
            
            <div className="room-detail-item">
              <span className="detail-label">Players:</span>
              <span className="detail-value">{playersCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoModal; 