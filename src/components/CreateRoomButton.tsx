import { useLocation, Link } from 'react-router-dom';
import '../styles/Multiplayer.css';

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

export default CreateRoomButton; 