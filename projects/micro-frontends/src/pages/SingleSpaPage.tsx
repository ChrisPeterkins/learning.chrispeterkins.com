import React, { useState, useEffect } from 'react'

const SingleSpaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedExample, setSelectedExample] = useState('root-config')
  const [simulatedApps, setSimulatedApps] = useState([
    { name: 'navbar', status: 'mounted', framework: 'React' },
    { name: 'products', status: 'unmounted', framework: 'Vue' },
    { name: 'checkout', status: 'unmounted', framework: 'Angular' }
  ])

  useEffect(() => {
    // Syntax highlighting removed for build compatibility
  }, [activeTab, selectedExample])

  const rootConfig = `// root-config.js - The orchestrator
import { registerApplication, start } from 'single-spa'

// Register React navbar
registerApplication({
  name: '@company/navbar',
  app: () => System.import('@company/navbar'),
  activeWhen: ['/']
})

// Register Vue products app
registerApplication({
  name: '@company/products', 
  app: () => System.import('@company/products'),
  activeWhen: ['/products']
})

// Register Angular checkout
registerApplication({
  name: '@company/checkout',
  app: () => System.import('@company/checkout'),
  activeWhen: ['/checkout']
})

// Start single-spa
start({
  urlRerouteOnly: true,
})`

  const reactApp = `// React Micro-frontend
import React from 'react'
import ReactDOM from 'react-dom'
import singleSpaReact from 'single-spa-react'
import Root from './root.component'

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    return <div>This parcel experienced an error: {err.message}</div>
  }
})

export const { bootstrap, mount, unmount } = lifecycles

// Root component
const Root = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">Company Store</div>
      <ul className="nav-links">
        <li><a href="/products">Products</a></li>
        <li><a href="/checkout">Checkout</a></li>
        <li><a href="/account">Account</a></li>
      </ul>
    </nav>
  )
}

export default Root`

  const vueApp = `// Vue Micro-frontend
import { createApp } from 'vue'
import singleSpaVue from 'single-spa-vue'
import App from './App.vue'

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App, {
        // Props can be passed here
        mountParcel: this.mountParcel,
        singleSpa: this.singleSpa
      })
    }
  },
  handleInstance(app) {
    app.use(router)
    app.use(store)
  }
})

export const { bootstrap, mount, unmount } = vueLifecycles

// App.vue
<template>
  <div class="products-app">
    <h2>Product Catalog</h2>
    <div class="product-grid">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
      >
        <h3>{{ product.name }}</h3>
        <p>{{ product.price }}</p>
        <button @click="addToCart(product)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [
        { id: 1, name: 'Laptop', price: '$999' },
        { id: 2, name: 'Phone', price: '$699' }
      ]
    }
  },
  methods: {
    addToCart(product) {
      // Emit event to other micro-frontends
      window.dispatchEvent(new CustomEvent('cart:add', {
        detail: product
      }))
    }
  }
}
</script>`

  const angularApp = `// Angular Micro-frontend
import { NgZone } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import singleSpaAngular from 'single-spa-angular'
import { AppModule } from './app/app.module'

const lifecycles = singleSpaAngular({
  bootstrapFunction: singleSpaProps => {
    return platformBrowserDynamic().bootstrapModule(AppModule)
  },
  template: '<checkout-app />',
  NgZone
})

export const { bootstrap, mount, unmount } = lifecycles

// app.component.ts
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'checkout-app',
  template: \`
    <div class="checkout-app">
      <h2>Checkout</h2>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div *ngFor="let item of cartItems" class="cart-item">
          <span>{{item.name}}</span>
          <span>{{item.price}}</span>
        </div>
        <div class="total">
          Total: {{total | currency}}
        </div>
        <button (click)="processOrder()" class="checkout-btn">
          Complete Order
        </button>
      </div>
    </div>
  \`
})
export class AppComponent implements OnInit {
  cartItems: any[] = []
  total: number = 0

  ngOnInit() {
    // Listen for cart updates
    window.addEventListener('cart:add', (event: any) => {
      this.cartItems.push(event.detail)
      this.calculateTotal()
    })
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + parseFloat(item.price.slice(1)), 0)
  }

  processOrder() {
    // Process the order
    console.log('Processing order:', this.cartItems)
  }
}`

  const importMap = `<!-- index.html - Import Map for SystemJS -->
<script type="systemjs-importmap">
{
  "imports": {
    "@company/root-config": "/js/company-root-config.js",
    "@company/navbar": "/js/company-navbar.js",
    "@company/products": "/js/company-products.js", 
    "@company/checkout": "/js/company-checkout.js",
    "react": "https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js",
    "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js",
    "vue": "https://unpkg.com/vue@3/dist/vue.global.js",
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js"
  }
}
</script>`

  const packageJson = `{
  "name": "@company/root-config",
  "version": "1.0.0", 
  "dependencies": {
    "single-spa": "^5.9.5"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "webpack-config-single-spa-ts": "^4.0.0",
    "webpack-merge": "^5.9.0"
  },
  "scripts": {
    "start": "webpack serve --port 9000",
    "build": "webpack --mode=production"
  }
}`

  const communicationPattern = `// Cross-framework communication patterns

// 1. Custom Events (Browser APIs)
// Dispatch from any framework
window.dispatchEvent(new CustomEvent('user:login', {
  detail: { userId: 123, username: 'john' }
}))

// Listen from any framework  
window.addEventListener('user:login', (event) => {
  console.log('User logged in:', event.detail)
})

// 2. Shared State Store
// shared-store.js
class SharedStore {
  constructor() {
    this.state = {}
    this.listeners = new Set()
  }
  
  setState(updates) {
    this.state = { ...this.state, ...updates }
    this.listeners.forEach(listener => listener(this.state))
  }
  
  getState() {
    return { ...this.state }
  }
  
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const store = new SharedStore()

// 3. RxJS Observables  
import { BehaviorSubject } from 'rxjs'

export const userState$ = new BehaviorSubject({
  isLoggedIn: false,
  user: null
})

export const cartState$ = new BehaviorSubject({
  items: [],
  total: 0
})`

  const examples = {
    'root-config': { title: 'Root Configuration', code: rootConfig, language: 'javascript' },
    'react-app': { title: 'React Micro-frontend', code: reactApp, language: 'javascript' },
    'vue-app': { title: 'Vue Micro-frontend', code: vueApp, language: 'javascript' },
    'angular-app': { title: 'Angular Micro-frontend', code: angularApp, language: 'javascript' },
    'import-map': { title: 'SystemJS Import Map', code: importMap, language: 'html' },
    'package-json': { title: 'Package Configuration', code: packageJson, language: 'json' },
    'communication': { title: 'Cross-Framework Communication', code: communicationPattern, language: 'javascript' }
  }

  const simulateAppTransition = (appName: string) => {
    setSimulatedApps(prev => prev.map(app => {
      if (app.name === appName) {
        return { ...app, status: app.status === 'mounted' ? 'unmounted' : 'mounted' }
      }
      return { ...app, status: 'unmounted' }
    }))
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Single-spa Framework</h1>
        <p className="page-description">
          A JavaScript router for front-end microservices that enables multiple frameworks 
          to coexist in a single application, providing seamless navigation and lifecycle management.
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
            className={`tab-button ${activeTab === 'communication' ? 'active' : ''}`}
            onClick={() => setActiveTab('communication')}
          >
            Communication
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
                <h2>What is Single-spa?</h2>
                <p>
                  Single-spa is a javascript router for front-end microservices. It allows you to 
                  use multiple frameworks in a single-page application, giving each team the freedom 
                  to choose their preferred technology stack while maintaining a cohesive user experience.
                </p>

                <div className="architecture-diagram">
                  <div className="single-spa-diagram">
                    <div className="root-config">
                      <h4>Root Config</h4>
                      <p>Single-spa orchestrator</p>
                    </div>
                    <div className="spa-arrows">
                      <span>manages</span>
                      <div className="arrow-down">↓</div>
                    </div>
                    <div className="framework-apps">
                      <div className="framework-app react">React App</div>
                      <div className="framework-app vue">Vue App</div>
                      <div className="framework-app angular">Angular App</div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Core Concepts</h2>
                <div className="concept-grid">
                  <div className="concept-card">
                    <h3>Root Config</h3>
                    <p>The single-spa configuration that registers and orchestrates all micro-frontends.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Applications</h3>
                    <p>Individual micro-frontends built with any framework (React, Vue, Angular, etc.).</p>
                  </div>
                  <div className="concept-card">
                    <h3>Parcels</h3>
                    <p>Framework-agnostic components that can be mounted by any application.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Utility Modules</h3>
                    <p>Shared logic, state, and utilities used across multiple applications.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Application Lifecycle</h2>
                <div className="lifecycle-flow">
                  <div className="lifecycle-stage">
                    <div className="stage-icon">⚡</div>
                    <h4>Bootstrap</h4>
                    <p>Initialize the application (run once)</p>
                  </div>
                  <div className="lifecycle-arrow">→</div>
                  <div className="lifecycle-stage">
                    <div className="stage-icon">🚀</div>
                    <h4>Mount</h4>
                    <p>Render the application to the DOM</p>
                  </div>
                  <div className="lifecycle-arrow">→</div>
                  <div className="lifecycle-stage">
                    <div className="stage-icon">🔄</div>
                    <h4>Update</h4>
                    <p>Handle props changes (optional)</p>
                  </div>
                  <div className="lifecycle-arrow">→</div>
                  <div className="lifecycle-stage">
                    <div className="stage-icon">📤</div>
                    <h4>Unmount</h4>
                    <p>Clean up and remove from DOM</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Benefits & Considerations</h2>
                <div className="pros-cons">
                  <div className="pros">
                    <h3>Benefits</h3>
                    <ul>
                      <li>Framework independence</li>
                      <li>Incremental migration</li>
                      <li>Team autonomy</li>
                      <li>Mature ecosystem</li>
                      <li>Active community</li>
                      <li>Built-in routing</li>
                    </ul>
                  </div>
                  <div className="cons">
                    <h3>Considerations</h3>
                    <ul>
                      <li>Learning curve</li>
                      <li>Complex setup</li>
                      <li>Bundle size overhead</li>
                      <li>Cross-app communication</li>
                      <li>Testing complexity</li>
                      <li>Debugging challenges</li>
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
                <h2>Setup Process</h2>
                <div className="setup-steps">
                  <div className="setup-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Create Root Config</h3>
                      <p>Set up the single-spa root configuration to orchestrate micro-frontends</p>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Build Applications</h3>
                      <p>Create micro-frontends in different frameworks with lifecycle methods</p>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Configure Import Maps</h3>
                      <p>Set up SystemJS import maps for dynamic loading</p>
                    </div>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>Handle Communication</h3>
                      <p>Implement cross-framework communication strategies</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="communication-content">
              <section>
                <h2>Cross-Framework Communication</h2>
                <p>
                  One of the biggest challenges in single-spa applications is enabling communication 
                  between micro-frontends built with different frameworks. Here are proven patterns:
                </p>

                <div className="communication-patterns">
                  <div className="pattern-card">
                    <h3>1. Custom Events</h3>
                    <p>Use browser's native event system for loose coupling</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Publisher (React)
const publishEvent = (data) => {
  window.dispatchEvent(new CustomEvent('user:update', { detail: data }))
}

// Subscriber (Vue)
mounted() {
  window.addEventListener('user:update', this.handleUserUpdate)
}`}</code></pre>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>2. Shared State Store</h3>
                    <p>Centralized state management across all micro-frontends</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Shared store
class GlobalStore {
  constructor() {
    this.state = { user: null, cart: [] }
    this.listeners = []
  }
  
  subscribe(callback) {
    this.listeners.push(callback)
    return () => this.listeners = this.listeners.filter(l => l !== callback)
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>3. Props and Callbacks</h3>
                    <p>Pass data through single-spa's mounting props</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Root config passes props
registerApplication({
  name: '@company/navbar',
  app: () => System.import('@company/navbar'),
  activeWhen: ['/'],
  customProps: {
    authToken: getCurrentAuthToken(),
    onLogout: handleGlobalLogout
  }
})`}</code></pre>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>4. Utility Modules</h3>
                    <p>Shared services and utilities as separate modules</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// @company/shared-utils
