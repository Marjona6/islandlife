# 🎮 How to Play the Levels

## 🚀 Getting Started

1. **Run the app** - It now starts with the Level Game screen
2. **You'll see Level 1** - "Shell Collector" with all the level details
3. **Click "Make Move"** - This simulates playing the match-3 game
4. **Watch progress** - See your score/collection/clears increase
5. **Complete the level** - Reach the target to unlock the next level

## 🎯 How to Actually Play

### Current Implementation

Right now, the game uses a **simplified simulation** where:

- Clicking "Make Move" simulates making a move in the match-3 game
- Progress is randomly generated based on the level objective
- You can see the actual game board below, but it's not connected yet

### To Play the Real Match-3 Game

1. **Use the existing GameBoard** - The match-3 mechanics are already implemented
2. **Connect the level system** - The LevelGameScreen needs to be connected to the actual game logic
3. **Replace simulation** - Instead of random progress, use real match-3 results

## 📊 Difficulty Score Explained

The difficulty score (1-5) is calculated based on multiple factors:

### Base Score (1-3 points)

- **Easy**: 1 point
- **Medium**: 2 points
- **Hard**: 3 points

### Additional Factors (up to 2 more points)

- **Mechanics**: Each mechanic adds 0.2 points (max 1 point)
- **Blockers**: Each blocker adds 0.1 points (max 0.5 points)
- **Special Tiles**: Each special tile adds 0.1 points (max 0.5 points)
- **Move Efficiency**: Target/moves ratio adds up to 0.5 points

### Example Calculations

**Level 1: Shell Collector (Easy)**

- Base: 1 point (easy)
- Mechanics: 0 points (none)
- Blockers: 0 points (none)
- Special Tiles: 0 points (none)
- Move Efficiency: 15/20 = 0.75 \* 0.1 = 0.075 points
- **Total: 1/5** ✅

**Level 6: Coral Reef Challenge (Hard)**

- Base: 3 points (hard)
- Mechanics: 3 mechanics \* 0.2 = 0.6 points
- Blockers: 8 blockers \* 0.1 = 0.8 points (capped at 0.5)
- Special Tiles: 4 special tiles \* 0.1 = 0.4 points
- Move Efficiency: 10000/45 = 222 \* 0.1 = 22.2 (capped at 0.5)
- **Total: 4.9/5** ✅

## 🎮 Level Objectives

### 1. **Collect** (Levels 1, 8)

- Goal: Collect specific number of tiles
- Example: Collect 15 shells
- Progress: Each match of the target tile counts

### 2. **Score** (Levels 2, 6, 10)

- Goal: Reach a target score
- Example: Score 5000 points
- Progress: Each match adds points

### 3. **Clear** (Levels 3, 7, 9)

- Goal: Clear specific number of tiles
- Example: Clear 40 tiles
- Progress: Each tile cleared counts

### 4. **Drop** (Level 4)

- Goal: Drop items to targets
- Example: Drop 8 sea creatures to collectors
- Progress: Each successful drop counts

### 5. **Combo** (Level 5)

- Goal: Achieve specific number of combos
- Example: Create 5 combos
- Progress: Each combo counts

## 🎯 Level Status System

- **🔒 Locked**: Not available yet (needs previous levels completed)
- **🎯 Available**: Ready to play (next in sequence)
- **✅ Completed**: Already finished

## 🎮 Navigation

### In Level Game Screen:

- **← Previous**: Go to previous level (if available)
- **Make Move**: Simulate a game move
- **Next →**: Go to next level (only when current level is complete)
- **Restart Level**: Start the current level over
- **Level Tester**: Go to the level selection screen

### In Level Tester:

- **Click any level** to select it
- **Click "🔍 Test"** to see detailed level info
- **Click "✅ Complete"** to simulate level completion
- **Click "🧪 Run All Tests"** to run comprehensive tests

## 🔧 Integration with Real Game

To connect this to your actual match-3 game:

1. **Replace simulation** in `LevelGameScreen.tsx`:

   ```typescript
   // Instead of random progress, use real game results
   const handleMove = () => {
     // Get actual match-3 results
     const matchResults = processMatch3Move();

     // Update progress based on real results
     updateLevelProgress(matchResults);
   };
   ```

2. **Connect to GameBoard**:

   ```typescript
   // Pass level configuration to GameBoard
   <GameBoard
     variant={currentLevel.mechanics.includes('sea') ? 'sea' : 'sand'}
     levelConfig={currentLevel}
     onMoveComplete={handleMoveComplete}
   />
   ```

3. **Add level-specific mechanics**:
   - Sand clearing
   - Ice breaking
   - Bomb explosions
   - Rainbow tile effects
   - Crab invasions

## 🎯 Next Steps

1. **Test the current system** - Play through the simulated levels
2. **Understand the mechanics** - See how different objectives work
3. **Connect to real game** - Replace simulation with actual match-3
4. **Add persistence** - Save progress between sessions
5. **Polish the UI** - Make it look more polished

The level system is fully functional for testing! You can now see how the progression works and understand the difficulty calculations.
