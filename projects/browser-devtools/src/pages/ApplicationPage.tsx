import React, { useState, useEffect } from 'react';

interface StorageItem {
  key: string;
  value: string;
  size: string;
  type: 'localStorage' | 'sessionStorage' | 'cookie' | 'indexedDB';
}

interface ServiceWorker {
  url: string;
  status: 'activated' | 'waiting' | 'installing';
  scope: string;
}

const ApplicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'storage' | 'cache' | 'workers'>('storage');
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<'localStorage' | 'sessionStorage' | 'cookies'>('localStorage');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [cacheSize, setCacheSize] = useState(0);
  const [serviceWorkers, setServiceWorkers] = useState<ServiceWorker[]>([]);

  useEffect(() => {
    loadStorageItems();
  }, [selectedStorage]);

  const loadStorageItems = () => {
    const items: StorageItem[] = [];
    
    if (selectedStorage === 'localStorage') {
      items.push(
        { key: 'user_preferences', value: '{"theme": "dark", "language": "en"}', size: '42 B', type: 'localStorage' },
        { key: 'last_visited', value: '2024-01-15T10:30:00Z', size: '24 B', type: 'localStorage' },
        { key: 'auth_token', value: 'eyJhbGciOiJIUzI1NiIs...', size: '128 B', type: 'localStorage' }
      );
    } else if (selectedStorage === 'sessionStorage') {
      items.push(
        { key: 'form_data', value: '{"name": "John", "email": "john@example.com"}', size: '48 B', type: 'sessionStorage' },
        { key: 'temp_cart', value: '[{"id": 1, "qty": 2}]', size: '23 B', type: 'sessionStorage' }
      );
    } else {
      items.push(
        { key: 'session_id', value: 'abc123def456', size: '12 B', type: 'cookie' },
        { key: 'analytics_id', value: 'GA1.2.123456789', size: '16 B', type: 'cookie' },
        { key: 'consent', value: 'accepted', size: '8 B', type: 'cookie' }
      );
    }
    
    setStorageItems(items);
  };

  const addStorageItem = () => {
    if (!newKey || !newValue) return;
    
    const newItem: StorageItem = {
      key: newKey,
      value: newValue,
      size: `${new Blob([newValue]).size} B`,
      type: selectedStorage === 'cookies' ? 'cookie' : selectedStorage as 'localStorage' | 'sessionStorage'
    };
    
    setStorageItems([...storageItems, newItem]);
    setNewKey('');
    setNewValue('');
  };

  const deleteStorageItem = (key: string) => {
    setStorageItems(storageItems.filter(item => item.key !== key));
  };

  const clearStorage = () => {
    setStorageItems([]);
  };

  const simulateServiceWorker = () => {
    const newWorker: ServiceWorker = {
      url: '/sw.js',
      status: 'activated',
      scope: '/'
    };
    setServiceWorkers([...serviceWorkers, newWorker]);
  };

  const unregisterWorker = (url: string) => {
    setServiceWorkers(serviceWorkers.filter(sw => sw.url !== url));
  };

  const clearCache = () => {
    setCacheSize(0);
  };

  const simulateCache = () => {
    setCacheSize(prev => prev + Math.floor(Math.random() * 500) + 100);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Application Storage</h1>
        <p className="page-description">
          Inspect and manage browser storage including localStorage, sessionStorage, cookies, 
          IndexedDB, cache storage, and service workers for progressive web apps.
        </p>
      </header>

      <section className="demo-container">
        <div className="demo-controls">
          <button 
            className={`demo-button ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            Storage
          </button>
          <button 
            className={`demo-button ${activeTab === 'cache' ? 'active' : ''}`}
            onClick={() => setActiveTab('cache')}
          >
            Cache Storage
          </button>
          <button 
            className={`demo-button ${activeTab === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTab('workers')}
          >
            Service Workers
          </button>
        </div>

        {activeTab === 'storage' && (
          <div>
            <div className="demo-controls" style={{ marginTop: '1rem' }}>
              <button 
                className={`demo-button ${selectedStorage === 'localStorage' ? 'active' : ''}`}
                onClick={() => setSelectedStorage('localStorage')}
              >
                Local Storage
              </button>
              <button 
                className={`demo-button ${selectedStorage === 'sessionStorage' ? 'active' : ''}`}
                onClick={() => setSelectedStorage('sessionStorage')}
              >
                Session Storage
              </button>
              <button 
                className={`demo-button ${selectedStorage === 'cookies' ? 'active' : ''}`}
                onClick={() => setSelectedStorage('cookies')}
              >
                Cookies
              </button>
              <button 
                className="demo-button"
                onClick={clearStorage}
                style={{ marginLeft: 'auto', background: 'var(--error-red)', color: 'white' }}
              >
                Clear All
              </button>
            </div>

            <div className="network-timeline" style={{ marginTop: '2rem' }}>
              <div className="network-request" style={{ fontWeight: 'bold', borderBottom: '2px solid var(--border-primary)' }}>
                <div>Key</div>
                <div>Value</div>
                <div>Size</div>
                <div>Type</div>
                <div>Actions</div>
              </div>
              {storageItems.map((item, index) => (
                <div key={index} className="network-request">
                  <div style={{ 
                    color: 'var(--accent-green-bright)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.9rem'
                  }}>
                    {item.key}
                  </div>
                  <div style={{ 
                    color: 'var(--text-secondary)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.85rem',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.value}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {item.size}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {item.type}
                  </div>
                  <div>
                    <button
                      onClick={() => deleteStorageItem(item.key)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--error-red)',
                        color: 'var(--error-red)',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '2rem',
              padding: '1rem',
              background: 'var(--code-bg)',
              border: '1px solid var(--code-border)'
            }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Add New Item
              </h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  style={{
                    flex: 2,
                    padding: '0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                />
                <button
                  onClick={addStorageItem}
                  className="demo-button"
                  style={{ background: 'var(--accent-green)' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div>
            <div className="metrics-grid" style={{ marginTop: '2rem' }}>
              <div className="metric-card">
                <div className="metric-value">{cacheSize} KB</div>
                <div className="metric-label">Cache Size</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">24</div>
                <div className="metric-label">Cached Resources</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">3</div>
                <div className="metric-label">Cache Storages</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">95%</div>
                <div className="metric-label">Hit Rate</div>
              </div>
            </div>

            <div className="demo-controls" style={{ marginTop: '2rem' }}>
              <button className="demo-button" onClick={simulateCache}>
                Add to Cache
              </button>
              <button 
                className="demo-button" 
                onClick={clearCache}
                style={{ background: 'var(--error-red)', color: 'white' }}
              >
                Clear Cache
              </button>
            </div>

            <div className="code-container" style={{ marginTop: '2rem' }}>
              <div className="code-header">
                <span className="code-title">Cached Resources</span>
              </div>
              <div className="code-content">
                <pre style={{ color: 'var(--text-secondary)' }}>{`cache-v1:
  /index.html (2.4 KB)
  /styles.css (15.6 KB)
  /app.js (124.3 KB)
  /manifest.json (0.8 KB)
  
images-v1:
  /logo.png (12.4 KB)
  /icons/icon-192.png (8.2 KB)
  /icons/icon-512.png (24.1 KB)
  
api-cache:
  /api/users (4.2 KB)
  /api/posts (18.7 KB)
  /api/config (1.1 KB)`}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div>
            <div className="demo-controls" style={{ marginTop: '2rem' }}>
              <button className="demo-button" onClick={simulateServiceWorker}>
                Register Service Worker
              </button>
              <button className="demo-button">
                Update Workers
              </button>
            </div>

            <div className="network-timeline" style={{ marginTop: '2rem' }}>
              <div className="network-request" style={{ fontWeight: 'bold', borderBottom: '2px solid var(--border-primary)' }}>
                <div>Script URL</div>
                <div>Status</div>
                <div>Scope</div>
                <div style={{ gridColumn: 'span 2' }}>Actions</div>
              </div>
              
              {serviceWorkers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No service workers registered
                </div>
              ) : (
                serviceWorkers.map((worker, index) => (
                  <div key={index} className="network-request">
                    <div style={{ 
                      color: 'var(--accent-green-bright)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      {worker.url}
                    </div>
                    <div style={{ 
                      color: worker.status === 'activated' ? 'var(--accent-green-bright)' : 'var(--warning-yellow)'
                    }}>
                      {worker.status}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {worker.scope}
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <button
                        onClick={() => unregisterWorker(worker.url)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--error-red)',
                          color: 'var(--error-red)',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          marginRight: '0.5rem'
                        }}
                      >
                        Unregister
                      </button>
                      <button
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--accent-green-bright)',
                          color: 'var(--accent-green-bright)',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="code-container" style={{ marginTop: '2rem' }}>
              <div className="code-header">
                <span className="code-title">Service Worker Lifecycle</span>
              </div>
              <div className="code-content">
                <pre>{`// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered:', reg))
    .catch(err => console.log('SW registration failed:', err));
}

// Service Worker Script (sw.js)
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  // Cache resources
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  // Clean old caches
});

self.addEventListener('fetch', event => {
  // Intercept network requests
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="code-container">
        <div className="code-header">
          <span className="code-title">Storage APIs</span>
        </div>
        <div className="code-content">
          <pre>{`// LocalStorage - Persistent storage
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// SessionStorage - Tab-specific storage
sessionStorage.setItem('key', 'value');
const value = sessionStorage.getItem('key');

// Cookies - Server-accessible storage
document.cookie = 'name=value; expires=date; path=/';
const cookies = document.cookie.split(';');

// IndexedDB - Large structured data
const request = indexedDB.open('MyDB', 1);
request.onsuccess = event => {
  const db = event.target.result;
  // Use database
};

// Cache API - Resource caching
caches.open('v1').then(cache => {
  cache.addAll(['/index.html', '/styles.css']);
});

// Storage Quota
navigator.storage.estimate().then(estimate => {
  console.log(\`Using \${estimate.usage} of \${estimate.quota} bytes\`);
});`}</pre>
        </div>
      </section>

      <section className="concept-grid">
        <div className="info-card">
          <h3>Storage Limits</h3>
          <p>
            localStorage: ~10MB, sessionStorage: ~10MB, IndexedDB: 50% of free disk,
            Cookies: 4KB per cookie. Understand browser storage quotas and policies.
          </p>
        </div>

        <div className="info-card">
          <h3>Data Persistence</h3>
          <p>
            Learn persistence guarantees, eviction policies, and how to request
            persistent storage for critical application data.
          </p>
        </div>

        <div className="info-card">
          <h3>Security & Privacy</h3>
          <p>
            Understand same-origin policy, secure contexts, cookie attributes,
            and best practices for handling sensitive data in browser storage.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ApplicationPage;