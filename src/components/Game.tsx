import Header from './Header';
import Board from './Board';
import Keyboard from './Keyboard';
import Message from './Message';
import HelpModal from './HelpModal';
import StatsModal from './StatsModal';
import GameOverModal from './GameOverModal';
import '../styles/Game.css';
import '../styles/WinAnimations.css';
import '../styles/BorderPulse.css';

const Game = () => {
  return (
    <div className="container">
      <Header />
      
      <main className="game-container">
        <Board />
        <div className="keyboard-container">
          <Keyboard />
        </div>
        <Message />
      </main>
      
      <HelpModal />
      <StatsModal />
      <GameOverModal />
    </div>
  );
};

export default Game; 