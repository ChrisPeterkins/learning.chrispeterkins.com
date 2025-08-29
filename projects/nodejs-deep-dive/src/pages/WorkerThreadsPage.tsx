import React, { useState } from 'react'

const WorkerThreadsPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic')
  const [workerStatus, setWorkerStatus] = useState<string[]>([])
  
  const simulateWorker = (task: string) => {
    setWorkerStatus([])
    const steps = [
      '🚀 Starting worker thread...',
      '📊 Worker received task: ' + task,
      '⚙️ Processing in parallel...',
      '✅ Worker completed task',
      '📨 Result sent to main thread'
    ]
    
    steps.forEach((step, i) => {
      setTimeout(() => {
        setWorkerStatus(prev => [...prev, step])
      }, (i + 1) * 500)
    })
  }
  
  const examples = {
    basic: {
      title: 'Basic Worker Thread',
      code: `const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // Main thread code
  const worker = new Worker(__filename);
  
  worker.on('message', (msg) => {
    console.log('Received from worker:', msg);
  });
  
  worker.postMessage({ cmd: 'START' });
} else {
  // Worker thread code
  parentPort.on('message', (msg) => {
    if (msg.cmd === 'START') {
      // Perform CPU-intensive task
      const result = heavyComputation();
      parentPort.postMessage(result);
    }
  });
}`
    },
    pool: {
      title: 'Worker Pool Pattern',
      code: `const { Worker } = require('worker_threads');

class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    
    // Initialize worker pool
    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }
  
  createWorker() {
    const worker = new Worker(this.workerScript);
    
    worker.on('message', (result) => {
      worker.isBusy = false;
      this.processQueue();
    });
    
    worker.isBusy = false;
    this.workers.push(worker);
  }
  
  execute(data) {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => !w.isBusy);
      
      if (availableWorker) {
        availableWorker.isBusy = true;
        availableWorker.postMessage(data);
        availableWorker.once('message', resolve);
        availableWorker.once('error', reject);
      } else {
        this.queue.push({ data, resolve, reject });
      }
    });
  }
  
  processQueue() {
    if (this.queue.length > 0) {
      const { data, resolve, reject } = this.queue.shift();
      this.execute(data).then(resolve).catch(reject);
    }
  }
}`
    },
    shared: {
      title: 'SharedArrayBuffer',
      code: `const { Worker, isMainThread, parentPort, workerData } = 
  require('worker_threads');

if (isMainThread) {
  // Create shared memory
  const sharedBuffer = new SharedArrayBuffer(1024);
  const sharedArray = new Int32Array(sharedBuffer);
  
  // Create workers with shared memory
  const worker1 = new Worker(__filename, {
    workerData: { sharedArray, id: 1 }
  });
  
  const worker2 = new Worker(__filename, {
    workerData: { sharedArray, id: 2 }
  });
  
  // Main thread can also access shared memory
  setTimeout(() => {
    console.log('Shared value:', sharedArray[0]);
  }, 1000);
} else {
  // Worker thread code
  const { sharedArray, id } = workerData;
  
  // Atomically update shared memory
  Atomics.add(sharedArray, 0, id);
  
  // Notify waiting threads
  Atomics.notify(sharedArray, 0, 1);
}`
    },
    communication: {
      title: 'MessageChannel Communication',
      code: `const { Worker, MessageChannel } = require('worker_threads');

// Create a communication channel
const { port1, port2 } = new MessageChannel();

// Create worker with transferred port
const worker = new Worker(\`
  const { parentPort } = require('worker_threads');
  
  parentPort.on('message', (port) => {
    port.on('message', (msg) => {
      console.log('Worker received:', msg);
      port.postMessage({ result: msg.value * 2 });
    });
    
    port.postMessage({ ready: true });
  });
\`, { eval: true });

// Transfer port2 to worker
worker.postMessage(port2, [port2]);

// Use port1 in main thread
port1.on('message', (msg) => {
  if (msg.ready) {
    port1.postMessage({ value: 42 });
  } else {
    console.log('Main received:', msg.result);
  }
});`
    }
  }
  
  return (
    <div className="worker-threads-page">
      <header className="page-header">
        <h1>Worker Threads</h1>
        <p className="page-description">
          Leverage true parallelism in Node.js with Worker Threads. Execute CPU-intensive 
          tasks without blocking the main event loop, perfect for data processing, cryptography, 
          and computational workloads.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Worker Thread Examples</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            {Object.keys(examples).map(key => (
              <button
                key={key}
                className={`demo-button ${activeExample === key ? 'active' : ''}`}
                onClick={() => setActiveExample(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
              {examples[activeExample as keyof typeof examples].title}
            </h3>
            
            <div className="code-container">
              <div className="code-header">
                <span className="code-title">Implementation</span>
              </div>
              <div className="code-content">
                <pre>{examples[activeExample as keyof typeof examples].code}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Worker Thread Simulation</h2>
        
        <div className="visualization-container">
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'var(--code-bg)',
                border: '2px solid var(--accent-green)',
                textAlign: 'center'
              }}>
                <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>
                  Main Thread
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Event Loop Running
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                background: 'var(--code-bg)',
                border: '2px solid var(--border-primary)',
                textAlign: 'center'
              }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Worker Thread
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Parallel Execution
                </p>
              </div>
            </div>
            
            <div className="demo-controls" style={{ justifyContent: 'center' }}>
              <button 
                className="demo-button" 
                onClick={() => simulateWorker('Heavy Computation')}
              >
                Run CPU Task
              </button>
              <button 
                className="demo-button" 
                onClick={() => simulateWorker('Data Processing')}
              >
                Process Data
              </button>
              <button 
                className="demo-button" 
                onClick={() => simulateWorker('Image Manipulation')}
              >
                Transform Image
              </button>
            </div>
            
            {workerStatus.length > 0 && (
              <div className="demo-output" style={{ marginTop: '1.5rem' }}>
                {workerStatus.map((status, i) => (
                  <div key={i} style={{ marginBottom: '0.5rem' }}>
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Best Practices</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>When to Use Workers</h3>
            <p>
              CPU-intensive tasks like image processing, cryptography, data compression, 
              or complex calculations. Not for I/O operations.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Worker Pool Pattern</h3>
            <p>
              Reuse workers instead of creating new ones for each task. Maintains a pool 
              of workers to handle multiple requests efficiently.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Data Transfer</h3>
            <p>
              Use ArrayBuffer and transferList for zero-copy transfers. SharedArrayBuffer 
              for truly shared memory between threads.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Error Handling</h3>
            <p>
              Always handle worker errors and exit events. Workers can crash independently 
              from the main thread.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Resource Limits</h3>
            <p>
              Set resource limits for workers (memory, CPU). Monitor worker performance 
              and implement timeouts for long-running tasks.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Communication Overhead</h3>
            <p>
              Minimize message passing between threads. Batch operations and use efficient 
              serialization formats.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WorkerThreadsPage