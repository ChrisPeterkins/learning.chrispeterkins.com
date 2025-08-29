import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ============================================================================
// TYPES
// ============================================================================

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CounterState {
  value: number;
  history: number[];
  step: number;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  loading: boolean;
  error: string | null;
}

export interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  lastFetch: string | null;
}

export interface AppState {
  theme: 'light' | 'dark';
  language: string;
  sidebarOpen: boolean;
  notifications: {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
  }[];
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Simulate API call for user fetching
export const fetchUser = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('user/fetchUser', async (userId, { rejectWithValue }) => {
  try {
    // Simulate network delay
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
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

// Simulate API call for saving todos
export const saveTodos = createAsyncThunk<
  Todo[],
  Todo[],
  { rejectValue: string }
>('todos/saveTodos', async (todos, { rejectWithValue }) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate occasional failure
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
    
    console.log('Saved todos to server:', todos);
    return todos;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to save');
  }
});

// ============================================================================
// COUNTER SLICE
// ============================================================================

const initialCounterState: CounterState = {
  value: 0,
  history: [0],
  step: 1
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState: initialCounterState,
  reducers: {
    increment: (state) => {
      state.value += state.step;
      state.history.push(state.value);
    },
    decrement: (state) => {
      state.value -= state.step;
      state.history.push(state.value);
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.history.push(state.value);
    },
    reset: (state) => {
      state.value = 0;
      state.history = [0];
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = Math.max(1, action.payload);
    },
    undo: (state) => {
      if (state.history.length > 1) {
        state.history.pop();
        state.value = state.history[state.history.length - 1];
      }
    },
    clearHistory: (state) => {
      state.history = [state.value];
    }
  }
});

export const {
  increment,
  decrement,
  incrementByAmount,
  reset,
  setStep,
  undo,
  clearHistory
} = counterSlice.actions;

// ============================================================================
// TODO SLICE
// ============================================================================

const initialTodoState: TodoState = {
  todos: [],
  filter: 'all',
  loading: false,
  error: null
};

export const todoSlice = createSlice({
  name: 'todos',
  initialState: initialTodoState,
  reducers: {
    addTodo: (state, action: PayloadAction<{ text: string; priority?: Todo['priority'] }>) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: action.payload.text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        priority: action.payload.priority || 'medium'
      };
      state.todos.push(newTodo);
      state.error = null;
    },
    removeTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    updateTodo: (state, action: PayloadAction<{ id: string; updates: Partial<Todo> }>) => {
      const todo = state.todos.find(todo => todo.id === action.payload.id);
      if (todo) {
        Object.assign(todo, action.payload.updates);
      }
    },
    setFilter: (state, action: PayloadAction<TodoState['filter']>) => {
      state.filter = action.payload;
    },
    clearCompleted: (state) => {
      state.todos = state.todos.filter(todo => !todo.completed);
    },
    reorderTodos: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [reorderedItem] = state.todos.splice(fromIndex, 1);
      state.todos.splice(toIndex, 0, reorderedItem);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle saveTodos async thunk
      .addCase(saveTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTodos.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save todos';
      });
  }
});

export const {
  addTodo,
  removeTodo,
  toggleTodo,
  updateTodo,
  setFilter,
  clearCompleted,
  reorderTodos,
  clearError
} = todoSlice.actions;

// ============================================================================
// USER SLICE
// ============================================================================

const initialUserState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  lastFetch: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        Object.assign(state.currentUser, action.payload);
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      state.lastFetch = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUser async thunk
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
      });
  }
});

export const {
  updateUser,
  logout,
  clearError: clearUserError
} = userSlice.actions;

// ============================================================================
// APP SLICE (UI STATE)
// ============================================================================

const initialAppState: AppState = {
  theme: 'light',
  language: 'en',
  sidebarOpen: true,
  notifications: []
};

