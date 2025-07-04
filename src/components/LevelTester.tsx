import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {levelManager, getLevelDifficulty} from '../utils/levelManager';
import {runAllTests, testSpecificLevel} from '../utils/testLevels';

interface LevelTesterProps {
  onLevelSelect?: (levelId: string) => void;
}

export const LevelTester: React.FC<LevelTesterProps> = ({onLevelSelect}) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);

  const allLevels = levelManager.getAllLevels();
  const progress = levelManager.getLevelProgress(completedLevels);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
    onLevelSelect?.(levelId);
  };

  const handleCompleteLevel = (levelId: string) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels([...completedLevels, levelId]);
    }
  };

  const handleRunTests = () => {
    // Run tests in console
    runAllTests();
    Alert.alert('Tests Complete', 'Check the console for test results!');
  };

  const handleTestSpecificLevel = (levelId: string) => {
    testSpecificLevel(levelId);
    Alert.alert('Level Test Complete', `Check console for ${levelId} details!`);
  };

  const getLevelStatus = (levelId: string) => {
    if (completedLevels.includes(levelId)) {
      return '✅';
    }
    const lastCompleted = completedLevels[completedLevels.length - 1];
    if (
      !lastCompleted ||
      levelManager.getNextLevel(lastCompleted)?.id === levelId
    ) {
      return '🎯';
    }
    return '🔒';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Level Tester</Text>
        <Text style={styles.subtitle}>
          Progress: {progress.completed}/{progress.total} (
          {progress.percentage.toFixed(1)}%)
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.testButton} onPress={handleRunTests}>
          <Text style={styles.buttonText}>🧪 Run All Tests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📋 All Levels ({allLevels.length})
        </Text>
        {allLevels.map((level, index) => {
          const difficultyScore = getLevelDifficulty(level);
          const status = getLevelStatus(level.id);
          const isSelected = selectedLevel === level.id;
          const isCompleted = completedLevels.includes(level.id);

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                isSelected && styles.selectedLevel,
                isCompleted && styles.completedLevel,
              ]}
              onPress={() => handleLevelSelect(level.id)}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelNumber}>{index + 1}</Text>
                <Text style={styles.levelStatus}>{status}</Text>
                <Text style={styles.levelName}>{level.name}</Text>
              </View>

              <View style={styles.levelDetails}>
                <Text style={styles.levelInfo}>
                  {level.objective} • Target: {level.target} • Moves:{' '}
                  {level.moves}
                </Text>
                <Text style={styles.levelInfo}>
                  Difficulty: {level.difficulty} (Score: {difficultyScore}/5)
                </Text>
                {level.mechanics.length > 0 && (
                  <Text style={styles.levelInfo}>
                    Mechanics: {level.mechanics.join(', ')}
                  </Text>
                )}
              </View>

              <View style={styles.levelActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleTestSpecificLevel(level.id)}>
                  <Text style={styles.actionButtonText}>🔍 Test</Text>
                </TouchableOpacity>
                {!isCompleted && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCompleteLevel(level.id)}>
                    <Text style={styles.actionButtonText}>✅ Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Levels by Difficulty</Text>
        {Object.entries(levelManager.getLevelCountByDifficulty()).map(
          ([difficulty, count]) => (
            <Text key={difficulty} style={styles.infoText}>
              {difficulty}: {count} levels
            </Text>
          ),
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎲 Levels by Objective</Text>
        {['collect', 'score', 'clear', 'drop', 'combo'].map(objective => {
          const levels = levelManager.getLevelsByObjective(objective);
          return (
            <Text key={objective} style={styles.infoText}>
              {objective}: {levels.length} levels
            </Text>
          );
        })}
      </View>

      {selectedLevel && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Selected Level Details</Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleTestSpecificLevel(selectedLevel)}>
            <Text style={styles.buttonText}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 20,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  levelCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedLevel: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  completedLevel: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
  },
  levelStatus: {
    fontSize: 16,
    marginRight: 10,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  levelDetails: {
    marginBottom: 10,
  },
  levelInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  levelActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default LevelTester;
