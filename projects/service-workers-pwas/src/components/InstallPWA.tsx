import React, { useState, useEffect } from 'react';

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if already installed
    if (standalone) {
      setIsInstalled(true);
    }

    // Check for iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
  };

  const manifestFeatures = [
    { name: 'App Name', value: 'Service Workers & PWAs', icon: '📱' },
    { name: 'Short Name', value: 'PWA Demo', icon: '⚡' },
    { name: 'Theme Color', value: '#004225', icon: '🎨' },
    { name: 'Background Color', value: '#0a0f0d', icon: '🖼️' },
    { name: 'Display Mode', value: 'standalone', icon: '🖥️' },
    { name: 'Orientation', value: 'any', icon: '🔄' }
  ];

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Install as PWA</h1>
        <p className="demo-description">
          Progressive Web Apps can be installed on devices just like native apps.
          They appear on the home screen, work offline, and provide a native app-like experience.
        </p>
      </div>

      {!isStandalone && (
        <div className="install-banner">
          <h3>Install This App</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            {isInstalled 
              ? 'This app is already installed on your device!'
              : isIOS
              ? 'To install on iOS: Tap the share button and select "Add to Home Screen"'
              : 'Install this app for a better experience with offline support and quick access.'}
          </p>
          {!isIOS && !isInstalled && (
            <button 
              className="btn" 
              onClick={handleInstall}
              disabled={!deferredPrompt}
              style={{ marginTop: '1rem' }}
            >
              {deferredPrompt ? 'Install App' : 'Installation Not Available'}
            </button>
          )}
        </div>
      )}

      {isStandalone && (
        <div className="status-card">
          <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>
            Running as Installed App
          </h3>
          <p style={{ color: '#94a3b8' }}>
            You're viewing this app in standalone mode. It's installed on your device!
          </p>
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>App Manifest</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            The web app manifest defines how your app appears and behaves when installed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {manifestFeatures.map((feature, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(15, 25, 20, 0.4)',
                borderLeft: '2px solid rgba(26, 93, 58, 0.3)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                <div>
                  <strong style={{ color: '#f0f4f2', fontSize: '0.9rem' }}>{feature.name}</strong>
                  <div style={{ color: '#8fa99b', fontSize: '0.85rem' }}>{feature.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Installation Benefits</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              <strong>Home Screen Access:</strong> Launch directly from your device's home screen
            </li>
            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              <strong>Offline Support:</strong> Works without an internet connection
            </li>
            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              <strong>Full Screen:</strong> No browser UI for immersive experience
            </li>
            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              <strong>App Switching:</strong> Appears in app switcher like native apps
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              <strong>Push Notifications:</strong> Receive updates even when app is closed
            </li>
          </ul>
        </div>
      </div>

      <div className="code-block">
        <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Manifest.json Example</h3>
        <pre>{`{
  "name": "Service Workers & PWAs Demo",
  "short_name": "PWA Demo",
  "description": "Learn about PWA features",
  "start_url": "/projects/service-workers-pwas/",
  "display": "standalone",
  "theme_color": "#004225",
  "background_color": "#0a0f0d",
  "orientation": "any",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`}</pre>
      </div>

      <div className="info-panel" style={{ marginTop: '2rem' }}>
        <h3>Platform Support</h3>
        <div className="grid grid-3" style={{ marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Desktop</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              <li>✅ Chrome/Edge</li>
              <li>✅ Firefox</li>
              <li>⚠️ Safari (limited)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Mobile</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              <li>✅ Android Chrome</li>
              <li>✅ Samsung Internet</li>
              <li>⚠️ iOS Safari (manual)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Features</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              <li>✅ Install prompt</li>
              <li>✅ App shortcuts</li>
              <li>✅ Badge API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallPWA;