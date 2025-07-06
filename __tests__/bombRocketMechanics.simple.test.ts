import {
  detectBombTrigger,
  detectRocketTrigger,
  getBombExplosionTiles,
  getRocketExplosionTiles,
  processTurn,
} from '../src/utils/gameLogic';
import {Tile} from '../src/types/game';

function createBoardFromRows(rows: string[]): Tile[][] {
  const board: Tile[][] = [];
  const SIZE = 8;
  for (let y = 0; y < SIZE; y++) {
    board[y] = [];
    for (let x = 0; x < SIZE; x++) {
      let ch = '.';
      if (y < rows.length && x < rows[y].length) {
        ch = rows[y][x];
      }
      board[y][x] = {
        id: `${y}-${x}`,
        type: ch === '.' ? '🌴' : '🐚', // Use '🐚' for S, '.' for filler
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
}

function simulateUserSwap(
  board: Tile[][],
  from: {x: number; y: number},
  to: {x: number; y: number},
): SwapResult {
  // Use detection helpers
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
  };
}

describe('Bomb and Rocket Mechanics (Simple)', () => {
  it('💣 triggers bomb and correct explosion area', () => {
    const board = createBoardFromRows([
      '..S..',
      '..S..',
      'SS.SS',
      '.....',
      '.....',
    ]);
    // User swaps (2,3) to (2,2)
    const result = simulateUserSwap(board, {x: 3, y: 2}, {x: 2, y: 2});
    expect(result.wasBombTriggered).toBe(true);
    expect(result.bombExplosionTiles).toHaveLength(25);
    // Should include all tiles in 5x5 centered at (2,2)
    expect(result.bombExplosionTiles).toContainEqual({x: 0, y: 0});
    expect(result.bombExplosionTiles).toContainEqual({x: 4, y: 4});
    expect(result.wasRocketTriggered).toBe(false);
  });

  it('🚀 triggers horizontal rocket and correct explosion area', () => {
    const board = createBoardFromRows([
      '.....',
      '...S.',
      'SS.S.',
      '.....',
      '.....',
    ]);
    // User swaps (1,3) to (2,3)
    const result = simulateUserSwap(board, {x: 3, y: 1}, {x: 3, y: 2});
    expect(result.wasRocketTriggered).toBe(true);
    expect(result.rocketExplosionTiles).toEqual([
      {x: 3, y: 0},
      {x: 3, y: 1},
      {x: 3, y: 2},
      {x: 3, y: 3},
      {x: 3, y: 4},
    ]);
    expect(result.wasBombTriggered).toBe(false);
  });

  it('🚀 triggers vertical rocket and correct explosion area', () => {
    const board = createBoardFromRows([
      '..S..',
      '..S..',
      '..S..',
      '..S..',
      '.....',
    ]);
    // User swaps (3,2) to (4,2)
    const result = simulateUserSwap(board, {x: 2, y: 3}, {x: 2, y: 4});
    expect(result.wasRocketTriggered).toBe(true);
    expect(result.rocketExplosionTiles).toEqual([
      {x: 0, y: 4},
      {x: 1, y: 4},
      {x: 2, y: 4},
      {x: 3, y: 4},
      {x: 4, y: 4},
    ]);
    expect(result.wasBombTriggered).toBe(false);
  });

  it('❌ falling match does NOT trigger bomb or rocket', () => {
    const board = createBoardFromRows([
      '.....',
      '.....',
      'SSSSS',
      '.....',
      '.....',
    ]);
    // No user swap, just process falling
    const result = processTurn(board);
    // Should not have any bomb or rocket matches
    expect(result.matches.some(m => m.length === 25)).toBe(false);
    expect(result.matches.some(m => m.length === 5)).toBe(false);
  });
});
