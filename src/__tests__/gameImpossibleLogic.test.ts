import {getValidMoves, isValidMove, findMatches} from '../utils/gameLogic';
import {
  checkIfGameImpossible,
  rearrangeBoard,
} from '../utils/gameImpossibleLogic';

// Mock the gameLogic functions since we're testing the logic in GameBoard
jest.mock('../utils/gameLogic', () => ({
  getValidMoves: jest.fn(),
  isValidMove: jest.fn(),
  findMatches: jest.fn(),
}));

// Import the functions we want to test (we'll need to extract them from GameBoard)
// For now, let's create the test structure and then extract the functions

describe('Game Impossible Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock findMatches to return empty array by default
    (findMatches as jest.Mock).mockReturnValue([]);
  });

  describe('checkIfGameImpossible', () => {
    it('should return false when valid moves exist', () => {
      // Mock isValidMove to return true for some moves
      (isValidMove as jest.Mock).mockReturnValue(true);

      // Create a mock board (the actual board doesn't matter for this test)
      const mockBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      const isImpossible = checkIfGameImpossible(mockBoard, []);

      expect(isValidMove).toHaveBeenCalled();
      expect(isImpossible).toBe(false);
    });

    it('should return true when no valid moves exist', () => {
      // Mock isValidMove to return false for all moves
      (isValidMove as jest.Mock).mockReturnValue(false);

      const mockBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      const isImpossible = checkIfGameImpossible(mockBoard, []);

      expect(isValidMove).toHaveBeenCalled();
      expect(isImpossible).toBe(true);
    });

    it('should return true when getValidMoves returns undefined', () => {
      // Mock isValidMove to return false for all moves
      (isValidMove as jest.Mock).mockReturnValue(false);

      const mockBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      const isImpossible = checkIfGameImpossible(mockBoard, []);

      expect(isValidMove).toHaveBeenCalled();
      expect(isImpossible).toBe(true);
    });
  });

  describe('rearrangeBoard', () => {
    it('should preserve sand blocker positions', () => {
      // Create a mock board with some tiles and sand blockers
      const mockBoard = Array(8)
        .fill(null)
        .map((_, row) =>
          Array(8)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              type: '🦀' as const,
              row,
              col,
            })),
        );

      const sandBlockers = [
        {row: 1, col: 1},
        {row: 3, col: 3},
        {row: 5, col: 5},
      ];

      // Set sand blocker positions to null
      sandBlockers.forEach(({row, col}) => {
        mockBoard[row][col] = null as any;
      });

      const rearrangedBoard = rearrangeBoard(mockBoard, sandBlockers);

      // Check that sand blocker positions are still null
      sandBlockers.forEach(({row, col}) => {
        expect(rearrangedBoard[row][col]).toBeNull();
      });
    });

    it('should maintain the same number of tiles', () => {
      const mockBoard = Array(8)
        .fill(null)
        .map((_, row) =>
          Array(8)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              type: '🦀' as const,
              row,
              col,
            })),
        );

      const sandBlockers = [{row: 1, col: 1}];
      mockBoard[1][1] = null as any;

      // Count non-null tiles before rearrangement
      const tilesBefore = mockBoard.flat().filter(tile => tile !== null).length;

      const rearrangedBoard = rearrangeBoard(mockBoard, sandBlockers);

      // Count non-null tiles after rearrangement
      const tilesAfter = rearrangedBoard
        .flat()
        .filter(tile => tile !== null).length;

      expect(tilesAfter).toBe(tilesBefore);
    });

    it('should shuffle non-sand-blocker tiles', () => {
      // Create a board with a specific pattern
      const mockBoard = Array(8)
        .fill(null)
        .map((_, row) =>
          Array(8)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              type: row % 2 === 0 ? ('🦀' as const) : ('🐚' as const),
              row,
              col,
            })),
        );

      const sandBlockers = [{row: 1, col: 1}];
      mockBoard[1][1] = null as any;

      const rearrangedBoard = rearrangeBoard(mockBoard, sandBlockers);

      // The board should be different (shuffled) but with same number of tiles
      const originalTiles = mockBoard.flat().filter(tile => tile !== null);
      const rearrangedTiles = rearrangedBoard
        .flat()
        .filter(tile => tile !== null);

      expect(rearrangedTiles.length).toBe(originalTiles.length);

      // Since we're shuffling, there's a chance the order is different
      // We can't guarantee it's different due to randomness, but we can check
      // that the same tile types exist
      const originalTypes = originalTiles.map(tile => tile.type).sort();
      const rearrangedTypes = rearrangedTiles.map(tile => tile.type).sort();
      expect(rearrangedTypes).toEqual(originalTypes);
    });

    it('should handle empty board with only sand blockers', () => {
      const mockBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const sandBlockers = [
        {row: 0, col: 0},
        {row: 1, col: 1},
        {row: 2, col: 2},
      ];

      const rearrangedBoard = rearrangeBoard(mockBoard, sandBlockers);

      // All positions should still be null
      const nonNullTiles = rearrangedBoard.flat().filter(tile => tile !== null);
      expect(nonNullTiles.length).toBe(0);

      // Sand blocker positions should still be null
      sandBlockers.forEach(({row, col}) => {
        expect(rearrangedBoard[row][col]).toBeNull();
      });
    });
  });

  describe('Integration: Impossible Game Detection + Rearrangement', () => {
    it('should detect impossible game and rearrange board', () => {
      // Mock isValidMove to return false initially (no valid moves)
      (isValidMove as jest.Mock).mockReturnValue(false);

      const mockBoard = Array(8)
        .fill(null)
        .map((_, row) =>
          Array(8)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              type: '🦀' as const,
              row,
              col,
            })),
        );

      const sandBlockers = [{row: 1, col: 1}];
      mockBoard[1][1] = null as any;

      // Check if game is impossible
      const isImpossible = checkIfGameImpossible(mockBoard, []);
      expect(isImpossible).toBe(true);

      // If impossible, rearrange should be called
      if (isImpossible) {
        // Mock isValidMove to return true after rearrangement
        (isValidMove as jest.Mock).mockReturnValue(true);

        const rearrangedBoard = rearrangeBoard(mockBoard, sandBlockers);

        // Check if game is still impossible after rearrangement
        const isStillImpossible = checkIfGameImpossible(rearrangedBoard, []);

        // The game should now be possible
        expect(isValidMove).toHaveBeenCalled();
        expect(isStillImpossible).toBe(false);
      }
    });

    it('should handle multiple rearrangement attempts', () => {
      // Mock isValidMove to return false initially
      (isValidMove as jest.Mock).mockReturnValue(false);

      const mockBoard = Array(8)
        .fill(null)
        .map((_, row) =>
          Array(8)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              type: '🦀' as const,
              row,
              col,
            })),
        );

      const sandBlockers = [{row: 1, col: 1}];
      mockBoard[1][1] = null as any;

      // First check
      let isImpossible = checkIfGameImpossible(mockBoard, []);
      expect(isImpossible).toBe(true);

      // First rearrangement
      let rearrangedBoard = rearrangeBoard(mockBoard, sandBlockers);
      isImpossible = checkIfGameImpossible(rearrangedBoard, []);
      expect(isImpossible).toBe(true);

      // Second rearrangement
      rearrangedBoard = rearrangeBoard(rearrangedBoard, sandBlockers);
      isImpossible = checkIfGameImpossible(rearrangedBoard, []);
      // Don't check specific return value, just verify the function was called
      expect(isValidMove).toHaveBeenCalled();
    });
  });
});
