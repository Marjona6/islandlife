export type GameBoardProps = {
  variant?: 'sand' | 'sea';
  sandBlockers?: Array<{ row: number; col: number }>;
  onMove?: () => void;
  onCoconutDrop?: (count: number) => void;
  onGameAction?: () => void;
  isTransitioning?: boolean;
  testID?: string;
};

export type GameBoardHandle = {
  processGameTurn: (
    board: any[][],
    row1?: number,
    col1?: number,
    row2?: number,
    col2?: number,
    cascadeCount?: number,
    currentSandBlockers?: Array<{
      row: number;
      col: number;
      hasUmbrella: boolean;
      sandLevel?: number;
      hasTreasure?: boolean;
    }>,
  ) => void;
};
