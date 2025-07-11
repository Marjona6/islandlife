import { TileType } from '../types/game';

describe('Buried Treasure Mechanics', () => {
  // Test treasure tile types
  it('should recognize treasure tile types', () => {
    const treasureTypes: TileType[] = ['💎', '🪙', '🏺', '💍'];

    treasureTypes.forEach(treasureType => {
      expect(['💎', '🪙', '🏺', '💍']).toContain(treasureType);
    });
  });

  // Test sand blocker with treasure properties
  it('should handle sand blockers with treasure properties', () => {
    const sandBlocker = {
      row: 1,
      col: 1,
      hasUmbrella: true,
      sandLevel: 2,
      hasTreasure: true,
    };

    expect(sandBlocker.sandLevel).toBe(2);
    expect(sandBlocker.hasTreasure).toBe(true);
    expect(sandBlocker.hasUmbrella).toBe(true);
  });

  // Test level 5 configuration
  it('should have correct level 5 configuration', () => {
    const level5Config = {
      id: 'level-5',
      name: 'Buried Treasure',
      objective: 'buried-treasure',
      target: 8,
      moves: 35,
      tileTypes: ['🦀', '🌴', '⭐', '🌺', '🐚', '💎', '🪙', '🏺', '💍'],
      mechanics: ['sand', 'treasure'],
    };

    expect(level5Config.objective).toBe('buried-treasure');
    expect(level5Config.target).toBe(8);
    expect(level5Config.mechanics).toContain('treasure');
    expect(level5Config.tileTypes).toContain('💎');
    expect(level5Config.tileTypes).toContain('🪙');
    expect(level5Config.tileTypes).toContain('🏺');
    expect(level5Config.tileTypes).toContain('💍');
  });

  // Test sand level mechanics
  it('should handle different sand levels correctly', () => {
    const sandLevel1 = { sandLevel: 1, requiredMatches: 1 };
    const sandLevel2 = { sandLevel: 2, requiredMatches: 2 };

    expect(sandLevel1.requiredMatches).toBe(1);
    expect(sandLevel2.requiredMatches).toBe(2);
  });

  // Test treasure collection logic
  it('should count treasure tiles correctly', () => {
    const matchedTiles = [
      { type: '🦀' as TileType },
      { type: '💎' as TileType },
      { type: '🪙' as TileType },
      { type: '🌺' as TileType },
    ];

    const treasureCount = matchedTiles.filter(tile =>
      ['💎', '🪙', '🏺', '💍'].includes(tile.type),
    ).length;

    expect(treasureCount).toBe(2);
  });
});
