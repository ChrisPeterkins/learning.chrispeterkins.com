import React, { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  counterAtom, 
  textAtom, 
  doubleCountAtom, 
  formattedTextAtom,
  counterControlsAtom,
  counterFamilyAtom,
  todoAtoms,
  cartAtoms,
  settingsAtoms 
} from '../stores/jotaiStore';

const AtomicState: React.FC = () => {
  // Demonstrate various atomic patterns
  const [count, setCount] = useAtom(counterAtom);
  const [text, setText] = useAtom(textAtom);
  const doubleCount = useAtomValue(doubleCountAtom);
  const formattedText = useAtomValue(formattedTextAtom);
  const dispatch = useSetAtom(counterControlsAtom);
  
  // Atom families
  const [userCounter] = useAtom(counterFamilyAtom('user'));
  const [adminCounter] = useAtom(counterFamilyAtom('admin'));
  const [guestCounter] = useAtom(counterFamilyAtom('guest'));
  
  const setUserCounter = useSetAtom(counterFamilyAtom('user'));
  const setAdminCounter = useSetAtom(counterFamilyAtom('admin'));
  const setGuestCounter = useSetAtom(counterFamilyAtom('guest'));
  
  // Todo atoms
  const todos = useAtomValue(todoAtoms.todos);
  const todoStats = useAtomValue(todoAtoms.stats);
  const todoActions = useSetAtom(todoAtoms.actions);
  
  // Cart atoms
  const cart = useAtomValue(cartAtoms.cart);
  const cartTotal = useAtomValue(cartAtoms.total);
  const cartActions = useSetAtom(cartAtoms.actions);
  
  // Settings atoms
  const settings = useAtomValue(settingsAtoms.settings);
  
  // Local state for forms
  const [newTodo, setNewTodo] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      todoActions({ type: 'add', text: newTodo });
      setNewTodo('');
    }
  };

  const addCartItem = () => {
    cartActions({
      type: 'add',
      item: {
        id: crypto.randomUUID(),
        name: `Item ${Date.now()}`,
        price: Math.floor(Math.random() * 100) + 1
      }
    });
  };

  const codeExamples = {
    basicAtom: `// Basic atomic pattern
import { atom } from 'jotai';

// Primitive atoms - single source of truth
const counterAtom = atom(0);
const textAtom = atom('Hello');
const userAtom = atom(null);

// Usage in components
const [count, setCount] = useAtom(counterAtom);
const [text, setText] = useAtom(textAtom);`,
    derivedAtom: `// Derived atoms - computed from other atoms
const doubleCountAtom = atom((get) => get(counterAtom) * 2);

const fullNameAtom = atom((get) => {
  const user = get(userAtom);
  return user ? \`\${user.firstName} \${user.lastName}\` : '';
});

// Read-write derived atoms
const upperCaseTextAtom = atom(
  (get) => get(textAtom).toUpperCase(),
  (get, set, newValue: string) => {
    set(textAtom, newValue.toLowerCase());
  }
);`,
    atomFamily: `// Atom families - dynamic atoms
const counterFamily = atomFamily((id: string) => atom(0));

// Each ID gets its own atom instance
const userCounter = counterFamily('user');
const adminCounter = counterFamily('admin');

// Usage
const [userCount, setUserCount] = useAtom(counterFamily('user'));
const [adminCount, setAdminCount] = useAtom(counterFamily('admin'));`,
    composition: `// Atomic composition pattern
const userIdAtom = atom('user1');
const userDataAtom = atom(async (get) => {
  const id = get(userIdAtom);
  return await fetchUser(id);
});

const userPostsAtom = atom(async (get) => {
  const user = await get(userDataAtom);
  return await fetchUserPosts(user.id);
});

// Compose complex state from simple atoms
const userProfileAtom = atom((get) => ({
  user: get(userDataAtom),
  posts: get(userPostsAtom),
  isLoading: get(userLoadingAtom)
}));`,
    benefits: `// Benefits of Atomic State

1. Fine-grained reactivity
   - Only components using changed atoms re-render
   - No unnecessary re-renders from unrelated state changes

2. Automatic dependency tracking
   - Derived atoms automatically track dependencies
   - No manual subscription management needed

3. Bottom-up composition
   - Build complex state from simple atoms
   - Easy to test individual pieces

4. Flexible organization
   - Atoms can be organized by domain or feature
   - Easy to split and combine as needed`,
    patterns: `// Common Atomic Patterns

// 1. Loading pattern
const dataAtom = atom(async (get) => {
  const id = get(idAtom);
  return await fetchData(id);
});

const dataLoadableAtom = loadable(dataAtom);

// 2. Form pattern  
const formAtom = atom({
  email: '',
  password: '',
  errors: {}
});

const emailAtom = atom(
  (get) => get(formAtom).email,
  (get, set, value: string) => {
    const form = get(formAtom);
    set(formAtom, { ...form, email: value });
  }
);

// 3. Cache pattern
const cacheAtom = atomFamily((key: string) =>
  atom(async () => {
    return await fetchFromAPI(key);
  })
);`,
    antiPatterns: `// Anti-patterns to avoid

// ❌ Don't create giant atoms
const badAtom = atom({
  user: { ... },
  todos: [ ... ],
  settings: { ... },
  ui: { ... }
});

// ✅ Split into focused atoms
const userAtom = atom(null);
const todosAtom = atom([]);
const settingsAtom = atom({});
const uiAtom = atom({});

// ❌ Don't mutate atom values directly
const mutateAtom = atom([]);
// Bad: mutateAtom.value.push(item)

// ✅ Use immutable updates
const [items, setItems] = useAtom(itemsAtom);
setItems(prev => [...prev, newItem]);`
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Atomic State Management Patterns</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Explore atomic state management concepts and patterns. Learn how to build complex state 
          from simple, focused atoms with automatic dependency tracking and fine-grained reactivity.
        </p>
      </header>

      {/* What is Atomic State */}
      <section className="card">
        <h2>What is Atomic State Management?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>Atomic Principles</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Single Responsibility:</strong> Each atom manages one piece of state</li>
              <li><strong>Composition:</strong> Complex state built from simple atoms</li>
              <li><strong>Dependency Tracking:</strong> Automatic updates when dependencies change</li>
              <li><strong>Fine-grained Updates:</strong> Only affected components re-render</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>Traditional vs Atomic</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ color: '#f59e0b' }}>Traditional Store</h4>
                <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
                  <li>Top-down approach</li>
                  <li>Centralized state tree</li>
                  <li>Manual optimization</li>
                  <li>Global re-renders</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#4ade80' }}>Atomic State</h4>
                <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
                  <li>Bottom-up composition</li>
                  <li>Distributed atoms</li>
                  <li>Automatic optimization</li>
                  <li>Surgical updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Key Insight</h4>
          <p style={{ color: '#a8bdb2' }}>
            Atomic state management treats each piece of state as an independent atom that can be composed 
            with others. This creates a system where changes propagate automatically through dependency graphs, 
            resulting in efficient updates and better code organization.
          </p>
        </div>
      </section>

      {/* Basic Atomic Patterns */}
      <section className="demo-section">
        <h2>1. Basic Atomic Patterns</h2>
        <p>
          Start with simple primitive atoms and see how they can be composed into more complex state patterns.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3>Primitive Atoms</h3>
            <div className="demo-controls">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text..."
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              <button onClick={() => setCount(count + 1)}>
                Count: {count}
              </button>
            </div>
            
            <div className="state-inspector">
              <h4>Atom Values</h4>
              <pre><code>{JSON.stringify({ text, count }, null, 2)}</code></pre>
            </div>
          </div>
          
          <div>
            <h3>Derived Atoms (Auto-computed)</h3>
            <div className="demo-output" style={{ marginBottom: '1rem' }}>
              <strong>Formatted Text:</strong> "{formattedText}"
            </div>
            <div className="demo-output" style={{ marginBottom: '1rem' }}>
              <strong>Double Count:</strong> {doubleCount}
            </div>
            
            <div className="demo-controls">
              <button onClick={() => dispatch('increment')}>+1</button>
              <button onClick={() => dispatch('decrement')}>-1</button>
              <button onClick={() => dispatch('reset')}>Reset</button>
            </div>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Basic Atom Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.basicAtom}</code></pre>
        </details>
      </section>

      {/* Derived Atoms */}
      <section className="demo-section">
        <h2>2. Derived Atoms & Dependency Tracking</h2>
        <p>
          Derived atoms automatically track dependencies and update when their inputs change. 
          No manual subscription management required.
        </p>

        <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
          <strong>Watch the Magic:</strong> Change the text or counter above and see how the derived values 
          update automatically. This is dependency tracking in action!
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="state-inspector">
            <h4>Dependency Graph</h4>
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2' }}>
              <div><strong>textAtom</strong> → formattedTextAtom</div>
              <div><strong>counterAtom</strong> → doubleCountAtom</div>
              <div><strong>counterAtom</strong> → counterControlsAtom</div>
            </div>
          </div>
          
          <div className="state-inspector">
            <h4>Update Propagation</h4>
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2' }}>
              <div>1. Primitive atom changes</div>
              <div>2. Derived atoms recalculate</div>
              <div>3. Components re-render</div>
              <div>4. Only affected parts update</div>
            </div>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Derived Atom Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.derivedAtom}</code></pre>
        </details>
      </section>

      {/* Atom Families */}
      <section className="demo-section">
        <h2>3. Atom Families - Dynamic Atoms</h2>
        <p>
          Atom families create atoms dynamically based on parameters. Perfect for managing 
          collections or user-specific state.
        </p>

        <div className="demo-controls" style={{ marginBottom: '1rem' }}>
          <label>
            Select Role:
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>User Counter: {userCounter}</h4>
            <div className="demo-controls">
              <button onClick={() => setUserCounter(prev => prev + 1)}>+</button>
              <button onClick={() => setUserCounter(prev => prev - 1)}>-</button>
              <button onClick={() => setUserCounter(0)}>Reset</button>
            </div>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>Admin Counter: {adminCounter}</h4>
            <div className="demo-controls">
              <button onClick={() => setAdminCounter(prev => prev + 1)}>+</button>
              <button onClick={() => setAdminCounter(prev => prev - 1)}>-</button>
              <button onClick={() => setAdminCounter(0)}>Reset</button>
            </div>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>Guest Counter: {guestCounter}</h4>
            <div className="demo-controls">
              <button onClick={() => setGuestCounter(prev => prev + 1)}>+</button>
              <button onClick={() => setGuestCounter(prev => prev - 1)}>-</button>
              <button onClick={() => setGuestCounter(0)}>Reset</button>
            </div>
          </div>
        </div>

        <div className="state-inspector">
          <h4>Family State</h4>
          <pre><code>{JSON.stringify({
            user: userCounter,
            admin: adminCounter,
            guest: guestCounter
          }, null, 2)}</code></pre>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Atom Family Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.atomFamily}</code></pre>
        </details>
      </section>

      {/* Complex Composition */}
      <section className="demo-section">
        <h2>4. Complex State Composition</h2>
        <p>
          Build complex features by composing simple atoms. Each atom remains focused 
          while contributing to larger state patterns.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3>Todo Management</h3>
            <form onSubmit={handleAddTodo} className="demo-controls">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add todo..."
                style={{ flex: 1, marginRight: '1rem' }}
              />
              <button type="submit">Add</button>
            </form>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', margin: '1rem 0' }}>
              <div className="demo-output">
                <strong>Total:</strong> {todoStats.total}
              </div>
              <div className="demo-output">
                <strong>Active:</strong> {todoStats.active}
              </div>
              <div className="demo-output">
                <strong>Done:</strong> {todoStats.completed}
              </div>
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(26, 93, 58, 0.2)', borderRadius: '4px', padding: '1rem' }}>
              {todos.length === 0 ? (
                <p style={{ color: '#a8bdb2', fontStyle: 'italic' }}>No todos yet</p>
              ) : (
                todos.slice(0, 5).map(todo => (
                  <div key={todo.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.25rem 0',
                    fontSize: '0.9rem',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1
                  }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => todoActions({ type: 'toggle', id: todo.id })}
                    />
                    <span style={{ flex: 1 }}>{todo.text}</span>
                    <button 
                      onClick={() => todoActions({ type: 'remove', id: todo.id })}
                      style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h3>Shopping Cart</h3>
            <div className="demo-controls">
              <button onClick={addCartItem}>Add Random Item</button>
              <button onClick={() => cartActions({ type: 'clear' })}>Clear Cart</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '1rem 0' }}>
              <div className="demo-output">
                <strong>Items:</strong> {cart.length}
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
                    padding: '0.25rem 0',
                    fontSize: '0.9rem',
                    borderBottom: '1px solid rgba(26, 93, 58, 0.1)'
                  }}>
                    <span>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>${item.price}</span>
                      <span>×{item.quantity}</span>
                      <button 
                        onClick={() => cartActions({ type: 'remove', id: item.id })}
                        style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Composition Code
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.composition}</code></pre>
        </details>
      </section>

      {/* Benefits of Atomic State */}
      <section className="card">
        <h2>Benefits of Atomic State Management</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🎯 Fine-grained Reactivity</h3>
            <p>Components only re-render when atoms they use change. No unnecessary updates from unrelated state changes.</p>
            
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '1rem' }}>
              <strong>Example:</strong> Changing the counter above doesn't affect the todo list components.
            </div>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔗 Automatic Dependencies</h3>
            <p>Derived atoms automatically track which atoms they depend on. No manual subscription management.</p>
            
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '1rem' }}>
              <strong>Example:</strong> formattedTextAtom automatically updates when textAtom changes.
            </div>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🧪 Easy Testing</h3>
            <p>Each atom can be tested independently. Mock dependencies easily for unit tests.</p>
            
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '1rem' }}>
              <strong>Example:</strong> Test counterAtom without needing the entire app state.
            </div>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔄 Flexible Composition</h3>
            <p>Build complex state by combining simple atoms. Easy to refactor and reorganize.</p>
            
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '1rem' }}>
              <strong>Example:</strong> Combine user, todos, and settings atoms for a complete profile view.
            </div>
          </div>
        </div>

        <details style={{ marginTop: '2rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Benefits Code Example
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.benefits}</code></pre>
        </details>
      </section>

      {/* Common Patterns */}
      <section className="card">
        <h2>Common Atomic Patterns</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>Loading Pattern</h3>
            <pre style={{ fontSize: '0.8rem', background: 'rgba(15, 25, 20, 0.6)', padding: '1rem', borderRadius: '4px' }}>
              <code>{`const dataAtom = atom(async (get) => {
  const id = get(idAtom);
  return await fetchData(id);
});

const loadableAtom = loadable(dataAtom);

// In component
const loadable = useAtomValue(loadableAtom);
if (loadable.state === 'loading') return <Loading />;
if (loadable.state === 'hasError') return <Error />;
return <Data data={loadable.data} />;`}</code>
            </pre>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>Form Pattern</h3>
            <pre style={{ fontSize: '0.8rem', background: 'rgba(15, 25, 20, 0.6)', padding: '1rem', borderRadius: '4px' }}>
              <code>{`const formAtom = atom({
  email: '',
  password: '',
  errors: {}
});

const emailAtom = atom(
  (get) => get(formAtom).email,
  (get, set, value) => {
    const form = get(formAtom);
    set(formAtom, { ...form, email: value });
  }
);`}</code>
            </pre>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>Cache Pattern</h3>
            <pre style={{ fontSize: '0.8rem', background: 'rgba(15, 25, 20, 0.6)', padding: '1rem', borderRadius: '4px' }}>
              <code>{`const cacheFamily = atomFamily((key) =>
  atom(async () => {
    return await fetchFromAPI(key);
  })
);

// Each key gets its own cached atom
const userCache = cacheFamily('user');
const postsCache = cacheFamily('posts');`}</code>
            </pre>
          </div>
          
          <div>
            <h3 style={{ color: '#4ade80' }}>State Machine Pattern</h3>
            <pre style={{ fontSize: '0.8rem', background: 'rgba(15, 25, 20, 0.6)', padding: '1rem', borderRadius: '4px' }}>
              <code>{`const stateAtom = atom('idle');
const eventAtom = atom(null, (get, set, event) => {
  const current = get(stateAtom);
  const next = transitions[current][event];
  if (next) set(stateAtom, next);
});`}</code>
            </pre>
          </div>
        </div>

        <details style={{ marginTop: '2rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View All Pattern Examples
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.patterns}</code></pre>
        </details>
      </section>

      {/* Best Practices & Anti-patterns */}
      <section className="card">
        <h2>Best Practices & Anti-patterns</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>✅ Do This</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Single Responsibility:</strong> One atom, one concern</li>
              <li><strong>Compose Up:</strong> Build complex state from simple atoms</li>
              <li><strong>Use Families:</strong> For collections and parameterized state</li>
              <li><strong>Derive Calculations:</strong> Use derived atoms for computed values</li>
              <li><strong>Test Atoms:</strong> Unit test atoms independently</li>
              <li><strong>Name Descriptively:</strong> Clear names for atom purpose</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#ef4444' }}>❌ Avoid This</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Giant Atoms:</strong> Don't put everything in one atom</li>
              <li><strong>Direct Mutation:</strong> Never mutate atom values directly</li>
              <li><strong>Side Effects in Reads:</strong> Keep read functions pure</li>
              <li><strong>Circular Dependencies:</strong> Atoms depending on each other</li>
              <li><strong>Over-deriving:</strong> Don't derive what you can compute inline</li>
              <li><strong>Deep Nesting:</strong> Keep atom structures flat</li>
            </ul>
          </div>
        </div>

        <details style={{ marginTop: '2rem' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80', marginBottom: '1rem' }}>
            View Anti-pattern Examples
          </summary>
          <pre style={{ fontSize: '0.85rem' }}><code>{codeExamples.antiPatterns}</code></pre>
        </details>
      </section>

      {/* Migration to Atomic */}
      <section className="card">
        <h2>Migrating to Atomic State</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>1. Identify State Pieces</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Break down monolithic state</li>
              <li>Find independent pieces</li>
              <li>Identify relationships</li>
              <li>Map data dependencies</li>
            </ul>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>2. Create Atomic Structure</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Start with primitive atoms</li>
              <li>Add derived atoms for calculations</li>
              <li>Use families for collections</li>
              <li>Organize by domain/feature</li>
            </ul>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>3. Gradual Migration</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Migrate feature by feature</li>
              <li>Keep old and new systems parallel</li>
              <li>Update components incrementally</li>
              <li>Remove old state management</li>
            </ul>
          </div>
          
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>4. Optimize & Refine</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Monitor re-render patterns</li>
              <li>Optimize atom organization</li>
              <li>Add error boundaries</li>
              <li>Implement proper loading states</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Migration Tip</h4>
          <p style={{ color: '#a8bdb2' }}>
            Start with leaf components and work your way up. Convert components that don't affect 
            others first, then gradually move to more central state pieces. This approach minimizes 
            risk and allows for thorough testing at each step.
          </p>
        </div>
      </section>

      {/* Summary */}
      <section className="card">
        <h2>Atomic State Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80' }}>Key Benefits</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Fine-grained reactivity</li>
              <li>Automatic dependency tracking</li>
              <li>Easy composition</li>
              <li>Better performance</li>
              <li>Simpler testing</li>
              <li>Flexible organization</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#4ade80' }}>Best Use Cases</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Form-heavy applications</li>
              <li>Interactive dashboards</li>
              <li>Real-time UIs</li>
              <li>Component libraries</li>
              <li>Performance-critical apps</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#4ade80' }}>Libraries Supporting Atomic</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Jotai (React-focused)</li>
              <li>Recoil (Facebook)</li>
              <li>Nanostores (Framework-agnostic)</li>
              <li>Solid Signals (SolidJS)</li>
              <li>Vue Reactivity (Vue 3)</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Ready to Go Atomic?</h4>
          <p style={{ marginBottom: '1.5rem', color: '#a8bdb2' }}>
            Atomic state management offers a powerful paradigm shift from traditional top-down state management. 
            Start small, experiment with the patterns, and gradually adopt the approach in your applications.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/jotai" style={{ 
              display: 'inline-block', 
              background: 'rgba(26, 93, 58, 0.3)', 
              border: '1px solid #4ade80',
              color: '#4ade80',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Try Jotai Demo →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AtomicState;