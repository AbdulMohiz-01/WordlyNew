import { useState, useEffect } from 'react';
import '../styles/DifficultyModal.css';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultyModalProps {
  show: boolean;
  onClose: () => void;
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
}

const DifficultyModal = ({ 
  show, 
  onClose, 
  currentDifficulty, 
  onSelectDifficulty 
}: DifficultyModalProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(currentDifficulty);
  const [sliderValue, setSliderValue] = useState(getDifficultyValue(currentDifficulty));
  
  useEffect(() => {
    if (show) {
      setSelectedDifficulty(currentDifficulty);
      setSliderValue(getDifficultyValue(currentDifficulty));
    }
  }, [show, currentDifficulty]);
  
  function getDifficultyValue(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'easy': return 0;
      case 'medium': return 1;
      case 'hard': return 2;
    }
  }
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    if (value === 0) setSelectedDifficulty('easy');
    else if (value === 1) setSelectedDifficulty('medium');
    else setSelectedDifficulty('hard');
  };
  
  const handleApply = () => {
    console.log(`DifficultyModal: Applying difficulty change to: ${selectedDifficulty}`);
    
    // Validate the difficulty value
    if (!selectedDifficulty || !['easy', 'medium', 'hard'].includes(selectedDifficulty)) {
      console.error(`Invalid difficulty selected: ${selectedDifficulty}`);
      return;
    }
    
    // Make sure we pass the selected difficulty to the parent component
    onSelectDifficulty(selectedDifficulty);
    onClose();
  };
  
  const getDifficultyDescription = () => {
    switch (selectedDifficulty) {
      case 'easy':
        return 'Common 5-letter words that most people know. Perfect for casual play and beginners.';
      case 'medium':
        return 'A mix of common and less common words. The standard Wordly experience.';
      case 'hard':
        return 'Less common and more challenging words. For word enthusiasts and puzzle experts.';
    }
  };
  
  const getDifficultyEmoji = () => {
    switch (selectedDifficulty) {
      case 'easy': return '😊';
      case 'medium': return '🤔';
      case 'hard': return '😰';
    }
  };
  
  return (
    <div className={`difficulty-modal ${show ? 'show' : ''}`}>
      <div className={`difficulty-modal-content ${selectedDifficulty}`}>
        <div className="difficulty-modal-header">
          <h2>Game Difficulty</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="difficulty-modal-body">
          <div className="difficulty-emoji">{getDifficultyEmoji()}</div>
          
          <div className="difficulty-slider-container">
            <div className="difficulty-preview">
              <div className="difficulty-preview-letter">
                <span className="letter">W</span>
                <span className={`letter-state ${selectedDifficulty === 'easy' ? 'visible' : ''}`}>Correct!</span>
              </div>
              <div className="difficulty-preview-letter">
                <span className="letter">O</span>
                <span className={`letter-state ${selectedDifficulty === 'medium' ? 'visible' : ''}`}>Present!</span>
              </div>
              <div className="difficulty-preview-letter">
                <span className="letter">R</span>
                <span className={`letter-state ${selectedDifficulty === 'hard' ? 'visible' : ''}`}>Absent!</span>
              </div>
              <div className="difficulty-preview-letter">
                <span className="letter">D</span>
              </div>
              <div className="difficulty-preview-letter">
                <span className="letter">S</span>
              </div>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="2" 
              value={sliderValue} 
              onChange={handleSliderChange}
              className={`difficulty-slider ${selectedDifficulty}`}
            />
            <div className="difficulty-labels">
              <div className={`difficulty-label easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}>Easy</div>
              <div className={`difficulty-label medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}>Medium</div>
              <div className={`difficulty-label hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}>Hard</div>
            </div>
          </div>
          
          <div className={`difficulty-description ${selectedDifficulty}`}>
            {getDifficultyDescription()}
          </div>
          
          <div className="difficulty-warning">
            Note: Changing the difficulty level will reset your current game.
          </div>
          
          <div className="difficulty-actions">
            <button className={`button-with-icon ${selectedDifficulty}`} onClick={handleApply}>
              <svg
                className="icon"
                id="Play"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="color000000 svgShape"
                  fill="#ffffff"
                  d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z"
                ></path>
              </svg>
              <span className="text">Play</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyModal; 