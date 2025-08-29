import React, { useState, useEffect, useRef } from 'react'

const WebComponentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedExample, setSelectedExample] = useState('basic-component')
  const [webComponentDemo, setWebComponentDemo] = useState('user-card')
  const demoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Syntax highlighting removed for build compatibility
  }, [activeTab, selectedExample])

  // Simulate web component creation
  useEffect(() => {
    if (demoContainerRef.current && webComponentDemo) {
      // Clear previous demo
      demoContainerRef.current.innerHTML = ''
      
      // Create demo element based on selection
      const createDemoElement = () => {
        switch (webComponentDemo) {
          case 'user-card':
            return `<div class="simulated-web-component user-card">
              <div class="avatar">👤</div>
              <h3>John Doe</h3>
              <p>Software Engineer</p>
              <button>Follow</button>
            </div>`
          case 'product-tile':
            return `<div class="simulated-web-component product-tile">
              <div class="product-image">📱</div>
              <h3>iPhone 15</h3>
              <p class="price">$999</p>
              <button>Add to Cart</button>
            </div>`
          case 'notification':
            return `<div class="simulated-web-component notification">
              <span class="icon">ℹ️</span>
              <div class="message">
                <h4>Update Available</h4>
                <p>A new version is ready to install.</p>
              </div>
              <button class="close">×</button>
            </div>`
          default:
            return '<div>Select a component</div>'
        }
      }
      
      demoContainerRef.current.innerHTML = createDemoElement()
    }
  }, [webComponentDemo])

  const basicComponent = `// Basic Web Component
class UserCard extends HTMLElement {
  constructor() {
    super()
    // Create shadow root for encapsulation
    this.attachShadow({ mode: 'open' })
  }

  // Called when element is added to the DOM
  connectedCallback() {
    this.render()
  }

  // Define observed attributes for reactivity
  static get observedAttributes() {
    return ['name', 'email', 'avatar', 'role']
  }

  // Called when attributes change
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  render() {
    const name = this.getAttribute('name') || 'Unknown'
    const email = this.getAttribute('email') || ''
    const avatar = this.getAttribute('avatar') || '/default-avatar.png'
    const role = this.getAttribute('role') || 'User'

    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          max-width: 300px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-bottom: 12px;
        }
        
        .name {
          margin: 0 0 4px 0;
          color: #333;
        }
        
        .email {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 14px;
        }
        
        .role {
          background: #e3f2fd;
          color: #1565c0;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: inline-block;
        }

        button {
          background: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
        }

        button:hover {
          background: #1565c0;
        }
      </style>
      
      <img class="avatar" src="\${avatar}" alt="\${name}" />
      <h3 class="name">\${name}</h3>
      <p class="email">\${email}</p>
      <span class="role">\${role}</span>
      <button onclick="this.getRootNode().host.sendMessage()">
        Contact
      </button>
    \`
  }

  // Custom method
  sendMessage() {
    const event = new CustomEvent('user-contact', {
      detail: {
        name: this.getAttribute('name'),
        email: this.getAttribute('email')
      },
      bubbles: true
    })
    this.dispatchEvent(event)
  }
}

// Register the custom element
customElements.define('user-card', UserCard)`

  const advancedComponent = `// Advanced Web Component with Lifecycle
class ProductCatalog extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.products = []
    this.filteredProducts = []
    this.currentFilter = 'all'
  }

  connectedCallback() {
    this.loadProducts()
    this.render()
    this.setupEventListeners()
  }

  disconnectedCallback() {
    // Cleanup when component is removed
    this.cleanup()
  }

  static get observedAttributes() {
    return ['api-endpoint', 'category', 'sort-by']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'api-endpoint' && newValue !== oldValue) {
      this.loadProducts()
    } else if (name === 'category' && newValue !== oldValue) {
      this.filterByCategory(newValue)
    }
  }

  async loadProducts() {
    const endpoint = this.getAttribute('api-endpoint')
    if (!endpoint) return

    try {
      const response = await fetch(endpoint)
      this.products = await response.json()
      this.filteredProducts = [...this.products]
      this.render()
    } catch (error) {
      this.renderError('Failed to load products')
    }
  }

  filterByCategory(category) {
    if (category === 'all') {
      this.filteredProducts = [...this.products]
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category)
    }
    this.render()
  }

  setupEventListeners() {
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const productId = e.target.dataset.productId
        this.handleAddToCart(productId)
      } else if (e.target.classList.contains('filter-btn')) {
        const category = e.target.dataset.category
        this.filterByCategory(category)
      }
    })
  }

  handleAddToCart(productId) {
    const product = this.products.find(p => p.id === productId)
    const event = new CustomEvent('add-to-cart', {
      detail: product,
      bubbles: true
    })
    this.dispatchEvent(event)
  }

  render() {
    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }
        
        .filters {
          margin-bottom: 20px;
        }
        
        .filter-btn {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 8px 16px;
          margin-right: 8px;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .filter-btn:hover,
        .filter-btn.active {
          background: #1976d2;
          color: white;
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .product-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        
        .product-image {
          width: 100%;
          height: 150px;
          background: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
        
        .product-name {
          margin: 0 0 8px 0;
          font-size: 18px;
        }
        
        .product-price {
          font-size: 20px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 12px;
        }
        
        .add-to-cart {
          background: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
      
      <div class="filters">
        <button class="filter-btn" data-category="all">All</button>
        <button class="filter-btn" data-category="electronics">Electronics</button>
        <button class="filter-btn" data-category="clothing">Clothing</button>
        <button class="filter-btn" data-category="books">Books</button>
      </div>
      
      <div class="product-grid">
        \${this.filteredProducts.map(product => \`
          <div class="product-card">
            <div class="product-image">\${product.emoji || '📦'}</div>
            <h3 class="product-name">\${product.name}</h3>
            <p class="product-price">$\${product.price}</p>
            <button class="add-to-cart" data-product-id="\${product.id}">
              Add to Cart
            </button>
          </div>
        \`).join('')}
      </div>
    \`
  }

  renderError(message) {
    this.shadowRoot.innerHTML = \`
      <div style="color: red; padding: 20px; text-align: center;">
        <h3>Error</h3>
        <p>\${message}</p>
      </div>
    \`
  }

  cleanup() {
    // Remove any global event listeners, timers, etc.
  }
}

customElements.define('product-catalog', ProductCatalog)`

  const frameworkIntegration = `// React Integration
import React, { useRef, useEffect } from 'react'

const WebComponentWrapper = ({ component, props, onEvent }) => {
  const elementRef = useRef()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set attributes from props
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, String(value))
      }
    })

    // Add event listeners
    const handleEvent = (event) => {
      if (onEvent) {
        onEvent(event.type, event.detail)
      }
    }

    // Common events to listen for
    const events = ['add-to-cart', 'user-contact', 'item-selected']
    events.forEach(eventType => {
      element.addEventListener(eventType, handleEvent)
    })

    return () => {
      events.forEach(eventType => {
        element.removeEventListener(eventType, handleEvent)
      })
    }
  }, [props, onEvent])

  return React.createElement(component, { ref: elementRef })
}

// Usage in React
const App = () => {
  const handleWebComponentEvent = (eventType, detail) => {
    console.log('Web Component Event:', eventType, detail)
  }

  return (
    <div>
      <WebComponentWrapper
        component="user-card"
        props={{
          name: "John Doe",
          email: "john@example.com",
          role: "Developer"
        }}
        onEvent={handleWebComponentEvent}
      />
      
      <WebComponentWrapper
        component="product-catalog"
        props={{
          'api-endpoint': '/api/products',
          category: 'electronics'
        }}
        onEvent={handleWebComponentEvent}
      />
    </div>
  )
}

// Vue Integration
// In Vue component
<template>
  <div>
    <user-card
      :name="user.name"
      :email="user.email"
      :role="user.role"
      @user-contact="handleContact"
    />
    <product-catalog
      :api-endpoint="productsEndpoint"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Designer'
      },
      productsEndpoint: '/api/products'
    }
  },
  methods: {
    handleContact(event) {
      console.log('Contact user:', event.detail)
    },
    handleAddToCart(event) {
      console.log('Add to cart:', event.detail)
    }
  }
}
</script>`

  const microfrontendOrchestrator = `// Micro-frontend Orchestrator using Web Components
class MicrofrontendOrchestrator extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.registeredApps = new Map()
    this.currentRoute = window.location.pathname
  }

  connectedCallback() {
    this.setupRouting()
    this.render()
    this.loadMicrofrontends()
  }

  setupRouting() {
    // Listen for navigation changes
    window.addEventListener('popstate', () => {
      this.handleRouteChange()
    })

    // Intercept link clicks
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault()
        this.navigate(e.target.pathname)
      }
    })
  }

  navigate(path) {
    window.history.pushState({}, '', path)
    this.currentRoute = path
    this.handleRouteChange()
  }

  handleRouteChange() {
    this.currentRoute = window.location.pathname
    this.render()
  }

  registerMicrofrontend(path, componentName, scriptUrl) {
    this.registeredApps.set(path, { componentName, scriptUrl, loaded: false })
  }

  async loadMicrofrontends() {
    // Register micro-frontends
    this.registerMicrofrontend('/', 'home-app', '/microfrontends/home.js')
    this.registerMicrofrontend('/products', 'products-app', '/microfrontends/products.js')
    this.registerMicrofrontend('/cart', 'cart-app', '/microfrontends/cart.js')
    
    // Load the current route's micro-frontend
    await this.loadCurrentMicrofrontend()
  }

  async loadCurrentMicrofrontend() {
    const app = this.getAppForRoute(this.currentRoute)
    if (app && !app.loaded) {
      try {
        await this.loadScript(app.scriptUrl)
        app.loaded = true
        this.render()
      } catch (error) {
        console.error('Failed to load micro-frontend:', error)
        this.renderError('Failed to load application')
      }
    }
  }

  getAppForRoute(route) {
    // Find matching route (simple implementation)
    for (const [path, app] of this.registeredApps.entries()) {
      if (route.startsWith(path)) {
        return app
      }
    }
    return null
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  render() {
    const app = this.getAppForRoute(this.currentRoute)
    
    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: block;
          min-height: 100vh;
        }
        
        .header {
          background: #1976d2;
          color: white;
          padding: 1rem;
        }
        
        .nav {
          list-style: none;
          display: flex;
          gap: 1rem;
          margin: 0;
          padding: 0;
        }
        
        .nav a {
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }
        
        .nav a:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .content {
          padding: 2rem;
          min-height: 400px;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      </style>
      
      <header class="header">
        <nav>
          <ul class="nav">
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/cart">Cart</a></li>
          </ul>
        </nav>
      </header>
      
      <main class="content">
        \${this.renderCurrentApp(app)}
      </main>
    \`
  }

  renderCurrentApp(app) {
    if (!app) {
      return '<h2>Page Not Found</h2>'
    }

    if (!app.loaded) {
      return '<div class="loading">Loading application...</div>'
    }

    return \`<\${app.componentName}><\/\${app.componentName}>\`
  }

  renderError(message) {
    return \`
      <div style="color: red; text-align: center; padding: 2rem;">
        <h3>Error</h3>
        <p>\${message}</p>
      </div>
    \`
  }
}

customElements.define('microfrontend-orchestrator', MicrofrontendOrchestrator)`

  const stateManagement = `// Global State Management for Web Components
class GlobalState extends EventTarget {
  constructor() {
    super()
    this.state = {}
  }

  setState(updates) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...updates }
    
    this.dispatchEvent(new CustomEvent('statechange', {
      detail: { prevState, newState: this.state, updates }
    }))
  }

  getState() {
    return { ...this.state }
  }

  subscribe(listener) {
    this.addEventListener('statechange', listener)
    return () => this.removeEventListener('statechange', listener)
  }
}

// Global instance
const globalState = new GlobalState()

// Mixin for Web Components to connect to global state
const StateMixin = (BaseClass) => class extends BaseClass {
  constructor() {
    super()
    this._stateSubscription = null
  }

  connectedCallback() {
    super.connectedCallback?.()
    this._stateSubscription = globalState.subscribe((event) => {
      this.onStateChange(event.detail)
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback?.()
    if (this._stateSubscription) {
      this._stateSubscription()
    }
  }

  setState(updates) {
    globalState.setState(updates)
  }

  getState() {
    return globalState.getState()
  }

  onStateChange(detail) {
    // Override in components that need to react to state changes
    this.render?.()
  }
}

// Usage in Web Component
class ShoppingCart extends StateMixin(HTMLElement) {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    super.connectedCallback()
    this.render()
  }

  onStateChange(detail) {
    if (detail.updates.cartItems) {
      this.render()
    }
  }

  addItem(item) {
    const currentCart = this.getState().cartItems || []
    this.setState({
      cartItems: [...currentCart, item]
    })
  }

  render() {
    const { cartItems = [] } = this.getState()
    
    this.shadowRoot.innerHTML = \`
      <style>
        .cart {
          border: 1px solid #ddd;
          padding: 1rem;
          border-radius: 4px;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
      </style>
      
      <div class="cart">
        <h3>Shopping Cart (\${cartItems.length})</h3>
        \${cartItems.map(item => \`
          <div class="cart-item">
            <span>\${item.name}</span>
            <span>$\${item.price}</span>
          </div>
        \`).join('')}
      </div>
    \`
  }
}

customElements.define('shopping-cart', ShoppingCart)`

  const examples = {
    'basic-component': { title: 'Basic Web Component', code: basicComponent, language: 'javascript' },
    'advanced-component': { title: 'Advanced Component with Lifecycle', code: advancedComponent, language: 'javascript' },
    'framework-integration': { title: 'Framework Integration', code: frameworkIntegration, language: 'javascript' },
    'microfrontend-orchestrator': { title: 'Micro-frontend Orchestrator', code: microfrontendOrchestrator, language: 'javascript' },
    'state-management': { title: 'State Management', code: stateManagement, language: 'javascript' }
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Web Components Approach</h1>
        <p className="page-description">
          Build micro-frontends using Web Standards with Custom Elements, Shadow DOM, and HTML Templates.
          Create reusable, framework-agnostic components that work everywhere.
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
            className={`tab-button ${activeTab === 'integration' ? 'active' : ''}`}
            onClick={() => setActiveTab('integration')}
          >
            Framework Integration
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
                <h2>What are Web Components?</h2>
                <p>
                  Web Components are a suite of web standards that allow you to create custom, 
                  reusable HTML elements. They provide true encapsulation and are supported natively 
                  by modern browsers, making them ideal for building framework-agnostic micro-frontends.
                </p>

                <div className="web-standards">
                  <div className="standard-card">
                    <h3>Custom Elements</h3>
                    <p>Define your own HTML tags with custom behavior and lifecycle methods</p>
                    <div className="code-snippet">
                      <code>customElements.define('my-element', MyElement)</code>
                    </div>
                  </div>
                  <div className="standard-card">
                    <h3>Shadow DOM</h3>
                    <p>Encapsulated DOM and styling that doesn't interfere with the main document</p>
                    <div className="code-snippet">
                      <code>this.attachShadow({`{mode: 'open'}`})</code>
                    </div>
                  </div>
                  <div className="standard-card">
                    <h3>HTML Templates</h3>
                    <p>Inert HTML fragments that can be cloned and used multiple times</p>
                    <div className="code-snippet">
                      <code>&lt;template id="my-template"&gt;</code>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Micro-frontend Architecture with Web Components</h2>
                <div className="architecture-diagram">
                  <div className="web-components-arch">
                    <div className="host-shell">
                      <h4>Host Application Shell</h4>
                      <div className="component-slots">
                        <div className="component-slot">&lt;header-nav&gt;</div>
                        <div className="component-slot">&lt;product-catalog&gt;</div>
                        <div className="component-slot">&lt;shopping-cart&gt;</div>
                        <div className="component-slot">&lt;user-profile&gt;</div>
                      </div>
                    </div>
                    <div className="shadow-boundary">
                      <span>Shadow DOM Boundaries</span>
                      <div className="boundary-lines"></div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Key Benefits</h2>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <h3>Web Standards</h3>
                    <p>Built on open web standards, ensuring long-term compatibility and support</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Framework Agnostic</h3>
                    <p>Works with any framework or vanilla JavaScript, no lock-in</p>
                  </div>
                  <div className="benefit-card">
                    <h3>True Encapsulation</h3>
                    <p>Shadow DOM provides complete CSS and DOM isolation</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Native Performance</h3>
                    <p>No runtime overhead, runs at native browser speed</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Reusable Components</h3>
                    <p>Share components across different applications and teams</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Backward Compatible</h3>
                    <p>Graceful degradation and polyfill support for older browsers</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Browser Support & Polyfills</h2>
                <div className="browser-support">
                  <div className="browser-grid">
                    <div className="browser-card modern">
                      <h4>Chrome 54+</h4>
                      <div className="support-status excellent">Native</div>
                    </div>
                    <div className="browser-card modern">
                      <h4>Firefox 63+</h4>
                      <div className="support-status excellent">Native</div>
                    </div>
                    <div className="browser-card modern">
                      <h4>Safari 10.1+</h4>
                      <div className="support-status good">Partial</div>
                    </div>
                    <div className="browser-card legacy">
                      <h4>IE 11</h4>
                      <div className="support-status poor">Polyfill</div>
                    </div>
                  </div>
                  <p>For legacy browser support, use polyfills like @webcomponents/polyfills</p>
                </div>
              </section>

              <section>
                <h2>Comparison with Other Approaches</h2>
                <div className="comparison-table">
                  <div className="comparison-row header">
                    <div>Feature</div>
                    <div>Web Components</div>
                    <div>Module Federation</div>
                    <div>Single-spa</div>
                    <div>iFrame</div>
                  </div>
                  <div className="comparison-row">
                    <div>Standards Based</div>
                    <div className="rating excellent">Excellent</div>
                    <div className="rating poor">None</div>
                    <div className="rating poor">None</div>
                    <div className="rating good">Basic</div>
                  </div>
                  <div className="comparison-row">
                    <div>Encapsulation</div>
                    <div className="rating excellent">Excellent</div>
                    <div className="rating good">Good</div>
                    <div className="rating poor">Poor</div>
                    <div className="rating excellent">Excellent</div>
                  </div>
                  <div className="comparison-row">
                    <div>Performance</div>
                    <div className="rating excellent">Excellent</div>
                    <div className="rating excellent">Excellent</div>
                    <div className="rating good">Good</div>
                    <div className="rating poor">Poor</div>
                  </div>
                  <div className="comparison-row">
                    <div>Learning Curve</div>
                    <div className="rating good">Moderate</div>
                    <div className="rating poor">High</div>
                    <div className="rating poor">High</div>
                    <div className="rating excellent">Low</div>
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
                <h2>Component Lifecycle</h2>
                <div className="lifecycle-diagram">
                  <div className="lifecycle-stage">
                    <h3>constructor()</h3>
                    <p>Initialize component, create shadow root</p>
                  </div>
                  <div className="lifecycle-arrow">→</div>
                  <div className="lifecycle-stage">
                    <h3>connectedCallback()</h3>
                    <p>Element added to DOM, setup event listeners</p>
                  </div>
                  <div className="lifecycle-arrow">→</div>
                  <div className="lifecycle-stage">
                    <h3>attributeChangedCallback()</h3>
                    <p>Observed attributes change, re-render if needed</p>
                  </div>
                  <div className="lifecycle-arrow">→</div>
                  <div className="lifecycle-stage">
                    <h3>disconnectedCallback()</h3>
                    <p>Element removed from DOM, cleanup</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Best Practices</h2>
                <div className="best-practices">
                  <div className="practice-card">
                    <h3>1. Use Semantic Tag Names</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Good: Descriptive, namespaced
customElements.define('user-profile-card', UserProfileCard)
customElements.define('ecommerce-product-grid', ProductGrid)

// Avoid: Generic names
customElements.define('my-component', MyComponent)
customElements.define('widget', Widget)`}</code></pre>
                    </div>
                  </div>

                  <div className="practice-card">
                    <h3>2. Handle Attributes Properly</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Observe and react to attribute changes
static get observedAttributes() {
  return ['data-user-id', 'theme', 'size']
}

attributeChangedCallback(name, oldValue, newValue) {
  if (oldValue !== newValue) {
    this.handleAttributeChange(name, newValue)
  }
}

// Provide property accessors
set userId(value) {
  this.setAttribute('data-user-id', value)
}

get userId() {
  return this.getAttribute('data-user-id')
}`}</code></pre>
                    </div>
                  </div>

                  <div className="practice-card">
                    <h3>3. Cleanup Resources</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`disconnectedCallback() {
  // Remove event listeners
  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler)
  }
  
  // Clear timers
  if (this._timer) {
    clearInterval(this._timer)
  }
  
  // Abort pending requests
  if (this._controller) {
    this._controller.abort()
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="practice-card">
                    <h3>4. Error Boundaries</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`render() {
  try {
    // Component rendering logic
    this.shadowRoot.innerHTML = this.getTemplate()
  } catch (error) {
    this.renderError(error)
    this.reportError(error)
  }
}

