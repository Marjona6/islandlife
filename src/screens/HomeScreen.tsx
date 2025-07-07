import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useGame} from '../contexts/GameContext';
import {gameModeService} from '../services/gameMode';
import {userProgressService} from '../services/userProgress';

const {width} = Dimensions.get('window');

interface HomeScreenProps {
  onNavigateToLevels: () => void;
  onNavigateToLevel: (levelId: string) => void;
  onNavigateToSettings: () => void;
  onNavigateToShop: () => void;
  onNavigateToDailyRewards: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToLevels,
  onNavigateToLevel,
  onNavigateToSettings,
  onNavigateToShop,
  onNavigateToDailyRewards,
}) => {
  const {currency} = useGame();
  const [nextLevel, setNextLevel] = useState<string>('level-1');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeGameMode();
  }, []);

  const initializeGameMode = async () => {
    try {
      await gameModeService.initialize();
      await userProgressService.initialize();

      if (gameModeService.isProdMode()) {
        const next = await gameModeService.getNextLevel();
        setNextLevel(next);
      }
    } catch (error) {
      console.error('Error initializing game mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayButton = () => {
    if (gameModeService.isProdMode()) {
      // In PROD mode, go directly to the next level
      onNavigateToLevel(nextLevel);
    } else {
      // In DEV mode, show level selection
      onNavigateToLevels();
    }
  };

  const getPlayButtonText = () => {
    if (gameModeService.isProdMode()) {
      return 'PLAY';
    } else {
      return 'SELECT LEVEL';
    }
  };

  const getPlayButtonSubtext = () => {
    if (gameModeService.isProdMode()) {
      return 'Continue Adventure';
    } else {
      return 'Choose Your Level';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4A90E2', '#7B68EE', '#9370DB']}
          style={styles.backgroundGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9370DB']}
        style={styles.backgroundGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      {/* Currency Bar */}
      <View style={styles.currencyBar}>
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

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.gameTitle}>Island Life</Text>
          <Text style={styles.gameSubtitle}>Match & Explore</Text>
        </View>

        {/* Main Play Button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlayButton}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.playButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Text style={styles.playButtonText}>{getPlayButtonText()}</Text>
            <Text style={styles.playButtonSubtext}>
              {getPlayButtonSubtext()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Navigation Grid */}
        <View style={styles.navigationGrid}>
          <TouchableOpacity style={styles.navCard} onPress={onNavigateToLevels}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.navCardGradient}>
              <Text style={styles.navIcon}>🗺️</Text>
              <Text style={styles.navTitle}>Levels</Text>
              <Text style={styles.navSubtitle}>Choose your challenge</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={onNavigateToDailyRewards}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.navCardGradient}>
              <Text style={styles.navIcon}>🎁</Text>
              <Text style={styles.navTitle}>Daily Rewards</Text>
              <Text style={styles.navSubtitle}>Claim your gifts</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={onNavigateToShop}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.navCardGradient}>
              <Text style={styles.navIcon}>🛍️</Text>
              <Text style={styles.navTitle}>Shop</Text>
              <Text style={styles.navSubtitle}>Power-ups & boosts</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={onNavigateToSettings}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.navCardGradient}>
              <Text style={styles.navIcon}>⚙️</Text>
              <Text style={styles.navTitle}>Settings</Text>
              <Text style={styles.navSubtitle}>Game preferences</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#4CAF50', '#8BC34A']}
              style={[styles.progressFill, {width: '65%'}]}
            />
          </View>
          <Text style={styles.progressText}>Level 3 of 5 completed</Text>
        </View>
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
  currencyBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 25,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  gameSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  playButton: {
    marginBottom: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  playButtonGradient: {
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  playButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  navCard: {
    width: (width - 60) / 2,
    height: 120,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  navCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  navIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  navSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
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
