import React, {useState, useEffect} from 'react';
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
  const [isProcessingMatches, setIsProcessingMatches] = useState(false);
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set());
  const [fallingTiles, setFallingTiles] = useState<Map<string, number>>(
    new Map(),
  );
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
    console.log('Swipe attempted:', {
      row,
      col,
      direction,
      isProcessingMove,
      isProcessingMatches,
    });
    if (isProcessingMove || isProcessingMatches) {
      console.log('Move or match processing in progress, ignoring swipe');
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
    if (isValidMove(gameState.board, row, col, targetRow, targetCol)) {
      console.log('Valid move, initiating swap');
      // Set processing to true immediately when user initiates a valid swap
      setIsProcessingMove(true);
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
    console.log('Performing swap');
    setMatchedTiles(new Set()); // Clear any existing matched tiles

    // Create the swapped board state immediately
    const swappedBoard = gameState.board.map(row => [...row]);
    const temp = swappedBoard[row1][col1];
    swappedBoard[row1][col1] = swappedBoard[row2][col2];
    swappedBoard[row2][col2] = temp;

    // Perform the swap immediately
    dispatchGame({
      type: 'SWAP_TILES',
      payload: {row1, col1, row2, col2},
    });

    // Wait a short time for the swap animation to complete, then process the turn
    setTimeout(() => {
      console.log(
        'Processing turn with swapped board:',
        swappedBoard.map(row => row.map(tile => tile?.type || 'null')),
      );
      processGameTurn(swappedBoard, row1, col1, row2, col2);
    }, 150); // Short delay for swap animation
  };

  const processGameTurn = (
    board: any[][],
    row1?: number,
    col1?: number,
    row2?: number,
    col2?: number,
    cascadeCount: number = 0,
  ) => {
    console.log(
      'Processing turn with board:',
      board.map(row => row.map(tile => tile?.type || 'null')),
    );

    // Reset isProcessingMove since swap animation is complete (only on first call)
    if (cascadeCount === 0) {
      setIsProcessingMove(false);
      console.log('Set isProcessingMove to false (swap complete)');
    }

    // First, find matches
    const matches = findMatches(board);
    console.log('Matches found:', matches);

    if (matches.length > 0) {
      // Set match processing to true
      setIsProcessingMatches(true);
      console.log('Set isProcessingMatches to true');
      // Show matched tiles fading out
      const matchedPositions = new Set<string>();
      matches.forEach(match => {
        match.forEach(pos => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });
      });
      setMatchedTiles(matchedPositions);

      // Remove matched tiles first
      const boardAfterRemoval = removeMatches(board, matches);
      // Update board to show removed tiles
      dispatchGame({type: 'UPDATE_BOARD', payload: boardAfterRemoval});

      // Wait for fade animation, then handle falling tiles
      setTimeout(() => {
        // Calculate which tiles need to fall before actually dropping them
        const falling = calculateFallingTiles(boardAfterRemoval);
        setFallingTiles(falling);

        // Keep the board with gaps for now, let animation show tiles falling
        dispatchGame({type: 'UPDATE_BOARD', payload: boardAfterRemoval});
        dispatchGame({type: 'INCREMENT_COMBOS'});
        setMatchedTiles(new Set());

        // After falling animation completes, update to final positions
        setTimeout(() => {
          const boardAfterDrop = dropTiles(boardAfterRemoval);
          dispatchGame({type: 'UPDATE_BOARD', payload: boardAfterDrop});
          setFallingTiles(new Map());

          // Check for game win
          if (gameState.combos + matches.length >= gameState.targetCombos) {
            handleGameWin();
          }

          // Recursively process next round of matches after drop
          setTimeout(() => {
            processGameTurn(
              boardAfterDrop,
              undefined,
              undefined,
              undefined,
              undefined,
              cascadeCount + 1,
            );
          }, 200); // Short delay before next round
        }, 1000); // Wait for falling animation to complete
      }, 300);
    } else {
      // No matches found, finish processing
      if (
        cascadeCount === 0 &&
        row1 !== undefined &&
        col1 !== undefined &&
        row2 !== undefined &&
        col2 !== undefined
      ) {
        // No matches on first swap - revert the swap
        dispatchGame({
          type: 'SWAP_TILES',
          payload: {row1: row2, col1: col2, row2: row1, col2: col1},
        });
      }
      setIsProcessingMove(false);
      setIsProcessingMatches(false);
      console.log(
        'Set isProcessingMove and isProcessingMatches to false (no matches or cascades left)',
      );
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

  const calculateFallingTiles = (boardAfterRemoval: any[][]) => {
    const falling = new Map<string, number>();

    // For each column, calculate falling tiles
    for (let col = 0; col < 8; col++) {
      // Find gaps (null positions) in the column
      const gaps: number[] = [];
      for (let row = 0; row < 8; row++) {
        if (boardAfterRemoval[row][col] === null) {
          gaps.push(row);
        }
      }

      if (gaps.length > 0) {
        // For each tile that exists, calculate how far it needs to fall
        for (let row = 0; row < 8; row++) {
          if (boardAfterRemoval[row][col] !== null) {
            // Count how many gaps are above this tile's current position
            const gapsAbove = gaps.filter(gap => gap < row).length;
            if (gapsAbove > 0) {
              falling.set(`${row}-${col}`, gapsAbove);
            }
          }
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
