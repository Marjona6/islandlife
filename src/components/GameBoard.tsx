import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import Svg, {
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
  Path,
} from 'react-native-svg';
import {Tile} from './Tile';
import {useGame} from '../contexts/GameContext';
import {
  isValidMove,
  findMatches,
  removeMatches,
  dropTiles,
} from '../utils/gameLogic';

// Enhanced Hole component with realistic hole effect
const ColumnHole: React.FC<{_colIndex: number; _isActive: boolean}> = ({
  _colIndex,
  _isActive,
}) => {
  return (
    <View style={styles.hole}>
      {/* Realistic oval hole */}
      <Svg width={42} height={20} style={styles.holeSvg}>
        <Defs>
          {/* Radial gradient for hole depth */}
          <RadialGradient
            id={`holeDepth${_colIndex}`}
            cx="50%"
            cy="30%"
            rx="70%"
            ry="80%">
            <Stop offset="0%" stopColor="#1a1a1a" />
            <Stop offset="40%" stopColor="#3a3a3a" />
            <Stop offset="70%" stopColor="#5a5a5a" />
            <Stop offset="100%" stopColor="#7a7a7a" />
          </RadialGradient>

          {/* Gradient for bottom highlight */}
          <RadialGradient
            id={`bottomHighlight${_colIndex}`}
            cx="50%"
            cy="80%"
            rx="60%"
            ry="40%">
            <Stop offset="0%" stopColor="#9a9a9a" />
            <Stop offset="100%" stopColor="transparent" />
          </RadialGradient>
        </Defs>

        {/* The main hole with depth */}
        <Ellipse
          cx="21"
          cy="10"
          rx="18"
          ry="7"
          fill={`url(#holeDepth${_colIndex})`}
        />

        {/* Bottom highlight for depth */}
        <Ellipse
          cx="21"
          cy="10"
          rx="16"
          ry="6"
          fill={`url(#bottomHighlight${_colIndex})`}
        />

        {/* Darker top section - smaller inner oval */}
        <Ellipse cx="21" cy="8" rx="14" ry="5" fill="#1a1a1a" opacity="0.8" />

        {/* Hole rim shadow for depth */}
        <Ellipse
          cx="21"
          cy="10"
          rx="18"
          ry="7"
          fill="none"
          stroke="#555555"
          strokeWidth="1.5"
          opacity="0.8"
        />
      </Svg>
    </View>
  );
};

