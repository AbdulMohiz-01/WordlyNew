import { database } from '../firebase';
import { ref, set, get, update, onValue, off, push } from 'firebase/database';
import { UserService } from './UserService';

// Room status enum
export const RoomStatus = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  COMPLETED: 'completed'
} as const;

export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus];

// Player status enum
export const PlayerStatus = {
  WAITING: 'waiting',
  READY: 'ready',
  PLAYING: 'playing',
  COMPLETED: 'completed'
} as const;

export type PlayerStatus = typeof PlayerStatus[keyof typeof PlayerStatus];

// Avatar interface
export interface Avatar {
  emoji: string;
  color: string;
}

// Room interface
export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  status: RoomStatus;
  difficulty: 'easy' | 'medium' | 'hard';
  currentWord?: string;
  players: Record<string, Player>;
}

// Player interface
export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  currentRow: number;
  score: number;
  avatar: Avatar;
  completedAt?: number;
  isWinner?: boolean;
  guesses?: string[]; // Array to store player's guesses
  position?: number; // Player's position in the final ranking
}

// Animal emojis for avatars
const animalEmojis = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', 
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', 
  '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', 
  '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🦕', '🦖', '🦎', '🐍', 
  '🐢', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', 
  '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', 
  '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎'
];

// Colors for avatars
const avatarColors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#33FFF5',
  '#FFD133', '#8C33FF', '#FF8C33', '#33FFBD', '#FF3333',
  '#7FFF33', '#337FFF', '#FF33D4', '#33FFE0', '#FFBD33',
  '#D433FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A8'
];

/**
 * Generate a random avatar
 * @returns Random avatar with emoji and color
 */
const generateRandomAvatar = (): Avatar => {
  const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  
  return {
    emoji: randomEmoji,
    color: randomColor
  };
};

/**
 * Service for handling room operations
 */
export class RoomService {
  /**
   * Create a new room
   * @param roomName Name of the room
   * @param customRoomCode Optional custom room code (6 digits)
   * @param difficulty Difficulty level of the game
   * @param word Word to guess in the game
   * @returns Room ID
   */
  static async createRoom(
    roomName: string, 
    customRoomCode?: string,
    difficulty?: 'easy' | 'medium' | 'hard',
    word?: string
  ): Promise<string> {
    try {
      // Get current user
      const userId = UserService.getCurrentUserId();
      const userName = UserService.getCurrentUserName();
      
      if (!userId || !userName) {
        throw new Error('User not logged in');
      }
      
      let roomId: string;
      
      if (customRoomCode) {
        // Use the provided custom room code
        roomId = customRoomCode;
        
        // Check if room with this code already exists
        const existingRoom = await this.getRoom(roomId);
        if (existingRoom) {
          throw new Error('Room with this code already exists');
        }
      } else {
        // Generate a new room reference
        const roomsRef = ref(database, 'rooms');
        const newRoomRef = push(roomsRef);
        roomId = newRoomRef.key || '';
        
        if (!roomId) {
          throw new Error('Failed to generate room ID');
        }
      }
      
      // Generate random avatar
      const avatar = generateRandomAvatar();
      
      // Create player object - host is READY by default
      const player: Player = {
        id: userId,
        name: userName,
        status: PlayerStatus.READY, // Host is READY by default
        currentRow: 0,
        score: 0,
        avatar
      };
      
      // Create room object
      const room: Room = {
        id: roomId,
        name: roomName,
        createdBy: userId,
        createdAt: Date.now(),
        status: RoomStatus.WAITING,
        difficulty: difficulty || 'medium',
        currentWord: word || '',
        players: {
          [userId]: player
        }
      };
      
      // Save room to database
      const roomRef = ref(database, `rooms/${roomId}`);
      await set(roomRef, room);
      
      console.log('Room created:', roomId);
      return roomId;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }
  
  /**
   * Join an existing room
   * @param roomId Room ID to join
   * @returns Success status
   */
  static async joinRoom(roomId: string): Promise<boolean> {
    try {
      // Get current user
      const userId = UserService.getCurrentUserId();
      const userName = UserService.getCurrentUserName();
      
      if (!userId || !userName) {
        throw new Error('User not logged in');
      }
      
      // Get room reference
      const roomRef = ref(database, `rooms/${roomId}`);
      
      // Check if room exists
      const roomSnapshot = await get(roomRef);
      if (!roomSnapshot.exists()) {
        throw new Error('Room not found');
      }
      
      const room = roomSnapshot.val() as Room;
      
      // Check if room is joinable
      if (room.status !== RoomStatus.WAITING) {
        throw new Error('Room is not accepting new players');
      }
      
      // Check if player is already in the room
      if (room.players && room.players[userId]) {
        console.log('Player already in room');
        return true;
      }
      
      // Generate random avatar
      const avatar = generateRandomAvatar();
      
      // Create player object - new players start with WAITING status
      const player: Player = {
        id: userId,
        name: userName,
        status: PlayerStatus.WAITING,
        currentRow: 0,
        score: 0,
        avatar
      };
      
      // Add player to room
      await update(ref(database, `rooms/${roomId}/players/${userId}`), player);
      
      console.log('Joined room:', roomId);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }
  
  /**
   * Get a room by ID
   * @param roomId Room ID
   * @returns Room object
   */
  static async getRoom(roomId: string): Promise<Room | null> {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (!roomSnapshot.exists()) {
        return null;
      }
      
      return roomSnapshot.val() as Room;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }
  
  /**
   * Listen for room updates
   * @param roomId Room ID
   * @param callback Callback function
   */
  static listenToRoom(roomId: string, callback: (room: Room) => void): () => void {
    const roomRef = ref(database, `rooms/${roomId}`);
    
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const room = snapshot.val() as Room;
        callback(room);
      }
    });
    
