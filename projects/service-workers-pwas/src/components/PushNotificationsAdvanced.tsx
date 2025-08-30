import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Send, Settings, Check, X, AlertCircle, Clock, Users, Package, MessageSquare, Shield } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  icon: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface NotificationLog {
  id: string;
  timestamp: Date;
  type: string;
  title: string;
  body: string;
  status: 'sent' | 'clicked' | 'dismissed' | 'failed';
  interaction?: string;
}

const PushNotificationsAdvanced: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<NotificationTemplate | null>(null);
  const [customNotification, setCustomNotification] = useState({
    title: '',
    body: '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: '',
    tag: '',
    requireInteraction: false,
    silent: false,
    vibrate: true,
    actions: false
  });
  const [notificationSettings, setNotificationSettings] = useState({
    marketing: true,
    updates: true,
    social: true,
    security: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  // Notification templates
  const templates: NotificationTemplate[] = [
    {
      id: 'welcome',
      title: 'Welcome to PWA Demo! 👋',
      body: 'Thanks for enabling notifications. You\'ll receive important updates here.',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200]
    },
    {
      id: 'update',
      title: 'App Update Available 🚀',
      body: 'A new version is ready. Click to update now!',
      icon: '/icon-192x192.png',
      requireInteraction: true,
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'later', title: 'Later' }
      ]
    },
    {
      id: 'message',
      title: 'New Message 💬',
      body: 'You have 3 unread messages from your team.',
      icon: '/icon-192x192.png',
      tag: 'message',
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    {
      id: 'reminder',
      title: 'Reminder ⏰',
      body: 'Your scheduled maintenance window starts in 30 minutes.',
      icon: '/icon-192x192.png',
      requireInteraction: true,
      vibrate: [500, 200, 500]
    },
    {
      id: 'security',
      title: 'Security Alert 🔐',
      body: 'New login detected from Chrome on Windows',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      requireInteraction: true,
      actions: [
        { action: 'allow', title: 'It was me' },
        { action: 'block', title: 'Not me' }
      ]
    },
    {
      id: 'social',
      title: 'Social Update 👥',
      body: 'John Doe and 5 others liked your post',
      icon: '/icon-192x192.png',
      silent: true,
      tag: 'social'
    }
  ];

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }

    // Load notification logs from localStorage
    const savedLogs = localStorage.getItem('notificationLogs');
    if (savedLogs) {
      setNotificationLogs(JSON.parse(savedLogs).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })));
    }

    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data.type === 'NOTIFICATION_CLICKED') {
      logNotification({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        type: 'interaction',
        title: event.data.notification.title,
        body: event.data.notification.body,
        status: 'clicked',
        interaction: event.data.action || 'click'
      });
    }
  };

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToNotifications();
        showNotification(templates[0]); // Show welcome notification
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, this would be your actual VAPID public key
      const vapidPublicKey = 'BKd0F3H5KBnj_Lq3nOKjgHZkqDq2vK1TbD5d1YJvVkE7kzJF1y_c8LZcGNqYYPZ4kCqJG5FZK5HqPm9aVkqyTzE';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      setSubscription(subscription);
      
      // In production, send subscription to your server
      console.log('Push subscription:', subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        setSubscription(null);
        
        // In production, notify your server about unsubscription
        console.log('Unsubscribed from notifications');
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  };

  const showNotification = async (template: NotificationTemplate) => {
    if (permission !== 'granted') {
      alert('Please enable notifications first');
      return;
    }

    // Check quiet hours
    if (notificationSettings.quietHours) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (isInQuietHours(currentTime, notificationSettings.quietStart, notificationSettings.quietEnd)) {
        console.log('Notification blocked due to quiet hours');
        return;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const options: NotificationOptions = {
        body: template.body,
        icon: template.icon,
        badge: template.badge,
        image: template.image,
        tag: template.tag,
        requireInteraction: template.requireInteraction,
        silent: template.silent,
        vibrate: template.vibrate,
        actions: template.actions,
        data: {
          url: window.location.href,
          timestamp: Date.now()
        }
      };

      await registration.showNotification(template.title, options);
      
      logNotification({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        type: template.id,
        title: template.title,
        body: template.body,
        status: 'sent'
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      
      logNotification({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        type: template.id,
        title: template.title,
        body: template.body,
        status: 'failed'
      });
    }
  };

  const showCustomNotification = async () => {
    if (!customNotification.title || !customNotification.body) {
      alert('Please enter title and body');
      return;
    }

    const template: NotificationTemplate = {
      id: 'custom',
      title: customNotification.title,
      body: customNotification.body,
      icon: customNotification.icon,
      badge: customNotification.badge,
      image: customNotification.image,
      tag: customNotification.tag,
      requireInteraction: customNotification.requireInteraction,
      silent: customNotification.silent,
      vibrate: customNotification.vibrate ? [200, 100, 200] : undefined,
      actions: customNotification.actions ? [
        { action: 'action1', title: 'Action 1' },
        { action: 'action2', title: 'Action 2' }
      ] : undefined
    };

    await showNotification(template);
  };

  const logNotification = (log: NotificationLog) => {
    const updatedLogs = [log, ...notificationLogs].slice(0, 50);
    setNotificationLogs(updatedLogs);
    localStorage.setItem('notificationLogs', JSON.stringify(updatedLogs));
  };

  const clearLogs = () => {
    setNotificationLogs([]);
    localStorage.removeItem('notificationLogs');
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const isInQuietHours = (current: string, start: string, end: string): boolean => {
    const [currentHour, currentMin] = current.split(':').map(Number);
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <Check className="status-icon granted" />;
      case 'denied':
        return <X className="status-icon denied" />;
      default:
        return <AlertCircle className="status-icon default" />;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare size={16} />;
      case 'security':
        return <Shield size={16} />;
      case 'social':
        return <Users size={16} />;
      case 'update':
        return <Package size={16} />;
      case 'reminder':
        return <Clock size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div className="push-notifications-advanced">
      <div className="page-header">
        <h1 className="page-title">
          <Bell className="icon" />
          Advanced Push Notifications
        </h1>
        <p className="page-subtitle">
          Rich notifications with actions, templates, and advanced features
        </p>
      </div>

      {/* Notification Status */}
      <div className="status-card">
        <h2>Notification Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Support</span>
            <span className={`status-value ${isSupported ? 'supported' : 'unsupported'}`}>
              {isSupported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Permission</span>
            <div className="permission-status">
              {getPermissionIcon()}
              <span className={`status-value ${permission}`}>{permission}</span>
            </div>
          </div>
          <div className="status-item">
            <span className="status-label">Subscription</span>
            <span className={`status-value ${subscription ? 'active' : 'inactive'}`}>
              {subscription ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Endpoint</span>
            <span className="status-value endpoint">
              {subscription ? subscription.endpoint.slice(-20) + '...' : 'None'}
            </span>
          </div>
        </div>

        <div className="button-group">
          {permission === 'default' && (
            <button onClick={requestPermission} className="btn btn-primary">
              <Bell className="btn-icon" />
              Enable Notifications
            </button>
          )}
          {permission === 'granted' && !subscription && (
            <button onClick={subscribeToNotifications} className="btn btn-primary">
              <Bell className="btn-icon" />
              Subscribe
            </button>
          )}
          {subscription && (
            <button onClick={unsubscribe} className="btn btn-danger">
              <BellOff className="btn-icon" />
              Unsubscribe
            </button>
          )}
        </div>
      </div>

      {/* Notification Templates */}
      <div className="section">
        <h2>Notification Templates</h2>
        <div className="templates-grid">
          {templates.map((template) => (
            <div 
              key={template.id}
              className={`template-card ${activeTemplate?.id === template.id ? 'active' : ''}`}
              onClick={() => setActiveTemplate(template)}
            >
              <div className="template-header">
                <h3>{template.title}</h3>
                {template.requireInteraction && (
                  <span className="badge badge-interaction">Interaction Required</span>
                )}
                {template.silent && (
                  <span className="badge badge-silent">Silent</span>
                )}
              </div>
              <p className="template-body">{template.body}</p>
              {template.actions && (
                <div className="template-actions">
                  {template.actions.map((action) => (
                    <span key={action.action} className="action-chip">
                      {action.title}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNotification(template);
                }}
                className="btn btn-sm btn-primary"
                disabled={permission !== 'granted'}
              >
                <Send size={14} className="btn-icon" />
                Send
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Notification Builder */}
      <div className="section">
        <h2>Custom Notification Builder</h2>
        <div className="builder-grid">
          <div className="builder-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={customNotification.title}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  title: e.target.value
                })}
                placeholder="Notification title"
              />
            </div>

            <div className="form-group">
              <label>Body *</label>
              <textarea
                value={customNotification.body}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  body: e.target.value
                })}
                placeholder="Notification body text"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Icon URL</label>
              <input
                type="text"
                value={customNotification.icon}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  icon: e.target.value
                })}
                placeholder="/icon-192x192.png"
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                value={customNotification.image}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  image: e.target.value
                })}
                placeholder="Optional image URL"
              />
            </div>

            <div className="form-group">
              <label>Tag</label>
              <input
                type="text"
                value={customNotification.tag}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  tag: e.target.value
                })}
                placeholder="Notification tag for grouping"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customNotification.requireInteraction}
                  onChange={(e) => setCustomNotification({
                    ...customNotification,
                    requireInteraction: e.target.checked
                  })}
                />
                <span>Require Interaction</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customNotification.silent}
                  onChange={(e) => setCustomNotification({
                    ...customNotification,
                    silent: e.target.checked
                  })}
                />
                <span>Silent</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customNotification.vibrate}
                  onChange={(e) => setCustomNotification({
                    ...customNotification,
                    vibrate: e.target.checked
                  })}
                />
                <span>Vibrate</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customNotification.actions}
                  onChange={(e) => setCustomNotification({
                    ...customNotification,
                    actions: e.target.checked
                  })}
                />
                <span>Include Actions</span>
              </label>
            </div>

            <button
              onClick={showCustomNotification}
              className="btn btn-primary"
              disabled={permission !== 'granted'}
            >
              <Send className="btn-icon" />
              Send Custom Notification
            </button>
          </div>

          <div className="builder-preview">
            <h3>Preview</h3>
            <div className="notification-preview">
              <div className="preview-header">
                <img src={customNotification.icon || '/icon-192x192.png'} alt="Icon" />
                <div>
                  <div className="preview-title">
                    {customNotification.title || 'Notification Title'}
                  </div>
                  <div className="preview-app">Your PWA</div>
                </div>
              </div>
              <div className="preview-body">
                {customNotification.body || 'Notification body text'}
              </div>
              {customNotification.image && (
                <img src={customNotification.image} alt="Notification" className="preview-image" />
              )}
              {customNotification.actions && (
                <div className="preview-actions">
                  <button>Action 1</button>
                  <button>Action 2</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="section">
        <h2>Notification Settings</h2>
        <div className="settings-grid">
          <div className="settings-group">
            <h3>Categories</h3>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={notificationSettings.marketing}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  marketing: e.target.checked
                })}
              />
              <span className="switch"></span>
              <span>Marketing & Promotions</span>
            </label>

            <label className="switch-label">
              <input
                type="checkbox"
                checked={notificationSettings.updates}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  updates: e.target.checked
                })}
              />
              <span className="switch"></span>
              <span>App Updates</span>
            </label>

            <label className="switch-label">
              <input
                type="checkbox"
                checked={notificationSettings.social}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  social: e.target.checked
                })}
              />
              <span className="switch"></span>
              <span>Social Interactions</span>
            </label>

            <label className="switch-label">
              <input
                type="checkbox"
                checked={notificationSettings.security}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  security: e.target.checked
                })}
              />
              <span className="switch"></span>
              <span>Security Alerts</span>
            </label>
          </div>

          <div className="settings-group">
            <h3>Quiet Hours</h3>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={notificationSettings.quietHours}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  quietHours: e.target.checked
                })}
              />
              <span className="switch"></span>
              <span>Enable Quiet Hours</span>
            </label>

            {notificationSettings.quietHours && (
              <div className="time-range">
                <input
                  type="time"
                  value={notificationSettings.quietStart}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    quietStart: e.target.value
                  })}
                />
                <span>to</span>
                <input
                  type="time"
                  value={notificationSettings.quietEnd}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    quietEnd: e.target.value
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification History */}
      <div className="section">
        <div className="section-header">
          <h2>Notification History ({notificationLogs.length})</h2>
          <button onClick={clearLogs} className="btn btn-secondary">
            Clear History
          </button>
        </div>
        
        {notificationLogs.length === 0 ? (
          <p className="empty-message">No notifications sent yet</p>
        ) : (
          <div className="history-list">
            {notificationLogs.map((log) => (
              <div key={log.id} className={`history-item ${log.status}`}>
                <div className="history-icon">
                  {getNotificationTypeIcon(log.type)}
                </div>
                <div className="history-details">
                  <div className="history-title">{log.title}</div>
                  <div className="history-body">{log.body}</div>
                  <div className="history-meta">
                    <span>{log.timestamp.toLocaleTimeString()}</span>
                    <span className={`status-badge ${log.status}`}>
                      {log.status}
                    </span>
                    {log.interaction && (
                      <span className="interaction-badge">{log.interaction}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .push-notifications-advanced {
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
          color: #1a1a2e;
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
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-label {
          font-size: 0.875rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-value {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .status-value.supported {
          color: #10b981;
        }

        .status-value.unsupported {
          color: #ef4444;
        }

        .status-value.granted {
          color: #10b981;
        }

        .status-value.denied {
          color: #ef4444;
        }

        .status-value.default {
          color: #f59e0b;
        }

        .status-value.active {
          color: #10b981;
        }

        .status-value.inactive {
          color: #6b7280;
        }

        .status-value.endpoint {
          font-family: monospace;
          font-size: 0.875rem;
          word-break: break-all;
        }

        .permission-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-icon {
          width: 20px;
          height: 20px;
        }

        .status-icon.granted {
          color: #10b981;
        }

        .status-icon.denied {
          color: #ef4444;
        }

        .status-icon.default {
          color: #f59e0b;
        }

        .section {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .section h2 {
          color: #1a1a2e;
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
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
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .template-card {
          padding: 1.5rem;
          background: #f9fafb;
          border: 2px solid transparent;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .template-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .template-card.active {
          border-color: #667eea;
          background: #eef2ff;
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .template-header h3 {
          margin: 0;
          color: #1a1a2e;
        }

        .template-body {
          color: #4b5563;
          margin-bottom: 1rem;
        }

        .template-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .action-chip {
          padding: 0.25rem 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-interaction {
          background: #fee2e2;
          color: #dc2626;
        }

        .badge-silent {
          background: #f3f4f6;
          color: #6b7280;
        }

        .builder-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .builder-grid {
            grid-template-columns: 1fr;
          }
        }

        .builder-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .builder-preview {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .builder-preview h3 {
          margin-bottom: 1rem;
          color: #1a1a2e;
        }

        .notification-preview {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .preview-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .preview-header img {
          width: 40px;
          height: 40px;
          border-radius: 0.25rem;
        }

        .preview-title {
          font-weight: 600;
          color: #1a1a2e;
        }

        .preview-app {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .preview-body {
          color: #4b5563;
          margin-bottom: 0.75rem;
        }

        .preview-image {
          width: 100%;
          border-radius: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }

        .preview-actions button {
          flex: 1;
          padding: 0.5rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          color: #4b5563;
          cursor: pointer;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .settings-group h3 {
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
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
          background-color: #667eea;
        }

        .switch-label input:checked + .switch::before {
          transform: translateX(24px);
        }

        .switch {
          background-color: #ccc;
          border-radius: 24px;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .time-range input[type="time"] {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border-left: 4px solid transparent;
        }

        .history-item.sent {
          border-left-color: #10b981;
        }

        .history-item.clicked {
          border-left-color: #3b82f6;
        }

        .history-item.dismissed {
          border-left-color: #f59e0b;
        }

        .history-item.failed {
          border-left-color: #ef4444;
        }

        .history-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 0.25rem;
          color: #6b7280;
        }

        .history-details {
          flex: 1;
        }

        .history-title {
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 0.25rem;
        }

        .history-body {
          color: #4b5563;
          margin-bottom: 0.5rem;
        }

        .history-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.sent {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.clicked {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.dismissed {
          background: #fed7aa;
          color: #92400e;
        }

        .status-badge.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .interaction-badge {
          padding: 0.125rem 0.5rem;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .empty-message {
          text-align: center;
          color: #9ca3af;
          padding: 3rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default PushNotificationsAdvanced;