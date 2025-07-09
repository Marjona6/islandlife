# Buried Treasure Mechanic

## Overview

The "Buried Treasure" mechanic is a new level type in the Island Life match-3 game that introduces sand-covered treasure tiles that players must uncover and collect.

## Core Mechanics

### 1. Sand Tiles (Blockers)

- Certain tiles on the grid are covered with sand layers
- Sand tiles are not matchable themselves
- When a match is made **adjacent** to a sand tile, the sand layer is removed
- Support for multi-layer sand (`sandLevel: 1` or `sandLevel: 2`)

### 2. Treasure Tiles

- Some sand tiles conceal treasure tiles (💎, 🪙, 🏺, 💍)
- After clearing the sand, these tiles become visible as collectible treasure
- Once visible, they behave like standard collectible tiles and can be collected by matching

### 3. Sand Levels

- **Level 1 Sand**: Requires 1 adjacent match to clear
- **Level 2 Sand**: Requires 2 adjacent matches to clear (tougher tiles)

### 4. Objective Logic

- Level ends successfully when the player collects all treasure tiles
- Failure occurs if moves run out before collecting all treasures
- Progress is tracked: "Treasures: X/Y collected"

## Implementation Details

### New Tile Types

```typescript
export const TREASURE_TILE_EMOJIS = ['💎', '🪙', '🏺', '💍'] as const;
export const SAND_BLOCKER_EMOJI = '🏖️' as const;
```

### Level Configuration

```json
{
  "id": "level-5",
  "name": "Buried Treasure",
  "objective": "buried-treasure",
  "target": 8,
  "moves": 35,
  "mechanics": ["sand", "treasure"],
  "blockers": [
    {
      "type": "sand",
      "row": 1,
      "col": 1,
      "sandLevel": 1,
      "hasTreasure": true
    },
    {
      "type": "sand",
      "row": 1,
      "col": 5,
      "sandLevel": 2,
      "hasTreasure": true
    }
  ]
}
```

### Game State Updates

- `treasureCollected`: Number of treasures collected so far
- `totalTreasure`: Total number of treasures to collect
- Sand blockers now include `sandLevel` and `hasTreasure` properties

### Visual Feedback

- Progress display shows "Treasures: X/Y"
- Sand tiles show as 🏖️ emoji
- Treasure tiles have distinct appearances (💎, 🪙, 🏺, 💍)

## Level 5: Buried Treasure

Level 5 features:

- **Objective**: Collect 8 hidden treasures
- **Moves**: 35
- **Sand Blockers**: 14 total (8 with treasure, 6 decoys)
- **Sand Levels**: Mix of level 1 and level 2 sand
- **Difficulty**: Medium

### Strategy Tips

1. Focus on creating matches adjacent to sand tiles
2. Level 2 sand tiles require multiple matches - plan accordingly
3. Some sand tiles are decoys (no treasure) - don't waste moves on them
4. Once treasures are revealed, match them quickly before they get buried again

## Testing

Run the buried treasure tests:

```bash
npm test -- --testPathPattern=buriedTreasure.test.ts
```

## Future Enhancements

Potential improvements:

- Visual sand breaking animation
- Sound effects for treasure discovery
- Multi-layer sand (3+ levels)
- Special treasure types with unique properties
- Treasure collection counter with sparkle effects
