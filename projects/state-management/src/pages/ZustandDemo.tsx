import React, { useState } from 'react';
import { useCounter, useTodos, useUser, useSettings, useTodoStats, useNotificationStore } from '../stores/zustandStore';

const ZustandDemo: React.FC = () => {
  const [newTodo, setNewTodo] = useState('');
  const [userId, setUserId] = useState('1');
  
  // Zustand hooks
  const { count, increment, decrement, reset } = useCounter();
  const { todos, addTodo, removeTodo, toggleTodo, clearCompleted } = useTodos();
  const { user, isLoadingUser, userError, fetchUser, updateUser, logout } = useUser();
  const { theme, language, setTheme, setLanguage } = useSettings();
  const todoStats = useTodoStats();
  const { notifications, addNotification, removeNotification } = useNotificationStore();

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
      addNotification('Todo added successfully!', 'success');
    }
  };

  const handleFetchUser = () => {
    fetchUser(userId);
  };

  const codeExamples = {
    store: `// zustandStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        count: 0,
        increment: () => set((state) => { state.count += 1 }),
        decrement: () => set((state) => { state.count -= 1 }),
        reset: () => set((state) => { state.count = 0 })
      })),
      { name: 'app-store' }
    ),
    { name: 'app-store' }
  )
);`,
    usage: `// Component usage
import { useCounter } from '../stores/zustandStore';

function Counter() {
  const { count, increment, decrement, reset } = useCounter();
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`,
    async: `// Async actions in Zustand
interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  fetchUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await api.fetchUser(userId);
      set({ user, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  }
}));`
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Zustand Demo</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Zustand provides a small, fast, and scalable bearbones state-management solution. 
          It has a minimal API based on hooks and doesn't require boilerplate or opinionated patterns.
        </p>
      </header>

      {/* Features Overview */}
      <section className="card">
        <h2>Key Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🐻 Simple API</h3>
            <p>Hook-based API with minimal boilerplate. No providers or reducers needed.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔧 Middleware Support</h3>
            <p>Built-in middleware for persistence, DevTools, and Immer integration.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>⚡ Performance</h3>
            <p>Selective subscriptions prevent unnecessary re-renders out of the box.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🏗️ TypeScript First</h3>
            <p>Full TypeScript support with excellent type inference and safety.</p>
          </div>
        </div>
      </section>

      {/* Counter Demo */}
      <section className="demo-section">
        <h2>1. Counter with Selectors</h2>
        <p>
          Demonstrates basic state management with selective subscriptions. 
          The counter uses Immer middleware for immutable updates and persistence middleware for localStorage.
        </p>
        
        <div className="demo-controls">
          <button onClick={increment}>Increment</button>
          <button onClick={decrement}>Decrement</button>
          <button onClick={reset}>Reset</button>
        </div>
        
        <div className="counter-display">
          Count: {count}
        </div>

        <div className="state-inspector">
          <h4>Current State</h4>
          <pre><code>{JSON.stringify({ count }, null, 2)}</code></pre>
        </div>
        
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Store Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.store}</code></pre>
        </details>
      </section>

      {/* Todo List Demo */}
      <section className="demo-section">
        <h2>2. Todo List with Immer</h2>
        <p>
          Advanced example using Immer middleware for mutable-style updates. 
          Includes computed selectors for statistics and complex state operations.
        </p>
        
        <form onSubmit={handleAddTodo} className="demo-controls">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            style={{ flex: 1, marginRight: '1rem' }}
          />
          <button type="submit">Add Todo</button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
          <div className="demo-output">
            <strong>Total:</strong> {todoStats.total}
          </div>
          <div className="demo-output">
            <strong>Active:</strong> {todoStats.active}
          </div>
          <div className="demo-output">
            <strong>Completed:</strong> {todoStats.completed}
          </div>
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(26, 93, 58, 0.2)', borderRadius: '4px', padding: '1rem' }}>
          {todos.length === 0 ? (
            <p style={{ color: '#a8bdb2', fontStyle: 'italic' }}>No todos yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.5rem', 
                borderBottom: '1px solid rgba(26, 93, 58, 0.1)',
                textDecoration: todo.completed ? 'line-through' : 'none',
                opacity: todo.completed ? 0.6 : 1
              }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span style={{ flex: 1 }}>{todo.text}</span>
                <small style={{ color: '#a8bdb2' }}>
                  {new Date(todo.createdAt).toLocaleDateString()}
                </small>
                <button 
                  onClick={() => removeTodo(todo.id)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        
        {todoStats.completed > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={clearCompleted}>
              Clear Completed ({todoStats.completed})
            </button>
          </div>
        )}

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Todo State Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{`// Todo slice with Immer middleware
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
toggleTodo: (id: string) =>
  set((state) => {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }),`}</code></pre>
        </details>
      </section>

      {/* Async Data Fetching */}
      <section className="demo-section">
        <h2>3. Async Data Fetching</h2>
        <p>
          Demonstrates how to handle async operations in Zustand with loading states, 
          error handling, and optimistic updates.
        </p>
        
        <div className="demo-controls">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID (try 'error' for error state)"
            style={{ marginRight: '1rem' }}
          />
          <button onClick={handleFetchUser} disabled={isLoadingUser}>
            {isLoadingUser ? 'Loading...' : 'Fetch User'}
          </button>
          {user && (
            <button onClick={logout} style={{ marginLeft: '1rem' }}>
              Logout
            </button>
          )}
        </div>

        {isLoadingUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div className="loading"></div>
            <span>Fetching user data...</span>
          </div>
        )}

        {userError && (
          <div className="alert alert-error">
            <strong>Error:</strong> {userError}
          </div>
        )}

        {user && (
          <div className="state-inspector">
            <h4>User Data</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {user.avatar && (
                <img src={user.avatar} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              )}
              <div>
                <div><strong>{user.name}</strong></div>
                <div style={{ color: '#a8bdb2' }}>{user.email}</div>
                <div style={{ color: '#a8bdb2', fontSize: '0.9rem' }}>ID: {user.id}</div>
              </div>
            </div>
            <details>
              <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '0.5rem' }}>
                View Raw Data
              </summary>
              <pre><code>{JSON.stringify(user, null, 2)}</code></pre>
            </details>
          </div>
        )}

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Async Action Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.async}</code></pre>
        </details>
      </section>

      {/* Settings & Persistence */}
      <section className="demo-section">
        <h2>4. Persistent Settings</h2>
        <p>
          Settings are automatically persisted to localStorage using the persist middleware. 
          Changes are immediately saved and restored on page refresh.
        </p>
        
        <div className="demo-controls">
          <label>
            Theme:
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          
          <label>
            Language:
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </label>
        </div>

        <div className="state-inspector">
          <h4>Current Settings</h4>
          <pre><code>{JSON.stringify({ theme, language }, null, 2)}</code></pre>
          <p style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
            These settings are persisted to localStorage and will be restored on page refresh.
          </p>
        </div>
      </section>

      {/* Notifications Store */}
      <section className="demo-section">
        <h2>5. Separate Notification Store</h2>
        <p>
          Demonstrates using multiple Zustand stores. The notification store is separate 
          from the main app store and manages transient UI state.
        </p>
        
        <div className="demo-controls">
          <button onClick={() => addNotification('Info notification', 'info')}>
            Add Info
          </button>
          <button onClick={() => addNotification('Success notification', 'success')}>
            Add Success
          </button>
          <button onClick={() => addNotification('Warning notification', 'warning')}>
            Add Warning
          </button>
          <button onClick={() => addNotification('Error notification', 'error')}>
            Add Error
          </button>
        </div>

        {notifications.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Notifications ({notifications.length})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {notifications.map(notification => (
                <div key={notification.id} className={`alert alert-${notification.type}`} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  margin: '0.5rem 0' 
                }}>
                  <span>{notification.message}</span>
                  <button 
                    onClick={() => removeNotification(notification.id)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* DevTools Integration */}
      <section className="demo-section">
        <h2>6. DevTools Integration</h2>
        <p>
          Zustand integrates seamlessly with Redux DevTools for debugging. 
          All state changes are tracked and can be time-traveled.
        </p>
        
        <div className="alert alert-info">
          <strong>Redux DevTools:</strong> Open the browser's DevTools and look for the Redux tab. 
          You'll see all Zustand stores listed there with their state changes.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h4>Features Available:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Time travel debugging</li>
              <li>State inspection</li>
              <li>Action history</li>
              <li>State import/export</li>
            </ul>
          </div>
          <div>
            <h4>Store Names:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>app-store (main state)</li>
              <li>notifications (notifications)</li>
            </ul>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View DevTools Setup
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{`// DevTools integration
import { devtools } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  devtools(
    // your store implementation
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'app-store', // Name in DevTools
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);`}</code></pre>
        </details>
      </section>

      {/* Usage Examples */}
      <section className="card">
        <h2>Usage Patterns</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Basic Store</h3>
            <pre style={{ fontSize: '0.8rem' }}><code>{codeExamples.usage}</code></pre>
          </div>
          <div>
            <h3>With Middleware</h3>
            <pre style={{ fontSize: '0.8rem' }}><code>{`const useStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        // state and actions
      })),
      { name: 'my-store' }
    )
  )
);`}</code></pre>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Best Practices</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <h4 style={{ color: '#4ade80' }}>Store Organization</h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
                <li>Use selectors to prevent re-renders</li>
                <li>Separate stores by domain</li>
                <li>Keep actions close to state</li>
                <li>Use TypeScript interfaces</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#4ade80' }}>Performance</h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
                <li>Subscribe to minimal state slices</li>
                <li>Use shallow comparison for objects</li>
                <li>Avoid creating objects in render</li>
                <li>Leverage middleware for cross-cutting concerns</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="card">
        <h2>Zustand Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80' }}>Pros</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Minimal boilerplate</li>
              <li>Great TypeScript support</li>
              <li>Flexible middleware system</li>
              <li>No providers needed</li>
              <li>Small bundle size (~2.7KB)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#f59e0b' }}>Cons</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Manual async handling</li>
              <li>No built-in time travel without DevTools</li>
              <li>Less opinionated structure</li>
              <li>Requires discipline for large apps</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Best For</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Small to medium applications</li>
              <li>Teams wanting flexibility</li>
              <li>React-only projects</li>
              <li>Performance-critical apps</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZustandDemo;