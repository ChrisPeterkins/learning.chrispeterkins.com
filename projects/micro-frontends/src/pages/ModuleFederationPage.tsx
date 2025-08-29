import React, { useState } from 'react'

const ModuleFederationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedExample, setSelectedExample] = useState('host-config')

  React.useEffect(() => {
    // Syntax highlighting removed for build compatibility
  }, [activeTab, selectedExample])

  const hostConfig = `// webpack.config.js (Host Application)
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        mfHeader: 'header@http://localhost:3001/remoteEntry.js',
        mfFooter: 'footer@http://localhost:3002/remoteEntry.js',
        mfProducts: 'products@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    }),
  ],
}`

  const remoteConfig = `// webpack.config.js (Remote Application)
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  mode: 'development',
  devServer: {
    port: 3001,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'header',
      filename: 'remoteEntry.js',
      exposes: {
        './Header': './src/components/Header',
        './Navigation': './src/components/Navigation',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
      }
    }),
  ],
}`

  const hostImplementation = `// Host Application - App.jsx
import React, { Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary'

// Dynamic imports for micro-frontends
const Header = React.lazy(() => import('mfHeader/Header'))
const Footer = React.lazy(() => import('mfFooter/Footer'))
const ProductCatalog = React.lazy(() => import('mfProducts/ProductCatalog'))

const App = () => {
  return (
    <div className="app">
      <ErrorBoundary fallback="Header failed to load">
        <Suspense fallback={<div>Loading header...</div>}>
          <Header />
        </Suspense>
      </ErrorBoundary>
      
      <main className="main-content">
        <h1>Welcome to Our Store</h1>
        
        <ErrorBoundary fallback="Product catalog failed to load">
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductCatalog />
          </Suspense>
        </ErrorBoundary>
      </main>
      
      <ErrorBoundary fallback="Footer failed to load">
        <Suspense fallback={<div>Loading footer...</div>}>
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default App`

  const remoteComponent = `// Remote Component - Header.jsx
import React, { useState } from 'react'
import './Header.css'

const Header = () => {
  const [cartCount, setCartCount] = useState(0)
  
  // Listen for cart updates from other micro-frontends
  React.useEffect(() => {
    const handleCartUpdate = (event) => {
      setCartCount(event.detail.count)
    }
    
    window.addEventListener('cartUpdate', handleCartUpdate)
    return () => window.removeEventListener('cartUpdate', handleCartUpdate)
  }, [])
  
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>MicroStore</h1>
      </div>
      <nav className="header-nav">
        <a href="/products">Products</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <div className="header-cart">
        Cart ({cartCount})
      </div>
    </header>
  )
}

export default Header`

  const errorBoundary = `// ErrorBoundary.jsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Micro-frontend error:', error, errorInfo)
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>Something went wrong</h3>
          <p>{this.props.fallback || 'This component failed to load'}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary`

  const packageJson = `{
  "name": "mf-host",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@module-federation/webpack": "^2.0.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "html-webpack-plugin": "^5.5.0",
    "@babel/preset-react": "^7.22.0",
    "babel-loader": "^9.1.0"
  },
  "scripts": {
    "start": "webpack serve",
    "build": "webpack --mode production"
  }
}`

  const deploymentExample = `# Docker Deployment Example
version: '3.8'
services:
  host:
    build: ./host
    ports:
      - "3000:80"
    environment:
      - REACT_APP_HEADER_URL=https://header.example.com
      - REACT_APP_PRODUCTS_URL=https://products.example.com
  
  header-mf:
    build: ./header
    ports:
      - "3001:80"
  
  products-mf:
    build: ./products
    ports:
      - "3003:80"`

  const examples = {
    'host-config': { title: 'Host Configuration', code: hostConfig, language: 'javascript' },
    'remote-config': { title: 'Remote Configuration', code: remoteConfig, language: 'javascript' },
    'host-app': { title: 'Host Implementation', code: hostImplementation, language: 'javascript' },
    'remote-component': { title: 'Remote Component', code: remoteComponent, language: 'javascript' },
    'error-boundary': { title: 'Error Boundary', code: errorBoundary, language: 'javascript' },
    'package-json': { title: 'Package.json', code: packageJson, language: 'json' },
    'deployment': { title: 'Docker Deployment', code: deploymentExample, language: 'yaml' }
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Module Federation</h1>
        <p className="page-description">
          Webpack 5's Module Federation enables JavaScript applications to dynamically share code 
          at runtime, creating truly independent micro-frontends.
        </p>
      </header>

      <div className="tab-container">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'implementation' ? 'active' : ''}`}
            onClick={() => setActiveTab('implementation')}
          >
            Implementation
          </button>
          <button
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Patterns
          </button>
          <button
            className={`tab-button ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
          >
            Live Demo
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <section>
                <h2>What is Module Federation?</h2>
                <p>
                  Module Federation is a revolutionary feature in Webpack 5 that allows separate 
                  JavaScript applications to share modules at runtime. Unlike traditional bundling 
                  approaches, Module Federation enables true micro-frontend architectures where 
                  applications can consume and expose modules dynamically.
                </p>

                <div className="architecture-diagram">
                  <div className="federation-diagram">
                    <div className="host-app">
                      <h4>Host Application</h4>
                      <p>Orchestrates and consumes remote modules</p>
                    </div>
                    <div className="federation-arrows">
                      <span>consumes</span>
                      <div className="arrow-down">↓</div>
                    </div>
                    <div className="remote-apps">
                      <div className="remote-app">Header MF</div>
                      <div className="remote-app">Products MF</div>
                      <div className="remote-app">Cart MF</div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Key Concepts</h2>
                <div className="concept-grid">
                  <div className="concept-card">
                    <h3>Host Application</h3>
                    <p>The main application that consumes remote modules. It orchestrates the overall user experience.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Remote Application</h3>
                    <p>Independent applications that expose modules for consumption by host applications.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Federated Modules</h3>
                    <p>Specific modules or components that are exposed by remote applications.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Shared Dependencies</h3>
                    <p>Common libraries (like React) that are shared between host and remote applications.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Benefits & Trade-offs</h2>
                <div className="pros-cons">
                  <div className="pros">
                    <h3>Benefits</h3>
                    <ul>
                      <li>Runtime module sharing</li>
                      <li>Independent deployments</li>
                      <li>Reduced bundle duplication</li>
                      <li>Team autonomy</li>
                      <li>Incremental adoption</li>
                      <li>Version independence</li>
                    </ul>
                  </div>
                  <div className="cons">
                    <h3>Challenges</h3>
                    <ul>
                      <li>Complex configuration</li>
                      <li>Runtime dependencies</li>
                      <li>Version compatibility</li>
                      <li>Network latency</li>
                      <li>Debugging complexity</li>
                      <li>Error handling</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'implementation' && (
            <div className="implementation-content">
              <section>
                <h2>Code Examples</h2>
                <div className="example-selector">
                  {Object.entries(examples).map(([key, example]) => (
                    <button
                      key={key}
                      className={`example-button ${selectedExample === key ? 'active' : ''}`}
                      onClick={() => setSelectedExample(key)}
                    >
                      {example.title}
                    </button>
                  ))}
                </div>

                <div className="code-example">
                  <h3>{examples[selectedExample].title}</h3>
                  <div className="code-viewer">
                    <pre>
                      <code className={`language-${examples[selectedExample].language}`}>
                        {examples[selectedExample].code}
                      </code>
                    </pre>
                  </div>
                </div>
              </section>

              <section>
                <h2>Step-by-Step Setup</h2>
                <div className="setup-steps">
                  <div className="setup-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Install Dependencies</h3>
                      <p>Add Module Federation plugin and configure Webpack 5</p>
                      <code>npm install @module-federation/webpack webpack@5</code>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Configure Remote</h3>
                      <p>Set up the remote application to expose modules</p>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Configure Host</h3>
                      <p>Configure host application to consume remote modules</p>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>Handle Errors</h3>
                      <p>Implement error boundaries and fallback strategies</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="advanced-content">
              <section>
                <h2>Advanced Patterns</h2>
                
                <div className="pattern-card">
                  <h3>Dynamic Remote Loading</h3>
                  <p>Load remote modules based on runtime conditions:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`// Dynamic remote loading
const loadRemoteModule = async (remoteName, moduleName) => {
  try {
    const container = window[remoteName]
    await container.init(__webpack_share_scopes__.default)
    const factory = await container.get(moduleName)
    return factory()
  } catch (error) {
    console.error('Failed to load remote module:', error)
    return null
  }
}`}</code></pre>
                  </div>
                </div>

                <div className="pattern-card">
                  <h3>Shared State Management</h3>
                  <p>Share state between federated modules:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`// Shared store pattern
import { createStore } from './shared-store'

// In webpack config
shared: {
  'shared-store': { singleton: true, eager: true }
}

// Usage in components
const sharedStore = createStore({
  user: null,
  cart: [],
  theme: 'light'
})`}</code></pre>
                  </div>
                </div>

                <div className="pattern-card">
                  <h3>Version Strategy</h3>
                  <p>Handle different versions of shared dependencies:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.0.0',
    strictVersion: false,
    shareScope: 'default'
  }
}`}</code></pre>
                  </div>
                </div>

                <div className="pattern-card">
                  <h3>Bi-directional Federation</h3>
                  <p>Applications that are both hosts and remotes:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`// App can both expose and consume
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    products: 'products@http://localhost:3001/remoteEntry.js'
  },
  exposes: {
    './UserService': './src/services/UserService'
  }
})`}</code></pre>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Optimization</h2>
                <ul className="feature-list">
                  <li>Implement proper error boundaries for each federated module</li>
                  <li>Use Suspense for loading states and better UX</li>
                  <li>Optimize shared dependencies to reduce bundle size</li>
                  <li>Implement retry logic for failed module loads</li>
                  <li>Use service workers for caching remote modules</li>
                  <li>Monitor performance metrics across federated modules</li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="demo-content">
              <section>
                <h2>Interactive Demo</h2>
                <p>Experience a live Module Federation setup:</p>
                
                <div className="demo-container">
                  <h3>Federated E-commerce Application</h3>
                  <div className="demo-grid">
                    <div className="micro-app">
                      <h4>Header Service (Port 3001)</h4>
                      <p>Navigation, branding, and user menu</p>
                      <div className="app-status status-loaded">Loaded</div>
                      <button className="demo-button" disabled>
                        Simulated Component
                      </button>
                    </div>
                    
                    <div className="micro-app">
                      <h4>Product Catalog (Port 3002)</h4>
                      <p>Product listings, search, and filters</p>
                      <div className="app-status status-loaded">Loaded</div>
                      <button className="demo-button" disabled>
                        Browse Products
                      </button>
                    </div>
                    
                    <div className="micro-app">
                      <h4>Shopping Cart (Port 3003)</h4>
                      <p>Cart management and checkout flow</p>
                      <div className="app-status status-loading">Loading...</div>
                      <button className="demo-button" disabled>
                        View Cart (0)
                      </button>
                    </div>
                    
                    <div className="micro-app">
                      <h4>User Profile (Port 3004)</h4>
                      <p>Authentication and profile management</p>
                      <div className="app-status status-error">Error</div>
                      <button className="demo-button">
                        Retry Load
                      </button>
                    </div>
                  </div>
                  
                  <div className="demo-info">
                    <h4>Federation Flow:</h4>
                    <ol>
                      <li>Host app loads at runtime</li>
                      <li>Remote modules are fetched dynamically</li>
                      <li>Shared dependencies are deduplicated</li>
                      <li>Error boundaries handle failures gracefully</li>
                    </ol>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Initial Bundle Size</h4>
                    <div className="metric-value">245 KB</div>
                    <div className="metric-change positive">-67% vs Monolith</div>
                  </div>
                  <div className="metric-card">
                    <h4>Time to Interactive</h4>
                    <div className="metric-value">1.2s</div>
                    <div className="metric-change positive">-45% improvement</div>
                  </div>
                  <div className="metric-card">
                    <h4>Cache Hit Rate</h4>
                    <div className="metric-value">89%</div>
                    <div className="metric-change positive">Shared deps</div>
                  </div>
                  <div className="metric-card">
                    <h4>Deploy Frequency</h4>
                    <div className="metric-value">12x/day</div>
                    <div className="metric-change positive">Independent teams</div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModuleFederationPage