import React, { useState, useEffect } from 'react'

const StateSharingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedExample, setSelectedExample] = useState('custom-events')
  const [demoPattern, setDemoPattern] = useState('events')
  const [sharedState, setSharedState] = useState({
    user: { name: 'John Doe', email: 'john@example.com' },
    cart: [{ id: 1, name: 'Laptop', price: 999 }],
    theme: 'dark'
  })

  useEffect(() => {
    // Syntax highlighting removed for build compatibility
  }, [activeTab, selectedExample])

  const customEventsExample = `// Custom Events Pattern - Publisher
class ShoppingCart extends HTMLElement {
  addItem(item) {
    // Update local state
    this.items.push(item)
    
    // Notify other micro-frontends
    window.dispatchEvent(new CustomEvent('cart:item-added', {
      detail: {
        item,
        cartTotal: this.getTotal(),
        timestamp: Date.now()
      }
    }))
  }
  
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId)
    
    window.dispatchEvent(new CustomEvent('cart:item-removed', {
      detail: {
        itemId,
        cartTotal: this.getTotal(),
        timestamp: Date.now()
      }
    }))
  }
}

// Custom Events Pattern - Subscriber
class CartCounter extends HTMLElement {
  connectedCallback() {
    // Listen for cart events
    window.addEventListener('cart:item-added', this.handleCartUpdate.bind(this))
    window.addEventListener('cart:item-removed', this.handleCartUpdate.bind(this))
    window.addEventListener('cart:cleared', this.handleCartUpdate.bind(this))
  }
  
  disconnectedCallback() {
    window.removeEventListener('cart:item-added', this.handleCartUpdate)
    window.removeEventListener('cart:item-removed', this.handleCartUpdate)
    window.removeEventListener('cart:cleared', this.handleCartUpdate)
  }
  
  handleCartUpdate(event) {
    this.updateCounter(event.detail.cartTotal)
    this.showNotification(\`Cart updated: \${event.type}\`)
  }
  
  updateCounter(total) {
    this.shadowRoot.querySelector('.cart-count').textContent = total
  }
}`

  const globalStoreExample = `// Global Store Pattern
class GlobalStore extends EventTarget {
  constructor() {
    super()
    this.state = {
      user: null,
      cart: [],
      theme: 'light',
      notifications: []
    }
    this.subscribers = new Set()
  }

  // Get current state
  getState() {
    return { ...this.state }
  }

  // Update state and notify subscribers
  setState(updates) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...updates }
    
    // Emit state change event
    this.dispatchEvent(new CustomEvent('statechange', {
      detail: {
        prevState,
        newState: this.state,
        updates
      }
    }))
    
    // Notify direct subscribers
    this.subscribers.forEach(callback => {
      callback(this.state, prevState, updates)
    })
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Specific state selectors
  getUser() {
    return this.state.user
  }

  getCartItems() {
    return this.state.cart
  }

  getTheme() {
    return this.state.theme
  }

  // Action methods
  updateUser(userUpdates) {
    this.setState({
      user: { ...this.state.user, ...userUpdates }
    })
  }

  addToCart(item) {
    this.setState({
      cart: [...this.state.cart, { ...item, id: Date.now() }]
    })
  }

  removeFromCart(itemId) {
    this.setState({
      cart: this.state.cart.filter(item => item.id !== itemId)
    })
  }

  setTheme(theme) {
    this.setState({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  }
}

// Global instance
window.globalStore = new GlobalStore()

// Usage in React micro-frontend
import { useEffect, useState } from 'react'

const useGlobalStore = (selector) => {
  const [state, setState] = useState(() => selector(window.globalStore.getState()))
  
  useEffect(() => {
    const unsubscribe = window.globalStore.subscribe((newState) => {
      setState(selector(newState))
    })
    
    return unsubscribe
  }, [selector])
  
  return state
}

// React component using global store
const CartComponent = () => {
  const cartItems = useGlobalStore(state => state.cart)
  const user = useGlobalStore(state => state.user)
  
  const addItem = (item) => {
    window.globalStore.addToCart(item)
  }
  
  return (
    <div>
      <h3>Cart for {user?.name}</h3>
      <ul>
        {cartItems.map(item => (
          <li key={item.id}>{item.name} - ${item.price}</li>
        ))}
      </ul>
      <button onClick={() => addItem({ name: 'New Item', price: 50 })}>
        Add Item
      </button>
    </div>
  )
}`

  const rxjsExample = `// RxJS Observables Pattern
import { BehaviorSubject, combineLatest, map } from 'rxjs'

// Create observables for different state slices
const userState$ = new BehaviorSubject({
  id: null,
  name: '',
  email: '',
  preferences: {}
})

const cartState$ = new BehaviorSubject({
  items: [],
  total: 0,
  currency: 'USD'
})

const uiState$ = new BehaviorSubject({
  theme: 'light',
  sidebarOpen: false,
  loading: false
})

// Combined state observable
const appState$ = combineLatest({
  user: userState$,
  cart: cartState$,
  ui: uiState$
})

// Derived state observables
const cartTotal$ = cartState$.pipe(
  map(cart => cart.items.reduce((sum, item) => sum + item.price, 0))
)

const isLoggedIn$ = userState$.pipe(
  map(user => user.id !== null)
)

// State actions
class StateActions {
  // User actions
  static loginUser(userData) {
    userState$.next({
      ...userState$.value,
      ...userData
    })
  }

  static logoutUser() {
    userState$.next({
      id: null,
      name: '',
      email: '',
      preferences: {}
    })
  }

  // Cart actions
  static addToCart(item) {
    const currentCart = cartState$.value
    cartState$.next({
      ...currentCart,
      items: [...currentCart.items, item]
    })
  }

  static removeFromCart(itemId) {
    const currentCart = cartState$.value
    cartState$.next({
      ...currentCart,
      items: currentCart.items.filter(item => item.id !== itemId)
    })
  }

  // UI actions
  static setTheme(theme) {
    uiState$.next({
      ...uiState$.value,
      theme
    })
  }

  static toggleSidebar() {
    const currentUI = uiState$.value
    uiState$.next({
      ...currentUI,
      sidebarOpen: !currentUI.sidebarOpen
    })
  }
}

// Usage in micro-frontends
class UserProfile extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // Subscribe to user state changes
    this.userSubscription = userState$.subscribe(user => {
      this.render(user)
    })
  }

  disconnectedCallback() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  render(user) {
    this.shadowRoot.innerHTML = \`
      <div class="user-profile">
        <h3>Welcome, \${user.name || 'Guest'}</h3>
        <p>Email: \${user.email}</p>
        <button onclick="this.logout()">Logout</button>
      </div>
    \`
  }

  logout() {
    StateActions.logoutUser()
  }
}

// Usage in React
import { useEffect, useState } from 'react'

const useObservable = (observable, initialValue) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const subscription = observable.subscribe(setValue)
    return () => subscription.unsubscribe()
  }, [observable])

  return value
}

const ReactCartComponent = () => {
  const cart = useObservable(cartState$, { items: [], total: 0 })
  const total = useObservable(cartTotal$, 0)

  return (
    <div>
      <h3>Shopping Cart</h3>
      <p>Items: {cart.items.length}</p>
      <p>Total: ${total}</p>
      <button onClick={() => StateActions.addToCart({ id: Date.now(), name: 'Item', price: 25 })}>
        Add Item
      </button>
    </div>
  )
}`

  const webworkersExample = `// Web Workers for Heavy State Operations
class StateWorker {
  constructor() {
    // Create worker for heavy operations
    this.worker = new Worker('/workers/state-worker.js')
    this.pendingOperations = new Map()
    
    // Handle worker messages
    this.worker.onmessage = (event) => {
      const { id, result, error } = event.data
      const { resolve, reject } = this.pendingOperations.get(id) || {}
      
      if (resolve) {
        if (error) reject(new Error(error))
        else resolve(result)
        this.pendingOperations.delete(id)
      }
    }
  }

  // Offload heavy computations to worker
  async processLargeDataset(data) {
    const id = Math.random().toString(36).substr(2, 9)
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(id, { resolve, reject })
      
      this.worker.postMessage({
        id,
        type: 'PROCESS_DATASET',
        data
      })
    })
  }

  // Calculate complex analytics
  async calculateAnalytics(events) {
    const id = Math.random().toString(36).substr(2, 9)
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(id, { resolve, reject })
      
      this.worker.postMessage({
        id,
        type: 'CALCULATE_ANALYTICS',
        events
      })
    })
  }
}

// state-worker.js
self.onmessage = function(event) {
  const { id, type, data, events } = event.data
  
  try {
    let result
    
    switch (type) {
      case 'PROCESS_DATASET':
        result = processLargeDataset(data)
        break
        
      case 'CALCULATE_ANALYTICS':
        result = calculateAnalytics(events)
        break
        
      default:
        throw new Error(\`Unknown operation: \${type}\`)
    }
    
    self.postMessage({ id, result })
  } catch (error) {
    self.postMessage({ id, error: error.message })
  }
}

function processLargeDataset(data) {
  // Heavy computation logic
  return data.map(item => ({
    ...item,
    processed: true,
    score: calculateScore(item)
  })).filter(item => item.score > 0.5)
}

function calculateAnalytics(events) {
  // Complex analytics calculations
  const userSessions = groupEventsBySession(events)
  const conversionRates = calculateConversionRates(userSessions)
  const userJourneys = analyzeUserJourneys(userSessions)
  
  return {
    totalSessions: userSessions.length,
    conversionRates,
    userJourneys,
    popularPages: getPopularPages(events)
  }
}

// Usage in state management
class AnalyticsStore {
  constructor() {
    this.worker = new StateWorker()
    this.analytics = new BehaviorSubject({})
  }

  async updateAnalytics(events) {
    try {
      const result = await this.worker.calculateAnalytics(events)
      this.analytics.next(result)
    } catch (error) {
      console.error('Analytics calculation failed:', error)
    }
  }
}`

  const browserStorageExample = `// Browser Storage for Persistence
class PersistentStateManager {
  constructor(storageKey = 'micro-frontend-state') {
    this.storageKey = storageKey
    this.state = this.loadFromStorage()
    this.subscribers = new Set()
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this))
  }

  // Load state from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultState()
    } catch (error) {
      console.error('Failed to load state from storage:', error)
      return this.getDefaultState()
    }
  }

  // Save state to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save state to storage:', error)
    }
  }

  getDefaultState() {
    return {
      user: null,
      cart: [],
      preferences: {
        theme: 'light',
        language: 'en'
      },
      lastUpdated: Date.now()
    }
  }

  // Get current state
  getState() {
    return { ...this.state }
  }

  // Update state with persistence
  setState(updates) {
    const prevState = { ...this.state }
    this.state = {
      ...this.state,
      ...updates,
      lastUpdated: Date.now()
    }
    
    // Persist to storage
    this.saveToStorage()
    
    // Notify subscribers
    this.notifySubscribers(prevState)
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers(prevState) {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state, prevState)
      } catch (error) {
        console.error('Subscriber callback error:', error)
      }
    })
  }

  // Handle storage changes from other tabs
  handleStorageChange(event) {
    if (event.key === this.storageKey && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue)
        const prevState = { ...this.state }
        this.state = newState
        this.notifySubscribers(prevState)
      } catch (error) {
        console.error('Failed to handle storage change:', error)
      }
    }
  }

  // Clear state
  clearState() {
    this.setState(this.getDefaultState())
  }

  // Specific getters and setters
  setUser(user) {
    this.setState({ user })
  }

  addToCart(item) {
    const cart = [...this.state.cart, item]
    this.setState({ cart })
  }

  updatePreferences(prefs) {
    this.setState({
      preferences: { ...this.state.preferences, ...prefs }
    })
  }
}

// Singleton instance
const stateManager = new PersistentStateManager()

// React hook for persistent state
const usePersistentState = (selector = state => state) => {
  const [state, setState] = useState(() => selector(stateManager.getState()))

  useEffect(() => {
    const unsubscribe = stateManager.subscribe((newState) => {
      setState(selector(newState))
    })
    
    return unsubscribe
  }, [selector])

  const updateState = useCallback((updates) => {
    stateManager.setState(updates)
  }, [])

  return [state, updateState]
}

// Usage in components
const PersistentCartComponent = () => {
  const [cart, updateCart] = usePersistentState(state => state.cart)
  
  const addItem = (item) => {
    stateManager.addToCart(item)
  }
  
  return (
    <div>
      <h3>Persistent Cart ({cart.length} items)</h3>
      {cart.map(item => (
        <div key={item.id}>{item.name} - ${item.price}</div>
      ))}
      <button onClick={() => addItem({ id: Date.now(), name: 'New Item', price: 30 })}>
        Add Item
      </button>
    </div>
  )
}`

  const examples = {
    'custom-events': { title: 'Custom Events', code: customEventsExample, language: 'javascript' },
    'global-store': { title: 'Global Store Pattern', code: globalStoreExample, language: 'javascript' },
    'rxjs-observables': { title: 'RxJS Observables', code: rxjsExample, language: 'javascript' },
    'web-workers': { title: 'Web Workers for Heavy Operations', code: webworkersExample, language: 'javascript' },
    'browser-storage': { title: 'Browser Storage Persistence', code: browserStorageExample, language: 'javascript' }
  }

  const updateSharedState = (key: string, value: any) => {
    setSharedState(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>State Sharing Between Micro-Frontends</h1>
        <p className="page-description">
          Explore different patterns and strategies for sharing state across micro-frontend applications
          while maintaining loose coupling and independence.
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
            className={`tab-button ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            Patterns
          </button>
          <button
            className={`tab-button ${activeTab === 'implementation' ? 'active' : ''}`}
            onClick={() => setActiveTab('implementation')}
          >
            Implementation
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
                <h2>State Sharing Challenges</h2>
                <p>
                  One of the biggest challenges in micro-frontend architectures is managing shared state 
                  while preserving the independence and isolation that makes micro-frontends valuable. 
                  The key is finding the right balance between coupling and coordination.
                </p>

                <div className="challenges-grid">
                  <div className="challenge-card">
                    <h3>Loose Coupling</h3>
                    <p>Micro-frontends should remain independent and deployable separately</p>
                  </div>
                  <div className="challenge-card">
                    <h3>State Consistency</h3>
                    <p>Shared data must stay synchronized across all applications</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Performance</h3>
                    <p>State updates should be efficient without unnecessary re-renders</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Error Isolation</h3>
                    <p>State corruption in one app shouldn't break others</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Types of Shared State</h2>
                <div className="state-types">
                  <div className="state-type-card">
                    <h3>User State</h3>
                    <p>Authentication, profile, preferences, permissions</p>
                    <ul>
                      <li>Current user information</li>
                      <li>Authentication tokens</li>
                      <li>User preferences and settings</li>
                      <li>Permission levels and roles</li>
                    </ul>
                  </div>
                  
                  <div className="state-type-card">
                    <h3>Application State</h3>
                    <p>Shopping cart, form data, navigation state</p>
                    <ul>
                      <li>Shopping cart contents</li>
                      <li>Multi-step form progress</li>
                      <li>Navigation and routing state</li>
                      <li>Search queries and filters</li>
                    </ul>
                  </div>
                  
                  <div className="state-type-card">
                    <h3>UI State</h3>
                    <p>Theme, notifications, modal state</p>
                    <ul>
                      <li>Theme and appearance settings</li>
                      <li>Global notifications</li>
                      <li>Modal and overlay state</li>
                      <li>Loading and error states</li>
                    </ul>
                  </div>
                  
                  <div className="state-type-card">
                    <h3>Business State</h3>
                    <p>Domain-specific data, real-time updates</p>
                    <ul>
                      <li>Product catalog data</li>
                      <li>Real-time chat messages</li>
                      <li>Live analytics data</li>
                      <li>Collaborative document state</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>State Sharing Patterns</h2>
                <div className="patterns-overview">
                  <div className="pattern-overview-card">
                    <h3>1. Custom Events</h3>
                    <div className="pattern-pros-cons">
                      <div className="pattern-pros">
                        <h4>Pros</h4>
                        <ul>
                          <li>Loose coupling</li>
                          <li>Browser native</li>
                          <li>Simple implementation</li>
                        </ul>
                      </div>
                      <div className="pattern-cons">
                        <h4>Cons</h4>
                        <ul>
                          <li>No state persistence</li>
                          <li>Event ordering issues</li>
                          <li>Limited type safety</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pattern-overview-card">
                    <h3>2. Global Store</h3>
                    <div className="pattern-pros-cons">
                      <div className="pattern-pros">
                        <h4>Pros</h4>
                        <ul>
                          <li>Centralized state</li>
                          <li>Predictable updates</li>
                          <li>Time-travel debugging</li>
                        </ul>
                      </div>
                      <div className="pattern-cons">
                        <h4>Cons</h4>
                        <ul>
                          <li>Increased coupling</li>
                          <li>Single point of failure</li>
                          <li>Memory overhead</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pattern-overview-card">
                    <h3>3. Observable Streams</h3>
                    <div className="pattern-pros-cons">
                      <div className="pattern-pros">
                        <h4>Pros</h4>
                        <ul>
                          <li>Reactive updates</li>
                          <li>Powerful operators</li>
                          <li>Async handling</li>
                        </ul>
                      </div>
                      <div className="pattern-cons">
                        <h4>Cons</h4>
                        <ul>
                          <li>Learning curve</li>
                          <li>Bundle size</li>
                          <li>Complex debugging</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pattern-overview-card">
                    <h3>4. Browser Storage</h3>
                    <div className="pattern-pros-cons">
                      <div className="pattern-pros">
                        <h4>Pros</h4>
                        <ul>
                          <li>Persistence</li>
                          <li>Cross-tab sync</li>
                          <li>Simple API</li>
                        </ul>
                      </div>
                      <div className="pattern-cons">
                        <h4>Cons</h4>
                        <ul>
                          <li>Storage limits</li>
                          <li>Serialization overhead</li>
                          <li>Privacy concerns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Choosing the Right Pattern</h2>
                <div className="decision-matrix">
                  <div className="matrix-header">
                    <div>Use Case</div>
                    <div>Recommended Pattern</div>
                    <div>Alternative</div>
                  </div>
                  <div className="matrix-row">
                    <div>Simple notifications</div>
                    <div className="recommended">Custom Events</div>
                    <div>Global Store</div>
                  </div>
                  <div className="matrix-row">
                    <div>Complex state management</div>
                    <div className="recommended">Global Store</div>
                    <div>Observable Streams</div>
                  </div>
                  <div className="matrix-row">
                    <div>Real-time data streams</div>
                    <div className="recommended">Observable Streams</div>
                    <div>Web Workers</div>
                  </div>
                  <div className="matrix-row">
                    <div>Persistent user data</div>
                    <div className="recommended">Browser Storage</div>
                    <div>Global Store + Persistence</div>
                  </div>
                  <div className="matrix-row">
                    <div>Cross-tab synchronization</div>
                    <div className="recommended">Browser Storage</div>
                    <div>Server-sent Events</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="patterns-content">
              <section>
                <h2>State Sharing Patterns Deep Dive</h2>
                
                <div className="pattern-detail-card">
                  <h3>1. Custom Events Pattern</h3>
                  <p>Uses the browser's native event system for loose coupling between micro-frontends.</p>
                  
                  <div className="pattern-flow">
                    <div className="flow-step">
                      <h4>Publisher</h4>
                      <p>Dispatches custom events when state changes</p>
                      <div className="code-snippet">
                        <code>window.dispatchEvent(new CustomEvent('cart:update', {`{detail: data}`}))</code>
                      </div>
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-step">
                      <h4>Subscriber</h4>
                      <p>Listens for events and updates accordingly</p>
                      <div className="code-snippet">
                        <code>window.addEventListener('cart:update', handler)</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pattern-use-cases">
                    <h4>Best For:</h4>
                    <ul>
                      <li>Simple state notifications</li>
                      <li>User actions (login, logout)</li>
                      <li>UI state changes (theme, language)</li>
                      <li>Cross-application navigation</li>
                    </ul>
                  </div>
                </div>

                <div className="pattern-detail-card">
                  <h3>2. Global Store Pattern</h3>
                  <p>Centralized state management with a single source of truth accessible to all micro-frontends.</p>
                  
                  <div className="store-architecture">
                    <div className="store-layer">
                      <h4>State Layer</h4>
                      <p>Immutable state tree</p>
                    </div>
                    <div className="store-layer">
                      <h4>Actions Layer</h4>
                      <p>State update methods</p>
                    </div>
                    <div className="store-layer">
                      <h4>Subscription Layer</h4>
                      <p>Change notifications</p>
                    </div>
                  </div>
                  
                  <div className="pattern-use-cases">
                    <h4>Best For:</h4>
                    <ul>
                      <li>Complex state dependencies</li>
                      <li>Predictable state updates</li>
                      <li>Time-travel debugging</li>
                      <li>State persistence and rehydration</li>
                    </ul>
                  </div>
                </div>

                <div className="pattern-detail-card">
                  <h3>3. Observable Streams Pattern</h3>
                  <p>Reactive programming approach using observables for state management and data flow.</p>
                  
                  <div className="observable-flow">
                    <div className="stream-source">Data Sources</div>
                    <div className="stream-arrow">→</div>
                    <div className="stream-operator">Operators</div>
                    <div className="stream-arrow">→</div>
                    <div className="stream-subscriber">Subscribers</div>
                  </div>
                  
                  <div className="pattern-use-cases">
                    <h4>Best For:</h4>
                    <ul>
                      <li>Real-time data streams</li>
                      <li>Complex async operations</li>
                      <li>Data transformation pipelines</li>
                      <li>Reactive user interfaces</li>
                    </ul>
                  </div>
                </div>

                <div className="pattern-detail-card">
                  <h3>4. Browser Storage Pattern</h3>
                  <p>Leverages localStorage, sessionStorage, or IndexedDB for state persistence and cross-tab sync.</p>
                  
                  <div className="storage-types">
                    <div className="storage-type">
                      <h4>localStorage</h4>
                      <p>Persistent across browser sessions</p>
                    </div>
                    <div className="storage-type">
                      <h4>sessionStorage</h4>
                      <p>Tab-scoped, cleared on tab close</p>
                    </div>
                    <div className="storage-type">
                      <h4>IndexedDB</h4>
                      <p>Large data storage with queries</p>
                    </div>
                  </div>
                  
                  <div className="pattern-use-cases">
                    <h4>Best For:</h4>
                    <ul>
                      <li>User preferences</li>
                      <li>Form data persistence</li>
                      <li>Cross-tab synchronization</li>
                      <li>Offline data caching</li>
                    </ul>
                  </div>
                </div>

                <div className="pattern-detail-card">
                  <h3>5. Server-Sent Events Pattern</h3>
                  <p>Real-time state synchronization using server-pushed events.</p>
                  
                  <div className="sse-flow">
                    <div className="sse-step">Server State Changes</div>
                    <div className="sse-arrow">→</div>
                    <div className="sse-step">SSE Stream</div>
                    <div className="sse-arrow">→</div>
                    <div className="sse-step">All Connected Clients</div>
                  </div>
                  
                  <div className="pattern-use-cases">
                    <h4>Best For:</h4>
                    <ul>
                      <li>Real-time collaboration</li>
                      <li>Live data updates</li>
                      <li>Multi-user applications</li>
                      <li>System-wide notifications</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Hybrid Approaches</h2>
                <div className="hybrid-patterns">
                  <div className="hybrid-card">
                    <h3>Store + Events</h3>
                    <p>Combine centralized store with event-driven updates</p>
                    <ul>
                      <li>Store for complex state</li>
                      <li>Events for notifications</li>
                      <li>Best of both worlds</li>
                    </ul>
                  </div>
                  
                  <div className="hybrid-card">
                    <h3>Observables + Storage</h3>
                    <p>Reactive streams with persistent state</p>
                    <ul>
                      <li>Reactive updates</li>
                      <li>Automatic persistence</li>
                      <li>Cross-session continuity</li>
                    </ul>
                  </div>
                  
                  <div className="hybrid-card">
                    <h3>Micro-stores</h3>
                    <p>Domain-specific stores with event coordination</p>
                    <ul>
                      <li>Domain separation</li>
                      <li>Reduced coupling</li>
                      <li>Independent scaling</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'implementation' && (
            <div className="implementation-content">
              <section>
                <h2>Implementation Examples</h2>
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
                <h2>Framework Integration</h2>
                <div className="framework-integration">
                  <div className="integration-card">
                    <h3>React Integration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Custom hook for global state
const useGlobalState = (selector) => {
  const [state, setState] = useState(() => 
    selector(window.globalStore.getState())
  )
  
  useEffect(() => {
    return window.globalStore.subscribe((newState) => {
      setState(selector(newState))
    })
  }, [selector])
  
  return state
}

// Usage in component
const CartComponent = () => {
  const cartItems = useGlobalState(state => state.cart)
  
  return (
    <div>
      {cartItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}`}</code></pre>
                    </div>
                  </div>

                  <div className="integration-card">
                    <h3>Vue Integration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Vue plugin for global state
const GlobalStatePlugin = {
  install(app) {
    app.config.globalProperties.$globalState = window.globalStore
    
    app.mixin({
      created() {
        if (this.$options.globalState) {
          this._unsubscribe = window.globalStore.subscribe(() => {
            this.$forceUpdate()
          })
        }
      },
      
      beforeUnmount() {
        if (this._unsubscribe) {
          this._unsubscribe()
        }
      }
    })
  }
}

// Usage in component
export default {
  globalState: true,
  computed: {
    cartItems() {
      return this.$globalState.getState().cart
    }
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="integration-card">
                    <h3>Angular Integration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Angular service for global state
@Injectable({ providedIn: 'root' })
export class GlobalStateService {
  private stateSubject = new BehaviorSubject(window.globalStore.getState())
  public state$ = this.stateSubject.asObservable()
  
  constructor() {
    window.globalStore.subscribe((newState) => {
      this.stateSubject.next(newState)
    })
  }
  
  getState() {
    return window.globalStore.getState()
  }
  
  updateState(updates) {
    window.globalStore.setState(updates)
  }
}

// Usage in component
@Component({
  selector: 'app-cart',
  template: \`
    <div *ngFor="let item of cartItems$ | async">
      {{item.name}}
    </div>
  \`
})
export class CartComponent {
  cartItems$ = this.stateService.state$.pipe(
    map(state => state.cart)
  )
  
  constructor(private stateService: GlobalStateService) {}
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Error Handling and Resilience</h2>
                <div className="error-handling-patterns">
                  <div className="error-pattern-card">
                    <h3>State Validation</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`class StateValidator {
  static validate(state, schema) {
    try {
      // Validate state against schema
      const errors = this.validateSchema(state, schema)
      if (errors.length > 0) {
        console.error('State validation errors:', errors)
        return false
      }
      return true
    } catch (error) {
      console.error('State validation failed:', error)
      return false
    }
  }
  
  static sanitizeState(state) {
    // Remove invalid or dangerous properties
    const sanitized = { ...state }
    delete sanitized.__proto__
    delete sanitized.constructor
    return sanitized
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="error-pattern-card">
                    <h3>Fallback States</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`class ResilientStateManager {
  constructor() {
    this.fallbackState = this.getDefaultState()
    this.errorCount = 0
    this.maxErrors = 5
  }
  
  setState(updates) {
    try {
      // Attempt state update
      this.updateState(updates)
      this.errorCount = 0 // Reset on success
    } catch (error) {
      this.handleStateError(error, updates)
    }
  }
  
  handleStateError(error, updates) {
    this.errorCount++
    
    if (this.errorCount >= this.maxErrors) {
      console.error('Too many state errors, reverting to fallback')
      this.state = { ...this.fallbackState }
      this.errorCount = 0
    }
    
    // Notify error boundaries
    this.notifyError(error, updates)
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="error-pattern-card">
                    <h3>Circuit Breaker</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`class StateCircuitBreaker {
  constructor(threshold = 5, timeout = 30000) {
    this.threshold = threshold
    this.timeout = timeout
    this.failureCount = 0
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now()
  }
  
  async executeStateOperation(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN')
      }
      this.state = 'HALF_OPEN'
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }
  
  onFailure() {
    this.failureCount++
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
      this.nextAttempt = Date.now() + this.timeout
    }
  }
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="demo-content">
              <section>
                <h2>Interactive State Sharing Demo</h2>
                
                <div className="demo-controls">
                  <h3>Select State Pattern:</h3>
                  <div className="pattern-selector">
                    <button
                      className={`demo-button ${demoPattern === 'events' ? 'active' : ''}`}
                      onClick={() => setDemoPattern('events')}
                    >
                      Custom Events
                    </button>
                    <button
                      className={`demo-button ${demoPattern === 'store' ? 'active' : ''}`}
                      onClick={() => setDemoPattern('store')}
                    >
                      Global Store
                    </button>
                    <button
                      className={`demo-button ${demoPattern === 'observables' ? 'active' : ''}`}
                      onClick={() => setDemoPattern('observables')}
                    >
                      Observables
                    </button>
                  </div>
                </div>

                <div className="demo-container">
                  <h3>Simulated Micro-Frontend Applications</h3>
                  
                  <div className="micro-frontend-grid">
                    <div className="micro-frontend-app">
                      <h4>User Profile App</h4>
                      <div className="app-content">
                        <p><strong>User:</strong> {sharedState.user.name}</p>
                        <p><strong>Email:</strong> {sharedState.user.email}</p>
                        <button onClick={() => updateSharedState('user', { 
                          ...sharedState.user, 
                          name: 'Jane Smith' 
                        })}>
                          Update Name
                        </button>
                      </div>
                      <div className="state-indicator">
                        <span className="state-label">State Pattern:</span>
                        <span className="state-value">{demoPattern}</span>
                      </div>
                    </div>

                    <div className="micro-frontend-app">
                      <h4>Shopping Cart App</h4>
                      <div className="app-content">
                        <p><strong>Items:</strong> {sharedState.cart.length}</p>
                        <div className="cart-items">
                          {sharedState.cart.map((item, index) => (
                            <div key={index} className="cart-item">
                              {item.name} - ${item.price}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => updateSharedState('cart', [
                          ...sharedState.cart,
                          { id: Date.now(), name: 'New Item', price: 29.99 }
                        ])}>
                          Add Item
                        </button>
                      </div>
                    </div>

                    <div className="micro-frontend-app">
                      <h4>Theme Manager App</h4>
                      <div className="app-content">
                        <p><strong>Current Theme:</strong> {sharedState.theme}</p>
                        <div className="theme-controls">
                          <button 
                            className={sharedState.theme === 'light' ? 'active' : ''}
                            onClick={() => updateSharedState('theme', 'light')}
                          >
                            Light
                          </button>
                          <button 
                            className={sharedState.theme === 'dark' ? 'active' : ''}
                            onClick={() => updateSharedState('theme', 'dark')}
                          >
                            Dark
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="micro-frontend-app">
                      <h4>Analytics Dashboard</h4>
                      <div className="app-content">
                        <p><strong>User Actions:</strong></p>
                        <div className="analytics-data">
                          <div>Cart Items: {sharedState.cart.length}</div>
                          <div>Theme: {sharedState.theme}</div>
                          <div>User: {sharedState.user.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="demo-info">
                    <h4>State Flow ({demoPattern}):</h4>
                    {demoPattern === 'events' && (
                      <ol>
                        <li>User action triggers state change</li>
                        <li>Component dispatches custom event</li>
                        <li>Other components listen for events</li>
                        <li>Components update their local state</li>
                      </ol>
                    )}
                    {demoPattern === 'store' && (
                      <ol>
                        <li>User action calls store method</li>
                        <li>Store validates and updates state</li>
                        <li>Store notifies all subscribers</li>
                        <li>Components re-render with new state</li>
                      </ol>
                    )}
                    {demoPattern === 'observables' && (
                      <ol>
                        <li>User action emits new value</li>
                        <li>Observable stream processes update</li>
                        <li>Operators transform data if needed</li>
                        <li>Subscribers receive new state</li>
                      </ol>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h2>State Synchronization Patterns</h2>
                <div className="sync-patterns">
                  <div className="sync-pattern-card">
                    <h3>Optimistic Updates</h3>
                    <p>Update UI immediately, revert on failure</p>
                    <div className="pattern-flow">
                      <div className="flow-step">User Action</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Immediate UI Update</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Server Request</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Confirm/Revert</div>
                    </div>
                  </div>

                  <div className="sync-pattern-card">
                    <h3>Pessimistic Updates</h3>
                    <p>Wait for server confirmation before updating UI</p>
                    <div className="pattern-flow">
                      <div className="flow-step">User Action</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Show Loading</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Server Request</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Update UI</div>
                    </div>
                  </div>

                  <div className="sync-pattern-card">
                    <h3>Event Sourcing</h3>
                    <p>Store events, derive state from event log</p>
                    <div className="pattern-flow">
                      <div className="flow-step">User Action</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Create Event</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Store Event</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Replay State</div>
                    </div>
                  </div>

                  <div className="sync-pattern-card">
                    <h3>CQRS (Command Query)</h3>
                    <p>Separate read and write operations</p>
                    <div className="pattern-flow">
                      <div className="flow-step">Command</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Write Model</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Event Bus</div>
                      <div className="flow-arrow">→</div>
                      <div className="flow-step">Read Model</div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Considerations</h2>
                <div className="performance-tips">
                  <div className="tip-card">
                    <h4>Selective Updates</h4>
                    <p>Only update components that use changed state slices</p>
                  </div>
                  <div className="tip-card">
                    <h4>Debounced Updates</h4>
                    <p>Batch rapid state changes to reduce update frequency</p>
                  </div>
                  <div className="tip-card">
                    <h4>Memoization</h4>
                    <p>Cache computed state to avoid expensive calculations</p>
                  </div>
                  <div className="tip-card">
                    <h4>Lazy Loading</h4>
                    <p>Load state management libraries only when needed</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Debugging and DevTools</h2>
                <div className="debugging-tools">
                  <div className="tool-card">
                    <h4>State Inspector</h4>
                    <p>Browser extension to visualize state changes</p>
                  </div>
                  <div className="tool-card">
                    <h4>Event Timeline</h4>
                    <p>Track event flow and timing across micro-frontends</p>
                  </div>
                  <div className="tool-card">
                    <h4>Performance Profiler</h4>
                    <p>Monitor state update performance and bottlenecks</p>
                  </div>
                  <div className="tool-card">
                    <h4>State Diff Viewer</h4>
                    <p>Compare state before and after changes</p>
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

export default StateSharingPage