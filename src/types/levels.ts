import {TileType} from './game';

// Level configuration types
export type ObjectiveType = 'score' | 'collect' | 'clear' | 'drop' | 'combo';
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
  | 'rock';
export type BlockerType = 'sand' | 'net' | 'ice' | 'rock' | 'coral';
export type SpecialTileType =
  | 'power-tile'
  | 'locked'
  | 'bomb'
  | 'rainbow'
  | 'collector';

export interface LevelConfig {
  id: string;
  name: string;
  board: (TileType | null)[][];
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

// Example levels
export const LEVEL_CONFIGS: LevelConfig[] = [
  // Level 1: Simple collect objective
  {
    id: 'level-1',
    name: 'Shell Collector',
    board: [
      ['🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
      ['🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
    ],
    objective: 'collect',
    target: 15, // Collect 15 shells
    moves: 20,
    tileTypes: ['🐚'],
    mechanics: [],
    description: 'Collect 15 shells to win!',
    difficulty: 'easy',
  },

  // Level 2: Score objective with sand mechanics
  {
    id: 'level-2',
    name: 'Sandy Shores',
    board: [
      ['🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
      ['🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
    ],
    objective: 'score',
    target: 5000,
    moves: 25,
    tileTypes: ['🦀', '🌴', '⭐', '🌺', '🐚'],
    mechanics: ['sand'],
    blockers: [
      {type: 'sand', row: 3, col: 3},
      {type: 'sand', row: 3, col: 4},
      {type: 'sand', row: 4, col: 3},
      {type: 'sand', row: 4, col: 4},
    ],
    description: 'Score 5000 points while clearing sand!',
    difficulty: 'easy',
  },

  // Level 3: Clear objective with ice mechanics
  {
    id: 'level-3',
    name: 'Frozen Tides',
    board: [
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
    ],
    objective: 'clear',
    target: 40, // Clear 40 tiles
    moves: 30,
    tileTypes: ['🦑', '🦐', '🐡', '🪝'],
    mechanics: ['ice'],
    blockers: [
      {type: 'ice', row: 2, col: 2},
      {type: 'ice', row: 2, col: 3},
      {type: 'ice', row: 2, col: 4},
      {type: 'ice', row: 2, col: 5},
      {type: 'ice', row: 3, col: 2},
      {type: 'ice', row: 3, col: 5},
      {type: 'ice', row: 4, col: 2},
      {type: 'ice', row: 4, col: 5},
      {type: 'ice', row: 5, col: 2},
      {type: 'ice', row: 5, col: 3},
      {type: 'ice', row: 5, col: 4},
      {type: 'ice', row: 5, col: 5},
    ],
    description: 'Clear 40 tiles by breaking through the ice!',
    difficulty: 'medium',
  },

  // Level 4: Drop objective with drop targets
  {
    id: 'level-4',
    name: 'Deep Sea Drop',
    board: [
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
    ],
    objective: 'drop',
    target: 8, // Drop 8 items to targets
    moves: 35,
    tileTypes: ['🦑', '🦐', '🐡', '🪝'],
    mechanics: ['drop-targets'],
    specialTiles: [
      {type: 'collector', row: 7, col: 0, properties: {targetType: '🦑'}},
      {type: 'collector', row: 7, col: 1, properties: {targetType: '🦐'}},
      {type: 'collector', row: 7, col: 2, properties: {targetType: '🐡'}},
      {type: 'collector', row: 7, col: 3, properties: {targetType: '🪝'}},
      {type: 'collector', row: 7, col: 4, properties: {targetType: '🦑'}},
      {type: 'collector', row: 7, col: 5, properties: {targetType: '🦐'}},
      {type: 'collector', row: 7, col: 6, properties: {targetType: '🐡'}},
      {type: 'collector', row: 7, col: 7, properties: {targetType: '🪝'}},
    ],
    description: 'Drop the correct sea creatures to their targets!',
    difficulty: 'medium',
  },

  // Level 5: Combo objective with bombs and locked tiles
  {
    id: 'level-5',
    name: 'Explosive Combos',
    board: [
      ['🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
      ['🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
    ],
    objective: 'combo',
    target: 5, // Achieve 5 combos
    moves: 40,
    tileTypes: ['🦀', '🌴', '⭐', '🌺', '🐚'],
    mechanics: ['bombs', 'locked'],
    specialTiles: [
      {type: 'bomb', row: 1, col: 1, properties: {radius: 2}},
      {type: 'bomb', row: 6, col: 6, properties: {radius: 2}},
      {type: 'locked', row: 3, col: 3},
      {type: 'locked', row: 3, col: 4},
      {type: 'locked', row: 4, col: 3},
      {type: 'locked', row: 4, col: 4},
    ],
    description: 'Create 5 combos using bombs to unlock tiles!',
    difficulty: 'hard',
  },

  // Level 6: Advanced level with multiple mechanics
  {
    id: 'level-6',
    name: 'Coral Reef Challenge',
    board: [
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
    ],
    objective: 'score',
    target: 10000,
    moves: 45,
    tileTypes: ['🦑', '🦐', '🐡', '🪝'],
    mechanics: ['ice', 'coral', 'rainbow'],
    blockers: [
      {type: 'coral', row: 1, col: 1},
      {type: 'coral', row: 1, col: 6},
      {type: 'coral', row: 6, col: 1},
      {type: 'coral', row: 6, col: 6},
      {type: 'ice', row: 3, col: 3},
      {type: 'ice', row: 3, col: 4},
      {type: 'ice', row: 4, col: 3},
      {type: 'ice', row: 4, col: 4},
    ],
    specialTiles: [
      {type: 'rainbow', row: 0, col: 0, properties: {color: 'random'}},
      {type: 'rainbow', row: 0, col: 7, properties: {color: 'random'}},
      {type: 'rainbow', row: 7, col: 0, properties: {color: 'random'}},
      {type: 'rainbow', row: 7, col: 7, properties: {color: 'random'}},
    ],
    description:
      'Score 10000 points using rainbow tiles to break coral and ice!',
    difficulty: 'hard',
  },

  // Level 7: Crab invasion level
  {
    id: 'level-7',
    name: 'Crab Invasion',
    board: [
      ['🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
      ['🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
    ],
    objective: 'clear',
    target: 50,
    moves: 50,
    tileTypes: ['🦀', '🌴', '⭐', '🌺', '🐚'],
    mechanics: ['crabs'],
    specialTiles: [
      {
        type: 'power-tile',
        row: 2,
        col: 2,
        properties: {power: 'crab-repellent'},
      },
      {
        type: 'power-tile',
        row: 2,
        col: 5,
        properties: {power: 'crab-repellent'},
      },
      {
        type: 'power-tile',
        row: 5,
        col: 2,
        properties: {power: 'crab-repellent'},
      },
      {
        type: 'power-tile',
        row: 5,
        col: 5,
        properties: {power: 'crab-repellent'},
      },
    ],
    description: 'Clear 50 tiles while avoiding the crab invasion!',
    difficulty: 'hard',
  },

  // Level 8: Net fishing level
  {
    id: 'level-8',
    name: 'Net Fishing',
    board: [
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
    ],
    objective: 'collect',
    target: 20,
    moves: 30,
    tileTypes: ['🦑', '🦐', '🐡', '🪝'],
    mechanics: ['net'],
    blockers: [
      {type: 'net', row: 2, col: 2},
      {type: 'net', row: 2, col: 3},
      {type: 'net', row: 2, col: 4},
      {type: 'net', row: 2, col: 5},
      {type: 'net', row: 3, col: 2},
      {type: 'net', row: 3, col: 5},
      {type: 'net', row: 4, col: 2},
      {type: 'net', row: 4, col: 5},
      {type: 'net', row: 5, col: 2},
      {type: 'net', row: 5, col: 3},
      {type: 'net', row: 5, col: 4},
      {type: 'net', row: 5, col: 5},
    ],
    description:
      'Collect 20 sea creatures by breaking through the fishing nets!',
    difficulty: 'medium',
  },

  // Level 9: Rock obstacles with mixed mechanics
  {
    id: 'level-9',
    name: 'Rocky Waters',
    board: [
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
      ['🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝'],
      ['🦐', '🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑'],
      ['🐡', '🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐'],
      ['🪝', '🦑', '🦐', '🐡', '🪝', '🦑', '🦐', '🐡'],
    ],
    objective: 'clear',
    target: 60,
    moves: 55,
    tileTypes: ['🦑', '🦐', '🐡', '🪝'],
    mechanics: ['rock', 'bombs'],
    blockers: [
      {type: 'rock', row: 1, col: 1},
      {type: 'rock', row: 1, col: 6},
      {type: 'rock', row: 6, col: 1},
      {type: 'rock', row: 6, col: 6},
      {type: 'rock', row: 2, col: 3},
      {type: 'rock', row: 2, col: 4},
      {type: 'rock', row: 5, col: 3},
      {type: 'rock', row: 5, col: 4},
    ],
    specialTiles: [
      {type: 'bomb', row: 0, col: 0, properties: {radius: 3}},
      {type: 'bomb', row: 0, col: 7, properties: {radius: 3}},
      {type: 'bomb', row: 7, col: 0, properties: {radius: 3}},
      {type: 'bomb', row: 7, col: 7, properties: {radius: 3}},
    ],
    description: 'Clear 60 tiles using bombs to break through rocky obstacles!',
    difficulty: 'hard',
  },

  // Level 10: Ultimate challenge with all mechanics
  {
    id: 'level-10',
    name: 'Island Life Master',
    board: [
      ['🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
      ['🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀', '🌴'],
      ['🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚', '🦀'],
      ['⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺', '🐚'],
      ['🌴', '⭐', '🌺', '🐚', '🦀', '🌴', '⭐', '🌺'],
    ],
    objective: 'score',
    target: 15000,
    moves: 60,
    tileTypes: ['🦀', '🌴', '⭐', '🌺', '🐚'],
    mechanics: ['sand', 'ice', 'crabs', 'bombs', 'rainbow', 'locked'],
    blockers: [
      {type: 'sand', row: 0, col: 0},
      {type: 'sand', row: 0, col: 7},
      {type: 'sand', row: 7, col: 0},
      {type: 'sand', row: 7, col: 7},
      {type: 'ice', row: 3, col: 3},
      {type: 'ice', row: 3, col: 4},
      {type: 'ice', row: 4, col: 3},
      {type: 'ice', row: 4, col: 4},
    ],
    specialTiles: [
      {type: 'rainbow', row: 1, col: 1, properties: {color: 'random'}},
      {type: 'rainbow', row: 1, col: 6, properties: {color: 'random'}},
      {type: 'rainbow', row: 6, col: 1, properties: {color: 'random'}},
      {type: 'rainbow', row: 6, col: 6, properties: {color: 'random'}},
      {type: 'bomb', row: 2, col: 2, properties: {radius: 2}},
      {type: 'bomb', row: 2, col: 5, properties: {radius: 2}},
      {type: 'bomb', row: 5, col: 2, properties: {radius: 2}},
      {type: 'bomb', row: 5, col: 5, properties: {radius: 2}},
      {type: 'locked', row: 3, col: 1},
      {type: 'locked', row: 3, col: 6},
      {type: 'locked', row: 4, col: 1},
      {type: 'locked', row: 4, col: 6},
      {
        type: 'power-tile',
        row: 0,
        col: 3,
        properties: {power: 'crab-repellent'},
      },
      {
        type: 'power-tile',
        row: 0,
        col: 4,
        properties: {power: 'crab-repellent'},
      },
      {
        type: 'power-tile',
        row: 7,
        col: 3,
        properties: {power: 'crab-repellent'},
      },
      {
        type: 'power-tile',
        row: 7,
        col: 4,
        properties: {power: 'crab-repellent'},
      },
    ],
    description: 'Master challenge: Score 15000 points using all mechanics!',
    difficulty: 'hard',
  },
];

// Helper function to get level by ID
export const getLevelById = (id: string): LevelConfig | undefined => {
  return LEVEL_CONFIGS.find(level => level.id === id);
};

// Helper function to get all levels by difficulty
export const getLevelsByDifficulty = (
  difficulty: 'easy' | 'medium' | 'hard',
): LevelConfig[] => {
  return LEVEL_CONFIGS.filter(level => level.difficulty === difficulty);
};

// Helper function to validate level configuration
export const validateLevelConfig = (config: LevelConfig): boolean => {
  // Check if board is 8x8
  if (config.board.length !== 8 || config.board.some(row => row.length !== 8)) {
    return false;
  }

  // For collect objectives, only check if target tile types are included
  if (config.objective === 'collect') {
    const boardTileTypes = new Set<TileType>();
    config.board.forEach(row => {
      row.forEach(tile => {
        if (tile) boardTileTypes.add(tile);
      });
    });

    // Check if all target tile types are present in the board
    for (const targetTile of config.tileTypes) {
      if (!boardTileTypes.has(targetTile)) {
        return false;
      }
    }
  } else {
    // For other objectives, check if all tile types in board are included in tileTypes array
    const boardTileTypes = new Set<TileType>();
    config.board.forEach(row => {
      row.forEach(tile => {
        if (tile) boardTileTypes.add(tile);
      });
    });

    const configTileTypes = new Set(config.tileTypes);
    for (const tileType of boardTileTypes) {
      if (!configTileTypes.has(tileType)) {
        return false;
      }
    }
  }

  return true;
};
