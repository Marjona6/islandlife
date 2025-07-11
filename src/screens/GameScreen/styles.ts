import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4682b4',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  beachButton: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  beachButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameInfo: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  comboText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 16,
    color: '#888',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  controls: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#32cd32',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  instructions: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 10,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});
