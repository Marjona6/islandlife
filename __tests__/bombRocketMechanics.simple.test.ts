import {
  detectBombTrigger,
  detectRocketTrigger,
  getBombExplosionTiles,
  getRocketExplosionTiles,
  processTurn,
} from '../src/utils/gameLogic';
import {Tile} from '../src/types/game';

// Accepts an array of 8 strings, each 8 emojis long
function createBoardFromRows(rows: string[]): Tile[][] {
  const board: Tile[][] = [];
  const SIZE = 8;
  for (let y = 0; y < SIZE; y++) {
    board[y] = [];
    for (let x = 0; x < SIZE; x++) {
      // Default to 🦀 if not provided
      let ch = '🦀';
      if (y < rows.length) {
        // Use Array.from to properly split emojis into individual characters
        const rowChars = Array.from(rows[y]);
        if (x < rowChars.length) {
          ch = rowChars[x];
        }
      }
      board[y][x] = {
        id: `${y}-${x}`,
        type: ch as any,
        row: y,
        col: x,
      };
    }
  }
  return board;
}

interface SwapResult {
  newBoard: Tile[][];
  wasBombTriggered: boolean;
  bombExplosionTiles?: {x: number; y: number}[];
  wasRocketTriggered: boolean;
  rocketExplosionTiles?: {x: number; y: number}[];
  cascadeMatches: Array<Array<{x: number; y: number}>>;
}

function simulateUserSwap(
  board: Tile[][],
  from: {x: number; y: number},
  to: {x: number; y: number},
): SwapResult {
  // Use detection helpers for the initial swap
  const wasBombTriggered = detectBombTrigger(board, from.y, from.x, to.y, to.x);
  let bombExplosionTiles;
  if (wasBombTriggered) {
    bombExplosionTiles = getBombExplosionTiles(to.y, to.x).map(
      ({row, col}) => ({x: col, y: row}),
    );
  }
  const rocketResult = detectRocketTrigger(board, from.y, from.x, to.y, to.x);
  let rocketExplosionTiles;
  if (rocketResult.triggered) {
    rocketExplosionTiles = getRocketExplosionTiles(
      to.y,
      to.x,
      rocketResult.isHorizontal,
    ).map(({row, col}) => ({x: col, y: row}));
  }

  // Actually perform the swap and process the turn
  const result = processTurn(board, 'sand', [], {
    row1: from.y,
    col1: from.x,
    row2: to.y,
    col2: to.x,
  });

  return {
    newBoard: result.newBoard,
    wasBombTriggered,
    bombExplosionTiles,
    wasRocketTriggered: rocketResult.triggered,
    rocketExplosionTiles,
    cascadeMatches: result.matches
      .slice(1)
      .map(match => match.map(({row, col}) => ({x: col, y: row}))), // All matches after the first one are cascades
  };
}

