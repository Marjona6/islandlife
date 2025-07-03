import React, {useRef} from 'react';
import {Text, StyleSheet, Animated, PanResponder} from 'react-native';
import {Tile as TileType} from '../types/game';

interface TileProps {
  tile: TileType;
  onPress: () => void;
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isSelected: boolean;
  isMatched: boolean;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  onPress,
  onSwipe,
  isSelected,
  isMatched,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Scale up when touch starts
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // Move the tile slightly with the gesture
        pan.setValue({x: gestureState.dx * 0.3, y: gestureState.dy * 0.3});
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reset position and scale
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pan, {
            toValue: {x: 0, y: 0},
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        const {dx, dy, vx, vy} = gestureState;
        const minSwipeDistance = 30;
        const minSwipeVelocity = 0.5;

        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (
            Math.abs(dx) > minSwipeDistance ||
            Math.abs(vx) > minSwipeVelocity
          ) {
            if (dx > 0) {
              onSwipe('right');
            } else {
              onSwipe('left');
            }
          }
        } else {
          // Vertical swipe
          if (
            Math.abs(dy) > minSwipeDistance ||
            Math.abs(vy) > minSwipeVelocity
          ) {
            if (dy > 0) {
              onSwipe('down');
            } else {
              onSwipe('up');
            }
          }
        }
      },
      onPanResponderTerminate: () => {
        // Reset on cancel
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pan, {
            toValue: {x: 0, y: 0},
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  const handlePress = () => {
    // Scale animation for tap
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tile,
        isSelected && styles.selected,
        isMatched && styles.matched,
        {
          transform: [{scale}, {translateX: pan.x}, {translateY: pan.y}],
        },
      ]}
      onTouchEnd={handlePress}>
      <Text style={[styles.tileText, isMatched && styles.matchedText]}>
        {tile.type}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#87ceeb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  selected: {
    borderColor: '#ffd700',
    borderWidth: 3,
    backgroundColor: '#fffacd',
  },
  matched: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff4757',
  },
  tileText: {
    fontSize: 20,
  },
  matchedText: {
    opacity: 0.5,
  },
});
