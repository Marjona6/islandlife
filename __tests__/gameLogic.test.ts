import {
  areAdjacent,
  findMatches,
  isValidMove,
  processTurn,
  createValidBoard,
  removeMatches,
  dropTiles,
} from '../src/utils/gameLogic';
import {Tile, TileType} from '../src/types/game';

// Add Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toHaveLength(expected: number): R;
      toEqual(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toHaveProperty(prop: string, value?: any): R;
      toContain(expected: any): R;
      toBeNull(): R;
      not: Matchers<R>;
    }
  }
}

// Helper function to create a simple board for testing
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

// Helper function to create a controlled test board
const createControlledBoard = (): Tile[][] => {
  const board: Tile[][] = [];

  // Create an 8x8 board with a specific pattern that has no initial matches
  const pattern = [
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
      board[row][col] = {
        id: `${row}-${col}`,
        type: pattern[row][col] as TileType,
        row,
        col,
      };
    }
  }

  return board;
};

describe('Game Logic Tests', () => {
  describe('areAdjacent', () => {
    it('should return true for adjacent tiles', () => {
      expect(areAdjacent(0, 0, 0, 1)).toBe(true); // horizontal
      expect(areAdjacent(0, 0, 1, 0)).toBe(true); // vertical
      expect(areAdjacent(1, 1, 1, 2)).toBe(true); // horizontal
      expect(areAdjacent(1, 1, 2, 1)).toBe(true); // vertical
    });

    it('should return false for non-adjacent tiles', () => {
      expect(areAdjacent(0, 0, 0, 2)).toBe(false); // horizontal gap
      expect(areAdjacent(0, 0, 2, 0)).toBe(false); // vertical gap
      expect(areAdjacent(0, 0, 1, 1)).toBe(false); // diagonal
      expect(areAdjacent(0, 0, 0, 0)).toBe(false); // same position
    });
  });

  describe('findMatches', () => {
    it('should find horizontal matches of 3', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🌴', '🐚', '🌺'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const matches = findMatches(board);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual([
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
      ]);
    });

    it('should find horizontal matches of 4', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🌴', '🌴', '🐚'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const matches = findMatches(board);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual([
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
        {row: 0, col: 3},
      ]);
    });

    it('should find vertical matches of 3', () => {
      const board = createTestBoard([
        ['🌴', '🐚', '🌺', '🐠', '⭐'],
        ['🌴', '🌺', '🐠', '⭐', '🌴'],
        ['🌴', '🐠', '⭐', '🌴', '🐚'],
        ['🐚', '⭐', '🌴', '🐚', '🌺'],
        ['🌺', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const matches = findMatches(board);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual([
        {row: 0, col: 0},
        {row: 1, col: 0},
        {row: 2, col: 0},
      ]);
    });

    it('should find multiple matches without overlaps', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🌴', '🐚', '🌺'],
        ['🌴', '🌺', '🐠', '⭐', '🌴'],
        ['🌴', '🐠', '⭐', '🌴', '🐚'],
        ['🐚', '⭐', '🌴', '🐚', '🌺'],
        ['🌺', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const matches = findMatches(board);
      expect(matches).toHaveLength(2);

      // Should find horizontal match at row 0
      expect(
        matches.some(
          match => match.length === 3 && match.every(pos => pos.row === 0),
        ),
      ).toBe(true);

      // Should find vertical match at col 0
      expect(
        matches.some(
          match => match.length === 3 && match.every(pos => pos.col === 0),
        ),
      ).toBe(true);
    });

    it('should not find matches for different tile types', () => {
      const board = createTestBoard([
        ['🌴', '🐚', '🌺', '🐠', '⭐'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const matches = findMatches(board);
      expect(matches).toHaveLength(0);
    });

    it('should not find matches in a controlled board', () => {
      const board = createControlledBoard();
      const matches = findMatches(board);
      expect(matches).toHaveLength(0);
    });

    it('should find matches after a swap creates them', () => {
      const board = createControlledBoard();

      // Create a board with a potential match
      const testBoard = board.map(row => [...row]);
      testBoard[0][0] = {...testBoard[0][0], type: '🌴'};
      testBoard[0][1] = {...testBoard[0][1], type: '🌴'};
      testBoard[0][2] = {...testBoard[0][2], type: '🐚'}; // This will be swapped
      testBoard[0][3] = {...testBoard[0][3], type: '🌴'}; // Make sure this is 🌴

      // Swap to create a match
      const temp = testBoard[0][2];
      testBoard[0][2] = testBoard[0][3];
      testBoard[0][3] = temp;

      const matches = findMatches(testBoard);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('isValidMove', () => {
    it('should return true for moves that create matches', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🐚', '🌴', '🐠'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      // Swapping the third tile should create a horizontal match
      expect(isValidMove(board, 0, 2, 0, 3)).toBe(true);
    });

    it('should return false for moves that do not create matches', () => {
      const board = createTestBoard([
        ['🌴', '🐚', '🌺', '🐠', '⭐'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      // Swapping any adjacent tiles should not create matches
      expect(isValidMove(board, 0, 0, 0, 1)).toBe(false);
      expect(isValidMove(board, 0, 0, 1, 0)).toBe(false);
    });

    it('should return false for non-adjacent moves', () => {
      const board = createTestBoard([
        ['🌴', '🐚', '🌺', '🐠', '⭐'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      expect(isValidMove(board, 0, 0, 0, 2)).toBe(false);
      expect(isValidMove(board, 0, 0, 2, 0)).toBe(false);
    });

    it('should detect valid moves that create matches', () => {
      const board = createControlledBoard();

      // Create a board with a potential match
      const testBoard = board.map(row => [...row]);
      testBoard[0][0] = {...testBoard[0][0], type: '🌴'};
      testBoard[0][1] = {...testBoard[0][1], type: '🌴'};
      testBoard[0][2] = {...testBoard[0][2], type: '🐚'};
      testBoard[0][3] = {...testBoard[0][3], type: '🌴'};

      // This swap should create a match
      expect(isValidMove(testBoard, 0, 2, 0, 3)).toBe(true);
    });

    it('should reject invalid moves', () => {
      const board = createControlledBoard();
      expect(isValidMove(board, 0, 0, 0, 1)).toBe(false);
    });
  });

  describe('removeMatches', () => {
    it('should remove matched tiles', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🌴', '🐚', '🌺'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const matches = [
        [
          {row: 0, col: 0},
          {row: 0, col: 1},
          {row: 0, col: 2},
        ],
      ];
      const result = removeMatches(board, matches);

      expect(result[0][0]).toBeNull();
      expect(result[0][1]).toBeNull();
      expect(result[0][2]).toBeNull();
      expect(result[0][3]).not.toBeNull(); // Should remain unchanged
    });
  });

  describe('dropTiles', () => {
    it('should drop tiles to fill empty spaces', () => {
      const board = createTestBoard([
        ['🌴', null, '🌺', '🐠', '⭐'],
        ['🐚', '🌺', null, '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const result = dropTiles(board);

      // Check that there are no null values in the result
      for (let row = 0; row < result.length; row++) {
        for (let col = 0; col < result[row].length; col++) {
          expect(result[row][col]).not.toBeNull();
        }
      }
    });
  });

  describe('processTurn', () => {
    it('should process a complete turn with matches', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🌴', '🐚', '🌺'],
        ['🐚', '🌺', '🐠', '⭐', '🌴'],
        ['🌺', '🐠', '⭐', '🌴', '🐚'],
        ['🐠', '⭐', '🌴', '🐚', '🌺'],
        ['⭐', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const result = processTurn(board);

      expect(result.totalMatches).toBeGreaterThan(0);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.newBoard.length).toBe(8);
      expect(result.newBoard[0].length).toBe(8);
    });

    it('should handle cascading matches', () => {
      const board = createTestBoard([
        ['🌴', '🌴', '🌴', '🌴', '🌴'],
        ['🌴', '🌺', '🐠', '⭐', '🌴'],
        ['🌴', '🐠', '⭐', '🌴', '🐚'],
        ['🌴', '⭐', '🌴', '🐚', '🌺'],
        ['🌴', '🌴', '🐚', '🌺', '🐠'],
      ]);

      const result = processTurn(board);

      expect(result.totalMatches).toBeGreaterThan(1); // Should have multiple matches
    });

    it('should process matches correctly', () => {
      const board = createControlledBoard();

      // Create a board with a match
      const testBoard = board.map(row => [...row]);
      testBoard[0][0] = {...testBoard[0][0], type: '🌴'};
      testBoard[0][1] = {...testBoard[0][1], type: '🌴'};
      testBoard[0][2] = {...testBoard[0][2], type: '🌴'};

      const result = processTurn(testBoard);
      expect(result.totalMatches).toBeGreaterThan(0);
      expect(result.matches.length).toBeGreaterThan(0);
    });
  });

  describe('createValidBoard', () => {
    it('should create a board with no initial matches', () => {
      const board = createValidBoard();

      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);

      // Check that there are no initial matches
      const matches = findMatches(board);
      expect(matches).toHaveLength(0);
    });

    it('should create boards with valid tile objects', () => {
      const board = createValidBoard();

      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const tile = board[row][col];
          expect(tile).toHaveProperty('id');
          expect(tile).toHaveProperty('type');
          expect(tile).toHaveProperty('row', row);
          expect(tile).toHaveProperty('col', col);
          expect(['🌴', '🐚', '🌺', '🐠', '⭐']).toContain(tile.type);
        }
      }
    });
  });

  describe('Board State Consistency', () => {
    it('should maintain consistency between validation and processing', () => {
      const board = createControlledBoard();

      // Create a board with a potential match
      const testBoard = board.map(row => [...row]);
      testBoard[0][0] = {...testBoard[0][0], type: '🌴'};
      testBoard[0][1] = {...testBoard[0][1], type: '🌴'};
      testBoard[0][2] = {...testBoard[0][2], type: '🐚'};
      testBoard[0][3] = {...testBoard[0][3], type: '🌴'};

      // Check if the move is valid
      const isValid = isValidMove(testBoard, 0, 2, 0, 3);

      if (isValid) {
        // Perform the swap
        const swappedBoard = testBoard.map(row => [...row]);
        const temp = swappedBoard[0][2];
        swappedBoard[0][2] = swappedBoard[0][3];
        swappedBoard[0][3] = temp;

        // Process the turn with the swapped board
        const result = processTurn(swappedBoard);

        // Should find matches
        expect(result.totalMatches).toBeGreaterThan(0);
      }
    });
  });
});