renderError(error) {
  this.shadowRoot.innerHTML = \`
    <div class="error-boundary">
      <h3>Something went wrong</h3>
      <p>Component failed to render</p>
      <button onclick="this.getRootNode().host.retry()">
        Retry
      </button>
    </div>
  \`
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'integration' && (
            <div className="integration-content">
              <section>
                <h2>Framework Integration Patterns</h2>
                <p>
                  Web Components can be seamlessly integrated into any framework or used standalone.
                  Here are common patterns for different frameworks:
                </p>

                <div className="framework-examples">
                  <div className="framework-card">
                    <h3>React Integration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`import React, { useRef, useEffect } from 'react'

const WebComponentWrapper = ({ component, ...props }) => {
  const ref = useRef()

  useEffect(() => {
    const element = ref.current
    
    // Set properties
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        // Event listeners
        const eventName = key.slice(2).toLowerCase()
        element.addEventListener(eventName, value)
      } else {
        // Properties/attributes
        element[key] = value
      }
    })
  }, [props])

  return React.createElement(component, { ref })
}

// Usage
<WebComponentWrapper 
  component="user-card"
  name="John Doe"
  onUserContact={(e) => console.log(e.detail)}
/>`}</code></pre>
                    </div>
                  </div>

                  <div className="framework-card">
                    <h3>Vue Integration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`<!-- Vue template -->
