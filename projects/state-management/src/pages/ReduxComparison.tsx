import React, { useState } from 'react';
import { useAppSelector, useAppDispatch, increment, decrement, addTodo, fetchUser, useGetUserQuery } from '../stores/reduxStore';

const ReduxComparison: React.FC = () => {
  const [newTodo, setNewTodo] = useState('');
  const [userId, setUserId] = useState('1');
  const [enabledQuery, setEnabledQuery] = useState(false);
  
  // Redux selectors
  const dispatch = useAppDispatch();
  const counter = useAppSelector(state => state.counter);
  const todos = useAppSelector(state => state.todos);
  const user = useAppSelector(state => state.user);
  const theme = useAppSelector(state => state.app.theme);
  const notifications = useAppSelector(state => state.app.notifications);
  
  // RTK Query
  const { data: rtkUser, error, isLoading } = useGetUserQuery(userId, {
    skip: !enabledQuery
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      dispatch(addTodo({ text: newTodo, priority: 'medium' }));
      setNewTodo('');
    }
  };

  const handleFetchUser = () => {
    dispatch(fetchUser(userId));
  };

  const codeExamples = {
    reduxCounter: `// Redux Toolkit Counter
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer makes this safe
    },
    decrement: (state) => {
      state.value -= 1;
    }
  }
});

// Component
const { value } = useAppSelector(state => state.counter);
const dispatch = useAppDispatch();

<button onClick={() => dispatch(increment())}>
  Count: {value}
</button>`,
    zustandCounter: `// Zustand Counter
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 }))
}));

// Component  
const { count, increment } = useCounterStore();

<button onClick={increment}>
  Count: {count}
</button>`,
    jotaiCounter: `// Jotai Counter
const counterAtom = atom(0);

// Component
const [count, setCount] = useAtom(counterAtom);

<button onClick={() => setCount(c => c + 1)}>
  Count: {count}
</button>`,
    valtioCounter: `// Valtio Counter
const counterState = proxy({
  count: 0,
  increment: () => { counterState.count++ }
});

// Component
const snap = useSnapshot(counterState);

<button onClick={counterState.increment}>
  Count: {snap.count}
</button>`,
    reduxAsync: `// Redux Toolkit Async
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.getUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});`,
    zustandAsync: `// Zustand Async
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const user = await api.getUser(userId);
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));`,
    rtkQuery: `// RTK Query
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => \`users/\${id}\`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),
    updateUser: builder.mutation<User, Partial<User>>({
      query: ({ id, ...patch }) => ({
        url: \`users/\${id}\`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    })
  })
});

// Auto-generated hooks
export const { useGetUserQuery, useUpdateUserMutation } = apiSlice;

// Component usage
const { data: user, error, isLoading } = useGetUserQuery(userId);`,
    migration: `// Migration Strategy: Redux to Zustand

// 1. Start with a single store
const useAppStore = create((set, get) => ({
  // Copy existing Redux state structure
  counter: { value: 0 },
  todos: { items: [], filter: 'all' },
  user: { current: null, loading: false },
  
  // Convert Redux actions to methods
  incrementCounter: () => set(state => ({
    counter: { value: state.counter.value + 1 }
  })),
  
  addTodo: (text) => set(state => ({
    todos: {
      ...state.todos,
      items: [...state.todos.items, {
        id: Date.now(),
        text,
        completed: false
      }]
    }
  }))
}));

// 2. Gradually split into domain stores
const useCounterStore = create(/* counter logic */);
const useTodoStore = create(/* todo logic */);
const useUserStore = create(/* user logic */);

// 3. Update components one by one
// Before (Redux)
const count = useAppSelector(state => state.counter.value);
const dispatch = useAppDispatch();

// After (Zustand)
const { count, increment } = useCounterStore();`
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Redux vs Modern Alternatives</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Compare Redux Toolkit with modern state management solutions. Understand when to use Redux, 
          how to migrate to alternatives, and what each approach offers for different use cases.
        </p>
      </header>

      {/* When to Use Redux */}
      <section className="card">
        <h2>When to Choose Redux</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>✅ Great Fit</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#4ade80' }}>
              <li>Large, complex applications</li>
              <li>Time travel debugging needs</li>
              <li>Strict data flow requirements</li>
              <li>Large teams needing structure</li>
              <li>Existing Redux ecosystem tools</li>
              <li>Server-side rendering apps</li>
            </ul>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>❌ Consider Alternatives</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#f59e0b' }}>
              <li>Small to medium apps</li>
              <li>Rapid prototyping</li>
              <li>Simple state requirements</li>
              <li>Bundle size is critical</li>
              <li>Team prefers simpler APIs</li>
              <li>Mostly local component state</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Redux Decision Framework</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <strong>App Complexity:</strong>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
                <li>10+ routes: Consider Redux</li>
                <li>Multiple data sources: Redux beneficial</li>
                <li>Complex async flows: Redux Toolkit + RTK Query</li>
                <li>Real-time updates: Consider alternatives</li>
              </ul>
            </div>
            <div>
              <strong>Team & Project:</strong>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
                <li>Large team: Redux provides structure</li>
                <li>Long-term project: Redux ecosystem helps</li>
                <li>Existing Redux knowledge: Leverage it</li>
                <li>Quick delivery: Consider simpler options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Code Comparison */}
      <section className="card">
        <h2>Code Comparison: Counter Example</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h3>Redux Toolkit</h3>
            <pre style={{ fontSize: '0.8rem', height: '300px', overflowY: 'auto' }}>
              <code>{codeExamples.reduxCounter}</code>
            </pre>
            <div style={{ marginTop: '1rem' }}>
              <strong>Lines of code:</strong> ~25<br/>
              <strong>Files needed:</strong> 2-3<br/>
              <strong>Boilerplate:</strong> Medium
            </div>
          </div>
          <div>
            <h3>Zustand</h3>
            <pre style={{ fontSize: '0.8rem', height: '300px', overflowY: 'auto' }}>
              <code>{codeExamples.zustandCounter}</code>
            </pre>
            <div style={{ marginTop: '1rem' }}>
              <strong>Lines of code:</strong> ~10<br/>
              <strong>Files needed:</strong> 1<br/>
              <strong>Boilerplate:</strong> Minimal
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="demo-section">
        <h2>Live Redux Toolkit Demo</h2>
        <p>
          Experience Redux Toolkit in action with the same patterns you've seen in other demos. 
          Compare the developer experience with the alternatives.
        </p>
        
        {/* Counter Demo */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Counter with History</h3>
          <div className="counter-display">
            Value: {counter.value}
          </div>
          <div className="demo-controls">
            <button onClick={() => dispatch(increment())}>Increment</button>
            <button onClick={() => dispatch(decrement())}>Decrement</button>
          </div>
          <div className="demo-output" style={{ marginTop: '1rem' }}>
            <strong>History:</strong> [{counter.history.join(', ')}]
          </div>
        </div>

        {/* Todo Demo */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Todo Management</h3>
          <form onSubmit={handleAddTodo} className="demo-controls">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a Redux todo..."
              style={{ flex: 1, marginRight: '1rem' }}
            />
            <button type="submit">Add Todo</button>
          </form>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
            <div className="demo-output">
              <strong>Total:</strong> {todos.todos.length}
            </div>
            <div className="demo-output">
              <strong>Loading:</strong> {todos.loading ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Async Demo */}
        <div>
          <h3>Async User Fetching</h3>
          <div className="demo-controls">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
              style={{ marginRight: '1rem' }}
            />
            <button onClick={handleFetchUser} disabled={user.loading}>
              {user.loading ? 'Loading...' : 'Fetch User (Thunk)'}
            </button>
          </div>

          {user.error && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              <strong>Error:</strong> {user.error}
            </div>
          )}

          {user.currentUser && (
            <div className="state-inspector" style={{ marginTop: '1rem' }}>
              <h4>User from Redux Thunk</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user.currentUser.avatar && (
                  <img 
                    src={user.currentUser.avatar} 
                    alt={user.currentUser.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
                  />
                )}
                <div>
                  <div><strong>{user.currentUser.name}</strong></div>
                  <div style={{ color: '#a8bdb2' }}>{user.currentUser.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RTK Query Demo */}
      <section className="demo-section">
        <h2>RTK Query vs Manual Data Fetching</h2>
        <p>
          RTK Query provides powerful data fetching and caching capabilities. 
          Compare it with manual async operations.
        </p>
        
        <div className="demo-controls">
          <label>
            <input
              type="checkbox"
              checked={enabledQuery}
              onChange={(e) => setEnabledQuery(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Enable RTK Query
          </label>
          
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID for RTK Query"
            style={{ marginLeft: '1rem', marginRight: '1rem' }}
          />
        </div>

        {enabledQuery && (
          <div style={{ marginTop: '1rem' }}>
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="loading"></div>
                <span>Loading with RTK Query...</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-error">
                <strong>RTK Query Error:</strong> {error.toString()}
              </div>
            )}
            
            {rtkUser && (
              <div className="state-inspector">
                <h4>User from RTK Query</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {rtkUser.avatar && (
                    <img 
                      src={rtkUser.avatar} 
                      alt={rtkUser.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
                    />
                  )}
                  <div>
                    <div><strong>{rtkUser.name}</strong></div>
                    <div style={{ color: '#a8bdb2' }}>{rtkUser.email}</div>
                    <div style={{ fontSize: '0.9rem', color: '#4ade80', marginTop: '0.5rem' }}>
                      ✓ Automatically cached • ✓ Background refetching
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View RTK Query Setup
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.rtkQuery}</code></pre>
        </details>
      </section>

      {/* Async Comparison */}
      <section className="card">
        <h2>Async Operations Comparison</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h3>Redux Toolkit (createAsyncThunk)</h3>
            <pre style={{ fontSize: '0.75rem', height: '400px', overflowY: 'auto' }}>
              <code>{codeExamples.reduxAsync}</code>
            </pre>
          </div>
          <div>
            <h3>Zustand (Manual Async)</h3>
            <pre style={{ fontSize: '0.75rem', height: '400px', overflowY: 'auto' }}>
              <code>{codeExamples.zustandAsync}</code>
            </pre>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Comparison</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Redux Toolkit</th>
                <th>Zustand</th>
                <th>Jotai</th>
                <th>Valtio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Async Setup</strong></td>
                <td>createAsyncThunk + extraReducers</td>
                <td>Manual async functions</td>
                <td>Async atoms (built-in)</td>
                <td>Direct mutations in async</td>
              </tr>
              <tr>
                <td><strong>Loading States</strong></td>
                <td>Automatic (pending/fulfilled/rejected)</td>
                <td>Manual state management</td>
                <td>Suspense + loadable atoms</td>
                <td>Manual state management</td>
              </tr>
              <tr>
                <td><strong>Error Handling</strong></td>
                <td>Built-in with rejected cases</td>
                <td>Try/catch blocks</td>
                <td>Error boundaries + loadable</td>
                <td>Try/catch blocks</td>
              </tr>
              <tr>
                <td><strong>Caching</strong></td>
                <td>RTK Query (advanced)</td>
                <td>Manual implementation</td>
                <td>Built-in with atoms</td>
                <td>Manual implementation</td>
              </tr>
              <tr>
                <td><strong>Optimistic Updates</strong></td>
                <td>RTK Query mutations</td>
                <td>Manual state updates</td>
                <td>Temporary atom updates</td>
                <td>Direct state mutations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Migration Guide */}
      <section className="card">
        <h2>Migration Strategies</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Gradual Migration Approach</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4>1. Assess Current State</h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
                <li>Map Redux slices and actions</li>
                <li>Identify async operations</li>
                <li>Note component dependencies</li>
                <li>Measure current bundle size</li>
              </ul>
            </div>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4>2. Choose Target Library</h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
                <li>Zustand: Similar to Redux</li>
                <li>Jotai: Atomic approach</li>
                <li>Valtio: Mutable style</li>
                <li>Context: For simple cases</li>
              </ul>
            </div>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4>3. Migration Strategy</h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
                <li>Start with isolated features</li>
                <li>Migrate domain by domain</li>
                <li>Keep both systems running</li>
                <li>Update components gradually</li>
              </ul>
            </div>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4>4. Testing & Validation</h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
                <li>Compare bundle sizes</li>
                <li>Measure performance impact</li>
                <li>Validate functionality</li>
                <li>Remove Redux dependencies</li>
              </ul>
            </div>
          </div>
        </div>

        <details>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Migration Code Example
          </summary>
          <pre style={{ fontSize: '0.8rem' }}><code>{codeExamples.migration}</code></pre>
        </details>
      </section>

      {/* Bundle Size Comparison */}
      <section className="card">
        <h2>Bundle Size Impact</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Library</th>
                <th>Core Size</th>
                <th>With DevTools</th>
                <th>With Persistence</th>
                <th>Full Setup</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Redux Toolkit</strong></td>
                <td>12.1 KB</td>
                <td>12.1 KB</td>
                <td>+4.2 KB (redux-persist)</td>
                <td>~16.3 KB</td>
              </tr>
              <tr>
                <td><strong>Zustand</strong></td>
                <td>2.7 KB</td>
                <td>2.7 KB</td>
                <td>2.7 KB (built-in)</td>
                <td>~2.7 KB</td>
              </tr>
              <tr>
                <td><strong>Jotai</strong></td>
                <td>2.4 KB</td>
                <td>2.4 KB</td>
                <td>+0.3 KB (utils)</td>
                <td>~2.7 KB</td>
              </tr>
              <tr>
                <td><strong>Valtio</strong></td>
                <td>3.1 KB</td>
                <td>3.1 KB</td>
                <td>3.1 KB (built-in)</td>
                <td>~3.1 KB</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Bundle Size Considerations</h4>
          <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
            <li><strong>Redux Toolkit:</strong> Larger but includes powerful features like RTK Query</li>
            <li><strong>Modern Alternatives:</strong> 4-5x smaller but may need additional libraries</li>
            <li><strong>Tree Shaking:</strong> All libraries support tree shaking for unused features</li>
            <li><strong>Runtime Performance:</strong> Bundle size ≠ runtime performance</li>
          </ul>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="card">
        <h2>Feature Comparison Matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Redux Toolkit</th>
                <th>RTK Query</th>
                <th>Zustand</th>
                <th>Jotai</th>
                <th>Valtio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Learning Curve</strong></td>
                <td>High</td>
                <td>Medium-High</td>
                <td>Low</td>
                <td>Medium</td>
                <td>Low</td>
              </tr>
              <tr>
                <td><strong>Boilerplate</strong></td>
                <td>Medium</td>
                <td>Low</td>
                <td>Minimal</td>
                <td>Minimal</td>
                <td>Minimal</td>
              </tr>
              <tr>
                <td><strong>DevTools</strong></td>
                <td>Excellent</td>
                <td>Excellent</td>
                <td>Good</td>
                <td>React DevTools</td>
                <td>Good</td>
              </tr>
              <tr>
                <td><strong>Time Travel</strong></td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>No</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td><strong>Async Handling</strong></td>
                <td>createAsyncThunk</td>
                <td>Built-in</td>
                <td>Manual</td>
                <td>Built-in</td>
                <td>Manual</td>
              </tr>
              <tr>
                <td><strong>Caching</strong></td>
                <td>Manual</td>
                <td>Automatic</td>
                <td>Manual</td>
                <td>Built-in</td>
                <td>Manual</td>
              </tr>
              <tr>
                <td><strong>Code Splitting</strong></td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td><strong>SSR Support</strong></td>
                <td>Excellent</td>
                <td>Good</td>
                <td>Good</td>
                <td>Excellent</td>
                <td>Good</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Decision Matrix */}
      <section className="card">
        <h2>Decision Matrix</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>Choose Redux Toolkit When:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Building large, complex applications</li>
              <li>Need predictable state updates</li>
              <li>Team familiar with Redux patterns</li>
              <li>Require extensive debugging tools</li>
              <li>Need RTK Query for data fetching</li>
              <li>Working with legacy Redux code</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>Choose Zustand When:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Want Redux-like patterns with less boilerplate</li>
              <li>Need middleware support</li>
              <li>Bundle size matters</li>
              <li>Team wants familiar React patterns</li>
              <li>Building medium complexity apps</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>Choose Jotai When:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Need fine-grained reactivity</li>
              <li>Building forms or interactive UIs</li>
              <li>Want automatic dependency tracking</li>
              <li>Using React Suspense heavily</li>
              <li>Prefer atomic composition</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>Choose Valtio When:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Team prefers mutable-style APIs</li>
              <li>Working with complex nested objects</li>
              <li>Need automatic immutability</li>
              <li>Building object-oriented applications</li>
              <li>Rapid prototyping</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="card">
        <h2>Summary & Recommendations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3>Redux Toolkit is Still Great For:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#4ade80' }}>
              <li>Enterprise applications with complex requirements</li>
              <li>Teams that value predictability over simplicity</li>
              <li>Apps needing comprehensive debugging tools</li>
              <li>Projects with existing Redux investments</li>
              <li>Cases where RTK Query provides significant value</li>
            </ul>
          </div>
          
          <div>
            <h3>Modern Alternatives Excel At:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#4ade80' }}>
              <li>Faster development with less boilerplate</li>
              <li>Smaller bundle sizes and better performance</li>
              <li>More intuitive APIs for most developers</li>
              <li>Easier testing and component isolation</li>
              <li>Better TypeScript integration</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Final Recommendation</h4>
          <p style={{ color: '#a8bdb2', marginBottom: '1rem' }}>
            <strong>For new projects:</strong> Start with Zustand, Jotai, or Valtio based on your team's preferences and app requirements. 
            They offer better developer experience and smaller bundle sizes for most use cases.
          </p>
          <p style={{ color: '#a8bdb2', marginBottom: '1rem' }}>
            <strong>For existing Redux apps:</strong> Redux Toolkit is still excellent. Consider migration only if you're 
            experiencing developer productivity issues or have specific performance requirements.
          </p>
          <p style={{ color: '#a8bdb2' }}>
            <strong>For complex data fetching:</strong> RTK Query remains one of the best solutions available, 
            regardless of your state management choice.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ReduxComparison;