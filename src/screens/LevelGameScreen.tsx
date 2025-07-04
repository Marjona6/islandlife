import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {GameBoard} from '../components/GameBoard';
import {useGame} from '../contexts/GameContext';
import {levelManager, getLevelDifficulty} from '../utils/levelManager';

interface LevelGameScreenProps {
  onNavigateToBeach: () => void;
  onNavigateToTester: () => void;
  initialLevelId?: string;
}

export const LevelGameScreen: React.FC<LevelGameScreenProps> = ({
  onNavigateToBeach,
  onNavigateToTester,
  initialLevelId = 'level-1',
}) => {
  const {gameState, currency, initGame} = useGame();
  const [currentLevelId, setCurrentLevelId] = useState(initialLevelId);
  const [movesMade, setMovesMade] = useState(0);

  const currentLevel = levelManager.getLevel(currentLevelId);
  const nextLevel = levelManager.getNextLevel(currentLevelId);
  const prevLevel = levelManager.getPreviousLevel(currentLevelId);

  useEffect(() => {
    if (currentLevel) {
      setMovesMade(0);
      // Initialize game with level's tile types
      // Check if level uses sea tiles by looking at the first tile type
      const isSeaLevel = currentLevel.tileTypes.some(tile =>
        ['🦑', '🦐', '🐡', '🪝'].includes(tile),
      );
      initGame(isSeaLevel ? 'sea' : 'sand');
    }
  }, [currentLevelId, currentLevel, initGame]);

  // Simple progress tracking - just use game state directly
  const currentProgress = {
    score: gameState.score,
    collected: currency.shells, // Use actual collected shells for collect objectives
    cleared: Math.floor(gameState.score / 50), // Rough estimate for clear objectives
    combos: gameState.combos,
  };

  const handleMove = () => {
    console.log('How to Play button pressed!');

    // Show level-specific instructions
    let instructions =
      'Swipe tiles on the game board to match 3 or more of the same type!\n\n';

    if (currentLevel) {
      switch (currentLevel.objective) {
        case 'score':
          instructions += `🎯 Objective: Score ${currentLevel.target} points\n`;
          instructions +=
            '💡 Tip: Create longer matches and combos for higher scores!';
          break;
        case 'collect':
          instructions += `🎯 Objective: Collect ${currentLevel.target} ${currentLevel.tileTypes[0]}\n`;
          instructions += '💡 Tip: Focus on matching the target tile type!';
          break;
        case 'clear':
          instructions += `🎯 Objective: Clear ${currentLevel.target} tiles\n`;
          instructions += '💡 Tip: Any matches will count toward your goal!';
          break;
        case 'combo':
          instructions += `🎯 Objective: Create ${currentLevel.target} combos\n`;
          instructions += '💡 Tip: Chain matches together for combos!';
          break;
        default:
          instructions += '💡 Tip: Create matches to progress!';
      }
    }

    Alert.alert('How to Play', instructions, [
      {text: 'Got it!', style: 'default'},
    ]);
  };

  const handleNextLevel = () => {
    if (nextLevel) {
      setCurrentLevelId(nextLevel.id);
    } else {
      Alert.alert('Congratulations!', 'You have completed all levels!');
    }
  };

  const handlePrevLevel = () => {
    if (prevLevel) {
      setCurrentLevelId(prevLevel.id);
    }
  };

  const handleRestartLevel = () => {
    Alert.alert('Restart Level', 'Start this level over?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Restart',
        onPress: () => {
          setMovesMade(0);
        },
      },
    ]);
  };

  const isLevelComplete = () => {
    if (!currentLevel) return false;

    switch (currentLevel.objective) {
      case 'score':
        return currentProgress.score >= currentLevel.target;
      case 'collect':
        return currentProgress.collected >= currentLevel.target;
      case 'clear':
        return currentProgress.cleared >= currentLevel.target;
      case 'combo':
        return currentProgress.combos >= currentLevel.target;
      case 'drop':
        return currentProgress.collected >= currentLevel.target;
      default:
        return false;
    }
  };

  const isLevelFailed = () => {
    return (
      currentLevel && movesMade >= currentLevel.moves && !isLevelComplete()
    );
  };

  const getProgressText = () => {
    if (!currentLevel) return '';

    switch (currentLevel.objective) {
      case 'score':
        return `Score: ${currentProgress.score}/${currentLevel.target}`;
      case 'collect':
        return `Collected: ${currentProgress.collected}/${currentLevel.target}`;
      case 'clear':
        return `Cleared: ${currentProgress.cleared}/${currentLevel.target}`;
      case 'combo':
        return `Combos: ${currentProgress.combos}/${currentLevel.target}`;
      case 'drop':
        return `Dropped: ${currentProgress.collected}/${currentLevel.target}`;
      default:
        return '';
    }
  };

  if (!currentLevel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Level not found!</Text>
      </SafeAreaView>
    );
  }

  const difficultyScore = getLevelDifficulty(currentLevel);

  // Debug logging for sand blockers (only log once per level change)
  useEffect(() => {
    // Log sand blockers when level changes (for debugging)
    const sandBlockers =
      currentLevel.blockers
        ?.filter(b => b.type === 'sand')
        .map(b => ({row: b.row, col: b.col})) || [];
    if (sandBlockers.length > 0) {
      console.log('LevelGameScreen: Sand blockers for level:', sandBlockers);
    }
  }, [currentLevelId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currencyContainer}>
          <Text style={styles.currencyText}>🐚 {currency.shells}</Text>
          <Text style={styles.currencyText}>🔑 {currency.keys}</Text>
        </View>
        <TouchableOpacity
          style={styles.beachButton}
          onPress={onNavigateToBeach}>
          <Text style={styles.beachButtonText}>🏖️ Beach</Text>
        </TouchableOpacity>
      </View>

      {/* Level Info */}
      <View style={styles.levelInfo}>
        <Text style={styles.levelTitle}>{currentLevel.name}</Text>
        <Text style={styles.levelDescription}>{currentLevel.description}</Text>
        <View style={styles.levelStats}>
          <Text style={styles.statText}>
            Difficulty: {currentLevel.difficulty} ({difficultyScore}/5)
          </Text>
          <Text style={styles.statText}>
            Objective: {currentLevel.objective}
          </Text>
          <Text style={styles.statText}>
            Moves: {movesMade}/{currentLevel.moves}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{getProgressText()}</Text>
        {isLevelComplete() && (
          <Text style={styles.completeText}>🎉 Level Complete!</Text>
        )}
        {isLevelFailed() && (
          <Text style={styles.failedText}>❌ Out of Moves!</Text>
        )}
      </View>

      {/* Game Board */}
      <View style={styles.boardContainer}>
        <GameBoard
          variant={
            currentLevel.tileTypes.some(tile =>
              ['🦑', '🦐', '🐡', '🪝'].includes(tile),
            )
              ? 'sea'
              : 'sand'
          }
          sandBlockers={
            currentLevel.blockers
              ?.filter(b => b.type === 'sand')
              .map(b => ({row: b.row, col: b.col})) || []
          }
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePrevLevel}
            disabled={!prevLevel}>
            <Text style={styles.buttonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleMove}
            disabled={isLevelComplete()}>
            <Text style={styles.buttonText}>
              {isLevelComplete() ? 'Complete!' : 'How to Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleNextLevel}
            disabled={!nextLevel || !isLevelComplete()}>
            <Text style={styles.buttonText}>Next →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={handleRestartLevel}>
            <Text style={styles.buttonText}>Restart Level</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testerButton]}
            onPress={onNavigateToTester}>
            <Text style={styles.buttonText}>Level Tester</Text>
          </TouchableOpacity>
        </View>
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
  levelInfo: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  progressContainer: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 10,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  failedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 5,
  },
  boardContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 300,
    maxHeight: 400,
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  button: {
    backgroundColor: '#32cd32',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  restartButton: {
    backgroundColor: '#FF9800',
  },
  testerButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999',
  },
  mechanicsInfo: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 10,
    borderRadius: 10,
  },
  mechanicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mechanicTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  mechanicText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default LevelGameScreen;