<template>
  <div>
    <user-card
      :name="user.name"
      :email="user.email"
      @user-contact="handleContact"
      ref="userCard"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: { name: 'Jane Doe', email: 'jane@example.com' }
    }
  },
  methods: {
    handleContact(event) {
      console.log('Contact user:', event.detail)
    }
  },
  mounted() {
    // Direct property access
    this.$refs.userCard.customMethod()
  }
}
</script>`}</code></pre>
                    </div>
                  </div>

                  <div className="framework-card">
                    <h3>Angular Integration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }

// component.html
<user-card 
  [attr.name]="user.name"
  [attr.email]="user.email"
  (user-contact)="handleContact($event)"
>
</user-card>

// component.ts
export class AppComponent {
  user = { name: 'Bob Smith', email: 'bob@example.com' }
  
  handleContact(event: CustomEvent) {
    console.log('Contact user:', event.detail)
  }
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Micro-frontend Communication</h2>
                <div className="communication-patterns">
                  <div className="pattern-card">
                    <h3>Custom Events</h3>
                    <p>Use custom events for loose coupling between components</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Emitting events
class ProductCard extends HTMLElement {
  addToCart(product) {
    this.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: product,
      bubbles: true
    }))
  }
}

// Listening for events
document.addEventListener('add-to-cart', (event) => {
  console.log('Product added:', event.detail)
})`}</code></pre>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>Shared State Service</h3>
                    <p>Centralized state management for connected components</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Global state service
