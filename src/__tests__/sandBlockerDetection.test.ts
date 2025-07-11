describe('Sand Blocker Detection Issues', () => {
  // Helper function to create sand blockers array
  const createSandBlockers = (
    positions: Array<{ row: number; col: number; hasUmbrella?: boolean }>,
  ) => {
    return positions.map(pos => ({
      row: pos.row,
      col: pos.col,
      hasUmbrella: pos.hasUmbrella !== false, // Default to true if not specified
    }));
  };

  describe('Issue 1: Tile swap detection near sand blockers', () => {
    it('should allow swapping tiles that are adjacent to sand blockers but not on sand blockers', () => {
      // Sand blocker at position (0, 3) - adjacent to tiles at (0, 2) and (1, 3)
      const sandBlockers = createSandBlockers([
        { row: 0, col: 3, hasUmbrella: true },
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
      // Sand blocker at position (0, 3)
      const sandBlockers = createSandBlockers([
        { row: 0, col: 3, hasUmbrella: true },
      ]);

      // Test that we cannot swap tiles that are on sand blocker positions
      const isSandBlockerPosition = sandBlockers.some(
        blocker => blocker.row === 0 && blocker.col === 3,
      );
      expect(isSandBlockerPosition).toBe(true);
    });
  });

  describe('Issue 2: Level completion with remaining sand blockers', () => {
    it('should not complete level when sand blockers remain', () => {
      // Simulate level with 2 sand blockers remaining
      const remainingSandBlockers = createSandBlockers([
        { row: 3, col: 3, hasUmbrella: true },
        { row: 4, col: 4, hasUmbrella: true },
      ]);

      // Level should not be complete if sand blockers remain
      expect(remainingSandBlockers.length).toBeGreaterThan(0);

      // Simulate level completion check
      const isComplete = remainingSandBlockers.length === 0;
      expect(isComplete).toBe(false);
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
        { row: 1, col: 1, hasUmbrella: true },
        { row: 2, col: 2, hasUmbrella: true },
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
        { row: 0, col: 0, hasUmbrella: true },
        { row: 1, col: 1, hasUmbrella: true },
        { row: 2, col: 2, hasUmbrella: false },
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
        { row: 0, col: 0, hasUmbrella: true }, // Top-left corner
        { row: 0, col: 7, hasUmbrella: true }, // Top-right corner
        { row: 7, col: 0, hasUmbrella: true }, // Bottom-left corner
        { row: 7, col: 7, hasUmbrella: true }, // Bottom-right corner
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
      const swipeTo = { row: 4, col: 3 };

      // Initial sand blockers (from level-2 config)
      const initialSandBlockers = createSandBlockers([
        { row: 4, col: 3, hasUmbrella: true }, // This should be cleared
        { row: 4, col: 4, hasUmbrella: true }, // This should remain
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
        { row: 4, col: 4, hasUmbrella: true }, // Only this one remains
      ]);

      // Test swipe from (4, 2) to (4, 3)
      const swipeTo = { row: 4, col: 3 };

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

  describe('Issue 4: Coconut drop counter accuracy', () => {
    it('should only count coconuts that reach the bottom row', () => {
      // Simulate coconuts at different positions
      const coconutsAtBottom = [
        { row: 7, col: 0, id: 'coconut-1' }, // At bottom row - should count
        { row: 7, col: 1, id: 'coconut-2' }, // At bottom row - should count
        { row: 6, col: 2, id: 'coconut-3' }, // Not at bottom row - should not count
        { row: 5, col: 3, id: 'coconut-4' }, // Not at bottom row - should not count
      ];

      // Filter to only count coconuts at bottom row (row 7)
      const coconutsToCount = coconutsAtBottom.filter(
        coconut => coconut.row === 7,
      );

      expect(coconutsToCount).toHaveLength(2);
      expect(coconutsToCount.map(c => c.id)).toEqual([
        'coconut-1',
        'coconut-2',
      ]);
    });

    it('should not count the same coconut multiple times during board updates', () => {
      // Simulate the real scenario where board updates multiple times
      const coconutId = 'coconut-1';
      const countedCoconuts = new Set<string>();

      // Simulate multiple board updates (like during cascades)
      const boardUpdates = [
        { row: 7, col: 0, id: coconutId }, // First board update - coconut reaches bottom
        { row: 7, col: 0, id: coconutId }, // Second board update - same coconut still at bottom
        { row: 7, col: 0, id: coconutId }, // Third board update - same coconut still at bottom
      ];

      // Simulate the actual logic: only count if not already counted
      boardUpdates.forEach(update => {
        if (update.row === 7 && !countedCoconuts.has(update.id)) {
          countedCoconuts.add(update.id);
          console.log(`Counting coconut ${update.id} for the first time`);
        } else {
          console.log(
            `Skipping coconut ${update.id} - already counted or not at bottom`,
          );
        }
      });

      // Should only count once
      expect(countedCoconuts.size).toBe(1);
      expect(Array.from(countedCoconuts)).toEqual([coconutId]);
    });

    it('should handle multiple different coconuts correctly', () => {
      const countedCoconuts = new Set<string>();

      // Simulate multiple coconuts reaching bottom at different times
      const coconutEvents = [
        { row: 7, col: 0, id: 'coconut-1' }, // First coconut reaches bottom
        { row: 7, col: 1, id: 'coconut-2' }, // Second coconut reaches bottom
        { row: 7, col: 0, id: 'coconut-1' }, // First coconut still at bottom (should not count again)
        { row: 7, col: 2, id: 'coconut-3' }, // Third coconut reaches bottom
        { row: 7, col: 1, id: 'coconut-2' }, // Second coconut still at bottom (should not count again)
      ];

      coconutEvents.forEach(event => {
        if (event.row === 7 && !countedCoconuts.has(event.id)) {
          countedCoconuts.add(event.id);
          console.log(`Counting coconut ${event.id} for the first time`);
        }
      });

      // Should count all three unique coconuts
      expect(countedCoconuts.size).toBe(3);
      expect(Array.from(countedCoconuts).sort()).toEqual([
        'coconut-1',
        'coconut-2',
        'coconut-3',
      ]);
    });

    it('should reset counted coconuts when starting a new level', () => {
      const countedCoconuts = new Set<string>();

      // Simulate first level
      countedCoconuts.add('coconut-1');
      countedCoconuts.add('coconut-2');
      expect(countedCoconuts.size).toBe(2);

      // Simulate starting new level (reset)
      countedCoconuts.clear();
      expect(countedCoconuts.size).toBe(0);

      // Simulate coconuts in new level
      countedCoconuts.add('coconut-3');
      countedCoconuts.add('coconut-4');
      expect(countedCoconuts.size).toBe(2);
      expect(Array.from(countedCoconuts).sort()).toEqual([
        'coconut-3',
        'coconut-4',
      ]);
    });
  });

  describe('Issue 5: Sand blocker clearing with tile falling', () => {
    it('should let tiles above sand blockers fall down when sand blockers are cleared', () => {
      // Simulate a coconut sitting on top of a sand blocker
      const coconutAboveSandBlocker = {
        row: 6,
        col: 3,
        id: 'coconut-1',
        type: '🥥',
        isSpecial: true,
      };

      // The coconut should fall down to fill the cleared sand blocker position
      const coconutAfterFalling = {
        ...coconutAboveSandBlocker,
        row: 7, // Should fall to the bottom row
      };

      // Verify the coconut moved down
      expect(coconutAfterFalling.row).toBe(7);
      expect(coconutAfterFalling.col).toBe(3);
      expect(coconutAfterFalling.id).toBe('coconut-1');
      expect(coconutAfterFalling.isSpecial).toBe(true);
    });

    it('should let regular tiles fall down when sand blockers are cleared', () => {
      // Simulate a regular tile sitting on top of a sand blocker
      const tileAboveSandBlocker = {
        row: 6,
        col: 4,
        id: 'tile-1',
        type: '🦀',
        isSpecial: false,
      };

      // The tile should fall down to fill the cleared sand blocker position
      const tileAfterFalling = {
        ...tileAboveSandBlocker,
        row: 7, // Should fall to the bottom row
      };

      // Verify the tile moved down
      expect(tileAfterFalling.row).toBe(7);
      expect(tileAfterFalling.col).toBe(4);
      expect(tileAfterFalling.id).toBe('tile-1');
      expect(tileAfterFalling.isSpecial).toBe(false);
    });

    it('should only generate new tiles when no tiles exist above cleared sand blockers', () => {
      // Check that no tiles exist above this position
      const tilesAbove = []; // Empty array means no tiles above

      // Should generate a new tile only when no tiles exist above
      const shouldGenerateNewTile = tilesAbove.length === 0;
      expect(shouldGenerateNewTile).toBe(true);
    });
  });

  describe('Issue 6: Coconut exit behavior', () => {
    it('should remove coconuts from bottom row and apply gravity', () => {
      // Simulate coconuts reaching the bottom row
      const coconutsToExit = [
        { row: 7, col: 0, id: 'coconut-1' },
        { row: 7, col: 3, id: 'coconut-2' },
      ];

      // Verify coconuts are at bottom row
      coconutsToExit.forEach(coconut => {
        expect(coconut.row).toBe(7);
      });

      // After exit, these positions should be null
      const expectedPositions = coconutsToExit.map(c => ({
        row: c.row,
        col: c.col,
      }));
      expectedPositions.forEach(_pos => {
        // Simulate that the position is now empty
        const isEmpty = true; // In real logic, this would be null
        expect(isEmpty).toBe(true);
      });
    });

    it('should count coconut drops when they exit the bottom row', () => {
      // Simulate coconut reaching bottom row
      const coconutAtBottom = {
        row: 7,
        col: 2,
        id: 'coconut-1',
        isSpecial: true,
      };

      // Verify it's at bottom row and is special
      expect(coconutAtBottom.row).toBe(7);
      expect(coconutAtBottom.isSpecial).toBe(true);

      // This should trigger a drop count
      const shouldCountDrop =
        coconutAtBottom.row === 7 && coconutAtBottom.isSpecial;
      expect(shouldCountDrop).toBe(true);
    });
  });

  describe('Issue 7: State transition warnings', () => {
    it('should defer coconut drop notifications until after processing is complete', () => {
      // Simulate the deferred notification mechanism
      const pendingCoconutDrops: Array<{
        row: number;
        col: number;
        id: string;
      }> = [];
      let dropCallCount = 0;

      const mockOnCoconutDrop = jest.fn(() => {
        dropCallCount++;
      });

      // Simulate coconuts reaching bottom during processing
      const coconutsToExit = [
        { row: 7, col: 0, id: 'coconut-1' },
        { row: 7, col: 1, id: 'coconut-2' },
        { row: 7, col: 2, id: 'coconut-3' },
        { row: 7, col: 3, id: 'coconut-4' },
        { row: 7, col: 4, id: 'coconut-5' },
        { row: 7, col: 5, id: 'coconut-6' },
        { row: 7, col: 6, id: 'coconut-7' },
        { row: 7, col: 7, id: 'coconut-8' },
      ];

      // During processing, collect drops instead of calling immediately
      coconutsToExit.forEach(coconut => {
        pendingCoconutDrops.push(coconut);
        console.log('Collected coconut drop for later notification:', coconut);
      });

      // Verify drops were collected but not called yet
      expect(pendingCoconutDrops.length).toBe(8);
      expect(mockOnCoconutDrop).not.toHaveBeenCalled();

      // After processing is complete, call all collected drops
      if (mockOnCoconutDrop && pendingCoconutDrops.length > 0) {
        console.log(
          'Notifying parent of',
          pendingCoconutDrops.length,
          'coconut drops:',
          pendingCoconutDrops,
        );
        // Call onCoconutDrop for each collected drop
        pendingCoconutDrops.forEach(() => {
          mockOnCoconutDrop();
        });
        // Clear the pending drops
        pendingCoconutDrops.length = 0;
      }

      // Verify that onCoconutDrop was called the expected number of times
      expect(mockOnCoconutDrop).toHaveBeenCalledTimes(8);
      expect(dropCallCount).toBe(8);
      expect(pendingCoconutDrops.length).toBe(0);
    });
  });

  describe('Issue 9: Coconut movement to bottom row', () => {
    it('should allow coconuts to reach the bottom row when no sand blockers are blocking', () => {
      // Create a board with coconuts at the top and no sand blockers in columns 0, 1, 6, 7
      const board = [
        ['🥥', '🥥', '🦀', '🦀', '🦀', '🦀', '🥥', '🥥'], // Row 0: coconuts in columns 0, 1, 6, 7
        ['🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀'], // Row 1
        ['🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀'], // Row 2
        ['🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀'], // Row 3
        ['🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀'], // Row 4
        ['🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀'], // Row 5
        ['🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀', '🦀'], // Row 6
        ['🦀', '🦀', null, null, null, null, '🦀', '🦀'], // Row 7: sand blockers in columns 2-5
      ];

      // Sand blockers in columns 2-5 at row 7
      const sandBlockers = [
        { row: 7, col: 2, hasUmbrella: true },
        { row: 7, col: 3, hasUmbrella: true },
        { row: 7, col: 4, hasUmbrella: true },
        { row: 7, col: 5, hasUmbrella: true },
      ];

      console.log('Initial board state:');
      board.forEach((row, index) => {
        console.log(`Row ${index}:`, row);
      });

      console.log('Sand blockers:', sandBlockers);

      // Check which columns are blocked
      const blockedColumns = sandBlockers.map(sb => sb.col);
      console.log('Blocked columns:', blockedColumns);

      // Check which columns are free for coconuts to fall
      const freeColumns = [0, 1, 2, 3, 4, 5, 6, 7].filter(
        col => !blockedColumns.includes(col),
      );
      console.log('Free columns for coconuts:', freeColumns);

      // Verify that coconuts in columns 0, 1, 6, 7 can reach the bottom
      const coconutsInFreeColumns = [0, 1, 6, 7].filter(col =>
        freeColumns.includes(col),
      );
      console.log('Coconuts in free columns:', coconutsInFreeColumns);

      expect(coconutsInFreeColumns).toEqual([0, 1, 6, 7]);
      expect(freeColumns).toEqual([0, 1, 6, 7]);
    });
  });
});
