import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { 
  counterState, 
  appState, 
  derivedState, 
  cartState, 
  cartDerived, 
  formState, 
  formDerived, 
  persistentSettings 
} from '../stores/valtioStore';

const ValtioDemo: React.FC = () => {
  const counterSnap = useSnapshot(counterState);
  const appSnap = useSnapshot(appState);
  const derivedSnap = useSnapshot(derivedState);
  const cartSnap = useSnapshot(cartState);
  const cartDerivedSnap = useSnapshot(cartDerived);
  const formSnap = useSnapshot(formState);
  const formDerivedSnap = useSnapshot(formDerived);
  const settingsSnap = useSnapshot(persistentSettings);
  
  // Local state for form inputs
  const [newTodoText, setNewTodoText] = useState('');
  const [userIdInput, setUserIdInput] = useState('1');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      appState.addTodo(newTodoText);
      setNewTodoText('');
    }
  };

  const handleFetchUser = () => {
    appState.fetchUser(userIdInput);
  };

  const addRandomProduct = () => {
    cartState.addItem({
      id: crypto.randomUUID(),
      name: `Product ${Date.now()}`,
      price: Math.floor(Math.random() * 100) + 1
    });
  };

  const codeExamples = {
    basic: `// Basic proxy state
import { proxy } from 'valtio';

const counterState = proxy({
  count: 0,
  increment: () => {
    counterState.count++;
  },
  decrement: () => {
    counterState.count--;
  }
});

// In component
const snap = useSnapshot(counterState);
return <div>{snap.count}</div>;`,
    nested: `// Nested state updates
const appState = proxy({
  user: { name: '', email: '' },
  todos: [],
  
  updateUser(updates) {
    // Direct mutation works with proxies
    Object.assign(appState.user, updates);
  },
  
  addTodo(text) {
    appState.todos.push({
      id: crypto.randomUUID(),
      text,
      completed: false
    });
  }
});`,
    derived: `// Derived state with automatic updates
import { derive } from 'valtio/utils';

const derivedState = derive({
  todoStats: (get) => {
    const todos = get(appState).todos;
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length
    };
  }
});`,
    subscription: `// Subscriptions and side effects
import { subscribe, subscribeKey } from 'valtio/utils';

// Subscribe to entire state
subscribe(appState, () => {
  console.log('State changed');
});

// Subscribe to specific key
subscribeKey(appState, 'user', (user) => {
  console.log('User changed:', user);
});`
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Valtio Demo</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Valtio makes proxy-state simple for React and Vanilla. Mutate the wrapped state object 
          to update components and enjoy the mutable style of updating immutable state.
        </p>
      </header>

      {/* Features Overview */}
      <section className="card">
        <h2>Key Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔄 Proxy-based</h3>
            <p>Direct mutation of state objects with automatic immutability behind the scenes.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>📊 Derived State</h3>
            <p>Computed values that automatically update when dependencies change.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🎯 Mutable API</h3>
            <p>Write code that looks mutable but maintains immutability internally.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔧 DevTools Ready</h3>
            <p>Integration with Redux DevTools for debugging and time travel.</p>
          </div>
        </div>
      </section>

      {/* Basic Counter */}
      <section className="demo-section">
        <h2>1. Basic Proxy State</h2>
        <p>
          Simple state management with direct mutations. The proxy automatically 
          tracks changes and updates subscribed components.
        </p>
        
        <div className="counter-display">
          Count: {counterSnap.count}
        </div>
        
        <div className="demo-controls">
          <button onClick={counterState.increment}>Increment</button>
          <button onClick={counterState.decrement}>Decrement</button>
          <button onClick={counterState.reset}>Reset</button>
        </div>

        <div className="state-inspector">
          <h4>Current State</h4>
          <pre><code>{JSON.stringify(counterSnap, null, 2)}</code></pre>
        </div>
        
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Basic State Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.basic}</code></pre>
        </details>
      </section>

      {/* Complex Nested State */}
      <section className="demo-section">
        <h2>2. Complex Nested State</h2>
        <p>
          Advanced example with nested objects, arrays, and complex operations. 
          Direct mutations work seamlessly with deeply nested structures.
        </p>
        
        <div className="demo-controls">
          <select 
            value={appSnap.currentView}
            onChange={(e) => appState.setCurrentView(e.target.value as any)}
          >
            <option value="dashboard">Dashboard</option>
            <option value="todos">Todos</option>
            <option value="settings">Settings</option>
          </select>
          
          <button onClick={appState.toggleSidebar}>
            Sidebar: {appSnap.sidebarOpen ? 'Open' : 'Closed'}
          </button>
          
          <select
            value={appSnap.filter}
            onChange={(e) => appState.setFilter(e.target.value as any)}
          >
            <option value="all">All Todos</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="state-inspector">
          <h4>App State</h4>
          <div><strong>Current View:</strong> {appSnap.currentView}</div>
          <div><strong>Sidebar:</strong> {appSnap.sidebarOpen ? 'Open' : 'Closed'}</div>
          <div><strong>Filter:</strong> {appSnap.filter}</div>
          <div><strong>Settings:</strong></div>
          <pre style={{ fontSize: '0.9rem', marginLeft: '1rem' }}>
            <code>{JSON.stringify(appSnap.settings, null, 2)}</code>
          </pre>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Nested State Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.nested}</code></pre>
        </details>
      </section>

      {/* Todo List */}
      <section className="demo-section">
        <h2>3. Todo List with Mutations</h2>
        <p>
          Todo management using direct array mutations. Add, remove, and update todos 
          using familiar JavaScript array methods.
        </p>
        
        <form onSubmit={handleAddTodo} className="demo-controls">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new todo..."
            style={{ flex: 1, marginRight: '1rem' }}
          />
          <select
            onChange={(e) => {
              if (newTodoText.trim()) {
                appState.addTodo(newTodoText, e.target.value as any);
                setNewTodoText('');
              }
            }}
            defaultValue=""
            style={{ marginRight: '1rem' }}
          >
            <option value="" disabled>Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit">Add Todo</button>
        </form>

        <div className="state-inspector" style={{ margin: '1rem 0' }}>
          <h4>Todo Statistics (Derived)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            <div className="demo-output">
              <strong>Total:</strong> {derivedSnap.todoStats.total}
            </div>
            <div className="demo-output">
              <strong>Completed:</strong> {derivedSnap.todoStats.completed}
            </div>
            <div className="demo-output">
              <strong>Active:</strong> {derivedSnap.todoStats.active}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <strong>By Priority:</strong>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span>High: {derivedSnap.todoStats.byPriority.high}</span>
              <span>Medium: {derivedSnap.todoStats.byPriority.medium}</span>
              <span>Low: {derivedSnap.todoStats.byPriority.low}</span>
            </div>
          </div>
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(26, 93, 58, 0.2)', borderRadius: '4px', padding: '1rem' }}>
          {derivedSnap.filteredTodos.length === 0 ? (
            <p style={{ color: '#a8bdb2', fontStyle: 'italic' }}>
              No {appSnap.filter === 'all' ? '' : appSnap.filter} todos yet!
            </p>
          ) : (
            derivedSnap.filteredTodos.map(todo => (
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
                  onChange={() => appState.toggleTodo(todo.id)}
                />
                <span style={{ flex: 1 }}>{todo.text}</span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '3px',
                  background: todo.priority === 'high' ? '#ef4444' : 
                             todo.priority === 'medium' ? '#f59e0b' : '#10b981',
                  color: 'white'
                }}>
                  {todo.priority}
                </span>
                <small style={{ color: '#a8bdb2' }}>
                  {new Date(todo.createdAt).toLocaleDateString()}
                </small>
                <button 
                  onClick={() => appState.removeTodo(todo.id)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        
        {derivedSnap.todoStats.completed > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={appState.clearCompleted}>
              Clear Completed ({derivedSnap.todoStats.completed})
            </button>
          </div>
        )}
      </section>

      {/* Async User Fetching */}
      <section className="demo-section">
        <h2>4. Async Operations</h2>
        <p>
          Async operations in Valtio work by directly mutating state within async functions. 
          Loading states and error handling are managed explicitly.
        </p>
        
        <div className="demo-controls">
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="User ID (try 'error' for error state)"
            style={{ marginRight: '1rem' }}
          />
          <button onClick={handleFetchUser} disabled={appSnap.isLoadingUser}>
            {appSnap.isLoadingUser ? 'Loading...' : 'Fetch User'}
          </button>
          {appSnap.user && (
            <button onClick={appState.logout} style={{ marginLeft: '1rem' }}>
              Logout
            </button>
          )}
        </div>

        {appSnap.isLoadingUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div className="loading"></div>
            <span>Fetching user data...</span>
          </div>
        )}

        {appSnap.userError && (
          <div className="alert alert-error">
            <strong>Error:</strong> {appSnap.userError}
          </div>
        )}

        {appSnap.user && (
          <div className="state-inspector">
            <h4>User Data</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {appSnap.user.avatar && (
                <img src={appSnap.user.avatar} alt={appSnap.user.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              )}
              <div>
                <div><strong>{appSnap.user.name}</strong></div>
                <div style={{ color: '#a8bdb2' }}>{appSnap.user.email}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Preferences:</strong>
                  <div style={{ fontSize: '0.9rem', color: '#a8bdb2' }}>
                    Theme: {appSnap.user.preferences.theme}, 
                    Language: {appSnap.user.preferences.language}, 
                    Notifications: {appSnap.user.preferences.notifications ? 'On' : 'Off'}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <h5>Update User Preferences:</h5>
              <div className="demo-controls" style={{ marginTop: '0.5rem' }}>
                <label>
                  Theme:
                  <select 
                    value={appSnap.user.preferences.theme}
                    onChange={(e) => appState.updateUser({ 
                      preferences: { 
                        ...appSnap.user.preferences, 
                        theme: e.target.value as 'light' | 'dark' 
                      } 
                    })}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={appSnap.user.preferences.notifications}
                    onChange={(e) => appState.updateUser({
                      preferences: {
                        ...appSnap.user.preferences,
                        notifications: e.target.checked
                      }
                    })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Notifications
                </label>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Shopping Cart */}
      <section className="demo-section">
        <h2>5. Shopping Cart with Derived State</h2>
        <p>
          Complex shopping cart logic with automatic calculations. 
          Derived state updates automatically when the cart changes.
        </p>
        
        <div className="demo-controls">
          <button onClick={addRandomProduct}>Add Random Product</button>
          <button onClick={cartState.clear}>Clear Cart</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
          <div className="demo-output">
            <strong>Items:</strong> {cartDerivedSnap.itemCount}
          </div>
          <div className="demo-output">
            <strong>Total:</strong> ${cartDerivedSnap.total.toFixed(2)}
          </div>
          <div className="demo-output">
            <strong>Empty:</strong> {cartDerivedSnap.isEmpty ? 'Yes' : 'No'}
          </div>
        </div>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(26, 93, 58, 0.2)', borderRadius: '4px', padding: '1rem' }}>
          {cartSnap.items.length === 0 ? (
            <p style={{ color: '#a8bdb2', fontStyle: 'italic' }}>Cart is empty</p>
          ) : (
            cartSnap.items.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(26, 93, 58, 0.1)'
              }}>
                <span>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>${item.price}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => cartState.updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => cartState.updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => cartState.removeItem(item.id)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Form State Management */}
      <section className="demo-section">
        <h2>6. Form State with Validation</h2>
        <p>
          Complex form management with validation and error handling. 
          Form state updates trigger automatic validation.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={formSnap.fields.email.value}
              onChange={(e) => formState.updateField('email', e.target.value)}
              onBlur={() => formState.touchField('email')}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <small style={{ color: formSnap.fields.email.error ? '#ef4444' : '#a8bdb2' }}>
              {formSnap.fields.email.error || 'Enter your email'}
            </small>
          </div>
          
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={formSnap.fields.password.value}
              onChange={(e) => formState.updateField('password', e.target.value)}
              onBlur={() => formState.touchField('password')}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <small style={{ color: formSnap.fields.password.error ? '#ef4444' : '#a8bdb2' }}>
              {formSnap.fields.password.error || 'Min 8 characters'}
            </small>
          </div>
          
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={formSnap.fields.confirmPassword.value}
              onChange={(e) => formState.updateField('confirmPassword', e.target.value)}
              onBlur={() => formState.touchField('confirmPassword')}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <small style={{ color: formSnap.fields.confirmPassword.error ? '#ef4444' : '#a8bdb2' }}>
              {formSnap.fields.confirmPassword.error || 'Must match password'}
            </small>
          </div>
        </div>

        <div className="demo-controls" style={{ marginTop: '1rem' }}>
          <button onClick={formState.validateAll}>Validate All Fields</button>
          <button onClick={formState.reset}>Reset Form</button>
        </div>

        <div className="state-inspector" style={{ marginTop: '1rem' }}>
          <h4>Form State & Validation</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="demo-output">
              <strong>Valid:</strong> {formDerivedSnap.isValid ? 'Yes' : 'No'}
            </div>
            <div className="demo-output">
              <strong>Dirty:</strong> {formDerivedSnap.isDirty ? 'Yes' : 'No'}
            </div>
            <div className="demo-output">
              <strong>Touched Fields:</strong> {formDerivedSnap.touchedFields}
            </div>
          </div>
        </div>
      </section>

      {/* Persistent Settings */}
      <section className="demo-section">
        <h2>7. Persistent Settings</h2>
        <p>
          Settings that automatically persist to localStorage using subscriptions. 
          Changes are saved immediately and restored on page refresh.
        </p>
        
        <div className="demo-controls">
          <label>
            Theme:
            <select 
              value={settingsSnap.theme}
              onChange={(e) => persistentSettings.theme = e.target.value as 'light' | 'dark'}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          
          <label>
            Language:
            <select 
              value={settingsSnap.language}
              onChange={(e) => persistentSettings.language = e.target.value}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={settingsSnap.autoSave}
              onChange={(e) => persistentSettings.autoSave = e.target.checked}
              style={{ marginRight: '0.5rem' }}
            />
            Auto Save
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={settingsSnap.notifications}
              onChange={(e) => persistentSettings.notifications = e.target.checked}
              style={{ marginRight: '0.5rem' }}
            />
            Notifications
          </label>
        </div>

        <div className="state-inspector">
          <h4>Persistent Settings</h4>
          <pre><code>{JSON.stringify(settingsSnap, null, 2)}</code></pre>
          <p style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
            These settings are automatically saved to localStorage when changed.
          </p>
        </div>
      </section>

      {/* Derived State Examples */}
      <section className="demo-section">
        <h2>8. Derived State Patterns</h2>
        <p>
          Derived state automatically computes values based on other state. 
          Updates happen automatically when dependencies change.
        </p>
        
        <div className="state-inspector">
          <h4>Derived Values</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h5>User Display Name:</h5>
              <div className="demo-output">
                {derivedSnap.userDisplayName}
              </div>
              
              <h5>Current Theme:</h5>
              <div className="demo-output">
                {derivedSnap.currentTheme}
              </div>
            </div>
            
            <div>
              <h5>Sorted Todos (by priority & date):</h5>
              <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.9rem' }}>
                {derivedSnap.sortedTodos.slice(0, 5).map(todo => (
                  <div key={todo.id} style={{ padding: '0.25rem 0', borderBottom: '1px solid rgba(26, 93, 58, 0.1)' }}>
                    <span style={{ color: todo.priority === 'high' ? '#ef4444' : todo.priority === 'medium' ? '#f59e0b' : '#10b981' }}>
                      [{todo.priority}]
                    </span> {todo.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Derived State Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.derived}</code></pre>
        </details>
      </section>

      {/* DevTools & Debugging */}
      <section className="demo-section">
        <h2>9. DevTools Integration</h2>
        <p>
          Valtio integrates with Redux DevTools for debugging. All state changes 
          are tracked and can be inspected or time-traveled.
        </p>
        
        <div className="alert alert-info">
          <strong>Redux DevTools:</strong> Open browser DevTools and look for the Redux tab. 
          You'll see Valtio state stores with all mutations tracked.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h4>Available Features:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>State inspection</li>
              <li>Time travel debugging</li>
              <li>Action tracking</li>
              <li>State import/export</li>
            </ul>
          </div>
          <div>
            <h4>Store Names:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>App State</li>
              <li>Cart State</li>
              <li>Form State</li>
              <li>Settings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="card">
        <h2>Valtio Best Practices</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80' }}>State Organization</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Group related state in single proxy</li>
              <li>Keep actions close to state</li>
              <li>Use derived state for computations</li>
              <li>Separate concerns with multiple stores</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Performance</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Use snapshots in render methods</li>
              <li>Avoid creating functions in render</li>
              <li>Use subscriptions for side effects</li>
              <li>Leverage automatic proxy optimization</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Mutations</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Mutate state directly, not snapshots</li>
              <li>Use native JavaScript methods</li>
              <li>Async mutations work naturally</li>
              <li>Nested mutations are efficient</li>
            </ul>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Subscription Examples
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.subscription}</code></pre>
        </details>
      </section>

      {/* Summary */}
      <section className="card">
        <h2>Valtio Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80' }}>Pros</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Mutable-style API</li>
              <li>Automatic immutability</li>
              <li>Great TypeScript support</li>
              <li>Built-in derived state</li>
              <li>DevTools integration</li>
              <li>Small bundle size (~3.1KB)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#f59e0b' }}>Cons</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Proxy-based (IE11 incompatible)</li>
              <li>Less ecosystem than Redux</li>
              <li>Mutations can be confusing initially</li>
              <li>No built-in async patterns</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Best For</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Object-oriented state models</li>
              <li>Teams preferring mutable APIs</li>
              <li>Complex nested state</li>
              <li>Real-time applications</li>
              <li>Rapid prototyping</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValtioDemo;