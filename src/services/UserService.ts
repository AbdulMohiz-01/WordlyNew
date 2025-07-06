import { FirebaseHelper } from '../utils/FirebaseHelper';
import type { UserData } from '../components/UserRegistrationModal';

// Collection name for user data
const USERS_COLLECTION = 'users';
const USER_SESSIONS_COLLECTION = 'userSessions';

/**
 * Service for handling user registration and tracking
 */
export class UserService {
  /**
   * Register a new user
   * @param userData User data to register
   * @returns User ID
   */
  static async registerUser(userData: UserData): Promise<string> {
    try {
      console.log('Registering user:', userData.name);
      
      // Save user to Firebase - add id property to satisfy FirebaseHelper.save
      const userDataWithId = {
        ...userData,
        id: undefined // Let Firebase generate the ID
      };
      
      // Save user to Firebase
      const userId = await FirebaseHelper.save(USERS_COLLECTION, userDataWithId);
      
      // Save user ID to local storage
      localStorage.setItem('wordlyUserId', userId);
      localStorage.setItem('wordlyUserName', userData.name);
      
      console.log('User registered successfully with ID:', userId);
      return userId;
    } catch (error) {
      console.error('Error registering user:', error);
      
      // Save user data to local storage as fallback
      const localUserId = `local_${Date.now()}`;
      localStorage.setItem('wordlyUserId', localUserId);
      localStorage.setItem('wordlyUserName', userData.name);
      localStorage.setItem('wordlyUserData', JSON.stringify(userData));
      
      return localUserId;
    }
  }
  
  /**
   * Check if user is registered
   * @returns Boolean indicating if user is registered
   */
  static isUserRegistered(): boolean {
    return !!localStorage.getItem('wordlyUserId');
  }
  
  /**
   * Get current user ID
   * @returns User ID or null if not registered
   */
  static getCurrentUserId(): string | null {
    return localStorage.getItem('wordlyUserId');
  }
  
  /**
   * Get current user name
   * @returns User name or null if not registered
   */
  static getCurrentUserName(): string | null {
    return localStorage.getItem('wordlyUserName');
  }
  
  /**
   * Track game session
   * @param userId User ID
   * @param sessionData Session data
   */
  static async trackSession(userId: string, sessionData: any): Promise<void> {
    try {
      // Add user ID to session data
      const data = {
        userId,
        ...sessionData,
        timestamp: Date.now()
      };
      
      // Save session to Firebase
      await FirebaseHelper.save(USER_SESSIONS_COLLECTION, data);
      console.log('Session tracked successfully');
    } catch (error) {
      console.error('Error tracking session:', error);
      
      // Save session data to local storage as fallback
      const localSessions = JSON.parse(localStorage.getItem('wordlySessions') || '[]');
      localSessions.push({
        userId,
        ...sessionData,
        timestamp: Date.now()
      });
      localStorage.setItem('wordlySessions', JSON.stringify(localSessions));
    }
  }
  
  /**
   * Get user statistics
   * @returns User statistics
   */
  static async getUserStatistics(): Promise<any> {
    try {
      // Get total number of users
      const users = await FirebaseHelper.getAll(USERS_COLLECTION);
      
      return {
        totalUsers: users.length,
        // Add more statistics as needed
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        totalUsers: 0,
        error: 'Failed to load statistics'
      };
    }
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  static async getAllUsers(): Promise<UserData[]> {
    try {
      // Get all users from Firebase
      const users = await FirebaseHelper.getAll<UserData>(USERS_COLLECTION);
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      
      // Try to get users from local storage as fallback
      try {
        const localUserData = localStorage.getItem('wordlyUserData');
        if (localUserData) {
          const userData = JSON.parse(localUserData);
          const userId = localStorage.getItem('wordlyUserId');
          if (userId) {
            return [{ ...userData, id: userId }];
          }
        }
      } catch (e) {
        console.error('Error parsing local user data:', e);
      }
      
      return [];
    }
  }

  /**
   * Get all sessions
   * @returns Array of all sessions
   */
  static async getAllSessions(): Promise<any[]> {
    try {
      // Get all sessions from Firebase
      const sessions = await FirebaseHelper.getAll(USER_SESSIONS_COLLECTION);
      return sessions;
    } catch (error) {
      console.error('Error getting all sessions:', error);
      
      // Try to get sessions from local storage as fallback
      try {
        const localSessions = localStorage.getItem('wordlySessions');
        if (localSessions) {
          return JSON.parse(localSessions);
        }
      } catch (e) {
        console.error('Error parsing local sessions:', e);
      }
      
      return [];
    }
  }
} 