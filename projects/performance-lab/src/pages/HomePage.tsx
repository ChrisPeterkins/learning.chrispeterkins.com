import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0
  })

  useEffect(() => {
    // Simulate collecting metrics
    setTimeout(() => {
      setMetrics({
        fcp: 1.2,
        lcp: 2.4,
        fid: 50,
        cls: 0.05
      })
    }, 1000)
  }, [])

  const features = [
    {
      title: 'Bundle Analysis',
      description: 'Visualize and optimize your JavaScript bundles',
      link: '/bundle-analysis',
      icon: '📊'
    },
    {
      title: 'Code Splitting',
      description: 'Split code into chunks for better loading',
      link: '/code-splitting',
      icon: '✂️'
    },
    {
      title: 'Lazy Loading',
      description: 'Load components and resources on demand',
      link: '/lazy-loading',
      icon: '⚡'
    },
    {
      title: 'Virtualization',
      description: 'Render large lists efficiently',
      link: '/virtualization',
      icon: '🎛️'
    },
    {
      title: 'Image Optimization',
      description: 'Optimize images for web performance',
      link: '/images',
      icon: '🖼️'
    },
    {
      title: 'Performance Metrics',
      description: 'Monitor Core Web Vitals and custom metrics',
      link: '/metrics',
      icon: '📈'
    }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Performance Lab</h1>
        <p className="page-description">
          Master web performance optimization techniques through interactive demos and real-world examples.
          Learn how to measure, analyze, and improve your web application's performance.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.fcp}s</div>
          <div className="metric-label">First Contentful Paint</div>
          <div className="metric-change positive">↓ 15% from baseline</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.lcp}s</div>
          <div className="metric-label">Largest Contentful Paint</div>
          <div className="metric-change positive">↓ 20% from baseline</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.fid}ms</div>
          <div className="metric-label">First Input Delay</div>
          <div className="metric-change positive">↓ 10% from baseline</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.cls}</div>
          <div className="metric-label">Cumulative Layout Shift</div>
          <div className="metric-change positive">↓ 5% from baseline</div>
        </div>
      </div>

      <div className="card">
        <h2>Performance Optimization Techniques</h2>
        <div className="grid grid-3" style={{ marginTop: '2rem' }}>
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ 
                cursor: 'pointer', 
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Why Performance Matters</h2>
        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
          <div>
            <h3>User Experience</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
                53% of mobile users abandon sites that take over 3 seconds to load
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
                1 second delay in page response can result in 7% reduction in conversions
              </li>
              <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
                Fast sites have higher engagement and lower bounce rates
              </li>
            </ul>
          </div>
          <div>
            <h3>SEO & Business Impact</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
                Core Web Vitals are now a Google ranking factor
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
                Performance improvements directly correlate with revenue increases
              </li>
              <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
                Better performance reduces infrastructure costs
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="info-box">
        <strong>Getting Started:</strong> Navigate through the different sections to explore various performance optimization techniques.
        Each section includes interactive demos, code examples, and best practices.
      </div>
    </div>
  )
}

export default HomePage