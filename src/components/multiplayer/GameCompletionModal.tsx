import { useNavigate } from 'react-router-dom';
import type { Room } from '../../services/RoomService';
import { UserService } from '../../services/UserService';
import '../../styles/Modal.css';
import '../../styles/MultiplayerGame.css';

interface GameCompletionModalProps {
  show: boolean;
  room: Room | null;
  onClose: () => void;
}

const GameCompletionModal = ({ show, room, onClose }: GameCompletionModalProps) => {
  const navigate = useNavigate();
  const currentUserId = UserService.getCurrentUserId();

  if (!show || !room) {
    return null;
  }

  // Sort players by score in descending order
  const sortedPlayers = Object.values(room.players)
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      position: index + 1,
      isCurrentUser: player.id === currentUserId
    }));

  // Get the winner (highest score)
  const winner = sortedPlayers[0];
  
  // Get top 3 players for the podium
  const podiumPlayers = sortedPlayers.slice(0, 3);
  
  // Check if current user is in top 3
  const currentUserInTop3 = podiumPlayers.some(player => player.id === currentUserId);
  
  // Get the current user's position
  const currentUserPosition = sortedPlayers.find(player => player.id === currentUserId)?.position || 0;

  // Function to get position suffix (1st, 2nd, 3rd, etc.)
  const getPositionSuffix = (position: number) => {
    if (position === 1) return 'st';
    if (position === 2) return 'nd';
    if (position === 3) return 'rd';
    return 'th';
  };

  const handlePlayAgain = () => {
    // Navigate back to the lobby
    if (room) {
      navigate(`/multiplayer/${room.id}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
    </>
  );
};

export default GameCompletionModal; 