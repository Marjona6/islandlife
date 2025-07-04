import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Tile} from './Tile';
import {useGame} from '../contexts/GameContext';
import {
  isValidMove,
  findMatches,
  removeMatches,
  dropTiles,
} from '../utils/gameLogic';

// Component to show the "holes" at the top where new tiles drop from
const ColumnHole: React.FC<{_colIndex: number}> = () => (
  <View style={styles.hole}>
    <View style={styles.holeInner} />
  </View>
);

export const GameBoard: React.FC = () => {
  const {gameState, dispatchGame, dispatchCurrency} = useGame();
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set());
  const [fallingTiles, setFallingTiles] = useState<Map<string, number>>(
    new Map(),
  );
  const boardRef = useRef(gameState.board);

  // Update ref when board changes
  useEffect(() => {
    boardRef.current = gameState.board;
  }, [gameState.board]);

  // Debug isProcessingMove state changes
  useEffect(() => {
    // console.log('isProcessingMove changed to:', isProcessingMove);
  }, [isProcessingMove]);

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

    // Check if the move is valid using current board state
    console.log('Checking if move is valid:', {row, col, targetRow, targetCol});
    if (isValidMove(boardRef.current, row, col, targetRow, targetCol)) {
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

    // Create the swapped board state immediately
    const swappedBoard = boardRef.current.map(row => [...row]);
    const temp = swappedBoard[row1][col1];
    swappedBoard[row1][col1] = swappedBoard[row2][col2];
    swappedBoard[row2][col2] = temp;

    // Perform the swap immediately
    dispatchGame({
      type: 'SWAP_TILES',
      payload: {row1, col1, row2, col2},
    });

    // Process the turn immediately with the swapped board
    console.log(
      'Processing turn with swapped board:',
      swappedBoard.map(row => row.map(tile => tile?.type || 'null')),
    );
    processGameTurn(swappedBoard, row1, col1, row2, col2);
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

    // First, find matches
    const matches = findMatches(board);
    console.log('Matches found:', matches);

    if (matches.length > 0) {
      // Show matched tiles fading out
      const matchedPositions = new Set<string>();
      matches.forEach(match => {
        match.forEach(pos => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });
      });
      console.log(
        'Setting matched tiles to fade:',
        Array.from(matchedPositions),
      );
      setMatchedTiles(matchedPositions);

      // Remove matched tiles first
      const boardAfterRemoval = removeMatches(board, matches);
      console.log(
        'Board after removal:',
        boardAfterRemoval.map(row => row.map(tile => tile?.type || 'null')),
      );

      // Calculate falling tiles by comparing current board to board after removal
      const oldBoard = boardRef.current;
      const falling = calculateFallingTiles(oldBoard, boardAfterRemoval);
      console.log('Falling tiles detected:', Array.from(falling.entries()));
      setFallingTiles(falling);

      // Update board to show removed tiles
      dispatchGame({type: 'UPDATE_BOARD', payload: boardAfterRemoval});

      // Wait for fade animation, then drop tiles
      setTimeout(() => {
        const boardAfterDrop = dropTiles(boardAfterRemoval);
        console.log(
          'Board after drop:',
          boardAfterDrop.map(row => row.map(tile => tile?.type || 'null')),
        );

        // Update board with dropped tiles
        dispatchGame({type: 'UPDATE_BOARD', payload: boardAfterDrop});

        // Increment combos
        dispatchGame({type: 'INCREMENT_COMBOS'});

        // Clear matched tiles tracking
        setMatchedTiles(new Set());

        // Clear falling tiles after animation completes
        setTimeout(() => {
          setFallingTiles(new Map());
        }, 1500);

        // Check for game win
        if (gameState.combos + matches.length >= gameState.targetCombos) {
          handleGameWin();
        }

        // Reset processing state - processing is complete
        setIsProcessingMove(false);
        console.log('Set isProcessingMove to false (match found)');
      }, 300);
    } else {
      console.log('No matches found, reverting swap');
      // No matches - revert the swap by swapping back
      if (
        row1 !== undefined &&
        col1 !== undefined &&
        row2 !== undefined &&
        col2 !== undefined
      ) {
        // Swap back to original positions immediately
        dispatchGame({
          type: 'SWAP_TILES',
          payload: {row1: row2, col1: col2, row2: row1, col2: col1},
        });
      }
      setIsProcessingMove(false);
      console.log('Set isProcessingMove to false (no matches)');
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

  const getTileFallDistance = (row: number, col: number) => {
    return fallingTiles.get(`${row}-${col}`) || 0;
  };

  const calculateFallingTiles = (oldBoard: any[][], newBoard: any[][]) => {
    const falling = new Map<string, number>();

    // For each column, track how tiles moved down
    for (let col = 0; col < 8; col++) {
      // Find all non-null tiles in the old board for this column
      const oldTiles = [];
      for (let row = 0; row < 8; row++) {
        if (oldBoard[row][col] !== null) {
          oldTiles.push({row, tile: oldBoard[row][col]});
        }
      }

      // Find all non-null tiles in the new board for this column
      const newTiles = [];
      for (let row = 0; row < 8; row++) {
        if (newBoard[row][col] !== null) {
          newTiles.push({row, tile: newBoard[row][col]});
        }
      }

      // Compare tiles to see which ones moved down
      for (let i = 0; i < Math.min(oldTiles.length, newTiles.length); i++) {
        const oldTile = oldTiles[i];
        const newTile = newTiles[i];

        // If the tile moved down (new row > old row), it's falling
        if (newTile.row > oldTile.row) {
          const fallDistance = newTile.row - oldTile.row;
          falling.set(`${newTile.row}-${col}`, fallDistance);
          console.log(
            `Tile fell from row ${oldTile.row} to row ${newTile.row} (distance: ${fallDistance})`,
          );
        }
      }
    }

    return falling;
  };

  if (gameState.board.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Holes at the top where new tiles drop from */}
      <View style={styles.holesRow}>
        {Array.from({length: 8}, (_, colIndex) => (
          <ColumnHole key={`hole-${colIndex}`} _colIndex={colIndex} />
        ))}
      </View>

      {/* Game board */}
      {gameState.board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) =>
            tile ? (
              <Tile
                key={tile.id}
                tile={tile}
                onPress={() => handleTilePress(rowIndex, colIndex)}
                onSwipe={direction =>
                  handleTileSwipe(rowIndex, colIndex, direction)
                }
                isMatched={isTileMatched(rowIndex, colIndex)}
                isFalling={fallingTiles.has(`${rowIndex}-${colIndex}`)}
                fallDistance={getTileFallDistance(rowIndex, colIndex)}
              />
            ) : (
              <View
                key={`empty-${rowIndex}-${colIndex}`}
                style={styles.emptyTile}
              />
            ),
          )}
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
  holesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  hole: {
    width: 44, // Match tile width (40 + 2*2 border)
    height: 20,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeInner: {
    width: 30,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  emptyTile: {
    width: 44,
    height: 44,
    margin: 1,
    backgroundColor: 'transparent',
  },
});
