import React, { useState, useEffect } from 'react';

interface SyncItem {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

function BackgroundSync() {
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncSupported, setSyncSupported] = useState(false);

  useEffect(() => {
    // Check if Background Sync is supported
    const supported = 'serviceWorker' in navigator && 'SyncManager' in window;
    setSyncSupported(supported);

    // Load sync queue from localStorage
    const savedQueue = localStorage.getItem('syncQueue');
    if (savedQueue) {
      setSyncQueue(JSON.parse(savedQueue));
    }

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToSyncQueue = (type: string, data: any) => {
    const newItem: SyncItem = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    const updatedQueue = [...syncQueue, newItem];
    setSyncQueue(updatedQueue);
    localStorage.setItem('syncQueue', JSON.stringify(updatedQueue));

    if (isOnline) {
      processSyncQueue();
    } else {
      // Register background sync
      if (syncSupported) {
        navigator.serviceWorker.ready.then(registration => {
          return (registration as any).sync.register('sync-data');
        });
      }
    }
  };

  const processSyncQueue = async () => {
    const queue = [...syncQueue];
    
    for (const item of queue) {
      if (item.status === 'pending') {
        // Update status to syncing
        setSyncQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'syncing' } : i
        ));

        // Simulate API call
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mark as completed
          setSyncQueue(prev => prev.map(i => 
            i.id === item.id ? { ...i, status: 'completed' } : i
          ));
        } catch (error) {
          // Mark as failed
          setSyncQueue(prev => prev.map(i => 
            i.id === item.id ? { ...i, status: 'failed' } : i
          ));
        }
      }
    }

    // Clean up completed items after 3 seconds
    setTimeout(() => {
      setSyncQueue(prev => {
        const updated = prev.filter(i => i.status !== 'completed');
        localStorage.setItem('syncQueue', JSON.stringify(updated));
        return updated;
      });
    }, 3000);
  };

  const clearQueue = () => {
    setSyncQueue([]);
    localStorage.removeItem('syncQueue');
  };

  const simulateOfflineAction = () => {
    const actions = [
      { type: 'form-submission', data: { name: 'John Doe', email: 'john@example.com' }},
      { type: 'api-request', data: { endpoint: '/api/users', method: 'POST' }},
      { type: 'file-upload', data: { fileName: 'document.pdf', size: '2.5MB' }},
      { type: 'comment-post', data: { text: 'Great article!', articleId: '123' }}
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    addToSyncQueue(randomAction.type, randomAction.data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4ade80';
      case 'syncing': return '#f0c674';
      case 'failed': return '#dc2626';
      default: return '#8fa99b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'syncing': return '↻';
      case 'failed': return '✗';
      default: return '⏳';
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Background Sync</h1>
        <p className="demo-description">
          Background Sync API allows web apps to defer actions until the user has stable connectivity.
          Perfect for ensuring important actions complete even if the user goes offline.
        </p>
      </div>

      <div className="status-card">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Sync Status</h3>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <p style={{ color: '#94a3b8' }}>
            Connection: <strong style={{ color: isOnline ? '#4ade80' : '#dc2626' }}>
              {isOnline ? 'Online' : 'Offline'}
            </strong>
          </p>
          <p style={{ color: '#94a3b8' }}>
            Background Sync: <strong style={{ color: syncSupported ? '#4ade80' : '#dc2626' }}>
              {syncSupported ? 'Supported' : 'Not Supported'}
            </strong>
          </p>
          <p style={{ color: '#94a3b8' }}>
            Queue Size: <strong style={{ color: '#f0f4f2' }}>
              {syncQueue.length} items
            </strong>
          </p>
        </div>
      </div>

      <div className="controls-section">
        <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Test Background Sync</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn" onClick={simulateOfflineAction}>
            Add Action to Queue
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={processSyncQueue}
            disabled={syncQueue.length === 0 || !isOnline}
          >
            Process Queue Now
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={clearQueue}
            disabled={syncQueue.length === 0}
          >
            Clear Queue
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#8fa99b', marginTop: '1rem' }}>
          Try adding actions while offline, then go back online to see them sync automatically!
        </p>
      </div>

      <div className="sync-queue">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Sync Queue</h3>
        {syncQueue.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {syncQueue.map(item => (
              <div key={item.id} className="sync-item" style={{
                borderLeftColor: getStatusColor(item.status),
                opacity: item.status === 'completed' ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#f0f4f2' }}>{item.type}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#8fa99b', marginTop: '0.25rem' }}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                    {item.data && (
                      <div style={{ fontSize: '0.8rem', color: '#6b8577', marginTop: '0.25rem' }}>
                        {JSON.stringify(item.data, null, 2)}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    color: getStatusColor(item.status),
                    fontSize: '1.5rem',
                    minWidth: '30px',
                    textAlign: 'center'
                  }}>
                    {getStatusIcon(item.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#8fa99b', padding: '1rem', textAlign: 'center' }}>
            No items in sync queue. Add some actions to test!
          </p>
        )}
      </div>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>How It Works</h3>
          <div className="code-block">
            <pre>{`// Register background sync
navigator.serviceWorker.ready.then(reg => {
  return reg.sync.register('sync-tag');
});

// In service worker
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tag') {
    event.waitUntil(syncData());
  }
});`}</pre>
          </div>
        </div>

        <div className="card">
          <h3>Use Cases</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Sending form data when back online
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Uploading files in the background
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Syncing app data with server
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Posting comments or messages
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BackgroundSync;