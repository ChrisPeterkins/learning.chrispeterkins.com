import React, { useState, useCallback, useMemo, memo } from 'react';
import { useCounter } from '../stores/zustandStore';
import { useAtom } from 'jotai';
import { counterAtom } from '../stores/jotaiStore';
import { useSnapshot } from 'valtio';
import { counterState } from '../stores/valtioStore';

const PerformanceComparison: React.FC = () => {
  const [selectedLibrary, setSelectedLibrary] = useState('zustand');
  const [renderCount, setRenderCount] = useState(0);
  const [heavyComputation, setHeavyComputation] = useState(false);

  // State from different libraries
  const zustandCounter = useCounter();
  const [jotaiCount, setJotaiCount] = useAtom(counterAtom);
  const valtioSnap = useSnapshot(counterState);

  // Performance test component
  const HeavyComponent = memo(({ value }: { value: number }) => {
    const computedValue = useMemo(() => {
      if (!heavyComputation) return value;
      // Simulate heavy computation
      let result = value;
      for (let i = 0; i < 100000; i++) {
        result = Math.sin(result) * Math.cos(result);
      }
      return result.toFixed(4);
    }, [value, heavyComputation]);

    return (
      <div style={{ padding: '1rem', border: '1px solid rgba(26, 93, 58, 0.2)', borderRadius: '4px', margin: '0.5rem 0' }}>
        <div><strong>Heavy Component Value:</strong> {computedValue}</div>
        <div style={{ fontSize: '0.9rem', color: '#a8bdb2' }}>
          {heavyComputation ? 'Heavy computation enabled' : 'Light computation'}
        </div>
      </div>
    );
  });

  const incrementSelectedLibrary = useCallback(() => {
    setRenderCount(prev => prev + 1);
    switch (selectedLibrary) {
      case 'zustand':
        zustandCounter.increment();
        break;
      case 'jotai':
        setJotaiCount(prev => prev + 1);
        break;
      case 'valtio':
        valtioSnap.increment();
        break;
    }
  }, [selectedLibrary, zustandCounter, setJotaiCount, valtioSnap]);

  const getCurrentValue = () => {
    switch (selectedLibrary) {
      case 'zustand':
        return zustandCounter.count;
      case 'jotai':
        return jotaiCount;
      case 'valtio':
        return valtioSnap.count;
      default:
        return 0;
    }
  };

  const bundleSizeData = [
    { name: 'Zustand', size: 2.7, gzipped: 1.2 },
    { name: 'Jotai', size: 2.4, gzipped: 1.1 },
    { name: 'Valtio', size: 3.1, gzipped: 1.4 },
    { name: 'Redux Toolkit', size: 12.1, gzipped: 4.8 },
    { name: 'Redux + React-Redux', size: 15.3, gzipped: 5.9 },
    { name: 'Recoil', size: 8.7, gzipped: 3.2 }
  ];

  const performanceMetrics = {
    initialization: {
      zustand: '0.8ms',
      jotai: '0.6ms',
      valtio: '1.1ms',
      redux: '2.3ms'
    },
    stateUpdate: {
      zustand: '0.2ms',
      jotai: '0.1ms',
      valtio: '0.3ms',
      redux: '0.4ms'
    },
    rerenderTime: {
      zustand: '1.2ms',
      jotai: '0.9ms',
      valtio: '1.4ms',
      redux: '1.8ms'
    },
    memoryUsage: {
      zustand: '45KB',
      jotai: '38KB',
      valtio: '52KB',
      redux: '78KB'
    }
  };

  const optimizationTips = {
    zustand: [
      'Use selectors to prevent unnecessary re-renders',
      'Split large stores into smaller, focused stores',
      'Use shallow comparison for objects',
      'Implement proper memoization with useCallback',
      'Leverage middleware for cross-cutting concerns'
    ],
    jotai: [
      'Keep atoms small and focused',
      'Use derived atoms for computed values',
      'Leverage automatic dependency tracking',
      'Use Suspense for async operations',
      'Split complex state into multiple atoms'
    ],
    valtio: [
      'Use snapshots in render methods only',
      'Avoid creating functions in render',
      'Use subscriptions for side effects',
      'Keep proxy objects flat when possible',
      'Leverage automatic proxy optimization'
    ],
    redux: [
      'Use Redux Toolkit to reduce boilerplate',
      'Implement proper selector patterns',
      'Use memoized selectors (reselect)',
      'Normalize state shape',
      'Use RTK Query for data fetching'
    ]
  };

  const codeExamples = {
    zustandOptimization: `// Zustand optimization techniques
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Use selectors to prevent re-renders
const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    user: null,
    todos: [],
    // ... other state
  }))
);

// Component with selective subscription
function UserProfile() {
  const user = useAppStore(state => state.user);
  // Only re-renders when user changes, not todos
  return <div>{user?.name}</div>;
}

// Shallow comparison for objects
function TodoList() {
  const todos = useAppStore(
    state => state.todos,
    (a, b) => a.length === b.length && a.every((t, i) => t.id === b[i].id)
  );
  return <div>{todos.length} todos</div>;
}`,
    jotaiOptimization: `// Jotai optimization patterns
import { atom, useAtom, useAtomValue } from 'jotai';

// Keep atoms focused and small
const userIdAtom = atom(null);
const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  return id ? await fetchUser(id) : null;
});

// Use derived atoms for computations
const userNameAtom = atom(get => {
  const user = get(userAtom);
  return user?.name || 'Unknown';
});

// Fine-grained subscriptions
function UserProfile() {
  const userName = useAtomValue(userNameAtom);
  // Only re-renders when user name changes
  return <div>{userName}</div>;
}`,
    valtioOptimization: `// Valtio optimization techniques
import { proxy, useSnapshot, subscribe } from 'valtio';

const state = proxy({
  user: null,
  todos: [],
  settings: {}
});

// Use snapshots in render only
function UserProfile() {
  const snap = useSnapshot(state);
  // Automatic optimization - only re-renders when user changes
  return <div>{snap.user?.name}</div>;
}

// Use subscriptions for side effects
subscribe(state, () => {
  localStorage.setItem('app-state', JSON.stringify(state));
});

// Avoid creating functions in render
const UserActions = memo(() => {
  const updateUser = useCallback((updates) => {
    Object.assign(state.user, updates);
  }, []);
  
  return <button onClick={() => updateUser({ name: 'New Name' })}>Update</button>;
});`,
    reduxOptimization: `// Redux optimization patterns
import { createSlice, createSelector } from '@reduxjs/toolkit';
import { useSelector, shallowEqual } from 'react-redux';

// Memoized selectors
const selectTodos = state => state.todos.items;
const selectFilter = state => state.todos.filter;

const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => todos.filter(todo => 
    filter === 'all' || 
    (filter === 'completed' && todo.completed) ||
    (filter === 'active' && !todo.completed)
  )
);

// Component with optimized selector
function TodoList() {
  const todos = useSelector(selectFilteredTodos);
  // Only re-renders when filtered todos change
  return <div>{todos.map(todo => <Todo key={todo.id} {...todo} />)}</div>;
}

// Shallow equality for object selections
function UserInfo() {
  const userInfo = useSelector(
    state => ({ name: state.user.name, email: state.user.email }),
    shallowEqual
  );
  return <div>{userInfo.name} - {userInfo.email}</div>;
}`
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Performance Comparison</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          Compare the performance characteristics of different state management libraries. 
          Understand bundle sizes, render optimization, memory usage, and best practices for each approach.
        </p>
      </header>

      {/* Bundle Size Comparison */}
      <section className="card">
        <h2>Bundle Size Analysis</h2>
        <p style={{ marginBottom: '2rem' }}>
          Bundle size is crucial for initial load performance. Smaller libraries mean faster downloads 
          and parsing, especially important for mobile users.
        </p>
        
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Library</th>
                <th>Minified Size</th>
                <th>Gzipped Size</th>
                <th>Dependencies</th>
                <th>Tree Shakable</th>
              </tr>
            </thead>
            <tbody>
              {bundleSizeData.map(lib => (
                <tr key={lib.name}>
                  <td><strong>{lib.name}</strong></td>
                  <td>{lib.size} KB</td>
                  <td>{lib.gzipped} KB</td>
                  <td>{lib.name.includes('Redux') ? 'React-Redux, Immer' : 'None'}</td>
                  <td>✅</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Chart */}
        <div>
          <h3>Bundle Size Visualization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {bundleSizeData.map(lib => (
              <div key={lib.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', fontSize: '0.9rem' }}>{lib.name}</div>
                <div style={{ flex: 1, background: 'rgba(15, 25, 20, 0.6)', borderRadius: '4px', height: '24px', position: 'relative' }}>
                  <div 
                    style={{ 
                      background: lib.size > 10 ? '#ef4444' : lib.size > 5 ? '#f59e0b' : '#4ade80',
                      height: '100%',
                      borderRadius: '4px',
                      width: `${(lib.size / 16) * 100}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: 'white'
                    }}
                  >
                    {lib.size} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Bundle Size Impact</h4>
          <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
            <li><strong>Mobile Performance:</strong> Smaller bundles = faster load times on slow networks</li>
            <li><strong>Parse Time:</strong> Less JavaScript to parse means faster startup</li>
            <li><strong>Memory Usage:</strong> Smaller libraries use less runtime memory</li>
            <li><strong>Cache Efficiency:</strong> Smaller files are more likely to fit in browser cache</li>
          </ul>
        </div>
      </section>

      {/* Runtime Performance Metrics */}
      <section className="card">
        <h2>Runtime Performance Metrics</h2>
        <p style={{ marginBottom: '2rem' }}>
          Runtime performance affects user experience during interactions. These metrics show 
          typical performance characteristics in a React application.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h3>Initialization Time</h3>
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginBottom: '1rem' }}>
              Time to create store and setup subscriptions
            </div>
            {Object.entries(performanceMetrics.initialization).map(([lib, time]) => (
              <div key={lib} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(26, 93, 58, 0.1)' }}>
                <span style={{ textTransform: 'capitalize' }}>{lib}</span>
                <span style={{ color: '#4ade80' }}>{time}</span>
              </div>
            ))}
          </div>

          <div>
            <h3>State Update Time</h3>
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginBottom: '1rem' }}>
              Time to process a single state update
            </div>
            {Object.entries(performanceMetrics.stateUpdate).map(([lib, time]) => (
              <div key={lib} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(26, 93, 58, 0.1)' }}>
                <span style={{ textTransform: 'capitalize' }}>{lib}</span>
                <span style={{ color: '#4ade80' }}>{time}</span>
              </div>
            ))}
          </div>

          <div>
            <h3>Re-render Time</h3>
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginBottom: '1rem' }}>
              Time for components to re-render after state change
            </div>
            {Object.entries(performanceMetrics.rerenderTime).map(([lib, time]) => (
              <div key={lib} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(26, 93, 58, 0.1)' }}>
                <span style={{ textTransform: 'capitalize' }}>{lib}</span>
                <span style={{ color: '#4ade80' }}>{time}</span>
              </div>
            ))}
          </div>

          <div>
            <h3>Memory Usage</h3>
            <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginBottom: '1rem' }}>
              Typical memory footprint for medium app
            </div>
            {Object.entries(performanceMetrics.memoryUsage).map(([lib, usage]) => (
              <div key={lib} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(26, 93, 58, 0.1)' }}>
                <span style={{ textTransform: 'capitalize' }}>{lib}</span>
                <span style={{ color: '#4ade80' }}>{usage}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#f59e0b', marginBottom: '1rem' }}>Performance Note</h4>
          <p style={{ color: '#a8bdb2' }}>
            These metrics are approximate and can vary significantly based on application size, 
            complexity, and usage patterns. Always profile your specific use case for accurate measurements.
          </p>
        </div>
      </section>

      {/* Interactive Performance Test */}
      <section className="demo-section">
        <h2>Interactive Performance Test</h2>
        <p>
          Test the performance characteristics of different libraries with interactive examples. 
          Enable heavy computation to see how they handle expensive operations.
        </p>

        <div className="demo-controls" style={{ marginBottom: '2rem' }}>
          <label>
            Library:
            <select 
              value={selectedLibrary} 
              onChange={(e) => setSelectedLibrary(e.target.value)}
              style={{ marginLeft: '0.5rem', marginRight: '2rem' }}
            >
              <option value="zustand">Zustand</option>
              <option value="jotai">Jotai</option>
              <option value="valtio">Valtio</option>
            </select>
          </label>

          <label>
            <input
              type="checkbox"
              checked={heavyComputation}
              onChange={(e) => setHeavyComputation(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Enable Heavy Computation
          </label>

          <button 
            onClick={incrementSelectedLibrary}
            style={{ marginLeft: '2rem' }}
          >
            Increment {selectedLibrary} ({getCurrentValue()})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="state-inspector">
            <h4>Current State</h4>
            <div><strong>Library:</strong> {selectedLibrary}</div>
            <div><strong>Value:</strong> {getCurrentValue()}</div>
            <div><strong>Render Count:</strong> {renderCount}</div>
            <div><strong>Heavy Computation:</strong> {heavyComputation ? 'On' : 'Off'}</div>
          </div>

          <HeavyComponent value={getCurrentValue()} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Performance Observations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4 style={{ color: '#4ade80' }}>Zustand</h4>
              <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
                <li>Selector-based optimization</li>
                <li>Good with memoization</li>
                <li>Manual render control</li>
              </ul>
            </div>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4 style={{ color: '#4ade80' }}>Jotai</h4>
              <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
                <li>Automatic optimization</li>
                <li>Fine-grained updates</li>
                <li>Dependency tracking</li>
              </ul>
            </div>
            <div className="demo-section" style={{ margin: 0 }}>
              <h4 style={{ color: '#4ade80' }}>Valtio</h4>
              <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
                <li>Proxy-based optimization</li>
                <li>Automatic change detection</li>
                <li>Object-level granularity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Re-render Optimization */}
      <section className="card">
        <h2>Re-render Optimization Strategies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>Zustand Optimization</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Selectors:</strong> Subscribe to specific state slices</li>
              <li><strong>Shallow Comparison:</strong> Custom equality functions</li>
              <li><strong>Store Splitting:</strong> Separate concerns into different stores</li>
              <li><strong>Middleware:</strong> Use persist and devtools efficiently</li>
            </ul>
            
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#4ade80' }}>View Code Example</summary>
              <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}><code>{codeExamples.zustandOptimization}</code></pre>
            </details>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>Jotai Optimization</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Atomic Design:</strong> Keep atoms small and focused</li>
              <li><strong>Derived Atoms:</strong> Use for computed values</li>
              <li><strong>Suspense:</strong> Handle async operations efficiently</li>
              <li><strong>Dependencies:</strong> Leverage automatic tracking</li>
            </ul>
            
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#4ade80' }}>View Code Example</summary>
              <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}><code>{codeExamples.jotaiOptimization}</code></pre>
            </details>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>Valtio Optimization</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Snapshots:</strong> Use only in render methods</li>
              <li><strong>Subscriptions:</strong> Handle side effects separately</li>
              <li><strong>Memoization:</strong> Avoid function creation in render</li>
              <li><strong>Proxy Structure:</strong> Keep objects reasonably flat</li>
            </ul>
            
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#4ade80' }}>View Code Example</summary>
              <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}><code>{codeExamples.valtioOptimization}</code></pre>
            </details>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>Redux Optimization</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li><strong>Memoized Selectors:</strong> Use reselect or createSelector</li>
              <li><strong>Normalized State:</strong> Flat state structure</li>
              <li><strong>Shallow Equality:</strong> For object selections</li>
              <li><strong>RTK Query:</strong> Built-in caching and optimization</li>
            </ul>
            
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#4ade80' }}>View Code Example</summary>
              <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}><code>{codeExamples.reduxOptimization}</code></pre>
            </details>
          </div>
        </div>
      </section>

      {/* Optimization Checklist */}
      <section className="card">
        <h2>Performance Optimization Checklist</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>General Best Practices</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>Use React.memo for expensive components</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>Implement useCallback for event handlers</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>Use useMemo for expensive calculations</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Profile with React DevTools Profiler</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Monitor bundle size with webpack-bundle-analyzer</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Implement code splitting for large apps</span>
              </label>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>State-Specific Optimizations</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>Use selective subscriptions (selectors/atoms)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>Avoid storing derived data in state</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Implement proper error boundaries</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Use Suspense for async operations (where supported)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Implement virtualization for large lists</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                <span>Use debouncing for rapid state updates</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px' }}>
          <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Performance Measurement Tips</h4>
          <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
            <li><strong>React DevTools Profiler:</strong> Measure component render times and re-render frequency</li>
            <li><strong>Chrome DevTools Performance:</strong> Analyze JavaScript execution and memory usage</li>
            <li><strong>Lighthouse:</strong> Overall performance metrics including bundle size impact</li>
            <li><strong>Bundle Analyzers:</strong> Identify large dependencies and optimization opportunities</li>
            <li><strong>Real User Monitoring:</strong> Track performance in production with real users</li>
          </ul>
        </div>
      </section>

      {/* Memory Usage Analysis */}
      <section className="card">
        <h2>Memory Usage & Garbage Collection</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h4>Memory Efficiency</h4>
            <div style={{ fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                <span>Jotai:</span>
                <span style={{ color: '#4ade80' }}>Most Efficient</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                <span>Zustand:</span>
                <span style={{ color: '#4ade80' }}>Very Good</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                <span>Valtio:</span>
                <span style={{ color: '#f59e0b' }}>Good</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                <span>Redux:</span>
                <span style={{ color: '#f59e0b' }}>Moderate</span>
              </div>
            </div>
          </div>

          <div className="demo-section" style={{ margin: 0 }}>
            <h4>Garbage Collection</h4>
            <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
              <li>Jotai: Automatic cleanup of unused atoms</li>
              <li>Zustand: Manual store cleanup if needed</li>
              <li>Valtio: Proxy cleanup on component unmount</li>
              <li>Redux: Manual selector optimization needed</li>
            </ul>
          </div>

          <div className="demo-section" style={{ margin: 0 }}>
            <h4>Memory Leaks Prevention</h4>
            <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
              <li>Unsubscribe from manual subscriptions</li>
              <li>Clean up effect dependencies</li>
              <li>Avoid storing large objects unnecessarily</li>
              <li>Use weak references where appropriate</li>
            </ul>
          </div>

          <div className="demo-section" style={{ margin: 0 }}>
            <h4>Monitoring Tools</h4>
            <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem', color: '#a8bdb2' }}>
              <li>Chrome DevTools Memory tab</li>
              <li>React DevTools Profiler</li>
              <li>Performance.measureUserAgentSpecificMemory()</li>
              <li>Custom memory tracking hooks</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="card">
        <h2>Performance Recommendations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#4ade80' }}>Small Applications (&lt; 10 components)</h3>
            <div style={{ padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px', marginTop: '1rem' }}>
              <div><strong>Recommended:</strong> Zustand or Jotai</div>
              <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
                Both offer excellent performance with minimal overhead. Choose based on API preference.
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>Medium Applications (10-50 components)</h3>
            <div style={{ padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px', marginTop: '1rem' }}>
              <div><strong>Recommended:</strong> Jotai or Zustand</div>
              <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
                Jotai's atomic approach scales well. Zustand with proper selectors also performs excellently.
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>Large Applications (&gt; 50 components)</h3>
            <div style={{ padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px', marginTop: '1rem' }}>
              <div><strong>Recommended:</strong> Jotai or Redux Toolkit</div>
              <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
                Jotai's fine-grained reactivity shines. Redux Toolkit provides structure and tooling for complexity.
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#4ade80' }}>High-Frequency Updates</h3>
            <div style={{ padding: '1rem', background: 'rgba(26, 93, 58, 0.1)', borderRadius: '4px', marginTop: '1rem' }}>
              <div><strong>Recommended:</strong> Jotai or Valtio</div>
              <div style={{ fontSize: '0.9rem', color: '#a8bdb2', marginTop: '0.5rem' }}>
                Automatic optimization handles rapid updates efficiently without manual optimization.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Key Takeaways</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div>
              <strong>Bundle Size:</strong>
              <div style={{ color: '#a8bdb2', fontSize: '0.9rem' }}>
                Modern libraries are 4-5x smaller than Redux, significantly improving load times.
              </div>
            </div>
            <div>
              <strong>Runtime Performance:</strong>
              <div style={{ color: '#a8bdb2', fontSize: '0.9rem' }}>
                All modern libraries offer excellent runtime performance with different optimization strategies.
              </div>
            </div>
            <div>
              <strong>Developer Experience:</strong>
              <div style={{ color: '#a8bdb2', fontSize: '0.9rem' }}>
                Automatic optimizations in Jotai and Valtio reduce the need for manual performance tuning.
              </div>
            </div>
            <div>
              <strong>Scalability:</strong>
              <div style={{ color: '#a8bdb2', fontSize: '0.9rem' }}>
                Choose based on team size, app complexity, and performance requirements rather than just bundle size.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerformanceComparison;