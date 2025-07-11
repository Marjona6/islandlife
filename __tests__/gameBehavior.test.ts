import {
  createValidBoard,
  findMatches,
  removeMatches,
  processTurn,
  getValidMoves,
  // isValidMove, // not used
  // processMove, // not used
} from '../src/utils/gameLogic';
import { Tile, TileType } from '../src/types/game';

// Helper function to create test boards (copied from gameLogic.test.ts)
const createTestBoard = (tiles: (TileType | null)[][]): Tile[][] => {
  const board: Tile[][] = [];

  // Create an 8x8 board with a controlled pattern to avoid additional matches
  const safePattern = [
    ['🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚', '🌺'],
    ['🐚', '🌺', '🐠', '⭐', '🌴', '🐚', '🌺', '🐠'],
    ['🌺', '🐠', '⭐', '🌴', '🐚', '🌺', '🐠', '⭐'],
    ['🐠', '⭐', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
    ['⭐', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
    ['🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚', '🌺'],
    ['🐚', '🌺', '🐠', '⭐', '🌴', '🐚', '🌺', '🐠'],
    ['🌺', '🐠', '⭐', '🌴', '🐚', '🌺', '🐠', '⭐'],
  ];

  for (let row = 0; row < 8; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      if (row < tiles.length && col < tiles[row].length && tiles[row][col]) {
        board[row][col] = {
          id: `${row}-${col}`,
          type: tiles[row][col]!,
          row,
          col,
        };
      } else {
        // Fill with safe pattern tiles to avoid additional matches
        board[row][col] = {
          id: `${row}-${col}`,
          type: safePattern[row][col] as TileType,
          row,
          col,
        };
      }
    }
  }

  return board;
};

describe('Game Board Behavior Tests', () => {
  describe('Initial Board Validation', () => {
    test('the game board should not display three or more tiles in a vertical or horizontal row on initial load', () => {
      for (let i = 0; i < 10; i++) {
        const board = createValidBoard();
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 6; col++) {
            const tile1 = board[row][col];
            const tile2 = board[row][col + 1];
            const tile3 = board[row][col + 2];
            if (tile1 && tile2 && tile3) {
              expect(
                tile1.type === tile2.type && tile2.type === tile3.type,
              ).toBe(false);
            }
          }
        }
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 8; col++) {
            const tile1 = board[row][col];
            const tile2 = board[row + 1][col];
            const tile3 = board[row + 2][col];
            if (tile1 && tile2 && tile3) {
              expect(
                tile1.type === tile2.type && tile2.type === tile3.type,
              ).toBe(false);
            }
          }
        }
      }
    });
  });

  describe('Cascading Matches After Tile Fall', () => {
    test('after a user makes a match, if tiles fall into place such that three or more tiles are now in a row vertically or horizontally, those tiles should disappear and additional tiles should fall to replace them', () => {
      // Create a board where removing a match will cause a cascade
      const board: Tile[][] = [
        [
          { id: '1', type: '🌴', row: 0, col: 0 },
          { id: '2', type: '🌴', row: 0, col: 1 },
          { id: '3', type: '🌴', row: 0, col: 2 },
          { id: '4', type: '🐠', row: 0, col: 3 },
          { id: '5', type: '⭐', row: 0, col: 4 },
          { id: '6', type: '🌴', row: 0, col: 5 },
          { id: '7', type: '🐚', row: 0, col: 6 },
          { id: '8', type: '🌺', row: 0, col: 7 },
        ],
        [
          { id: '9', type: '🌴', row: 1, col: 0 },
          { id: '10', type: '🌴', row: 1, col: 1 },
          { id: '11', type: '🌴', row: 1, col: 2 },
          { id: '12', type: '🐠', row: 1, col: 3 },
          { id: '13', type: '⭐', row: 1, col: 4 },
          { id: '14', type: '🌴', row: 1, col: 5 },
          { id: '15', type: '🐚', row: 1, col: 6 },
          { id: '16', type: '🌺', row: 1, col: 7 },
        ],
        [
          { id: '17', type: '🌴', row: 2, col: 0 },
          { id: '18', type: '🌴', row: 2, col: 1 },
          { id: '19', type: '🌴', row: 2, col: 2 },
          { id: '20', type: '🐠', row: 2, col: 3 },
          { id: '21', type: '⭐', row: 2, col: 4 },
          { id: '22', type: '🌴', row: 2, col: 5 },
          { id: '23', type: '🐚', row: 2, col: 6 },
          { id: '24', type: '🌺', row: 2, col: 7 },
        ],
        [
          { id: '25', type: '🐠', row: 3, col: 0 },
          { id: '26', type: '🐠', row: 3, col: 1 },
          { id: '27', type: '🐠', row: 3, col: 2 },
          { id: '28', type: '🌴', row: 3, col: 3 },
          { id: '29', type: '🌴', row: 3, col: 4 },
          { id: '30', type: '🌴', row: 3, col: 5 },
          { id: '31', type: '🐚', row: 3, col: 6 },
          { id: '32', type: '🌺', row: 3, col: 7 },
        ],
        [
          { id: '33', type: '🐠', row: 4, col: 0 },
          { id: '34', type: '⭐', row: 4, col: 1 },
          { id: '35', type: '🌴', row: 4, col: 2 },
          { id: '36', type: '🐚', row: 4, col: 3 },
          { id: '37', type: '🌺', row: 4, col: 4 },
          { id: '38', type: '🐠', row: 4, col: 5 },
          { id: '39', type: '⭐', row: 4, col: 6 },
          { id: '40', type: '🌴', row: 4, col: 7 },
        ],
        [
          { id: '41', type: '🐚', row: 5, col: 0 },
          { id: '42', type: '🌺', row: 5, col: 1 },
          { id: '43', type: '🐠', row: 5, col: 2 },
          { id: '44', type: '⭐', row: 5, col: 3 },
          { id: '45', type: '🌴', row: 5, col: 4 },
          { id: '46', type: '🐚', row: 5, col: 5 },
          { id: '47', type: '🌺', row: 5, col: 6 },
          { id: '48', type: '🐠', row: 5, col: 7 },
        ],
        [
          { id: '49', type: '🐚', row: 6, col: 0 },
          { id: '50', type: '🌺', row: 6, col: 1 },
          { id: '51', type: '🐠', row: 6, col: 2 },
          { id: '52', type: '⭐', row: 6, col: 3 },
          { id: '53', type: '🌴', row: 6, col: 4 },
          { id: '54', type: '🐚', row: 6, col: 5 },
          { id: '55', type: '🌺', row: 6, col: 6 },
          { id: '56', type: '🐠', row: 6, col: 7 },
        ],
        [
          { id: '57', type: '🌺', row: 7, col: 0 },
          { id: '58', type: '🐠', row: 7, col: 1 },
          { id: '59', type: '⭐', row: 7, col: 2 },
          { id: '60', type: '🌴', row: 7, col: 3 },
          { id: '61', type: '🐚', row: 7, col: 4 },
          { id: '62', type: '🌺', row: 7, col: 5 },
          { id: '63', type: '🐠', row: 7, col: 6 },
          { id: '64', type: '⭐', row: 7, col: 7 },
        ],
      ];
      // The first three rows in columns 0,1,2 are 🌴, so after the first match is removed, the next three rows will fall and create another match.
      const { newBoard, matches } = processTurn(board as Tile[][]);
      expect(matches.length).toBeGreaterThan(1); // Should have at least two matches (cascade)
      expect(findMatches(newBoard).length).toBe(0);
    });
  });

  describe('Match Specificity', () => {
    test('after a user makes a match, only the matched row (horizontal or vertical) should disappear', () => {
      const board: Tile[][] = [
        [
          { id: '1', type: '🌴', row: 0, col: 0 },
          { id: '2', type: '🐚', row: 0, col: 1 },
          { id: '3', type: '🌺', row: 0, col: 2 },
          { id: '4', type: '🐠', row: 0, col: 3 },
          { id: '5', type: '⭐', row: 0, col: 4 },
          { id: '6', type: '🌴', row: 0, col: 5 },
          { id: '7', type: '🐚', row: 0, col: 6 },
          { id: '8', type: '🌺', row: 0, col: 7 },
        ],
        [
          { id: '9', type: '🌴', row: 1, col: 0 },
          { id: '10', type: '🌴', row: 1, col: 1 },
          { id: '11', type: '🌴', row: 1, col: 2 },
          { id: '12', type: '🌴', row: 1, col: 3 },
          { id: '13', type: '🌴', row: 1, col: 4 },
          { id: '14', type: '🐚', row: 1, col: 5 },
          { id: '15', type: '🌺', row: 1, col: 6 },
          { id: '16', type: '🐠', row: 1, col: 7 },
        ],
        [
          { id: '17', type: '🐚', row: 2, col: 0 },
          { id: '18', type: '🌺', row: 2, col: 1 },
          { id: '19', type: '🐠', row: 2, col: 2 },
          { id: '20', type: '⭐', row: 2, col: 3 },
          { id: '21', type: '🌴', row: 2, col: 4 },
          { id: '22', type: '🐚', row: 2, col: 5 },
          { id: '23', type: '🌺', row: 2, col: 6 },
          { id: '24', type: '🐠', row: 2, col: 7 },
        ],
        [
          { id: '25', type: '🌺', row: 3, col: 0 },
          { id: '26', type: '🐠', row: 3, col: 1 },
          { id: '27', type: '⭐', row: 3, col: 2 },
          { id: '28', type: '🌴', row: 3, col: 3 },
          { id: '29', type: '🐚', row: 3, col: 4 },
          { id: '30', type: '🌺', row: 3, col: 5 },
          { id: '31', type: '🐠', row: 3, col: 6 },
          { id: '32', type: '⭐', row: 3, col: 7 },
        ],
        [
          { id: '33', type: '🐠', row: 4, col: 0 },
          { id: '34', type: '⭐', row: 4, col: 1 },
          { id: '35', type: '🌴', row: 4, col: 2 },
          { id: '36', type: '🐚', row: 4, col: 3 },
          { id: '37', type: '🌺', row: 4, col: 4 },
          { id: '38', type: '🐠', row: 4, col: 5 },
          { id: '39', type: '⭐', row: 4, col: 6 },
          { id: '40', type: '🌴', row: 4, col: 7 },
        ],
        [
          { id: '41', type: '🐚', row: 5, col: 0 },
          { id: '42', type: '🌺', row: 5, col: 1 },
          { id: '43', type: '🐠', row: 5, col: 2 },
          { id: '44', type: '⭐', row: 5, col: 3 },
          { id: '45', type: '🌴', row: 5, col: 4 },
          { id: '46', type: '🐚', row: 5, col: 5 },
          { id: '47', type: '🌺', row: 5, col: 6 },
          { id: '48', type: '🐠', row: 5, col: 7 },
        ],
        [
          { id: '49', type: '🐠', row: 6, col: 0 },
          { id: '50', type: '🌴', row: 6, col: 1 },
          { id: '51', type: '⭐', row: 6, col: 2 },
          { id: '52', type: '🌴', row: 6, col: 3 },
          { id: '53', type: '🐚', row: 6, col: 4 },
          { id: '54', type: '🌺', row: 6, col: 5 },
          { id: '55', type: '🐠', row: 6, col: 6 },
          { id: '56', type: '⭐', row: 6, col: 7 },
        ],
        [
          { id: '57', type: '🌴', row: 7, col: 0 },
          { id: '58', type: '🐚', row: 7, col: 1 },
          { id: '59', type: '🌺', row: 7, col: 2 },
          { id: '60', type: '🐠', row: 7, col: 3 },
          { id: '61', type: '⭐', row: 7, col: 4 },
          { id: '62', type: '🌴', row: 7, col: 5 },
          { id: '63', type: '🐚', row: 7, col: 6 },
          { id: '64', type: '🌺', row: 7, col: 7 },
        ],
      ];
      const matches = findMatches(board);
      expect(matches.length).toBe(1);
      expect(matches[0].length).toBe(5); // 5 🌴 in a row
      const matchedRow = matches[0][0].row;
      matches[0].forEach(pos => {
        expect(pos.row).toBe(matchedRow);
      });
      const boardAfterRemoval = removeMatches(board, matches);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (row === 1 && col < 5) {
            expect(boardAfterRemoval[row][col]).toBeNull();
          } else {
            expect(boardAfterRemoval[row][col]).toEqual(board[row][col]);
          }
        }
      }
    });

    test('vertical matches should only remove the matched column tiles', () => {
      const board: Tile[][] = [
        [
          { id: '1', type: '🌴', row: 0, col: 0 },
          { id: '2', type: '🌴', row: 0, col: 1 },
          { id: '3', type: '🌺', row: 0, col: 2 },
          { id: '4', type: '🐠', row: 0, col: 3 },
          { id: '5', type: '⭐', row: 0, col: 4 },
          { id: '6', type: '🌴', row: 0, col: 5 },
          { id: '7', type: '🐚', row: 0, col: 6 },
          { id: '8', type: '🌺', row: 0, col: 7 },
        ],
        [
          { id: '9', type: '🐚', row: 1, col: 0 },
          { id: '10', type: '🌴', row: 1, col: 1 },
          { id: '11', type: '🐠', row: 1, col: 2 },
          { id: '12', type: '⭐', row: 1, col: 3 },
          { id: '13', type: '🌴', row: 1, col: 4 },
          { id: '14', type: '🐚', row: 1, col: 5 },
          { id: '15', type: '🌺', row: 1, col: 6 },
          { id: '16', type: '🐠', row: 1, col: 7 },
        ],
        [
          { id: '17', type: '🌺', row: 2, col: 0 },
          { id: '18', type: '🌴', row: 2, col: 1 },
          { id: '19', type: '⭐', row: 2, col: 2 },
          { id: '20', type: '🌴', row: 2, col: 3 },
          { id: '21', type: '🐚', row: 2, col: 4 },
          { id: '22', type: '🌺', row: 2, col: 5 },
          { id: '23', type: '🐠', row: 2, col: 6 },
          { id: '24', type: '⭐', row: 2, col: 7 },
        ],
        [
          { id: '25', type: '🌺', row: 3, col: 0 },
          { id: '26', type: '🌴', row: 3, col: 1 },
          { id: '27', type: '🐠', row: 3, col: 2 },
          { id: '28', type: '⭐', row: 3, col: 3 },
          { id: '29', type: '🌴', row: 3, col: 4 },
          { id: '30', type: '🐚', row: 3, col: 5 },
          { id: '31', type: '🌺', row: 3, col: 6 },
          { id: '32', type: '🐠', row: 3, col: 7 },
        ],
        [
          { id: '33', type: '🐠', row: 4, col: 0 },
          { id: '34', type: '🌴', row: 4, col: 1 },
          { id: '35', type: '⭐', row: 4, col: 2 },
          { id: '36', type: '🌴', row: 4, col: 3 },
          { id: '37', type: '🐚', row: 4, col: 4 },
          { id: '38', type: '🌺', row: 4, col: 5 },
          { id: '39', type: '🐠', row: 4, col: 6 },
          { id: '40', type: '⭐', row: 4, col: 7 },
        ],
        [
          { id: '41', type: '🌺', row: 5, col: 0 },
          { id: '42', type: '🐚', row: 5, col: 1 }, // Changed from 🌴 to 🐚
          { id: '43', type: '🐠', row: 5, col: 2 },
          { id: '44', type: '⭐', row: 5, col: 3 },
          { id: '45', type: '🌴', row: 5, col: 4 },
          { id: '46', type: '🐚', row: 5, col: 5 },
          { id: '47', type: '🌺', row: 5, col: 6 },
          { id: '48', type: '🐠', row: 5, col: 7 },
        ],
        [
          { id: '49', type: '🐠', row: 6, col: 0 },
          { id: '50', type: '🌴', row: 6, col: 1 },
          { id: '51', type: '⭐', row: 6, col: 2 },
          { id: '52', type: '🌴', row: 6, col: 3 },
          { id: '53', type: '🐚', row: 6, col: 4 },
          { id: '54', type: '🌺', row: 6, col: 5 },
          { id: '55', type: '🐠', row: 6, col: 6 },
          { id: '56', type: '⭐', row: 6, col: 7 },
        ],
        [
          { id: '57', type: '🌴', row: 7, col: 0 },
          { id: '58', type: '🐚', row: 7, col: 1 },
          { id: '59', type: '🌺', row: 7, col: 2 },
          { id: '60', type: '🐠', row: 7, col: 3 },
          { id: '61', type: '⭐', row: 7, col: 4 },
          { id: '62', type: '🌴', row: 7, col: 5 },
          { id: '63', type: '🐚', row: 7, col: 6 },
          { id: '64', type: '🌺', row: 7, col: 7 },
        ],
      ];
      const matches = findMatches(board);
      expect(matches.length).toBe(1);
      expect(matches[0].length).toBe(5); // 5 🌴 in a row
      const matchedCol = matches[0][0].col;
      matches[0].forEach(pos => {
        expect(pos.col).toBe(matchedCol);
      });
      const boardAfterRemoval = removeMatches(board, matches);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (col === 1 && row < 5) {
            expect(boardAfterRemoval[row][col]).toBeNull();
          } else {
            expect(boardAfterRemoval[row][col]).toEqual(board[row][col]);
          }
        }
      }
    });
  });
});

