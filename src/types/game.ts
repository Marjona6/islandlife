// Single source of truth for tile emojis
export const SAND_TILE_EMOJIS = ['🦀', '🌴', '⭐', '🌺', '🐚'] as const;
export const SEA_TILE_EMOJIS = ['🦑', '🦐', '🐡', '🪝', '🐠'] as const; // 🦈🐟🐠🐡🎣
export const SPECIAL_TILE_EMOJIS = ['🥥'] as const; // Coconut is a special tile
export const TREASURE_TILE_EMOJIS = ['💎', '🪙', '🏺', '💍'] as const; // Treasure tiles
export const SAND_BLOCKER_EMOJI = '🏖️' as const; // Sand blocker tile

// Type definitions derived from the constants
export type SandTileType = (typeof SAND_TILE_EMOJIS)[number];
export type SeaTileType = (typeof SEA_TILE_EMOJIS)[number];
export type SpecialTileType = (typeof SPECIAL_TILE_EMOJIS)[number];
export type TreasureTileType = (typeof TREASURE_TILE_EMOJIS)[number];
export type TileType =
  | SandTileType
  | SeaTileType
  | SpecialTileType
  | TreasureTileType;

// Helper function to get tile emojis by variant
export const getTileEmojis = (variant: 'sand' | 'sea'): TileType[] => {
  return (
    variant === 'sand' ? [...SAND_TILE_EMOJIS] : [...SEA_TILE_EMOJIS]
  ) as TileType[];
};

// Helper function to check if a tile is special
export const isSpecialTile = (type: TileType): boolean => {
  return (SPECIAL_TILE_EMOJIS as readonly string[]).includes(type);
};

// Helper function to check if a tile is treasure
export const isTreasureTile = (type: TileType): boolean => {
  return (TREASURE_TILE_EMOJIS as readonly string[]).includes(type);
};

export interface Tile {
  id: string;
  type: TileType;
  row: number;
  col: number;
  isSpecial?: boolean; // Flag to identify special tiles like coconuts
  isTreasure?: boolean; // Flag to identify treasure tiles
  sandLevel?: number; // Number of sand layers (1 or 2)
  hasTreasure?: boolean; // Flag for sand tiles that conceal treasure
}

export interface GameState {
  board: Tile[][];
  score: number;
  combos: number;
  targetCombos: number;
  isGameWon: boolean;
  isGameOver: boolean;
  sandBlockers: Array<{
    row: number;
    col: number;
    hasUmbrella: boolean;
    sandLevel?: number;
    hasTreasure?: boolean;
  }>;
  treasureCollected: number; // Track collected treasure
  totalTreasure: number; // Total treasure to collect
  collectedTiles: number; // Track collected tiles for current level
}

export interface Currency {
  shells: number;
  keys: number;
}

export interface BeachItem {
  id: string;
  name: string;
  cost: number;
  isPurchased: boolean;
  icon: string;
}
