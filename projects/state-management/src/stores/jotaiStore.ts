import { atom } from 'jotai';
import { atomWithStorage, atomWithReducer, atomFamily, loadable } from 'jotai/utils';

// ============================================================================
// PRIMITIVE ATOMS
// ============================================================================

// Basic counter atom
export const counterAtom = atom(0);

// Text input atom
export const textAtom = atom('');

// Theme atom with localStorage persistence
export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');

// Language atom with localStorage persistence
export const languageAtom = atomWithStorage('language', 'en');

// ============================================================================
// DERIVED ATOMS (COMPUTED VALUES)
// ============================================================================

// Computed atom that depends on counter
export const doubleCountAtom = atom((get) => get(counterAtom) * 2);

// Computed atom that formats text
export const formattedTextAtom = atom((get) => {
  const text = get(textAtom);
  return text.toUpperCase().trim();
});

// Read-write derived atom for counter operations
export const counterControlsAtom = atom(
  (get) => get(counterAtom), // read
  (get, set, action: 'increment' | 'decrement' | 'reset') => { // write
    const current = get(counterAtom);
    switch (action) {
      case 'increment':
        set(counterAtom, current + 1);
        break;
      case 'decrement':
        set(counterAtom, current - 1);
        break;
      case 'reset':
        set(counterAtom, 0);
        break;
    }
  }
);

// ============================================================================
// TODO LIST WITH ATOMWITHIMMER
// ============================================================================

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Todo list atom using Immer for immutable updates
export const todosAtom = atom<Todo[]>([]);

// Derived atoms for todo statistics
export const todoStatsAtom = atom((get) => {
  const todos = get(todosAtom);
  return {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length
  };
});

export const completedTodosAtom = atom((get) => 
  get(todosAtom).filter(todo => todo.completed)
);

export const activeTodosAtom = atom((get) => 
  get(todosAtom).filter(todo => !todo.completed)
);

// Write-only atom for todo operations
export const todoActionsAtom = atom(
  null,
  (get, set, action: 
    | { type: 'add'; text: string }
    | { type: 'toggle'; id: string }
    | { type: 'remove'; id: string }
    | { type: 'clear-completed' }
  ) => {
    set(todosAtom, (draft) => {
      switch (action.type) {
        case 'add':
          draft.push({
            id: crypto.randomUUID(),
            text: action.text.trim(),
            completed: false,
            createdAt: new Date()
          });
          break;
        case 'toggle':
          const todo = draft.find(t => t.id === action.id);
          if (todo) {
            todo.completed = !todo.completed;
          }
          break;
        case 'remove':
          return draft.filter(todo => todo.id !== action.id);
        case 'clear-completed':
          return draft.filter(todo => !todo.completed);
      }
    });
  }
);

// ============================================================================
// ASYNC ATOMS FOR DATA FETCHING
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Simulate API call
const fetchUser = async (userId: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (userId === 'error') {
    throw new Error('User not found');
  }
  
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
  };
};

// Current user ID atom
export const userIdAtom = atom<string | null>(null);

// Async atom that fetches user data
export const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  if (!userId) return null;
  return fetchUser(userId);
});

// Loadable atom for better async state handling
// This provides loading, error, and data states
export const userLoadableAtom = loadable(userAtom);

// Write atom for updating user
export const updateUserAtom = atom(
  null,
  async (get, set, updates: Partial<User>) => {
    const currentUser = await get(userAtom);
    if (currentUser) {
      // In a real app, you'd make an API call here
      console.log('Updating user:', { ...currentUser, ...updates });
    }
  }
);

// ============================================================================
// ATOM FAMILIES FOR DYNAMIC ATOMS
// ============================================================================

// Atom family for managing multiple counters by ID
export const counterFamilyAtom = atomFamily((id: string) => 
  atom(0)
);

// Atom family for form field validation
export const formFieldAtom = atomFamily((fieldName: string) => 
  atom({
    value: '',
    error: null as string | null,
    touched: false
  })
);

// Atom family for cached API data
export const apiCacheAtom = atomFamily((endpoint: string) => 
  atom(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { endpoint, data: `Data for ${endpoint}`, timestamp: Date.now() };
  })
);

// ============================================================================
// REDUCER ATOM EXAMPLE
// ============================================================================

interface CounterState {
  value: number;
  history: number[];
}

type CounterAction = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; value: number }
  | { type: 'reset' };

