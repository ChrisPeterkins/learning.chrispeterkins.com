import React, { useState, useEffect } from 'react';

interface NetworkRequest {
  id: number;
  name: string;
  method: string;
  status: number;
  size: string;
  time: number;
  type: string;
  timeline: {
    dns: number;
    connect: number;
    ssl: number;
    request: number;
    response: number;
  };
}

const NetworkPage: React.FC = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [filter, setFilter] = useState('All');

  const sampleRequests: NetworkRequest[] = [
    {
      id: 1,
      name: 'main.js',
      method: 'GET',
      status: 200,
      size: '156 KB',
      time: 247,
      type: 'Script',
      timeline: { dns: 12, connect: 23, ssl: 45, request: 89, response: 78 }
    },
    {
      id: 2,
      name: 'api/users',
      method: 'GET',
      status: 200,
      size: '2.3 KB',
      time: 189,
      type: 'XHR',
      timeline: { dns: 8, connect: 15, ssl: 0, request: 145, response: 21 }
    },
    {
      id: 3,
      name: 'logo.png',
      method: 'GET',
      status: 200,
      size: '12.4 KB',
      time: 95,
      type: 'Image',
      timeline: { dns: 5, connect: 12, ssl: 0, request: 67, response: 11 }
    },
    {
      id: 4,
      name: 'styles.css',
      method: 'GET',
      status: 200,
      size: '34.2 KB',
      time: 123,
      type: 'Stylesheet',
      timeline: { dns: 3, connect: 8, ssl: 0, request: 89, response: 23 }
    },
    {
      id: 5,
      name: 'api/posts',
      method: 'POST',
      status: 404,
      size: '0 B',
      time: 456,
      type: 'XHR',
      timeline: { dns: 12, connect: 34, ssl: 0, request: 387, response: 23 }
    }
  ];

  const startRecording = () => {
    setIsRecording(true);
    setRequests([]);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleRequests.length) {
        setRequests(prev => [...prev, sampleRequests[index]]);
        index++;
      } else {
        setIsRecording(false);
        clearInterval(interval);
      }
    }, 500);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'var(--accent-green-bright)';
    if (status >= 300 && status < 400) return 'var(--warning-yellow)';
    if (status >= 400) return 'var(--error-red)';
    return 'var(--text-secondary)';
  };

  const filteredRequests = requests.filter(req => 
    filter === 'All' || req.type === filter
  );

  const renderWaterfall = (request: NetworkRequest) => {
    const maxTime = Math.max(...requests.map(r => r.time));
    const scale = 200 / maxTime;

    return (
      <div style={{ position: 'relative', height: '20px', width: '200px' }}>
        {Object.entries(request.timeline).map(([phase, duration], index) => {
          const startTime = Object.values(request.timeline)
            .slice(0, index)
            .reduce((sum, val) => sum + val, 0);
          
          const colors = {
            dns: '#3b82f6',
            connect: '#f59e0b',
            ssl: '#8b5cf6',
            request: '#ef4444',
            response: '#4ade80'
          };

          return (
            <div
              key={phase}
              style={{
                position: 'absolute',
                left: `${startTime * scale}px`,
                width: `${duration * scale}px`,
                height: '18px',
                background: colors[phase as keyof typeof colors],
                opacity: 0.8,
                border: '1px solid rgba(255,255,255,0.2)',
                top: '1px'
              }}
              title={`${phase}: ${duration}ms`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Network Analysis</h1>
        <p className="page-description">
          Monitor HTTP requests, analyze response times, and optimize loading performance.
          Understand waterfall charts, resource timing, and network bottlenecks.
        </p>
      </header>

      <section className="demo-container">
        <h2>Network Monitor</h2>
        <div className="demo-controls">
          <button 
            className={`demo-button ${isRecording ? 'active' : ''}`}
            onClick={startRecording}
            disabled={isRecording}
          >
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          <button 
            className="demo-button" 
            onClick={() => setRequests([])}
          >
            Clear
          </button>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              padding: '0.5rem'
            }}
          >
            <option value="All">All</option>
            <option value="XHR">XHR</option>
            <option value="Script">Scripts</option>
            <option value="Image">Images</option>
            <option value="Stylesheet">Stylesheets</option>
          </select>
        </div>

        <div className="network-timeline">
          <div className="network-request" style={{ fontWeight: 'bold', borderBottom: '2px solid var(--border-primary)' }}>
            <div>Name</div>
            <div>Method</div>
            <div>Status</div>
            <div>Waterfall</div>
            <div>Size</div>
          </div>
          {filteredRequests.map((request) => (
            <div key={request.id} className="network-request">
              <div style={{ 
                color: request.type === 'XHR' ? 'var(--accent-green-bright)' : 'var(--text-primary)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {request.name}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {request.method}
              </div>
              <div style={{ color: getStatusColor(request.status) }}>
                {request.status}
              </div>
              <div>
                {renderWaterfall(request)}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {request.size}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{requests.length}</div>
          <div className="metric-label">Total Requests</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {requests.reduce((sum, req) => sum + req.time, 0)}ms
          </div>
          <div className="metric-label">Total Time</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {Math.round(requests.reduce((sum, req) => 
              sum + parseFloat(req.size.replace(/[^\d.]/g, '')), 0))}KB
          </div>
          <div className="metric-label">Total Size</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {requests.filter(r => r.status >= 400).length}
          </div>
          <div className="metric-label">Failed Requests</div>
        </div>
      </section>

      <section className="code-container">
        <div className="code-header">
          <span className="code-title">Request Timing Phases</span>
        </div>
        <div className="code-content">
          <pre>{`// Navigation Timing API
const timing = performance.getEntriesByType('navigation')[0];

// DNS Resolution Time
const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;

// Connection Time
const connectionTime = timing.connectEnd - timing.connectStart;

// SSL/TLS Handshake Time
const sslTime = timing.connectEnd - timing.secureConnectionStart;

// Request Time (TTFB - Time to First Byte)
const requestTime = timing.responseStart - timing.requestStart;

// Response Download Time
const responseTime = timing.responseEnd - timing.responseStart;

// Total Load Time
const totalTime = timing.loadEventEnd - timing.navigationStart;

console.log({
  dnsTime,
  connectionTime, 
  sslTime,
  requestTime,
  responseTime,
  totalTime
});`}</pre>
        </div>
      </section>

      <section className="concept-grid">
        <div className="info-card">
          <h3>Waterfall Charts</h3>
          <p>
            Visualize request timing phases: DNS lookup, connection, SSL handshake,
            request sending, and response download. Identify bottlenecks.
          </p>
        </div>

        <div className="info-card">
          <h3>Critical Path</h3>
          <p>
            Identify render-blocking resources that delay page load. Optimize
            critical path by reducing blocking resources and improving timing.
          </p>
        </div>

        <div className="info-card">
          <h3>Resource Hints</h3>
          <p>
            Use dns-prefetch, preconnect, preload, and prefetch to optimize
            resource loading. Reduce connection overhead for critical resources.
          </p>
        </div>
      </section>
    </div>
  );
};

export default NetworkPage;