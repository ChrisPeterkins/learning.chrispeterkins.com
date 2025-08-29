import React from 'react';
import { useAtom } from 'jotai';
import { useSnapshot } from 'valtio';
import { counterAtom as countAtom, counterControlsAtom } from '../stores/jotaiStore';
import { counterStore } from '../stores/valtioStore';
import { useCounterStore } from '../stores/zustandStore';

const CounterExample: React.FC = () => {
  return (
    <div className="counter-examples">
      <h2>Counter Examples</h2>
      <p>Compare how different state management libraries handle a simple counter</p>
      
      <div className="examples-grid">
        <ZustandCounter />
        <JotaiCounter />
        <ValtioCounter />
      </div>

      <div className="code-comparison">
        <h3>Code Comparison</h3>
        <div className="code-tabs">
          <div className="code-section">
            <h4>Zustand</h4>
            <pre><code>{`// Store Definition
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Component Usage
const Counter = () => {
  const { count, increment, decrement, reset } = useCounterStore();
  
  return (
    <div>
      <h3>Count: {count}</h3>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};`}</code></pre>
          </div>

          <div className="code-section">
            <h4>Jotai</h4>
            <pre><code>{`// Atoms Definition
const countAtom = atom(0);
const incrementAtom = atom(null, (get, set) => 
  set(countAtom, get(countAtom) + 1)
);
const decrementAtom = atom(null, (get, set) => 
  set(countAtom, get(countAtom) - 1)
);

// Component Usage
const Counter = () => {
  const [count] = useAtom(countAtom);
  const [, increment] = useAtom(incrementAtom);
  const [, decrement] = useAtom(decrementAtom);
  
  return (
    <div>
      <h3>Count: {count}</h3>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};`}</code></pre>
          </div>

          <div className="code-section">
            <h4>Valtio</h4>
            <pre><code>{`// Store Definition
const counterStore = proxy({
  count: 0,
  increment() {
    this.count++;
  },
  decrement() {
    this.count--;
  },
  reset() {
    this.count = 0;
  },
});

// Component Usage
const Counter = () => {
  const snap = useSnapshot(counterStore);
  
  return (
    <div>
      <h3>Count: {snap.count}</h3>
      <button onClick={counterStore.increment}>+</button>
      <button onClick={counterStore.decrement}>-</button>
      <button onClick={counterStore.reset}>Reset</button>
    </div>
  );
};`}</code></pre>
          </div>
        </div>
      </div>

      <style jsx>{`
        .counter-examples {
          padding: 2rem 0;
        }

        .counter-examples h2 {
          color: #f0f4f2;
          font-size: 2rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .counter-examples p {
          color: #a8bdb2;
          text-align: center;
          margin-bottom: 3rem;
          font-size: 1.1rem;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .code-comparison {
          background: rgba(15, 25, 20, 0.6);
          border: 1px solid rgba(74, 222, 128, 0.1);
          border-radius: 16px;
          padding: 2rem;
        }

        .code-comparison h3 {
          color: #f0f4f2;
          margin-bottom: 2rem;
          text-align: center;
        }

        .code-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .code-section {
          background: rgba(10, 15, 13, 0.8);
          border: 1px solid rgba(74, 222, 128, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .code-section h4 {
          color: #4ade80;
          margin: 0 0 1rem;
          font-size: 1.2rem;
          text-align: center;
        }

        .code-section pre {
          margin: 0;
          overflow-x: auto;
          font-size: 0.9rem;
        }

        .code-section code {
          color: #f0f4f2;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .examples-grid {
            grid-template-columns: 1fr;
          }
          
          .code-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Zustand Counter Component
const ZustandCounter: React.FC = () => {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="counter-card">
      <div className="counter-header">
        <div className="library-badge zustand">Zustand</div>
        <div className="counter-display">{count}</div>
      </div>
      <div className="counter-controls">
        <button className="counter-btn decrement" onClick={decrement}>-</button>
        <button className="counter-btn reset" onClick={reset}>Reset</button>
        <button className="counter-btn increment" onClick={increment}>+</button>
      </div>
      <div className="counter-features">
        <span className="feature">Global Store</span>
        <span className="feature">Persistence</span>
        <span className="feature">DevTools</span>
      </div>

      <style jsx>{`
        .counter-card {
          background: rgba(15, 25, 20, 0.8);
          border: 1px solid rgba(74, 222, 128, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .counter-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.05), transparent);
          transition: left 0.6s ease;
        }

        .counter-card:hover {
          border-color: rgba(74, 222, 128, 0.3);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(74, 222, 128, 0.1);
        }

        .counter-card:hover::before {
          left: 100%;
        }

        .counter-header {
          margin-bottom: 2rem;
        }

        .library-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .library-badge.zustand {
          background: rgba(139, 69, 19, 0.3);
          color: #deb887;
          border: 1px solid rgba(139, 69, 19, 0.5);
        }

        .counter-display {
          font-size: 3rem;
          font-weight: 800;
          color: #f0f4f2;
          margin: 1rem 0;
          text-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
        }

        .counter-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .counter-btn {
          background: rgba(26, 93, 58, 0.3);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ade80;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 80px;
        }

        .counter-btn:hover {
          background: rgba(26, 93, 58, 0.5);
          border-color: #4ade80;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(74, 222, 128, 0.2);
        }

        .counter-btn.increment:hover {
          background: rgba(34, 197, 94, 0.3);
        }

        .counter-btn.decrement:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
          color: #f87171;
        }

        .counter-features {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .feature {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          color: #4ade80;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// Jotai Counter Component
const JotaiCounter: React.FC = () => {
  const [count] = useAtom(countAtom);
  const [, { increment, decrement, reset }] = useAtom(counterControlsAtom);

  return (
    <div className="counter-card">
      <div className="counter-header">
        <div className="library-badge jotai">Jotai</div>
        <div className="counter-display">{count}</div>
      </div>
      <div className="counter-controls">
        <button className="counter-btn decrement" onClick={decrement}>-</button>
        <button className="counter-btn reset" onClick={reset}>Reset</button>
        <button className="counter-btn increment" onClick={increment}>+</button>
      </div>
      <div className="counter-features">
        <span className="feature">Atomic</span>
        <span className="feature">Bottom-up</span>
        <span className="feature">Minimal</span>
      </div>

      <style jsx>{`
        .library-badge.jotai {
          background: rgba(75, 0, 130, 0.3);
          color: #dda0dd;
          border: 1px solid rgba(75, 0, 130, 0.5);
        }
      `}</style>
    </div>
  );
};

// Valtio Counter Component
const ValtioCounter: React.FC = () => {
  const snap = useSnapshot(counterStore);

  return (
    <div className="counter-card">
      <div className="counter-header">
        <div className="library-badge valtio">Valtio</div>
        <div className="counter-display">{snap.count}</div>
      </div>
      <div className="counter-controls">
        <button className="counter-btn decrement" onClick={counterStore.decrement}>-</button>
        <button className="counter-btn reset" onClick={counterStore.reset}>Reset</button>
        <button className="counter-btn increment" onClick={counterStore.increment}>+</button>
      </div>
      <div className="counter-features">
        <span className="feature">Proxy-based</span>
        <span className="feature">Mutable API</span>
        <span className="feature">Natural</span>
      </div>

      <style jsx>{`
        .library-badge.valtio {
          background: rgba(255, 99, 71, 0.3);
          color: #ffa07a;
          border: 1px solid rgba(255, 99, 71, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CounterExample;