// Simple particle effect component
const FallingParticles: React.FC<{_colIndex: number; isActive: boolean}> = ({
  _colIndex,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <View style={styles.particleContainer}>
      {/* Dust particles that look more realistic */}
      {Array.from({length: 6}, (_, i) => (
        <View
          key={i}
          style={[
            styles.particle,
            {
              left: 6 + i * 5,
              top: 1 + (i % 3) * 1,
              backgroundColor: ['#8B4513', '#A0522D', '#CD853F', '#D2691E'][
                i % 4
              ],
              opacity: 0.4 + i * 0.1,
            },
          ]}
        />
      ))}
    </View>
  );
};

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
          <View key={`hole-container-${colIndex}`} style={styles.holeContainer}>
            <ColumnHole
              _colIndex={colIndex}
              _isActive={fallingTiles.has(`0-${colIndex}`)}
            />
            <FallingParticles
              _colIndex={colIndex}
              isActive={fallingTiles.has(`0-${colIndex}`)}
            />
          </View>
        ))}
      </View>

      {/* Clipping container to hide tiles above hole midpoints */}
      <View style={styles.clippingContainer}>
        {/* Scalloped sand background with horizontal wave stripes */}
        <Svg
          width={360}
          height="100%"
          style={styles.sandSvg}
          viewBox="0 0 360 300">
          <Defs>
            <LinearGradient
              id="sandGradient1"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#d2b48c" />
              <Stop offset="100%" stopColor="#c19a6b" />
            </LinearGradient>
            <LinearGradient
              id="sandGradient2"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#c19a6b" />
              <Stop offset="100%" stopColor="#b08d5a" />
            </LinearGradient>
            <LinearGradient
              id="sandGradient3"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#b08d5a" />
              <Stop offset="100%" stopColor="#9f7a49" />
            </LinearGradient>
          </Defs>

          {/* Base sand shape with wavy edges */}
          <Path
            d="M 0,0 
               Q 22.5,-8 45,0 
               Q 67.5,8 90,0 
               Q 112.5,-8 135,0 
               Q 157.5,8 180,0 
               Q 202.5,-8 225,0 
               Q 247.5,8 270,0 
               Q 292.5,-8 315,0 
               Q 337.5,8 360,0 
               L 360,300 
               Q 337.5,308 315,300 
               Q 292.5,292 270,300 
               Q 247.5,308 225,300 
               Q 202.5,292 180,300 
               Q 157.5,308 135,300 
               Q 112.5,292 90,300 
               Q 67.5,308 45,300 
               Q 22.5,292 0,300 
               Z"
            fill="url(#sandGradient1)"
          />

          {/* Horizontal wave stripe 1 */}
          <Path
            d="M 0,90 
               Q 22.5,82 45,90 
               Q 67.5,98 90,90 
               Q 112.5,82 135,90 
               Q 157.5,98 180,90 
               Q 202.5,82 225,90 
               Q 247.5,98 270,90 
               Q 292.5,82 315,90 
               Q 337.5,98 360,90 
               L 360,150 
               Q 337.5,142 315,150 
               Q 292.5,158 270,150 
               Q 247.5,142 225,150 
               Q 202.5,158 180,150 
               Q 157.5,142 135,150 
               Q 112.5,158 90,150 
               Q 67.5,142 45,150 
               Q 22.5,158 0,150 
               Z"
            fill="url(#sandGradient2)"
            opacity="0.6"
          />

          {/* Horizontal wave stripe 2 */}
          <Path
            d="M 0,210 
               Q 30,202 60,210 
               Q 90,218 120,210 
               Q 150,202 180,210 
               Q 210,218 240,210 
               Q 270,202 300,210 
               Q 330,218 360,210 
               Q 390,202 360,210 
               L 360,270 
               Q 330,262 300,270 
               Q 270,278 240,270 
               Q 210,262 180,270 
               Q 150,278 120,270 
               Q 90,262 60,270 
               Q 30,278 0,270 
               Q -30,262 0,270 
               Z"
            fill="url(#sandGradient3)"
            opacity="0.4"
          />
        </Svg>

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
                    top: row * 42, // 40 (tile height) + 2 (margin)
                    left: col * 42,
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
    marginBottom: 20, // Increased from 10 to 20 to move holes up
  },
  holeContainer: {
    position: 'relative',
    width: 42, // Match tile spacing exactly
    height: 20,
    marginHorizontal: 0, // Remove margin to align perfectly
  },
  hole: {
    width: 42, // Match tile width (40) + margin (2)
    height: 20,
    marginHorizontal: 0, // Remove margin to align perfectly
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeOuter: {
    width: 40, // Match tile width exactly
    height: 20, // Proper oval height
    borderRadius: 0, // No border radius - let SVG be the shape
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  holeInnerContainer: {
    width: 34,
    height: 16, // Proper oval height
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeSvg: {
    width: '100%',
    height: '100%',
  },
  holeGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  holeHighlight1: {
    position: 'absolute',
    top: 1,
    left: 7,
    width: 10,
    height: 3,
    backgroundColor: '#444',
    borderRadius: 3,
    opacity: 0.3,
  },
  holeHighlight2: {
    position: 'absolute',
    top: 2,
    left: 9,
    width: 6,
    height: 2,
    backgroundColor: '#666',
    borderRadius: 2,
    opacity: 0.5,
  },
  holeHighlight3: {
    position: 'absolute',
    top: 3,
    left: 11,
    width: 3,
    height: 1,
    backgroundColor: '#888',
    borderRadius: 1,
    opacity: 0.7,
  },
  holeInnerShadow: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 34,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  holeInnerShadow2: {
    position: 'absolute',
    top: 16,
    left: 2,
    width: 30,
    height: 1,
    backgroundColor: '#000',
    borderRadius: 1,
    opacity: 0.7,
  },
  holeInnerShadow3: {
    position: 'absolute',
    top: 14,
    left: 4,
    width: 26,
    height: 1,
    backgroundColor: '#000',
    borderRadius: 1,
    opacity: 0.5,
  },
  holeRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 20,
    borderRadius: 0, // No border radius - let SVG be the shape
    borderWidth: 1,
    borderColor: '#444',
    opacity: 0.3,
  },
  emptyTile: {
    width: 40,
    height: 40,
    margin: 1,
    backgroundColor: 'transparent',
  },
  clippingContainer: {
    // Clip tiles so they only become visible when emerging from holes
    // The top edge should align with the bottom edge of the holes (20px from top of holes)
    marginTop: -20, // Move up to overlap with holes completely
    overflow: 'hidden', // Hide tiles above the clipping boundary
    paddingTop: 20, // Add padding to push content down so it starts at hole edge
    backgroundColor: '#d2b48c', // More beige, less yellow
    borderRadius: 20, // More rounded for wavy effect
    padding: 12, // Back to original padding
    width: 360, // Width to accommodate 8 tiles (8 * 42 = 336) plus some padding
    alignSelf: 'center', // Center the beige area
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  matchedTileContainer: {
    position: 'absolute',
    zIndex: 10, // Ensure matched tiles appear above other tiles
  },
  holeGlow: {
    position: 'absolute',
    top: 0,
    left: 1, // Center the glow within the container (42-40)/2 = 1
    width: 40,
    height: 20, // Match the new oval height
    borderRadius: 0, // No border radius - let SVG be the shape
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  holeGlowActive: {
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 12,
  },
  holeOuterActive: {
    transform: [{scale: 1.1}],
    shadowOpacity: 0.9,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  sandSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 360, // Match the beige area width exactly
    height: '100%',
  },
});