    // Return unsubscribe function
    return () => off(roomRef);
  }
  
  /**
   * Update player status
   * @param roomId Room ID
   * @param status New status
   */
  static async updatePlayerStatus(roomId: string, status: PlayerStatus): Promise<void> {
    try {
      const userId = UserService.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      await update(ref(database, `rooms/${roomId}/players/${userId}`), {
        status
      });
      
      console.log('Updated player status:', status);
    } catch (error) {
      console.error('Error updating player status:', error);
      throw error;
    }
  }
  
  /**
   * Start the game
   * @param roomId Room ID
   * @param word Word to guess
   */
  static async startGame(roomId: string, word: string): Promise<void> {
    try {
      const userId = UserService.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Get room
      const room = await this.getRoom(roomId);
      
      if (!room) {
        throw new Error('Room not found');
      }
      
      // Check if user is room creator
      if (room.createdBy !== userId) {
        throw new Error('Only the room creator can start the game');
      }
      
      // Update room status and set word
      await update(ref(database, `rooms/${roomId}`), {
        status: RoomStatus.PLAYING,
        currentWord: word
      });
      
      // Update all players status to PLAYING
      const playerUpdates: Record<string, any> = {};
      Object.keys(room.players).forEach(playerId => {
        playerUpdates[`${playerId}/status`] = PlayerStatus.PLAYING;
      });
      
      await update(ref(database, `rooms/${roomId}/players`), playerUpdates);
      
      console.log('Game started');
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }
  
  /**
   * Update player progress
   * @param roomId Room ID
   * @param currentRow Current row
   * @param score Current score
   */
  static async updatePlayerProgress(
    roomId: string, 
    currentRow: number, 
    score: number,
    guess?: string
  ): Promise<void> {
    try {
      const userId = UserService.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Get current player data to update guesses properly
      const roomData = await this.getRoom(roomId);
      if (!roomData || !roomData.players[userId]) {
        throw new Error('Player not found in room');
      }
      
      const updateData: Record<string, any> = {
        currentRow,
        score
      };
      
      // If a new guess is provided, add it to the guesses array
      if (guess) {
        const currentGuesses = roomData.players[userId].guesses || [];
        updateData.guesses = [...currentGuesses, guess];
      }
      
      await update(ref(database, `rooms/${roomId}/players/${userId}`), updateData);
      
      console.log('Updated player progress');
    } catch (error) {
      console.error('Error updating player progress:', error);
      throw error;
    }
  }
  
  /**
   * Complete the game
   * @param roomId Room ID
   * @param score Final score
   * @param isWinner Whether the player won
   */
  static async completeGame(
    roomId: string, 
    score: number, 
    isWinner: boolean
  ): Promise<void> {
    try {
      const userId = UserService.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Update player status
      await update(ref(database, `rooms/${roomId}/players/${userId}`), {
        status: PlayerStatus.COMPLETED,
        score,
        completedAt: Date.now(),
        isWinner
      });
      
      // Check if all players have completed
      const room = await this.getRoom(roomId);
      
      if (!room) return;
      
      const allCompleted = Object.values(room.players).every(
        player => player.status === PlayerStatus.COMPLETED
      );
      
      if (allCompleted) {
        // Sort players by score to assign positions
        const sortedPlayers = Object.values(room.players)
          .sort((a, b) => b.score - a.score);
          
        // Create updates object for all players with their positions
        const playerUpdates: Record<string, any> = {};
        sortedPlayers.forEach((player, index) => {
          playerUpdates[`${player.id}/position`] = index + 1;
        });
        
        // Update all players with their positions
        await update(ref(database, `rooms/${roomId}/players`), playerUpdates);
        
        // Update room status
        await update(ref(database, `rooms/${roomId}`), {
          status: RoomStatus.COMPLETED
        });
      }
      
      console.log('Game completed');
    } catch (error) {
      console.error('Error completing game:', error);
      throw error;
    }
  }
  
  /**
   * Leave the room
   * @param roomId Room ID
   */
  static async leaveRoom(roomId: string): Promise<void> {
    try {
      const userId = UserService.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Get room
      const room = await this.getRoom(roomId);
      
      if (!room) {
        throw new Error('Room not found');
      }
      
      if (room.createdBy === userId) {
        // If host leaves, delete the room
        await set(ref(database, `rooms/${roomId}`), null);
        console.log('Room deleted (host left)');
      } else {
        // Otherwise, remove the player from the room
        await set(ref(database, `rooms/${roomId}/players/${userId}`), null);
        console.log('Left room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }
  
  /**
   * Get available rooms
   * @returns List of available rooms
   */
  static async getAvailableRooms(): Promise<Room[]> {
    try {
      const roomsRef = ref(database, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const rooms = snapshot.val();
      
      // Filter rooms that are in WAITING status
      return Object.values(rooms)
        .filter((room: any) => room.status === RoomStatus.WAITING) as Room[];
    } catch (error) {
      console.error('Error getting available rooms:', error);
      return [];
    }
  }
} 