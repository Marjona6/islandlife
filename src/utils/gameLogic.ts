import { Tile, TileType, getTileEmojis } from '../types/game';

const BOARD_SIZE = 8;

// Function to get tile types based on variant
export const getTileTypes = (variant: 'sand' | 'sea' = 'sand'): TileType[] => {
  return getTileEmojis(variant);
};

// Check if two tiles are adjacent
export const areAdjacent = (
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): boolean => {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// Find all matches in the board
export const findMatches = (
  board: Tile[][],
): Array<Array<{ row: number; col: number }>> => {
  const matches: Array<Array<{ row: number; col: number }>> = [];

  // console.log(
  //   'Finding matches in board:',
  //   board.map(row => row.map(tile => tile?.type || 'null')),
  // );

  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    let col = 0;
    while (col < BOARD_SIZE - 2) {
      const tile1 = board[row][col];
      const tile2 = board[row][col + 1];
      const tile3 = board[row][col + 2];
      if (
        tile1 &&
        tile2 &&
        tile3 &&
        !tile1.isSpecial && // Don't match special tiles
        !tile2.isSpecial &&
        !tile3.isSpecial &&
        tile1.type === tile2.type &&
        tile2.type === tile3.type
      ) {
        // Start a new match
        const match: Array<{ row: number; col: number }> = [
          { row, col },
          { row, col: col + 1 },
          { row, col: col + 2 },
        ];
        let i = col + 3;
        while (
          i < BOARD_SIZE &&
          board[row][i] &&
          !board[row][i].isSpecial && // Don't match special tiles
          board[row][i].type === tile1.type
        ) {
          match.push({ row, col: i });
          i++;
        }
        matches.push(match);
        col += match.length; // skip over the matched section
      } else {
        col++;
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < BOARD_SIZE; col++) {
    let row = 0;
    while (row < BOARD_SIZE - 2) {
      const tile1 = board[row][col];
      const tile2 = board[row + 1][col];
      const tile3 = board[row + 2][col];
      if (
        tile1 &&
        tile2 &&
        tile3 &&
        !tile1.isSpecial && // Don't match special tiles
        !tile2.isSpecial &&
        !tile3.isSpecial &&
        tile1.type === tile2.type &&
        tile2.type === tile3.type
      ) {
        // Start a new match
        const match: Array<{ row: number; col: number }> = [
          { row, col },
          { row: row + 1, col },
          { row: row + 2, col },
        ];
        let i = row + 3;
        while (
          i < BOARD_SIZE &&
          board[i][col] &&
          !board[i][col].isSpecial && // Don't match special tiles
          board[i][col].type === tile1.type
        ) {
          match.push({ row: i, col });
          i++;
        }
        matches.push(match);
        row += match.length; // skip over the matched section
      } else {
        row++;
      }
    }
  }

  // console.log('All matches found:', matches);
  return matches;
};

// Remove matched tiles and return their positions
export const removeMatches = (
  board: Tile[][],
  matches: Array<Array<{ row: number; col: number }>>,
): Tile[][] => {
  const newBoard = board.map(row => [...row]);

  // Remove matched tiles
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        matches.some(match =>
          match.some(pos => pos.row === row && pos.col === col),
        )
      ) {
        newBoard[row][col] = null as any;
      }
    }
  }

  return newBoard;
};

