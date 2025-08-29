import { useState, useEffect } from 'react'
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

interface Metric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: {
    good: number
    poor: number
  }
  description: string
}

interface WebVitalMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<WebVitalMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isMonitoring) {
      // Collect real Web Vitals
      getCLS((metric) => {
        setMetrics(prev => ({ ...prev, cls: metric.value }))
      })
      
      getFCP((metric) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value }))
      })
      
      getFID((metric) => {
        setMetrics(prev => ({ ...prev, fid: metric.value }))
      })
      
      getLCP((metric) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value }))
      })
      
      getTTFB((metric) => {
        setMetrics(prev => ({ ...prev, ttfb: metric.value }))
      })
    }
  }, [isMonitoring])

  const getRating = (value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return 'Collecting...'
    return unit === 'ms' ? `${Math.round(value)}ms` : value.toFixed(3)
  }

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good': return '#4ade80'
      case 'needs-improvement': return '#f0c674'
      case 'poor': return '#dc2626'
    }
  }

  const webVitalsData: Array<Omit<Metric, 'value' | 'rating'> & { key: keyof WebVitalMetrics; unit: string }> = [
    {
      key: 'fcp',
      name: 'First Contentful Paint',
      unit: 'ms',
      threshold: { good: 1800, poor: 3000 },
      description: 'Time until the first text or image is painted'
    },
    {
      key: 'lcp',
      name: 'Largest Contentful Paint',
      unit: 'ms',
      threshold: { good: 2500, poor: 4000 },
      description: 'Time until the largest text or image is painted'
    },
    {
      key: 'fid',
      name: 'First Input Delay',
      unit: 'ms',
      threshold: { good: 100, poor: 300 },
      description: 'Time between first user interaction and browser response'
    },
    {
      key: 'cls',
      name: 'Cumulative Layout Shift',
      unit: '',
      threshold: { good: 0.1, poor: 0.25 },
      description: 'Sum of all unexpected layout shifts during page load'
    },
    {
      key: 'ttfb',
      name: 'Time to First Byte',
      unit: 'ms',
      threshold: { good: 800, poor: 1800 },
      description: 'Time between navigation start and first byte received'
    }
  ]

  const startMonitoring = () => {
    setIsMonitoring(true)
    // Simulate some initial values
    setTimeout(() => {
      setMetrics({
        fcp: 1200 + Math.random() * 800,
        lcp: 2000 + Math.random() * 1500,
        fid: 50 + Math.random() * 150,
        cls: Math.random() * 0.3,
        ttfb: 400 + Math.random() * 600
      })
    }, 1000)
  }

  const resetMetrics = () => {
    setMetrics({
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null
    })
    setIsMonitoring(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Performance Metrics</h1>
        <p className="page-description">
          Monitor Core Web Vitals and custom performance metrics in real-time.
          Understand how your users experience your website's performance.
        </p>
      </div>

      <div className="controls">
        <button 
          className="btn btn-primary" 
          onClick={startMonitoring}
          disabled={isMonitoring}
        >
          {isMonitoring ? 'Monitoring Active' : 'Start Monitoring'}
        </button>
        <button className="btn" onClick={resetMetrics}>
          Reset Metrics
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Detailed Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'implementation' ? 'active' : ''}`}
          onClick={() => setActiveTab('implementation')}
        >
          Implementation
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="metrics-grid">
            {webVitalsData.map((vital) => {
              const value = metrics[vital.key]
              const rating = value !== null ? getRating(value, vital.threshold) : 'good'
              return (
                <div key={vital.key} className="metric-card">
                  <div 
                    className="metric-value"
                    style={{ color: value !== null ? getRatingColor(rating) : '#8fa99b' }}
                  >
                    {formatValue(value, vital.unit)}
                  </div>
                  <div className="metric-label">{vital.name}</div>
                  {value !== null && (
                    <div 
                      className="metric-change"
                      style={{ color: getRatingColor(rating) }}
                    >
                      {rating === 'good' && '✓ Good'}
                      {rating === 'needs-improvement' && '⚠ Needs Improvement'}
                      {rating === 'poor' && '✗ Poor'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="card">
            <h2>Core Web Vitals Status</h2>
            <div style={{ marginTop: '1.5rem' }}>
              {webVitalsData.map((vital) => {
                const value = metrics[vital.key]
                const rating = value !== null ? getRating(value, vital.threshold) : 'good'
                return (
                  <div key={vital.key} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#f0f4f2', fontWeight: '500' }}>{vital.name}</span>
                      <span style={{ 
                        color: value !== null ? getRatingColor(rating) : '#8fa99b',
                        fontFamily: 'monospace'
                      }}>
                        {formatValue(value, vital.unit)}
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(26, 93, 58, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: value !== null ? `${Math.min((value / (vital.threshold.poor * 1.5)) * 100, 100)}%` : '0%',
                        background: value !== null ? getRatingColor(rating) : '#8fa99b',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#8fa99b', 
                      marginTop: '0.25rem' 
                    }}>
                      {vital.description}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'details' && (
        <div className="card">
          <h2>Performance Analysis</h2>
          <div className="grid grid-2">
            <div>
              <h3>Thresholds</h3>
              <div style={{ fontSize: '0.9rem' }}>
                {webVitalsData.map((vital) => (
                  <div key={vital.key} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(10, 10, 10, 0.4)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: '500', color: '#f0f4f2', marginBottom: '0.5rem' }}>
                      {vital.name}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#4ade80' }}>
                        Good: ≤{vital.unit === 'ms' ? vital.threshold.good : vital.threshold.good}{vital.unit}
                      </span>
                      <span style={{ color: '#f0c674' }}>
                        Poor: &gt;{vital.unit === 'ms' ? vital.threshold.poor : vital.threshold.poor}{vital.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3>Optimization Tips</h3>
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#4ade80' }}>Improve LCP:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li>Optimize images and use modern formats</li>
                    <li>Preload critical resources</li>
                    <li>Use a CDN for static assets</li>
                  </ul>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#4ade80' }}>Reduce CLS:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li>Set dimensions for images and videos</li>
                    <li>Reserve space for ads and embeds</li>
                    <li>Use CSS transforms for animations</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#4ade80' }}>Minimize FID:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li>Break up long-running tasks</li>
                    <li>Reduce JavaScript execution time</li>
                    <li>Use web workers for heavy computations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'implementation' && (
        <div className="card">
          <h2>Implementation Guide</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Using web-vitals Library</h3>
            <div className="code-block">
              <pre>{`npm install web-vitals

// Basic implementation
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFCP(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Custom Performance Observer</h3>
            <div className="code-block">
              <pre>{`// Monitor custom metrics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
    if (entry.entryType === 'first-input') {
      console.log('FID:', entry.processingStart - entry.startTime);
    }
  }
});

observer.observe({
  type: 'largest-contentful-paint',
  buffered: true
});

observer.observe({
  type: 'first-input',
  buffered: true
});`}</pre>
            </div>
          </div>

          <div>
            <h3>Real User Monitoring (RUM)</h3>
            <div className="code-block">
              <pre>{`// Send metrics to analytics
function sendMetric(metricName, value, labels = {}) {
  // Google Analytics 4
  gtag('event', metricName, {
    value: Math.round(value),
    custom_parameter_1: labels.page,
    custom_parameter_2: labels.device_type
  });
  
  // Or send to custom endpoint
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      metric: metricName,
      value,
      labels,
      timestamp: Date.now()
    })
  });
}

// Usage with web-vitals
getCLS((metric) => sendMetric('CLS', metric.value));
getLCP((metric) => sendMetric('LCP', metric.value));`}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="info-box">
        <strong>Pro Tip:</strong> Core Web Vitals are based on real user data. Test your site with different devices, 
        network conditions, and user interactions to get accurate measurements.
      </div>
    </div>
  )
}

export default PerformanceMetrics