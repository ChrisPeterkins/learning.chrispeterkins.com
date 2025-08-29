import React from 'react'

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Node.js Deep Dive</h1>
        <p className="page-description">
          Master the internals of Node.js, from the event loop to advanced patterns for building 
          scalable backend applications. Explore real-world examples and interactive visualizations.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>What You'll Learn</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Event Loop Mastery</h3>
            <p>
              Understand how Node.js handles asynchronous operations, the phases of the event loop, 
              and how to optimize your code for performance.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Stream Processing</h3>
            <p>
              Master Node.js streams for efficient data processing. Learn about readable, writable, 
              transform, and duplex streams.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Worker Threads</h3>
            <p>
              Leverage worker threads for CPU-intensive tasks without blocking the main event loop. 
              Build truly parallel applications.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Async Patterns</h3>
            <p>
              From callbacks to promises to async/await, master every asynchronous pattern and know 
              when to use each one.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Buffer Management</h3>
            <p>
              Work with binary data efficiently using Buffers. Understand memory allocation and 
              optimization techniques.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Clustering & Scaling</h3>
            <p>
              Scale your Node.js applications across multiple CPU cores using the cluster module 
              and load balancing strategies.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Key Features</h2>
        
        <div className="demo-container">
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-green-bright)' }}>
            Interactive Examples
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Each concept includes live code examples that you can run and modify to see the effects in real-time.
          </p>
          
          <div className="code-container">
            <div className="code-header">
              <span className="code-title">Quick Example: Event Emitters</span>
            </div>
            <div className="code-content">
              <pre>{`const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.on('event', (data) => {
  console.log('An event occurred!', data);
});

myEmitter.emit('event', { message: 'Hello Node.js!' });`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Learning Path</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderLeft: '3px solid var(--accent-green-bright)'
        }}>
          <ol style={{ 
            listStyle: 'none', 
            counterReset: 'step-counter',
            padding: 0 
          }}>
            {[
              'Start with the Event Loop to understand Node.js fundamentals',
              'Learn Async Patterns for handling asynchronous operations',
              'Master Streams for efficient data processing',
              'Explore Buffers for binary data manipulation',
              'Implement Worker Threads for parallel processing',
              'Scale with Clustering for production applications',
              'Optimize Performance with profiling and best practices'
            ].map((step, index) => (
              <li key={index} style={{ 
                counterIncrement: 'step-counter',
                position: 'relative',
                paddingLeft: '3rem',
                marginBottom: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '2rem',
                  height: '2rem',
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}

export default HomePage