import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import Tile from './Tile';
import '../styles/Board.css';
import '../styles/WinAnimations.css';
import '../styles/BorderPulse.css';

const Board = () => {
  const { board, gameOver, currentRow, isValidating } = useContext(GameContext);

  return (
    <div 
      className={`game-board ${gameOver && currentRow === 6 ? 'lose' : ''}`}
    >
      {board.map((row, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className={`tile-row ${rowIndex === currentRow - 1 && gameOver && currentRow === 6 ? 'lose' : ''} ${rowIndex === currentRow && isValidating ? 'validating' : ''}`}
          data-row={rowIndex}
        >
          {row.map((tile, colIndex) => (
            <Tile
              key={`tile-${rowIndex}-${colIndex}`}
              letter={tile.letter}
              state={tile.state}
              rowIndex={rowIndex}
              colIndex={colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board; 