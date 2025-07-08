import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import {GameBoard} from '../components/GameBoard';
import {VictoryScreen} from '../components/VictoryScreen';
import {useGame} from '../contexts/GameContext';
import {levelManager} from '../utils/levelManager';
import {testLevelManager} from '../utils/testLevelManager';

interface LevelGameScreenProps {
  // onNavigateToBeach: () => void; // Beach decorating temporarily disabled
  onNavigateToTester: () => void;
  initialLevelId?: string;
}

export const LevelGameScreen: React.FC<LevelGameScreenProps> = ({
  // onNavigateToBeach, // Beach decorating temporarily disabled
  onNavigateToTester,
  initialLevelId = 'level-1',
}) => {
  const {gameState, currency, dispatchGame, dispatchCurrency} = useGame();
  const [currentLevelId, setCurrentLevelId] = useState(initialLevelId);
  const [movesMade, setMovesMade] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [droppedItems, setDroppedItems] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentLevel = levelManager.getLevel(currentLevelId);
  const nextLevel = levelManager.getNextLevel(currentLevelId);
  const prevLevel = levelManager.getPreviousLevel(currentLevelId);

  useEffect(() => {
    testLevelManager();
  }, []);

  useEffect(() => {
    if (!currentLevel) return;
    setMovesMade(0);
    setDroppedItems(0);
    setShowLevelIntro(true);
    const isSeaLevel = currentLevel.tileTypes.some(tile =>
      ['🦑', '🦐', '🐡', '🪝'].includes(tile),
    );
    const sandBlockers =
      currentLevel.blockers
        ?.filter(b => b.type === 'sand')
        .map(b => ({row: b.row, col: b.col, hasUmbrella: true})) || [];
    dispatchGame({
      type: 'INIT_BOARD_FROM_LEVEL',
      payload: {
        levelBoard: currentLevel.board,
        variant: isSeaLevel ? 'sea' : 'sand',
        sandBlockers: sandBlockers.map(sb => ({row: sb.row, col: sb.col})),
      },
    });
    if (sandBlockers.length > 0) {
      dispatchGame({type: 'SET_SAND_BLOCKERS', payload: sandBlockers});
    }
  }, [currentLevelId, currentLevel, dispatchGame]);

  // Simple progress tracking - just use game state directly
  const currentProgress = useMemo(
    () => ({
      score: gameState.score,
      collected: currency.shells,
      cleared: Math.floor(gameState.score / 50),
      combos: gameState.combos,
      dropped: droppedItems,
    }),
    [gameState.score, currency.shells, gameState.combos, droppedItems],
  );

  // Event-driven level completion check
  const checkLevelCompletion = useCallback(() => {
    console.log('🔍 checkLevelCompletion called:', {
      hasCurrentLevel: !!currentLevel,
      showVictory,
      isTransitioning,
      objective: currentLevel?.objective,
      sandBlockersLength: gameState.sandBlockers.length,
    });

    if (!currentLevel || showVictory || isTransitioning) {
      console.log('🔍 checkLevelCompletion early return:', {
        noCurrentLevel: !currentLevel,
        showVictory,
        isTransitioning,
      });
      return;
    }

    let isComplete = false;
    switch (currentLevel.objective) {
      case 'score':
        isComplete = currentProgress.score >= currentLevel.target;
        break;
      case 'collect':
        isComplete = currentProgress.collected >= currentLevel.target;
        break;
      case 'clear':
        isComplete = currentProgress.cleared >= currentLevel.target;
        break;
      case 'combo':
        isComplete = currentProgress.combos >= currentLevel.target;
        break;
      case 'drop':
        isComplete = currentProgress.dropped >= currentLevel.target;
        break;
      case 'sand-clear':
        isComplete = gameState.sandBlockers.length === 0;
        break;
      default:
        isComplete = false;
    }

    // Add debug logging for emulator troubleshooting
    if (currentLevel.objective === 'sand-clear') {
      console.log('🔍 Victory Check Debug:', {
        sandBlockersLength: gameState.sandBlockers.length,
        isComplete,
        showVictory,
        isTransitioning,
        objective: currentLevel.objective,
        target: currentLevel.target,
        currentProgress,
      });
    }

    if (isComplete) {
      console.log('🎉 Level complete detected, starting transition...');
      setIsTransitioning(true);

      // Increase delay for emulator compatibility
      setTimeout(() => {
        console.log('🎊 Transition complete, showing victory screen');
        setShowVictory(true);
        setIsTransitioning(false);
      }, 2000); // Increased to 2 seconds for emulator
    } else {
      console.log('🔍 Level not complete yet:', {
        objective: currentLevel.objective,
        isComplete,
        sandBlockersLength: gameState.sandBlockers.length,
      });
    }
  }, [
    currentLevel,
    currentProgress,
    gameState.sandBlockers.length,
    showVictory,
    isTransitioning,
  ]);

  // Monitor sand blockers state changes and check for victory
  useEffect(() => {
    console.log('🏖️ Sand blockers state changed:', {
      length: gameState.sandBlockers.length,
      blockers: gameState.sandBlockers,
    });

    // Immediate victory check when sand blockers change
    if (
      currentLevel?.objective === 'sand-clear' &&
      gameState.sandBlockers.length === 0
    ) {
      console.log(
        '🏆 Immediate victory check triggered by sand blockers change',
      );
      setTimeout(() => checkLevelCompletion(), 100);
    }
  }, [gameState.sandBlockers, currentLevel, checkLevelCompletion]);

  // Legacy function for backward compatibility (used in some places)
  const isLevelComplete = useCallback(() => {
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
        return currentProgress.dropped >= currentLevel.target;
      case 'sand-clear':
        return gameState.sandBlockers.length === 0;
      default:
        return false;
    }
  }, [currentLevel, currentProgress, gameState.sandBlockers.length]);

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
        case 'sand-clear':
          instructions += `🎯 Objective: Clear all sand blockers\n`;
          instructions +=
            '💡 Tip: Create matches adjacent to sand blockers to clear them!';
          break;
        default:
          instructions += '💡 Tip: Create matches to progress!';
      }
    }

    Alert.alert('How to Play', instructions, [
      {text: 'Got it!', style: 'default'},
    ]);
  };

  const handleGameMove = () => {
    setMovesMade(prev => prev + 1);
  };

  const handleItemDrop = (count: number = 1) => {
    console.log('=== COCONUT DROP COUNTER INCREMENT ===');
    console.log('Previous dropped items count:', droppedItems);
    console.log('Current level target:', currentLevel?.target);
    console.log('Incrementing dropped items counter by:', count);
    setDroppedItems(prev => {
      const newCount = prev + count;
      console.log('New dropped items count:', newCount);

      // Check for level completion using the new count directly
      if (
        currentLevel?.objective === 'drop' &&
        newCount >= currentLevel.target
      ) {
        console.log('Level complete detected, starting transition...');
        setIsTransitioning(true);

        // Add a delay to ensure all animations and cascades complete
        setTimeout(() => {
          console.log('Transition complete, showing victory screen');
          setShowVictory(true);
          setIsTransitioning(false);
        }, 1000); // 1 second delay
      }

      return newCount;
    });
  };

  // Callback for GameBoard to trigger level completion checks
  const handleGameAction = useCallback(() => {
    console.log('🎮 handleGameAction called');
    // Check for level completion after any game action
    setTimeout(() => {
      console.log('🎮 handleGameAction timeout - calling checkLevelCompletion');
      checkLevelCompletion();
    }, 0);
  }, [checkLevelCompletion]);

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
          setDroppedItems(0);
          setShowVictory(false);
          setIsTransitioning(false);
        },
      },
    ]);
  };

  const handleVictoryContinue = () => {
    setShowVictory(false);
    setIsTransitioning(false);
    if (nextLevel) {
      setCurrentLevelId(nextLevel.id);
    }
  };

  const handleVictoryRestart = () => {
    setShowVictory(false);
    setMovesMade(0);
    setDroppedItems(0);
    setIsTransitioning(false);

    // Reset the game state to start fresh
    if (currentLevel) {
      // Re-initialize the game with the same level
      const isSeaLevel = currentLevel.tileTypes.some(tile =>
        ['🦑', '🦐', '🐡', '🪝'].includes(tile),
      );

      // Re-initialize sand blockers from level config
      const sandBlockers =
        currentLevel.blockers
          ?.filter(b => b.type === 'sand')
          .map(b => ({row: b.row, col: b.col, hasUmbrella: true})) || [];

      // Re-initialize board from level configuration
      dispatchGame({
        type: 'INIT_BOARD_FROM_LEVEL',
        payload: {
          levelBoard: currentLevel.board,
          variant: isSeaLevel ? 'sea' : 'sand',
          sandBlockers: sandBlockers.map(sb => ({row: sb.row, col: sb.col})),
        },
      });

      // Reset currency to start fresh for this level
      dispatchCurrency({
        type: 'LOAD_CURRENCY',
        payload: {shells: 0, keys: currency.keys},
      });

      if (sandBlockers.length > 0) {
        console.log(
          'LevelGameScreen: Re-initializing sand blockers for restart:',
          sandBlockers,
        );
        // Reset sand blockers to initial state with umbrellas
        dispatchGame({type: 'SET_SAND_BLOCKERS', payload: sandBlockers});
      }
    }
  };

  const isLevelFailed = () => {
    return (
      currentLevel && movesMade >= currentLevel.moves && !isLevelComplete()
    );
  };

  if (!currentLevel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Level not found!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Level Intro Modal/Card */}
      <Modal
        visible={showLevelIntro}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevelIntro(false)}>
        <Pressable
          style={styles.introOverlay}
          onPress={() => setShowLevelIntro(false)}>
          <View style={styles.introCard}>
            <Text style={styles.levelTitle}>{currentLevel.name}</Text>
            <Text style={styles.levelDescription}>
              {currentLevel.description}
            </Text>
            <Text style={styles.levelObjective}>
              {(() => {
                switch (currentLevel.objective) {
                  case 'score':
                    return `Score ${currentLevel.target} points`;
                  case 'collect':
                    return `Collect ${currentLevel.target} ${currentLevel.tileTypes[0]}`;
                  case 'clear':
                    return `Clear ${currentLevel.target} tiles`;
                  case 'combo':
                    return `Create ${currentLevel.target} combos`;
                  case 'drop':
                    // Determine what to drop based on level mechanics and special tiles
                    if (currentLevel.mechanics.includes('drop-targets')) {
                      return `Drop ${currentLevel.target} sea creatures to targets`;
                    } else {
                      return `Drop ${currentLevel.target} coconuts`;
                    }
                  case 'sand-clear':
                    return `Clear all sand blockers`;
                  default:
                    return '';
                }
              })()}
            </Text>
            <TouchableOpacity
              style={styles.letsGoButton}
              onPress={() => setShowLevelIntro(false)}>
              <Text style={styles.letsGoButtonText}>Let's go!</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Header */}
      <View
        style={styles.header}
        pointerEvents={showLevelIntro ? 'none' : 'auto'}>
        <View style={styles.currencyContainer}>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>🐚</Text>
            <Text style={styles.currencyText}>{currency.shells}</Text>
          </View>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>💎</Text>
            <Text style={styles.currencyText}>0</Text>
          </View>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>❤️</Text>
            <Text style={styles.currencyText}>5/5</Text>
          </View>
        </View>
      </View>

      {/* Combined Progress & Moves Card */}
      <View style={styles.progressMovesCard}>
        <View style={styles.progressMovesRow}>
          <Text style={styles.progressText}>
            {(() => {
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
                  return `Dropped: ${currentProgress.dropped}/${currentLevel.target}`;
                case 'sand-clear':
                  return `Sand blockers: ${gameState.sandBlockers.length} remaining`;
                default:
                  return '';
              }
            })()}
          </Text>
          <Text style={styles.movesText}>
            Moves: {movesMade}/{currentLevel.moves}
          </Text>
        </View>
      </View>

      {/* Game Board */}
      <View
        style={styles.boardContainer}
        pointerEvents={showLevelIntro || isTransitioning ? 'none' : 'auto'}>
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
          onMove={handleGameMove}
          onCoconutDrop={handleItemDrop}
          onGameAction={handleGameAction}
          isTransitioning={isTransitioning}
        />
      </View>

      {/* Controls */}
      <View
        style={styles.controls}
        pointerEvents={showLevelIntro || isTransitioning ? 'none' : 'auto'}>
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
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.button, {backgroundColor: '#FF5722'}]}
              onPress={() => {
                console.log('🔧 Manual victory check triggered');
                checkLevelCompletion();
              }}>
              <Text style={styles.buttonText}>Debug Victory</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Victory Screen */}
      <VictoryScreen
        isVisible={showVictory}
        onContinue={handleVictoryContinue}
        onRestart={handleVictoryRestart}
      />

      {/* Debug Victory Screen State */}
      {__DEV__ && (
        <View
          style={{
            position: 'absolute',
            top: 100,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 10,
            borderRadius: 5,
          }}>
          <Text style={{color: 'white', fontSize: 12}}>
            Victory: {showVictory ? 'YES' : 'NO'}
          </Text>
          <Text style={{color: 'white', fontSize: 12}}>
            Transition: {isTransitioning ? 'YES' : 'NO'}
          </Text>
          <Text style={{color: 'white', fontSize: 12}}>
            Sand Blockers: {gameState.sandBlockers.length}
          </Text>
          <Text style={{color: 'white', fontSize: 12}}>
            Should Win:{' '}
            {currentLevel?.objective === 'sand-clear' &&
            gameState.sandBlockers.length === 0
              ? 'YES'
              : 'NO'}
          </Text>
          <Text style={{color: 'white', fontSize: 12}}>
            Objective: {currentLevel?.objective}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 25,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyIcon: {
    fontSize: 20,
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
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 10,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  completeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  failedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
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
  introOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  letsGoButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  letsGoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  progressMovesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  progressMovesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelObjective: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LevelGameScreen;