export const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
    }>) => {
      const notification = {
        id: crypto.randomUUID(),
        message: action.payload.message,
        type: action.payload.type || 'info' as const,
        timestamp: new Date().toISOString()
      };
      state.notifications.push(notification);
      
      // Limit to 10 notifications
      if (state.notifications.length > 10) {
        state.notifications.shift();
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearAllNotifications
} = appSlice.actions;

// ============================================================================
// RTK QUERY API
// ============================================================================

// Define API service for data fetching
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    // Add auth token to requests if available
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.currentUser?.id;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Todo', 'Post'],
  endpoints: (builder) => ({
    // Users endpoints
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      // Simulate the query since we don't have a real API
      queryFn: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          data: {
            id,
            name: `API User ${id}`,
            email: `apiuser${id}@example.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
          }
        };
      }
    }),
    
    updateUser: builder.mutation<User, { id: string; updates: Partial<User> }>({
      query: ({ id, updates }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
      // Simulate the mutation
      queryFn: async ({ id, updates }) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          data: {
            id,
            name: `Updated User ${id}`,
            email: `updated${id}@example.com`,
            ...updates
          }
        };
      }
    }),

    // Posts endpoints (example of additional data)
    getPosts: builder.query<Array<{
      id: string;
      title: string;
      content: string;
      authorId: string;
    }>, void>({
      query: () => 'posts',
      providesTags: ['Post'],
      // Simulate the query
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          data: [
            { id: '1', title: 'First Post', content: 'Content 1', authorId: '1' },
            { id: '2', title: 'Second Post', content: 'Content 2', authorId: '2' },
            { id: '3', title: 'Third Post', content: 'Content 3', authorId: '1' }
          ]
        };
      }
    }),

    // Todos endpoints
    getTodos: builder.query<Todo[], void>({
      query: () => 'todos',
      providesTags: ['Todo'],
      // Simulate the query
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
          data: [
            {
              id: '1',
              text: 'Learn Redux Toolkit',
              completed: false,
              createdAt: new Date().toISOString(),
              priority: 'high' as const
            },
            {
              id: '2',
              text: 'Build amazing apps',
              completed: true,
              createdAt: new Date().toISOString(),
              priority: 'medium' as const
            }
          ]
        };
      }
    }),

    addTodo: builder.mutation<Todo, { text: string; priority?: Todo['priority'] }>({
      query: (newTodo) => ({
        url: 'todos',
        method: 'POST',
        body: newTodo
      }),
      invalidatesTags: ['Todo'],
      // Simulate the mutation
      queryFn: async ({ text, priority = 'medium' }) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          data: {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority
          }
        };
      }
    })
  })
});

// Export hooks for usage in functional components
export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useGetPostsQuery,
  useGetTodosQuery,
  useAddTodoMutation
} = apiSlice;

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todoSlice.reducer,
    user: userSlice.reducer,
    app: appSlice.reducer,
    api: apiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types in serialization check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================================================
// TYPED HOOKS FOR COMPONENTS
// ============================================================================

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================================================
// SELECTORS
// ============================================================================

// Memoized selectors for performance
export const selectCounter = (state: RootState) => state.counter;
export const selectTodos = (state: RootState) => state.todos.todos;
export const selectTodoFilter = (state: RootState) => state.todos.filter;
export const selectUser = (state: RootState) => state.user.currentUser;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectNotifications = (state: RootState) => state.app.notifications;

// Complex selectors
export const selectFilteredTodos = (state: RootState) => {
  const todos = selectTodos(state);
  const filter = selectTodoFilter(state);
  
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};

export const selectTodoStats = (state: RootState) => {
  const todos = selectTodos(state);
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
};

export const selectIsAuthenticated = (state: RootState) => {
  return state.user.currentUser !== null;
};

// ============================================================================
// MIDDLEWARE EXAMPLES
// ============================================================================

// Custom middleware for logging actions
export const logger = (store: any) => (next: any) => (action: any) => {
  console.group(action.type);
  console.info('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// Custom middleware for auto-saving todos
export const autoSave = (store: any) => (next: any) => (action: any) => {
  let result = next(action);
  
  // Auto-save todos when they change
  if (action.type.startsWith('todos/')) {
    const state = store.getState();
    localStorage.setItem('redux-todos', JSON.stringify(state.todos.todos));
  }
  
  return result;
};

// ============================================================================
// THUNK EXAMPLES FOR COMPLEX ASYNC OPERATIONS
// ============================================================================

// Complex thunk that coordinates multiple actions
export const initializeApp = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>('app/initialize', async (_, { dispatch, getState }) => {
  try {
    // Load persisted theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    }

    // Load persisted todos
    const savedTodos = localStorage.getItem('redux-todos');
    if (savedTodos) {
      const todos = JSON.parse(savedTodos);
      // You'd need to add a loadTodos action to handle this
    }

    // Check for saved user session
    const savedUser = localStorage.getItem('user-session');
    if (savedUser) {
      const userId = JSON.parse(savedUser);
      await dispatch(fetchUser(userId));
    }

    dispatch(addNotification({ 
      message: 'App initialized successfully', 
      type: 'success' 
    }));
  } catch (error) {
    dispatch(addNotification({ 
      message: 'Failed to initialize app', 
      type: 'error' 
    }));
  }
});

// Batch operations thunk
export const bulkUpdateTodos = createAsyncThunk<
  void,
  Array<{ id: string; updates: Partial<Todo> }>,
  { dispatch: AppDispatch }
>('todos/bulkUpdate', async (updates, { dispatch }) => {
  // Dispatch multiple update actions
  updates.forEach(({ id, updates }) => {
    dispatch(updateTodo({ id, updates }));
  });
  
  dispatch(addNotification({
    message: `Updated ${updates.length} todos`,
    type: 'success'
  }));
});

// ============================================================================
// EXPORT DEFAULT STORE
// ============================================================================

export default store;