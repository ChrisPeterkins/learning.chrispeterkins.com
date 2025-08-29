import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="hero-title">Modern State Management</h1>
        <p className="hero-subtitle">
          Exploring the next generation of React state management solutions that prioritize
          developer experience, performance, and simplicity.
        </p>
      </div>

      {/* Introduction Section */}
      <section className="card">
        <h2>Why State Management Matters</h2>
        <p>
          As React applications grow in complexity, managing state becomes increasingly important. 
          The right state management solution can make your code more maintainable, performant, 
          and easier to debug.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🎯 Predictability</h3>
            <p>Clear data flow and immutable updates make state changes predictable and debuggable.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>⚡ Performance</h3>
            <p>Optimized re-renders and selective subscriptions keep your app fast as it scales.</p>
          </div>
          <div className="demo-section" style={{ margin: 0 }}>
            <h3>🔧 Developer Experience</h3>
            <p>Great tooling, TypeScript support, and minimal boilerplate improve productivity.</p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="card">
        <h2>Library Comparison</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Library</th>
                <th>Bundle Size</th>
                <th>Learning Curve</th>
                <th>DevTools</th>
                <th>TypeScript</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Zustand</strong></td>
                <td>~2.7KB</td>
                <td>Easy</td>
                <td>✅ Redux DevTools</td>
                <td>✅ Excellent</td>
                <td>Simple to medium apps</td>
              </tr>
              <tr>
                <td><strong>Jotai</strong></td>
                <td>~2.4KB</td>
                <td>Medium</td>
                <td>✅ React DevTools</td>
                <td>✅ Excellent</td>
                <td>Atomic, fine-grained updates</td>
              </tr>
              <tr>
                <td><strong>Valtio</strong></td>
                <td>~3.1KB</td>
                <td>Easy</td>
                <td>✅ Redux DevTools</td>
                <td>✅ Good</td>
                <td>Object-oriented state</td>
              </tr>
              <tr>
                <td><strong>Redux Toolkit</strong></td>
                <td>~12KB</td>
                <td>High</td>
                <td>✅ Redux DevTools</td>
                <td>✅ Excellent</td>
                <td>Large, complex applications</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="card">
        <h2>Feature Matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Zustand</th>
                <th>Jotai</th>
                <th>Valtio</th>
                <th>Redux Toolkit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Immutable Updates</td>
                <td>✅ With Immer</td>
                <td>✅ Built-in</td>
                <td>✅ Proxy-based</td>
                <td>✅ With Immer</td>
              </tr>
              <tr>
                <td>Async Support</td>
                <td>✅ Manual</td>
                <td>✅ Built-in</td>
                <td>✅ Manual</td>
                <td>✅ createAsyncThunk</td>
              </tr>
              <tr>
                <td>Computed Values</td>
                <td>✅ Selectors</td>
                <td>✅ Derived atoms</td>
                <td>✅ Derived state</td>
                <td>✅ Reselect</td>
              </tr>
              <tr>
                <td>Persistence</td>
                <td>✅ Middleware</td>
                <td>✅ atomWithStorage</td>
                <td>✅ Manual</td>
                <td>✅ redux-persist</td>
              </tr>
              <tr>
                <td>Time Travel</td>
                <td>✅ With DevTools</td>
                <td>❌</td>
                <td>✅ With DevTools</td>
                <td>✅ Built-in</td>
              </tr>
              <tr>
                <td>Code Splitting</td>
                <td>✅ Store slices</td>
                <td>✅ Atom families</td>
                <td>✅ Multiple stores</td>
                <td>✅ Feature slices</td>
              </tr>
              <tr>
                <td>SSR Support</td>
                <td>✅ Good</td>
                <td>✅ Excellent</td>
                <td>✅ Good</td>
                <td>✅ Excellent</td>
              </tr>
              <tr>
                <td>React Suspense</td>
                <td>❌</td>
                <td>✅ Built-in</td>
                <td>❌</td>
                <td>✅ RTK Query</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Demos Navigation */}
      <section className="card">
        <h2>Interactive Demos</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Explore each library with hands-on examples. See how they handle common patterns 
          like counters, todo lists, async data fetching, and form management.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <Link to="/zustand" className="demo-section" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Zustand Demo</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Simple, scalable state management with middleware support
            </p>
            <div style={{ fontSize: '0.8rem', color: '#a8bdb2' }}>
              • Counter with persistence<br/>
              • Todo list with Immer<br/>
              • Async user fetching<br/>
              • Redux DevTools integration
            </div>
          </Link>

          <Link to="/jotai" className="demo-section" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Jotai Demo</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Atomic approach with fine-grained reactivity
            </p>
            <div style={{ fontSize: '0.8rem', color: '#a8bdb2' }}>
              • Primitive & derived atoms<br/>
              • Async atoms with Suspense<br/>
              • Form state management<br/>
              • Shopping cart example
            </div>
          </Link>

          <Link to="/valtio" className="demo-section" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Valtio Demo</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Proxy-based state with mutable-style updates
            </p>
            <div style={{ fontSize: '0.8rem', color: '#a8bdb2' }}>
              • Nested object updates<br/>
              • Computed derived state<br/>
              • Form validation<br/>
              • Subscription examples
            </div>
          </Link>

          <Link to="/redux-comparison" className="demo-section" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Redux Comparison</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Side-by-side comparison with modern alternatives
            </p>
            <div style={{ fontSize: '0.8rem', color: '#a8bdb2' }}>
              • Migration strategies<br/>
              • Code comparisons<br/>
              • When to use Redux<br/>
              • RTK Query examples
            </div>
          </Link>

          <Link to="/atomic-state" className="demo-section" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Atomic State Patterns</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Understanding atomic state management
            </p>
            <div style={{ fontSize: '0.8rem', color: '#a8bdb2' }}>
              • Bottom-up composition<br/>
              • Automatic dependency tracking<br/>
              • Implementation patterns<br/>
              • Best practices
            </div>
          </Link>

          <Link to="/performance" className="demo-section" style={{ textDecoration: 'none', color: 'inherit', margin: 0 }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Performance Analysis</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Bundle size, re-renders, and optimization
            </p>
            <div style={{ fontSize: '0.8rem', color: '#a8bdb2' }}>
              • Bundle size comparison<br/>
              • Re-render optimization<br/>
              • Memory usage analysis<br/>
              • Benchmark results
            </div>
          </Link>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="card">
        <h2>Quick Start Guide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <div>
            <h3>1. Choose Your Approach</h3>
            <p>Consider your app size, team experience, and specific requirements.</p>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Small apps: Start with Zustand or Jotai</li>
              <li>Atomic updates: Use Jotai</li>
              <li>Object-oriented: Try Valtio</li>
              <li>Enterprise scale: Consider Redux Toolkit</li>
            </ul>
          </div>
          <div>
            <h3>2. Start Simple</h3>
            <p>Begin with basic state needs and add complexity as required.</p>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Counter and form state first</li>
              <li>Add async data fetching</li>
              <li>Introduce persistence if needed</li>
              <li>Add DevTools for debugging</li>
            </ul>
          </div>
          <div>
            <h3>3. Optimize Later</h3>
            <p>Focus on functionality first, then optimize for performance.</p>
            <ul style={{ paddingLeft: '1.2rem', color: '#a8bdb2' }}>
              <li>Use selectors to prevent re-renders</li>
              <li>Split state by feature</li>
              <li>Add memoization where needed</li>
              <li>Monitor with React DevTools</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="card">
        <h2>Learning Resources</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Official Docs</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="https://docs.pmnd.rs/zustand/getting-started/introduction" style={{ color: '#a8bdb2', textDecoration: 'none' }}>• Zustand</a></li>
              <li><a href="https://jotai.org/" style={{ color: '#a8bdb2', textDecoration: 'none' }}>• Jotai</a></li>
              <li><a href="https://valtio.pmnd.rs/" style={{ color: '#a8bdb2', textDecoration: 'none' }}>• Valtio</a></li>
              <li><a href="https://redux-toolkit.js.org/" style={{ color: '#a8bdb2', textDecoration: 'none' }}>• Redux Toolkit</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Community</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ color: '#a8bdb2' }}>• Discord communities</li>
              <li style={{ color: '#a8bdb2' }}>• GitHub discussions</li>
              <li style={{ color: '#a8bdb2' }}>• Stack Overflow</li>
              <li style={{ color: '#a8bdb2' }}>• Twitter/X hashtags</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Tools</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ color: '#a8bdb2' }}>• React DevTools</li>
              <li style={{ color: '#a8bdb2' }}>• Redux DevTools</li>
              <li style={{ color: '#a8bdb2' }}>• Bundle analyzers</li>
              <li style={{ color: '#a8bdb2' }}>• Performance profilers</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="cta-section">
        <h3>Ready to explore?</h3>
        <p>
          Start with any demo above to see these libraries in action. Each example includes 
          interactive components, code snippets, and explanations.
        </p>
        <Link to="/zustand" className="cta-button">
          Start with Zustand Demo →
        </Link>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
          padding: 4rem 2rem;
          background: 
            radial-gradient(circle at 30% 20%, rgba(74, 222, 128, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(26, 93, 58, 0.08) 0%, transparent 50%);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            conic-gradient(from 0deg at 50% 50%, transparent, rgba(74, 222, 128, 0.03), transparent);
          animation: rotate 20s linear infinite;
          pointer-events: none;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 0 1.5rem;
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #1a5d3a 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(74, 222, 128, 0.3);
          position: relative;
          z-index: 1;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: #a8bdb2;
          margin: 0;
          font-weight: 300;
          line-height: 1.7;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .card {
          background: rgba(15, 25, 20, 0.6);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(74, 222, 128, 0.1);
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.05), transparent);
          transition: left 0.8s ease;
        }

        .card:hover {
          border-color: rgba(74, 222, 128, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(74, 222, 128, 0.1);
        }

        .card:hover::before {
          left: 100%;
        }

        .card h2 {
          color: #f0f4f2;
          font-size: 2rem;
          margin: 0 0 1.5rem;
          font-weight: 600;
        }

        .card h3 {
          color: #f0f4f2;
          font-size: 1.3rem;
          margin: 0 0 1rem;
          font-weight: 600;
        }

        .card h4 {
          color: #4ade80;
          font-size: 1.1rem;
          margin: 0 0 0.5rem;
          font-weight: 600;
        }

        .card p {
          color: #a8bdb2;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .comparison-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: rgba(10, 15, 13, 0.8);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(74, 222, 128, 0.1);
        }

        .comparison-table th {
          background: rgba(26, 93, 58, 0.3);
          color: #f0f4f2;
          padding: 1rem;
          font-weight: 600;
          text-align: left;
          border-bottom: 1px solid rgba(74, 222, 128, 0.2);
        }

        .comparison-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(74, 222, 128, 0.05);
          color: #a8bdb2;
        }

        .comparison-table tbody tr:hover {
          background: rgba(26, 93, 58, 0.05);
        }

        .comparison-table strong {
          color: #4ade80;
        }

        .demo-section {
          background: rgba(10, 15, 13, 0.6);
          border: 1px solid rgba(74, 222, 128, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .demo-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.03), transparent);
          transition: left 0.6s ease;
        }

        .demo-section:hover {
          border-color: rgba(74, 222, 128, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(74, 222, 128, 0.08);
        }

        .demo-section:hover::before {
          left: 100%;
        }

        .demo-section h3 {
          color: #4ade80;
          font-size: 1.2rem;
          margin: 0 0 1rem;
        }

        .demo-section p {
          color: #a8bdb2;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .demo-section ul {
          padding-left: 1.2rem;
          color: #8fa99b;
          font-size: 0.9rem;
        }

        .demo-section a {
          color: inherit;
          text-decoration: none;
        }

        .cta-section {
          text-align: center;
          margin-top: 3rem;
          padding: 3rem 2rem;
          background: rgba(26, 93, 58, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 16px;
        }

        .cta-section h3 {
          color: #f0f4f2;
          font-size: 1.8rem;
          margin: 0 0 1rem;
          font-weight: 600;
        }

        .cta-section p {
          color: #a8bdb2;
          font-size: 1.1rem;
          margin: 0 0 2rem;
          line-height: 1.6;
        }

        .cta-button {
          display: inline-block;
          background: rgba(26, 93, 58, 0.3);
          border: 1px solid #4ade80;
          color: #4ade80;
          padding: 1rem 2.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .cta-button:hover {
          background: rgba(26, 93, 58, 0.4);
          border-color: #22c55e;
          color: #22c55e;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(74, 222, 128, 0.2);
        }

        .cta-button:hover::before {
          left: 100%;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .hero-section {
            padding: 3rem 1rem;
            margin-bottom: 2rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .card {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .card h2 {
            font-size: 1.5rem;
          }

          .comparison-table {
            font-size: 0.9rem;
          }

          .comparison-table th,
          .comparison-table td {
            padding: 0.75rem 0.5rem;
          }

          .demo-section {
            padding: 1.25rem;
          }

          .cta-section {
            padding: 2rem 1rem;
          }

          .cta-section h3 {
            font-size: 1.5rem;
          }

          .cta-button {
            padding: 0.875rem 2rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;