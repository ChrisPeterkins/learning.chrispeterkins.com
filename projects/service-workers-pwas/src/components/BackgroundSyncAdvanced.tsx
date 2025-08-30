import React, { useState, useEffect } from 'react';
import { RefreshCw, Upload, Download, Check, X, Clock, AlertCircle, Zap, Database, Wifi, WifiOff, Activity } from 'lucide-react';

interface SyncTask {
  id: string;
  type: 'upload' | 'download' | 'api' | 'form';
  data: any;
  url: string;
  method: string;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retries: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
  size?: number;
  progress?: number;
  error?: string;
}

interface SyncStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  config: {
    retryDelay: number;
    maxRetries: number;
    batchSize: number;
    priority: 'low' | 'normal' | 'high';
  };
}

const BackgroundSyncAdvanced: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30000); // 30 seconds
  const [selectedStrategy, setSelectedStrategy] = useState('normal');
  const [syncStats, setSyncStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    dataTransferred: 0
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncLog, setSyncLog] = useState<string[]>([]);

  const syncStrategies: SyncStrategy[] = [
    {
      id: 'aggressive',
      name: 'Aggressive Sync',
      description: 'Immediate retry with short delays',
      icon: <Zap size={20} />,
      config: {
        retryDelay: 1000,
        maxRetries: 10,
        batchSize: 10,
        priority: 'high'
      }
    },
    {
      id: 'normal',
      name: 'Normal Sync',
      description: 'Balanced approach for most use cases',
      icon: <RefreshCw size={20} />,
      config: {
        retryDelay: 5000,
        maxRetries: 5,
        batchSize: 5,
        priority: 'normal'
      }
    },
    {
      id: 'conservative',
      name: 'Conservative Sync',
      description: 'Fewer retries, longer delays, saves battery',
      icon: <Clock size={20} />,
      config: {
        retryDelay: 30000,
        maxRetries: 3,
        batchSize: 3,
        priority: 'low'
      }
    },
    {
      id: 'wifi-only',
      name: 'WiFi Only',
      description: 'Sync only on unmetered connections',
      icon: <Wifi size={20} />,
      config: {
        retryDelay: 60000,
        maxRetries: 3,
        batchSize: 10,
        priority: 'low'
      }
    }
  ];

  useEffect(() => {
    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      addLog('Connection restored');
      if (autoSync) {
        performBackgroundSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      addLog('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load saved tasks from localStorage
    const savedTasks = localStorage.getItem('syncTasks');
    if (savedTasks) {
      setSyncTasks(JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        timestamp: new Date(task.timestamp)
      })));
    }

    // Set up periodic sync
    const interval = setInterval(() => {
      if (autoSync && isOnline) {
        performBackgroundSync();
      }
    }, syncInterval);

    // Register service worker sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      registerBackgroundSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [autoSync, syncInterval, isOnline]);

  useEffect(() => {
    // Update stats
    const stats = {
      total: syncTasks.length,
      completed: syncTasks.filter(t => t.status === 'completed').length,
      failed: syncTasks.filter(t => t.status === 'failed').length,
      pending: syncTasks.filter(t => t.status === 'pending').length,
      dataTransferred: syncTasks
        .filter(t => t.status === 'completed')
        .reduce((acc, t) => acc + (t.size || 0), 0)
    };
    setSyncStats(stats);

    // Save tasks to localStorage
    localStorage.setItem('syncTasks', JSON.stringify(syncTasks));
  }, [syncTasks]);

  const registerBackgroundSync = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await (registration as any).sync.register('background-sync');
        addLog('Background sync registered');
      }
      
      if ('periodicSync' in registration) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName,
        });
        
        if (status.state === 'granted') {
          await (registration as any).periodicSync.register('periodic-sync', {
            minInterval: syncInterval
          });
          addLog('Periodic background sync registered');
        }
      }
    } catch (error) {
      console.error('Error registering background sync:', error);
      addLog(`Failed to register background sync: ${error}`);
    }
  };

  const addLog = (message: string) => {
    setSyncLog(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 49)
    ]);
  };

  const createSyncTask = (type: 'upload' | 'download' | 'api' | 'form', data: any = {}) => {
    const strategy = syncStrategies.find(s => s.id === selectedStrategy) || syncStrategies[1];
    
    const task: SyncTask = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      url: `/api/${type}`,
      method: type === 'download' ? 'GET' : 'POST',
      timestamp: new Date(),
      status: 'pending',
      retries: 0,
      maxRetries: strategy.config.maxRetries,
      priority: strategy.config.priority,
      size: JSON.stringify(data).length,
      progress: 0
    };

    setSyncTasks(prev => [...prev, task]);
    addLog(`Task created: ${type} (${task.id})`);

    if (isOnline && autoSync) {
      setTimeout(() => syncTask(task), 1000);
    }

    return task;
  };

  const syncTask = async (task: SyncTask) => {
    if (task.status === 'completed' || task.status === 'syncing') {
      return;
    }

    setSyncTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'syncing', progress: 0 } : t
    ));

    addLog(`Syncing task: ${task.type} (${task.id})`);

    try {
      // Simulate progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, progress: i } : t
        ));
      }

      // Simulate API call with possible failure
      const success = Math.random() > 0.3;
      
      if (success) {
        setSyncTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
        ));
        addLog(`Task completed: ${task.type} (${task.id})`);
        setLastSyncTime(new Date());
      } else {
        throw new Error('Simulated sync failure');
      }
    } catch (error: any) {
      const updatedTask = {
        ...task,
        status: 'failed' as const,
        retries: task.retries + 1,
        error: error.message,
        progress: 0
      };

      setSyncTasks(prev => prev.map(t => 
        t.id === task.id ? updatedTask : t
      ));

      addLog(`Task failed: ${task.type} (${task.id}) - ${error.message}`);

      // Retry if under max retries
      if (updatedTask.retries < updatedTask.maxRetries) {
        const strategy = syncStrategies.find(s => s.id === selectedStrategy) || syncStrategies[1];
        const delay = strategy.config.retryDelay * Math.pow(2, updatedTask.retries - 1);
        
        addLog(`Retrying task in ${delay}ms: ${task.type} (${task.id})`);
        
        setTimeout(() => {
          syncTask(updatedTask);
        }, delay);
      }
    }
  };

  const performBackgroundSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    addLog('Starting background sync...');

    const pendingTasks = syncTasks.filter(t => 
      t.status === 'pending' || (t.status === 'failed' && t.retries < t.maxRetries)
    );

    // Sort by priority
    pendingTasks.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const strategy = syncStrategies.find(s => s.id === selectedStrategy) || syncStrategies[1];
    const batch = pendingTasks.slice(0, strategy.config.batchSize);

    for (const task of batch) {
      await syncTask(task);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsSyncing(false);
    addLog(`Background sync completed. Processed ${batch.length} tasks`);
  };

  const clearCompletedTasks = () => {
    setSyncTasks(prev => prev.filter(t => t.status !== 'completed'));
    addLog('Cleared completed tasks');
  };

  const clearAllTasks = () => {
    setSyncTasks([]);
    localStorage.removeItem('syncTasks');
    addLog('Cleared all tasks');
  };

  const retryFailedTasks = () => {
    setSyncTasks(prev => prev.map(t => 
      t.status === 'failed' ? { ...t, status: 'pending', retries: 0, error: undefined } : t
    ));
    addLog('Reset failed tasks for retry');
    
    if (isOnline && autoSync) {
      performBackgroundSync();
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload size={16} />;
      case 'download':
        return <Download size={16} />;
      case 'api':
        return <Database size={16} />;
      case 'form':
        return <AlertCircle size={16} />;
      default:
        return <RefreshCw size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="status-icon success" />;
      case 'failed':
        return <X className="status-icon error" />;
      case 'syncing':
        return <RefreshCw className="status-icon syncing spin" />;
      case 'pending':
        return <Clock className="status-icon pending" />;
      default:
        return null;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="background-sync-advanced">
      <div className="page-header">
        <h1 className="page-title">
          <RefreshCw className="icon" />
          Advanced Background Sync
        </h1>
        <p className="page-subtitle">
          Reliable data synchronization with retry strategies and offline support
        </p>
      </div>

      {/* Sync Status Dashboard */}
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Sync Dashboard</h2>
          <div className="connection-status">
            {isOnline ? (
              <>
                <Wifi className="status-icon online" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="status-icon offline" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{syncStats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{syncStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{syncStats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card error">
            <div className="stat-value">{syncStats.failed}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatBytes(syncStats.dataTransferred)}</div>
            <div className="stat-label">Data Synced</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never'}
            </div>
            <div className="stat-label">Last Sync</div>
          </div>
        </div>

        <div className="controls">
          <div className="control-group">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
              />
              <span className="switch"></span>
              <span>Auto Sync</span>
            </label>
          </div>

          <div className="control-group">
            <label>Sync Interval</label>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              className="select-input"
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </div>

          <button
            onClick={performBackgroundSync}
            disabled={!isOnline || isSyncing}
            className="btn btn-primary"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="btn-icon spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="btn-icon" />
                Sync Now
              </>
            )}
          </button>

          <button
            onClick={retryFailedTasks}
            disabled={syncStats.failed === 0}
            className="btn btn-secondary"
          >
            Retry Failed
          </button>
        </div>
      </div>

      {/* Sync Strategies */}
      <div className="section">
        <h2>Sync Strategy</h2>
        <div className="strategies-grid">
          {syncStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`strategy-card ${selectedStrategy === strategy.id ? 'active' : ''}`}
              onClick={() => setSelectedStrategy(strategy.id)}
            >
              <div className="strategy-icon">{strategy.icon}</div>
              <h3>{strategy.name}</h3>
              <p>{strategy.description}</p>
              <div className="strategy-config">
                <div className="config-item">
                  <span>Retry Delay:</span>
                  <strong>{strategy.config.retryDelay}ms</strong>
                </div>
                <div className="config-item">
                  <span>Max Retries:</span>
                  <strong>{strategy.config.maxRetries}</strong>
                </div>
                <div className="config-item">
                  <span>Batch Size:</span>
                  <strong>{strategy.config.batchSize}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Actions */}
      <div className="section">
        <h2>Test Sync Operations</h2>
        <div className="test-actions">
          <button
            onClick={() => createSyncTask('upload', { 
              file: 'document.pdf',
              size: 1024000,
              timestamp: Date.now()
            })}
            className="btn btn-outline"
          >
            <Upload className="btn-icon" />
            Add Upload Task
          </button>

          <button
            onClick={() => createSyncTask('download', {
              resource: 'data.json',
              version: '1.0.0'
            })}
            className="btn btn-outline"
          >
            <Download className="btn-icon" />
            Add Download Task
          </button>

          <button
            onClick={() => createSyncTask('api', {
              endpoint: '/api/update',
              method: 'POST',
              data: { id: 123, value: 'test' }
            })}
            className="btn btn-outline"
          >
            <Database className="btn-icon" />
            Add API Call
          </button>

          <button
            onClick={() => createSyncTask('form', {
              formId: 'contact',
              fields: {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Test message'
              }
            })}
            className="btn btn-outline"
          >
            <AlertCircle className="btn-icon" />
            Add Form Submission
          </button>
        </div>
      </div>

      {/* Sync Queue */}
      <div className="section">
        <div className="section-header">
          <h2>Sync Queue ({syncTasks.length})</h2>
          <div className="button-group">
            <button
              onClick={clearCompletedTasks}
              className="btn btn-secondary"
              disabled={syncStats.completed === 0}
            >
              Clear Completed
            </button>
            <button
              onClick={clearAllTasks}
              className="btn btn-danger"
              disabled={syncTasks.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        {syncTasks.length === 0 ? (
          <p className="empty-message">No sync tasks in queue</p>
        ) : (
          <div className="task-list">
            {syncTasks.map((task) => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <div className="task-status">
                  {getStatusIcon(task.status)}
                </div>
                <div className="task-icon">
                  {getTaskIcon(task.type)}
                </div>
                <div className="task-details">
                  <div className="task-header">
                    <span className="task-type">{task.type.toUpperCase()}</span>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-meta">
                    <span>{task.timestamp.toLocaleTimeString()}</span>
                    {task.size && <span>{formatBytes(task.size)}</span>}
                    {task.retries > 0 && (
                      <span className="retry-badge">
                        Retry {task.retries}/{task.maxRetries}
                      </span>
                    )}
                  </div>
                  {task.error && (
                    <div className="task-error">{task.error}</div>
                  )}
                  {task.status === 'syncing' && task.progress !== undefined && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="task-data">
                  <code>{JSON.stringify(task.data, null, 2)}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Activity Log */}
      <div className="section">
        <div className="section-header">
          <h2>Activity Log</h2>
          <button
            onClick={() => setSyncLog([])}
            className="btn btn-secondary"
          >
            Clear Log
          </button>
        </div>
        
        <div className="activity-log">
          {syncLog.length === 0 ? (
            <p className="empty-message">No activity logged</p>
          ) : (
            syncLog.map((entry, index) => (
              <div key={index} className="log-entry">
                <Activity size={14} />
                <span>{entry}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .background-sync-advanced {
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

        .dashboard {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px var(--shadow-green);
          margin-bottom: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(15, 25, 20, 0.3);
          border-radius: 2rem;
          font-weight: 600;
        }

        .status-icon.online {
          color: #10b981;
        }

        .status-icon.offline {
          color: #ef4444;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 0.75rem;
          text-align: center;
        }

        .stat-card.success {
          background: linear-gradient(135deg, #d1fae5, #ecfdf5);
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #fed7aa, #fff7ed);
        }

        .stat-card.error {
          background: linear-gradient(135deg, #fee2e2, #fef2f2);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.5rem;
        }

        .controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-group label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .select-input {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: var(--bg-secondary);
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          background-color: #ccc;
          border-radius: 24px;
          transition: background-color 0.3s;
        }

        .switch-label input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch::before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .switch-label input:checked + .switch {
          background-color: #1a5d3a;
        }

        .switch-label input:checked + .switch::before {
          transform: translateX(24px);
        }

        .section {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px var(--shadow-green);
        }

        .section h2 {
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          margin: 0;
        }

        .button-group {
          display: flex;
          gap: 1rem;
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
          box-shadow: 0 4px 12px rgba(26, 93, 58, 0.4);
        }

        .btn-secondary {
          background: #e5e7eb;
          color: var(--text-primary);
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #e5e7eb;
          color: var(--text-primary);
        }

        .btn-outline:hover {
          background: rgba(15, 25, 20, 0.4);
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        .strategies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .strategy-card {
          padding: 1.5rem;
          background: rgba(15, 25, 20, 0.4);
          border: 2px solid transparent;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .strategy-card:hover {
          border-color: #1a5d3a;
          transform: translateY(-2px);
        }

        .strategy-card.active {
          border-color: #1a5d3a;
          background: linear-gradient(135deg, #eef2ff, #f9fafb);
        }

        .strategy-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          color: #1a5d3a;
        }

        .strategy-card h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .strategy-card p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .strategy-config {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .config-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .config-item span {
          color: var(--text-secondary);
        }

        .config-item strong {
          color: var(--text-primary);
        }

        .test-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-item {
          display: grid;
          grid-template-columns: auto auto 1fr auto;
          gap: 1rem;
          align-items: start;
          padding: 1rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 0.5rem;
          border-left: 4px solid transparent;
        }

        .task-item.pending {
          border-left-color: #fbbf24;
        }

        .task-item.syncing {
          border-left-color: #4ade80;
          background: #eff6ff;
        }

        .task-item.completed {
          border-left-color: #34d399;
          background: #f0fdf4;
        }

        .task-item.failed {
          border-left-color: #f87171;
          background: #fef2f2;
        }

        .task-status {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .status-icon {
          width: 24px;
          height: 24px;
        }

        .status-icon.success {
          color: #10b981;
        }

        .status-icon.error {
          color: #ef4444;
        }

        .status-icon.syncing {
          color: #2d7a4e;
        }

        .status-icon.pending {
          color: #f59e0b;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .task-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--bg-secondary);
          border-radius: 0.25rem;
          color: var(--text-secondary);
        }

        .task-details {
          flex: 1;
        }

        .task-header {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .task-type {
          font-weight: 600;
          color: var(--text-primary);
        }

        .priority-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-badge.high {
          background: #fee2e2;
          color: #991b1b;
        }

        .priority-badge.normal {
          background: #dbeafe;
          color: #1e40af;
        }

        .priority-badge.low {
          background: rgba(15, 25, 20, 0.3);
          color: var(--text-secondary);
        }

        .task-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .retry-badge {
          padding: 0.125rem 0.5rem;
          background: #fef3c7;
          color: #92400e;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .task-error {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .progress-bar {
          margin-top: 0.5rem;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a5d3a, #0a2f1d);
          transition: width 0.3s ease;
        }

        .task-data {
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 0.25rem;
          max-width: 300px;
        }

        .task-data code {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-all;
        }

        .activity-log {
          max-height: 300px;
          overflow-y: auto;
          padding: 1rem;
          background: rgba(15, 25, 20, 0.4);
          border-radius: 0.5rem;
        }

        .log-entry {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--text-secondary);
          border-bottom: 1px solid #e5e7eb;
        }

        .log-entry:last-child {
          border-bottom: none;
        }

        .empty-message {
          text-align: center;
          color: var(--text-muted);
          padding: 3rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default BackgroundSyncAdvanced;