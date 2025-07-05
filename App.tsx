/**
 * Island Revive - Match-3 Puzzle Game
 * A React Native prototype for a match-3 mobile puzzle game with renovation/story meta layer
 */

import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GameProvider} from './src/contexts/GameContext';
import {GameScreen} from './src/screens/GameScreen';
import {LevelGameScreen} from './src/screens/LevelGameScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LevelSelectScreen} from './src/screens/LevelSelectScreen';
import {BeachScreen} from './src/screens/BeachScreen';
import LevelTester from './src/components/LevelTester';

type Screen =
  | 'home'
  | 'game'
  | 'level-game'
  | 'level-select'
  | 'beach'
  | 'tester';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home'); // Start with home screen
  const [selectedLevelId, setSelectedLevelId] = useState<string>('level-1');

  const navigateToHome = () => setCurrentScreen('home');
  const navigateToGame = () => setCurrentScreen('game');
  const navigateToLevelSelect = () => setCurrentScreen('level-select');
  const navigateToLevelGame = (levelId: string) => {
    setSelectedLevelId(levelId);
    setCurrentScreen('level-game');
  };
  // const navigateToBeach = () => setCurrentScreen('beach'); // Beach decorating temporarily disabled
  const navigateToTester = () => setCurrentScreen('tester');

  return (
    <GameProvider>
      <SafeAreaView style={styles.container}>
        {currentScreen === 'home' ? (
          <HomeScreen
            onNavigateToLevels={navigateToLevelSelect}
            onNavigateToSettings={() => console.log('Settings')}
            onNavigateToShop={() => console.log('Shop')}
            onNavigateToDailyRewards={() => console.log('Daily Rewards')}
          />
        ) : currentScreen === 'game' ? (
          <GameScreen />
        ) : currentScreen === 'level-select' ? (
          <LevelSelectScreen
            onNavigateToLevel={navigateToLevelGame}
            onNavigateBack={navigateToHome}
          />
        ) : currentScreen === 'level-game' ? (
          <LevelGameScreen
            onNavigateToTester={navigateToTester}
            initialLevelId={selectedLevelId}
          />
        ) : currentScreen === 'beach' ? (
          <BeachScreen onNavigateToGame={navigateToGame} />
        ) : (
          <LevelTester
            onLevelSelect={levelId => {
              console.log('Selected level:', levelId);
              navigateToLevelGame(levelId);
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
