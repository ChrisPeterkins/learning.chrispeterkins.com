import React from 'react'

const PerformancePage: React.FC = () => {
  return (
    <div className="performance-page">
      <header className="page-header">
        <h1>Performance Optimization</h1>
        <p className="page-description">
          Profile, monitor, and optimize Node.js applications. Learn debugging techniques, 
          memory management, and best practices for production performance.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Profiling Tools</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Built-in Profiler</span>
          </div>
          <div className="code-content">
            <pre>{`// Start application with profiler
node --prof app.js

// Process the generated log
node --prof-process isolate-*.log > processed.txt

// CPU profiling with inspector
node --inspect app.js
// Open chrome://inspect in Chrome

// Heap snapshots
const v8 = require('v8');
v8.writeHeapSnapshot('heap.heapsnapshot');

// Performance hooks
const { performance, PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(\`\${entry.name}: \${entry.duration}ms\`);
  });
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('start');
// ... code to measure ...
performance.mark('end');
performance.measure('My operation', 'start', 'end');`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Memory Management</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Memory Leak Detection</span>
          </div>
          <div className="code-content">
            <pre>{`// Monitor memory usage
const used = process.memoryUsage();
console.log({
  rss: \`\${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB\`,
  heapTotal: \`\${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB\`,
  heapUsed: \`\${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB\`,
  external: \`\${Math.round(used.external / 1024 / 1024 * 100) / 100} MB\`,
});

// Detect memory leaks with heap diff
let baseline = process.memoryUsage().heapUsed;

setInterval(() => {
  const current = process.memoryUsage().heapUsed;
  const diff = current - baseline;
  
  if (diff > 10 * 1024 * 1024) { // 10MB increase
    console.warn('Possible memory leak detected');
  }
}, 10000);`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Optimization Techniques</span>
          </div>
          <div className="code-content">
            <pre>{`// 1. Cache expensive operations
const cache = new Map();
function expensiveOperation(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = /* expensive computation */;
  cache.set(key, result);
  return result;
}

// 2. Use streams for large data
// Bad: Loading entire file in memory
const data = fs.readFileSync('huge-file.json');

// Good: Stream processing
fs.createReadStream('huge-file.json')
  .pipe(transform)
  .pipe(fs.createWriteStream('output.json'));

// 3. Optimize loops
// Bad: Multiple iterations
const filtered = array.filter(x => x > 0);
const mapped = filtered.map(x => x * 2);

// Good: Single iteration
const result = array.reduce((acc, x) => {
  if (x > 0) acc.push(x * 2);
  return acc;
}, []);`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Best Practices</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Async All The Way</h3>
            <p>
              Never use sync methods in production. Use async I/O to keep the event loop 
              responsive. Offload CPU work to workers.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Connection Pooling</h3>
            <p>
              Reuse database and HTTP connections. Set appropriate pool sizes and timeouts. 
              Monitor connection metrics.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Caching Strategy</h3>
            <p>
              Implement multi-level caching: in-memory, Redis, CDN. Cache computed results 
              and database queries. Set appropriate TTLs.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Monitor Everything</h3>
            <p>
              Track response times, error rates, memory usage, CPU utilization. Use APM 
              tools like New Relic or DataDog.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Optimize Dependencies</h3>
            <p>
              Audit and minimize dependencies. Use production builds. Tree-shake unused code. 
              Keep dependencies updated.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>HTTP/2 & Compression</h3>
            <p>
              Enable HTTP/2 for multiplexing. Use gzip/brotli compression. Implement 
              proper caching headers. Minimize payload sizes.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PerformancePage