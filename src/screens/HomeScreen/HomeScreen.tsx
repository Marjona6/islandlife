import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useGame } from '../../contexts/GameContext';
import { gameModeService } from '../../services/gameMode';
import { userProgressService } from '../../services/userProgress';
import { createStyles } from './styles';

const { width } = Dimensions.get('window');
const styles = createStyles(width);

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
  const { currency } = useGame();
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
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
              style={[styles.progressFill, { width: '65%' }]}
            />
          </View>
          <Text style={styles.progressText}>Level 3 of 5 completed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
