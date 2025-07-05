import { GameProvider } from './context/GameContext';
import Game from './components/Game';
import './styles/BorderPulse.css';

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
