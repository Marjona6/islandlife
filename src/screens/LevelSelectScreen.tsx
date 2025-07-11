import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { levelManager } from '../utils/levelManager';
import { gameModeService } from '../services/gameMode';

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

  const [allLevels, setAllLevels] = useState<any[]>([]);
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      // Force clear and reload levels to ensure fresh data
      levelManager.reloadLevels();

      const levels = levelManager.getAllLevels();
      setAllLevels(levels);

      // Get unlocked levels based on game mode
      const unlocked = await gameModeService.getUnlockedLevels();
      setUnlockedLevels(unlocked);
    } catch (error) {
      console.error('Error loading levels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelStatus = (levelId: string) => {
    if (gameModeService.isDevMode()) {
      // In DEV mode, all levels are unlocked
      return 'unlocked';
    }

    // In PROD mode, check if level is unlocked
    return unlockedLevels.includes(levelId) ? 'unlocked' : 'locked';
  };

  const getStarRating = (_levelId: string) => {
    // Mock data - in real app this would come from saved progress
    // For now, return 0 for all levels
    return 0;
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map(star => (
          <Text
            key={star}
            style={[
              styles.star,
              { color: star <= rating ? '#FFD700' : '#ccc' },
            ]}>
            ⭐
          </Text>
        ))}
      </View>
    );
  };

  // DEV Mode: Simple vertical list layout
  const renderDevLevelList = () => {
    return (
      <View style={styles.devLevelList}>
        {allLevels.map((level, index) => {
          const status = getLevelStatus(level.id);
          const starRating = getStarRating(level.id);
          const isLocked = status === 'locked';

          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.devLevelRow, isLocked && styles.devLevelRowLocked]}
              onPress={() => !isLocked && onNavigateToLevel(level.id)}
              disabled={isLocked}>
              <View style={styles.devLevelContent}>
                <View style={styles.devLevelLeft}>
                  <Text
                    style={[
                      styles.devLevelNumber,
                      isLocked && styles.devLevelNumberLocked,
                    ]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.devLevelName,
                      isLocked && styles.devLevelNameLocked,
                    ]}>
                    {level.name}
                  </Text>
                </View>
                <View style={styles.devLevelRight}>
                  {starRating > 0 && renderStars(starRating)}
                  {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                  <Text style={styles.devLevelObjective}>
                    {level.objective} • {level.target}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderLevelNode = (
    level: any,
    levelIndex: number,
    _worldIndex: number,
  ) => {
    const status = getLevelStatus(level.id);
    const starRating = getStarRating(level.id);
    const isLocked = status === 'locked';

    return (
      <TouchableOpacity
        key={level.id}
        style={[styles.levelNode, isLocked && styles.levelNodeLocked]}
        onPress={() => !isLocked && onNavigateToLevel(level.id)}
        disabled={isLocked}>
        <View style={styles.levelNodeContent}>
          <Text
            style={[styles.levelNumber, isLocked && styles.levelNumberLocked]}>
            {levelIndex + 1}
          </Text>
          {starRating > 0 && renderStars(starRating)}
          {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
        </View>
      </TouchableOpacity>
    );
  };

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

  const renderWorld = (worldLevels: any[], worldIndex: number) => {
    const worldName = worldNames[worldIndex] || `World ${worldIndex + 1}`;
    const worldColor = worldColors[worldIndex] || worldColors[0];

    return (
      <View key={worldIndex} style={styles.worldContainer}>
        {/* World Header */}
        <LinearGradient
          colors={worldColor}
          style={styles.worldHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4A90E2', '#7B68EE', '#9370DB']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9370DB']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {gameModeService.isDevMode()
            ? 'DEV Mode - Choose Level'
            : 'Choose Level'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {gameModeService.isDevMode()
          ? // DEV Mode: Simple vertical list
            renderDevLevelList()
          : // PROD Mode: World-based layout
            worlds.map((worldLevels, worldIndex) =>
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
  // DEV Mode Styles
  devLevelList: {
    paddingVertical: 10,
  },
  devLevelRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  devLevelRowLocked: {
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
  },
  devLevelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devLevelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  devLevelRight: {
    alignItems: 'flex-end',
  },
  devLevelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
    minWidth: 30,
  },
  devLevelNumberLocked: {
    color: '#999',
  },
  devLevelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  devLevelNameLocked: {
    color: '#999',
  },
  devLevelObjective: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // PROD Mode Styles
  worldContainer: {
    marginBottom: 30,
  },
  worldHeader: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
    textShadowOffset: { width: 1, height: 1 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  levelNodeLocked: {
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
