import { useState } from 'react'

function CodeSplitting() {
  const [activeTab, setActiveTab] = useState('dynamic')
  const [loadedChunks, setLoadedChunks] = useState<string[]>(['main.js'])

  const simulateChunkLoad = (chunkName: string) => {
    if (!loadedChunks.includes(chunkName)) {
      setLoadedChunks([...loadedChunks, chunkName])
    }
  }

  const chunks = [
    { name: 'main.js', size: 45, color: '#4ade80' },
    { name: 'vendor.js', size: 120, color: '#1a5d3a' },
    { name: 'home.js', size: 25, color: '#f0c674' },
    { name: 'dashboard.js', size: 35, color: '#dc2626' },
    { name: 'analytics.js', size: 40, color: '#3b82f6' }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Code Splitting</h1>
        <p className="page-description">
          Break your code into smaller chunks that can be loaded on demand.
          Reduce initial bundle size and improve Time to Interactive (TTI).
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">-65%</div>
          <div className="metric-label">Initial Bundle Size</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">2.1s</div>
          <div className="metric-label">Faster TTI</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{loadedChunks.length}</div>
          <div className="metric-label">Loaded Chunks</div>
        </div>
      </div>

      <div className="card">
        <h2>Bundle Chunks Visualization</h2>
        <div style={{ 
          display: 'flex', 
          height: '100px',
          gap: '2px',
          marginBottom: '2rem',
          background: 'rgba(10, 10, 10, 0.4)',
          padding: '1rem',
          borderRadius: '4px'
        }}>
          {chunks.map((chunk, index) => (
            <div
              key={index}
              style={{
                width: `${chunk.size / 2.5}%`,
                background: loadedChunks.includes(chunk.name) 
                  ? chunk.color 
                  : 'rgba(143, 169, 155, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(26, 93, 58, 0.2)'
              }}
              onClick={() => simulateChunkLoad(chunk.name)}
            >
              <span style={{ 
                fontSize: '0.75rem', 
                color: loadedChunks.includes(chunk.name) ? '#fff' : '#6b8577',
                textAlign: 'center'
              }}>
                {chunk.name}
              </span>
            </div>
          ))}
        </div>
        <div className="info-box">
          <strong>Click on chunks to simulate loading them.</strong> In a real app, chunks would load automatically based on routes or user interactions.
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'dynamic' ? 'active' : ''}`}
            onClick={() => setActiveTab('dynamic')}
          >
            Dynamic Imports
          </button>
          <button 
            className={`tab ${activeTab === 'route' ? 'active' : ''}`}
            onClick={() => setActiveTab('route')}
          >
            Route-based
          </button>
          <button 
            className={`tab ${activeTab === 'vendor' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendor')}
          >
            Vendor Splitting
          </button>
          <button 
            className={`tab ${activeTab === 'preload' ? 'active' : ''}`}
            onClick={() => setActiveTab('preload')}
          >
            Preloading
          </button>
        </div>

        {activeTab === 'dynamic' && (
          <div>
            <h3>Dynamic Import Splitting</h3>
            <p>Load modules dynamically when needed:</p>
            <div className="code-block">
              <pre>{`// Before: Everything loaded upfront
import HeavyLibrary from 'heavy-library'
import Analytics from './analytics'
import ChartComponent from './ChartComponent'

// After: Load on demand
const loadAnalytics = () => import('./analytics')
const loadChart = () => import('./ChartComponent')

// Usage
button.addEventListener('click', async () => {
  const { Analytics } = await loadAnalytics()
  Analytics.track('button-click')
})`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'route' && (
          <div>
            <h3>Route-based Code Splitting</h3>
            <p>Split code by routes for Single Page Applications:</p>
            <div className="code-block">
              <pre>{`// React Router with lazy loading
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'vendor' && (
          <div>
            <h3>Vendor Bundle Splitting</h3>
            <p>Separate third-party libraries from application code:</p>
            <div className="code-block">
              <pre>{`// Vite configuration
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lodash': ['lodash'],
          'ui-library': ['@mui/material'],
        }
      }
    }
  }
}

// Webpack configuration
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'preload' && (
          <div>
            <h3>Preloading & Prefetching</h3>
            <p>Load critical resources ahead of time:</p>
            <div className="code-block">
              <pre>{`// Preload critical resources
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/css/critical.css" as="style">

// Prefetch future routes
<link rel="prefetch" href="/js/dashboard.js">
<link rel="prefetch" href="/api/user-data">

// Dynamic preloading
const preloadRoute = (route) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = \`/js/\${route}.js\`
  document.head.appendChild(link)
}

// Magic comments in webpack
import(
  /* webpackPreload: true */
  './critical-module'
)
import(
  /* webpackPrefetch: true */
  './future-module'
)`}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Benefits of Code Splitting</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              Reduced initial bundle size
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              Faster Time to Interactive
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              Better caching strategies
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>✓</span>
              Parallel loading of chunks
            </li>
          </ul>
        </div>
        <div className="card">
          <h3>Best Practices</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Split at route boundaries first
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Group related code together
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Avoid over-splitting (too many small chunks)
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#4ade80' }}>→</span>
              Use prefetch for likely next routes
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CodeSplitting