import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

// Types for our state
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Main store interface
interface AppState {
  // Counter state
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;

  // Todo state
  todos: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  clearCompleted: () => void;

  // User profile state
  user: User | null;
  isLoadingUser: boolean;
  userError: string | null;
  fetchUser: (userId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;

  // App settings (will be persisted)
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
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
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
        });
      }
    }, 1000);
  });
};

// Create the main Zustand store with multiple middlewares
export const useAppStore = create<AppState>()(
  // Devtools middleware for Redux DevTools integration
  devtools(
    // Persist middleware for localStorage persistence
    persist(
      // Immer middleware for immutable updates
      immer((set, get) => ({
        // Counter state and actions
        count: 0,
        increment: () =>
          set((state) => {
            state.count += 1;
          }),
        decrement: () =>
          set((state) => {
            state.count -= 1;
          }),
        reset: () =>
          set((state) => {
            state.count = 0;
          }),

        // Todo state and actions
        todos: [],
        addTodo: (text: string) =>
          set((state) => {
            const newTodo: Todo = {
              id: crypto.randomUUID(),
              text: text.trim(),
              completed: false,
              createdAt: new Date()
            };
            state.todos.push(newTodo);
          }),
        removeTodo: (id: string) =>
          set((state) => {
            state.todos = state.todos.filter(todo => todo.id !== id);
          }),
        toggleTodo: (id: string) =>
          set((state) => {
            const todo = state.todos.find(t => t.id === id);
            if (todo) {
              todo.completed = !todo.completed;
            }
          }),
        clearCompleted: () =>
          set((state) => {
            state.todos = state.todos.filter(todo => !todo.completed);
          }),

        // User profile state and actions
        user: null,
        isLoadingUser: false,
        userError: null,
        fetchUser: async (userId: string) => {
          set((state) => {
            state.isLoadingUser = true;
            state.userError = null;
          });

          try {
            const user = await simulateUserFetch(userId);
            set((state) => {
              state.user = user;
              state.isLoadingUser = false;
            });
          } catch (error) {
            set((state) => {
              state.userError = error instanceof Error ? error.message : 'Unknown error';
              state.isLoadingUser = false;
            });
          }
        },
        updateUser: (updates: Partial<User>) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          }),
        logout: () =>
          set((state) => {
            state.user = null;
            state.userError = null;
          }),

        // App settings
        theme: 'light',
        language: 'en',
        setTheme: (theme: 'light' | 'dark') =>
          set((state) => {
            state.theme = theme;
          }),
        setLanguage: (language: string) =>
          set((state) => {
            state.language = language;
          })
      })),
      {
        name: 'app-store', // localStorage key
        storage: createJSONStorage(() => localStorage),
        // Only persist certain parts of the state
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          todos: state.todos, // Persist todos
          // Don't persist user session or loading states
        }),
        version: 1, // Version for migration support
      }
    ),
    {
      name: 'app-store', // DevTools name
    }
  )
);

// Selectors for optimized subscriptions
// These prevent unnecessary re-renders by allowing components to subscribe to specific slices

export const useCounter = () => useAppStore(state => ({
  count: state.count,
  increment: state.increment,
  decrement: state.decrement,
  reset: state.reset
}));

export const useTodos = () => useAppStore(state => ({
  todos: state.todos,
  addTodo: state.addTodo,
  removeTodo: state.removeTodo,
  toggleTodo: state.toggleTodo,
  clearCompleted: state.clearCompleted
}));

export const useUser = () => useAppStore(state => ({
  user: state.user,
  isLoadingUser: state.isLoadingUser,
  userError: state.userError,
  fetchUser: state.fetchUser,
  updateUser: state.updateUser,
  logout: state.logout
}));

export const useSettings = () => useAppStore(state => ({
  theme: state.theme,
  language: state.language,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage
}));

// Computed selectors
export const useCompletedTodos = () => useAppStore(state => 
  state.todos.filter(todo => todo.completed)
);

export const useActiveTodos = () => useAppStore(state => 
  state.todos.filter(todo => !todo.completed)
);

export const useTodoStats = () => useAppStore(state => ({
  total: state.todos.length,
  completed: state.todos.filter(todo => todo.completed).length,
  active: state.todos.filter(todo => !todo.completed).length
}));

// Example of a store slice for better organization
// This could be in a separate file for larger applications
interface NotificationState {
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
  }>;
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set) => ({
      notifications: [],
      addNotification: (message: string, type = 'info') =>
        set((state) => {
          state.notifications.push({
            id: crypto.randomUUID(),
            message,
            type,
            timestamp: new Date()
          });
          // Auto-remove after 5 seconds for non-error notifications
          if (type !== 'error') {
            setTimeout(() => {
              set((state) => {
                state.notifications = state.notifications.filter(n => 
                  n.timestamp.getTime() > Date.now() - 5000
                );
              });
            }, 5000);
          }
        }),
      removeNotification: (id: string) =>
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),
      clearAllNotifications: () =>
        set((state) => {
          state.notifications = [];
        })
    })),
    { name: 'notifications' }
  )
);

// Shopping cart store example with complex state
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discount: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  applyDiscount: (percentage: number) => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],
        isOpen: false,
        discount: 0,
        
        addItem: (product) =>
          set((state) => {
            const existingItem = state.items.find(item => item.id === product.id);
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              state.items.push({ ...product, quantity: 1 });
            }
          }),
        
        removeItem: (id) =>
          set((state) => {
            state.items = state.items.filter(item => item.id !== id);
          }),
        
        updateQuantity: (id, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              state.items = state.items.filter(item => item.id !== id);
            } else {
              const item = state.items.find(item => item.id === id);
              if (item) {
                item.quantity = quantity;
              }
            }
          }),
        
        clearCart: () =>
          set((state) => {
            state.items = [];
            state.discount = 0;
          }),
        
        toggleCart: () =>
          set((state) => {
            state.isOpen = !state.isOpen;
          }),
        
        applyDiscount: (percentage) =>
          set((state) => {
            state.discount = Math.max(0, Math.min(100, percentage));
          }),
        
        getSubtotal: () => {
          const { items } = get();
          return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        
        getTotal: () => {
          const { discount } = get();
          const subtotal = get().getSubtotal();
          return subtotal * (1 - discount / 100);
        },
        
        getItemCount: () => {
          const { items } = get();
          return items.reduce((sum, item) => sum + item.quantity, 0);
        },
      })),
      {
        name: 'shopping-cart',
        partialize: (state) => ({ items: state.items, discount: state.discount }),
      }
    ),
    { name: 'cart-store' }
  )
);