import { proxy, snapshot, subscribe, ref } from 'valtio';
import { derive } from 'valtio/utils';
import { subscribeKey } from 'valtio/utils';
import { devtools } from 'valtio/utils';

// ============================================================================
// BASIC PROXY STATE
// ============================================================================

// Simple counter state
export const counterState = proxy({
  count: 0,
  increment: () => {
    counterState.count++;
  },
  decrement: () => {
    counterState.count--;
  },
  reset: () => {
    counterState.count = 0;
  }
});

// ============================================================================
// COMPLEX NESTED STATE
// ============================================================================

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

export interface AppState {
  // User state
  user: User | null;
  isLoadingUser: boolean;
  userError: string | null;

  // Todo state
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  
  // UI state
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'todos' | 'settings';
  
  // App settings
  settings: {
    autoSave: boolean;
    maxTodos: number;
    apiEndpoint: string;
  };

  // Methods for user operations
  fetchUser: (userId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;

  // Methods for todo operations
  addTodo: (text: string, priority?: Todo['priority']) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  clearCompleted: () => void;
  setFilter: (filter: AppState['filter']) => void;

  // UI methods
  toggleSidebar: () => void;
  setCurrentView: (view: AppState['currentView']) => void;

  // Settings methods
  updateSettings: (updates: Partial<AppState['settings']>) => void;
}

// Simulate async user fetch
const simulateUserFetch = (userId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 'error') {
        reject(new Error('User not found'));
      } else {
        resolve({
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true
          }
        });
      }
    }, 1000);
  });
};

// Main application state with all functionality
export const appState = proxy<AppState>({
  // Initial state
  user: null,
  isLoadingUser: false,
  userError: null,
  todos: [],
  filter: 'all',
  sidebarOpen: true,
  currentView: 'dashboard',
  settings: {
    autoSave: true,
    maxTodos: 100,
    apiEndpoint: 'https://api.example.com'
  },

  // User methods
  async fetchUser(userId: string) {
    appState.isLoadingUser = true;
    appState.userError = null;

    try {
      const user = await simulateUserFetch(userId);
      appState.user = user;
    } catch (error) {
      appState.userError = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      appState.isLoadingUser = false;
    }
  },

  updateUser(updates: Partial<User>) {
    if (appState.user) {
      // Deep merge for nested objects
      Object.assign(appState.user, updates);
    }
  },

  logout() {
    appState.user = null;
    appState.userError = null;
  },

  // Todo methods
  addTodo(text: string, priority: Todo['priority'] = 'medium') {
    if (appState.todos.length >= appState.settings.maxTodos) {
      throw new Error(`Cannot add more than ${appState.settings.maxTodos} todos`);
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      priority
    };
    
    appState.todos.push(newTodo);
  },

  removeTodo(id: string) {
    const index = appState.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      appState.todos.splice(index, 1);
    }
  },

  toggleTodo(id: string) {
    const todo = appState.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  },

  updateTodo(id: string, updates: Partial<Todo>) {
    const todo = appState.todos.find(todo => todo.id === id);
    if (todo) {
      Object.assign(todo, updates);
    }
  },

  clearCompleted() {
    appState.todos = appState.todos.filter(todo => !todo.completed);
  },

  setFilter(filter: AppState['filter']) {
    appState.filter = filter;
  },

  // UI methods
  toggleSidebar() {
    appState.sidebarOpen = !appState.sidebarOpen;
  },

  setCurrentView(view: AppState['currentView']) {
    appState.currentView = view;
  },

  // Settings methods
  updateSettings(updates: Partial<AppState['settings']>) {
    Object.assign(appState.settings, updates);
  }
});

// ============================================================================
// DERIVED STATE WITH COMPUTE
// ============================================================================

// Derived state that automatically updates when dependencies change
export const derivedState = derive({
  // Todo statistics
  todoStats: (get) => {
    const todos = get(appState).todos;
    return {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      active: todos.filter(todo => !todo.completed).length,
      byPriority: {
        high: todos.filter(todo => todo.priority === 'high').length,
        medium: todos.filter(todo => todo.priority === 'medium').length,
        low: todos.filter(todo => todo.priority === 'low').length
      }
    };
  },

  // Filtered todos based on current filter
  filteredTodos: (get) => {
    const state = get(appState);
    switch (state.filter) {
      case 'active':
        return state.todos.filter(todo => !todo.completed);
      case 'completed':
        return state.todos.filter(todo => todo.completed);
      default:
        return state.todos;
    }
  },

  // Sorted todos by priority and creation date
  sortedTodos: (get) => {
    const todos = get(appState).todos;
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return [...todos].sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  },

  // User display name
  userDisplayName: (get) => {
    const user = get(appState).user;
    return user ? user.name || user.email : 'Guest';
  },

  // App theme from user preferences or default
  currentTheme: (get) => {
    const user = get(appState).user;
    return user?.preferences.theme || 'light';
  }
});

// ============================================================================
// SHOPPING CART EXAMPLE
// ============================================================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export const cartState = proxy({
  items: [] as CartItem[],
  
  // Add item to cart
  addItem(item: Omit<CartItem, 'quantity'>) {
    const existingItem = cartState.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartState.items.push({ ...item, quantity: 1 });
    }
  },

  // Remove item from cart
  removeItem(id: string) {
    const index = cartState.items.findIndex(item => item.id === id);
    if (index !== -1) {
      cartState.items.splice(index, 1);
    }
  },

  // Update item quantity
  updateQuantity(id: string, quantity: number) {
    const item = cartState.items.find(item => item.id === id);
    if (item) {
      if (quantity <= 0) {
        cartState.removeItem(id);
      } else {
        item.quantity = quantity;
      }
    }
  },

  // Clear entire cart
  clear() {
    cartState.items = [];
  }
});

