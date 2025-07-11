import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
