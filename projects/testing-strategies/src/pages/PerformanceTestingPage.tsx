import React, { useState, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'poor';
}

const PerformanceTestingPage: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState('load-test');
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [progress, setProgress] = useState(0);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setMetrics([]);

    // Simulate performance test execution
    const testMetrics = getTestMetrics(selectedTest);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    // Simulate collecting metrics with some randomness
    const finalMetrics = testMetrics.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * metric.value * 0.3,
      status: Math.random() > 0.7 ? 'warning' as const : 
              Math.random() > 0.9 ? 'poor' as const : 'good' as const
    }));

    setMetrics(finalMetrics);
    setIsRunning(false);
  };

  const getTestMetrics = (testType: string): PerformanceMetric[] => {
    switch (testType) {
      case 'load-test':
        return [
          { name: 'Response Time', value: 245, unit: 'ms', threshold: 500, status: 'good' },
          { name: 'Requests per Second', value: 1250, unit: 'req/s', threshold: 1000, status: 'good' },
          { name: 'Error Rate', value: 0.2, unit: '%', threshold: 1, status: 'good' },
          { name: 'CPU Usage', value: 65, unit: '%', threshold: 80, status: 'good' },
          { name: 'Memory Usage', value: 520, unit: 'MB', threshold: 1024, status: 'good' },
          { name: 'Concurrent Users', value: 500, unit: 'users', threshold: 1000, status: 'good' }
        ];
      case 'stress-test':
        return [
          { name: 'Peak Response Time', value: 1200, unit: 'ms', threshold: 2000, status: 'good' },
          { name: 'Breaking Point', value: 2500, unit: 'users', threshold: 2000, status: 'good' },
          { name: 'Recovery Time', value: 15, unit: 's', threshold: 30, status: 'good' },
          { name: 'Memory Leak Rate', value: 2.1, unit: 'MB/min', threshold: 5, status: 'good' },
          { name: 'Error Threshold', value: 15, unit: '%', threshold: 20, status: 'good' }
        ];
      case 'spike-test':
        return [
          { name: 'Spike Response Time', value: 890, unit: 'ms', threshold: 1000, status: 'good' },
          { name: 'Recovery Time', value: 8, unit: 's', threshold: 10, status: 'good' },
          { name: 'System Stability', value: 95, unit: '%', threshold: 90, status: 'good' },
          { name: 'Resource Spike', value: 300, unit: '%', threshold: 400, status: 'good' }
        ];
      case 'endurance-test':
        return [
          { name: 'Memory Growth', value: 12, unit: 'MB/hour', threshold: 50, status: 'good' },
          { name: 'Performance Degradation', value: 3, unit: '%', threshold: 10, status: 'good' },
          { name: 'Connection Leaks', value: 0, unit: 'connections', threshold: 5, status: 'good' },
          { name: 'File Handle Leaks', value: 1, unit: 'handles', threshold: 10, status: 'good' },
          { name: 'Uptime', value: 99.8, unit: '%', threshold: 99, status: 'good' }
        ];
      default:
        return [];
    }
  };

  const getTestDescription = () => {
    switch (selectedTest) {
      case 'load-test':
        return 'Load testing verifies application behavior under expected load conditions. It measures response times, throughput, and resource utilization under normal operational capacity.';
      case 'stress-test':
        return 'Stress testing pushes the application beyond normal capacity to find the breaking point. It identifies how the system fails and recovers under extreme conditions.';
      case 'spike-test':
        return 'Spike testing validates application behavior under sudden load increases. It tests how quickly the system can scale up and handle unexpected traffic spikes.';
      case 'endurance-test':
        return 'Endurance testing runs the application under normal load for extended periods to identify memory leaks, resource degradation, and long-term stability issues.';
      default:
        return '';
    }
  };

  const getExampleCode = () => {
    switch (selectedTest) {
      case 'load-test':
        return `// Load Testing with Artillery
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 10
      name: "Cool down"

scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/users"
      - think: 1
      - post:
          url: "/api/users"
          json:
            name: "Test User"
            email: "test@example.com"
      - get:
          url: "/api/users/{{ id }}"

# Run with: artillery run artillery.yml

// Jest Performance Testing
describe('Performance Tests', () => {
  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: \`item-\${i}\` }));
    
    const start = performance.now();
    const result = processLargeDataset(largeDataset);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    expect(result).toHaveLength(10000);
  });

  it('should not leak memory', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Perform operation that might leak memory
    for (let i = 0; i < 1000; i++) {
      createAndDestroyComponent();
    }
    
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
  });
});`;

      case 'stress-test':
        return `// Stress Testing with K6
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp up to 100 users
    { duration: '10m', target: 200 },  // Stay at 200 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '10m', target: 500 },  // Stay at 500 users
    { duration: '5m', target: 1000 },  // Ramp up to 1000 users
    { duration: '10m', target: 1000 }, // Stay at 1000 users
    { duration: '5m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

export default function() {
  let response = http.get('http://localhost:3000/api/users');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}

// Node.js Stress Testing
const http = require('http');
const cluster = require('cluster');

if (cluster.isMaster) {
  const numCPUs = require('os').cpus().length;
  console.log(\`Master \${process.pid} is running\`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(\`Worker \${worker.process.pid} died\`);
  });
} else {
  // Worker processes
  const server = http.createServer((req, res) => {
    // CPU intensive operation
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
      count += Math.sqrt(i);
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      pid: process.pid, 
      result: count,
      memory: process.memoryUsage()
    }));
  });

  server.listen(3000);
  console.log(\`Worker \${process.pid} started\`);
}`;

      case 'spike-test':
        return `// Spike Testing Configuration
# Locust spike test (locustfile.py)
from locust import HttpUser, task, between
import random

class SpikeUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_users(self):
        self.client.get("/api/users")
    
    @task(1)
    def create_user(self):
        self.client.post("/api/users", json={
            "name": f"User {random.randint(1, 1000)}",
            "email": f"user{random.randint(1, 1000)}@example.com"
        })

# Run spike test:
# locust -f locustfile.py --host=http://localhost:3000 \\
#   --users=1000 --spawn-rate=100 --run-time=2m

// React Component Performance Testing
import { render, screen } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('Component Performance Under Load', () => {
  it('should render large lists efficiently', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ 
      id: i, 
      name: \`Item \${i}\` 
    }));

    const startTime = performance.now();
    render(<LargeList items={items} />);
    const renderTime = performance.now() - startTime;

    expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    expect(screen.getAllByText(/Item \\d+/)).toHaveLength(1000);
  });

  it('should handle rapid state updates', async () => {
    const { rerender } = render(<Counter initialValue={0} />);
    
    const startTime = performance.now();
    
    // Simulate rapid state updates
    for (let i = 0; i < 100; i++) {
      rerender(<Counter initialValue={i} />);
    }
    
    const updateTime = performance.now() - startTime;
    expect(updateTime).toBeLessThan(50); // Should update rapidly
  });
});

// Browser Performance API Testing
function measureWebVitals() {
  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    const firstInput = list.getEntries()[0];
    console.log('FID:', firstInput.processingStart - firstInput.startTime);
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let cumulativeScore = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cumulativeScore += entry.value;
      }
    }
    console.log('CLS:', cumulativeScore);
  }).observe({ entryTypes: ['layout-shift'] });
}`;

      case 'endurance-test':
        return `// Endurance Testing Setup
# Docker Compose for Long-Running Tests
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MEMORY_LIMIT=1024m
    deploy:
      resources:
        limits:
          memory: 1024M
          cpus: '1.0'
  
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"

// Long-Running Test Script
const http = require('http');
const fs = require('fs');

class EnduranceTest {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: 0,
      errors: 0,
      memorySnapshots: [],
      responseTimeHistory: []
    };
    this.isRunning = false;
  }

  async start(durationHours = 24) {
    console.log(\`Starting endurance test for \${durationHours} hours\`);
    this.isRunning = true;
    
    const endTime = Date.now() + (durationHours * 60 * 60 * 1000);
    
    // Memory monitoring
    const memoryInterval = setInterval(() => {
      const memory = process.memoryUsage();
      this.metrics.memorySnapshots.push({
        timestamp: Date.now(),
        ...memory
      });
      
      console.log(\`Memory Usage: RSS=\${Math.round(memory.rss / 1024 / 1024)}MB, Heap=\${Math.round(memory.heapUsed / 1024 / 1024)}MB\`);
    }, 60000); // Every minute

    // Load generation
    const loadInterval = setInterval(() => {
      if (Date.now() >= endTime) {
        clearInterval(loadInterval);
        clearInterval(memoryInterval);
        this.stop();
        return;
      }
      
      this.makeRequest();
    }, 1000); // 1 request per second
  }

  async makeRequest() {
    const startTime = Date.now();
    
    try {
      const response = await this.httpRequest('http://localhost:3000/api/health');
      this.metrics.requests++;
      this.metrics.responseTimeHistory.push(Date.now() - startTime);
      
      // Keep only last 1000 response times
      if (this.metrics.responseTimeHistory.length > 1000) {
        this.metrics.responseTimeHistory.shift();
      }
      
    } catch (error) {
      this.metrics.errors++;
      console.error('Request failed:', error.message);
    }
  }

  httpRequest(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  stop() {
    this.isRunning = false;
    const duration = Date.now() - this.startTime;
    
    console.log('Endurance Test Results:');
    console.log(\`Duration: \${Math.round(duration / 1000 / 60)} minutes\`);
    console.log(\`Total Requests: \${this.metrics.requests}\`);
    console.log(\`Errors: \${this.metrics.errors}\`);
    console.log(\`Error Rate: \${((this.metrics.errors / this.metrics.requests) * 100).toFixed(2)}%\`);
    
    // Memory analysis
    const initialMemory = this.metrics.memorySnapshots[0]?.heapUsed || 0;
    const finalMemory = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1]?.heapUsed || 0;
    const memoryGrowth = finalMemory - initialMemory;
    
    console.log(\`Memory Growth: \${Math.round(memoryGrowth / 1024 / 1024)}MB\`);
    
    // Save detailed results
    fs.writeFileSync('endurance-results.json', JSON.stringify(this.metrics, null, 2));
  }
}

// Run the test
const test = new EnduranceTest();
test.start(24); // 24-hour endurance test`;

      default:
        return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Performance Testing</h1>
        <p className="page-description">
          Performance testing evaluates application behavior under various load conditions. 
          Learn to measure response times, throughput, resource utilization, and identify 
          performance bottlenecks before they impact users.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Types of Performance Testing</h3>
          <p>
            <strong>Load testing</strong> validates normal capacity, <strong>stress testing</strong> finds breaking points, 
            <strong>spike testing</strong> handles sudden traffic increases, and <strong>endurance testing</strong> 
            identifies long-term stability issues and memory leaks.
          </p>
        </div>

        <div className="info-card">
          <h3>Key Metrics</h3>
          <p>
            Monitor response time, throughput (requests per second), resource utilization (CPU, memory), 
            error rates, and concurrent user capacity. These metrics help identify performance bottlenecks 
            and scalability limits.
          </p>
        </div>

        <div className="info-card">
          <h3>Performance Tools</h3>
          <p>
            Use tools like Artillery, K6, Locust for load testing, Chrome DevTools for frontend performance, 
            and APM tools like New Relic or DataDog for production monitoring and alerting.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Performance Testing Scenarios</h2>
        <p>Select a performance testing type to explore different approaches:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedTest === 'load-test' ? 'active' : ''}`}
            onClick={() => setSelectedTest('load-test')}
          >
            Load Testing
          </button>
          <button 
            className={`demo-button ${selectedTest === 'stress-test' ? 'active' : ''}`}
            onClick={() => setSelectedTest('stress-test')}
          >
            Stress Testing
          </button>
          <button 
            className={`demo-button ${selectedTest === 'spike-test' ? 'active' : ''}`}
            onClick={() => setSelectedTest('spike-test')}
          >
            Spike Testing
          </button>
          <button 
            className={`demo-button ${selectedTest === 'endurance-test' ? 'active' : ''}`}
            onClick={() => setSelectedTest('endurance-test')}
          >
            Endurance Testing
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.95rem' }}>
          {getTestDescription()}
        </p>
      </div>

      <div className="test-runner-container">
        <div className="test-runner-header">
          <span className="test-runner-title">Performance Test Simulator</span>
          <div className="test-runner-controls">
            <button 
              className="test-button primary"
              onClick={runPerformanceTest}
              disabled={isRunning}
            >
              {isRunning ? `Running... ${progress}%` : 'Run Performance Test'}
            </button>
          </div>
        </div>

        {isRunning && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--code-bg)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    background: 'var(--accent-green-bright)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '40px' }}>
                {progress}%
              </span>
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="metric-value" style={{ 
                  color: metric.status === 'good' ? 'var(--success-green)' : 
                         metric.status === 'warning' ? 'var(--warning-yellow)' : 'var(--error-red)'
                }}>
                  {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                  <span style={{ fontSize: '0.6em', marginLeft: '0.25rem' }}>
                    {metric.unit}
                  </span>
                </div>
                <div className="metric-label">{metric.name}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-muted)', 
                  marginTop: '0.5rem' 
                }}>
                  Threshold: {metric.threshold}{metric.unit}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isRunning && metrics.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Click "Run Performance Test" to simulate performance testing and see metrics
          </div>
        )}
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Performance Testing Example</span>
        </div>
        <div className="code-content">
          <pre>{getExampleCode()}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Test Environment</h3>
          <p>
            Use production-like environments for accurate results. Ensure consistent hardware, 
            network conditions, and data volumes. Isolate performance tests from other activities 
            and use dedicated test environments when possible.
          </p>
        </div>

        <div className="info-card">
          <h3>Baseline Establishment</h3>
          <p>
            Establish performance baselines before making changes. Track metrics over time 
            to identify performance regressions. Use statistical analysis to account for 
            natural variation in performance measurements.
          </p>
        </div>

        <div className="info-card">
          <h3>Bottleneck Identification</h3>
          <p>
            Use profiling tools to identify CPU, memory, database, or network bottlenecks. 
            Focus optimization efforts on the most significant performance constraints. 
            Monitor system resources during performance tests.
          </p>
        </div>

        <div className="info-card">
          <h3>Continuous Monitoring</h3>
          <p>
            Integrate performance testing into CI/CD pipelines. Set up automated alerts 
            for performance regressions. Use synthetic monitoring and real user monitoring (RUM) 
            to track performance in production.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Performance Testing Best Practices</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Test Planning</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Define performance requirements and SLAs</li>
              <li>Identify critical user journeys</li>
              <li>Plan realistic test scenarios</li>
              <li>Set up proper test environments</li>
              <li>Prepare representative test data</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Execution</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Start with baseline measurements</li>
              <li>Gradually increase load</li>
              <li>Monitor system resources</li>
              <li>Test one component at a time</li>
              <li>Run tests multiple times for consistency</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Analysis</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Focus on percentiles, not just averages</li>
              <li>Correlate performance with resource usage</li>
              <li>Identify performance bottlenecks</li>
              <li>Document findings and recommendations</li>
              <li>Track performance trends over time</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Optimization</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Profile before optimizing</li>
              <li>Focus on the biggest bottlenecks first</li>
              <li>Measure the impact of each change</li>
              <li>Consider caching strategies</li>
              <li>Optimize database queries and indexing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTestingPage;