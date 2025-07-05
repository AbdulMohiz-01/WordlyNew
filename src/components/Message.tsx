import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Message.css';

const Message = () => {
  const { message } = useContext(GameContext);
  
  return (
    <div className={`message ${message.text ? 'show' : ''} ${message.type}`}>
      {message.text}
    </div>
  );
};

export default Message; 