export const authService = {
  login: (credentials) => { /* ... */ },
  logout: () => { /* ... */ },
  getCurrentUser: () => { /* ... */ }
}

// Usage in any micro-frontend
import { authService } from '@company/shared-utils'`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Communication Best Practices</h2>
                <ul className="feature-list">
                  <li>Use custom events for loose coupling between applications</li>
                  <li>Implement a shared state store for global application state</li>
                  <li>Create utility modules for common functionality</li>
                  <li>Avoid direct DOM manipulation across application boundaries</li>
                  <li>Use TypeScript interfaces to define communication contracts</li>
                  <li>Implement error boundaries for graceful failure handling</li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="demo-content">
              <section>
                <h2>Interactive Single-spa Demo</h2>
                <p>Simulate routing between different micro-frontend applications:</p>
                
                <div className="demo-container">
                  <h3>Multi-Framework Application</h3>
                  <div className="route-buttons">
                    <button 
                      className="route-button"
                      onClick={() => simulateAppTransition('navbar')}
                    >
                      / (Home - Navbar)
                    </button>
                    <button 
                      className="route-button"
                      onClick={() => simulateAppTransition('products')}
                    >
                      /products (Vue App)
                    </button>
                    <button 
                      className="route-button"
                      onClick={() => simulateAppTransition('checkout')}
                    >
                      /checkout (Angular App)
                    </button>
                  </div>
                  
                  <div className="app-status-grid">
                    {simulatedApps.map(app => (
                      <div key={app.name} className="app-status-card">
                        <h4>{app.name} ({app.framework})</h4>
                        <div className={`app-status ${app.status === 'mounted' ? 'status-loaded' : 'status-loading'}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </div>
                        <div className="app-lifecycle">
                          {app.status === 'mounted' ? (
                            <div>
                              <div className="lifecycle-step completed">✓ Bootstrap</div>
                              <div className="lifecycle-step completed">✓ Mount</div>
                              <div className="lifecycle-step active">→ Active</div>
                            </div>
                          ) : (
                            <div>
                              <div className="lifecycle-step">Bootstrap</div>
                              <div className="lifecycle-step">Mount</div>
                              <div className="lifecycle-step">Unmounted</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="demo-info">
                    <h4>Single-spa Lifecycle:</h4>
                    <ol>
                      <li>Route change triggers application evaluation</li>
                      <li>Active applications mount, inactive ones unmount</li>
                      <li>Each framework manages its own component lifecycle</li>
                      <li>Shared utilities remain available to all applications</li>
                    </ol>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Insights</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Framework Bundle</h4>
                    <div className="metric-value">React: 42KB</div>
                    <div className="metric-sub">Vue: 38KB, Angular: 130KB</div>
                  </div>
                  <div className="metric-card">
                    <h4>Shared Dependencies</h4>
                    <div className="metric-value">78% Reduction</div>
                    <div className="metric-sub">vs separate apps</div>
                  </div>
                  <div className="metric-card">
                    <h4>Route Transition</h4>
                    <div className="metric-value">150ms</div>
                    <div className="metric-sub">Average mount time</div>
                  </div>
                  <div className="metric-card">
                    <h4>Memory Usage</h4>
                    <div className="metric-value">15MB</div>
                    <div className="metric-sub">All apps loaded</div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Framework Support</h2>
                <div className="framework-support-grid">
                  <div className="framework-card">
                    <h4>React</h4>
                    <div className="support-status excellent">Excellent</div>
                    <p>First-class support with single-spa-react</p>
                  </div>
                  <div className="framework-card">
                    <h4>Vue</h4>
                    <div className="support-status excellent">Excellent</div>
                    <p>Full support for Vue 2 and Vue 3</p>
                  </div>
                  <div className="framework-card">
                    <h4>Angular</h4>
                    <div className="support-status good">Good</div>
                    <p>Supported with additional configuration</p>
                  </div>
                  <div className="framework-card">
                    <h4>Svelte</h4>
                    <div className="support-status good">Good</div>
                    <p>Community support available</p>
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

export default SingleSpaPage