describe('Bomb and Rocket Mechanics (Simple)', () => {
  it('🔍 DEBUG: Simple rocket test', () => {
    // 8x8 board, row 0: 🐚🐚🐚🦀🐚🦀🦀🦀
    // Swap (3,0) with (4,0) to create 4 🐚 in a row at positions 0-3
    const board = createBoardFromRows([
      '🐚🐚🐚🦀🐚🦀🦀🦀',
      '🌺🌺🌺🦀🦀🦀🦀🦀',
      '⭐⭐⭐🦀🦀🦀🦀🦀',
      '🦀🦀🦀🦀🦀🦀🦀🦀',
      '🌴🌴🌴🌴🌴🌴🌴🌴',
      '🐚🐚🐚🐚🐚🐚🐚🐚',
      '🌺🌺🌺🌺🌺🌺🌺🌺',
      '⭐⭐⭐⭐⭐⭐⭐⭐',
    ]);

    console.log(
      'Before swap - Row 0:',
      board[0].map(tile => tile.type),
    );

    // Swap (3,0) with (4,0) to create 4 🐚 in a row at positions 0-3
    const result = simulateUserSwap(board, {x: 3, y: 0}, {x: 4, y: 0});

    console.log(
      'After swap - Row 0:',
      result.newBoard[0].map(tile => tile.type),
    );
    console.log('Simple rocket test result:', result.wasRocketTriggered);
    expect(result.wasRocketTriggered).toBe(true);
  });

  it('🚀 triggers horizontal rocket and correct explosion area', () => {
    // Set up a board where swapping creates a horizontal match of 4 🐚 at row 2
    // Row 2: 🦀��🐚🐚🐚⭐🌴🦀, swap (1,2) with (4,2) to create four 🐚 in a row at positions 1-4
    const board = createBoardFromRows([
      '🦀🌴⭐🌺🐚🦀🌴⭐',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '🦀🐚🐚🐚🐚⭐🌴🦀', // row 2
      '🌴⭐🌺🐚🦀🌴⭐🌺',
      '🐚🦀🌴⭐🌺🐚🦀🌴',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '⭐🌺🐚🦀🌴⭐🌺🐚',
      '🌴⭐🌺🐚🦀🌴⭐🌺',
    ]);
    // Print row 2 before swap
    console.log(
      'Row 2 before swap:',
      board[2].map(tile => tile.type),
    );
    // User swaps (1,2) with (4,2) to create 4 🐚 in a row at positions 1-4
    const result = simulateUserSwap(board, {x: 1, y: 2}, {x: 4, y: 2});
    // Print row 2 after swap
    console.log(
      'Row 2 after swap:',
      result.newBoard[2].map(tile => tile.type),
    );
    expect(result.wasRocketTriggered).toBe(true);
    // Should explode the entire column (col 4)
    expect(result.rocketExplosionTiles).toEqual([
      {x: 4, y: 0},
      {x: 4, y: 1},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 4},
      {x: 4, y: 5},
      {x: 4, y: 6},
      {x: 4, y: 7},
    ]);
    expect(result.wasBombTriggered).toBe(false);
  });

  it('🚀 triggers vertical rocket and correct explosion area', () => {
    // Set up a board where swapping creates a vertical match of 4 🦀 at col 2
    // Column 2: 🦀, 🦀, 🦀, 🌺, 🦀, so swap (2,3) with (2,4) to get four 🦀 in a column at col 2, rows 1-4
    const board = createBoardFromRows([
      '🦀🌴🦀🌺🐚🦀🌴⭐',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '⭐🌺🦀🐚🌴⭐🌺🐚',
      '🌴⭐🦀🌺🦀🌴⭐🌺', // (2,3) is 🌺, (2,4) is 🦀
      '🐚🦀🦀⭐🌺🐚🦀🌴',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '⭐🌺🐚🦀🌴⭐🌺🐚',
      '🌴⭐🌺🐚🦀🌴⭐🌺',
    ]);
    // User swaps (2,3) with (2,4) to create 4 🦀 in a column at col 2, rows 1-4
    const result = simulateUserSwap(board, {x: 2, y: 3}, {x: 2, y: 4});
    expect(result.wasRocketTriggered).toBe(true);
    // Should explode the entire row (row 4)
    expect(result.rocketExplosionTiles).toEqual([
      {x: 0, y: 4},
      {x: 1, y: 4},
      {x: 2, y: 4},
      {x: 3, y: 4},
      {x: 4, y: 4},
      {x: 5, y: 4},
      {x: 6, y: 4},
      {x: 7, y: 4},
    ]);
    expect(result.wasBombTriggered).toBe(false);
  });

  it('❌ falling match of 4 does NOT trigger rocket', () => {
    const board = createBoardFromRows([
      '🦀🌴⭐🌺🐚🦀🌴⭐',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '⭐🌺🐚🌺🌴🐚🌺🐚',
      '🌴⭐🌺⭐🌴🌴⭐🌺', // row 3: 🌺 at (3,3), ⭐ at (3,4)
      '🐚🦀🌺⭐🌺🌺🦀🌴',
      '🌺🐚🦀🌴🌴🌺🐚🦀',
      '🐚🦀🌴⭐🌺🐚🦀🌴',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
    ]);
    // User swaps (2,5) with (3,5)
    const result = simulateUserSwap(board, {x: 5, y: 2}, {x: 5, y: 3});
    // The falling match of 4 🐚 should NOT trigger a rocket
    expect(result.wasRocketTriggered).toBe(false);
    expect(result.wasBombTriggered).toBe(false);
    // Check that no cascade match has exactly 4 tiles (rocket pattern)
    const hasRocketCascade = result.cascadeMatches.some(
      match => match.length === 4,
    );
    expect(hasRocketCascade).toBe(false);
  });

  it('❌ falling T/L match does NOT trigger bomb', () => {
    const board = createBoardFromRows([
      '🦀🌴⭐🌺🐚🦀🌴⭐',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '🦀🌴🦀🌺🦀⭐🌴🦀',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
      '🦀🌴🦀🌺🦀⭐🌴🦀',
      '🌴⭐🌺🐚🦀🌴⭐🌺',
      '🐚🦀🌴⭐🌺🐚🦀🌴',
      '🌺🐚🦀🌴⭐🌺🐚🦀',
    ]);
    // User swaps (3,5) with (4,5)
    const result = simulateUserSwap(board, {x: 5, y: 3}, {x: 5, y: 4});
    // The falling T/L match should NOT trigger a bomb
    expect(result.wasBombTriggered).toBe(false);
    expect(result.wasRocketTriggered).toBe(false);
    // Check that no cascade match has 25 tiles (5x5 bomb explosion)
    const hasBombCascade = result.cascadeMatches.some(
      match => match.length === 25,
    );
    expect(hasBombCascade).toBe(false);
  });
});

// board for testing user swap to create a bomb
//    const board = createBoardFromRows([
//      '🦀🌴⭐🌺🐚🦀🌴⭐',
//      '🌺🐚🦀🌴🌴🌺🐚🦀',
//      '🦀🌴🦀⭐⭐🐚🌴🦀',
//      '🌺🐚🌴🌺⭐⭐🐚🐚',
//      '🦀🌴🦀🌺🦀🐚🌴🦀',
//      '🌴⭐🌺🐚🦀🐚⭐🌺',
//      '🐚🦀🌴⭐🌺🦀🦀🌴',
//      '🌺🐚🦀🌴⭐🌺🐚🦀',
//    ]);
