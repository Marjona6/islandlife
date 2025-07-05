import {levelManager} from './levelManager';

// Test script to verify level manager is working with JSON file
export const testLevelManager = () => {
  console.log('=== Testing Level Manager ===');

  // Test loading all levels
  const allLevels = levelManager.getAllLevels();
  console.log(`Total levels loaded: ${allLevels.length}`);

  // Test getting specific level
  const level2 = levelManager.getLevel('level-2');
  if (level2) {
    console.log(`Level 2 name: ${level2.name}`);
    console.log(
      `Level 2 sand blockers: ${
        level2.blockers?.filter(b => b.type === 'sand').length || 0
      }`,
    );
  }

  // Test getting levels by difficulty
  const easyLevels = levelManager.getLevelsByDifficulty('easy');
  console.log(`Easy levels: ${easyLevels.length}`);

  console.log('=== Level Manager Test Complete ===');
};
