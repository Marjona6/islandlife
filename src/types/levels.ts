import {TileType, SAND_TILE_EMOJIS, SEA_TILE_EMOJIS} from './game';

// Level configuration types
export type ObjectiveType =
  | 'score'
  | 'collect'
  | 'clear'
  | 'drop'
  | 'combo'
  | 'sand-clear';
export type MechanicType =
  | 'sand'
  | 'drop-targets'
  | 'ice'
  | 'crabs'
  | 'bombs'
  | 'rainbow'
  | 'locked'
  | 'net'
  | 'coral'
  | 'rock'
  | 'driftwood';
export type BlockerType = 'sand' | 'net' | 'ice' | 'rock' | 'coral';
export type SpecialTileType =
  | 'power-tile'
  | 'locked'
  | 'bomb'
  | 'rainbow'
  | 'collector'
  | 'driftwood'
  | 'coconut';

export interface LevelConfig {
  id: string;
  name: string;
  board: (TileType | string | null)[][];
  objective: ObjectiveType;
  target: number;
  moves: number;
  tileTypes: TileType[];
  mechanics: MechanicType[];
  blockers?: Array<{
    type: BlockerType;
    row: number;
    col: number;
  }>;
  specialTiles?: Array<{
    type: SpecialTileType;
    row: number;
    col: number;
    properties?: Record<string, any>;
  }>;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Level configurations moved to levels.json as single source of truth
// This array is kept empty for fallback purposes only
export const LEVEL_CONFIGS: LevelConfig[] = [];

// Helper function to get level by ID
export const getLevelById = (id: string): LevelConfig | undefined => {
  // This function is now deprecated - use levelManager.getLevel() instead
  return LEVEL_CONFIGS.find(level => level.id === id);
};

// Helper function to get all levels by difficulty
export const getLevelsByDifficulty = (
  difficulty: 'easy' | 'medium' | 'hard',
): LevelConfig[] => {
  // This function is now deprecated - use levelManager.getLevelsByDifficulty() instead
  return LEVEL_CONFIGS.filter(level => level.difficulty === difficulty);
};

// Helper function to check if a tile is a valid TileType
const isValidTileType = (tile: string): tile is TileType => {
  return [...SAND_TILE_EMOJIS, ...SEA_TILE_EMOJIS].includes(tile as TileType);
};

// Helper function to validate level configuration
export const validateLevelConfig = (config: LevelConfig): boolean => {
  // Check if board is 8x8
  if (config.board.length !== 8 || config.board.some(row => row.length !== 8)) {
    console.warn(
      `[VALIDATION] ${config.id} (${config.name}): Board is not 8x8`,
    );
    return false;
  }

  // For collect objectives, only check if target tile types are included
  if (config.objective === 'collect') {
    const boardTileTypes = new Set<TileType>();
    config.board.forEach(row => {
      row.forEach(tile => {
        if (tile && typeof tile === 'string' && isValidTileType(tile)) {
          boardTileTypes.add(tile);
        }
      });
    });

    // Check if all target tile types are present in the board
    for (const targetTile of config.tileTypes) {
      if (!boardTileTypes.has(targetTile)) {
        console.warn(
          `[VALIDATION] ${config.id} (${config.name}): Target tile ${targetTile} not found in board`,
        );
        return false;
      }
    }
  } else {
    // For other objectives, check if all regular tile types in board are included in tileTypes array
    const boardTileTypes = new Set<TileType>();
    config.board.forEach(row => {
      row.forEach(tile => {
        if (tile && typeof tile === 'string' && isValidTileType(tile)) {
          boardTileTypes.add(tile);
        }
      });
    });

    const configTileTypes = new Set(config.tileTypes);
    for (const tileType of boardTileTypes) {
      if (!configTileTypes.has(tileType)) {
        console.warn(
          `[VALIDATION] ${config.id} (${config.name}): Board tile ${tileType} not in tileTypes array`,
        );
        return false;
      }
    }
  }

  // If we get here, validation passed
  console.log(`[VALIDATION] ${config.id} (${config.name}): PASSED`);
  return true;
};
