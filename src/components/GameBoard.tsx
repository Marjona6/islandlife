import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Tile} from './Tile';
import {useGame} from '../contexts/GameContext';
import {processTurn, isValidMove} from '../utils/gameLogic';

export const GameBoard: React.FC = () => {
  const {gameState, dispatchGame, dispatchCurrency} = useGame();
  const [selectedTile, setSelectedTile] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set());

  // Initialize game on mount
  useEffect(() => {
    if (gameState.board.length === 0) {
      dispatchGame({type: 'INIT_BOARD'});
    }
  }, [dispatchGame, gameState.board.length]);

  const handleTilePress = (row: number, col: number) => {
    if (!selectedTile) {
      // First tile selection
      setSelectedTile({row, col});
    } else {
      // Second tile selection - attempt swap
      const {row: row1, col: col1} = selectedTile;

      if (row === row1 && col === col1) {
        // Same tile clicked - deselect
        setSelectedTile(null);
        return;
      }

      // Check if tiles are adjacent
      if (isValidMove(gameState.board, row1, col1, row, col)) {
        // Perform the swap
        dispatchGame({
          type: 'SWAP_TILES',
          payload: {row1, col1, row2: row, col2: col},
        });

        // Process the turn after a short delay to show the swap
        setTimeout(() => {
          processGameTurn();
        }, 300);
      } else {
        Alert.alert(
          'Invalid Move',
          'Tiles must be adjacent and create a match!',
        );
      }

      setSelectedTile(null);
    }
  };

  const processGameTurn = () => {
    const result = processTurn(gameState.board);

    if (result.totalMatches > 0) {
      // Update board
      dispatchGame({type: 'UPDATE_BOARD', payload: result.newBoard});

      // Increment combos
      dispatchGame({type: 'INCREMENT_COMBOS'});

      // Show matched tiles briefly
      const matchedPositions = new Set<string>();
      result.matches.forEach(match => {
        match.forEach(tile => {
          matchedPositions.add(`${tile.row}-${tile.col}`);
        });
      });
      setMatchedTiles(matchedPositions);

      // Clear matched tiles display after animation
      setTimeout(() => {
        setMatchedTiles(new Set());
      }, 500);

      // Check for game win
      if (gameState.combos + result.totalMatches >= gameState.targetCombos) {
        handleGameWin();
      }
    }
  };

  const handleGameWin = () => {
    // Award currency
    dispatchCurrency({type: 'ADD_SHELLS', payload: 1});
    dispatchCurrency({type: 'ADD_KEYS', payload: 1});

    // Mark game as won
    dispatchGame({type: 'SET_GAME_WON'});

    Alert.alert('Level Complete! 🎉', 'You earned 1 shell and 1 key!', [
      {
        text: 'Continue',
        onPress: () => dispatchGame({type: 'RESET_GAME'}),
      },
    ]);
  };

  const isTileSelected = (row: number, col: number) => {
    return selectedTile?.row === row && selectedTile?.col === col;
  };

  const isTileMatched = (row: number, col: number) => {
    return matchedTiles.has(`${row}-${col}`);
  };

  if (gameState.board.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {gameState.board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) => (
            <Tile
              key={tile.id}
              tile={tile}
              onPress={() => handleTilePress(rowIndex, colIndex)}
              isSelected={isTileSelected(rowIndex, colIndex)}
              isMatched={isTileMatched(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
  },
});
