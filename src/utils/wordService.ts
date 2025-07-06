import { FirebaseHelper } from './FirebaseHelper';
import { GAME_WORDS } from './words';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface WordDocument {
  id?: string;
  word: string;
}

// Collection names for each difficulty level
const COLLECTIONS = {
  easy: 'easyWords',
  medium: 'mediumWords',
  hard: 'hardWords' // As specified in the requirements
};

/**
 * Fetches a random word from Firebase based on difficulty level
 * Falls back to local word list if Firebase fetch fails
 */
export const getWordByDifficulty = async (difficulty: DifficultyLevel): Promise<string> => {
  try {
    // Log the incoming difficulty parameter
    console.log(`getWordByDifficulty called with difficulty: ${difficulty}`);
    
    // Validate the difficulty parameter
    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      console.error(`Invalid difficulty provided: ${difficulty}, defaulting to medium`);
      difficulty = 'medium';
    }
    
    // Make sure we're using the correct collection for the specified difficulty
    const collection = COLLECTIONS[difficulty];
    console.log(`Using Firebase collection: ${collection}`);
    
    // Try to get a random word from the appropriate Firebase collection
    const wordDoc = await FirebaseHelper.getRandom<WordDocument>(collection);
    
    if (wordDoc && wordDoc.word) {
      console.log(`%c Word fetched from Firebase (${difficulty}): %c ${wordDoc.word} `, 
        'background: #222; color: #bada55; font-size: 12px;', 
        'background: #bada55; color: #222; font-size: 12px;');
      return wordDoc.word.toUpperCase();
    } else {
      // If no word found in Firebase, fall back to local word list
      console.log(`%c No words found in Firebase for ${difficulty}, using local fallback `, 
        'background: #f44336; color: white; font-size: 12px;');
      return getRandomLocalWord();
    }
  } catch (error) {
    console.error('Error fetching word from Firebase:', error);
    // Fall back to local word list
    return getRandomLocalWord();
  }
};

/**
 * Gets all words from a specific difficulty collection
 */
export const getAllWordsByDifficulty = async (difficulty: DifficultyLevel): Promise<string[]> => {
  try {
    const wordDocs = await FirebaseHelper.getAll<WordDocument>(COLLECTIONS[difficulty]);
    return wordDocs.map(doc => doc.word.toUpperCase());
  } catch (error) {
    console.error(`Error fetching ${difficulty} words:`, error);
    return [];
  }
};

/**
 * Gets a random word from the local word list
 */
export const getRandomLocalWord = (): string => {
  return GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)].toUpperCase();
}; 