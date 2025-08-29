import React, { useState, useEffect } from 'react';

interface PerformanceData {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  loadTime: number | null;
  cacheHitRate: number;
  offlineCapable: boolean;
}

function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceData>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    loadTime: null,
    cacheHitRate: 0,
    offlineCapable: false
  });
  const [lighthouse, setLighthouse] = useState({
    performance: 0,
    pwa: 0,
    bestPractices: 0
  });

  useEffect(() => {
    // Collect Web Vitals
    collectWebVitals();
    
    // Check offline capability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setMetrics(prev => ({ ...prev, offlineCapable: true }));
      });
    }

    // Simulate Lighthouse scores
    setTimeout(() => {
      setLighthouse({
        performance: 92,
        pwa: 100,
        bestPractices: 95
      });
    }, 1000);
  }, []);

  const collectWebVitals = () => {
    // First Contentful Paint (FCP)
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      setMetrics(prev => ({ ...prev, fcp: Math.round(fcp.startTime) }));
    }

    // Load Time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const ttfb = navigation.responseStart - navigation.fetchStart;
      setMetrics(prev => ({ 
        ...prev, 
        loadTime: Math.round(loadTime),
        ttfb: Math.round(ttfb)
      }));
    }

    // Simulate other metrics
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        lcp: 1800,
        fid: 50,
        cls: 0.05,
        cacheHitRate: 75
      }));
    }, 500);
  };

  const runPerformanceAudit = () => {
    // Clear metrics
    setMetrics({
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      loadTime: null,
      cacheHitRate: 0,
      offlineCapable: metrics.offlineCapable
    });

    // Re-collect
    setTimeout(() => {
      collectWebVitals();
      alert('Performance audit complete! Check the updated metrics.');
    }, 100);
  };

  const getMetricStatus = (metric: string, value: number | null) => {
    if (value === null) return { color: '#8fa99b', status: 'Measuring...' };
    
    const thresholds: any = {
      fcp: { good: 1800, needs: 3000 },
      lcp: { good: 2500, needs: 4000 },
      fid: { good: 100, needs: 300 },
      cls: { good: 0.1, needs: 0.25 },
      ttfb: { good: 800, needs: 1800 },
      loadTime: { good: 3000, needs: 5000 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return { color: '#4ade80', status: 'Good' };

    if (value <= threshold.good) {
      return { color: '#4ade80', status: 'Good' };
    } else if (value <= threshold.needs) {
      return { color: '#f0c674', status: 'Needs Improvement' };
    } else {
      return { color: '#dc2626', status: 'Poor' };
    }
  };

  const formatMetricValue = (metric: string, value: number | null) => {
    if (value === null) return '--';
    
    switch (metric) {
      case 'cls':
        return value.toFixed(3);
      case 'cacheHitRate':
        return `${value}%`;
      default:
        return `${value}ms`;
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Performance Metrics</h1>
        <p className="demo-description">
          Monitor your PWA's performance with Core Web Vitals and PWA-specific metrics.
          Track loading performance, interactivity, and visual stability.
        </p>
      </div>

      <div className="controls-section">
        <button className="btn" onClick={runPerformanceAudit}>
          Run Performance Audit
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value" style={{ color: getMetricStatus('fcp', metrics.fcp).color }}>
            {formatMetricValue('fcp', metrics.fcp)}
          </div>
          <div className="metric-label">First Contentful Paint</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8577', marginTop: '0.25rem' }}>
            {getMetricStatus('fcp', metrics.fcp).status}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: getMetricStatus('lcp', metrics.lcp).color }}>
            {formatMetricValue('lcp', metrics.lcp)}
          </div>
          <div className="metric-label">Largest Contentful Paint</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8577', marginTop: '0.25rem' }}>
            {getMetricStatus('lcp', metrics.lcp).status}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: getMetricStatus('fid', metrics.fid).color }}>
            {formatMetricValue('fid', metrics.fid)}
          </div>
          <div className="metric-label">First Input Delay</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8577', marginTop: '0.25rem' }}>
            {getMetricStatus('fid', metrics.fid).status}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: getMetricStatus('cls', metrics.cls).color }}>
            {formatMetricValue('cls', metrics.cls)}
          </div>
          <div className="metric-label">Cumulative Layout Shift</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8577', marginTop: '0.25rem' }}>
            {getMetricStatus('cls', metrics.cls).status}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: getMetricStatus('ttfb', metrics.ttfb).color }}>
            {formatMetricValue('ttfb', metrics.ttfb)}
          </div>
          <div className="metric-label">Time to First Byte</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8577', marginTop: '0.25rem' }}>
            {getMetricStatus('ttfb', metrics.ttfb).status}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: '#4ade80' }}>
            {formatMetricValue('cacheHitRate', metrics.cacheHitRate)}
          </div>
          <div className="metric-label">Cache Hit Rate</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8577', marginTop: '0.25rem' }}>
            Efficiency
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>Lighthouse Scores</h3>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Performance</span>
                <span style={{ color: '#4ade80' }}>{lighthouse.performance}</span>
              </div>
              <div style={{ 
                height: '8px', 
                background: 'rgba(26, 93, 58, 0.2)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${lighthouse.performance}%`, 
                  height: '100%', 
                  background: '#4ade80',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>PWA</span>
                <span style={{ color: '#4ade80' }}>{lighthouse.pwa}</span>
              </div>
              <div style={{ 
                height: '8px', 
                background: 'rgba(26, 93, 58, 0.2)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${lighthouse.pwa}%`, 
                  height: '100%', 
                  background: '#4ade80',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Best Practices</span>
                <span style={{ color: '#4ade80' }}>{lighthouse.bestPractices}</span>
              </div>
              <div style={{ 
                height: '8px', 
                background: 'rgba(26, 93, 58, 0.2)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${lighthouse.bestPractices}%`, 
                  height: '100%', 
                  background: '#4ade80',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>PWA Features</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              {metrics.offlineCapable ? '✅' : '❌'} Offline Ready
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ HTTPS Enabled
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ Installable
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ Service Worker
            </li>
            <li>
              ✅ Web Manifest
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Optimization Tips</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Implement code splitting
            </li>
            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Optimize images with WebP
            </li>
            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Use resource hints
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Enable HTTP/2 push
            </li>
          </ul>
        </div>
      </div>

      <div className="info-panel" style={{ marginTop: '2rem' }}>
        <h3>Core Web Vitals Thresholds</h3>
        <div className="grid grid-3" style={{ marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem', fontSize: '1rem' }}>Good</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
              <li>FCP: &lt; 1.8s</li>
              <li>LCP: &lt; 2.5s</li>
              <li>FID: &lt; 100ms</li>
              <li>CLS: &lt; 0.1</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#f0c674', marginBottom: '0.5rem', fontSize: '1rem' }}>Needs Improvement</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
              <li>FCP: 1.8s - 3s</li>
              <li>LCP: 2.5s - 4s</li>
              <li>FID: 100ms - 300ms</li>
              <li>CLS: 0.1 - 0.25</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1rem' }}>Poor</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
              <li>FCP: &gt; 3s</li>
              <li>LCP: &gt; 4s</li>
              <li>FID: &gt; 300ms</li>
              <li>CLS: &gt; 0.25</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceMetrics;