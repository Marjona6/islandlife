import { StyleSheet } from 'react-native';

export const createStyles = (width: number) =>
  StyleSheet.create({
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
