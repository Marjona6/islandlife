// Modern Firebase imports
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

let auth: any = null;
let firestore: any = null;

const getAuthInstance = () => {
  if (!auth) {
    try {
      auth = getAuth();
    } catch (error) {
      console.warn('Firebase Auth not available:', error);
      return null;
    }
  }
  return auth;
};

const getFirestoreInstance = () => {
  if (!firestore) {
    try {
      firestore = getFirestore();
    } catch (error) {
      console.warn('Firestore not available:', error);
      return null;
    }
  }
  return firestore;
};

export interface UserProgress {
  userId: string;
  completedLevels: string[];
  currency: {
    shells: number;
    gems: number;
  };
  lastPlayed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  uid: string;
  email?: string;
  isAnonymous: boolean;
  displayName?: string;
}

class UserProgressService {
  private currentUser: AuthUser | null = null;
  private isInitialized = false;

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure Firebase is initialized first
      const { initializeFirebase } = require('./firebase');
      initializeFirebase();

      // Wait a moment for Firebase to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if Firebase is available
      const authInstance = getAuthInstance();
      const firestoreInstance = getFirestoreInstance();

      if (!authInstance || !firestoreInstance) {
        console.warn(
          'Firebase not available, skipping user progress initialization',
        );
        this.isInitialized = true;
        return;
      }

      // Check if we already have a current user
      const currentUser = authInstance.currentUser;
      if (currentUser) {
        this.currentUser = {
          uid: currentUser.uid,
          email: currentUser.email || undefined,
          isAnonymous: currentUser.isAnonymous,
          displayName: currentUser.displayName || undefined,
        };
        this.isInitialized = true;
        return;
      }

