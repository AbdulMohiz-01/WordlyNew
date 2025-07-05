import { FirebaseHelper } from '../utils/FirebaseHelper';
import { orderBy, limit, where } from 'firebase/firestore';
import { WordDifficulty } from './WordService';

// Collection name for levels
const COLLECTION_NAME = 'levels';

// Level interface
export interface Level {
  id?: string;
  name: string;
  number: number;
  difficulty: WordDifficulty;
  description?: string;
  enabled?: boolean;
  requiredScore?: number;
  maxAttempts?: number;
  timeLimit?: number; // in seconds, optional
  wordCategories?: string[]; // categories of words to use for this level
}

/**
 * Service for level-related operations
 */
export class LevelService {
  /**
   * Get all levels
   * @returns Array of levels
   */
  static async getAllLevels(): Promise<Level[]> {
    return FirebaseHelper.getAll<Level>(
      COLLECTION_NAME,
      [orderBy('number', 'asc')]
    );
  }

  /**
   * Get a level by ID
   * @param id - Level ID
   * @returns Level or null if not found
   */
  static async getLevelById(id: string): Promise<Level | null> {
    return FirebaseHelper.getById<Level>(COLLECTION_NAME, id);
  }

  /**
   * Get a level by number
   * @param number - Level number
   * @returns Level or null if not found
   */
  static async getLevelByNumber(number: number): Promise<Level | null> {
    const levels = await FirebaseHelper.queryByField<Level>(
      COLLECTION_NAME,
      'number',
      number
    );
    
    return levels.length > 0 ? levels[0] : null;
  }

  /**
   * Get levels by difficulty
   * @param difficulty - Level difficulty
   * @returns Array of levels with the specified difficulty
   */
  static async getLevelsByDifficulty(difficulty: WordDifficulty): Promise<Level[]> {
    return FirebaseHelper.queryByField<Level>(
      COLLECTION_NAME,
      'difficulty',
      difficulty,
      [orderBy('number', 'asc')]
    );
  }

  /**
   * Get enabled levels
   * @returns Array of enabled levels
   */
  static async getEnabledLevels(): Promise<Level[]> {
    return FirebaseHelper.queryByField<Level>(
      COLLECTION_NAME,
      'enabled',
      true,
      [orderBy('number', 'asc')]
    );
  }

  /**
   * Save a new level
   * @param level - Level data
   * @returns Level ID
   */
  static async saveLevel(level: Level): Promise<string> {
    const normalizedLevel = {
      ...level,
      enabled: level.enabled !== undefined ? level.enabled : true
    };
    
    return FirebaseHelper.save<Level>(COLLECTION_NAME, normalizedLevel);
  }

  /**
   * Update a level
   * @param id - Level ID
   * @param level - Level data to update
   */
  static async updateLevel(id: string, level: Partial<Level>): Promise<void> {
    return FirebaseHelper.update<Level>(COLLECTION_NAME, id, level);
  }

  /**
   * Delete a level
   * @param id - Level ID
   */
  static async deleteLevel(id: string): Promise<void> {
    return FirebaseHelper.delete(COLLECTION_NAME, id);
  }

  /**
   * Get the next level after the specified level number
   * @param currentLevelNumber - Current level number
   * @returns Next level or null if there is no next level
   */
  static async getNextLevel(currentLevelNumber: number): Promise<Level | null> {
    const levels = await FirebaseHelper.getAll<Level>(
      COLLECTION_NAME,
      [
        where('number', '>', currentLevelNumber),
        where('enabled', '==', true),
        orderBy('number', 'asc'),
        limit(1)
      ]
    );
    
    return levels.length > 0 ? levels[0] : null;
  }

  /**
   * Get the highest level number
   * @returns Highest level number or 0 if no levels exist
   */
  static async getHighestLevelNumber(): Promise<number> {
    const levels = await FirebaseHelper.getAll<Level>(
      COLLECTION_NAME,
      [orderBy('number', 'desc'), limit(1)]
    );
    
    return levels.length > 0 ? levels[0].number : 0;
  }
} 