import { useState, useEffect } from 'react'

interface BundleModule {
  name: string
  size: number
  gzipped: number
  percentage: number
}

function BundleAnalysis() {
  const [modules, setModules] = useState<BundleModule[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)

  const sampleModules: BundleModule[] = [
    { name: 'react-dom', size: 130542, gzipped: 42156, percentage: 28.5 },
    { name: 'react', size: 85234, gzipped: 27891, percentage: 18.6 },
    { name: 'lodash', size: 71825, gzipped: 24576, percentage: 15.7 },
    { name: 'moment', size: 67392, gzipped: 22847, percentage: 14.7 },
    { name: 'chart.js', size: 45678, gzipped: 15234, percentage: 10.0 },
    { name: 'axios', size: 23456, gzipped: 8912, percentage: 5.1 },
    { name: 'app.js', size: 34567, gzipped: 11234, percentage: 7.4 }
  ]

  const analyzeBundle = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setModules(sampleModules)
      const total = sampleModules.reduce((sum, mod) => sum + mod.size, 0)
      setTotalSize(total)
      setAnalyzing(false)
    }, 2000)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getColorForSize = (percentage: number) => {
    if (percentage > 20) return '#dc2626'
    if (percentage > 10) return '#f0c674'
    return '#4ade80'
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bundle Analysis</h1>
        <p className="page-description">
          Analyze your JavaScript bundle to identify optimization opportunities.
          Visualize module sizes and find large dependencies that could be optimized.
        </p>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={analyzeBundle} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Analyze Bundle'}
        </button>
      </div>

      {modules.length > 0 && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{formatSize(totalSize)}</div>
              <div className="metric-label">Total Bundle Size</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{formatSize(totalSize * 0.35)}</div>
              <div className="metric-label">Gzipped Size</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{modules.length}</div>
              <div className="metric-label">Modules</div>
            </div>
          </div>

          <div className="card">
            <h2>Bundle Composition</h2>
            <div className="bundle-visualizer">
              <div style={{ width: '100%' }}>
                {modules.map((module, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#f0f4f2' }}>{module.name}</span>
                      <span style={{ color: '#8fa99b' }}>
                        {formatSize(module.size)} ({module.percentage}%)
                      </span>
                    </div>
                    <div style={{ 
                      height: '24px',
                      background: 'rgba(26, 93, 58, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${module.percentage}%`,
                        background: getColorForSize(module.percentage),
                        transition: 'width 1s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Optimization Recommendations</h2>
            <div className="warning-box">
              <strong>Large Dependencies Detected:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Consider replacing moment.js with date-fns (tree-shakable)</li>
                <li>Import only needed lodash functions instead of entire library</li>
                <li>Enable code splitting for chart.js if not used on initial load</li>
              </ul>
            </div>
            <div className="info-box">
              <strong>Quick Wins:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Enable gzip/brotli compression on your server</li>
                <li>Implement dynamic imports for route-based code splitting</li>
                <li>Use production builds with minification enabled</li>
              </ul>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h2>Bundle Analysis Tools</h2>
        <div className="code-block">
          <pre>{`// Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

// webpack.config.js
const BundleAnalyzerPlugin = 
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

// Vite
npm install --save-dev rollup-plugin-visualizer

// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
}`}</pre>
        </div>
      </div>
    </div>
  )
}

export default BundleAnalysis