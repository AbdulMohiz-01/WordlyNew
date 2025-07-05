import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/Modal.css';

const HelpModal = () => {
  const { showHelpModal, toggleHelpModal } = useContext(GameContext);
  
  return (
    <div className={`modal ${showHelpModal ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>How to Play</h2>
          <button className="close-btn" onClick={toggleHelpModal}>&times;</button>
        </div>
        <div className="modal-body">
          <p>Guess the WORDLY in 6 tries.</p>
          <ul className="rules-list">
            <li>Each guess must be a valid 5-letter word.</li>
            <li>Hit the enter button to submit.</li>
            <li>After each guess, the color of the tiles will change to show how close your guess was to the word.</li>
          </ul>
          
          <div className="examples">
            <p><strong>Examples</strong></p>
            
            <div className="example-row">
              <div className="example-tile correct">W</div>
              <div className="example-tile">E</div>
              <div className="example-tile">A</div>
              <div className="example-tile">R</div>
              <div className="example-tile">Y</div>
            </div>
            <p>The letter <strong>W</strong> is in the word and in the correct spot.</p>
            
            <div className="example-row">
              <div className="example-tile">P</div>
              <div className="example-tile present">I</div>
              <div className="example-tile">L</div>
              <div className="example-tile">L</div>
              <div className="example-tile">S</div>
            </div>
            <p>The letter <strong>I</strong> is in the word but in the wrong spot.</p>
            
            <div className="example-row">
              <div className="example-tile">V</div>
              <div className="example-tile">A</div>
              <div className="example-tile">G</div>
              <div className="example-tile absent">U</div>
              <div className="example-tile">E</div>
            </div>
            <p>The letter <strong>U</strong> is not in the word in any spot.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 