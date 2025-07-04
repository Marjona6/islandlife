import React, {useRef, useEffect} from 'react';
import {Text, StyleSheet, Animated, PanResponder} from 'react-native';
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
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Animate matched tiles fading out
  useEffect(() => {
    if (isMatched) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset opacity for new tiles
      opacity.setValue(1);
    }
  }, [isMatched, opacity]);

  // Animate falling tiles
  useEffect(() => {
    // console.log(`Tile ${tile.id} falling props:`, {isFalling, fallDistance});
    if (isFalling && fallDistance > 0) {
      // console.log(
      //   `Starting fall animation for tile ${tile.id} with distance ${fallDistance}`,
      // );
      // Start from much higher up to make the fall very visible
      translateY.setValue(-(fallDistance * 46 + 20)); // 46 = tile height + margin, 20 extra for visibility

      // Animate falling down with bounce effect - much slower and more dramatic
      Animated.sequence([
        // Initial fall - much slower
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000, // 2 seconds for very visible falling
          useNativeDriver: true,
        }),
        // Bounce effect - more pronounced
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -8, // Bigger bounce up
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0, // Settle back down
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Reset position for non-falling tiles
      translateY.setValue(0);
    }
  }, [isFalling, fallDistance, translateY, tile.id]);

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
      onPanResponderMove: () => {
        // No visual movement during pan - just keep the scale
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reset scale
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();

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
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
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
        {
          transform: [{scale}, {translateY}],
          opacity,
        },
      ]}
      onTouchEnd={handlePress}>
      <Text style={styles.tileText}>{tile.type}</Text>
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
  tileText: {
    fontSize: 20,
  },
});
