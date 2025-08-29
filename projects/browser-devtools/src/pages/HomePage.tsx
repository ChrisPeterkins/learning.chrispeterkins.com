import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Browser Developer Tools</h1>
        <p className="page-description">
          Master the essential tools for debugging, profiling, and optimizing web applications.
          Explore the powerful features built into modern browsers that help developers build better software.
        </p>
      </header>

      <section className="concept-grid">
        <Link to="/console" className="concept-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Console & Debugging</h3>
          <p>
            Master the JavaScript console for logging, debugging, and interactive development.
            Learn breakpoints, watch expressions, and debugging techniques.
          </p>
        </Link>

        <Link to="/elements" className="concept-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Elements & Styles</h3>
          <p>
            Inspect and modify the DOM in real-time. Edit CSS properties, test responsive
            designs, and understand how styles cascade.
          </p>
        </Link>

        <Link to="/network" className="concept-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Network Analysis</h3>
          <p>
            Monitor HTTP requests, analyze response times, and optimize loading performance.
            Understand waterfall charts and resource timing.
          </p>
        </Link>

        <Link to="/performance" className="concept-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Performance Profiling</h3>
          <p>
            Profile JavaScript execution, identify bottlenecks, and optimize rendering
            performance using flame charts and timeline analysis.
          </p>
        </Link>

        <Link to="/memory" className="concept-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Memory Management</h3>
          <p>
            Track memory usage, identify leaks, and analyze heap snapshots to ensure
            your application uses resources efficiently.
          </p>
        </Link>

        <Link to="/application" className="concept-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Application Storage</h3>
          <p>
            Inspect cookies, localStorage, IndexedDB, and cache storage. Manage
            service workers and progressive web app features.
          </p>
        </Link>
      </section>

      <section className="demo-container">
        <h2>Why Master DevTools?</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">60%</div>
            <div className="metric-label">Faster Debugging</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">2x</div>
            <div className="metric-label">Performance Gains</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">Real-time</div>
            <div className="metric-label">Code Testing</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">Zero</div>
            <div className="metric-label">Setup Required</div>
          </div>
        </div>
      </section>

      <section className="code-container">
        <div className="code-header">
          <span className="code-title">Quick Tips</span>
        </div>
        <div className="code-content">
          <pre>{`// Console shortcuts
$0                    // Currently selected element
$_                    // Result of last expression
$('selector')         // document.querySelector
$$('selector')        // document.querySelectorAll

// Console methods
console.time('label') // Start timer
console.table(data)   // Display tabular data
console.trace()       // Stack trace
console.group()       // Group messages

// Debugging
debugger;             // Breakpoint in code
console.assert()      // Conditional logging`}</pre>
        </div>
      </section>
    </div>
  );
};

export default HomePage;