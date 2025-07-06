import { useState, useEffect, useRef } from 'react';
import '../styles/Modal.css';
import '../styles/UserRegistrationModal.css';

interface UserRegistrationModalProps {
  show: boolean;
  onClose: () => void;
  onRegister: (userData: UserData) => Promise<void>;
}

export interface UserData {
  id?: string;
  name: string;
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
  };
  timestamp: number;
}

const UserRegistrationModal = ({ show, onClose, onRegister }: UserRegistrationModalProps) => {
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus on the input field when the modal is shown
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [show]);
  
  // Log when component mounts
  useEffect(() => {
    console.log('UserRegistrationModal mounted');
    return () => {
      console.log('UserRegistrationModal unmounted');
    };
  }, []);
  
  // Create an isolated input field
  const createIsolatedInput = () => {
    // Handle key press in the input field
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // If Enter key is pressed, submit the form
      if (e.key === 'Enter') {
        console.log('Enter key pressed, submitting form');
        e.preventDefault(); // Prevent form submission to handle it manually
        
        const inputValue = e.currentTarget.value.trim();
        console.log('Enter pressed with value:', inputValue);
        
        if (!inputValue) {
          setError('Please enter your name to continue');
          return;
        }
        
        handleFormSubmit(inputValue);
      }
    };

    return (
      <div className="isolated-input-container">
        <label htmlFor="registration-name">
          Your Name
        </label>
        <input
          ref={inputRef}
          type="text"
          id="registration-name"
          defaultValue=""
          onKeyDown={handleKeyDown}
          placeholder="Enter your name"
          autoComplete="name"
          autoFocus
          aria-label="Your name"
          className="registration-input"
        />
      </div>
    );
  };
  
  // Handle form submission
  const handleFormSubmit = async (inputValue: string) => {
    if (!inputValue) {
      console.log("Name is empty, showing error");
      setError('Please enter your name to continue');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    // Show loading state
    setIsSubmitting(true);
    
    try {
      // Gather browser and system information
      const userData: UserData = {
        name: inputValue,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        timestamp: Date.now()
      };
      
      console.log('Calling onRegister with userData:', userData);
      
      // Register the user and await the promise
      await onRegister(userData);
      
      console.log('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="registration-container" ref={modalRef}>
      <div className="registration-overlay">
        <div className="registration-modal">
          <div className="registration-header">
            <h2>Welcome to Wordly!</h2>
          </div>
          <div className="registration-body">
            <p className="welcome-text">
              Please enter your name to start playing.
            </p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submitted!");
                
                // Get the input value directly
                const inputElement = document.getElementById('registration-name') as HTMLInputElement;
                const inputValue = inputElement ? inputElement.value.trim() : '';
                
                handleFormSubmit(inputValue);
              }}
              className="registration-form"
            >
              {createIsolatedInput()}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="registration-button" 
                  disabled={isSubmitting}
                  onClick={async () => {
                    console.log("Button clicked!");
                    
                    // Get the input value directly
                    const inputElement = document.getElementById('registration-name') as HTMLInputElement;
                    const inputValue = inputElement ? inputElement.value.trim() : '';
                    
                    handleFormSubmit(inputValue);
                  }}
                >
                  <svg
                    className="icon"
                    id="Play"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#ffffff"
                      d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z"
                    ></path>
                  </svg>
                  <span className="text">
                    {isSubmitting ? 'LOADING...' : 'START PLAYING'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationModal; 