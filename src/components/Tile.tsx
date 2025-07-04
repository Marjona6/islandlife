import React, {useRef, useEffect} from 'react';
import {Text, StyleSheet, PanResponder} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Tile as TileType} from '../types/game';

interface TileProps {
  tile: TileType;
  onPress: () => void;
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isMatched?: boolean;
  isFalling?: boolean;
  fallDistance?: number;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  onPress,
  onSwipe,
  isMatched = false,
  isFalling = false,
  fallDistance = 0,
}) => {
  const tileRef = useRef<Animatable.View>(null);

  // Professional explosion animation for matched tiles
  useEffect(() => {
    if (isMatched && tileRef.current) {
      // Multi-stage explosion effect using built-in animations
      const currentRef = tileRef.current;

      // Stage 1: Quick scale up and shake (explosion start)
      if (currentRef && currentRef.animate) {
        currentRef
          .animate(
            {
              0: {scaleX: 1, scaleY: 1, opacity: 1},
              0.1: {scaleX: 1.4, scaleY: 1.4, opacity: 1},
              0.2: {scaleX: 1.2, scaleY: 1.2, opacity: 1},
              0.3: {scaleX: 1.5, scaleY: 1.5, opacity: 0.9},
              0.4: {scaleX: 1.1, scaleY: 1.1, opacity: 0.8},
              0.5: {scaleX: 1.3, scaleY: 1.3, opacity: 0.6},
              0.6: {scaleX: 0.9, scaleY: 0.9, opacity: 0.4},
              0.7: {scaleX: 0.7, scaleY: 0.7, opacity: 0.2},
              0.8: {scaleX: 0.5, scaleY: 0.5, opacity: 0.1},
              1: {scaleX: 0.1, scaleY: 0.1, opacity: 0},
            },
            600,
          )
          .then(() => {
            // Animation complete
          });
      }
    }
  }, [isMatched]);

  // Animate falling tiles using react-native-animatable
  useEffect(() => {
    if (isFalling && fallDistance > 0 && tileRef.current) {
      const currentRef = tileRef.current;

      // Calculate the start position based on fall distance
      const startY = -(fallDistance * 42); // Each tile position is 42 pixels

      // Use custom animation for precise falling
      if (currentRef && currentRef.animate) {
        currentRef.animate(
          {
            0: {translateY: startY},
            1: {translateY: 0},
          },
          800,
        );
      }
    }
  }, [isFalling, fallDistance]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // No animation on touch start to avoid conflicts
      },
      onPanResponderMove: () => {
        // No visual movement during pan
      },
      onPanResponderRelease: (_, gestureState) => {
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
        // No animation on cancel
      },
    }),
  ).current;

  const handlePress = () => {
    // Simple tap feedback without animation to avoid conflicts
    onPress();
  };

  return (
    <Animatable.View
      ref={tileRef}
      {...panResponder.panHandlers}
      style={styles.tile}
      onTouchEnd={handlePress}>
      <Text style={styles.tileText}>{tile.type}</Text>
    </Animatable.View>
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
  tileText: {
    fontSize: 20,
  },
});
