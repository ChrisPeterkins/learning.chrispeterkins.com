import React, { Suspense, useState } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { 
  counterAtom, 
  textAtom,
  themeAtom,
  languageAtom,
  doubleCountAtom,
  formattedTextAtom,
  counterControlsAtom,
  todosAtom,
  todoActionsAtom,
  todoStatsAtom,
  completedTodosAtom,
  activeTodosAtom,
  userIdAtom,
  userLoadableAtom,
  counterFamilyAtom,
  formFieldAtom,
  cartAtoms,
  apiCacheAtom,
  counterWithHistoryAtom,
  settingsAtoms
} from '../stores/jotaiStore';

const JotaiDemo: React.FC = () => {
  // Basic atoms
  const [count, setCount] = useAtom(counterAtom);
  const [text, setText] = useAtom(textAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  
  // Derived atoms
  const doubleCount = useAtomValue(doubleCountAtom);
  const formattedText = useAtomValue(formattedTextAtom);
  
  // Write-only atom for counter controls
  const dispatchCounter = useSetAtom(counterControlsAtom);
  
  // Todo atoms
  const [todos] = useAtom(todosAtom);
  const dispatchTodo = useSetAtom(todoActionsAtom);
  const todoStats = useAtomValue(todoStatsAtom);
  const completedTodos = useAtomValue(completedTodosAtom);
  const activeTodos = useAtomValue(activeTodosAtom);
  
  // Async atoms
  const [userId, setUserId] = useAtom(userIdAtom);
  const userLoadable = useAtomValue(userLoadableAtom);
  
  // Atom families
  const [counter1] = useAtom(counterFamilyAtom('counter1'));
  const [, setCounter1] = useAtom(counterFamilyAtom('counter1'));
  const [counter2] = useAtom(counterFamilyAtom('counter2'));
  const [, setCounter2] = useAtom(counterFamilyAtom('counter2'));
  
  // Form atoms
  const [emailField, setEmailField] = useAtom(formFieldAtom('email'));
  const [passwordField, setPasswordField] = useAtom(formFieldAtom('password'));
  
  // Shopping cart atoms
  const [cart] = useAtom(cartAtoms.cart);
  const cartTotal = useAtomValue(cartAtoms.total);
  const cartItemCount = useAtomValue(cartAtoms.itemCount);
  const dispatchCartAction = useSetAtom(cartAtoms.actions);
  
  // Reducer-style atom
  const [counterWithHistory, dispatchCounterWithHistory] = useAtom(counterWithHistoryAtom);
  
  // Settings atoms
  const [settings] = useAtom(settingsAtoms.settings);
  const [, setValidatedSettings] = useAtom(settingsAtoms.validatedSettings);
  
  // Local state for demos
  const [newTodoText, setNewTodoText] = useState('');
  const [userIdInput, setUserIdInput] = useState('1');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      dispatchTodo({ type: 'add', text: newTodoText });
      setNewTodoText('');
    }
  };

  const handleFetchUser = () => {
    setUserId(userIdInput);
  };

  const addToCart = () => {
    dispatchCartAction({
      type: 'add',
      item: {
        id: crypto.randomUUID(),
        name: `Item ${Date.now()}`,
        price: Math.floor(Math.random() * 100) + 1
      }
    });
  };

  const updateFormField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmailField(prev => ({ ...prev, value, touched: true }));
    } else {
      setPasswordField(prev => ({ ...prev, value, touched: true }));
    }
  };

  const codeExamples = {
    basic: `// Basic atoms
import { atom } from 'jotai';

const counterAtom = atom(0);
const textAtom = atom('Hello');

// In component
const [count, setCount] = useAtom(counterAtom);
const [text, setText] = useAtom(textAtom);`,
    derived: `// Derived atoms
const doubleCountAtom = atom((get) => get(counterAtom) * 2);

const formattedTextAtom = atom((get) => {
  const text = get(textAtom);
  return text.toUpperCase().trim();
});

// Read-write derived atom
const counterControlsAtom = atom(
  (get) => get(counterAtom),
  (get, set, action: 'increment' | 'decrement' | 'reset') => {
    const current = get(counterAtom);
    switch (action) {
      case 'increment': set(counterAtom, current + 1); break;
      case 'decrement': set(counterAtom, current - 1); break;
      case 'reset': set(counterAtom, 0); break;
    }
  }
);`,
    async: `// Async atoms
const userIdAtom = atom<string | null>(null);

const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  if (!userId) return null;
  
  const response = await fetch(\`/api/users/\${userId}\`);
  return response.json();
});

// With Suspense support
const userLoadableAtom = loadable(userAtom);

// Usage in component
const userLoadable = useAtomValue(userLoadableAtom);
if (userLoadable.state === 'loading') return <Loading />;
if (userLoadable.state === 'hasError') return <Error />;
return <UserProfile user={userLoadable.data} />;`,
    family: `// Atom families for dynamic atoms
const counterFamilyAtom = atomFamily((id: string) => 
  atom(0)
);

// Usage
const [counter1] = useAtom(counterFamilyAtom('counter1'));
const [counter2] = useAtom(counterFamilyAtom('counter2'));`
  };

  // User component that uses Suspense
  const UserDisplay: React.FC = () => {
    if (userLoadable.state === 'loading') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="loading"></div>
          <span>Loading user...</span>
        </div>
      );
    }

    if (userLoadable.state === 'hasError') {
      return (
        <div className="alert alert-error">
          <strong>Error:</strong> {userLoadable.error?.message || 'Failed to load user'}
        </div>
      );
    }

    const user = userLoadable.data;
    
    return user ? (
      <div className="state-inspector">
        <h4>User Data</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {user.avatar && (
            <img src={user.avatar} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
          )}
          <div>
            <div><strong>{user.name}</strong></div>
            <div style={{ color: '#a8bdb2' }}>{user.email}</div>
          </div>
        </div>
        <pre><code>{JSON.stringify(user, null, 2)}</code></pre>
      </div>
    ) : null;
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Jotai Demo</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Jotai provides a bottom-up approach to React state management with atomic architecture. 
          Build state by composing atoms and enjoy automatic dependency tracking.
        </p>
      </header>

      {/* Features Overview */}
      <section className="card">
        <h2>Key Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>⚛️ Atomic</h3>
            <p>Build complex state from simple atoms. Bottom-up composition with fine-grained updates.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔗 Automatic Dependencies</h3>
            <p>Derived atoms automatically track dependencies. No manual subscription management.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>⏸️ Suspense Ready</h3>
            <p>Built-in support for React Suspense and error boundaries with async atoms.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🎯 TypeScript First</h3>
            <p>Excellent TypeScript support with full type inference and safety.</p>
          </div>
        </div>
      </section>

      {/* Basic Atoms */}
      <section className="demo-section">
        <h2>1. Basic Atoms</h2>
        <p>
          Primitive atoms hold single values. They can be read and written independently, 
          and components automatically re-render when subscribed atoms change.
        </p>
        
        <div className="demo-controls">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
            style={{ flex: 1, marginRight: '1rem' }}
          />
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <button onClick={() => setCount(0)}>Reset</button>
        </div>

        <div className="state-inspector">
          <h4>Atom Values</h4>
          <pre><code>{JSON.stringify({ 
            text, 
            count, 
            theme, 
            language 
          }, null, 2)}</code></pre>
        </div>
        
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Basic Atoms Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.basic}</code></pre>
        </details>
      </section>

      {/* Derived Atoms */}
      <section className="demo-section">
        <h2>2. Derived Atoms</h2>
        <p>
          Derived atoms compute values from other atoms. They automatically update when dependencies change 
          and can be both read-only and read-write.
        </p>
        
        <div className="demo-output" style={{ margin: '1rem 0' }}>
          <strong>Double Count:</strong> {doubleCount}
        </div>
        <div className="demo-output" style={{ margin: '1rem 0' }}>
          <strong>Formatted Text:</strong> "{formattedText}"
        </div>

        <div className="demo-controls">
          <button onClick={() => dispatchCounter('increment')}>Increment</button>
          <button onClick={() => dispatchCounter('decrement')}>Decrement</button>
          <button onClick={() => dispatchCounter('reset')}>Reset</button>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Derived Atoms Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.derived}</code></pre>
        </details>
      </section>

      {/* Todo List with Immer */}
      <section className="demo-section">
        <h2>3. Todo List with atomWithImmer</h2>
        <p>
          Complex state management using atomWithImmer for mutable-style updates. 
          Includes multiple derived atoms for statistics and filtering.
        </p>
        
        <form onSubmit={handleAddTodo} className="demo-controls">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
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
                  onChange={() => dispatchTodo({ type: 'toggle', id: todo.id })}
                />
                <span style={{ flex: 1 }}>{todo.text}</span>
                <small style={{ color: '#a8bdb2' }}>
                  {new Date(todo.createdAt).toLocaleDateString()}
                </small>
                <button 
                  onClick={() => dispatchTodo({ type: 'remove', id: todo.id })}
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
            <button onClick={() => dispatchTodo({ type: 'clear-completed' })}>
              Clear Completed ({todoStats.completed})
            </button>
          </div>
        )}
      </section>

      {/* Async Atoms */}
      <section className="demo-section">
        <h2>4. Async Atoms with Loadable</h2>
        <p>
          Jotai handles async operations elegantly with built-in Suspense support. 
          Use loadable atoms for more control over loading and error states.
        </p>
        
        <div className="demo-controls">
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="User ID (try 'error' for error state)"
            style={{ marginRight: '1rem' }}
          />
          <button onClick={handleFetchUser}>
            Fetch User
          </button>
          {userId && (
            <button onClick={() => setUserId(null)} style={{ marginLeft: '1rem' }}>
              Clear User
            </button>
          )}
        </div>

        <UserDisplay />

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Async Atoms Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.async}</code></pre>
        </details>
      </section>

      {/* Atom Families */}
      <section className="demo-section">
        <h2>5. Atom Families</h2>
        <p>
          Atom families create atoms dynamically based on parameters. 
          Perfect for managing collections or parameterized state.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '1rem 0' }}>
          <div>
            <h4>Counter 1: {counter1}</h4>
            <div className="demo-controls">
              <button onClick={() => setCounter1(prev => prev + 1)}>+</button>
              <button onClick={() => setCounter1(prev => prev - 1)}>-</button>
              <button onClick={() => setCounter1(0)}>Reset</button>
            </div>
          </div>
          <div>
            <h4>Counter 2: {counter2}</h4>
            <div className="demo-controls">
              <button onClick={() => setCounter2(prev => prev + 1)}>+</button>
              <button onClick={() => setCounter2(prev => prev - 1)}>-</button>
              <button onClick={() => setCounter2(0)}>Reset</button>
            </div>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Atom Family Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.family}</code></pre>
        </details>
      </section>

      {/* Form State Management */}
      <section className="demo-section">
        <h2>6. Form State Management</h2>
        <p>
          Jotai excels at form state management with independent field atoms. 
          Each field can have its own validation and state without affecting others.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={emailField.value}
              onChange={(e) => updateFormField('email', e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <small style={{ color: emailField.error ? '#ef4444' : '#a8bdb2' }}>
              {emailField.error || 'Enter your email address'}
            </small>
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={passwordField.value}
              onChange={(e) => updateFormField('password', e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <small style={{ color: passwordField.error ? '#ef4444' : '#a8bdb2' }}>
              {passwordField.error || 'Enter your password'}
            </small>
          </div>
        </div>

        <div className="state-inspector" style={{ marginTop: '1rem' }}>
          <h4>Form State</h4>
          <pre><code>{JSON.stringify({ 
            email: emailField, 
            password: { ...passwordField, value: '[hidden]' }
          }, null, 2)}</code></pre>
        </div>
      </section>

      {/* Shopping Cart Example */}
      <section className="demo-section">
        <h2>7. Shopping Cart with Complex State</h2>
        <p>
          Complex state management with multiple derived atoms for calculations. 
          Demonstrates how atoms compose naturally for business logic.
        </p>
        
        <div className="demo-controls">
          <button onClick={addToCart}>Add Random Item</button>
          <button onClick={() => dispatchCartAction({ type: 'clear' })}>
            Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
          <div className="demo-output">
            <strong>Items:</strong> {cartItemCount}
          </div>
          <div className="demo-output">
            <strong>Total:</strong> ${cartTotal.toFixed(2)}
          </div>
        </div>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(26, 93, 58, 0.2)', borderRadius: '4px', padding: '1rem' }}>
          {cart.length === 0 ? (
            <p style={{ color: '#a8bdb2', fontStyle: 'italic' }}>Cart is empty</p>
          ) : (
            cart.map(item => (
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
                      onClick={() => dispatchCartAction({ type: 'update-quantity', id: item.id, quantity: item.quantity - 1 })}
                      style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => dispatchCartAction({ type: 'update-quantity', id: item.id, quantity: item.quantity + 1 })}
                      style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => dispatchCartAction({ type: 'remove', id: item.id })}
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

      {/* Reducer-style Atom */}
      <section className="demo-section">
        <h2>8. Reducer-style State with atomWithReducer</h2>
        <p>
          For complex state logic, atomWithReducer provides Redux-like reducers 
          while maintaining Jotai's atomic approach.
        </p>
        
        <div className="counter-display">
          Value: {counterWithHistory.value}
        </div>
        
        <div className="demo-controls">
          <button onClick={() => dispatchCounterWithHistory({ type: 'increment' })}>
            Increment
          </button>
          <button onClick={() => dispatchCounterWithHistory({ type: 'decrement' })}>
            Decrement
          </button>
          <button onClick={() => dispatchCounterWithHistory({ type: 'set', value: Math.floor(Math.random() * 100) })}>
            Random
          </button>
          <button onClick={() => dispatchCounterWithHistory({ type: 'reset' })}>
            Reset
          </button>
        </div>

        <div className="state-inspector">
          <h4>State with History</h4>
          <div><strong>Current:</strong> {counterWithHistory.value}</div>
          <div><strong>History:</strong> [{counterWithHistory.history.join(', ')}]</div>
        </div>
      </section>

      {/* Settings & Validation */}
      <section className="demo-section">
        <h2>9. Settings with Validation</h2>
        <p>
          Demonstrates validated atoms that can reject invalid updates 
          and maintain data integrity.
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
          <h4>Settings</h4>
          <pre><code>{JSON.stringify(settings, null, 2)}</code></pre>
        </div>
      </section>

      {/* Best Practices */}
      <section className="card">
        <h2>Jotai Best Practices</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80' }}>Atom Design</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Keep atoms focused and single-purpose</li>
              <li>Use derived atoms for computations</li>
              <li>Prefer composition over complex atoms</li>
              <li>Use atom families for collections</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Performance</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Atoms automatically optimize re-renders</li>
              <li>Use Suspense for async operations</li>
              <li>Split complex state into multiple atoms</li>
              <li>Leverage automatic dependency tracking</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Organization</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Group related atoms in modules</li>
              <li>Use descriptive atom names</li>
              <li>Export atom collections for easier imports</li>
              <li>Document complex derived atoms</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="card">
        <h2>Jotai Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80' }}>Pros</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Fine-grained reactivity</li>
              <li>Automatic dependency tracking</li>
              <li>Built-in Suspense support</li>
              <li>Excellent TypeScript support</li>
              <li>Small bundle size (~2.4KB)</li>
              <li>No providers needed</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#f59e0b' }}>Cons</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Learning curve for atomic thinking</li>
              <li>Can lead to many small atoms</li>
              <li>No built-in DevTools (use React DevTools)</li>
              <li>Less opinionated structure</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80' }}>Best For</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Applications needing fine-grained updates</li>
              <li>Complex forms and validation</li>
              <li>Async data management</li>
              <li>React Suspense applications</li>
              <li>Performance-critical updates</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JotaiDemo;