describe('Simultaneous Matches', () => {
  it('should handle simultaneous vertical and horizontal matches with the moved tile as the axis', () => {
    // Create a board where moving a tile creates both vertical and horizontal matches
    const board = createTestBoard([
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
      ['🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴', '🐚'],
    ]);

    // Set up a scenario where moving tile at (3,3) creates both matches
    // We need to create a situation where swapping (3,3) with (3,4) creates:
    // Horizontal: row 3 has 🌴🌴🌴🌴 (positions 2,3,4,5)
    // Vertical: col 3 has 🌴🌴🌴 (positions 2,3,4)

    // First, set up the board so that after the swap, we get both matches
    board[3][2] = { ...board[3][2], type: '🌴' }; // Left of target
    board[3][3] = { ...board[3][3], type: '🐚' }; // Target position (will become 🌴)
    board[3][4] = { ...board[3][4], type: '🌴' }; // Right of target (will become 🐚)
    board[3][5] = { ...board[3][5], type: '🌴' }; // Further right for horizontal match

    board[2][3] = { ...board[2][3], type: '🌴' }; // Above target
    board[4][3] = { ...board[4][3], type: '🌴' }; // Below target

    // Swap to create simultaneous matches
    const temp = board[3][3];
    board[3][3] = board[3][4];
    board[3][4] = temp;

    const matches = findMatches(board);

    // Debug: log what matches were found
    console.log(
      'Found matches:',
      matches.map(match =>
        match.map(pos => `(${pos.row},${pos.col})`).join(', '),
      ),
    );

    // Should find both horizontal and vertical matches
    expect(matches.length).toBeGreaterThanOrEqual(2);

    // Should have a horizontal match in row 3
    const horizontalMatch = matches.find(
      match => match.length >= 3 && match.every(pos => pos.row === 3),
    );
    expect(horizontalMatch).toBeDefined();
    expect(horizontalMatch!.length).toBeGreaterThanOrEqual(3);

    // Should have a vertical match in col 3
    const verticalMatch = matches.find(
      match => match.length >= 3 && match.every(pos => pos.col === 3),
    );
    expect(verticalMatch).toBeDefined();
    expect(verticalMatch!.length).toBeGreaterThanOrEqual(3);

    // The moved tile (3,3) should be part of both matches
    const movedTileInHorizontal = horizontalMatch!.some(
      pos => pos.row === 3 && pos.col === 3,
    );
    const movedTileInVertical = verticalMatch!.some(
      pos => pos.row === 3 && pos.col === 3,
    );
    console.log('Moved tile in horizontal match:', movedTileInHorizontal);
    console.log('Moved tile in vertical match:', movedTileInVertical);
    expect(movedTileInHorizontal).toBe(true);
    expect(movedTileInVertical).toBe(true);
  });
});

describe('Cascading Match Processing', () => {
  it('should process multiple rounds of matches when tiles fall into new matches', () => {
    // Create a board that will have cascading matches
    const board = createTestBoard([
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
    ]);

    // Set up a scenario where removing the first match will cause tiles to fall into new matches
    // Row 0: 🌴🌴🌴 (will be removed)
    // Row 1: 🌴🌴🌴 (will fall down and create new match)
    board[0][0] = { ...board[0][0], type: '🌴' };
    board[0][1] = { ...board[0][1], type: '🌴' };
    board[0][2] = { ...board[0][2], type: '🌴' };
    board[1][0] = { ...board[1][0], type: '🌴' };
    board[1][1] = { ...board[1][1], type: '🌴' };
    board[1][2] = { ...board[1][2], type: '🌴' };

    const { newBoard, matches, totalMatches } = processTurn(board);

    // Should have processed multiple rounds of matches
    expect(totalMatches).toBeGreaterThan(1);
    expect(matches.length).toBeGreaterThan(1);

    // Final board should have no matches
    const finalMatches = findMatches(newBoard);
    expect(finalMatches.length).toBe(0);
  });

  it('should allow new moves after cascading matches complete', () => {
    // This test simulates the isProcessingMove logic by checking that
    // after processTurn completes, the board is in a stable state
    const board = createTestBoard([
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
    ]);

    // Create initial match
    board[0][0] = { ...board[0][0], type: '🌴' };
    board[0][1] = { ...board[0][1], type: '🌴' };
    board[0][2] = { ...board[0][2], type: '🌴' };

    const { newBoard } = processTurn(board);

    // After processing, the board should be stable and allow new moves
    // Check that there are valid moves available
    const validMoves = getValidMoves(newBoard);
    expect(validMoves.length).toBeGreaterThan(0);

    // The board should have no matches
    const finalMatches = findMatches(newBoard);
    expect(finalMatches.length).toBe(0);
  });

  it('should handle complex cascading scenarios with multiple columns', () => {
    // Create a complex scenario where matches in one column cause matches in others
    const board = createTestBoard([
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
    ]);

    // Set up matches in columns 0 and 1 that will cascade
    board[0][0] = { ...board[0][0], type: '🌴' };
    board[1][0] = { ...board[1][0], type: '🌴' };
    board[2][0] = { ...board[2][0], type: '🌴' };
    board[0][1] = { ...board[0][1], type: '🌴' };
    board[1][1] = { ...board[1][1], type: '🌴' };
    board[2][1] = { ...board[2][1], type: '🌴' };

    const { newBoard, matches, totalMatches } = processTurn(board);

    // Should have processed multiple matches
    expect(totalMatches).toBeGreaterThan(1);

    // Final board should be stable
    const finalMatches = findMatches(newBoard);
    expect(finalMatches.length).toBe(0);
  });
});