// Make tiles fall down to fill empty spaces
export const dropTiles = (
  board: Tile[][],
  variant: 'sand' | 'sea' = 'sand',
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }> = [],
): Tile[][] => {
  const newBoard = board.map(row => [...row]);
  const tileTypes = getTileTypes(variant);

  for (let col = 0; col < BOARD_SIZE; col++) {
    // Get all sand blocker positions in this column
    const sandBlockerRows = sandBlockers
      .filter(blocker => blocker.col === col)
      .map(blocker => blocker.row)
      .sort((a, b) => a - b); // Sort from top to bottom

    // Create sections separated by sand blockers
    const sections: Array<{ start: number; end: number }> = [];
    let currentStart = 0;

    for (const blockerRow of sandBlockerRows) {
      if (blockerRow > currentStart) {
        sections.push({ start: currentStart, end: blockerRow - 1 });
      }
      currentStart = blockerRow + 1;
    }

    // Add the final section if there's space after the last sand blocker
    if (currentStart < BOARD_SIZE) {
      sections.push({ start: currentStart, end: BOARD_SIZE - 1 });
    }

    // Process each section independently
    for (const section of sections) {
      // Collect all non-null tiles in this section, preserving their properties
      const tiles: Tile[] = [];
      for (let row = section.start; row <= section.end; row++) {
        if (newBoard[row][col] !== null) {
          tiles.push({ ...newBoard[row][col] }); // Clone the tile to preserve all properties
          newBoard[row][col] = null as any;
        }
      }

      // Place existing tiles at the bottom of the section
      let writeRow = section.end;
      for (let i = tiles.length - 1; i >= 0; i--) {
        const tile = tiles[i];
        newBoard[writeRow][col] = {
          ...tile,
          row: writeRow,
          col,
          id: tile.id, // Preserve the original ID
          type: tile.type, // Preserve the original type
          isSpecial: tile.isSpecial, // Preserve special status
        };
        writeRow--;
      }

      // Fill remaining spaces with new regular tiles
      for (let row = writeRow; row >= section.start; row--) {
        const randomType =
          tileTypes[Math.floor(Math.random() * tileTypes.length)];
        newBoard[row][col] = {
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          type: randomType,
          row,
          col,
          isSpecial: false, // New tiles are never special
        };
      }
    }

    // Ensure sand blocker positions are null
    for (const blockerRow of sandBlockerRows) {
      newBoard[blockerRow][col] = null as any;
    }
  }

  return newBoard;
};

// Check if a move creates bomb or rocket patterns
const checkSpecialPatterns = (
  board: Tile[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  // Check for bomb trigger
  if (detectBombTrigger(board, fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  // Check for rocket trigger
  const rocketResult = detectRocketTrigger(
    board,
    fromRow,
    fromCol,
    toRow,
    toCol,
  );
  return rocketResult.triggered;
};

// Check if a move is valid (will create a match)
export const isValidMove = (
  board: Tile[][],
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): boolean => {
  if (!areAdjacent(row1, col1, row2, col2)) {
    return false;
  }

  // Create a copy of the board with the swap
  const testBoard = board.map(row => [...row]);
  const temp = testBoard[row1][col1];
  testBoard[row1][col1] = testBoard[row2][col2];
  testBoard[row2][col2] = temp;

  // Check if the swap creates any basic matches
  const matches = findMatches(testBoard);
  if (matches.length > 0) {
    return true;
  }

  // Check if the swap creates bomb or rocket patterns
  if (checkSpecialPatterns(testBoard, row1, col1, row2, col2)) {
    return true;
  }

  return false;
};

// Get all valid moves on the current board
export const getValidMoves = (
  board: Tile[][],
): Array<{ row1: number; col1: number; row2: number; col2: number }> => {
  const validMoves: Array<{
    row1: number;
    col1: number;
    row2: number;
    col2: number;
  }> = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Check right neighbor
      if (col < BOARD_SIZE - 1) {
        if (isValidMove(board, row, col, row, col + 1)) {
          validMoves.push({ row1: row, col1: col, row2: row, col2: col + 1 });
        }
      }

      // Check bottom neighbor
      if (row < BOARD_SIZE - 1) {
        if (isValidMove(board, row, col, row + 1, col)) {
          validMoves.push({ row1: row, col1: col, row2: row + 1, col2: col });
        }
      }
    }
  }

  return validMoves;
};

// Process a complete game turn (swap, find matches, remove, drop)
export const processTurn = (
  board: Tile[][],
  variant: 'sand' | 'sea' = 'sand',
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }> = [],
  userSwap?: { row1: number; col1: number; row2: number; col2: number },
): {
  newBoard: Tile[][];
  matches: Array<Array<{ row: number; col: number }>>;
  totalMatches: number;
} => {
  let currentBoard = board.map(row => [...row]);
  let allMatches: Array<Array<{ row: number; col: number }>> = [];
  let totalMatches = 0;

  // If userSwap is provided, check for bomb/rocket mechanics
  if (userSwap) {
    // Swap the tiles
    const { row1, col1, row2, col2 } = userSwap;
    const temp = currentBoard[row1][col1];
    currentBoard[row1][col1] = currentBoard[row2][col2];
    currentBoard[row2][col2] = temp;

    // Check for bomb trigger first (bomb takes precedence)
    if (detectBombTrigger(currentBoard, row1, col1, row2, col2)) {
      const bombArea = getBombExplosionTiles(row2, col2);
      allMatches.push(bombArea);
      totalMatches += 1;
      currentBoard = removeMatches(currentBoard, [bombArea]);
      currentBoard = dropTiles(currentBoard, variant, sandBlockers);
    } else {
      // Check for rocket trigger
      const rocketResult = detectRocketTrigger(
        currentBoard,
        row1,
        col1,
        row2,
        col2,
      );
      if (rocketResult.triggered) {
        const rocketArea = getRocketExplosionTiles(
          row2,
          col2,
          rocketResult.isHorizontal,
        );
        allMatches.push(rocketArea);
        totalMatches += 1;
        currentBoard = removeMatches(currentBoard, [rocketArea]);
        currentBoard = dropTiles(currentBoard, variant, sandBlockers);
      } else {
        // No bomb or rocket, just process normal matches
        const matches = findMatches(currentBoard);
        if (matches.length > 0) {
          allMatches = allMatches.concat(matches);
          totalMatches += matches.length;
          currentBoard = removeMatches(currentBoard, matches);
          currentBoard = dropTiles(currentBoard, variant, sandBlockers);
        }
      }
    }

    // After special effect, process cascades as normal
    let hasMatches = true;
    while (hasMatches) {
      const matches = findMatches(currentBoard);
      if (matches.length === 0) {
        hasMatches = false;
      } else {
        allMatches = allMatches.concat(matches);
        totalMatches += matches.length;
        currentBoard = removeMatches(currentBoard, matches);
        currentBoard = dropTiles(currentBoard, variant, sandBlockers);
      }
    }
    return {
      newBoard: currentBoard,
      matches: allMatches,
      totalMatches,
    };
  }

  // If not a user swap, process as before (cascades only)
  let hasMatches = true;
  while (hasMatches) {
    const matches = findMatches(currentBoard);
    if (matches.length === 0) {
      hasMatches = false;
    } else {
      allMatches = allMatches.concat(matches);
      totalMatches += matches.length;
      currentBoard = removeMatches(currentBoard, matches);
      currentBoard = dropTiles(currentBoard, variant, sandBlockers);
    }
  }

  return {
    newBoard: currentBoard,
    matches: allMatches,
    totalMatches,
  };
};