const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'increment':
      return {
        value: state.value + 1,
        history: [...state.history, state.value + 1]
      };
    case 'decrement':
      return {
        value: state.value - 1,
        history: [...state.history, state.value - 1]
      };
    case 'set':
      return {
        value: action.value,
        history: [...state.history, action.value]
      };
    case 'reset':
      return {
        value: 0,
        history: [0]
      };
    default:
      return state;
  }
};

export const counterWithHistoryAtom = atomWithReducer(
  { value: 0, history: [0] },
  counterReducer
);

// ============================================================================
// COMPLEX STATE MANAGEMENT
// ============================================================================

// Shopping cart example with complex state
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const cartAtom = atom<CartItem[]>([]);

export const cartTotalAtom = atom((get) => {
  const items = get(cartAtom);
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

export const cartItemCountAtom = atom((get) => {
  const items = get(cartAtom);
  return items.reduce((count, item) => count + item.quantity, 0);
});

export const cartActionsAtom = atom(
  null,
  (get, set, action: 
    | { type: 'add'; item: Omit<CartItem, 'quantity'> }
    | { type: 'remove'; id: string }
    | { type: 'update-quantity'; id: string; quantity: number }
    | { type: 'clear' }
  ) => {
    set(cartAtom, (draft) => {
      switch (action.type) {
        case 'add':
          const existingItem = draft.find(item => item.id === action.item.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            draft.push({ ...action.item, quantity: 1 });
          }
          break;
        case 'remove':
          return draft.filter(item => item.id !== action.id);
        case 'update-quantity':
          const item = draft.find(item => item.id === action.id);
          if (item) {
            item.quantity = Math.max(0, action.quantity);
          }
          break;
        case 'clear':
          return [];
      }
    });
  }
);

// ============================================================================
// SETTINGS WITH VALIDATION
// ============================================================================

export interface AppSettings {
  notifications: boolean;
  autoSave: boolean;
  maxItems: number;
  apiEndpoint: string;
}

const defaultSettings: AppSettings = {
  notifications: true,
  autoSave: true,
  maxItems: 100,
  apiEndpoint: 'https://api.example.com'
};

export const settingsAtom = atomWithStorage<AppSettings>('app-settings', defaultSettings);

// Validated settings atom
export const validatedSettingsAtom = atom(
  (get) => get(settingsAtom),
  (get, set, newSettings: Partial<AppSettings>) => {
    const current = get(settingsAtom);
    const updated = { ...current, ...newSettings };
    
    // Validation
    if (updated.maxItems < 1) updated.maxItems = 1;
    if (updated.maxItems > 1000) updated.maxItems = 1000;
    if (!updated.apiEndpoint.startsWith('https://')) {
      throw new Error('API endpoint must use HTTPS');
    }
    
    set(settingsAtom, updated);
  }
);

// ============================================================================
// HELPER ATOMS FOR DEBUGGING
// ============================================================================

// Atom that logs all state changes
export const debugAtom = atom(
  null,
  (get, set, { atomName, value }: { atomName: string; value: any }) => {
    console.log(`[Jotai Debug] ${atomName}:`, value);
  }
);

// Atom that tracks the number of renders
export const renderCountAtom = atom(0);

export const incrementRenderCountAtom = atom(
  null,
  (get, set) => {
    set(renderCountAtom, get(renderCountAtom) + 1);
  }
);

// ============================================================================
// EXPORT COLLECTIONS FOR EASIER IMPORTS
// ============================================================================

// Basic atoms
export const basicAtoms = {
  counter: counterAtom,
  text: textAtom,
  theme: themeAtom,
  language: languageAtom
};

// Todo-related atoms
export const todoAtoms = {
  todos: todosAtom,
  stats: todoStatsAtom,
  completed: completedTodosAtom,
  active: activeTodosAtom,
  actions: todoActionsAtom
};

// User-related atoms
export const userAtoms = {
  userId: userIdAtom,
  user: userAtom,
  userLoadable: userLoadableAtom,
  updateUser: updateUserAtom
};

// Cart-related atoms
export const cartAtoms = {
  cart: cartAtom,
  total: cartTotalAtom,
  itemCount: cartItemCountAtom,
  actions: cartActionsAtom
};

// Settings atoms
export const settingsAtoms = {
  settings: settingsAtom,
  validatedSettings: validatedSettingsAtom
};