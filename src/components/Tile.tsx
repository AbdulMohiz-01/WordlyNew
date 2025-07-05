import { memo, useContext, useMemo } from 'react';
import type { TileState } from '../context/GameContext';
import { GameContext } from '../context/GameContext';
import '../styles/Tile.css';
import '../styles/BorderPulse.css';

interface TileProps {
  letter: string;
  state: TileState;
  rowIndex: number;
  colIndex: number;
}

const Tile = ({ letter, state, rowIndex, colIndex }: TileProps) => {
  const { gameOver, currentRow, currentWord, guesses } = useContext(GameContext);
  
  // Add win class only if game is won and this is the winning row
  const isWinningRow = gameOver && currentRow <= 6 && rowIndex === currentRow - 1;
  const isWinningGuess = rowIndex < guesses.length && guesses[rowIndex] === currentWord;
  const isWinningTile = isWinningRow && isWinningGuess;
  
  // Calculate animation delay based on column index
  const animationStyle = useMemo(() => {
    if (isWinningTile) {
      return {
        animationDelay: `${colIndex * 0.1}s`
      };
    }
    return {};
  }, [isWinningTile, colIndex]);
  
  return (
    <div 
      className={`tile ${state} ${isWinningTile ? 'win' : ''}`}
      data-col={colIndex}
      data-row-index={rowIndex}
      data-letter={letter || ''}
      style={animationStyle}
    >
      {letter}
    </div>
  );
};

export default memo(Tile); 