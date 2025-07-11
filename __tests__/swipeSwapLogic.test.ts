import { isValidMove, findMatches, processTurn } from '../src/utils/gameLogic';
import { Tile, TileType } from '../src/types/game';

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

// Helper to create a controlled test board
const createControlledBoard = (): Tile[][] => {
  const board: Tile[][] = [];

  // Create an 8x8 board with a specific pattern that has NO initial matches
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

describe('Swipe/Swap Logic Tests', () => {
  describe('Valid Swipe Detection', () => {
    it('should detect a valid horizontal swipe that creates a match', () => {
      const board = createControlledBoard();

      // Create a potential match scenario: 🌴🌴🐚🌴
      board[0][0].type = '🌴';
      board[0][1].type = '🌴';
      board[0][2].type = '🐚'; // This will be swapped
      board[0][3].type = '🌴';

      // Swapping position 2 with position 3 should create a match
      const isValid = isValidMove(board, 0, 2, 0, 3);

      expect(isValid).toBe(true);
    });

    it('should detect a valid vertical swipe that creates a match', () => {
      const board = createControlledBoard();

      // Create a potential match scenario vertically: 🌴🌴🐚🌴
      board[0][0].type = '🌴';
      board[1][0].type = '🌴';
      board[2][0].type = '🐚'; // This will be swapped
      board[3][0].type = '🌴';

      // Swapping position (2,0) with position (3,0) should create a match
      const isValid = isValidMove(board, 2, 0, 3, 0);

      expect(isValid).toBe(true);
    });

    it('should reject invalid swipes that do not create matches', () => {
      const board = createControlledBoard();

      // No potential matches in this scenario
      const isValid = isValidMove(board, 0, 0, 0, 1);

      expect(isValid).toBe(false);
    });

    it('should reject non-adjacent swipes', () => {
      const board = createControlledBoard();

      // Try to swap non-adjacent tiles
      const isValid = isValidMove(board, 0, 0, 0, 2);

      expect(isValid).toBe(false);
    });
  });

  describe('Match Processing After Swap', () => {
    it('should process a valid swap and find matches', () => {
      const board = createControlledBoard();

      // Create a potential match scenario
      board[0][0].type = '🌴';
      board[0][1].type = '🌴';
      board[0][2].type = '🐚';
      board[0][3].type = '🌴';

      // Perform the swap manually
      const swappedBoard = board.map(row => [...row]);
      const temp = swappedBoard[0][2];
      swappedBoard[0][2] = swappedBoard[0][3];
      swappedBoard[0][3] = temp;

      // Process the turn
      const result = processTurn(swappedBoard);

      expect(result.totalMatches).toBeGreaterThan(0);
      expect(result.matches.length).toBeGreaterThan(0);
    });

    it('should handle invalid swaps by not finding matches', () => {
      const board = createControlledBoard();

      // Perform an invalid swap (no matches created)
      const swappedBoard = board.map(row => [...row]);
      const temp = swappedBoard[0][0];
      swappedBoard[0][0] = swappedBoard[0][1];
      swappedBoard[0][1] = temp;

      // Process the turn
      const result = processTurn(swappedBoard);

      expect(result.totalMatches).toBe(0);
      expect(result.matches.length).toBe(0);
    });
  });

  describe('Cascading Matches', () => {
    it('should handle cascading matches after tiles fall', () => {
      const board = createControlledBoard();

      // Create a scenario where removing matches creates new matches
      // Set up a board where removing one match creates another
      board[0][0].type = '🌴';
      board[0][1].type = '🌴';
      board[0][2].type = '🌴';
      board[1][0].type = '🌴';
      board[1][1].type = '🌴';
      board[1][2].type = '🌴';

      // Process the turn - should find multiple matches
      const result = processTurn(board);

      expect(result.totalMatches).toBeGreaterThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle swipes at board edges', () => {
      const board = createControlledBoard();

      // Test swipe from edge position
      const isValid = isValidMove(board, 0, 0, 0, 1);

      // Should not crash, but may or may not be valid
      expect(typeof isValid).toBe('boolean');
    });

    it('should handle rapid successive swaps', () => {
      const board = createControlledBoard();

      // Create a valid swap scenario
      board[0][0].type = '🌴';
      board[0][1].type = '🌴';
      board[0][2].type = '🐚';
      board[0][3].type = '🌴';

      // First swap should be valid
      const firstSwap = isValidMove(board, 0, 2, 0, 3);
      expect(firstSwap).toBe(true);

      // After the first swap, the board state should change
      // This tests that the game logic handles state changes correctly
      const swappedBoard = board.map(row => [...row]);
      const temp = swappedBoard[0][2];
      swappedBoard[0][2] = swappedBoard[0][3];
      swappedBoard[0][3] = temp;

      // Second swap on the new board should be evaluated correctly
      const secondSwap = isValidMove(swappedBoard, 0, 1, 0, 2);
      expect(typeof secondSwap).toBe('boolean');
    });
  });

  describe('Board State Consistency', () => {
    it('should maintain consistency between validation and processing', () => {
      const board = createControlledBoard();

      // Create a potential match scenario
      board[0][0].type = '🌴';
      board[0][1].type = '🌴';
      board[0][2].type = '🐚';
      board[0][3].type = '🌴';

      // Check if the move is valid
      const isValid = isValidMove(board, 0, 2, 0, 3);

      if (isValid) {
        // Perform the swap
        const swappedBoard = board.map(row => [...row]);
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
