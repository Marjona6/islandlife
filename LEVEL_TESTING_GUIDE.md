# 🎮 Level Testing Guide

## How to Test the Level Ordering System

### 🚀 Quick Start

1. **Run the app** - The app now starts with the Level Tester screen by default
2. **Explore levels** - You'll see all 10 levels listed in order
3. **Test functionality** - Use the buttons to test different features

### 📋 What You'll See

The Level Tester shows:

- **📊 Progress tracking** - Shows completion percentage
- **📋 All levels in order** - 10 levels from simple to complex
- **🎯 Level status** - ✅ Completed, 🎯 Available, 🔒 Locked
- **📈 Difficulty scores** - 1-5 scale based on mechanics and complexity
- **🎲 Statistics** - Breakdown by difficulty and objective

### 🧪 Testing Features

#### 1. **Run All Tests**

- Click "🧪 Run All Tests" to run comprehensive tests
- Check the console for detailed output
- Tests include: level ordering, navigation, validation

#### 2. **Test Individual Levels**

- Click "🔍 Test" on any level card
- Shows detailed level information in console
- Tests level configuration and properties

#### 3. **Simulate Progress**

- Click "✅ Complete" to mark levels as completed
- Watch the progress percentage update
- See how the next available level changes

#### 4. **Level Navigation**

- Click on any level card to select it
- Selected level shows with blue border
- Completed levels show with green background

### 📊 Level Order

The levels are designed to progress in difficulty:

1. **Level 1: Shell Collector** - Simple collect objective
2. **Level 2: Sandy Shores** - Score with sand mechanics
3. **Level 3: Frozen Tides** - Clear with ice obstacles
4. **Level 4: Deep Sea Drop** - Drop to targets
5. **Level 5: Explosive Combos** - Combo with bombs
6. **Level 6: Coral Reef Challenge** - Score with multiple mechanics
7. **Level 7: Crab Invasion** - Clear with crab mechanics
8. **Level 8: Net Fishing** - Collect with net obstacles
9. **Level 9: Rocky Waters** - Clear with rock obstacles
10. **Level 10: Island Life Master** - Ultimate challenge

### 🎯 Level Status System

- **🔒 Locked** - Not yet available (requires completing previous levels)
- **🎯 Available** - Ready to play (next in sequence)
- **✅ Completed** - Already finished

### 📈 Progress Tracking

The system tracks:

- **Total levels**: 10
- **Completed levels**: Based on your selections
- **Percentage**: Completion rate
- **Next level**: Automatically determined

### 🎲 Level Categories

#### By Difficulty:

- **Easy**: Levels 1-2
- **Medium**: Levels 3-5, 8
- **Hard**: Levels 6-7, 9-10

#### By Objective:

- **Collect**: 2 levels
- **Score**: 3 levels
- **Clear**: 3 levels
- **Drop**: 1 level
- **Combo**: 1 level

### 🔧 Console Output

When you run tests, check the console for:

```
🎮 Testing Level Ordering System

📊 Total levels available: 10

📋 All Levels in Order:
1. Shell Collector (level-1)
   Objective: collect - Target: 15
   Moves: 20 | Difficulty: easy (Score: 1/5)
   Mechanics: None

🧭 Testing Level Navigation:
Current level: Shell Collector
Next level: Sandy Shores
Previous level: None (first level)

📈 Level Progress Example:
Completed: 3/10 (30.0%)
Next level to play: Frozen Tides
```

### 🎮 Integration with Your Game

To integrate this with your actual game:

1. **Change the default screen** in `App.tsx`:

   ```typescript
   const [currentScreen, setCurrentScreen] = useState<Screen>('game'); // Change back to 'game'
   ```

2. **Add navigation buttons** to your game screens:

   ```typescript
   <TouchableOpacity onPress={() => setCurrentScreen('tester')}>
     <Text>Level Tester</Text>
   </TouchableOpacity>
   ```

3. **Use the level manager** in your game logic:

   ```typescript
   import {levelManager} from './src/utils/levelManager';

   const currentLevel = levelManager.getLevel('level-1');
   const nextLevel = levelManager.getNextLevel('level-1');
   ```

### 🎯 Next Steps

1. **Test the ordering** - Verify levels progress logically
2. **Check navigation** - Ensure next/previous works correctly
3. **Validate levels** - Confirm all levels are properly configured
4. **Integrate with game** - Connect to your actual game mechanics
5. **Add persistence** - Save progress to AsyncStorage

### 🐛 Troubleshooting

- **Levels not showing**: Check that `LEVEL_CONFIGS` is properly imported
- **Navigation not working**: Verify level IDs match exactly
- **Console errors**: Check for TypeScript compilation issues
- **Progress not updating**: Ensure state is properly managed

The level system is now ready for testing and integration with your match-3 game!