// Derived cart calculations
export const cartDerived = derive({
  total: (get) => {
    const items = get(cartState).items;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  itemCount: (get) => {
    const items = get(cartState).items;
    return items.reduce((count, item) => count + item.quantity, 0);
  },

  isEmpty: (get) => {
    return get(cartState).items.length === 0;
  }
});

// ============================================================================
// FORM STATE MANAGEMENT
// ============================================================================

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export const formState = proxy({
  fields: {
    email: { value: '', error: null, touched: false, dirty: false } as FormField,
    password: { value: '', error: null, touched: false, dirty: false } as FormField,
    confirmPassword: { value: '', error: null, touched: false, dirty: false } as FormField
  },

  updateField(fieldName: keyof typeof formState.fields, value: string) {
    const field = formState.fields[fieldName];
    field.value = value;
    field.dirty = true;
    field.error = null; // Clear error on change
  },

  touchField(fieldName: keyof typeof formState.fields) {
    formState.fields[fieldName].touched = true;
  },

  validateField(fieldName: keyof typeof formState.fields) {
    const field = formState.fields[fieldName];
    
    switch (fieldName) {
      case 'email':
        if (!field.value) {
          field.error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(field.value)) {
          field.error = 'Email is invalid';
        }
        break;
      case 'password':
        if (!field.value) {
          field.error = 'Password is required';
        } else if (field.value.length < 8) {
          field.error = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (field.value !== formState.fields.password.value) {
          field.error = 'Passwords do not match';
        }
        break;
    }
  },

  validateAll() {
    Object.keys(formState.fields).forEach(fieldName => {
      formState.validateField(fieldName as keyof typeof formState.fields);
    });
  },

  reset() {
    Object.values(formState.fields).forEach(field => {
      field.value = '';
      field.error = null;
      field.touched = false;
      field.dirty = false;
    });
  }
});

// Form validation derived state
export const formDerived = derive({
  isValid: (get) => {
    const fields = get(formState).fields;
    return Object.values(fields).every(field => !field.error);
  },

  isDirty: (get) => {
    const fields = get(formState).fields;
    return Object.values(fields).some(field => field.dirty);
  },

  touchedFields: (get) => {
    const fields = get(formState).fields;
    return Object.values(fields).filter(field => field.touched).length;
  }
});

// ============================================================================
// PERSISTENCE AND LOCALSTORAGE
// ============================================================================

// Settings that persist to localStorage
export const persistentSettings = proxy({
  theme: 'light' as 'light' | 'dark',
  language: 'en',
  autoSave: true,
  notifications: true,

  // Load from localStorage on initialization
  load() {
    try {
      const saved = localStorage.getItem('valtio-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(persistentSettings, parsed);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  },

  // Save to localStorage
  save() {
    try {
      const { load, save, ...settings } = persistentSettings;
      localStorage.setItem('valtio-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }
});

// Auto-save settings to localStorage when they change
subscribe(persistentSettings, () => {
  persistentSettings.save();
});

// Load settings on module initialization
persistentSettings.load();

// ============================================================================
// DEVTOOLS INTEGRATION
// ============================================================================

// Enable Redux DevTools for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  devtools(appState, { name: 'App State', enabled: true });
  devtools(cartState, { name: 'Cart State', enabled: true });
  devtools(formState, { name: 'Form State', enabled: true });
  devtools(persistentSettings, { name: 'Settings', enabled: true });
}

// ============================================================================
// SUBSCRIPTIONS AND SIDE EFFECTS
// ============================================================================

// Subscribe to specific state changes
export const subscriptions = {
  // Log user changes
  userSubscription: subscribeKey(appState, 'user', (user) => {
    console.log('User changed:', user);
  }),

  // Auto-save todos when they change
  todoSubscription: subscribeKey(appState, 'todos', (todos) => {
    if (appState.settings.autoSave) {
      console.log('Auto-saving todos:', todos.length);
      // In a real app, you'd save to an API here
    }
  }),

  // Theme change handler
  themeSubscription: subscribeKey(persistentSettings, 'theme', (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  })
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get a snapshot of the current state (immutable)
export const getAppSnapshot = () => snapshot(appState);
export const getCartSnapshot = () => snapshot(cartState);
export const getFormSnapshot = () => snapshot(formState);

// Helper to check if state is loading
export const isLoading = () => {
  const state = snapshot(appState);
  return state.isLoadingUser;
};

// Helper to get error messages
export const getErrors = () => {
  const appSnap = snapshot(appState);
  const formSnap = snapshot(formState);
  
  return {
    user: appSnap.userError,
    form: Object.values(formSnap.fields)
      .map(field => field.error)
      .filter(Boolean)
  };
};

// ============================================================================
// EXPORT COLLECTIONS
// ============================================================================

export const stores = {
  app: appState,
  counter: counterState,
  cart: cartState,
  form: formState,
  settings: persistentSettings
};

export const derived = {
  app: derivedState,
  cart: cartDerived,
  form: formDerived
};

export const utils = {
  getAppSnapshot,
  getCartSnapshot,
  getFormSnapshot,
  isLoading,
  getErrors,
  subscriptions
};