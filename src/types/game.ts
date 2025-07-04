// Single source of truth for tile emojis
export const SAND_TILE_EMOJIS = ['🦀', '🌴', '⭐', '🌺', '🐚'] as const;
export const SEA_TILE_EMOJIS = ['🦑', '🦐', '🐡', '🪝'] as const; // 🦈🐟🐠🐡🎣

// Type definitions derived from the constants
export type SandTileType = (typeof SAND_TILE_EMOJIS)[number];
export type SeaTileType = (typeof SEA_TILE_EMOJIS)[number];
export type TileType = SandTileType | SeaTileType;

// Helper function to get tile emojis by variant
export const getTileEmojis = (variant: 'sand' | 'sea'): TileType[] => {
  return (
    variant === 'sand' ? [...SAND_TILE_EMOJIS] : [...SEA_TILE_EMOJIS]
  ) as TileType[];
};

export interface Tile {
  id: string;
  type: TileType;
  row: number;
  col: number;
}

export interface GameState {
  board: Tile[][];
  score: number;
  combos: number;
  targetCombos: number;
  isGameWon: boolean;
  isGameOver: boolean;
  sandBlockers: Array<{row: number; col: number}>;
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
