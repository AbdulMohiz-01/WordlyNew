import { FirebaseHelper } from '../utils/FirebaseHelper';
import { orderBy, limit, where, QueryConstraint } from 'firebase/firestore';

// Collection name for words
const COLLECTION_NAME = 'words';

// Word difficulty levels as string literals
export type WordDifficulty = 'easy' | 'medium' | 'hard';

// Word difficulty constants
export const WordDifficulty = {
  EASY: 'easy' as WordDifficulty,
  MEDIUM: 'medium' as WordDifficulty,
  HARD: 'hard' as WordDifficulty
};

// Word interface
export interface Word {
  id?: string;
  word: string;
  difficulty: WordDifficulty;
  category?: string;
  enabled?: boolean;
}

/**
 * Service for word-related operations
 */
export class WordService {
  /**
   * Get all words
   * @returns Array of words
   */
  static async getAllWords(): Promise<Word[]> {
    return FirebaseHelper.getAll<Word>(COLLECTION_NAME);
  }

  /**
   * Get a word by ID
   * @param id - Word ID
   * @returns Word or null if not found
   */
  static async getWordById(id: string): Promise<Word | null> {
    return FirebaseHelper.getById<Word>(COLLECTION_NAME, id);
  }

  /**
   * Get words by difficulty
   * @param difficulty - Word difficulty
   * @returns Array of words with the specified difficulty
   */
  static async getWordsByDifficulty(difficulty: WordDifficulty): Promise<Word[]> {
    return FirebaseHelper.queryByField<Word>(
      COLLECTION_NAME, 
      'difficulty', 
      difficulty,
      [where('enabled', '==', true)]
    );
  }

  /**
   * Get a random word
   * @param difficulty - Optional difficulty filter
   * @returns Random word or null if no words are available
   */
  static async getRandomWord(difficulty?: WordDifficulty): Promise<Word | null> {
    if (difficulty) {
      // Get all words of the specified difficulty
      const words = await this.getWordsByDifficulty(difficulty);
      
      if (words.length === 0) {
        console.log(`No words found with difficulty: ${difficulty}`);
        return null;
      }
      
      // Pick a random word
      const randomIndex = Math.floor(Math.random() * words.length);
      return words[randomIndex];
    } else {
      // Get a completely random word
      return FirebaseHelper.getRandom<Word>(COLLECTION_NAME);
    }
  }

  /**
   * Save a new word
   * @param word - Word data
   * @returns Word ID
   */
  static async saveWord(word: Word): Promise<string> {
    // Ensure word is lowercase
    const normalizedWord = {
      ...word,
      word: word.word.toLowerCase(),
      enabled: word.enabled !== undefined ? word.enabled : true
    };
    
    return FirebaseHelper.save<Word>(COLLECTION_NAME, normalizedWord);
  }

  /**
   * Update a word
   * @param id - Word ID
   * @param word - Word data to update
   */
  static async updateWord(id: string, word: Partial<Word>): Promise<void> {
    // If updating the word text, ensure it's lowercase
    if (word.word) {
      word.word = word.word.toLowerCase();
    }
    
    return FirebaseHelper.update<Word>(COLLECTION_NAME, id, word);
  }

  /**
   * Delete a word
   * @param id - Word ID
   */
  static async deleteWord(id: string): Promise<void> {
    return FirebaseHelper.delete(COLLECTION_NAME, id);
  }

  /**
   * Get words by category
   * @param category - Word category
   * @returns Array of words in the specified category
   */
  static async getWordsByCategory(category: string): Promise<Word[]> {
    return FirebaseHelper.queryByField<Word>(
      COLLECTION_NAME, 
      'category', 
      category,
      [where('enabled', '==', true)]
    );
  }

  /**
   * Check if a word exists in the database
   * @param word - Word to check
   * @returns True if the word exists, false otherwise
   */
  static async wordExists(word: string): Promise<boolean> {
    const words = await FirebaseHelper.queryByField<Word>(
      COLLECTION_NAME, 
      'word', 
      word.toLowerCase()
    );
    
    return words.length > 0;
  }
} 