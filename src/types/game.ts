export type TileType = '🌴' | '🐚' | '🌺' | '🐠' | '⭐';

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