// Create a board with no initial matches
export const createValidBoard = (
  variant: 'sand' | 'sea' = 'sand',
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }> = [],
): Tile[][] => {
  const board: Tile[][] = [];
  const tileTypes = getTileTypes(variant);

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Check if this position has a sand blocker
      const hasSandBlocker = sandBlockers.some(
        blocker => blocker.row === row && blocker.col === col,
      );

      if (hasSandBlocker) {
        // Don't place a tile in sand blocker position
        board[row][col] = null as any;
        continue;
      }

      let randomType: TileType;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        // Check for horizontal matches (last 2 tiles in same row)
        let hasHorizontalMatch = false;
        if (col >= 2) {
          const tile1 = board[row][col - 1];
          const tile2 = board[row][col - 2];
          if (tile1 && tile2 && tile1.type === tile2.type) {
            hasHorizontalMatch = true;
          }
        }

        // Check for vertical matches (last 2 tiles in same column)
        let hasVerticalMatch = false;
        if (row >= 2) {
          const tile1 = board[row - 1][col];
          const tile2 = board[row - 2][col];
          if (tile1 && tile2 && tile1.type === tile2.type) {
            hasVerticalMatch = true;
          }
        }

        // If we have a potential match, avoid that tile type
        if (hasHorizontalMatch || hasVerticalMatch) {
          const avoidTypes: TileType[] = [];

          if (hasHorizontalMatch && col >= 2) {
            avoidTypes.push(board[row][col - 1].type);
          }
          if (hasVerticalMatch && row >= 2) {
            avoidTypes.push(board[row - 1][col].type);
          }

          const availableTypes = tileTypes.filter(
            type => !avoidTypes.includes(type),
          );
          randomType =
            availableTypes[Math.floor(Math.random() * availableTypes.length)];
        } else {
          // No potential matches, use any random type
          randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        }

        attempts++;
      } while (
        attempts < maxAttempts &&
        // Double-check that this tile won't create a match
        ((col >= 2 &&
          board[row][col - 1] &&
          board[row][col - 2] &&
          board[row][col - 1].type === board[row][col - 2].type &&
          board[row][col - 1].type === randomType) ||
          (row >= 2 &&
            board[row - 1][col] &&
            board[row - 2][col] &&
            board[row - 1][col].type === board[row - 2][col].type &&
            board[row - 1][col].type === randomType))
      );

      board[row][col] = {
        id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        type: randomType,
        row,
        col,
      };
    }
  }

  // Final verification - check if the board has any matches
  const matches = findMatches(board);
  if (matches.length > 0) {
    console.warn('Board created with matches, regenerating...');
    return createValidBoard(variant); // Recursively try again
  }

  return board;
};

