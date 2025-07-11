import { levelManager, getLevelDifficulty } from './levelManager';

// Test script to demonstrate level ordering and navigation
export const testLevelOrdering = () => {
  console.log('🎮 Testing Level Ordering System\n');

  // Get all levels in order
  const allLevels = levelManager.getAllLevels();
  console.log(`📊 Total levels available: ${allLevels.length}\n`);

  // Display all levels in order
  console.log('📋 All Levels in Order:');
  allLevels.forEach((level, index) => {
    const difficultyScore = getLevelDifficulty(level);
    console.log(`${index + 1}. ${level.name} (${level.id})`);
    console.log(`   Objective: ${level.objective} - Target: ${level.target}`);
    console.log(
      `   Moves: ${level.moves} | Difficulty: ${level.difficulty} (Score: ${difficultyScore}/5)`,
    );
    console.log(`   Mechanics: ${level.mechanics.join(', ') || 'None'}`);
    console.log('');
  });

  // Test navigation between levels
  console.log('🧭 Testing Level Navigation:');
  const testLevelId = 'level-1';
  const currentLevel = levelManager.getLevel(testLevelId);

  if (currentLevel) {
    console.log(`Current level: ${currentLevel.name}`);

    const nextLevel = levelManager.getNextLevel(testLevelId);
    if (nextLevel) {
      console.log(`Next level: ${nextLevel.name}`);
    } else {
      console.log('Next level: None (last level)');
    }

    const prevLevel = levelManager.getPreviousLevel(testLevelId);
    if (prevLevel) {
      console.log(`Previous level: ${prevLevel.name}`);
    } else {
      console.log('Previous level: None (first level)');
    }
  }

  console.log('\n📈 Level Progress Example:');
  const completedLevels = ['level-1', 'level-2', 'level-3'];
  const progress = levelManager.getLevelProgress(completedLevels);
  console.log(
    `Completed: ${progress.completed}/${
      progress.total
    } (${progress.percentage.toFixed(1)}%)`,
  );
  if (progress.nextLevel) {
    console.log(`Next level to play: ${progress.nextLevel.name}`);
  }

  console.log('\n🎯 Levels by Difficulty:');
  const difficultyCounts = levelManager.getLevelCountByDifficulty();
  Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
    console.log(`${difficulty}: ${count} levels`);
  });

  console.log('\n🎲 Levels by Objective:');
  const objectives = ['collect', 'score', 'clear', 'drop', 'combo'];
  objectives.forEach(objective => {
    const levels = levelManager.getLevelsByObjective(objective);
    console.log(`${objective}: ${levels.length} levels`);
  });

  console.log('\n⚡ Levels with Specific Mechanics:');
  const mechanics = ['sand', 'ice', 'bombs', 'rainbow'];
  mechanics.forEach(mechanic => {
    const levels = levelManager.getLevelsByMechanics([mechanic]);
    console.log(`${mechanic}: ${levels.length} levels`);
  });
};

// Test specific level functionality
export const testSpecificLevel = (levelId: string) => {
  console.log(`\n🔍 Testing Level: ${levelId}`);

  const level = levelManager.getLevel(levelId);
  if (!level) {
    console.log('❌ Level not found');
    return;
  }

  console.log(`Name: ${level.name}`);
  console.log(`Objective: ${level.objective} - Target: ${level.target}`);
  console.log(`Moves: ${level.moves}`);
  console.log(`Difficulty: ${level.difficulty}`);
  console.log(`Mechanics: ${level.mechanics.join(', ') || 'None'}`);

  if (level.blockers && level.blockers.length > 0) {
    console.log(`Blockers: ${level.blockers.length} obstacles`);
    level.blockers.forEach(blocker => {
      console.log(`  - ${blocker.type} at (${blocker.row}, ${blocker.col})`);
    });
  }

  if (level.specialTiles && level.specialTiles.length > 0) {
    console.log(`Special Tiles: ${level.specialTiles.length} special tiles`);
    level.specialTiles.forEach(tile => {
      console.log(`  - ${tile.type} at (${tile.row}, ${tile.col})`);
    });
  }

  const difficultyScore = getLevelDifficulty(level);
  console.log(`Difficulty Score: ${difficultyScore}/5`);
};

// Test level validation
export const testLevelValidation = () => {
  console.log('\n✅ Testing Level Validation:');

  const allLevels = levelManager.getAllLevels();
  let validCount = 0;
  let invalidCount = 0;

  allLevels.forEach(level => {
    const isValid = levelManager.validateLevel(level);
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`❌ Invalid level: ${level.id}`);
    }
  });

  console.log(`Valid levels: ${validCount}`);
  console.log(`Invalid levels: ${invalidCount}`);
  console.log(`Total levels: ${allLevels.length}`);
};

// Run all tests
export const runAllTests = () => {
  console.log('🚀 Running Level System Tests\n');

  testLevelOrdering();
  testSpecificLevel('level-1');
  testSpecificLevel('level-5');
  testSpecificLevel('level-10');
  testLevelValidation();

  console.log('\n✨ All tests completed!');
};

// Export for use in React Native
export default {
  testLevelOrdering,
  testSpecificLevel,
  testLevelValidation,
  runAllTests,
};
