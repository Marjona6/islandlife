/**
 * Island Revive - Match-3 Puzzle Game
 * A React Native prototype for a match-3 mobile puzzle game with renovation/story meta layer
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GameProvider} from './src/contexts/GameContext';
import {GameScreen} from './src/screens/GameScreen';
import {LevelGameScreen} from './src/screens/LevelGameScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LevelSelectScreen} from './src/screens/LevelSelectScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {BeachScreen} from './src/screens/BeachScreen';
import LevelTester from './src/components/LevelTester';
import {initializeFirebase} from './src/services/firebase';
import {gameModeService} from './src/services/gameMode';
import {userProgressService} from './src/services/userProgress';

type Screen =
  | 'home'
  | 'game'
  | 'level-game'
  | 'level-select'
  | 'settings'
  | 'beach'
  | 'tester';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('level-1');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize Firebase
      initializeFirebase();

      // Initialize game mode and user progress services
      await gameModeService.initialize();
      await userProgressService.initialize();

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing services:', error);
      setIsInitialized(true); // Continue anyway
    }
  };

  const navigateToHome = () => setCurrentScreen('home');
  const navigateToGame = () => setCurrentScreen('game');
  const navigateToLevelSelect = () => setCurrentScreen('level-select');
  const navigateToLevelGame = (levelId: string) => {
    setSelectedLevelId(levelId);
    setCurrentScreen('level-game');
  };
  const navigateToSettings = () => setCurrentScreen('settings');
  const navigateToTester = () => setCurrentScreen('tester');

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <GameProvider>
          <HomeScreen
            onNavigateToLevels={navigateToLevelSelect}
            onNavigateToLevel={navigateToLevelGame}
            onNavigateToSettings={navigateToSettings}
            onNavigateToShop={() => console.log('Shop')}
            onNavigateToDailyRewards={() => console.log('Daily Rewards')}
          />
        </GameProvider>
      </SafeAreaView>
    );
  }

  return (
    <GameProvider>
      <SafeAreaView style={styles.container}>
        {currentScreen === 'home' ? (
          <HomeScreen
            onNavigateToLevels={navigateToLevelSelect}
            onNavigateToLevel={navigateToLevelGame}
            onNavigateToSettings={navigateToSettings}
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
        ) : currentScreen === 'settings' ? (
          <SettingsScreen onNavigateBack={navigateToHome} />
        ) : currentScreen === 'beach' ? (
          <BeachScreen onNavigateToGame={navigateToGame} />
        ) : (
          <LevelTester
            onNavigateToLevel={navigateToLevelGame}
            onNavigateBack={navigateToHome}
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