// Create a board from level configuration
export const createBoardFromLevel = (
  levelBoard: (TileType | string | null)[][],
  variant: 'sand' | 'sea' = 'sand',
  sandBlockers: Array<{ row: number; col: number; hasUmbrella?: boolean }> = [],
  specialTiles?: Array<{
    type: string;
    row: number;
    col: number;
    properties?: Record<string, any>;
  }>,
): Tile[][] => {
  const board: Tile[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // First pass: Create tiles from the level board
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tileType = levelBoard[row]?.[col];
      if (tileType) {
        board[row][col] = {
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          type: tileType as TileType,
          row,
          col,
          isSpecial: tileType === '🥥', // Mark coconuts as special
        };
      }
    }
  }

  // Second pass: Process special tiles from level configuration
  if (specialTiles) {
    specialTiles.forEach(specialTile => {
      const { row, col, properties } = specialTile;
      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        // If there's already a tile at this position, update its properties
        if (board[row][col]) {
          board[row][col] = {
            ...board[row][col]!,
            isSpecial: true,
            ...properties,
          };
        } else {
          // Create a new special tile
          board[row][col] = {
            id: `${row}-${col}-${Date.now()}-${Math.random()}`,
            type: '🥥' as TileType, // Default to coconut for special tiles
            row,
            col,
            isSpecial: true,
            ...properties,
          };
        }
      }
    });
  }

  // Second pass: Ensure no matches exist in the initial board
  // Only check and fix regular tiles, not special tiles
  const tileTypes = getTileTypes(variant);
  let hasMatches = true;
  while (hasMatches) {
    const matches = findMatches(board);
    if (matches.length === 0) {
      hasMatches = false;
    } else {
      // Replace matched regular tiles with random tiles
      matches.forEach(match => {
        match.forEach(({ row, col }) => {
          const tile = board[row][col];
          if (tile && !tile.isSpecial) {
            // Only replace non-special tiles
            const randomType =
              tileTypes[Math.floor(Math.random() * tileTypes.length)];
            board[row][col] = {
              id: `${row}-${col}-${Date.now()}-${Math.random()}`,
              type: randomType,
              row,
              col,
            };
          }
        });
      });
    }
  }

  // Third pass: Ensure sand blocker positions are null
  sandBlockers.forEach(({ row, col }) => {
    board[row][col] = null as any;
  });

  return board;
};

// Bomb and Rocket Mechanics

