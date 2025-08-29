import React from 'react';
import { Monitor, Check, X, AlertCircle } from 'lucide-react';

const CompatibilityPage: React.FC = () => {
  const apis = [
    {
      name: 'CSS Paint API',
      description: 'Custom paint worklets for backgrounds and images',
      chrome: { supported: true, version: '65+' },
      firefox: { supported: true, version: '90+' },
      safari: { supported: false, version: 'No' },
      edge: { supported: true, version: '79+' },
      status: 'Stable'
    },
    {
      name: 'Properties & Values API',
      description: 'Register custom CSS properties with types',
      chrome: { supported: true, version: '78+' },
      firefox: { supported: false, version: 'No' },
      safari: { supported: true, version: '16.4+' },
      edge: { supported: true, version: '79+' },
      status: 'Partial'
    },
    {
      name: 'CSS Layout API',
      description: 'Custom layout algorithms',
      chrome: { supported: 'flag', version: 'Flag' },
      firefox: { supported: false, version: 'No' },
      safari: { supported: false, version: 'No' },
      edge: { supported: 'flag', version: 'Flag' },
      status: 'Experimental'
    },
    {
      name: 'Animation Worklet',
      description: 'High-performance custom animations',
      chrome: { supported: 'flag', version: 'Flag' },
      firefox: { supported: false, version: 'No' },
      safari: { supported: false, version: 'No' },
      edge: { supported: 'flag', version: 'Flag' },
      status: 'Experimental'
    },
    {
      name: 'CSS Typed OM',
      description: 'Typed CSS value manipulation',
      chrome: { supported: true, version: '66+' },
      firefox: { supported: false, version: 'No' },
      safari: { supported: true, version: '16.4+' },
      edge: { supported: true, version: '79+' },
      status: 'Partial'
    }
  ];

  const getStatusIcon = (supported: boolean | string) => {
    if (supported === true) return <Check size={16} color="#28a745" />;
    if (supported === 'flag') return <AlertCircle size={16} color="#ffc107" />;
    return <X size={16} color="#dc3545" />;
  };

  const getStatusClass = (supported: boolean | string) => {
    if (supported === true) return 'browser-item--supported';
    if (supported === 'flag') return 'browser-item--partial';
    return 'browser-item--unsupported';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Monitor className="inline" size={32} />
          Browser Compatibility
        </h1>
        <p className="page-subtitle">
          CSS Houdini APIs are gradually being implemented across browsers. 
          Here's the current support status for each API.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">API Support Matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  API
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>
                  Chrome
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>
                  Firefox
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>
                  Safari
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>
                  Edge
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e9ecef' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {apis.map((api, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <strong>{api.name}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                        {api.description}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(api.chrome.supported)}
                      <span style={{ fontSize: '0.85rem' }}>{api.chrome.version}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(api.firefox.supported)}
                      <span style={{ fontSize: '0.85rem' }}>{api.firefox.version}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(api.safari.supported)}
                      <span style={{ fontSize: '0.85rem' }}>{api.safari.version}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(api.edge.supported)}
                      <span style={{ fontSize: '0.85rem' }}>{api.edge.version}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span className={`browser-item ${
                      api.status === 'Stable' ? 'browser-item--supported' :
                      api.status === 'Partial' ? 'browser-item--partial' :
                      'browser-item--unsupported'
                    }`} style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                      {api.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Legend</h2>
        <div className="browser-support" style={{ justifyContent: 'flex-start' }}>
          <div className="browser-item browser-item--supported">
            <Check size={16} />
            <span>Full Support</span>
          </div>
          <div className="browser-item browser-item--partial">
            <AlertCircle size={16} />
            <span>Behind Flag / Partial</span>
          </div>
          <div className="browser-item browser-item--unsupported">
            <X size={16} />
            <span>Not Supported</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Detection and Fallbacks</h2>
        <p className="section-description">
          Always check for feature support before using Houdini APIs in production.
        </p>
        
        <div className="code-container">
          <div className="code-header">Feature Detection</div>
          <div className="code-content">
            <pre>{`// Check for Paint API support
if ('CSS' in window && 'paintWorklet' in CSS) {
  // Register paint worklets
  CSS.paintWorklet.addModule('/worklets/my-painter.js');
} else {
  // Fallback to regular CSS background
  element.style.background = 'linear-gradient(45deg, #f00, #00f)';
}

// Check for Properties API support
if ('CSS' in window && 'registerProperty' in CSS) {
  CSS.registerProperty({
    name: '--my-prop',
    syntax: '<color>',
    inherits: false,
    initialValue: '#000'
  });
}

// Check for Animation Worklet support
if ('CSS' in window && 'animationWorklet' in CSS) {
  CSS.animationWorklet.addModule('/worklets/my-animator.js');
}`}</pre>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Progressive Enhancement</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Check size={24} />
            </div>
            <h3 className="feature-title">Feature Detection</h3>
            <p className="feature-description">
              Always check for API availability before using Houdini features
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <AlertCircle size={24} />
            </div>
            <h3 className="feature-title">Graceful Fallbacks</h3>
            <p className="feature-description">
              Provide CSS fallbacks for unsupported browsers
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Monitor size={24} />
            </div>
            <h3 className="feature-title">Cross-Browser</h3>
            <p className="feature-description">
              Test across different browsers and versions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityPage;