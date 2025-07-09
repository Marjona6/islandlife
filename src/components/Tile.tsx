import React, {useRef, useEffect, useCallback} from 'react';
import {Text, StyleSheet, PanResponder, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Tile as TileType} from '../types/game';

interface TileProps {
  tile: TileType;
  onPress: () => void;
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isMatched?: boolean;
  isFalling?: boolean;
  fallDistance?: number;
  isCoconutExiting?: boolean;
  onCoconutExit?: () => void;
  isShaking?: boolean;
  cascadeLevel?: number; // New: for staggered animations
}

export const Tile: React.FC<TileProps> = ({
  tile,
  onPress: _onPress,
  onSwipe,
  isMatched = false,
  isFalling = false,
  fallDistance = 0,
  isCoconutExiting = false,
  onCoconutExit,
  isShaking = false,
  cascadeLevel = 0,
}) => {
  const tileRef = useRef<Animatable.View>(null);
  const particleRef = useRef<Animatable.View>(null);
  const hasAnimatedMatch = useRef(false);
  const hasAnimatedFall = useRef(false);
  const hasAnimatedCoconutExit = useRef(false);
  const hasStartedShaking = useRef(false);
  const hasAnimatedParticles = useRef(false);

  // Enhanced match animation with particles
  const handleMatch = useCallback(() => {
    if (isMatched && tileRef.current && !hasAnimatedMatch.current) {
      hasAnimatedMatch.current = true;
      const currentRef = tileRef.current;

      if (currentRef && currentRef.animate) {
        // Enhanced match animation with bounce and glow
        currentRef.animate(
          {
            0: {scaleX: 1, scaleY: 1, opacity: 1},
            0.1: {scaleX: 1.3, scaleY: 1.3, opacity: 1},
            0.2: {scaleX: 1.1, scaleY: 1.1, opacity: 1},
            0.3: {scaleX: 1.4, scaleY: 1.4, opacity: 0.9},
            0.4: {scaleX: 1.2, scaleY: 1.2, opacity: 0.8},
            0.5: {scaleX: 1.5, scaleY: 1.5, opacity: 0.7},
            0.6: {scaleX: 0.8, scaleY: 0.8, opacity: 0.5},
            0.7: {scaleX: 0.6, scaleY: 0.6, opacity: 0.3},
            0.8: {scaleX: 0.4, scaleY: 0.4, opacity: 0.2},
            1: {scaleX: 0.1, scaleY: 0.1, opacity: 0},
          },
          400, // Faster animation
        );

        // Trigger particle explosion
        if (particleRef.current && !hasAnimatedParticles.current) {
          hasAnimatedParticles.current = true;
          particleRef.current.animate(
            {
              0: {scaleX: 0, scaleY: 0, opacity: 1},
              0.3: {scaleX: 1.2, scaleY: 1.2, opacity: 1},
              0.6: {scaleX: 1.5, scaleY: 1.5, opacity: 0.7},
              1: {scaleX: 2, scaleY: 2, opacity: 0},
            },
            500,
          );
        }
      }
    }
  }, [isMatched]);

  // Enhanced falling animation with staggered timing and bounce
  const handleFall = useCallback(() => {
    if (
      isFalling &&
      fallDistance > 0 &&
      tileRef.current &&
      !hasAnimatedFall.current
    ) {
      hasAnimatedFall.current = true;
      const currentRef = tileRef.current;
      const startY = -(fallDistance * 42); // Each tile position is 42 pixels

      // Staggered timing based on cascade level and fall distance
      const baseDelay = cascadeLevel * 50; // 50ms delay per cascade level
      const distanceDelay = fallDistance * 20; // 20ms per tile distance
      const totalDelay = baseDelay + distanceDelay;

      setTimeout(() => {
        if (currentRef && currentRef.animate) {
          // Enhanced falling with bounce effect
          currentRef.animate(
            {
              0: {translateY: startY, scaleX: 1, scaleY: 1},
              0.7: {translateY: 5, scaleX: 1.05, scaleY: 1.05}, // Slight overshoot
              0.85: {translateY: -2, scaleX: 0.98, scaleY: 0.98}, // Bounce back
              1: {translateY: 0, scaleX: 1, scaleY: 1}, // Settle
            },
            600, // Slightly longer for bounce effect
          );
        }
      }, totalDelay);
    }
  }, [isFalling, fallDistance, cascadeLevel]);

  // Enhanced coconut exit animation
  const handleCoconutExit = useCallback(() => {
    if (
      isCoconutExiting &&
      tile.isSpecial &&
      tileRef.current &&
      !hasAnimatedCoconutExit.current
    ) {
      hasAnimatedCoconutExit.current = true;
      const currentRef = tileRef.current;
      if (currentRef && currentRef.animate) {
        // Enhanced swoop animation
        currentRef
          .animate(
            {
              0: {translateY: 0, translateX: 0, opacity: 1},
              0.2: {translateY: 15, translateX: 8, opacity: 1},
              0.4: {
                translateY: 30,
                translateX: 25,
                opacity: 0.8,
              },
              0.6: {
                translateY: 45,
                translateX: 50,
                opacity: 0.6,
              },
              0.8: {
                translateY: 60,
                translateX: 80,
                opacity: 0.3,
              },
              1: {translateY: 80, translateX: 120, opacity: 0},
            },
            800,
          )
          .then(() => {
            if (onCoconutExit) {
              setTimeout(() => {
                onCoconutExit();
              }, 0);
            }
          });
      }
    }
  }, [isCoconutExiting, tile.isSpecial, onCoconutExit]);

  // Enhanced shaking animation for bomb tiles
  const handleShaking = useCallback(() => {
    if (isShaking && tileRef.current && !hasStartedShaking.current) {
      hasStartedShaking.current = true;
      const currentRef = tileRef.current;
      if (currentRef && currentRef.animate) {
        // Enhanced infinite shaking
        const shakeAnimation = () => {
          currentRef
            .animate(
              {
                0: {translateX: 0, translateY: 0},
                0.1: {translateX: -3, translateY: -2},
                0.2: {translateX: 3, translateY: 2},
                0.3: {translateX: -3, translateY: -2},
                0.4: {translateX: 3, translateY: 2},
                0.5: {translateX: -2, translateY: -1},
                0.6: {translateX: 2, translateY: 1},
                0.7: {translateX: -2, translateY: -1},
                0.8: {translateX: 2, translateY: 1},
                0.9: {translateX: -1, translateY: 0},
                1: {translateX: 0, translateY: 0},
              },
              150, // Faster shaking
            )
            .then(() => {
              if (isShaking) {
                shakeAnimation(); // Continue shaking
              }
            });
        };
        shakeAnimation();
      }
    }
  }, [isShaking]);

  // Use useEffect to handle animations after render
  useEffect(() => {
    // Reset animation flags when props change
    if (!isMatched) {
      hasAnimatedMatch.current = false;
      hasAnimatedParticles.current = false;
    }
    if (!isFalling) hasAnimatedFall.current = false;
    if (!isCoconutExiting) hasAnimatedCoconutExit.current = false;
    if (!isShaking) hasStartedShaking.current = false;

    // Run animations when props change
    if (isMatched) handleMatch();
    if (isFalling) handleFall();
    if (isCoconutExiting) handleCoconutExit();
    if (isShaking) handleShaking();
  }, [
    isMatched,
    isFalling,
    fallDistance,
    isCoconutExiting,
    isShaking,
    tile.isSpecial,
    cascadeLevel,
    handleMatch,
    handleFall,
    handleCoconutExit,
    handleShaking,
  ]);

  // Render particle effects
  const renderParticles = () => {
    if (!isMatched) return null;

    const particles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const distance = 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particles.push(
        <Animatable.View
          key={i}
          ref={particleRef}
          style={[
            styles.particle,
            {
              left: 20 + x,
              top: 20 + y,
              backgroundColor: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'][
                i % 4
              ],
            },
          ]}
        />,
      );
    }
    return particles;
  };

  return tile ? (
    <View style={styles.container}>
      <Animatable.View
        ref={tileRef}
        style={[
          styles.tile,
          isMatched && styles.matchedTile,
          isFalling && styles.fallingTile,
          isCoconutExiting && styles.exitingTile,
          isShaking && styles.shakingTile,
        ]}
        {...PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: () => {
            // Handle press
          },
          onPanResponderRelease: (evt, gestureState) => {
            const {dx, dy} = gestureState;
            const threshold = 30;

            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > threshold) onSwipe('right');
              else if (dx < -threshold) onSwipe('left');
            } else {
              if (dy > threshold) onSwipe('down');
              else if (dy < -threshold) onSwipe('up');
            }
          },
        }).panHandlers}>
        <Text style={styles.tileText}>{tile.type}</Text>
      </Animatable.View>

      {/* Particle effects */}
      {renderParticles()}
    </View>
  ) : (
    <View style={styles.emptyTile} />
  );
};

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tile: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent', // No background
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 24,
    textAlign: 'center',
    opacity: 1, // Ensure full opacity
    color: '#000', // Pure black for maximum contrast
  },
  matchedTile: {
    zIndex: 10,
  },
  fallingTile: {
    zIndex: 5,
  },
  exitingTile: {
    zIndex: 15,
  },
  shakingTile: {
    zIndex: 20,
  },
  emptyTile: {
    width: 40,
    height: 40,
    margin: 1,
    backgroundColor: 'transparent',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    zIndex: 25,
  },
});
