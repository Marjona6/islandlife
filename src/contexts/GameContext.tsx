import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GameState, Currency, BeachItem, Tile, TileType} from '../types/game';
import {createValidBoard} from '../utils/gameLogic';

// Game constants
const BOARD_SIZE = 8;
const TARGET_COMBOS = 10;
const TILE_TYPES: TileType[] = ['🌴', '🐚', '🌺', '🐠', '⭐'];

// Initial state
const initialGameState: GameState = {
  board: [],
  score: 0,
  combos: 0,
  targetCombos: TARGET_COMBOS,
  isGameWon: false,
  isGameOver: false,
};

const initialCurrency: Currency = {
  shells: 0,
  keys: 0,
};

const initialBeachItems: BeachItem[] = [
  {
    id: 'palm-tree',
    name: 'Palm Tree',
    cost: 1,
    isPurchased: false,
    icon: '🌴',
  },
  {
    id: 'beach-chair',
    name: 'Beach Chair',
    cost: 2,
    isPurchased: false,
    icon: '🪑',
  },
  {
    id: 'umbrella',
    name: 'Beach Umbrella',
    cost: 3,
    isPurchased: false,
    icon: '⛱️',
  },
  {
    id: 'volleyball',
    name: 'Volleyball Net',
    cost: 5,
    isPurchased: false,
    icon: '🏐',
  },
];

// Action types
type GameAction =
  | {type: 'INIT_BOARD'}
  | {
      type: 'SWAP_TILES';
      payload: {row1: number; col1: number; row2: number; col2: number};
    }
  | {type: 'UPDATE_BOARD'; payload: Tile[][]}
  | {type: 'INCREMENT_COMBOS'}
  | {type: 'RESET_GAME'}
  | {type: 'SET_GAME_WON'};

type CurrencyAction =
  | {type: 'ADD_SHELLS'; payload: number}
  | {type: 'ADD_KEYS'; payload: number}
  | {type: 'SPEND_KEYS'; payload: number}
  | {type: 'LOAD_CURRENCY'; payload: Currency};

type BeachAction =
  | {type: 'PURCHASE_ITEM'; payload: string}
  | {type: 'LOAD_BEACH_ITEMS'; payload: BeachItem[]};

// Reducers
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INIT_BOARD':
      return {
        ...state,
        board: createValidBoard(),
        score: 0,
        combos: 0,
        isGameWon: false,
        isGameOver: false,
      };

    case 'SWAP_TILES':
      const {row1, col1, row2, col2} = action.payload;
      const updatedBoard = state.board.map(row => [...row]);
      const temp = updatedBoard[row1][col1];
      updatedBoard[row1][col1] = updatedBoard[row2][col2];
      updatedBoard[row2][col2] = temp;

      return {
        ...state,
        board: updatedBoard,
      };

    case 'UPDATE_BOARD':
      return {
        ...state,
        board: action.payload,
      };

    case 'INCREMENT_COMBOS':
      const newCombos = state.combos + 1;
      return {
        ...state,
        combos: newCombos,
        isGameWon: newCombos >= TARGET_COMBOS,
      };

    case 'RESET_GAME':
      return {
        ...initialGameState,
        targetCombos: TARGET_COMBOS,
      };

    case 'SET_GAME_WON':
      return {
        ...state,
        isGameWon: true,
      };

    default:
      return state;
  }
};

const currencyReducer = (state: Currency, action: CurrencyAction): Currency => {
  switch (action.type) {
    case 'ADD_SHELLS':
      return {...state, shells: state.shells + action.payload};
    case 'ADD_KEYS':
      return {...state, keys: state.keys + action.payload};
    case 'SPEND_KEYS':
      return {...state, keys: Math.max(0, state.keys - action.payload)};
    case 'LOAD_CURRENCY':
      return action.payload;
    default:
      return state;
  }
};

const beachReducer = (state: BeachItem[], action: BeachAction): BeachItem[] => {
  switch (action.type) {
    case 'PURCHASE_ITEM':
      return state.map(item =>
        item.id === action.payload ? {...item, isPurchased: true} : item,
      );
    case 'LOAD_BEACH_ITEMS':
      return action.payload;
    default:
      return state;
  }
};

// Context
interface GameContextType {
  gameState: GameState;
  currency: Currency;
  beachItems: BeachItem[];
  dispatchGame: React.Dispatch<GameAction>;
  dispatchCurrency: React.Dispatch<CurrencyAction>;
  dispatchBeach: React.Dispatch<BeachAction>;
  initGame: () => void;
  swapTiles: (row1: number, col1: number, row2: number, col2: number) => void;
  purchaseBeachItem: (itemId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
export const GameProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [gameState, dispatchGame] = useReducer(gameReducer, initialGameState);
  const [currency, dispatchCurrency] = useReducer(
    currencyReducer,
    initialCurrency,
  );
  const [beachItems, dispatchBeach] = useReducer(
    beachReducer,
    initialBeachItems,
  );

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('islandlife_currency');
      const savedBeachItems = await AsyncStorage.getItem(
        'islandlife_beach_items',
      );

      if (savedCurrency) {
        dispatchCurrency({
          type: 'LOAD_CURRENCY',
          payload: JSON.parse(savedCurrency),
        });
      }

      if (savedBeachItems) {
        dispatchBeach({
          type: 'LOAD_BEACH_ITEMS',
          payload: JSON.parse(savedBeachItems),
        });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveCurrency = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        'islandlife_currency',
        JSON.stringify(currency),
      );
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  }, [currency]);

  const saveBeachItems = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        'islandlife_beach_items',
        JSON.stringify(beachItems),
      );
    } catch (error) {
      console.error('Error saving beach items:', error);
    }
  }, [beachItems]);

  // Save data when it changes
  useEffect(() => {
    saveCurrency();
  }, [saveCurrency]);

  useEffect(() => {
    saveBeachItems();
  }, [saveBeachItems]);

  const initGame = () => {
    dispatchGame({type: 'INIT_BOARD'});
  };

  const swapTiles = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ) => {
    dispatchGame({type: 'SWAP_TILES', payload: {row1, col1, row2, col2}});
  };

  const purchaseBeachItem = (itemId: string) => {
    const item = beachItems.find(i => i.id === itemId);
    if (item && !item.isPurchased && currency.keys >= item.cost) {
      dispatchCurrency({type: 'SPEND_KEYS', payload: item.cost});
      dispatchBeach({type: 'PURCHASE_ITEM', payload: itemId});
    }
  };

  const value: GameContextType = {
    gameState,
    currency,
    beachItems,
    dispatchGame,
    dispatchCurrency,
    dispatchBeach,
    initGame,
    swapTiles,
    purchaseBeachItem,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
