import {
  LevelConfig,
  getLevelById,
  getLevelsByDifficulty,
  validateLevelConfig,
} from '../types/levels';

// Level manager utility functions
export class LevelManager {
  private static instance: LevelManager;
  private levels: Map<string, LevelConfig> = new Map();

  private constructor() {
    // Initialize with levels from the types file
    this.loadLevels();
  }

  public static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
    }
    return LevelManager.instance;
  }

  private loadLevels(): void {
    // This would typically load from a JSON file or API
    // For now, we'll use the levels from the types file
    const {LEVEL_CONFIGS} = require('../types/levels');

    LEVEL_CONFIGS.forEach((level: LevelConfig) => {
      if (validateLevelConfig(level)) {
        this.levels.set(level.id, level);
      } else {
        console.warn(`Invalid level configuration for ${level.id}`);
      }
    });
  }

  public getLevel(id: string): LevelConfig | undefined {
    return this.levels.get(id) || getLevelById(id);
  }

  public getAllLevels(): LevelConfig[] {
    return Array.from(this.levels.values());
  }

  public getLevelsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
  ): LevelConfig[] {
    return getLevelsByDifficulty(difficulty);
  }

  public getNextLevel(currentLevelId: string): LevelConfig | undefined {
    const allLevels = this.getAllLevels();
    const currentIndex = allLevels.findIndex(
      level => level.id === currentLevelId,
    );

    if (currentIndex === -1 || currentIndex === allLevels.length - 1) {
      return undefined;
    }

    return allLevels[currentIndex + 1];
  }

  public getPreviousLevel(currentLevelId: string): LevelConfig | undefined {
    const allLevels = this.getAllLevels();
    const currentIndex = allLevels.findIndex(
      level => level.id === currentLevelId,
    );

    if (currentIndex <= 0) {
      return undefined;
    }

    return allLevels[currentIndex - 1];
  }

  public getLevelsByObjective(objective: string): LevelConfig[] {
    return this.getAllLevels().filter(level => level.objective === objective);
  }

  public getLevelsByMechanics(mechanics: string[]): LevelConfig[] {
    return this.getAllLevels().filter(level =>
      mechanics.some(mechanic => level.mechanics.includes(mechanic as any)),
    );
  }

  public validateLevel(level: LevelConfig): boolean {
    return validateLevelConfig(level);
  }

  public addLevel(level: LevelConfig): boolean {
    if (this.validateLevel(level)) {
      this.levels.set(level.id, level);
      return true;
    }
    return false;
  }

  public removeLevel(levelId: string): boolean {
    return this.levels.delete(levelId);
  }

  public getLevelCount(): number {
    return this.levels.size;
  }

  public getLevelCountByDifficulty(): Record<string, number> {
    const counts = {easy: 0, medium: 0, hard: 0};

    this.getAllLevels().forEach(level => {
      if (level.difficulty) {
        counts[level.difficulty]++;
      }
    });

    return counts;
  }

  public getLevelProgress(completedLevelIds: string[]): {
    total: number;
    completed: number;
    percentage: number;
    nextLevel?: LevelConfig;
  } {
    const total = this.getLevelCount();
    const completed = completedLevelIds.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    let nextLevel: LevelConfig | undefined;
    if (completed < total) {
      const lastCompleted = completedLevelIds[completedLevelIds.length - 1];
      nextLevel = this.getNextLevel(lastCompleted);
    }

    return {
      total,
      completed,
      percentage,
      nextLevel,
    };
  }
}

// Export singleton instance
export const levelManager = LevelManager.getInstance();

// Helper functions for common operations
export const loadLevelFromJSON = async (
  levelId: string,
): Promise<LevelConfig | null> => {
  try {
    // In a real app, this would fetch from an API or local JSON file
    const response = await fetch(`/api/levels/${levelId}`);
    const levelData = await response.json();

    if (validateLevelConfig(levelData)) {
      return levelData;
    }
    return null;
  } catch (error) {
    console.error('Failed to load level:', error);
    return null;
  }
};

export const saveLevelProgress = async (
  levelId: string,
  progress: any,
): Promise<boolean> => {
  try {
    // In a real app, this would save to an API or local storage
    await fetch(`/api/progress/${levelId}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(progress),
    });
    return true;
  } catch (error) {
    console.error('Failed to save progress:', error);
    return false;
  }
};

export const getLevelDifficulty = (level: LevelConfig): number => {
  // Calculate difficulty score based on various factors
  let score = 0;

  // Base score from difficulty (1-3)
  switch (level.difficulty) {
    case 'easy':
      score += 1;
      break;
    case 'medium':
      score += 2;
      break;
    case 'hard':
      score += 3;
      break;
  }

  // Add points for mechanics (max 1 point)
  score += Math.min(level.mechanics.length * 0.2, 1);

  // Add points for blockers (max 0.5 points)
  if (level.blockers) {
    score += Math.min(level.blockers.length * 0.1, 0.5);
  }

  // Add points for special tiles (max 0.5 points)
  if (level.specialTiles) {
    score += Math.min(level.specialTiles.length * 0.1, 0.5);
  }

  // Adjust for moves vs target ratio (max 0.5 points)
  const moveEfficiency = level.target / level.moves;
  score += Math.min(moveEfficiency * 0.1, 0.5);

  return Math.min(5, Math.max(1, Math.round(score)));
};
