import {Tile, TileType} from '../types/game';

const BOARD_SIZE = 8;
const TILE_TYPES: TileType[] = ['🌴', '🐚', '🌺', '🐠', '⭐'];

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
): Array<Array<{row: number; col: number}>> => {
  const matches: Array<Array<{row: number; col: number}>> = [];
  const matchedPositions = new Set<string>();

  console.log(
    'Finding matches in board:',
    board.map(row => row.map(tile => tile?.type || 'null')),
  );

  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const tile1 = board[row][col];
      const tile2 = board[row][col + 1];
      const tile3 = board[row][col + 2];

      if (tile1.type === tile2.type && tile2.type === tile3.type) {
        // Build the complete match first
        const match: Array<{row: number; col: number}> = [
          {row, col},
          {row, col: col + 1},
          {row, col: col + 2},
        ];

        // Extend match to the right
        for (let i = col + 3; i < BOARD_SIZE; i++) {
          if (board[row][i].type === tile1.type) {
            match.push({row, col: i});
          } else {
            break;
          }
        }

        // Check if ANY position in this match is already matched
        const hasOverlap = match.some(pos =>
          matchedPositions.has(`${pos.row}-${pos.col}`),
        );
        if (hasOverlap) {
          console.log('Skipping horizontal match - has overlap:', match);
          continue;
        }

        // Mark all positions in this match as matched
        match.forEach(pos => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });

        console.log('Found horizontal match:', match);
        matches.push(match);
      }
    }
  }

  // Check vertical matches
  for (let row = 0; row < BOARD_SIZE - 2; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile1 = board[row][col];
      const tile2 = board[row + 1][col];
      const tile3 = board[row + 2][col];

      if (tile1.type === tile2.type && tile2.type === tile3.type) {
        // Build the complete match first
        const match: Array<{row: number; col: number}> = [
          {row, col},
          {row: row + 1, col},
          {row: row + 2, col},
        ];

        // Extend match downward
        for (let i = row + 3; i < BOARD_SIZE; i++) {
          if (board[i][col].type === tile1.type) {
            match.push({row: i, col});
          } else {
            break;
          }
        }

        // Check if ANY position in this match is already matched
        const hasOverlap = match.some(pos =>
          matchedPositions.has(`${pos.row}-${pos.col}`),
        );
        if (hasOverlap) {
          console.log('Skipping vertical match - has overlap:', match);
          continue;
        }

        // Mark all positions in this match as matched
        match.forEach(pos => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });

        console.log('Found vertical match:', match);
        matches.push(match);
      }
    }
  }

  console.log('All matches found:', matches);
  return matches;
};

// Remove matched tiles and return their positions
export const removeMatches = (
  board: Tile[][],
  matches: Array<Array<{row: number; col: number}>>,
): Tile[][] => {
  const newBoard = board.map(row => [...row]);
  const matchedPositions = new Set<string>();

  // Mark all matched positions
  matches.forEach(match => {
    match.forEach(pos => {
      matchedPositions.add(`${pos.row}-${pos.col}`);
    });
  });

  // Remove matched tiles
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (matchedPositions.has(`${row}-${col}`)) {
        newBoard[row][col] = null as any;
      }
    }
  }

  return newBoard;
};

// Make tiles fall down to fill empty spaces
export const dropTiles = (board: Tile[][]): Tile[][] => {
  const newBoard = board.map(row => [...row]);

  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1;

    // Move from bottom to top, keeping non-null tiles
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        if (writeRow !== row) {
          newBoard[writeRow][col] = newBoard[row][col];
          newBoard[writeRow][col].row = writeRow;
        }
        writeRow--;
      }
    }

    // Fill remaining spaces with new tiles
    for (let row = writeRow; row >= 0; row--) {
      const randomType =
        TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
      newBoard[row][col] = {
        id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        type: randomType,
        row,
        col,
      };
    }
  }

  return newBoard;
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

  // Check if the swap creates any matches
  const matches = findMatches(testBoard);
  return matches.length > 0;
};

// Get all valid moves on the current board
export const getValidMoves = (
  board: Tile[][],
): Array<{row1: number; col1: number; row2: number; col2: number}> => {
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
          validMoves.push({row1: row, col1: col, row2: row, col2: col + 1});
        }
      }

      // Check bottom neighbor
      if (row < BOARD_SIZE - 1) {
        if (isValidMove(board, row, col, row + 1, col)) {
          validMoves.push({row1: row, col1: col, row2: row + 1, col2: col});
        }
      }
    }
  }

  return validMoves;
};

// Process a complete game turn (swap, find matches, remove, drop)
export const processTurn = (
  board: Tile[][],
): {
  newBoard: Tile[][];
  matches: Array<Array<{row: number; col: number}>>;
  totalMatches: number;
} => {
  let currentBoard = board.map(row => [...row]);
  let allMatches: Array<Array<{row: number; col: number}>> = [];
  let totalMatches = 0;

  // Keep processing until no more matches
  let hasMatches = true;
  while (hasMatches) {
    const matches = findMatches(currentBoard);
    if (matches.length === 0) {
      hasMatches = false;
    } else {
      allMatches = allMatches.concat(matches);
      totalMatches += matches.length;
      currentBoard = removeMatches(currentBoard, matches);
      currentBoard = dropTiles(currentBoard);
    }
  }

  return {
    newBoard: currentBoard,
    matches: allMatches,
    totalMatches,
  };
};

// Create a board with no initial matches
export const createValidBoard = (): Tile[][] => {
  const board: Tile[][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let randomType: TileType;

      // Avoid creating obvious matches
      if (
        col >= 2 &&
        board[row][col - 1] &&
        board[row][col - 2] &&
        board[row][col - 1].type === board[row][col - 2].type
      ) {
        // Don't use the same type as the last two tiles
        const avoidType = board[row][col - 1].type;
        const otherTypes = TILE_TYPES.filter(type => type !== avoidType);
        randomType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
      } else if (
        row >= 2 &&
        board[row - 1][col] &&
        board[row - 2][col] &&
        board[row - 1][col].type === board[row - 2][col].type
      ) {
        // Don't use the same type as the last two tiles vertically
        const avoidType = board[row - 1][col].type;
        const otherTypes = TILE_TYPES.filter(type => type !== avoidType);
        randomType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
      } else {
        // Use any random type
        randomType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
      }

      board[row][col] = {
        id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        type: randomType,
        row,
        col,
      };
    }
  }

  return board;
};
