/**
 * Island Revive - Match-3 Puzzle Game
 * A React Native prototype for a match-3 mobile puzzle game with renovation/story meta layer
 */

import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GameProvider} from './src/contexts/GameContext';
import {GameScreen} from './src/screens/GameScreen';
import {BeachScreen} from './src/screens/BeachScreen';

type Screen = 'game' | 'beach';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('game');

  const navigateToGame = () => setCurrentScreen('game');
  const navigateToBeach = () => setCurrentScreen('beach');

  return (
    <GameProvider>
      <SafeAreaView style={styles.container}>
        {currentScreen === 'game' ? (
          <GameScreen onNavigateToBeach={navigateToBeach} />
        ) : (
          <BeachScreen onNavigateToGame={navigateToGame} />
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
