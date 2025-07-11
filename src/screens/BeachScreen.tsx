import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useGame } from '../contexts/GameContext';

interface BeachScreenProps {
  onNavigateToGame: () => void;
}

export const BeachScreen: React.FC<BeachScreenProps> = ({
  onNavigateToGame,
}) => {
  const { currency, beachItems, purchaseBeachItem } = useGame();

  const handlePurchase = (itemId: string) => {
    const item = beachItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.isPurchased) {
      Alert.alert('Already Purchased', 'You already own this item!');
      return;
    }

    if (currency.keys < item.cost) {
      Alert.alert(
        'Not Enough Keys',
        `You need ${item.cost} keys to buy this item.`,
      );
      return;
    }

    Alert.alert('Purchase Item', `Buy ${item.name} for ${item.cost} key(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Buy', onPress: () => purchaseBeachItem(itemId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currencyContainer}>
          <Text style={styles.currencyText}>🐚 {currency.shells}</Text>
          <Text style={styles.currencyText}>🔑 {currency.keys}</Text>
        </View>
        <TouchableOpacity style={styles.gameButton} onPress={onNavigateToGame}>
          <Text style={styles.gameButtonText}>🎮 Game</Text>
        </TouchableOpacity>
      </View>

      {/* Beach Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>🏖️ Island Beach</Text>
        <Text style={styles.subtitleText}>Decorate your paradise!</Text>
      </View>

      {/* Beach Scene */}
      <View style={styles.beachScene}>
        <View style={styles.sand}>
          <Text style={styles.beachText}>🏖️</Text>
          {beachItems
            .filter(item => item.isPurchased)
            .map((item, index) => (
              <Text
                key={item.id}
                style={[
                  styles.decoratedItem,
                  {
                    top: 20 + index * 30,
                    right: 20 + index * 10,
                    fontSize: 30 + index * 5,
                  },
                ]}>
                {item.icon}
              </Text>
            ))}
        </View>
        <View style={styles.ocean}>
          <Text style={styles.oceanText}>🌊</Text>
        </View>
      </View>

      {/* Shop Items */}
      <View style={styles.shopContainer}>
        <Text style={styles.shopTitle}>🏪 Beach Shop</Text>
        <ScrollView style={styles.itemsList}>
          {beachItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCost}>🔑 {item.cost}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.buyButton,
                  item.isPurchased && styles.purchasedButton,
                ]}
                onPress={() => handlePurchase(item.id)}
                disabled={item.isPurchased}>
                <Text style={styles.buyButtonText}>
                  {item.isPurchased ? 'Owned' : 'Buy'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Win match-3 levels to earn keys
        </Text>
        <Text style={styles.instructionText}>
          Use keys to buy decorations for your beach
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  gameButton: {
    backgroundColor: '#32cd32',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gameButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  titleContainer: {
    alignItems: 'center',
    padding: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  beachScene: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sand: {
    flex: 1,
    backgroundColor: '#f4d03f',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  beachText: {
    fontSize: 60,
  },
  decoratedItem: {
    position: 'absolute',
  },
  ocean: {
    height: 80,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oceanText: {
    fontSize: 40,
  },
  shopContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    maxHeight: 200,
  },
  shopTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  itemsList: {
    maxHeight: 150,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCost: {
    fontSize: 14,
    color: '#666',
  },
  buyButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  purchasedButton: {
    backgroundColor: '#95a5a6',
  },
  buyButtonText: {
    fontSize: 14,
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
