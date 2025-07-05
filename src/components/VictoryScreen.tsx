import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

interface VictoryScreenProps {
  isVisible: boolean;
  onContinue: () => void;
  onRestart: () => void;
}

const {width, height} = Dimensions.get('window');

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  isVisible,
  onContinue,
  onRestart,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confettiAnim.setValue(0);
    }
  }, [isVisible, fadeAnim, scaleAnim, confettiAnim]);

  if (!isVisible) return null;

  const renderConfetti = () => {
    const confetti = [];
    for (let i = 0; i < 20; i++) {
      const left = Math.random() * width;

      confetti.push(
        <Animated.View
          key={i}
          style={[
            styles.confetti,
            {
              left,
              backgroundColor: [
                '#FFD700',
                '#FF6B6B',
                '#4ECDC4',
                '#45B7D1',
                '#96CEB4',
              ][Math.floor(Math.random() * 5)],
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height + 100],
                  }),
                },
                {
                  rotate: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />,
      );
    }
    return confetti;
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      {/* Background overlay */}
      <View style={styles.overlay} />

      {/* Confetti */}
      {renderConfetti()}

      {/* Victory content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Victory icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.victoryIcon}>🎉</Text>
        </View>

        {/* Victory text */}
        <Text style={styles.victoryText}>GOOD JOB!</Text>
        <Text style={styles.subtitleText}>Level Complete</Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={onRestart}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: width * 0.8,
  },
  iconContainer: {
    marginBottom: 20,
  },
  victoryIcon: {
    fontSize: 80,
  },
  victoryText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VictoryScreen;
