import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  status: 'good' | 'warning' | 'poor';
}

const PerformancePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [cpuUsage, setCpuUsage] = useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number[]>([]);
  const [flameData, setFlameData] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const metrics: PerformanceMetric[] = [
    {
      name: 'First Contentful Paint',
      value: 1.2,
      unit: 's',
      description: 'Time until first content is painted',
      status: 'good'
    },
    {
      name: 'Largest Contentful Paint',
      value: 2.8,
      unit: 's',
      description: 'Time until largest content element is painted',
      status: 'warning'
    },
    {
      name: 'Cumulative Layout Shift',
      value: 0.12,
      unit: '',
      description: 'Amount of unexpected layout shift',
      status: 'poor'
    },
    {
      name: 'Total Blocking Time',
      value: 150,
      unit: 'ms',
      description: 'Time main thread was blocked',
      status: 'warning'
    },
    {
      name: 'Speed Index',
      value: 3.1,
      unit: 's',
      description: 'How quickly content is visually populated',
      status: 'poor'
    },
    {
      name: 'Time to Interactive',
      value: 4.2,
      unit: 's',
      description: 'Time until page is fully interactive',
      status: 'poor'
    }
  ];

  const startProfiling = () => {
    setIsRecording(true);
    setCpuUsage([]);
    setMemoryUsage([]);
    setFlameData([]);

    intervalRef.current = setInterval(() => {
      setCpuUsage(prev => [...prev.slice(-49), Math.random() * 100]);
      setMemoryUsage(prev => [...prev.slice(-49), 20 + Math.random() * 30]);
    }, 100);

    setTimeout(() => {
      setFlameData([
        { name: 'main()', duration: 1000, start: 0, level: 0 },
        { name: 'render()', duration: 600, start: 0, level: 1 },
        { name: 'Component.render()', duration: 400, start: 0, level: 2 },
        { name: 'setState()', duration: 200, start: 400, level: 2 },
        { name: 'updateDOM()', duration: 300, start: 600, level: 1 },
        { name: 'addEventListener()', duration: 100, start: 900, level: 1 }
      ]);
    }, 2000);

    setTimeout(() => {
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return 'var(--accent-green-bright)';
      case 'warning': return 'var(--warning-yellow)';
      case 'poor': return 'var(--error-red)';
      default: return 'var(--text-secondary)';
    }
  };

  const renderChart = (data: number[], color: string, label: string) => (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        {label} {data.length > 0 && `(${data[data.length - 1].toFixed(1)}${label.includes('CPU') ? '%' : 'MB'})`}
      </h4>
      <div style={{ 
        height: '100px', 
        background: 'var(--code-bg)', 
        border: '1px solid var(--code-border)',
        position: 'relative',
        display: 'flex',
        alignItems: 'end',
        padding: '5px'
      }}>
        {data.map((value, index) => (
          <div
            key={index}
            style={{
              width: '3px',
              height: `${value}%`,
              background: color,
              marginRight: '1px',
              opacity: 0.8
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderFlameGraph = () => (
    <div style={{ 
      background: 'var(--code-bg)', 
      border: '1px solid var(--code-border)',
      padding: '1rem',
      marginTop: '2rem'
    }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        Flame Chart (Call Stack)
      </h4>
      <div style={{ position: 'relative', height: '200px' }}>
        {flameData.map((item, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${(item.start / 1000) * 100}%`,
              width: `${(item.duration / 1000) * 100}%`,
              height: '25px',
              top: `${item.level * 30}px`,
              background: `hsl(${120 + item.level * 40}, 60%, 50%)`,
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '4px',
              fontSize: '0.8rem',
              color: 'white',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            title={`${item.name} - ${item.duration}ms`}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>Performance Profiling</h1>
        <p className="page-description">
          Profile JavaScript execution, identify bottlenecks, and optimize rendering performance.
          Learn to use flame charts, timeline analysis, and Core Web Vitals.
        </p>
      </header>

      <section className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div 
              className="metric-value" 
              style={{ color: getMetricColor(metric.status) }}
            >
              {metric.value}{metric.unit}
            </div>
            <div className="metric-label">{metric.name}</div>
            <p style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)', 
              marginTop: '0.5rem',
              textAlign: 'left'
            }}>
              {metric.description}
            </p>
          </div>
        ))}
      </section>

      <section className="demo-container">
        <h2>Performance Monitor</h2>
        <div className="demo-controls">
          <button 
            className={`demo-button ${isRecording ? 'active' : ''}`}
            onClick={startProfiling}
            disabled={isRecording}
          >
            {isRecording ? 'Recording...' : 'Start Profiling'}
          </button>
          <button 
            className="demo-button" 
            onClick={() => {
              setCpuUsage([]);
              setMemoryUsage([]);
              setFlameData([]);
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            {renderChart(cpuUsage, 'var(--error-red)', 'CPU Usage')}
          </div>
          <div>
            {renderChart(memoryUsage, 'var(--accent-green-bright)', 'Memory Usage')}
          </div>
        </div>

        {flameData.length > 0 && renderFlameGraph()}
      </section>

      <section className="code-container">
        <div className="code-header">
          <span className="code-title">Performance Measurement</span>
        </div>
        <div className="code-content">
          <pre>{`// Performance API
const start = performance.now();
// ... code to measure ...
const end = performance.now();
console.log(\`Execution time: \${end - start}ms\`);

// User Timing API
performance.mark('start-render');
// ... rendering code ...
performance.mark('end-render');
performance.measure('render-time', 'start-render', 'end-render');

const measures = performance.getEntriesByType('measure');
console.log(measures);

// Observer API for Core Web Vitals
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(entry.name, entry.value);
  });
}).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

// Memory Usage
if ('memory' in performance) {
  const memory = (performance as any).memory;
  console.log({
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit
  });
}

// Frame Rate Monitoring
let lastTime = performance.now();
let frameCount = 0;

function measureFPS() {
  const currentTime = performance.now();
  frameCount++;
  
  if (currentTime - lastTime >= 1000) {
    console.log(\`FPS: \${frameCount}\`);
    frameCount = 0;
    lastTime = currentTime;
  }
  
  requestAnimationFrame(measureFPS);
}`}</pre>
        </div>
      </section>

      <section className="concept-grid">
        <div className="info-card">
          <h3>Core Web Vitals</h3>
          <p>
            Measure LCP (loading), FID (interactivity), and CLS (visual stability).
            These metrics directly impact user experience and SEO rankings.
          </p>
        </div>

        <div className="info-card">
          <h3>Flame Charts</h3>
          <p>
            Visualize call stack over time. Identify hot paths, long-running functions,
            and optimization opportunities in your JavaScript execution.
          </p>
        </div>

        <div className="info-card">
          <h3>Paint Profiling</h3>
          <p>
            Monitor paint events and layer creation. Identify expensive repaints
            and optimize for smooth 60fps animations.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PerformancePage;