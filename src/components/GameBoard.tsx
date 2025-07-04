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

// Enhanced Hole component with proper oval design
const ColumnHole: React.FC<{_colIndex: number}> = () => (
  <View style={styles.hole}>
    <View style={styles.holeOuter}>
      <View style={styles.holeInner} />
      <View style={styles.holeHighlight} />
    </View>
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

  // Keep track of the most current board state
  const currentBoardRef = useRef(gameState.board);
  currentBoardRef.current = gameState.board;

  // Keep track of processing state immediately
  const isProcessingMoveRef = useRef(isProcessingMove);
  isProcessingMoveRef.current = isProcessingMove;
  const isProcessingMatchesRef = useRef(isProcessingMatches);
  isProcessingMatchesRef.current = isProcessingMatches;

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
    console.log('=== SWIPE ATTEMPT ===');
    console.log('Swipe attempted:', {
      row,
      col,
      direction,
      isProcessingMove: isProcessingMoveRef.current,
      isProcessingMatches: isProcessingMatchesRef.current,
    });
    console.log(
      'Current board state:',
      currentBoardRef.current.map(row => row.map(tile => tile?.type || 'null')),
    );

    if (isProcessingMoveRef.current || isProcessingMatchesRef.current) {
      console.log('Move or match processing in progress, ignoring swipe', {
        isProcessingMove: isProcessingMoveRef.current,
        isProcessingMatches: isProcessingMatchesRef.current,
      });
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

    // Log the board and tile types at the swipe location
    console.log(
      'handleTileSwipe: board at swipe:',
      currentBoardRef.current.map(row => row.map(tile => tile?.type || 'null')),
    );
    console.log(
      'handleTileSwipe: tile at swipe:',
      currentBoardRef.current[row]?.[col]?.type,
      'target:',
      currentBoardRef.current[targetRow]?.[targetCol]?.type,
    );

    // Check if the move is valid using current board state
    console.log('Checking if move is valid:', {row, col, targetRow, targetCol});
    console.log(
      'Current board state:',
      currentBoardRef.current.map(row => row.map(tile => tile?.type || 'null')),
    );

    // Use the most current board state for validation
    const currentBoard = currentBoardRef.current;
    console.log(
      'About to call isValidMove with board:',
      currentBoard.map(row => row.map(tile => tile?.type || 'null')),
    );
    const isValid = isValidMove(currentBoard, row, col, targetRow, targetCol);
    console.log('isValidMove result:', isValid);
    if (isValid) {
      console.log('Valid move, initiating swap');
      // Set processing to true immediately when user initiates a valid swap
      setIsProcessingMove(true);
      isProcessingMoveRef.current = true;
      performSwap(row, col, targetRow, targetCol);
    } else {
      console.log('Invalid move');
    }
    console.log('=== END SWIPE ATTEMPT ===');
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
    const swappedBoard = currentBoardRef.current.map(row => [...row]);
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
      isProcessingMoveRef.current = false;
      console.log('Set isProcessingMove to false (swap complete)');
    }

    // First, find matches
    const matches = findMatches(board);
    console.log('Matches found:', matches);

    if (matches.length > 0) {
      // Set match processing to true
      setIsProcessingMatches(true);
      isProcessingMatchesRef.current = true;
      console.log('Set isProcessingMatches to true');

      // Show matched tiles fading out
      const matchedPositions = new Set<string>();
      matches.forEach(match => {
        match.forEach(pos => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });
      });
      setMatchedTiles(matchedPositions);

      // Calculate the final board state immediately (no intermediate gappy state)
      const boardAfterRemoval = removeMatches(board, matches);
      const boardAfterDrop = dropTiles(boardAfterRemoval);

      // Calculate which tiles need to fall for animation
      const falling = calculateFallingTiles(boardAfterRemoval, boardAfterDrop);

      // Set falling state for all tiles at once to ensure synchronized animation
      setFallingTiles(falling);

      console.log(
        'Updated to final board state:',
        boardAfterDrop.map(row => row.map(tile => tile?.type || 'null')),
      );

      // Update board state immediately but keep matched tiles visible for animation
      dispatchGame({type: 'UPDATE_BOARD', payload: boardAfterDrop});
      currentBoardRef.current = boardAfterDrop;
      dispatchGame({type: 'INCREMENT_COMBOS'});

      // Clear matched tiles after explosion animation
      setTimeout(() => {
        setMatchedTiles(new Set());
      }, 500); // Wait for explosion animation to complete

      // Clear falling animation after it completes
      setTimeout(() => {
        setFallingTiles(new Map());
      }, 1000);

      // Check for game win
      if (gameState.combos + matches.length >= gameState.targetCombos) {
        handleGameWin();
      }

      // Recursively process next round of matches after animations
      setTimeout(() => {
        console.log(
          'Starting next round of matches, cascade count:',
          cascadeCount + 1,
        );
        processGameTurn(
          boardAfterDrop,
          undefined,
          undefined,
          undefined,
          undefined,
          cascadeCount + 1,
        );
      }, 1200); // Wait for animations to complete before next round
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
      isProcessingMoveRef.current = false;
      isProcessingMatchesRef.current = false;
      console.log('=== PROCESSING COMPLETE ===');
      console.log(
        'Set isProcessingMove and isProcessingMatches to false (no matches or cascades left)',
      );
      console.log(
        'Final board state:',
        currentBoardRef.current.map(row =>
          row.map(tile => tile?.type || 'null'),
        ),
      );
      console.log('=== END PROCESSING ===');

      // Add a small delay to ensure state updates have propagated
      setTimeout(() => {
        console.log('State reset complete - ready for new moves');
      }, 50);
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

  const getTileFallDistance = (row: number, col: number) => {
    return fallingTiles.get(`${row}-${col}`) || 0;
  };

  const calculateFallingTiles = (
    boardAfterRemoval: any[][],
    boardAfterDrop: any[][],
  ) => {
    const falling = new Map<string, number>();

    // For each column, find tiles that should be falling
    for (let col = 0; col < 8; col++) {
      // Find where tiles were removed (gaps in the column after removal)
      const gaps: number[] = [];
      for (let row = 0; row < 8; row++) {
        if (boardAfterRemoval[row][col] === null) {
          gaps.push(row);
        }
      }

      if (gaps.length > 0) {
        // Calculate how many tiles were removed
        const tilesRemoved = gaps.length;

        // Mark all tiles in this column that need to fall
        for (let finalRow = 0; finalRow < 8; finalRow++) {
          const finalTile = boardAfterDrop[finalRow][col];
          if (finalTile) {
            // Find where this tile was in the board after removal
            let originalRow = -1;
            for (let row = 0; row < 8; row++) {
              if (
                boardAfterRemoval[row][col] &&
                boardAfterRemoval[row][col].id === finalTile.id
              ) {
                originalRow = row;
                break;
              }
            }

            // If this tile moved down (fell), mark it for falling animation
            if (originalRow >= 0 && finalRow > originalRow) {
              falling.set(`${finalRow}-${col}`, finalRow - originalRow);
            }

            // If this is a new tile (not found in original board), it should fall from the top
            if (originalRow === -1) {
              falling.set(`${finalRow}-${col}`, tilesRemoved);
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

      {/* Clipping container to hide tiles above hole midpoints */}
      <View style={styles.clippingContainer}>
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
                  isMatched={false} // Don't mark tiles as matched from board state
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

        {/* Separate layer for matched tiles (exploding) */}
        {Array.from(matchedTiles).map(matchKey => {
          const [rowStr, colStr] = matchKey.split('-');
          const row = parseInt(rowStr);
          const col = parseInt(colStr);
          const originalTile = gameState.board[row]?.[col];

          if (originalTile) {
            return (
              <View
                key={`matched-${originalTile.id}`}
                style={[
                  styles.matchedTileContainer,
                  {
                    top: row * 46, // 44 (tile height + margin) + 2 (border)
                    left: col * 46,
                  },
                ]}>
                <Tile
                  tile={originalTile}
                  onPress={() => {}} // No interaction for matched tiles
                  onSwipe={() => {}} // No interaction for matched tiles
                  isMatched={true}
                  isFalling={false}
                  fallDistance={0}
                />
              </View>
            );
          }
          return null;
        })}
      </View>
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
    width: 42, // Match tile width (40) + margin (2)
    height: 20,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeOuter: {
    width: 42,
    height: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 20, // Make it more oval
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  holeInner: {
    width: 36,
    height: 16,
    backgroundColor: '#000',
    borderRadius: 18, // More oval inner hole
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  holeHighlight: {
    position: 'absolute',
    top: 2,
    left: 8,
    width: 12,
    height: 6,
    backgroundColor: '#444',
    borderRadius: 6,
    opacity: 0.3,
  },
  emptyTile: {
    width: 44,
    height: 44,
    margin: 1,
    backgroundColor: 'transparent',
  },
  clippingContainer: {
    // Clip tiles so they only become visible when emerging from holes
    // The top edge should align with the middle of the hole row (10px from top of holes)
    marginTop: -10, // Move up to overlap with holes
    overflow: 'hidden', // Hide tiles above the clipping boundary
  },
  matchedTileContainer: {
    position: 'absolute',
    zIndex: 10, // Ensure matched tiles appear above other tiles
  },
});
