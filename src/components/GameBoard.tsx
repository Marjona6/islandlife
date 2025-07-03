import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Tile} from './Tile';
import {useGame} from '../contexts/GameContext';
import {processTurn, isValidMove} from '../utils/gameLogic';

export const GameBoard: React.FC = () => {
  const {gameState, dispatchGame, dispatchCurrency} = useGame();
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

  const handleTilePress = (_row: number, _col: number) => {
    // Do nothing on tap - only swipe works
  };

  const handleTileSwipe = (
    row: number,
    col: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ) => {
    console.log('Swipe attempted:', {row, col, direction, isProcessingMove});
    if (isProcessingMove) {
      console.log('Move in progress, ignoring swipe');
      return; // Prevent moves while processing
    }

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
      console.log('Target position out of bounds');
      return;
    }

    // Check if the move is valid
    console.log('Checking if move is valid:', {row, col, targetRow, targetCol});
    if (isValidMove(gameState.board, row, col, targetRow, targetCol)) {
      console.log('Valid move, performing swap');
      performSwap(row, col, targetRow, targetCol);
    } else {
      console.log('Invalid move');
    }
  };

  const performSwap = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ) => {
    console.log('Setting isProcessingMove to true');
    setIsProcessingMove(true);
    setMatchedTiles(new Set()); // Clear any existing matched tiles

    // Perform the swap immediately
    dispatchGame({
      type: 'SWAP_TILES',
      payload: {row1, col1, row2, col2},
    });

    // Wait a bit longer to show the swap visually before processing
    setTimeout(() => {
      // Get the current board state after the swap has been applied
      const currentBoard = gameState.board.map(row => [...row]);
      const temp = currentBoard[row1][col1];
      currentBoard[row1][col1] = currentBoard[row2][col2];
      currentBoard[row2][col2] = temp;

      processGameTurn(currentBoard, row1, col1, row2, col2);
    }, 400); // Increased delay to show the swap more clearly

    // Safety timeout to force reset isProcessingMove if it gets stuck
    setTimeout(() => {
      console.log('Safety timeout - forcing isProcessingMove to false');
      setIsProcessingMove(false);
    }, 2000); // 2 second safety timeout
  };

  const processGameTurn = (
    board: any[][],
    row1?: number,
    col1?: number,
    row2?: number,
    col2?: number,
  ) => {
    console.log(
      'Processing turn with board:',
      board.map(row => row.map(tile => tile?.type || 'null')),
    );
    const result = processTurn(board);
    console.log('Turn result:', {
      totalMatches: result.totalMatches,
      matches: result.matches,
    });

    if (result.totalMatches > 0) {
      // Show matched tiles fading out
      const matchedPositions = new Set<string>();
      result.matches.forEach(match => {
        match.forEach(pos => {
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
        console.log('Set isProcessingMove to false (match found)');
      }, 300); // Quick response
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
          console.log('Set isProcessingMove to false (no matches)');
        }, 300);
      } else {
        setIsProcessingMove(false);
        console.log('Set isProcessingMove to false (no swap params)');
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