      // Listen for auth state changes (only set up once)
      authInstance.onAuthStateChanged(async (user: any) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email || undefined,
            isAnonymous: user.isAnonymous,
            displayName: user.displayName || undefined,
          };
        } else {
          this.currentUser = null;
        }
      });

      // In PROD mode, always try to sign in anonymously if no user
      // In DEV mode, we don't need authentication
      try {
        const { gameModeService } = require('./gameMode');
        if (gameModeService.isProdMode()) {
          await authInstance.signInAnonymously();
        }
      } catch (error) {
        console.error('Failed to sign in anonymously:', error);
        // Don't throw - allow app to continue without Firebase
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing user progress service:', error);
      // Don't throw - allow app to continue without Firebase
      this.isInitialized = true;
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const authInstance = getAuthInstance();
      if (!authInstance) {
        throw new Error('Firebase Auth not available');
      }

      const userCredential = await authInstance.signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      this.currentUser = {
        uid: user.uid,
        email: user.email || undefined,
        isAnonymous: user.isAnonymous,
        displayName: user.displayName || undefined,
      };

      return this.currentUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Create account with email and password
  async createAccountWithEmail(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    try {
      const authInstance = getAuthInstance();
      if (!authInstance) {
        throw new Error('Firebase Auth not available');
      }

      const userCredential = await authInstance.createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      this.currentUser = {
        uid: user.uid,
        email: user.email || undefined,
        isAnonymous: user.isAnonymous,
        displayName: user.displayName || undefined,
      };

      // Create initial progress for new user
      await this.createUserProgress();

      return this.currentUser;
    } catch (error) {
      console.error('Create account error:', error);
      throw error;
    }
  }

  // Link anonymous account with email
  async linkWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const authInstance = getAuth();
      if (!authInstance) {
        throw new Error('Firebase Auth not available');
      }

      const currentUser = authInstance().currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        throw new Error('No anonymous user to link');
      }

      const credential = authInstance.EmailAuthProvider.credential(
        email,
        password,
      );
      const userCredential = await currentUser.linkWithCredential(credential);
      const user = userCredential.user;

      this.currentUser = {
        uid: user.uid,
        email: user.email || undefined,
        isAnonymous: user.isAnonymous,
        displayName: user.displayName || undefined,
      };

      return this.currentUser;
    } catch (error) {
      console.error('Link account error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const authInstance = getAuth();
      if (!authInstance) {
        console.warn('Firebase Auth not available, skipping sign out');
        this.currentUser = null;
        return;
      }

      await authInstance().signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw - allow app to continue without Firebase
    }
  }

  // Create initial user progress
  private async createUserProgress(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const firestoreInstance = getFirestore();
      if (!firestoreInstance) {
        console.warn(
          'Firestore not available, skipping user progress creation',
        );
        return;
      }

      const initialProgress: UserProgress = {
        userId: this.currentUser.uid,
        completedLevels: [],
        currency: {
          shells: 0,
          gems: 0,
        },
        lastPlayed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firestoreInstance()
        .collection('userProgress')
        .doc(this.currentUser.uid)
        .set(initialProgress);
    } catch (error) {
      console.error('Error creating user progress:', error);
      // Don't throw - allow app to continue without Firebase
    }
  }

  // Get user progress
  async getUserProgress(): Promise<UserProgress | null> {
    if (!this.currentUser) return null;

    try {
      const firestoreInstance = getFirestore();
      if (!firestoreInstance) {
        console.warn('Firestore not available, returning null progress');
        return null;
      }

      const doc = await firestoreInstance()
        .collection('userProgress')
        .doc(this.currentUser.uid)
        .get();

      if (doc.exists()) {
        const data = doc.data() as any; // Use any to handle Firestore Timestamps
        return {
          ...data,
          lastPlayed: data.lastPlayed?.toDate?.() || data.lastPlayed,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as UserProgress;
      } else {
        // Create initial progress if it doesn't exist
        await this.createUserProgress();
        return this.getUserProgress();
      }
    } catch (error) {
      console.error('Get user progress error:', error);
      return null;
    }
  }

  // Update user progress
  async updateUserProgress(updates: Partial<UserProgress>): Promise<void> {
    if (!this.currentUser) return;

    try {
      const firestoreInstance = getFirestore();
      if (!firestoreInstance) {
        console.warn('Firestore not available, skipping user progress update');
        return;
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await firestoreInstance()
        .collection('userProgress')
        .doc(this.currentUser.uid)
        .update(updateData);
    } catch (error) {
      console.error('Update user progress error:', error);
      // Don't throw - allow app to continue without Firebase
    }
  }

  // Complete a level
  async completeLevel(levelId: string): Promise<void> {
    if (!this.currentUser) return;

    try {
      const progress = await this.getUserProgress();
      if (!progress) return;

      const completedLevels = [...progress.completedLevels];
      if (!completedLevels.includes(levelId)) {
        completedLevels.push(levelId);
      }

      await this.updateUserProgress({
        completedLevels,
        lastPlayed: new Date(),
      });
    } catch (error) {
      console.error('Complete level error:', error);
      // Don't throw - allow app to continue without Firebase
    }
  }

  // Update currency
  async updateCurrency(currency: {
    shells?: number;
    gems?: number;
  }): Promise<void> {
    if (!this.currentUser) return;

    try {
      const progress = await this.getUserProgress();
      if (!progress) return;

      const updatedCurrency = {
        shells:
          currency.shells !== undefined
            ? currency.shells
            : progress.currency.shells,
        gems:
          currency.gems !== undefined ? currency.gems : progress.currency.gems,
      };

      await this.updateUserProgress({
        currency: updatedCurrency,
        lastPlayed: new Date(),
      });
    } catch (error) {
      console.error('Update currency error:', error);
      // Don't throw - allow app to continue without Firebase
    }
  }

  // Get next level to play
  async getNextLevel(): Promise<string | null> {
    const progress = await this.getUserProgress();
    if (!progress) return 'level-1'; // Default to first level

    const allLevels = [
      'level-1',
      'level-2',
      'level-3',
      'level-4',
      'level-5',
      'level-6',
      'level-7',
      'level-8',
    ];

    // Find the first level that hasn't been completed
    for (const levelId of allLevels) {
      if (!progress.completedLevels.includes(levelId)) {
        return levelId;
      }
    }

    // All levels completed
    return 'level-1';
  }
}

export const userProgressService = new UserProgressService();
