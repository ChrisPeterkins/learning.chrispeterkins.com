import React, { useState, useEffect, useRef } from 'react';

interface HeapSnapshot {
  size: number;
  objects: number;
  timestamp: string;
}

interface MemoryLeak {
  name: string;
  size: string;
  count: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

const MemoryPage: React.FC = () => {
  const [heapSize, setHeapSize] = useState(10.5);
  const [snapshots, setSnapshots] = useState<HeapSnapshot[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [leakSimulation, setLeakSimulation] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const memoryLeaks: MemoryLeak[] = [
    {
      name: 'Event Listeners',
      size: '2.3 MB',
      count: 1247,
      trend: 'increasing'
    },
    {
      name: 'DOM References',
      size: '890 KB',
      count: 324,
      trend: 'increasing'
    },
    {
      name: 'Timers/Intervals',
      size: '156 KB',
      count: 23,
      trend: 'stable'
    },
    {
      name: 'Closures',
      size: '3.1 MB',
      count: 567,
      trend: 'increasing'
    }
  ];

  const startMonitoring = () => {
    setIsMonitoring(true);
    setSnapshots([]);

    intervalRef.current = setInterval(() => {
      const newSize = heapSize + (Math.random() - 0.3) * 2;
      setHeapSize(Math.max(5, newSize));
      
      setSnapshots(prev => [...prev.slice(-19), {
        size: newSize,
        objects: Math.floor(50000 + Math.random() * 20000),
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 500);

    setTimeout(() => {
      setIsMonitoring(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 10000);
  };

  const simulateLeak = () => {
    const newLeaks = [];
    for (let i = 0; i < 1000; i++) {
      newLeaks.push({
        id: i,
        data: new Array(1000).fill(Math.random()),
        element: document.createElement('div')
      });
    }
    setLeakSimulation(prev => [...prev, ...newLeaks]);
    setHeapSize(prev => prev + 1.5);
  };

  const fixLeaks = () => {
    setLeakSimulation([]);
    setHeapSize(prev => Math.max(5, prev - 3));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'var(--error-red)';
      case 'decreasing': return 'var(--accent-green-bright)';
      default: return 'var(--warning-yellow)';
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Memory Management</h1>
        <p className="page-description">
          Track memory usage, identify leaks, and analyze heap snapshots to ensure
          your application uses resources efficiently. Learn garbage collection and memory optimization.
        </p>
      </header>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{heapSize.toFixed(1)} MB</div>
          <div className="metric-label">Heap Size</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{leakSimulation.length}</div>
          <div className="metric-label">Potential Leaks</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {snapshots.length > 0 ? snapshots[snapshots.length - 1].objects.toLocaleString() : '0'}
          </div>
          <div className="metric-label">Objects</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {snapshots.filter((s, i) => i > 0 && s.size > snapshots[i-1].size).length}
          </div>
          <div className="metric-label">Growing Snapshots</div>
        </div>
      </section>

      <section className="demo-container">
        <h2>Memory Profiler</h2>
        <div className="demo-controls">
          <button 
            className={`demo-button ${isMonitoring ? 'active' : ''}`}
            onClick={startMonitoring}
            disabled={isMonitoring}
          >
            {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
          </button>
          <button 
            className="demo-button" 
            onClick={() => setSnapshots([])}
          >
            Clear Timeline
          </button>
          <button 
            className="demo-button" 
            onClick={simulateLeak}
          >
            Simulate Leak
          </button>
          <button 
            className="demo-button" 
            onClick={fixLeaks}
            style={{ background: 'var(--accent-green)', color: 'var(--text-primary)' }}
          >
            Fix Leaks
          </button>
        </div>

        <div style={{ 
          background: 'var(--code-bg)', 
          border: '1px solid var(--code-border)',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Heap Timeline
          </h4>
          <div style={{ 
            height: '150px', 
            display: 'flex',
            alignItems: 'end',
            gap: '2px',
            padding: '10px'
          }}>
            {snapshots.map((snapshot, index) => {
              const maxSize = Math.max(...snapshots.map(s => s.size), 20);
              const height = (snapshot.size / maxSize) * 130;
              
              return (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: `${height}px`,
                    background: snapshot.size > (snapshots[index-1]?.size || 0) 
                      ? 'var(--error-red)' 
                      : 'var(--accent-green-bright)',
                    opacity: 0.8,
                    transition: 'all 0.3s'
                  }}
                  title={`${snapshot.timestamp}: ${snapshot.size.toFixed(1)} MB`}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="demo-container">
        <h2>Memory Leak Detection</h2>
        <div className="network-timeline">
          <div className="network-request" style={{ fontWeight: 'bold', borderBottom: '2px solid var(--border-primary)' }}>
            <div>Leak Type</div>
            <div>Size</div>
            <div>Count</div>
            <div>Trend</div>
            <div>Status</div>
          </div>
          {memoryLeaks.map((leak, index) => (
            <div key={index} className="network-request">
              <div style={{ 
                color: 'var(--accent-green-bright)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {leak.name}
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                {leak.size}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {leak.count.toLocaleString()}
              </div>
              <div style={{ color: getTrendColor(leak.trend) }}>
                {getTrendIcon(leak.trend)} {leak.trend}
              </div>
              <div style={{ 
                color: leak.trend === 'increasing' ? 'var(--error-red)' : 'var(--accent-green-bright)'
              }}>
                {leak.trend === 'increasing' ? '⚠ Warning' : '✓ OK'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="code-container">
        <div className="code-header">
          <span className="code-title">Memory Management Patterns</span>
        </div>
        <div className="code-content">
          <pre>{`// Memory leak prevention
class Component {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    this.timerId = null;
  }
  
  componentDidMount() {
    // Add event listener
    window.addEventListener('resize', this.handleResize);
    
    // Set timer
    this.timerId = setInterval(this.updateData, 1000);
  }
  
  componentWillUnmount() {
    // Clean up event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Clear timers
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    
    // Clear DOM references
    this.element = null;
  }
}

// WeakMap for leak-safe object references
const weakMap = new WeakMap();
weakMap.set(object, data); // Garbage collected with object

// WeakSet for leak-safe collections
const observers = new WeakSet();
observers.add(observer); // Automatically cleaned up

// Manual memory management
function processLargeData(data) {
  const result = heavyComputation(data);
  
  // Clear references when done
  data = null;
  
  return result;
}

// Memory profiling
console.log('Memory usage:', performance.memory);

// Force garbage collection (DevTools only)
if (window.gc) {
  window.gc();
}`}</pre>
        </div>
      </section>

      <section className="concept-grid">
        <div className="info-card">
          <h3>Heap Snapshots</h3>
          <p>
            Capture and compare heap snapshots to identify memory leaks.
            Track object growth and find references keeping objects alive.
          </p>
        </div>

        <div className="info-card">
          <h3>Garbage Collection</h3>
          <p>
            Understand how V8's garbage collector works. Learn about generational
            collection, mark-and-sweep, and optimization techniques.
          </p>
        </div>

        <div className="info-card">
          <h3>Common Leak Sources</h3>
          <p>
            Identify typical memory leak patterns: DOM references, event listeners,
            timers, closures, and global variables that prevent cleanup.
          </p>
        </div>
      </section>
    </div>
  );
};

export default MemoryPage;