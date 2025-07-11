import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { GameBoard } from '../../components/GameBoard/GameBoard';
import { useGame } from '../../contexts/GameContext';
import { styles } from './styles';

interface GameScreenProps {
  // onNavigateToBeach: () => void; // Beach decorating temporarily disabled
}

export const GameScreen: React.FC<GameScreenProps> = ({}) => {
  const { gameState, currency, initGame } = useGame();
  const [variant] = useState<'sand' | 'sea'>('sand');

  const handleNewGame = () => {
    Alert.alert('New Game', 'Start a new level?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start', onPress: () => initGame(variant) },
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
