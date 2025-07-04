/**
 * Island Revive - Match-3 Puzzle Game
 * A React Native prototype for a match-3 mobile puzzle game with renovation/story meta layer
 */

import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GameProvider} from './src/contexts/GameContext';
import {GameScreen} from './src/screens/GameScreen';
import {LevelGameScreen} from './src/screens/LevelGameScreen';
import {BeachScreen} from './src/screens/BeachScreen';
import LevelTester from './src/components/LevelTester';

type Screen = 'game' | 'level-game' | 'beach' | 'tester';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('level-game'); // Start with level game

  const navigateToGame = () => setCurrentScreen('game');
  const navigateToBeach = () => setCurrentScreen('beach');
  const navigateToTester = () => setCurrentScreen('tester');

  return (
    <GameProvider>
      <SafeAreaView style={styles.container}>
        {currentScreen === 'game' ? (
          <GameScreen onNavigateToBeach={navigateToBeach} />
        ) : currentScreen === 'level-game' ? (
          <LevelGameScreen
            onNavigateToBeach={navigateToBeach}
            onNavigateToTester={navigateToTester}
          />
        ) : currentScreen === 'beach' ? (
          <BeachScreen onNavigateToGame={navigateToGame} />
        ) : (
          <LevelTester
            onLevelSelect={levelId => {
              console.log('Selected level:', levelId);
              // Navigate to level game with selected level
              setCurrentScreen('level-game');
            }}
          />
        )}
      </SafeAreaView>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
