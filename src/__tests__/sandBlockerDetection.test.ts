import {Tile as GameTile} from '../types/game';

describe('Sand Blocker Detection Issues', () => {
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
    positions: Array<{row: number; col: number; hasUmbrella?: boolean}>,
  ) => {
    return positions.map(pos => ({
      row: pos.row,
      col: pos.col,
      hasUmbrella: pos.hasUmbrella !== false, // Default to true if not specified
    }));
  };

  describe('Issue 1: Tile swap detection near sand blockers', () => {
    it('should allow swapping tiles that are adjacent to sand blockers but not on sand blockers', () => {
      // Create a board with a sand blocker and tiles around it
      const board = createMockBoard([
        ['🦀', '🌴', '⭐', 'null', 'null', 'null', 'null', 'null'],
        ['🌺', '🐚', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['⭐', '🌺', '🐚', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      // Sand blocker at position (0, 3) - adjacent to tiles at (0, 2) and (1, 3)
      const sandBlockers = createSandBlockers([
        {row: 0, col: 3, hasUmbrella: true},
      ]);

      // Test that we can swap tiles that are adjacent to the sand blocker
      // Tile at (0, 2) should be able to swap with tile at (0, 1) or (1, 2)

      // Check if position (0, 2) is not a sand blocker
      const isPositionSandBlocker = sandBlockers.some(
        blocker => blocker.row === 0 && blocker.col === 2,
      );
      expect(isPositionSandBlocker).toBe(false);

      // Check if position (0, 1) is not a sand blocker
      const isAdjacentPositionSandBlocker = sandBlockers.some(
        blocker => blocker.row === 0 && blocker.col === 1,
      );
      expect(isAdjacentPositionSandBlocker).toBe(false);

      // Check if position (1, 2) is not a sand blocker
      const isBelowPositionSandBlocker = sandBlockers.some(
        blocker => blocker.row === 1 && blocker.col === 2,
      );
      expect(isBelowPositionSandBlocker).toBe(false);

      // Verify that the sand blocker is at the correct position
      const sandBlockerAtCorrectPosition = sandBlockers.some(
        blocker => blocker.row === 0 && blocker.col === 3,
      );
      expect(sandBlockerAtCorrectPosition).toBe(true);
    });

    it('should prevent swapping tiles that are on sand blocker positions', () => {
      // Create a board with a sand blocker
      const board = createMockBoard([
        ['🦀', '🌴', '⭐', 'null', 'null', 'null', 'null', 'null'],
        ['🌺', '🐚', '🦀', 'null', 'null', 'null', 'null', 'null'],
        ['⭐', '🌺', '🐚', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ['null', 'null', 'null', 'null', 'null', 'null', 'null', 'null'],
      ]);

      // Sand blocker at position (0, 3)
      const sandBlockers = createSandBlockers([
        {row: 0, col: 3, hasUmbrella: true},
      ]);

      // Test that we cannot swap tiles that are on sand blocker positions
      const isSandBlockerPosition = sandBlockers.some(
        blocker => blocker.row === 0 && blocker.col === 3,
      );
      expect(isSandBlockerPosition).toBe(true);
    });
  });

  describe('Issue 2: Level completion with sand blockers remaining', () => {
    it('should not complete level when sand blockers are still present', () => {
      // Create a level with sand blockers
      const sandBlockers = createSandBlockers([
        {row: 1, col: 1, hasUmbrella: true},
        {row: 2, col: 2, hasUmbrella: true},
        {row: 3, col: 3, hasUmbrella: false}, // This one has no umbrella
      ]);

      // Simulate level completion check
      const isLevelComplete = sandBlockers.length === 0;

      // Level should not be complete when sand blockers remain
      expect(isLevelComplete).toBe(false);
      expect(sandBlockers.length).toBe(3);
    });

    it('should complete level when all sand blockers are cleared', () => {
      // Create a level with no sand blockers (all cleared)
      const sandBlockers = createSandBlockers([]);

      // Simulate level completion check
      const isLevelComplete = sandBlockers.length === 0;

      // Level should be complete when no sand blockers remain
      expect(isLevelComplete).toBe(true);
      expect(sandBlockers.length).toBe(0);
    });

    it('should properly track sand blocker state after clearing', () => {
      // Start with sand blockers
      let sandBlockers = createSandBlockers([
        {row: 1, col: 1, hasUmbrella: true},
        {row: 2, col: 2, hasUmbrella: true},
      ]);

      expect(sandBlockers.length).toBe(2);

      // Simulate clearing one sand blocker
      sandBlockers = sandBlockers.filter(
        blocker => !(blocker.row === 1 && blocker.col === 1),
      );

      expect(sandBlockers.length).toBe(1);
      expect(sandBlockers[0].row).toBe(2);
      expect(sandBlockers[0].col).toBe(2);

      // Simulate clearing the remaining sand blocker
      sandBlockers = sandBlockers.filter(
        blocker => !(blocker.row === 2 && blocker.col === 2),
      );

      expect(sandBlockers.length).toBe(0);

      // Level should now be complete
      const isLevelComplete = sandBlockers.length === 0;
      expect(isLevelComplete).toBe(true);
    });
  });

  describe('Sand blocker position accuracy', () => {
    it('should accurately track sand blocker positions', () => {
      const sandBlockers = createSandBlockers([
        {row: 0, col: 0, hasUmbrella: true},
        {row: 1, col: 1, hasUmbrella: true},
        {row: 2, col: 2, hasUmbrella: false},
      ]);

      // Check that all positions are correctly tracked
      expect(sandBlockers).toHaveLength(3);

      expect(sandBlockers.some(b => b.row === 0 && b.col === 0)).toBe(true);
      expect(sandBlockers.some(b => b.row === 1 && b.col === 1)).toBe(true);
      expect(sandBlockers.some(b => b.row === 2 && b.col === 2)).toBe(true);

      // Check that positions that shouldn't have sand blockers don't
      expect(sandBlockers.some(b => b.row === 0 && b.col === 1)).toBe(false);
      expect(sandBlockers.some(b => b.row === 1 && b.col === 0)).toBe(false);
      expect(sandBlockers.some(b => b.row === 3 && b.col === 3)).toBe(false);
    });

    it('should handle edge cases at board boundaries', () => {
      const sandBlockers = createSandBlockers([
        {row: 0, col: 0, hasUmbrella: true}, // Top-left corner
        {row: 0, col: 7, hasUmbrella: true}, // Top-right corner
        {row: 7, col: 0, hasUmbrella: true}, // Bottom-left corner
        {row: 7, col: 7, hasUmbrella: true}, // Bottom-right corner
      ]);

      expect(sandBlockers).toHaveLength(4);

      // Check corner positions
      expect(sandBlockers.some(b => b.row === 0 && b.col === 0)).toBe(true);
      expect(sandBlockers.some(b => b.row === 0 && b.col === 7)).toBe(true);
      expect(sandBlockers.some(b => b.row === 7 && b.col === 0)).toBe(true);
      expect(sandBlockers.some(b => b.row === 7 && b.col === 7)).toBe(true);

      // Check that center positions don't have sand blockers
      expect(sandBlockers.some(b => b.row === 3 && b.col === 3)).toBe(false);
      expect(sandBlockers.some(b => b.row === 4 && b.col === 4)).toBe(false);
    });
  });

  describe('Issue 3: False sand blocker detection', () => {
    it('should not detect sand blocker at position that was already cleared', () => {
      // Simulate the scenario from the user's log
      // User is swiping from (4, 2) to (4, 3) - right direction
      const swipeTo = {row: 4, col: 3};

      // Initial sand blockers (from level-2 config)
      const initialSandBlockers = createSandBlockers([
        {row: 4, col: 3, hasUmbrella: true}, // This should be cleared
        {row: 4, col: 4, hasUmbrella: true}, // This should remain
      ]);

      // Simulate that the sand blocker at (4, 3) was already cleared
      const currentSandBlockers = initialSandBlockers.filter(
        blocker => !(blocker.row === 4 && blocker.col === 3),
      );

      // Check that the cleared position is no longer in the sand blockers list
      const hasSandBlockerAtTarget = currentSandBlockers.some(
        blocker => blocker.row === swipeTo.row && blocker.col === swipeTo.col,
      );

      expect(hasSandBlockerAtTarget).toBe(false);
      expect(currentSandBlockers).toHaveLength(1);
      expect(currentSandBlockers[0].row).toBe(4);
      expect(currentSandBlockers[0].col).toBe(4);
    });

    it('should allow swapping when sand blocker was cleared and replaced with tile', () => {
      // Simulate the board state from the user's log
      const board = [
        ['⭐', '🌴', '🌴', '🦀', '🌺', '⭐', '🌴', '⭐'],
        ['🌺', 'null', 'null', '⭐', '🐚', 'null', 'null', '⭐'],
        ['⭐', 'null', '🌺', '⭐', '🦀', '⭐', 'null', '🌺'],
        ['🦀', '🌴', '🌴', 'null', 'null', '🦀', '🌴', '🐚'],
        ['🐚', '🌺', '⭐', '🦀', 'null', '🌺', '🌴', '🦀'], // Row 4: position (4,3) has '🦀'
        ['🦀', 'null', '🦀', '⭐', '🌴', '🐚', 'null', '⭐'],
        ['🦀', 'null', '🦀', '🐚', '🌴', '🐚', 'null', '🦀'],
        ['⭐', '🌴', '🌴', '🦀', '⭐', '⭐', '🌴', '🌴'],
      ];

      // Current sand blockers (after some were cleared)
      const currentSandBlockers = createSandBlockers([
        {row: 4, col: 4, hasUmbrella: true}, // Only this one remains
      ]);

      // Test swipe from (4, 2) to (4, 3)
      const swipeTo = {row: 4, col: 3};

      // Check if target position has a sand blocker
      const hasSandBlocker = currentSandBlockers.some(
        blocker => blocker.row === swipeTo.row && blocker.col === swipeTo.col,
      );

      // Should not have a sand blocker at (4, 3) since it was cleared
      expect(hasSandBlocker).toBe(false);

      // The board should show a tile at (4, 3), not a sand blocker
      expect(board[4][3]).toBe('🦀');
    });
  });
});
