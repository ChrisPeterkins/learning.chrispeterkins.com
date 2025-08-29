import React from 'react'

const ClusteringPage: React.FC = () => {
  return (
    <div className="clustering-page">
      <header className="page-header">
        <h1>Clustering & Load Balancing</h1>
        <p className="page-description">
          Scale Node.js applications across multiple CPU cores using the cluster module. 
          Implement load balancing strategies and high availability patterns.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Cluster Architecture</h2>
        
        <div className="visualization-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '1rem 2rem',
              background: 'var(--accent-green)',
              color: 'var(--bg-primary)',
              marginBottom: '2rem'
            }}>
              <strong>Master Process</strong>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  padding: '1rem',
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border-primary)',
                  textAlign: 'center'
                }}>
                  Worker {i}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Basic Cluster Setup</span>
          </div>
          <div className="code-content">
            <pre>{`const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(\`Master \${process.pid} is running\`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(\`Worker \${worker.process.pid} died\`);
    // Replace dead worker
    cluster.fork();
  });
} else {
  // Workers share server port
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(\`Hello from Worker \${process.pid}\\n\`);
  }).listen(8000);

  console.log(\`Worker \${process.pid} started\`);
}`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Advanced Clustering</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Graceful Shutdown</span>
          </div>
          <div className="code-content">
            <pre>{`// Graceful shutdown implementation
if (cluster.isMaster) {
  process.on('SIGTERM', () => {
    console.log('Master received SIGTERM, shutting down...');
    
    for (const id in cluster.workers) {
      cluster.workers[id].send('shutdown');
    }
    
    let workerCount = Object.keys(cluster.workers).length;
    
    cluster.on('exit', () => {
      workerCount--;
      if (workerCount === 0) {
        process.exit(0);
      }
    });
  });
} else {
  let server = http.createServer(app);
  
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">PM2 Configuration</span>
          </div>
          <div className="code-content">
            <pre>{`// ecosystem.config.js for PM2
module.exports = {
  apps: [{
    name: 'api',
    script: './app.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};

// Start with: pm2 start ecosystem.config.js
// Monitor with: pm2 monit
// Scale with: pm2 scale api +2`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Load Balancing Strategies</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Round Robin</h3>
            <p>
              Default on Linux. Each new connection goes to the next worker in sequence. 
              Simple and effective for uniform requests.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Least Connections</h3>
            <p>
              Route to worker with fewest active connections. Better for long-lived 
              connections or varying request complexity.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Sticky Sessions</h3>
            <p>
              Route same client to same worker using IP hash or cookies. Required for 
              stateful applications without shared session store.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ClusteringPage