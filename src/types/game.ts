export type SandTileType = '🦀' | '🌴' | '⭐' | '🌺' | '🐚';
export type SeaTileType = '🐙' | '🦐' | '🐠' | '🎣';
export type TileType = SandTileType | SeaTileType;

// Single source of truth for tile emojis
export const SAND_TILE_EMOJIS: SandTileType[] = ['🦀', '🌴', '⭐', '🌺', '🐚'];
export const SEA_TILE_EMOJIS: SeaTileType[] = ['🐙', '🦐', '🐠', '🎣'];

// Helper function to get tile emojis by variant
export const getTileEmojis = (variant: 'sand' | 'sea'): TileType[] => {
  return variant === 'sand' ? SAND_TILE_EMOJIS : SEA_TILE_EMOJIS;
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