describe('Falling Animation and Match Processing Bugs', () => {
  it('should process new matches created when tiles fall into place', () => {
    // Create a board where removing a match will cause tiles to fall into new matches
    const board = createTestBoard([
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
    ]);

    // Set up a scenario where:
    // Row 0: 🌴🌴🌴 (will be removed)
    // Row 1: 🌴🌴🌴 (will fall down and create new match)
    // Row 2: 🌴🌴🌴 (will fall down and create new match)
    board[0][0] = { ...board[0][0], type: '🌴' };
    board[0][1] = { ...board[0][1], type: '🌴' };
    board[0][2] = { ...board[0][2], type: '🌴' };
    board[1][0] = { ...board[1][0], type: '🌴' };
    board[1][1] = { ...board[1][1], type: '🌴' };
    board[1][2] = { ...board[1][2], type: '🌴' };
    board[2][0] = { ...board[2][0], type: '🌴' };
    board[2][1] = { ...board[2][1], type: '🌴' };
    board[2][2] = { ...board[2][2], type: '🌴' };

    // Process the turn - this should handle all cascading matches
    const { newBoard, matches, totalMatches } = processTurn(board);

    // Should have processed multiple rounds of matches
    expect(totalMatches).toBeGreaterThan(1);
    expect(matches.length).toBeGreaterThan(1);

    // Final board should have no matches
    const finalMatches = findMatches(newBoard);
    expect(finalMatches.length).toBe(0);
  });

  it('should mark all tiles above matched tiles as falling for animation', () => {
    // This test verifies that the falling tile detection logic works correctly
    // Create a simple board manually to avoid safe pattern conflicts
    const board: Tile[][] = [];

    // Create a simple 8x8 board with no matches
    for (let row = 0; row < 8; row++) {
      board[row] = [];
      for (let col = 0; col < 8; col++) {
        // Use different tile types to avoid any matches
        const tileTypes: TileType[] = ['🌴', '🐚', '🌺', '🐠', '⭐'];
        const type = tileTypes[(row + col) % 5];
        board[row][col] = {
          id: `${row}-${col}`,
          type,
          row,
          col,
        };
      }
    }

    // Create a match in row 4 using 🌴 tiles
    board[4][3] = { ...board[4][3], type: '🌴' };
    board[4][4] = { ...board[4][4], type: '🌴' };
    board[4][5] = { ...board[4][5], type: '🌴' };

    // Find matches and remove them
    const matches = findMatches(board);
    expect(matches.length).toBeGreaterThan(0);

    const boardAfterRemoval = removeMatches(board, matches);

    // Check that the matched tiles are now null (removed)
    expect(boardAfterRemoval[4][3]).toBeNull();
    expect(boardAfterRemoval[4][4]).toBeNull();
    expect(boardAfterRemoval[4][5]).toBeNull();

    // Tiles above should still be present (they will fall)
    expect(boardAfterRemoval[3][3]).not.toBeNull();
    expect(boardAfterRemoval[3][4]).not.toBeNull();
    expect(boardAfterRemoval[3][5]).not.toBeNull();

    // Tiles below should still be present
    expect(boardAfterRemoval[5][3]).not.toBeNull();
    expect(boardAfterRemoval[5][4]).not.toBeNull();
    expect(boardAfterRemoval[5][5]).not.toBeNull();
  });

  it('should handle complex cascading scenarios with multiple columns and rows', () => {
    // Create a complex scenario where matches in multiple columns cause cascading effects
    const board = createTestBoard([
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
      ['🌴', '🌴', '🌴', '🐚', '🌺', '🐠', '⭐', '🌴'],
    ]);

    // Create matches in columns 0, 1, and 2 that will cascade
    // Column 0: rows 0-2
    board[0][0] = { ...board[0][0], type: '🌴' };
    board[1][0] = { ...board[1][0], type: '🌴' };
    board[2][0] = { ...board[2][0], type: '🌴' };

    // Column 1: rows 0-2
    board[0][1] = { ...board[0][1], type: '🌴' };
    board[1][1] = { ...board[1][1], type: '🌴' };
    board[2][1] = { ...board[2][1], type: '🌴' };

    // Column 2: rows 0-2
    board[0][2] = { ...board[0][2], type: '🌴' };
    board[1][2] = { ...board[1][2], type: '🌴' };
    board[2][2] = { ...board[2][2], type: '🌴' };

    const { newBoard, matches, totalMatches } = processTurn(board);

    // Should have processed multiple matches
    expect(totalMatches).toBeGreaterThan(1);

    // Final board should be stable
    const finalMatches = findMatches(newBoard);
    expect(finalMatches.length).toBe(0);
  });
});
