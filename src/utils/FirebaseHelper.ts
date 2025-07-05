import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  DocumentData, 
  QueryConstraint,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  FirestoreError
} from 'firebase/firestore';
import { app } from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

/**
 * Firebase helper class for generic CRUD operations
 */
export class FirebaseHelper {
  /**
   * Get all documents from a collection
   * @param collectionName - Name of the collection
   * @param constraints - Optional query constraints (where, orderBy, limit, etc.)
   * @returns Array of documents
   */
  static async getAll<T>(
    collectionName: string, 
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot: QuerySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as unknown as T;
      });
    } catch (error) {
      this.handleError('Error getting documents', error);
      return [];
    }
  }

  /**
   * Get a document by ID
   * @param collectionName - Name of the collection
   * @param id - Document ID
   * @returns Document data or null if not found
   */
  static async getById<T>(
    collectionName: string, 
    id: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap: DocumentSnapshot = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      } else {
        console.log(`No document found with ID: ${id}`);
        return null;
      }
    } catch (error) {
      this.handleError(`Error getting document with ID: ${id}`, error);
      return null;
    }
  }

  /**
   * Save a new document or update if it exists
   * @param collectionName - Name of the collection
   * @param data - Document data
   * @param id - Optional document ID (if not provided, Firestore will generate one)
   * @returns Document ID
   */
  static async save<T extends { id?: string }>(
    collectionName: string, 
    data: T, 
    id?: string
  ): Promise<string> {
    try {
      // Remove id from data to avoid duplication
      const { id: dataId, ...dataWithoutId } = data;
      const docId = id || dataId;
      
      let docRef: DocumentReference;
      
      if (docId) {
        // Use provided ID
        docRef = doc(db, collectionName, docId);
        await setDoc(docRef, dataWithoutId);
        return docId;
      } else {
        // Let Firestore generate ID
        docRef = doc(collection(db, collectionName));
        await setDoc(docRef, dataWithoutId);
        return docRef.id;
      }
    } catch (error) {
      this.handleError('Error saving document', error);
      throw error;
    }
  }

  /**
   * Update a document
   * @param collectionName - Name of the collection
   * @param id - Document ID
   * @param data - Partial document data to update
   */
  static async update<T>(
    collectionName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<void> {
    try {
      // Remove id from data if it exists
      const { id: _, ...dataWithoutId } = data as any;
      
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, dataWithoutId as DocumentData);
    } catch (error) {
      this.handleError(`Error updating document with ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param collectionName - Name of the collection
   * @param id - Document ID
   */
  static async delete(
    collectionName: string, 
    id: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      this.handleError(`Error deleting document with ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Query documents by a field value
   * @param collectionName - Name of the collection
   * @param field - Field to query
   * @param value - Value to match
   * @param constraints - Optional additional query constraints
   * @returns Array of documents
   */
  static async queryByField<T>(
    collectionName: string, 
    field: string, 
    value: any, 
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef, 
        where(field, '==', value),
        ...constraints
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as unknown as T;
      });
    } catch (error) {
      this.handleError(`Error querying documents by field: ${field}`, error);
      return [];
    }
  }

  /**
   * Get a random document from a collection
   * @param collectionName - Name of the collection
   * @returns Random document or null if collection is empty
   */
  static async getRandom<T>(collectionName: string): Promise<T | null> {
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      if (querySnapshot.empty) {
        console.log(`Collection ${collectionName} is empty`);
        return null;
      }
      
      const docs = querySnapshot.docs;
      const randomIndex = Math.floor(Math.random() * docs.length);
      const randomDoc = docs[randomIndex];
      
      return { id: randomDoc.id, ...randomDoc.data() } as unknown as T;
    } catch (error) {
      this.handleError(`Error getting random document from ${collectionName}`, error);
      return null;
    }
  }

  /**
   * Handle Firestore errors
   * @param message - Error message
   * @param error - Error object
   */
  private static handleError(message: string, error: unknown): void {
    if (error instanceof FirestoreError) {
      console.error(`${message}: [${error.code}] ${error.message}`);
    } else {
      console.error(`${message}: ${error}`);
    }
  }
} 