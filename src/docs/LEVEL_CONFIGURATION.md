# Level Configuration System

This document explains how to create and manage level configurations for the Island Life match-3 game.

## Overview

The level configuration system allows you to define complex match-3 levels with various objectives, mechanics, and obstacles. Each level is defined as a JSON object with specific properties.

## Level Configuration Structure

### Basic Properties

```typescript
interface LevelConfig {
  id: string; // Unique identifier
  name: string; // Display name
  board: (TileType | null)[][]; // 8x8 board layout
  objective: ObjectiveType; // Win condition
  target: number; // Target value for objective
  moves: number; // Maximum moves allowed
  tileTypes: TileType[]; // Available tile types
  mechanics: MechanicType[]; // Special mechanics
  blockers?: BlockerConfig[]; // Obstacles on board
  specialTiles?: SpecialTileConfig[]; // Special tiles
  description?: string; // Level description
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

### Available Tile Types

**Sand Tiles:**

- 🦀 (Crab)
- 🌴 (Palm Tree)
- ⭐ (Star)
- 🌺 (Flower)
- 🐚 (Shell)

**Sea Tiles:**

- 🦑 (Squid)
- 🦐 (Shrimp)
- 🐡 (Pufferfish)
- 🪝 (Hook)

### Objectives

- `score`: Reach a target score
- `collect`: Collect specific number of tiles
- `clear`: Clear specific number of tiles
- `drop`: Drop items to targets
- `combo`: Achieve specific number of combos

### Mechanics

- `sand`: Sand blocks that need to be cleared
- `drop-targets`: Drop tiles to specific targets
- `ice`: Ice blocks that need to be broken
- `crabs`: Crab invasion mechanics
- `bombs`: Explosive tiles
- `rainbow`: Rainbow tiles that match any color
- `locked`: Locked tiles that need to be unlocked
- `net`: Fishing net obstacles
- `coral`: Coral reef obstacles
- `rock`: Rock obstacles

### Blockers

Blockers are obstacles placed on the board:

```typescript
{
  type: 'sand' | 'net' | 'ice' | 'rock' | 'coral';
  row: number; // 0-7
  col: number; // 0-7
}
```

### Special Tiles

Special tiles have unique properties:

```typescript
{
  type: 'power-tile' | 'locked' | 'bomb' | 'rainbow' | 'collector';
  row: number;
  col: number;
  properties?: Record<string, any>; // Additional properties
}
```

## Example Level Configurations

### Level 1: Simple Collect Objective

```json
{
  "id": "level-1",
  "name": "Shell Collector",
  "board": [
    ["🦀", "🌴", "⭐", "🌺", "🐚", "🦀", "🌴", "⭐"],
    ["🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚", "🦀"],
    ["⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚"],
    ["🌴", "⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺"],
    ["🐚", "🦀", "🌴", "⭐", "🌺", "🐚", "🦀", "🌴"],
    ["🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚", "🦀"],
    ["⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚"],
    ["🌴", "⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺"]
  ],
  "objective": "collect",
  "target": 15,
  "moves": 20,
  "tileTypes": ["🐚"],
  "mechanics": [],
  "description": "Collect 15 shells to win!",
  "difficulty": "easy"
}
```

### Level 2: Score Objective with Sand Mechanics

```json
{
  "id": "level-2",
  "name": "Sandy Shores",
  "board": [
    ["🦀", "🌴", "⭐", "🌺", "🐚", "🦀", "🌴", "⭐"],
    ["🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚", "🦀"],
    ["⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚"],
    ["🌴", "⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺"],
    ["🐚", "🦀", "🌴", "⭐", "🌺", "🐚", "🦀", "🌴"],
    ["🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚", "🦀"],
    ["⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺", "🐚"],
    ["🌴", "⭐", "🌺", "🐚", "🦀", "🌴", "⭐", "🌺"]
  ],
  "objective": "score",
  "target": 5000,
  "moves": 25,
  "tileTypes": ["🦀", "🌴", "⭐", "🌺", "🐚"],
  "mechanics": ["sand"],
  "blockers": [
    { "type": "sand", "row": 3, "col": 3 },
    { "type": "sand", "row": 3, "col": 4 },
    { "type": "sand", "row": 4, "col": 3 },
    { "type": "sand", "row": 4, "col": 4 }
  ],
  "description": "Score 5000 points while clearing sand!",
  "difficulty": "easy"
}
```

### Level 3: Advanced Level with Multiple Mechanics

```json
{
  "id": "level-6",
  "name": "Coral Reef Challenge",
  "board": [
    ["🦑", "🦐", "🐡", "🪝", "🦑", "🦐", "🐡", "🪝"],
    ["🦐", "🐡", "🪝", "🦑", "🦐", "🐡", "🪝", "🦑"],
    ["🐡", "🪝", "🦑", "🦐", "🐡", "🪝", "🦑", "🦐"],
    ["🪝", "🦑", "🦐", "🐡", "🪝", "🦑", "🦐", "🐡"],
    ["🦑", "🦐", "🐡", "🪝", "🦑", "🦐", "🐡", "🪝"],
    ["🦐", "🐡", "🪝", "🦑", "🦐", "🐡", "🪝", "🦑"],
    ["🐡", "🪝", "🦑", "🦐", "🐡", "🪝", "🦑", "🦐"],
    ["🪝", "🦑", "🦐", "🐡", "🪝", "🦑", "🦐", "🐡"]
  ],
  "objective": "score",
  "target": 10000,
  "moves": 45,
  "tileTypes": ["🦑", "🦐", "🐡", "🪝"],
  "mechanics": ["ice", "coral", "rainbow"],
  "blockers": [
    { "type": "coral", "row": 1, "col": 1 },
    { "type": "coral", "row": 1, "col": 6 },
    { "type": "coral", "row": 6, "col": 1 },
    { "type": "coral", "row": 6, "col": 6 },
    { "type": "ice", "row": 3, "col": 3 },
    { "type": "ice", "row": 3, "col": 4 },
    { "type": "ice", "row": 4, "col": 3 },
    { "type": "ice", "row": 4, "col": 4 }
  ],
  "specialTiles": [
    {
      "type": "rainbow",
      "row": 0,
      "col": 0,
      "properties": { "color": "random" }
    },
    {
      "type": "rainbow",
      "row": 0,
      "col": 7,
      "properties": { "color": "random" }
    },
    {
      "type": "rainbow",
      "row": 7,
      "col": 0,
      "properties": { "color": "random" }
    },
    {
      "type": "rainbow",
      "row": 7,
      "col": 7,
      "properties": { "color": "random" }
    }
  ],
  "description": "Score 10000 points using rainbow tiles to break coral and ice!",
  "difficulty": "hard"
}
```

## Using the Level Manager

The `LevelManager` class provides utilities for managing levels:

```typescript
import { levelManager } from '../utils/levelManager';

