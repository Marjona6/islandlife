import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {levelManager} from '../utils/levelManager';

// const {width} = Dimensions.get('window'); // Not currently used

interface LevelSelectScreenProps {
  onNavigateToLevel: (levelId: string) => void;
  onNavigateBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  onNavigateToLevel,
  onNavigateBack,
}) => {
  // const [selectedWorld, setSelectedWorld] = useState(1); // Not currently used

  // Force clear and reload levels to ensure fresh data
  levelManager.constructor.clearInstance();
  levelManager.reloadLevels();

  const allLevels = levelManager.getAllLevels();

  // Debug logging to see what levels are actually loaded
  console.log('=== LevelSelectScreen Debug ===');
  console.log('Total levels loaded:', allLevels.length);
  allLevels.forEach((level, index) => {
    console.log(`${index + 1}. ${level.id}: ${level.name}`);
  });

  // Get detailed debug info
  const debugInfo = levelManager.getDebugInfo();
  console.log('=== LevelManager Debug Info ===');
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
  console.log('=== End Debug ===');

  // Group levels by world (assuming 5 levels per world for now)
  const levelsPerWorld = 5;
  const worlds = [];
  for (let i = 0; i < allLevels.length; i += levelsPerWorld) {
    worlds.push(allLevels.slice(i, i + levelsPerWorld));
  }

  const worldNames = [
    'Tropical Beach',
    'Coral Reef',
    'Deep Ocean',
    'Mystic Island',
  ];
  const worldColors = [
    ['#FFD700', '#FFA500'], // Gold to Orange
    ['#00CED1', '#4169E1'], // Cyan to Blue
    ['#9932CC', '#4B0082'], // Purple to Indigo
    ['#32CD32', '#228B22'], // Green to Forest Green
  ];

  const getLevelStatus = (level: any, levelIndex: number) => {
    // Mock data - in real app this would come from saved progress
    if (levelIndex === 0) return 'completed'; // First level always completed
    if (levelIndex === 1) return 'completed';
    if (levelIndex === 2) return 'current';
    return 'locked';
  };

  const getStarRating = (levelIndex: number) => {
    // Mock data - in real app this would come from saved progress
    if (levelIndex === 0) return 3;
    if (levelIndex === 1) return 2;
    return 0;
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map(star => (
          <Text
            key={star}
            style={[styles.star, {color: star <= rating ? '#FFD700' : '#ccc'}]}>
            ⭐
          </Text>
        ))}
      </View>
    );
  };

  const renderLevelNode = (
    level: any,
    levelIndex: number,
    _worldIndex: number,
  ) => {
    const status = getLevelStatus(level, levelIndex);
    const starRating = getStarRating(levelIndex);
    const isLocked = status === 'locked';
    const isCurrent = status === 'current';
    const isCompleted = status === 'completed';

    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.levelNode,
          isLocked && styles.levelNodeLocked,
          isCurrent && styles.levelNodeCurrent,
          isCompleted && styles.levelNodeCompleted,
        ]}
        onPress={() => !isLocked && onNavigateToLevel(level.id)}
        disabled={isLocked}>
        <View style={styles.levelNodeContent}>
          <Text
            style={[styles.levelNumber, isLocked && styles.levelNumberLocked]}>
            {levelIndex + 1}
          </Text>
          {isCompleted && renderStars(starRating)}
          {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorld = (worldLevels: any[], worldIndex: number) => {
    const worldName = worldNames[worldIndex] || `World ${worldIndex + 1}`;
    const worldColor = worldColors[worldIndex] || worldColors[0];

    return (
      <View key={worldIndex} style={styles.worldContainer}>
        {/* World Header */}
        <LinearGradient
          colors={worldColor}
          style={styles.worldHeader}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <Text style={styles.worldTitle}>{worldName}</Text>
          <Text style={styles.worldSubtitle}>
            {worldLevels.length} levels to explore
          </Text>
        </LinearGradient>

        {/* Level Nodes */}
        <View style={styles.levelsContainer}>
          {worldLevels.map((level, levelIndex) =>
            renderLevelNode(level, levelIndex, worldIndex),
          )}
        </View>

        {/* Connection Lines */}
        <View style={styles.connectionLines}>
          {worldLevels.slice(0, -1).map((_, index) => (
            <View key={index} style={styles.connectionLine} />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9370DB']}
        style={styles.backgroundGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Level</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {worlds.map((worldLevels, worldIndex) =>
          renderWorld(worldLevels, worldIndex),
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  worldContainer: {
    marginBottom: 30,
  },
  worldHeader: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  worldTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  worldSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  levelNode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  levelNodeLocked: {
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
  },
  levelNodeCurrent: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
  },
  levelNodeCompleted: {
    backgroundColor: '#4CAF50',
  },
  levelNodeContent: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  levelNumberLocked: {
    color: '#999',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    fontSize: 10,
  },
  lockIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  connectionLines: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
  },
  connectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  bottomSpacing: {
    height: 50,
  },
});
