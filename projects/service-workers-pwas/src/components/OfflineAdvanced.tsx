import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Upload, Database, RefreshCw, Cloud, CloudOff, Check, X, AlertCircle } from 'lucide-react';

interface CachedResource {
  url: string;
  size: number;
  timestamp: number;
  type: string;
}

interface SyncQueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retries: number;
}

const OfflineAdvanced: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedResources, setCachedResources] = useState<CachedResource[]>([]);
  const [cacheSize, setCacheSize] = useState(0);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [networkSpeed, setNetworkSpeed] = useState<string>('unknown');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setNetworkSpeed(connection.effectiveType || 'unknown');
        
        connection.addEventListener('change', () => {
          setNetworkSpeed(connection.effectiveType || 'unknown');
        });
      }
    }

    // Initialize cache inspection
    inspectCache();

    // Load sync queue from localStorage
    const savedQueue = localStorage.getItem('syncQueue');
    if (savedQueue) {
      setSyncQueue(JSON.parse(savedQueue));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Inspect cache contents
  const inspectCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const resources: CachedResource[] = [];
        let totalSize = 0;

        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              const resource: CachedResource = {
                url: request.url,
                size: blob.size,
                timestamp: Date.now(),
                type: blob.type || 'unknown'
              };
              resources.push(resource);
              totalSize += blob.size;
            }
          }
        }

        setCachedResources(resources);
        setCacheSize(totalSize);
      } catch (error) {
        console.error('Error inspecting cache:', error);
      }
    }
  };

  // Pre-cache resources for offline use
  const preCacheResources = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const resourcesToCache = [
      '/api/data.json',
      '/images/offline-banner.jpg',
      '/styles/offline.css',
      '/scripts/offline.js'
    ];

    if ('caches' in window) {
      try {
        const cache = await caches.open('offline-resources-v1');
        let cached = 0;

        for (const resource of resourcesToCache) {
          try {
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // In real app, you would fetch the actual resource
            const response = new Response(JSON.stringify({ cached: true }), {
              headers: { 'Content-Type': 'application/json' }
            });
            
            await cache.put(resource, response);
            cached++;
            setDownloadProgress((cached / resourcesToCache.length) * 100);
          } catch (error) {
            console.error(`Failed to cache ${resource}:`, error);
          }
        }

        await inspectCache();
        setIsDownloading(false);
        setDownloadProgress(100);
        
        setTimeout(() => setDownloadProgress(0), 2000);
      } catch (error) {
        console.error('Error pre-caching resources:', error);
        setIsDownloading(false);
      }
    }
  };

  // Clear all caches
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setCachedResources([]);
        setCacheSize(0);
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  };

  // Add item to sync queue
  const addToSyncQueue = (action: string, data: any) => {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}`,
      action,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    const updatedQueue = [...syncQueue, item];
    setSyncQueue(updatedQueue);
    localStorage.setItem('syncQueue', JSON.stringify(updatedQueue));

    if (isOnline && autoSync) {
      syncItem(item);
    }
  };

  // Sync individual item
  const syncItem = async (item: SyncQueueItem) => {
    const updatedQueue = syncQueue.map(i => 
      i.id === item.id ? { ...i, status: 'syncing' as const } : i
    );
    setSyncQueue(updatedQueue);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            resolve(true);
          } else {
            reject(new Error('Sync failed'));
          }
        }, 1500);
      });

      // Mark as completed
      const completedQueue = updatedQueue.map(i =>
        i.id === item.id ? { ...i, status: 'completed' as const } : i
      );
      setSyncQueue(completedQueue);
      localStorage.setItem('syncQueue', JSON.stringify(completedQueue));
      setLastSync(new Date());
    } catch (error) {
      // Handle retry logic
      const failedQueue = updatedQueue.map(i =>
        i.id === item.id 
          ? { ...i, status: 'failed' as const, retries: i.retries + 1 } 
          : i
      );
      setSyncQueue(failedQueue);
      localStorage.setItem('syncQueue', JSON.stringify(failedQueue));

      // Retry if under max retries
      if (item.retries < 3) {
        setTimeout(() => syncItem({ ...item, retries: item.retries + 1 }), 5000);
      }
    }
  };

  // Sync all offline data
  const syncOfflineData = async () => {
    const pendingItems = syncQueue.filter(item => 
      item.status === 'pending' || item.status === 'failed'
    );

    for (const item of pendingItems) {
      if (isOnline) {
        await syncItem(item);
      }
    }
  };

  // Clear sync queue
  const clearSyncQueue = () => {
    setSyncQueue([]);
    localStorage.removeItem('syncQueue');
  };

  // Format bytes to readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Simulate offline mode
  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    if (!offlineMode) {
      window.dispatchEvent(new Event('offline'));
    } else {
      window.dispatchEvent(new Event('online'));
    }
  };

  return (
    <div className="offline-advanced">
      <div className="page-header">
        <h1 className="page-title">
          {isOnline ? <Wifi className="icon" /> : <WifiOff className="icon" />}
          Advanced Offline Functionality
        </h1>
        <p className="page-subtitle">
          Comprehensive offline capabilities with sync, caching, and queue management
        </p>
      </div>

      {/* Connection Status */}
      <div className="status-card">
        <div className="status-header">
          <h2>Connection Status</h2>
          <button 
            onClick={toggleOfflineMode}
            className="btn btn-secondary"
          >
            Simulate {offlineMode ? 'Online' : 'Offline'}
          </button>
        </div>
        
        <div className="status-grid">
          <div className={`status-item ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Cloud className="status-icon" /> : <CloudOff className="status-icon" />}
            <span className="status-label">Status</span>
            <span className="status-value">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          <div className="status-item">
            <Wifi className="status-icon" />
            <span className="status-label">Network Type</span>
            <span className="status-value">{networkSpeed}</span>
          </div>
          
          <div className="status-item">
            <Database className="status-icon" />
            <span className="status-label">Cache Size</span>
            <span className="status-value">{formatBytes(cacheSize)}</span>
          </div>
          
          <div className="status-item">
            <RefreshCw className="status-icon" />
            <span className="status-label">Last Sync</span>
            <span className="status-value">
              {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Cache Management */}
      <div className="section">
        <div className="section-header">
          <h2>Cache Management</h2>
          <div className="button-group">
            <button 
              onClick={preCacheResources}
              className="btn btn-primary"
              disabled={isDownloading}
            >
              <Download className="btn-icon" />
              {isDownloading ? 'Downloading...' : 'Pre-cache Resources'}
            </button>
            <button 
              onClick={clearCache}
              className="btn btn-danger"
            >
              <X className="btn-icon" />
              Clear Cache
            </button>
          </div>
        </div>

        {downloadProgress > 0 && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${downloadProgress}%` }}
            />
            <span className="progress-text">{Math.round(downloadProgress)}%</span>
          </div>
        )}

        <div className="cache-list">
          <h3>Cached Resources ({cachedResources.length})</h3>
          {cachedResources.length === 0 ? (
            <p className="empty-message">No cached resources</p>
          ) : (
            <div className="resource-grid">
              {cachedResources.map((resource, index) => (
                <div key={index} className="resource-item">
                  <div className="resource-icon">
                    <Database size={16} />
                  </div>
                  <div className="resource-details">
                    <span className="resource-url">
                      {resource.url.replace(window.location.origin, '')}
                    </span>
                    <span className="resource-meta">
                      {resource.type} • {formatBytes(resource.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sync Queue */}
      <div className="section">
        <div className="section-header">
          <h2>Sync Queue</h2>
          <div className="button-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
              />
              <span>Auto-sync</span>
            </label>
            <button 
              onClick={() => addToSyncQueue('test', { message: 'Test data' })}
              className="btn btn-primary"
            >
              <Upload className="btn-icon" />
              Add Test Item
            </button>
            <button 
              onClick={syncOfflineData}
              className="btn btn-secondary"
              disabled={!isOnline || syncQueue.length === 0}
            >
              <RefreshCw className="btn-icon" />
              Sync Now
            </button>
            <button 
              onClick={clearSyncQueue}
              className="btn btn-danger"
              disabled={syncQueue.length === 0}
            >
              <X className="btn-icon" />
              Clear Queue
            </button>
          </div>
        </div>

        <div className="sync-queue">
          {syncQueue.length === 0 ? (
            <p className="empty-message">No items in sync queue</p>
          ) : (
            <div className="queue-list">
              {syncQueue.map((item) => (
                <div key={item.id} className={`queue-item ${item.status}`}>
                  <div className="queue-status">
                    {item.status === 'completed' && <Check className="status-icon success" />}
                    {item.status === 'failed' && <X className="status-icon error" />}
                    {item.status === 'syncing' && <RefreshCw className="status-icon syncing spin" />}
                    {item.status === 'pending' && <AlertCircle className="status-icon pending" />}
                  </div>
                  <div className="queue-details">
                    <span className="queue-action">{item.action}</span>
                    <span className="queue-meta">
                      {new Date(item.timestamp).toLocaleTimeString()}
                      {item.retries > 0 && ` • Retries: ${item.retries}`}
                    </span>
                  </div>
                  <div className="queue-data">
                    <code>{JSON.stringify(item.data)}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Offline Capabilities Demo */}
      <div className="section">
        <h2>Offline Capabilities</h2>
        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon">
              <Database />
            </div>
            <h3>Local Storage</h3>
            <p>Store data locally for offline access</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                localStorage.setItem('demo-data', JSON.stringify({ 
                  timestamp: Date.now(),
                  data: 'Stored offline'
                }));
                alert('Data saved to local storage');
              }}
            >
              Save Data
            </button>
          </div>

          <div className="capability-card">
            <div className="capability-icon">
              <Download />
            </div>
            <h3>Resource Caching</h3>
            <p>Cache assets for offline availability</p>
            <button 
              className="btn btn-outline"
              onClick={preCacheResources}
            >
              Cache Assets
            </button>
          </div>

          <div className="capability-card">
            <div className="capability-icon">
              <RefreshCw />
            </div>
            <h3>Background Sync</h3>
            <p>Sync data when connection restored</p>
            <button 
              className="btn btn-outline"
              onClick={() => addToSyncQueue('sync-demo', { test: true })}
            >
              Queue Sync
            </button>
          </div>

          <div className="capability-card">
            <div className="capability-icon">
              <Upload />
            </div>
            <h3>Offline Forms</h3>
            <p>Submit forms when back online</p>
            <button 
              className="btn btn-outline"
              onClick={() => addToSyncQueue('form-submission', { 
                form: 'contact',
                data: { name: 'John', email: 'john@example.com' }
              })}
            >
              Submit Offline
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .offline-advanced {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
        }

        .icon {
          width: 36px;
          height: 36px;
        }

        .status-card {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px var(--shadow-green);
          margin-bottom: 2rem;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 0.75rem;
          transition: transform 0.2s;
        }

        .status-item:hover {
          transform: translateY(-2px);
        }

        .status-item.online {
          background: linear-gradient(135deg, #d4f1d4, #e8f5e8);
        }

        .status-item.offline {
          background: linear-gradient(135deg, #ffe0e0, #fff5f5);
        }

        .status-icon {
          width: 32px;
          height: 32px;
          margin-bottom: 0.5rem;
          color: #1a5d3a;
        }

        .status-label {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .status-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .section {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px var(--shadow-green);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-header h2 {
          color: var(--text-primary);
          margin: 0;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }

        .btn-danger {
          background: #f87171;
          color: white;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #1a5d3a;
          color: #1a5d3a;
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        .progress-bar {
          position: relative;
          height: 30px;
          background: #f0f0f0;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #1a5d3a, #0a2f1d);
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 600;
          color: #333;
        }

        .cache-list {
          margin-top: 2rem;
        }

        .cache-list h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .resource-grid {
          display: grid;
          gap: 1rem;
        }

        .resource-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 0.5rem;
          transition: background 0.2s;
        }

        .resource-item:hover {
          background: #e9ecef;
        }

        .resource-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          color: #1a5d3a;
        }

        .resource-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .resource-url {
          font-weight: 600;
          color: var(--text-primary);
          word-break: break-all;
        }

        .resource-meta {
          font-size: 0.875rem;
          color: #666;
        }

        .sync-queue {
          margin-top: 1rem;
        }

        .queue-list {
          display: grid;
          gap: 1rem;
        }

        .queue-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 0.5rem;
          border-left: 4px solid transparent;
          transition: all 0.2s;
        }

        .queue-item.pending {
          border-left-color: #fbbf24;
        }

        .queue-item.syncing {
          border-left-color: #4ade80;
          background: #eff6ff;
        }

        .queue-item.completed {
          border-left-color: #34d399;
          background: #f0fdf4;
        }

        .queue-item.failed {
          border-left-color: #f87171;
          background: #fef2f2;
        }

        .queue-status {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .status-icon {
          width: 24px;
          height: 24px;
        }

        .status-icon.success {
          color: #34d399;
        }

        .status-icon.error {
          color: #f87171;
        }

        .status-icon.syncing {
          color: #4ade80;
        }

        .status-icon.pending {
          color: #fbbf24;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .queue-details {
          display: flex;
          flex-direction: column;
        }

        .queue-action {
          font-weight: 600;
          color: var(--text-primary);
        }

        .queue-meta {
          font-size: 0.875rem;
          color: #666;
        }

        .queue-data {
          padding: 0.5rem;
          background: var(--bg-secondary);
          border-radius: 0.25rem;
        }

        .queue-data code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #666;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .toggle-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .capability-card {
          padding: 2rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 1rem;
          text-align: center;
          transition: transform 0.2s;
        }

        .capability-card:hover {
          transform: translateY(-4px);
        }

        .capability-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          border-radius: 1rem;
          color: white;
          margin-bottom: 1rem;
        }

        .capability-icon svg {
          width: 30px;
          height: 30px;
        }

        .capability-card h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .capability-card p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .empty-message {
          text-align: center;
          color: #999;
          padding: 2rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default OfflineAdvanced;