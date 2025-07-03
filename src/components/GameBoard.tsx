import React, {useState, useEffect, useRef} from 'react';
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
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set());
  const boardRef = useRef(gameState.board);

  // Update ref when board changes
  useEffect(() => {
    boardRef.current = gameState.board;
  }, [gameState.board]);

  // Initialize game on mount
  useEffect(() => {
    if (gameState.board.length === 0) {
      dispatchGame({type: 'INIT_BOARD'});
    }
  }, [dispatchGame, gameState.board.length]);

  const handleTilePress = (row: number, col: number) => {
    if (isProcessingMove) return; // Prevent moves while processing

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
        performSwap(row1, col1, row, col);
      } else {
        // Invalid move - just deselect without alert
        setSelectedTile(null);
      }
    }
  };

  const handleTileSwipe = (
    row: number,
    col: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ) => {
    if (isProcessingMove) return; // Prevent moves while processing

    let targetRow = row;
    let targetCol = col;

    // Calculate target position based on swipe direction
    switch (direction) {
      case 'up':
        targetRow = row - 1;
        break;
      case 'down':
        targetRow = row + 1;
        break;
      case 'left':
        targetCol = col - 1;
        break;
      case 'right':
        targetCol = col + 1;
        break;
    }

    // Check if target position is within bounds
    if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
      return;
    }

    // Check if the move is valid
    if (isValidMove(gameState.board, row, col, targetRow, targetCol)) {
      performSwap(row, col, targetRow, targetCol);
    }
    // If invalid, do nothing - tiles will snap back automatically
  };

  const performSwap = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ) => {
    setIsProcessingMove(true);
    setSelectedTile(null);
    setMatchedTiles(new Set()); // Clear any existing matched tiles

    // Perform the swap immediately
    dispatchGame({
      type: 'SWAP_TILES',
      payload: {row1, col1, row2, col2},
    });

    // Process the turn after a short delay to show the swap
    setTimeout(() => {
      // Use the current board state from the ref
      processGameTurn(boardRef.current, row1, col1, row2, col2);
    }, 500); // Increased delay to show the swap more clearly
  };

  const processGameTurn = (
    board: any[][],
    row1?: number,
    col1?: number,
    row2?: number,
    col2?: number,
  ) => {
    const result = processTurn(board);

    if (result.totalMatches > 0) {
      console.log('Matches found:', result.matches);
      console.log('Total matches:', result.totalMatches);

      // Show matched tiles fading out - use current board indices
      const matchedPositions = new Set<string>();
      result.matches.forEach(match => {
        match.forEach(pos => {
          // Use the position directly from the match result
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });
      });

      console.log(
        'Setting matched tiles to fade:',
        Array.from(matchedPositions),
      );
      setMatchedTiles(matchedPositions);

      // Wait for fade animation, then update board
      setTimeout(() => {
        console.log('Updating board after fade animation');
        // Update board
        dispatchGame({type: 'UPDATE_BOARD', payload: result.newBoard});

        // Increment combos
        dispatchGame({type: 'INCREMENT_COMBOS'});

        // Clear matched tiles tracking
        setMatchedTiles(new Set());

        // Check for game win
        if (gameState.combos + result.totalMatches >= gameState.targetCombos) {
          handleGameWin();
        }

        setIsProcessingMove(false);
      }, 400); // Wait for fade animation to complete
    } else {
      console.log('No matches found, reverting swap');
      // No matches - revert the swap by swapping back
      if (
        row1 !== undefined &&
        col1 !== undefined &&
        row2 !== undefined &&
        col2 !== undefined
      ) {
        setTimeout(() => {
          // Swap back to original positions
          dispatchGame({
            type: 'SWAP_TILES',
            payload: {row1: row2, col1: col2, row2: row1, col2: col1},
          });
          setIsProcessingMove(false);
        }, 500); // Increased delay to show the invalid move
      } else {
        setIsProcessingMove(false);
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
              onSwipe={direction =>
                handleTileSwipe(rowIndex, colIndex, direction)
              }
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
