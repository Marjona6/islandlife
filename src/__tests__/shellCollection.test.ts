import {levelManager} from '../utils/levelManager';

describe('Shell Collection Tests', () => {
  it('should have correct level 1 configuration for shell collection', () => {
    const level1 = levelManager.getLevel('level-1');

    expect(level1).toBeDefined();
    expect(level1?.objective).toBe('collect');
    expect(level1?.target).toBe(15);
    expect(level1?.tileTypes).toEqual(['🐚']);
    expect(level1?.name).toBe('Shell Collector');
  });

  it('should only count shell tiles for collection objective', () => {
    // This test verifies that the level configuration is set up correctly
    // to only count shell tiles (🐚) for the collect objective
    const level1 = levelManager.getLevel('level-1');

    if (!level1) {
      throw new Error('Level 1 not found');
    }

    // The level should only have shell tiles in tileTypes
    expect(level1.tileTypes).toHaveLength(1);
    expect(level1.tileTypes[0]).toBe('🐚');

    // This means the game logic should only count shell tiles
    // when calculating collected tiles for this level
    console.log('✅ Level 1 configuration is correct for shell collection');
  });

  it('should not count non-shell tiles for collection objective', () => {
    // This test documents the expected behavior
    // Non-shell tiles (🦀, 🌴, ⭐, 🌺) should not count toward collection
    const level1 = levelManager.getLevel('level-1');

    if (!level1) {
      throw new Error('Level 1 not found');
    }

    const nonShellTiles = ['🦀', '🌴', '⭐', '🌺'];

    // Verify that none of the non-shell tiles are in the tileTypes array
    nonShellTiles.forEach(tile => {
      expect(level1.tileTypes).not.toContain(tile);
    });

    console.log(
      '✅ Non-shell tiles correctly excluded from collection objective',
    );
  });
});