class StateService extends EventTarget {
  constructor() {
    super()
    this.state = new Proxy({}, {
      set: (target, property, value) => {
        const oldValue = target[property]
        target[property] = value
        this.dispatchEvent(new CustomEvent('statechange', {
          detail: { property, value, oldValue }
        }))
        return true
      }
    })
  }
}

const stateService = new StateService()

// Component subscribes to state changes
connectedCallback() {
  stateService.addEventListener('statechange', this.handleStateChange)
}`}</code></pre>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>Props and Slots</h3>
                    <p>Parent-child communication through properties and content projection</p>
                    <div className="code-viewer">
                      <pre><code className="language-html">{`<!-- Parent component -->
<product-grid>
  <div slot="header">
    <h2>Featured Products</h2>
    <search-box></search-box>
  </div>
  
  <div slot="footer">
    <pagination-controls></pagination-controls>
  </div>
</product-grid>

<!-- In component template -->
<div class="header">
  <slot name="header"></slot>
</div>
<div class="content">
  <!-- Product grid content -->
</div>
<div class="footer">
  <slot name="footer"></slot>
</div>`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Build and Distribution</h2>
                <div className="build-strategies">
                  <div className="strategy-card">
                    <h3>Standalone Distribution</h3>
                    <p>Bundle as self-contained components with dependencies</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'my-components.js',
    library: 'MyComponents',
    libraryTarget: 'umd'
  },
  externals: {
    // Don't bundle large dependencies
    'lit-element': 'LitElement'
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="strategy-card">
                    <h3>NPM Package Distribution</h3>
                    <p>Publish as npm packages for easy installation</p>
                    <div className="code-viewer">
                      <pre><code className="language-json">{`{
  "name": "@company/web-components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "files": ["dist"],
  "customElements": "custom-elements.json",
  "dependencies": {
    "lit-element": "^2.4.0"
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="strategy-card">
                    <h3>CDN Distribution</h3>
                    <p>Host components on CDN for easy integration</p>
                    <div className="code-viewer">
                      <pre><code className="language-html">{`<!-- Load from CDN -->
<script src="https://cdn.company.com/components/v1/all.js"></script>

<!-- Or load specific components -->
<script type="module">
  import './components/user-card.js'
  import './components/product-grid.js'
</script>`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="demo-content">
              <section>
                <h2>Interactive Web Components Demo</h2>
                
                <div className="demo-controls">
                  <h3>Select Component to Demo:</h3>
                  <div className="component-selector">
                    <button
                      className={`demo-button ${webComponentDemo === 'user-card' ? 'active' : ''}`}
                      onClick={() => setWebComponentDemo('user-card')}
                    >
                      User Card
                    </button>
                    <button
                      className={`demo-button ${webComponentDemo === 'product-tile' ? 'active' : ''}`}
                      onClick={() => setWebComponentDemo('product-tile')}
                    >
                      Product Tile
                    </button>
                    <button
                      className={`demo-button ${webComponentDemo === 'notification' ? 'active' : ''}`}
                      onClick={() => setWebComponentDemo('notification')}
                    >
                      Notification
                    </button>
                  </div>
                </div>

                <div className="demo-container">
                  <div className="demo-showcase">
                    <h3>Live Web Component</h3>
                    <div 
                      ref={demoContainerRef} 
                      className="web-component-demo"
                    >
                      {/* Web component will be inserted here */}
                    </div>
                  </div>

                  <div className="demo-features">
                    <h3>Component Features</h3>
                    <ul className="feature-list">
                      <li>Shadow DOM encapsulation</li>
                      <li>Custom element lifecycle</li>
                      <li>Attribute-based configuration</li>
                      <li>Event-driven communication</li>
                      <li>Framework-agnostic usage</li>
                      <li>Native browser APIs</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Component Library Example</h2>
                <div className="library-showcase">
                  <div className="component-category">
                    <h3>Form Components</h3>
                    <div className="component-grid">
                      <div className="component-preview">
                        <div className="preview-header">input-field</div>
                        <div className="preview-demo">
                          <div className="simulated-input">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter email" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="component-preview">
                        <div className="preview-header">select-dropdown</div>
                        <div className="preview-demo">
                          <div className="simulated-select">
                            <label>Country</label>
                            <select>
                              <option>United States</option>
                              <option>Canada</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="component-category">
                    <h3>UI Components</h3>
                    <div className="component-grid">
                      <div className="component-preview">
                        <div className="preview-header">modal-dialog</div>
                        <div className="preview-demo">
                          <div className="simulated-modal">
                            <div className="modal-header">Confirm Action</div>
                            <div className="modal-body">Are you sure?</div>
                            <div className="modal-footer">
                              <button>Cancel</button>
                              <button>Confirm</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="component-preview">
                        <div className="preview-header">progress-bar</div>
                        <div className="preview-demo">
                          <div className="simulated-progress">
                            <div className="progress-label">Loading...</div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: '65%' }}></div>
                            </div>
                            <div className="progress-text">65%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="component-category">
                    <h3>Data Components</h3>
                    <div className="component-grid">
                      <div className="component-preview">
                        <div className="preview-header">data-table</div>
                        <div className="preview-demo">
                          <div className="simulated-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>John Doe</td>
                                  <td>Active</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      
                      <div className="component-preview">
                        <div className="preview-header">chart-widget</div>
                        <div className="preview-demo">
                          <div className="simulated-chart">
                            <div className="chart-title">Sales Data</div>
                            <div className="chart-area">📊</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Real-World Implementation</h2>
                <div className="implementation-examples">
                  <div className="example-card">
                    <h3>Design System Components</h3>
                    <p>Shared UI components across multiple applications</p>
                    <ul>
                      <li>Button, Input, Modal components</li>
                      <li>Consistent design tokens</li>
                      <li>Accessibility built-in</li>
                      <li>Theme support</li>
                    </ul>
                  </div>
                  
                  <div className="example-card">
                    <h3>Third-Party Integrations</h3>
                    <p>Embeddable widgets for external use</p>
                    <ul>
                      <li>Payment forms</li>
                      <li>Chat widgets</li>
                      <li>Social media feeds</li>
                      <li>Analytics dashboards</li>
                    </ul>
                  </div>
                  
                  <div className="example-card">
                    <h3>Legacy System Modernization</h3>
                    <p>Gradually replace legacy UI components</p>
                    <ul>
                      <li>Progressive enhancement</li>
                      <li>Incremental adoption</li>
                      <li>Backward compatibility</li>
                      <li>Reduced migration risk</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Bundle Size</h4>
                    <div className="metric-value">15KB</div>
                    <div className="metric-sub">Gzipped component</div>
                  </div>
                  <div className="metric-card">
                    <h4>Render Time</h4>
                    <div className="metric-value">2.1ms</div>
                    <div className="metric-sub">Initial render</div>
                  </div>
                  <div className="metric-card">
                    <h4>Memory Usage</h4>
                    <div className="metric-value">840KB</div>
                    <div className="metric-sub">Per component instance</div>
                  </div>
                  <div className="metric-card">
                    <h4>Browser Support</h4>
                    <div className="metric-value">94%</div>
                    <div className="metric-sub">Global coverage</div>
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

export default WebComponentsPage