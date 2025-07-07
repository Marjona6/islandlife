import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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

  // Initialize the service
  async initialize(): Promise<void> {
    // Check if we already have a current user
    const currentUser = auth().currentUser;
    if (currentUser) {
      this.currentUser = {
        uid: currentUser.uid,
        email: currentUser.email || undefined,
        isAnonymous: currentUser.isAnonymous,
        displayName: currentUser.displayName || undefined,
      };
      return;
    }

    // Listen for auth state changes (only set up once)
    auth().onAuthStateChanged(async user => {
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

    // Try to sign in anonymously if no user (only once)
    try {
      await auth().signInAnonymously();
    } catch (error) {
      console.error('Failed to sign in anonymously:', error);
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
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
      const userCredential = await auth().createUserWithEmailAndPassword(
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
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        throw new Error('No anonymous user to link');
      }

      const credential = auth.EmailAuthProvider.credential(email, password);
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
      await auth().signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Create initial user progress
  private async createUserProgress(): Promise<void> {
    if (!this.currentUser) return;

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

    await firestore()
      .collection('userProgress')
      .doc(this.currentUser.uid)
      .set(initialProgress);
  }

  // Get user progress
  async getUserProgress(): Promise<UserProgress | null> {
    if (!this.currentUser) return null;

    try {
      const doc = await firestore()
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
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await firestore()
        .collection('userProgress')
        .doc(this.currentUser.uid)
        .update(updateData);
    } catch (error) {
      console.error('Update user progress error:', error);
      throw error;
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
      throw error;
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
      throw error;
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
