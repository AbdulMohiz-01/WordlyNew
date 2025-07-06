import { useLocation, Link } from 'react-router-dom';
import '../styles/Multiplayer.css';

const CreateRoomButton = () => {
  const location = useLocation();
  
  // Hide buttons on lobby, room creation, and multiplayer pages
  if (location.pathname.includes('/lobby') || 
      location.pathname === '/create-room' ||
      location.pathname === '/multiplayer') {
    return null;
  }
  
  return (
    <div className="floating-buttons-container">
      <Link to="/create-room" className="create-room-floating-btn">
        Create Room
      </Link>
      {/* <Link to="/multiplayer" className="multiplayer-floating-btn">
        Multiplayer Demo
      </Link> */}
    </div>
  );
};

export default CreateRoomButton; 