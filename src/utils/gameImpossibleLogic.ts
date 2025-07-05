import {getValidMoves} from './gameLogic';
import {Tile as GameTile} from '../types/game';

/**
 * Check if the game is impossible (no valid moves available)
 * @param board The current game board
 * @returns true if no valid moves exist, false otherwise
 */
export const checkIfGameImpossible = (board: GameTile[][]): boolean => {
  const validMoves = getValidMoves(board);
  return !validMoves || validMoves.length === 0;
};

/**
 * Rearrange the board randomly while preserving sand blocker positions
 * @param board The current game board
 * @param sandBlockers Array of sand blocker positions
 * @returns A new board with shuffled tiles but sand blockers in the same positions
 */
export const rearrangeBoard = (
  board: GameTile[][],
  sandBlockers: Array<{row: number; col: number}>,
): GameTile[][] => {
  console.log('Game is impossible - rearranging board...');

  // Collect all non-sand-blocker tiles
  const tiles: GameTile[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isSandBlocker = sandBlockers.some(
        b => b.row === row && b.col === col,
      );
      if (!isSandBlocker && board[row][col]) {
        tiles.push(board[row][col]);
      }
    }
  }

  // Shuffle the tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Create new board with shuffled tiles
  const newBoard: GameTile[][] = [];
  let tileIndex = 0;

  for (let row = 0; row < 8; row++) {
    newBoard[row] = [];
    for (let col = 0; col < 8; col++) {
      const isSandBlocker = sandBlockers.some(
        b => b.row === row && b.col === col,
      );
      if (isSandBlocker) {
        newBoard[row][col] = null as any;
      } else {
        newBoard[row][col] =
          tileIndex < tiles.length ? tiles[tileIndex++] : (null as any);
      }
    }
  }

  return newBoard;
};