// Get a specific level
const level = levelManager.getLevel('level-1');

// Get all levels by difficulty
const easyLevels = levelManager.getLevelsByDifficulty('easy');

// Get next level
const nextLevel = levelManager.getNextLevel('level-1');

// Get level progress
const progress = levelManager.getLevelProgress(['level-1', 'level-2']);
```

## Creating Custom Levels

1. **Define the board layout**: Create an 8x8 array with tile types or null
2. **Set the objective**: Choose from available objective types
3. **Configure mechanics**: Add relevant mechanics for the level
4. **Add blockers**: Place obstacles strategically
5. **Include special tiles**: Add power-ups or special elements
6. **Test the level**: Use the validation function to ensure correctness

## Validation Rules

- Board must be exactly 8x8
- All tile types in the board must be included in tileTypes array
- Blockers and special tiles must be within board bounds (0-7)
- Target and moves should be reasonable for the difficulty

## Best Practices

1. **Start simple**: Begin with basic mechanics and add complexity
2. **Balance difficulty**: Consider moves vs target ratio
3. **Use mechanics purposefully**: Each mechanic should serve a purpose
4. **Test thoroughly**: Play through levels to ensure they're solvable
5. **Document clearly**: Provide clear descriptions for players

## File Structure

```
src/
├── types/
│   ├── game.ts          # Basic game types
│   └── levels.ts        # Level configuration types and examples
├── data/
│   └── levels.json      # JSON export of all levels
├── utils/
│   └── levelManager.ts  # Level management utilities
└── docs/
    └── LEVEL_CONFIGURATION.md  # This documentation
```

## Future Enhancements

- Level editor UI
- Dynamic level generation
- Level sharing system
- Analytics and difficulty adjustment
- Seasonal and event levels