// Check if a user swap triggers a bomb (both vertical and horizontal matches at swapped-in tile)
export const detectBombTrigger = (
  board: Tile[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  // Create a copy of the board with the swap
  const testBoard = board.map(row => [...row]);
  const temp = testBoard[fromRow][fromCol];
  testBoard[fromRow][fromCol] = testBoard[toRow][toCol];
  testBoard[toRow][toCol] = temp;

  // The swapped-in tile is the axis (where the user moved a tile TO)
  const axisRow = toRow;
  const axisCol = toCol;
  const axisTile = testBoard[axisRow][axisCol];

  if (!axisTile || axisTile.isSpecial) return false;

  // Find all matches that include the axis point
  const matches = findMatches(testBoard);
  const matchesAtAxis = matches.filter(match =>
    match.some(pos => pos.row === axisRow && pos.col === axisCol),
  );

  // Check for both horizontal and vertical matches at the axis
  let horizontalMatch: Array<{ row: number; col: number }> | null = null;
  let verticalMatch: Array<{ row: number; col: number }> | null = null;

  for (const match of matchesAtAxis) {
    if (match.every(pos => pos.row === axisRow)) {
      horizontalMatch = match;
    }
    if (match.every(pos => pos.col === axisCol)) {
      verticalMatch = match;
    }
  }

  // Bomb condition: both matches exist, same type, axis point is intersection
  return !!(
    horizontalMatch &&
    verticalMatch &&
    horizontalMatch.length >= 3 &&
    verticalMatch.length >= 3 &&
    axisTile.type ===
      testBoard[horizontalMatch[0].row][horizontalMatch[0].col].type &&
    axisTile.type === testBoard[verticalMatch[0].row][verticalMatch[0].col].type
  );
};

// Get the 5x5 explosion area for a bomb centered on the axis tile
export const getBombExplosionTiles = (
  axisRow: number,
  axisCol: number,
): Array<{ row: number; col: number }> => {
  const explosionArea: Array<{ row: number; col: number }> = [];

  // 5x5 grid centered on axis (±2 rows/cols)
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = axisRow + dr;
      const c = axisCol + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        explosionArea.push({ row: r, col: c });
      }
    }
  }

  return explosionArea;
};

// Check if a user swap triggers a rocket (match of exactly 4 tiles)
export const detectRocketTrigger = (
  board: Tile[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): { triggered: boolean; isHorizontal: boolean } => {
  // Create a copy of the board with the swap
  const testBoard = board.map(row => [...row]);
  const temp = testBoard[fromRow][fromCol];
  testBoard[fromRow][fromCol] = testBoard[toRow][toCol];
  testBoard[toRow][toCol] = temp;

  // The swapped-in tile is the axis
  const axisRow = toRow;
  const axisCol = toCol;
  const axisTile = testBoard[axisRow][axisCol];
  if (!axisTile || axisTile.isSpecial)
    return { triggered: false, isHorizontal: false };

  // Helper to check for a window of 4 matching tiles including the axis
  function checkWindow(deltaRow: number, deltaCol: number): boolean {
    // Check all possible 4-tile windows that could include the axis
    for (let offset = -3; offset <= 0; offset++) {
      let match = true;
      let axisInWindow = false;

      // Check if all 4 tiles in this window match and axis is included
      for (let i = 0; i < 4; i++) {
        const r = axisRow + (offset + i) * deltaRow;
        const c = axisCol + (offset + i) * deltaCol;

        // Check bounds
        if (
          r < 0 ||
          r >= testBoard.length ||
          c < 0 ||
          c >= testBoard[0].length ||
          !testBoard[r][c] ||
          testBoard[r][c].type !== axisTile.type
        ) {
          match = false;
          break;
        }

        // Check if this position is the axis
        if (r === axisRow && c === axisCol) {
          axisInWindow = true;
        }
      }

      // If we found a valid 4-tile match that includes the axis, we have a rocket
      if (match && axisInWindow) {
        return true;
      }
    }
    return false;
  }

  // Check horizontal
  if (checkWindow(0, 1)) {
    return { triggered: true, isHorizontal: true };
  }
  // Check vertical
  if (checkWindow(1, 0)) {
    return { triggered: true, isHorizontal: false };
  }
  return { triggered: false, isHorizontal: false };
};

// Get the explosion area for a rocket (perpendicular row or column)
export const getRocketExplosionTiles = (
  axisRow: number,
  axisCol: number,
  isHorizontal: boolean,
): Array<{ row: number; col: number }> => {
  const explosionArea: Array<{ row: number; col: number }> = [];

  if (isHorizontal) {
    // Horizontal match: explode the entire column of the axis
    for (let row = 0; row < BOARD_SIZE; row++) {
      explosionArea.push({ row, col: axisCol });
    }
  } else {
    // Vertical match: explode the entire row of the axis
    for (let col = 0; col < BOARD_SIZE; col++) {
      explosionArea.push({ row: axisRow, col });
    }
  }

  return explosionArea;
};
