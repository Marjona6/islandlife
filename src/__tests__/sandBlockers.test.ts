import { Tile as GameTile } from '../types/game';
import { dropTiles } from '../utils/gameLogic';

describe('Sand Blockers Mechanic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create a mock board with specific tiles
  const createMockBoard = (tileLayout: string[][]): (GameTile | null)[][] => {
    return tileLayout.map((row, rowIndex) =>
      row.map((tileType, colIndex) =>
        tileType === 'null'
          ? null
          : {
              id: `${rowIndex}-${colIndex}`,
              type: tileType as any,
              row: rowIndex,
              col: colIndex,
            },
      ),
    );
  };

  // Helper function to create sand blockers array
  const createSandBlockers = (
    positions: Array<{ row: number; col: number }>,
  ) => {
    return positions;
  };

  // Helper function to simulate the sand blocker processing logic
  const processSandBlockers = (
    board: (GameTile | null)[][],
    matches: Array<Array<{ row: number; col: number }>>,
    sandBlockers: Array<{ row: number; col: number }>,
    umbrellas: Array<{ row: number; col: number }>,
  ) => {
    const sandBlockersToClear: Array<{ row: number; col: number }> = [];
    const umbrellasToRemove: Array<{ row: number; col: number }> = [];

    // Track which sand blockers are adjacent to matches in this turn
    const adjacentBlockers = new Set<string>();

    matches.forEach(match => {
      match.forEach(pos => {
        // Check all 4 adjacent positions for sand blockers
        const adjacentPositions = [
          { row: pos.row - 1, col: pos.col }, // up
          { row: pos.row + 1, col: pos.col }, // down
          { row: pos.row, col: pos.col - 1 }, // left
          { row: pos.row, col: pos.col + 1 }, // right
        ];

        adjacentPositions.forEach(adjPos => {
          if (
            adjPos.row >= 0 &&
            adjPos.row < 8 &&
            adjPos.col >= 0 &&
            adjPos.col < 8
          ) {
            const blockerKey = `${adjPos.row},${adjPos.col}`;
            if (
              sandBlockers.some(
                b => b.row === adjPos.row && b.col === adjPos.col,
              )
            ) {
              adjacentBlockers.add(blockerKey);
            }
          }
        });
      });
    });

    // Process each adjacent sand blocker
    adjacentBlockers.forEach(blockerKey => {
      const [row, col] = blockerKey.split(',').map(Number);
      const blocker = { row, col };

      // Check if this sand blocker has an umbrella
      const hasUmbrella = umbrellas.some(
        umbrella =>
          umbrella.row === blocker.row && umbrella.col === blocker.col,
      );

      if (hasUmbrella) {
        // First match: remove umbrella
        umbrellasToRemove.push(blocker);
      } else {
        // Second match: clear the sand blocker completely
        sandBlockersToClear.push(blocker);
      }
    });

    return {
      umbrellasToRemove,
      sandBlockersToClear,
      updatedSandBlockers: sandBlockers.filter(
        blocker =>
          !sandBlockersToClear.some(
            toClear =>
              toClear.row === blocker.row && toClear.col === blocker.col,
          ),
      ),
      updatedUmbrellas: umbrellas.filter(
        umbrella =>
          !umbrellasToRemove.some(
            toRemove =>
              toRemove.row === umbrella.row && toRemove.col === umbrella.col,
          ),
      ),
    };
  };

  describe('Non-adjacent matches', () => {
    it('should not affect sand blockers when matches are not adjacent', () => {
      // Create a board with a match far from sand blockers
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 4, col: 4 },
        { row: 5, col: 5 },
      ]);

      const umbrellas = createSandBlockers([
        { row: 4, col: 4 },
        { row: 5, col: 5 },
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      expect(result.umbrellasToRemove).toHaveLength(0);
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedSandBlockers).toEqual(sandBlockers);
      expect(result.updatedUmbrellas).toEqual(umbrellas);
    });
  });

  describe('First adjacent match (umbrella removal)', () => {
    it('should remove umbrella from sand blocker on first adjacent match', () => {
      // Create a board with a match adjacent to a sand blocker
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 3 }, // Adjacent to the match
        { row: 4, col: 4 }, // Not adjacent
      ]);

      const umbrellas = createSandBlockers([
        { row: 0, col: 3 }, // Has umbrella
        { row: 4, col: 4 }, // Has umbrella
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should remove umbrella from adjacent blocker
      expect(result.umbrellasToRemove).toEqual([{ row: 0, col: 3 }]);
      expect(result.sandBlockersToClear).toHaveLength(0);

      // Sand blocker should remain but without umbrella
      expect(result.updatedSandBlockers).toEqual(sandBlockers);
      expect(result.updatedUmbrellas).toEqual([{ row: 4, col: 4 }]);
    });

    it('should handle multiple adjacent sand blockers on first match', () => {
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 3 }, // Adjacent to match
        { row: 1, col: 2 }, // Adjacent to match
        { row: 4, col: 4 }, // Not adjacent
      ]);

      const umbrellas = createSandBlockers([
        { row: 0, col: 3 }, // Has umbrella
        { row: 1, col: 2 }, // Has umbrella
        { row: 4, col: 4 }, // Has umbrella
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should remove umbrellas from both adjacent blockers
      expect(result.umbrellasToRemove).toHaveLength(2);
      expect(result.umbrellasToRemove).toContainEqual({ row: 0, col: 3 });
      expect(result.umbrellasToRemove).toContainEqual({ row: 1, col: 2 });
      expect(result.sandBlockersToClear).toHaveLength(0);

      // Sand blockers should remain but without umbrellas
      expect(result.updatedSandBlockers).toEqual(sandBlockers);
      expect(result.updatedUmbrellas).toEqual([{ row: 4, col: 4 }]);
    });
  });

  describe('Second adjacent match (sand blocker removal)', () => {
    it('should remove sand blocker entirely on second adjacent match', () => {
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 3 }, // Adjacent to match, no umbrella (already removed)
        { row: 4, col: 4 }, // Not adjacent
      ]);

      const umbrellas = createSandBlockers([
        { row: 4, col: 4 }, // Only this one still has umbrella
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should clear the adjacent blocker (no umbrellas to remove)
      expect(result.umbrellasToRemove).toHaveLength(0);
      expect(result.sandBlockersToClear).toEqual([{ row: 0, col: 3 }]);

      // Sand blocker should be removed entirely
      expect(result.updatedSandBlockers).toEqual([{ row: 4, col: 4 }]);
      expect(result.updatedUmbrellas).toEqual([{ row: 4, col: 4 }]);
    });

    it('should handle mixed states (some with umbrellas, some without)', () => {
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 3 }, // Adjacent, no umbrella (second match)
        { row: 1, col: 2 }, // Adjacent, has umbrella (first match)
        { row: 4, col: 4 }, // Not adjacent
      ]);

      const umbrellas = createSandBlockers([
        { row: 1, col: 2 }, // Still has umbrella
        { row: 4, col: 4 }, // Still has umbrella
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should remove umbrella from one and clear the other
      expect(result.umbrellasToRemove).toEqual([{ row: 1, col: 2 }]);
      expect(result.sandBlockersToClear).toEqual([{ row: 0, col: 3 }]);

      // Final state: one blocker removed, one without umbrella, one unchanged
      expect(result.updatedSandBlockers).toEqual([
        { row: 1, col: 2 },
        { row: 4, col: 4 },
      ]);
      expect(result.updatedUmbrellas).toEqual([{ row: 4, col: 4 }]);
    });
  });

  describe('Adjacency detection', () => {
    it('should detect sand blockers adjacent to vertical matches', () => {
      const board = createMockBoard([
        ['🦀', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['🦀', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['🦀', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 1 }, // Adjacent to top of vertical match
        { row: 3, col: 0 }, // Adjacent to bottom of vertical match
        { row: 1, col: 1 }, // Adjacent to middle of vertical match
        { row: 4, col: 4 }, // Not adjacent
      ]);

      const umbrellas = createSandBlockers([
        { row: 0, col: 1 },
        { row: 3, col: 0 },
        { row: 1, col: 1 },
        { row: 4, col: 4 },
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 1, col: 0 },
          { row: 2, col: 0 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should remove umbrellas from all adjacent blockers
      expect(result.umbrellasToRemove).toHaveLength(3);
      expect(result.umbrellasToRemove).toContainEqual({ row: 0, col: 1 });
      expect(result.umbrellasToRemove).toContainEqual({ row: 3, col: 0 });
      expect(result.umbrellasToRemove).toContainEqual({ row: 1, col: 1 });
      expect(result.sandBlockersToClear).toHaveLength(0);
    });

    it('should not detect sand blockers that are diagonal to matches', () => {
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 1, col: 3 }, // Diagonal to match (not adjacent)
        { row: 0, col: 3 }, // Adjacent to match
      ]);

      const umbrellas = createSandBlockers([
        { row: 1, col: 3 },
        { row: 0, col: 3 },
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should only affect the adjacent blocker
      expect(result.umbrellasToRemove).toEqual([{ row: 0, col: 3 }]);
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedUmbrellas).toEqual([{ row: 1, col: 3 }]);
    });
  });

  describe('Edge cases', () => {
    it('should handle sand blockers at board edges', () => {
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 3 }, // Adjacent to match
        { row: 0, col: 0 }, // At edge, adjacent to match (same position as first match tile)
        { row: 7, col: 7 }, // At edge, far from match
      ]);

      const umbrellas = createSandBlockers([
        { row: 0, col: 3 },
        { row: 0, col: 0 },
        { row: 7, col: 7 },
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should affect both adjacent blockers (including the one at the edge)
      expect(result.umbrellasToRemove).toHaveLength(2);
      expect(result.umbrellasToRemove).toContainEqual({ row: 0, col: 3 });
      expect(result.umbrellasToRemove).toContainEqual({ row: 0, col: 0 });
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedUmbrellas).toEqual([{ row: 7, col: 7 }]);
    });

    it('should handle empty matches array', () => {
      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      const sandBlockers = createSandBlockers([
        { row: 0, col: 3 },
        { row: 4, col: 4 },
      ]);

      const umbrellas = createSandBlockers([
        { row: 0, col: 3 },
        { row: 4, col: 4 },
      ]);

      const matches: Array<Array<{ row: number; col: number }>> = [];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should not affect any sand blockers
      expect(result.umbrellasToRemove).toHaveLength(0);
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedSandBlockers).toEqual(sandBlockers);
      expect(result.updatedUmbrellas).toEqual(umbrellas);
    });

    it('should not allow sand blockers to reappear after being cleared', () => {
      // This test simulates the scenario where a sand blocker was cleared in a previous turn
      // and then a new turn starts. The sand blocker should not reappear.

      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      // Simulate the state after a sand blocker was cleared in a previous turn
      // The sand blocker at (0,3) was cleared and should not be in the list
      const sandBlockers = createSandBlockers([
        { row: 4, col: 4 }, // Only this one should remain
      ]);

      // The umbrella list should also not contain the cleared sand blocker
      const umbrellas = createSandBlockers([
        { row: 4, col: 4 }, // Only this one should have an umbrella
      ]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      const result = processSandBlockers(
        board,
        matches,
        sandBlockers,
        umbrellas,
      );

      // Should not affect any sand blockers since the adjacent one was already cleared
      expect(result.umbrellasToRemove).toHaveLength(0);
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedSandBlockers).toEqual(sandBlockers);
      expect(result.updatedUmbrellas).toEqual(umbrellas);
    });

    it('should properly track umbrella state across multiple turns', () => {
      // This test simulates multiple turns to ensure umbrella state is properly tracked

      const board = createMockBoard([
        ['🦀', '🦀', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      // Initial state: sand blocker with umbrella
      let sandBlockers = createSandBlockers([{ row: 0, col: 3 }]);

      let umbrellas = createSandBlockers([{ row: 0, col: 3 }]);

      const matches = [
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      ];

      // First turn: should remove umbrella
      let result = processSandBlockers(board, matches, sandBlockers, umbrellas);

      expect(result.umbrellasToRemove).toEqual([{ row: 0, col: 3 }]);
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedSandBlockers).toEqual(sandBlockers);
      expect(result.updatedUmbrellas).toEqual([]);

      // Update state for second turn
      sandBlockers = result.updatedSandBlockers;
      umbrellas = result.updatedUmbrellas;

      // Second turn: should clear the sand blocker entirely
      result = processSandBlockers(board, matches, sandBlockers, umbrellas);

      expect(result.umbrellasToRemove).toHaveLength(0);
      expect(result.sandBlockersToClear).toEqual([{ row: 0, col: 3 }]);
      expect(result.updatedSandBlockers).toEqual([]);
      expect(result.updatedUmbrellas).toEqual([]);

      // Third turn: sand blocker should not reappear
      result = processSandBlockers(
        board,
        matches,
        result.updatedSandBlockers,
        result.updatedUmbrellas,
      );

      expect(result.umbrellasToRemove).toHaveLength(0);
      expect(result.sandBlockersToClear).toHaveLength(0);
      expect(result.updatedSandBlockers).toEqual([]);
      expect(result.updatedUmbrellas).toEqual([]);
    });
  });

  describe('Sand Blocker Obstacle Behavior', () => {
    it('should prevent tiles from falling through sand blockers', () => {
      // Create a board with a sand blocker in the middle and empty spaces above and below
      const board = createMockBoard([
        ['🦀', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      // Sand blocker at position (3, 0)
      const sandBlockers = [{ row: 3, col: 0 }];

      // Drop tiles - the tile at (0, 0) should fall to (2, 0) and stop at the sand blocker
      const result = dropTiles(board as any, 'sand', sandBlockers);

      // Check that the tile stopped at row 2 (above the sand blocker at row 3)
      expect(result[2][0]).toBeTruthy();
      expect(result[2][0].type).toBe('🦀');

      // Check that the sand blocker position remains null
      expect(result[3][0]).toBeNull();

      // Check that positions below the sand blocker are filled with new tiles
      expect(result[4][0]).toBeTruthy();
      expect(result[5][0]).toBeTruthy();
      expect(result[6][0]).toBeTruthy();
      expect(result[7][0]).toBeTruthy();
    });

    it('should not place tiles in sand blocker positions when filling empty spaces', () => {
      // Create an empty board
      const board = createMockBoard([
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      // Sand blockers at various positions
      const sandBlockers = [
        { row: 2, col: 0 },
        { row: 4, col: 0 },
        { row: 6, col: 0 },
      ];

      // Drop tiles - should fill around sand blockers
      const result = dropTiles(board as any, 'sand', sandBlockers);

      // Check that sand blocker positions remain null
      expect(result[2][0]).toBeNull();
      expect(result[4][0]).toBeNull();
      expect(result[6][0]).toBeNull();

      // Check that other positions are filled
      expect(result[0][0]).toBeTruthy();
      expect(result[1][0]).toBeTruthy();
      expect(result[3][0]).toBeTruthy();
      expect(result[5][0]).toBeTruthy();
      expect(result[7][0]).toBeTruthy();
    });
  });
});
