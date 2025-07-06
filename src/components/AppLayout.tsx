import { GameProvider } from '../context/GameContext';
import Game from './Game';
import CreateRoomButton from './CreateRoomButton';

const AppLayout = () => {
  return (
    <>
      <CreateRoomButton />
      <GameProvider>
        <Game />
      </GameProvider>
    </>
  );
};

export default AppLayout; 