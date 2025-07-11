import { Tile as GameTile } from '../types/game';
import { isValidMove } from './gameLogic';

/**
 * Check if the game is impossible (no valid moves available)
 * @param board The current game board
 * @param sandBlockers Array of sand blocker positions
 * @returns true if no valid moves exist, false otherwise
 */
export const checkIfGameImpossible = (
  board: GameTile[][],
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }> = [],
): boolean => {
  const validMoves = getValidMovesWithBlockers(board, sandBlockers);
  console.log('=== VALID MOVES CHECK ===');
  console.log('Valid moves found:', validMoves.length);
  if (validMoves.length > 0) {
    console.log('Sample valid moves:', validMoves.slice(0, 3));
  }
  console.log('=== END VALID MOVES CHECK ===');
  return !validMoves || validMoves.length === 0;
};

/**
 * Get all valid moves on the current board, considering sand blockers
 * @param board The current game board
 * @param sandBlockers Array of sand blocker positions
 * @returns Array of valid moves
 */
const getValidMovesWithBlockers = (
  board: GameTile[][],
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }>,
): Array<{ row1: number; col1: number; row2: number; col2: number }> => {
  const validMoves: Array<{
    row1: number;
    col1: number;
    row2: number;
    col2: number;
  }> = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Check if current position is a sand blocker
      const isCurrentSandBlocker = sandBlockers.some(
        b => b.row === row && b.col === col,
      );

      if (isCurrentSandBlocker) {
        continue; // Skip sand blocker positions
      }

      // Check right neighbor
      if (col < 7) {
        const isRightSandBlocker = sandBlockers.some(
          b => b.row === row && b.col === col + 1,
        );

        if (!isRightSandBlocker && isValidMove(board, row, col, row, col + 1)) {
          validMoves.push({ row1: row, col1: col, row2: row, col2: col + 1 });
        }
      }

      // Check bottom neighbor
      if (row < 7) {
        const isBottomSandBlocker = sandBlockers.some(
          b => b.row === row + 1 && b.col === col,
        );

        if (
          !isBottomSandBlocker &&
          isValidMove(board, row, col, row + 1, col)
        ) {
          validMoves.push({ row1: row, col1: col, row2: row + 1, col2: col });
        }
      }
    }
  }

  return validMoves;
};

/**
 * Rearrange the board randomly while preserving sand blocker positions and special tiles
 * @param board The current game board
 * @param sandBlockers Array of sand blocker positions
 * @returns A new board with shuffled tiles but sand blockers and special tiles in the same positions
 */
export const rearrangeBoard = (
  board: GameTile[][],
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }>,
): GameTile[][] => {
  console.log('Game is impossible - rearranging board...');

  // Import findMatches here to avoid circular dependency
  const { findMatches } = require('./gameLogic');

  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops

  while (attempts < maxAttempts) {
    attempts++;

    // Collect all regular (non-special, non-sand-blocker) tiles
    const tiles: GameTile[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isSandBlocker = sandBlockers.some(
          b => b.row === row && b.col === col,
        );
        const tile = board[row][col];
        const isSpecialTile = tile && tile.isSpecial;

        // Only collect regular tiles (not sand blockers, not special tiles)
        if (!isSandBlocker && tile && !isSpecialTile) {
          tiles.push(tile);
        }
      }
    }

    // Shuffle the tiles
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Create new board with shuffled tiles, preserving sand blockers and special tiles
    const newBoard: GameTile[][] = [];
    let tileIndex = 0;

    for (let row = 0; row < 8; row++) {
      newBoard[row] = [];
      for (let col = 0; col < 8; col++) {
        const isSandBlocker = sandBlockers.some(
          b => b.row === row && b.col === col,
        );
        const originalTile = board[row][col];
        const isSpecialTile = originalTile && originalTile.isSpecial;

        if (isSandBlocker) {
          // Preserve sand blocker position
          newBoard[row][col] = null as any;
        } else if (isSpecialTile) {
          // Preserve special tiles (like coconuts) in their original positions
          newBoard[row][col] = originalTile;
        } else {
          // Place shuffled regular tiles
          newBoard[row][col] =
            tileIndex < tiles.length ? tiles[tileIndex++] : (null as any);
        }
      }
    }

    // Check if the new board has any matches
    const matches = findMatches(newBoard);
    if (matches.length === 0) {
      console.log(`Board rearranged successfully after ${attempts} attempts`);
      return newBoard;
    }

    console.log(
      `Attempt ${attempts}: Board still has ${matches.length} matches, trying again...`,
    );
  }

  console.warn(
    `Failed to create valid board after ${maxAttempts} attempts, returning original board`,
  );
  return board;
};
