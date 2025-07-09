# Buried Treasure Level Demo

## 🎮 How to Test Level 5

### Prerequisites

- Node.js 18 installed
- All dependencies installed (`npm install`)

### Running the Demo

1. **Start the development server:**

   ```bash
   nvm use 18
   npm start
   ```

2. **Navigate to Level 5:**

   - Open the app in your browser/emulator
   - Go to the level selection screen
   - Select "Level 5: Buried Treasure"

3. **Gameplay Instructions:**
   - **Objective**: Collect 8 hidden treasures
   - **Moves**: 35 available
   - **Strategy**: Create matches adjacent to sand tiles (🏖️) to clear them

### 🏖️ Sand Tile Mechanics

**Level 1 Sand (Light Brown):**

- Requires 1 adjacent match to clear
- Shows as 🏖️ emoji
- May or may not contain treasure

**Level 2 Sand (Darker Brown):**

- Requires 2 adjacent matches to clear
- Tougher to break through
- May contain treasure

### 💎 Treasure Types

Once sand is cleared, you may find:

- **💎 Diamond** - Rare and valuable
- **🪙 Gold Coin** - Classic treasure
- **🏺 Ancient Vase** - Historical artifact
- **💍 Ring** - Precious jewelry

### 🎯 Strategy Tips

1. **Focus on Sand Tiles**: Create matches adjacent to sand tiles to clear them
2. **Plan Your Moves**: Level 2 sand requires multiple matches - plan accordingly
3. **Avoid Decoys**: Some sand tiles don't contain treasure - don't waste moves
4. **Quick Collection**: Once treasures are revealed, match them quickly
5. **Watch Your Progress**: Monitor "Treasures: X/8" counter

### 🏆 Victory Conditions

- **Win**: Collect all 8 treasures before running out of moves
- **Lose**: Run out of moves before collecting all treasures

### 🧪 Testing the Implementation

Run the specific tests for buried treasure:

```bash
npm test -- --testPathPattern=buriedTreasure.test.ts
```

### 📊 Level 5 Configuration

```json
{
  "id": "level-5",
  "name": "Buried Treasure",
  "objective": "buried-treasure",
  "target": 8,
  "moves": 35,
  "difficulty": "medium",
  "blockers": [
    {"type": "sand", "row": 1, "col": 1, "sandLevel": 1, "hasTreasure": true},
    {"type": "sand", "row": 1, "col": 2, "sandLevel": 1, "hasTreasure": false},
    {"type": "sand", "row": 1, "col": 5, "sandLevel": 2, "hasTreasure": true}
    // ... 11 more sand blockers
  ]
}
```

### 🔧 Technical Implementation

The buried treasure mechanic includes:

- **New tile types**: 💎, 🪙, 🏺, 💍
- **Sand level system**: 1 or 2 matches required
- **Treasure tracking**: Progress counter and victory detection
- **Visual feedback**: Sand tiles show as 🏖️, treasures have distinct appearances

### 🎨 Visual Features

- **Progress Display**: "Treasures: X/8 collected"
- **Sand Tiles**: 🏖️ emoji for sand blockers
- **Treasure Tiles**: Distinct emojis for each treasure type
- **Victory Screen**: Celebration when all treasures are collected

### 🚀 Future Enhancements

Potential improvements for future versions:

- Sand breaking animations
- Sound effects for treasure discovery
- Multi-layer sand (3+ levels)
- Special treasure types with unique properties
- Treasure collection counter with sparkle effects
- Power-ups that can clear multiple sand layers

---

**Enjoy exploring the buried treasures! 🏴‍☠️💎**
