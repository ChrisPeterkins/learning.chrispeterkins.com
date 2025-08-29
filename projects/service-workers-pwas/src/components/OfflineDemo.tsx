import React, { useState, useEffect } from 'react';

function OfflineDemo() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedResources, setCachedResources] = useState<string[]>([]);
  const [swStatus, setSwStatus] = useState<string>('Checking...');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setSwStatus('Active');
          // Request cached resources from service worker
          if (registration.active.postMessage) {
            registration.active.postMessage({ type: 'GET_CACHE_LIST' });
          }
        } else {
          setSwStatus('Installing...');
        }
      }).catch(() => {
        setSwStatus('Not Available');
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_LIST') {
          setCachedResources(event.data.resources || []);
        }
      });
    } else {
      setSwStatus('Not Supported');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const simulateOffline = () => {
    // This doesn't actually take the browser offline, but demonstrates the UI changes
    setIsOnline(false);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
    }, 3000);
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setCachedResources([]);
      alert('Cache cleared! Reload the page to re-cache resources.');
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Offline Functionality Demo</h1>
        <p className="demo-description">
          Progressive Web Apps can work offline using Service Workers. This demo shows how your app
          can continue functioning even without an internet connection.
        </p>
      </div>

      <div className="status-card">
        <div className="status-indicator">
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
          <span className="status-text">
            {isOnline ? 'You are online' : 'You are offline'}
          </span>
        </div>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
          Service Worker Status: <strong style={{ color: swStatus === 'Active' ? '#4ade80' : '#f0c674' }}>{swStatus}</strong>
        </p>
      </div>

      <div className="controls-section">
        <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Test Offline Mode</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button className="btn" onClick={simulateOffline}>
            Simulate Offline (3s)
          </button>
          <button className="btn btn-secondary" onClick={clearCache}>
            Clear Cache
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#8fa99b' }}>
          Try turning off your network connection or use browser DevTools to simulate offline mode.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>How It Works</h3>
          <p>
            Service Workers act as a proxy between your app and the network. They can intercept
            network requests and serve cached responses when offline.
          </p>
          <div className="code-block">
            <pre>{`// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW failed'));
}`}</pre>
          </div>
        </div>

        <div className="card">
          <h3>Cached Resources ({cachedResources.length})</h3>
          {cachedResources.length > 0 ? (
            <ul className="cache-list">
              {cachedResources.slice(0, 5).map((resource, index) => (
                <li key={index} className="cache-item">
                  <span style={{ fontSize: '0.85rem', color: '#a8bdb2', wordBreak: 'break-all' }}>
                    {resource.split('/').pop() || resource}
                  </span>
                </li>
              ))}
              {cachedResources.length > 5 && (
                <li className="cache-item">
                  <span style={{ fontSize: '0.85rem', color: '#8fa99b' }}>
                    ... and {cachedResources.length - 5} more
                  </span>
                </li>
              )}
            </ul>
          ) : (
            <p style={{ fontSize: '0.9rem', color: '#8fa99b' }}>
              No cached resources yet. Resources will be cached as you navigate the app.
            </p>
          )}
        </div>
      </div>

      <div className="info-panel" style={{ marginTop: '2rem' }}>
        <h3>Key Features of Offline Support</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
            <strong>Cache First Strategy:</strong> Serve cached content immediately for better performance
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
            <strong>Network Fallback:</strong> Try cache first, fall back to network if not found
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
            <strong>Background Sync:</strong> Queue actions while offline and sync when back online
          </li>
          <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
            <strong>Offline Pages:</strong> Show custom offline pages instead of browser errors
          </li>
        </ul>
      </div>
    </div>
  );
}

export default OfflineDemo;