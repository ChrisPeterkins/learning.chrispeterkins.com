import React, { useState, useEffect } from 'react';

interface CacheStrategy {
  name: string;
  description: string;
  code: string;
  useCase: string;
}

const strategies: CacheStrategy[] = [
  {
    name: 'Cache First',
    description: 'Check cache first, fallback to network if not found',
    useCase: 'Static assets like CSS, JS, images',
    code: `self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});`
  },
  {
    name: 'Network First',
    description: 'Try network first, fallback to cache if offline',
    useCase: 'API calls, dynamic content',
    code: `self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});`
  },
  {
    name: 'Stale While Revalidate',
    description: 'Serve from cache, update cache in background',
    useCase: 'Content that updates periodically',
    code: `self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
      return response || fetchPromise;
    })
  );
});`
  },
  {
    name: 'Cache Only',
    description: 'Only serve from cache, never go to network',
    useCase: 'Offline-only assets',
    code: `self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request));
});`
  },
  {
    name: 'Network Only',
    description: 'Always fetch from network, never cache',
    useCase: 'Real-time data, sensitive information',
    code: `self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});`
  }
];

function CacheStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<CacheStrategy>(strategies[0]);
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');

  useEffect(() => {
    // Estimate cache storage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = ((estimate.usage || 0) / 1024 / 1024).toFixed(2);
        const quota = ((estimate.quota || 0) / 1024 / 1024).toFixed(0);
        setCacheSize(`${used} MB / ${quota} MB`);
      });
    }
  }, []);

  const testStrategy = async (strategy: string) => {
    // Simulate testing a cache strategy
    const testUrl = '/api/test-data';
    
    try {
      const startTime = performance.now();
      const response = await fetch(testUrl);
      const endTime = performance.now();
      
      alert(`${strategy} Strategy Test:
- Response time: ${(endTime - startTime).toFixed(2)}ms
- Status: ${response.status}
- From cache: ${response.headers.get('X-From-Cache') === 'true' ? 'Yes' : 'No'}`);
    } catch (error) {
      alert(`Test failed: ${error}`);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Cache Strategies</h1>
        <p className="demo-description">
          Service Workers can implement different caching strategies depending on your needs.
          Choose the right strategy for different types of content.
        </p>
      </div>

      <div className="status-card">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Cache Storage Status</h3>
        <p style={{ color: '#94a3b8' }}>
          Storage Used: <strong style={{ color: '#f0f4f2' }}>{cacheSize}</strong>
        </p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3>Select Strategy</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {strategies.map((strategy, index) => (
              <button
                key={index}
                className={`btn ${selectedStrategy.name === strategy.name ? '' : 'btn-secondary'}`}
                onClick={() => setSelectedStrategy(strategy)}
                style={{ textAlign: 'left', padding: '0.75rem' }}
              >
                <strong>{strategy.name}</strong>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.8 }}>
                  {strategy.useCase}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>{selectedStrategy.name}</h3>
          <p style={{ marginBottom: '1rem' }}>{selectedStrategy.description}</p>
          <p style={{ fontSize: '0.9rem', color: '#8fa99b', marginBottom: '1rem' }}>
            <strong>Best for:</strong> {selectedStrategy.useCase}
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => testStrategy(selectedStrategy.name)}
          >
            Test This Strategy
          </button>
        </div>
      </div>

      <div className="code-block">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Implementation</h3>
        <pre>{selectedStrategy.code}</pre>
      </div>

      <div className="info-panel" style={{ marginTop: '2rem' }}>
        <h3>Strategy Comparison</h3>
        <div className="grid grid-3" style={{ marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Performance</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                🥇 Cache First
              </li>
              <li style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                🥈 Stale While Revalidate
              </li>
              <li style={{ fontSize: '0.9rem' }}>
                🥉 Network First
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Freshness</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                🥇 Network First
              </li>
              <li style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                🥈 Stale While Revalidate
              </li>
              <li style={{ fontSize: '0.9rem' }}>
                🥉 Cache First
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Offline Support</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                🥇 Cache First
              </li>
              <li style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                🥈 Cache Only
              </li>
              <li style={{ fontSize: '0.9rem' }}>
                🥉 Network First
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CacheStrategies;