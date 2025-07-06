import { useState } from 'react';
import { RoomService } from '../services/RoomService';
import '../styles/Modal.css';

interface CreateRoomModalProps {
  show: boolean;
  onClose: () => void;
  onRoomCreated?: (roomId: string) => void;
}

const CreateRoomModal = ({ show, onClose, onRoomCreated }: CreateRoomModalProps) => {
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      // Create room using the RoomService
      const roomId = await RoomService.createRoom(roomName.trim());
      
      // Call the callback with the new room ID
      if (onRoomCreated) {
        onRoomCreated(roomId);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
      setIsCreating(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Room</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="roomName">Room Name</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Enter a room name"
                autoFocus
                maxLength={20}
              />
            </div>
            
            <div className="modal-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal; 