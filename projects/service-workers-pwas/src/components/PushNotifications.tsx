import React, { useState, useEffect } from 'react';

function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Check existing subscription
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      // Subscribe to push notifications
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BKagOny0KF_2pCJQ3m5' // This is a demo key
        });
        setSubscription(sub);
      } catch (error) {
        console.error('Failed to subscribe:', error);
      }
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      // Show notification
      const notification = new Notification('PWA Test Notification', {
        body: 'This is a test notification from your PWA!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        requireInteraction: false,
        actions: [
          { action: 'explore', title: 'Explore' },
          { action: 'close', title: 'Close' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const sendDelayedNotification = () => {
    if (permission === 'granted') {
      setTimeout(() => {
        new Notification('Delayed Notification', {
          body: 'This notification was sent after a 5 second delay!',
          icon: '/icon-192.png',
          silent: false
        });
      }, 5000);
      
      alert('Notification will appear in 5 seconds...');
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Push Notifications</h1>
        <p className="demo-description">
          PWAs can send push notifications to engage users, even when the app isn't open.
          Notifications require user permission and can include actions, images, and vibration patterns.
        </p>
      </div>

      <div className="status-card">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Notification Status</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              Support: <strong style={{ color: isSupported ? '#4ade80' : '#dc2626' }}>
                {isSupported ? 'Supported' : 'Not Supported'}
              </strong>
            </p>
            <p style={{ color: '#94a3b8' }}>
              Permission: <strong style={{ 
                color: permission === 'granted' ? '#4ade80' : 
                       permission === 'denied' ? '#dc2626' : '#f0c674' 
              }}>
                {permission.charAt(0).toUpperCase() + permission.slice(1)}
              </strong>
            </p>
          </div>
          {subscription && (
            <div>
              <p style={{ color: '#94a3b8' }}>
                Push Subscription: <strong style={{ color: '#4ade80' }}>Active</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="controls-section">
        <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Notification Controls</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn"
            onClick={requestPermission}
            disabled={!isSupported || permission === 'granted'}
          >
            {permission === 'granted' ? 'Permission Granted' : 'Request Permission'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={sendTestNotification}
            disabled={!isSupported || permission !== 'granted'}
          >
            Send Test Notification
          </button>
          <button 
            className="btn btn-secondary"
            onClick={sendDelayedNotification}
            disabled={!isSupported || permission !== 'granted'}
          >
            Send Delayed (5s)
          </button>
          {subscription && (
            <button 
              className="btn btn-secondary"
              onClick={unsubscribe}
            >
              Unsubscribe
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>Notification Types</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              <strong>Basic:</strong> Simple title and body text
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              <strong>Rich:</strong> Include images, icons, and badges
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              <strong>Actions:</strong> Add buttons for user interaction
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              <strong>Silent:</strong> No sound or vibration
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Best Practices</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Ask permission at the right time
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Provide value with each notification
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Allow users to customize preferences
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Don't spam users
            </li>
          </ul>
        </div>
      </div>

      <div className="code-block">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Implementation Example</h3>
        <pre>{`// Request notification permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Create notification
  const notification = new Notification('Hello PWA!', {
    body: 'This is a notification from your PWA',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });

  // Handle notification click
  notification.onclick = (event) => {
    event.preventDefault();
    window.open('https://example.com');
    notification.close();
  };
}`}</pre>
      </div>
    </div>
  );
}

export default PushNotifications;