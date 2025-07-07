import {userProgressService, UserProgress} from './userProgress';

export type GameMode = 'PROD' | 'DEV';

class GameModeService {
  private mode: GameMode = 'PROD'; // Default to PROD mode

  // Initialize the service and determine the mode
  async initialize(): Promise<void> {
    // Check environment variable or use default
    // In React Native, we'll use a different approach for environment variables
    // For now, we'll use a simple check - you can modify this based on your setup
    this.mode = this.getGameMode();
    // console.log('Game mode initialized:', this.mode); // Removed for test compatibility
  }

  // Get the current game mode
  getGameMode(): GameMode {
    // You can implement different ways to determine the mode:
    // 1. Environment variable (requires additional setup)
    // 2. Build configuration
    // 3. Remote config
    // 4. Simple flag in code

    // For now, we'll use a simple approach - you can modify this
    // In development, you might want to set this to 'DEV'
    return 'PROD';
  }

  // Check if we're in DEV mode
  isDevMode(): boolean {
    return this.mode === 'DEV';
  }

  // Check if we're in PROD mode
  isProdMode(): boolean {
    return this.mode === 'PROD';
  }

  // Get the next level to play (PROD mode logic)
  async getNextLevel(): Promise<string> {
    if (this.isDevMode()) {
      // In DEV mode, always return level-1 (user can choose from list)
      return 'level-1';
    }

    // In PROD mode, get the next uncompleted level
    try {
      const nextLevel = await userProgressService.getNextLevel();
      return nextLevel || 'level-1';
    } catch (error) {
      console.error('Error getting next level:', error);
      return 'level-1';
    }
  }

  // Check if a level is unlocked (PROD mode logic)
  async isLevelUnlocked(levelId: string): Promise<boolean> {
    if (this.isDevMode()) {
      // In DEV mode, all levels are unlocked
      return true;
    }

    // In PROD mode, check user progress
    try {
      const progress = await userProgressService.getUserProgress();
      if (!progress) {
        // No progress means start from level 1
        return levelId === 'level-1';
      }

      // Check if this level or any previous level is completed
      const levelOrder = [
        'level-1',
        'level-2',
        'level-3',
        'level-4',
        'level-5',
        'level-6',
        'level-7',
        'level-8',
      ];
      const levelIndex = levelOrder.indexOf(levelId);

      if (levelIndex === 0) {
        // First level is always unlocked
        return true;
      }

      // Check if previous level is completed
      const previousLevel = levelOrder[levelIndex - 1];
      return progress.completedLevels.includes(previousLevel);
    } catch (error) {
      console.error('Error checking level unlock status:', error);
      return levelId === 'level-1'; // Default to only level 1 unlocked
    }
  }

  // Get all unlocked levels (for DEV mode or progress display)
  async getUnlockedLevels(): Promise<string[]> {
    if (this.isDevMode()) {
      // In DEV mode, all levels are unlocked
      return [
        'level-1',
        'level-2',
        'level-3',
        'level-4',
        'level-5',
        'level-6',
        'level-7',
        'level-8',
      ];
    }

    // In PROD mode, get unlocked levels based on progress
    try {
      const progress = await userProgressService.getUserProgress();
      if (!progress) {
        return ['level-1'];
      }

      const levelOrder = [
        'level-1',
        'level-2',
        'level-3',
        'level-4',
        'level-5',
        'level-6',
        'level-7',
        'level-8',
      ];
      const unlockedLevels: string[] = [];

      for (const levelId of levelOrder) {
        if (await this.isLevelUnlocked(levelId)) {
          unlockedLevels.push(levelId);
        }
      }

      return unlockedLevels;
    } catch (error) {
      console.error('Error getting unlocked levels:', error);
      return ['level-1'];
    }
  }

  // Get user progress for display
  async getUserProgress(): Promise<UserProgress | null> {
    if (this.isDevMode()) {
      // In DEV mode, return mock progress or null
      return null;
    }

    return await userProgressService.getUserProgress();
  }

  // Complete a level
  async completeLevel(levelId: string): Promise<void> {
    if (this.isDevMode()) {
      // In DEV mode, don't save progress
      // console.log('DEV mode: Level completed (not saved):', levelId); // Removed for test compatibility
      return;
    }

    // In PROD mode, save progress
    await userProgressService.completeLevel(levelId);
  }

  // Update currency
  async updateCurrency(currency: {
    shells?: number;
    gems?: number;
  }): Promise<void> {
    if (this.isDevMode()) {
      // In DEV mode, don't save currency
      // console.log('DEV mode: Currency updated (not saved):', currency); // Removed for test compatibility
      return;
    }

    // In PROD mode, save currency
    await userProgressService.updateCurrency(currency);
  }
}

export const gameModeService = new GameModeService();
