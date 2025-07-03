import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Tile as TileType} from '../types/game';

interface TileProps {
  tile: TileType;
  onPress: () => void;
  isSelected: boolean;
  isMatched: boolean;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  onPress,
  isSelected,
  isMatched,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.tile,
        isSelected && styles.selected,
        isMatched && styles.matched,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.tileText, isMatched && styles.matchedText]}>
        {tile.type}
      </Text>
    </TouchableOpacity>
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
