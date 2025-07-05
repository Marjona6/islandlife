import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {GameBoard} from '../components/GameBoard';
import {useGame} from '../contexts/GameContext';

interface GameScreenProps {
  // onNavigateToBeach: () => void; // Beach decorating temporarily disabled
}

export const GameScreen: React.FC<GameScreenProps> = ({}) => {
  const {gameState, currency, initGame} = useGame();
  const [variant] = useState<'sand' | 'sea'>('sand');

  const handleNewGame = () => {
    Alert.alert('New Game', 'Start a new level?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Start', onPress: () => initGame(variant)},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currencyContainer}>
          <Text style={styles.currencyText}>🐚 {currency.shells}</Text>
          <Text style={styles.currencyText}>🔑 {currency.keys}</Text>
        </View>
        {/* Beach decorating temporarily disabled
        <TouchableOpacity
          style={styles.beachButton}
          onPress={onNavigateToBeach}>
          <Text style={styles.beachButtonText}>🏖️ Beach</Text>
        </TouchableOpacity>
        */}
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.levelText}>Level 1</Text>
        <Text style={styles.comboText}>
          Combos: {gameState.combos}/{gameState.targetCombos}
        </Text>
        <Text style={styles.scoreText}>Score: {gameState.score}</Text>
      </View>

      {/* Game Board */}
      <View style={styles.boardContainer}>
        <GameBoard variant={variant} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleNewGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Swipe tiles to swap with adjacent tiles
        </Text>
        <Text style={styles.instructionText}>
          Or tap two tiles to swap them
        </Text>
        <Text style={styles.instructionText}>
          Match 3+ in a row to clear them
        </Text>
        <Text style={styles.instructionText}>
          Complete {gameState.targetCombos} combos to win!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4682b4',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  beachButton: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  beachButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameInfo: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  comboText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 16,
    color: '#888',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  controls: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#32cd32',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  instructions: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 10,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});
