import React, { useState, useRef, useEffect } from 'react'

const IframePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedExample, setSelectedExample] = useState('basic-iframe')
  const [iframeMessages, setIframeMessages] = useState<string[]>([])
  const [demoApp, setDemoApp] = useState('analytics')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Syntax highlighting removed for build compatibility
  }, [activeTab, selectedExample])

  // Simulate iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'iframe-demo') {
        setIframeMessages(prev => [...prev, `Received: ${event.data.message}`])
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const sendMessageToIframe = () => {
    if (iframeRef.current) {
      const message = {
        type: 'parent-message',
        data: { user: 'John Doe', theme: 'dark' }
      }
      setIframeMessages(prev => [...prev, `Sent: ${JSON.stringify(message.data)}`])
    }
  }

  const basicIframe = `<!-- Basic iframe integration -->
<iframe 
  src="/micro-frontends/analytics-app"
  width="100%"
  height="400px"
  frameborder="0"
  title="Analytics Dashboard"
  sandbox="allow-scripts allow-same-origin allow-forms"
>
  <p>Your browser doesn't support iframes.</p>
</iframe>`

  const communicationExample = `// Parent application (Host)
class IframeCommunicator {
  constructor(iframeId) {
    this.iframe = document.getElementById(iframeId)
    this.setupMessageListener()
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Verify origin for security
      if (event.origin !== 'https://trusted-domain.com') return
      
      switch (event.data.type) {
        case 'IFRAME_READY':
          this.onIframeReady()
          break
        case 'DATA_REQUEST':
          this.handleDataRequest(event.data.payload)
          break
        case 'RESIZE':
          this.resizeIframe(event.data.height)
          break
      }
    })
  }

  sendMessage(type, payload) {
    this.iframe.contentWindow.postMessage({
      type,
      payload,
      timestamp: Date.now()
    }, '*')
  }

  onIframeReady() {
    // Send initial configuration
    this.sendMessage('INIT_CONFIG', {
      theme: 'dark',
      user: getCurrentUser(),
      permissions: getUserPermissions()
    })
  }

  handleDataRequest(request) {
    // Fetch data based on request
    fetchData(request.endpoint)
      .then(data => {
        this.sendMessage('DATA_RESPONSE', {
          requestId: request.id,
          data: data
        })
      })
  }

  resizeIframe(height) {
    this.iframe.style.height = height + 'px'
  }
}`

  const iframeAppCode = `// Inside the iframe application
class MicroFrontend {
  constructor() {
    this.parentOrigin = document.referrer ? new URL(document.referrer).origin : '*'
    this.setupMessageListener()
    this.notifyReady()
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Security: verify parent origin
      if (event.origin !== this.parentOrigin) return

      switch (event.data.type) {
        case 'INIT_CONFIG':
          this.initialize(event.data.payload)
          break
        case 'DATA_RESPONSE':
          this.handleDataResponse(event.data.payload)
          break
        case 'THEME_CHANGE':
          this.updateTheme(event.data.payload.theme)
          break
      }
    })
  }

  sendMessage(type, payload) {
    window.parent.postMessage({
      type,
      payload,
      source: 'analytics-app'
    }, this.parentOrigin)
  }

  notifyReady() {
    this.sendMessage('IFRAME_READY', {
      appName: 'Analytics Dashboard',
      version: '1.0.0'
    })
  }

  requestData(endpoint, params) {
    const requestId = Math.random().toString(36).substr(2, 9)
    
    this.sendMessage('DATA_REQUEST', {
      id: requestId,
      endpoint,
      params
    })
    
    // Return promise that resolves when data arrives
    return new Promise((resolve) => {
      const handleResponse = (event) => {
        if (event.data.type === 'DATA_RESPONSE' && 
            event.data.payload.requestId === requestId) {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.payload.data)
        }
      }
      window.addEventListener('message', handleResponse)
    })
  }

  requestResize() {
    const height = document.body.scrollHeight
    this.sendMessage('RESIZE', { height })
  }
}`

  const securityExample = `// Security best practices for iframe communication
class SecureIframeCommunicator {
  constructor(iframeId, trustedOrigin) {
    this.iframe = document.getElementById(iframeId)
    this.trustedOrigin = trustedOrigin
    this.messageQueue = new Map()
    this.setupSecureMessaging()
  }

  setupSecureMessaging() {
    window.addEventListener('message', (event) => {
      // 1. Verify origin
      if (event.origin !== this.trustedOrigin) {
        console.warn('Blocked message from untrusted origin:', event.origin)
        return
      }

      // 2. Validate message structure
      if (!this.isValidMessage(event.data)) {
        console.warn('Invalid message structure:', event.data)
        return
      }

      // 3. Check message timestamp (prevent replay attacks)
      if (this.isStaleMessage(event.data.timestamp)) {
        console.warn('Stale message detected:', event.data)
        return
      }

      this.handleSecureMessage(event.data)
    })
  }

  isValidMessage(data) {
    return (
      typeof data === 'object' &&
      typeof data.type === 'string' &&
      typeof data.timestamp === 'number'
    )
  }

  isStaleMessage(timestamp) {
    const MAX_AGE = 5 * 60 * 1000 // 5 minutes
    return Date.now() - timestamp > MAX_AGE
  }

  sendSecureMessage(type, payload) {
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'parent-app',
      nonce: this.generateNonce()
    }

    this.iframe.contentWindow.postMessage(message, this.trustedOrigin)
  }

  generateNonce() {
    return Math.random().toString(36).substring(2, 15)
  }
}`

  const modernAlternatives = `// Modern alternatives to iframes

// 1. Web Components with Shadow DOM
class MicroFrontendElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'closed' })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = \`
      <style>
        /* Styles are completely isolated */
        .container { padding: 20px; }
      </style>
      <div class="container">
        <h2>Isolated Micro-frontend</h2>
      </div>
    \`
  }
}

customElements.define('micro-frontend', MicroFrontendElement)

// 2. Container Queries (Modern CSS)
.micro-frontend-container {
  container-type: inline-size;
  container-name: micro-app;
}

@container micro-app (max-width: 600px) {
  .responsive-component {
    flex-direction: column;
  }
}

// 3. CSS Custom Properties for theming
.micro-frontend {
  background: var(--mf-bg-color, #ffffff);
  color: var(--mf-text-color, #000000);
  border-radius: var(--mf-border-radius, 4px);
}`

  const examples = {
    'basic-iframe': { title: 'Basic iframe Setup', code: basicIframe, language: 'html' },
    'communication': { title: 'Parent-Child Communication', code: communicationExample, language: 'javascript' },
    'iframe-app': { title: 'iframe Application Code', code: iframeAppCode, language: 'javascript' },
    'security': { title: 'Security Best Practices', code: securityExample, language: 'javascript' },
    'modern-alternatives': { title: 'Modern Alternatives', code: modernAlternatives, language: 'javascript' }
  }

  const demoApps = {
    analytics: {
      title: 'Analytics Dashboard',
      description: 'Real-time analytics and reporting',
      url: '/demo/analytics',
      features: ['Charts & Graphs', 'Real-time Data', 'Export Options']
    },
    chat: {
      title: 'Customer Support Chat',
      description: 'Live chat widget for customer support',
      url: '/demo/chat',
      features: ['Real-time Messaging', 'File Sharing', 'Agent Routing']
    },
    payment: {
      title: 'Payment Widget',
      description: 'Secure payment processing form',
      url: '/demo/payment',
      features: ['PCI Compliance', 'Multiple Gateways', 'Fraud Detection']
    }
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>iFrame-Based Micro-Frontends</h1>
        <p className="page-description">
          Using browser iframes for complete isolation between micro-frontends. While simple to implement,
          this approach provides the strongest boundaries but comes with UX and performance trade-offs.
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
                <h2>What are iframe Micro-Frontends?</h2>
                <p>
                  iframe-based micro-frontends use the browser's native iframe element to embed 
                  independent applications within a host page. This approach provides complete 
                  isolation between applications, preventing CSS conflicts, JavaScript errors, 
                  and dependency clashes.
                </p>

                <div className="architecture-diagram">
                  <div className="iframe-diagram">
                    <div className="host-container">
                      <h4>Host Application</h4>
                      <div className="iframe-containers">
                        <div className="iframe-box">
                          <div className="iframe-header">iframe 1</div>
                          <div className="iframe-content">Analytics App</div>
                        </div>
                        <div className="iframe-box">
                          <div className="iframe-header">iframe 2</div>
                          <div className="iframe-content">Chat Widget</div>
                        </div>
                        <div className="iframe-box">
                          <div className="iframe-header">iframe 3</div>
                          <div className="iframe-content">Payment Form</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Key Characteristics</h2>
                <div className="concept-grid">
                  <div className="concept-card">
                    <h3>Complete Isolation</h3>
                    <p>Each iframe runs in its own browsing context with separate DOM, CSS, and JavaScript scope.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Independent Loading</h3>
                    <p>Applications can load, crash, or update independently without affecting others.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Security Sandbox</h3>
                    <p>Built-in security features prevent malicious code from affecting the parent application.</p>
                  </div>
                  <div className="concept-card">
                    <h3>Legacy Integration</h3>
                    <p>Perfect for integrating legacy applications that can't be easily modified.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Use Cases</h2>
                <div className="use-cases-grid">
                  <div className="use-case-card">
                    <h3>Third-Party Widgets</h3>
                    <p>Embedding external services like payment processors, chat widgets, or analytics dashboards</p>
                    <ul>
                      <li>Payment gateways (Stripe, PayPal)</li>
                      <li>Customer support chat</li>
                      <li>Social media feeds</li>
                      <li>Advertisement banners</li>
                    </ul>
                  </div>
                  <div className="use-case-card">
                    <h3>Legacy System Integration</h3>
                    <p>Incorporating existing applications that can't be easily modified or migrated</p>
                    <ul>
                      <li>Legacy admin panels</li>
                      <li>Reporting systems</li>
                      <li>Legacy business tools</li>
                      <li>Third-party dashboards</li>
                    </ul>
                  </div>
                  <div className="use-case-card">
                    <h3>Security-Critical Applications</h3>
                    <p>When maximum isolation is required for security or compliance reasons</p>
                    <ul>
                      <li>Financial applications</li>
                      <li>Healthcare systems</li>
                      <li>Government portals</li>
                      <li>Compliance tools</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Pros and Cons</h2>
                <div className="pros-cons">
                  <div className="pros">
                    <h3>Advantages</h3>
                    <ul>
                      <li>Complete isolation (CSS, JS, DOM)</li>
                      <li>Simple to implement</li>
                      <li>Security sandbox</li>
                      <li>Technology independence</li>
                      <li>Legacy system support</li>
                      <li>Independent deployment</li>
                      <li>Error isolation</li>
                    </ul>
                  </div>
                  <div className="cons">
                    <h3>Disadvantages</h3>
                    <ul>
                      <li>Poor user experience (navigation, back button)</li>
                      <li>SEO limitations</li>
                      <li>Accessibility challenges</li>
                      <li>Performance overhead</li>
                      <li>Complex communication</li>
                      <li>Mobile responsiveness issues</li>
                      <li>Browser history problems</li>
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
                <h2>Implementation Best Practices</h2>
                <div className="best-practices">
                  <div className="practice-card">
                    <h3>1. Security Configuration</h3>
                    <div className="code-viewer">
                      <pre><code className="language-html">{`<iframe 
  src="https://trusted-app.com"
  sandbox="allow-scripts allow-same-origin allow-forms"
  referrerpolicy="strict-origin-when-cross-origin"
  loading="lazy"
>
</iframe>`}</code></pre>
                    </div>
                  </div>

                  <div className="practice-card">
                    <h3>2. Responsive Design</h3>
                    <div className="code-viewer">
                      <pre><code className="language-css">{`.responsive-iframe {
  width: 100%;
  height: 100vh;
  border: none;
}

@media (max-width: 768px) {
  .responsive-iframe {
    height: 80vh;
  }
}`}</code></pre>
                    </div>
                  </div>

                  <div className="practice-card">
                    <h3>3. Loading States</h3>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`const IframeWrapper = ({ src, title }) => {
  const [loading, setLoading] = useState(true)
  
  return (
    <div className="iframe-container">
      {loading && <div className="iframe-loader">Loading...</div>}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoading(false)}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  )
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>iframe Attributes Reference</h2>
                <div className="attributes-table">
                  <div className="attribute-row">
                    <div className="attribute-name">sandbox</div>
                    <div className="attribute-description">Security restrictions for iframe content</div>
                    <div className="attribute-values">allow-scripts, allow-same-origin, allow-forms</div>
                  </div>
                  <div className="attribute-row">
                    <div className="attribute-name">referrerpolicy</div>
                    <div className="attribute-description">Controls referrer information sent</div>
                    <div className="attribute-values">strict-origin-when-cross-origin</div>
                  </div>
                  <div className="attribute-row">
                    <div className="attribute-name">loading</div>
                    <div className="attribute-description">When to load the iframe</div>
                    <div className="attribute-values">lazy, eager</div>
                  </div>
                  <div className="attribute-row">
                    <div className="attribute-name">allow</div>
                    <div className="attribute-description">Permissions policy for iframe</div>
                    <div className="attribute-values">camera, microphone, geolocation</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="communication-content">
              <section>
                <h2>iframe Communication Patterns</h2>
                <p>
                  Communication between the parent application and iframe content requires the 
                  postMessage API for security reasons. Here are common patterns and best practices:
                </p>

                <div className="communication-flow">
                  <div className="flow-step">
                    <h3>1. Initialize Communication</h3>
                    <p>iframe signals ready state to parent</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Inside iframe
window.parent.postMessage({
  type: 'IFRAME_READY',
  source: 'my-micro-app'
}, '*')`}</code></pre>
                    </div>
                  </div>

                  <div className="flow-step">
                    <h3>2. Establish Message Contract</h3>
                    <p>Define message types and payload structure</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Message contract
const MESSAGE_TYPES = {
  INIT: 'INIT',
  DATA_REQUEST: 'DATA_REQUEST', 
  DATA_RESPONSE: 'DATA_RESPONSE',
  RESIZE: 'RESIZE',
  ERROR: 'ERROR'
}`}</code></pre>
                    </div>
                  </div>

                  <div className="flow-step">
                    <h3>3. Handle Bidirectional Communication</h3>
                    <p>Both parent and iframe can send/receive messages</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Parent sends data to iframe
iframe.contentWindow.postMessage({
  type: 'USER_DATA',
  payload: { userId: 123, preferences: {...} }
}, 'https://iframe-origin.com')`}</code></pre>
                    </div>
                  </div>

                  <div className="flow-step">
                    <h3>4. Implement Error Handling</h3>
                    <p>Handle communication failures gracefully</p>
                    <div className="code-viewer">
                      <pre><code className="language-javascript">{`// Timeout for responses
const sendMessageWithTimeout = (message, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const messageId = Math.random().toString(36)
    const timeoutId = setTimeout(() => {
      reject(new Error('Message timeout'))
    }, timeout)
    
    // Send message and wait for response
  })
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Advanced Communication Patterns</h2>
                
                <div className="pattern-card">
                  <h3>Request-Response Pattern</h3>
                  <p>Implement async request-response communication:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`class IframeRPC {
  constructor(iframe, origin) {
    this.iframe = iframe
    this.origin = origin
    this.pendingRequests = new Map()
    this.setupListener()
  }
  
  async request(method, params) {
    const id = Math.random().toString(36)
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      
      this.iframe.contentWindow.postMessage({
        type: 'RPC_REQUEST',
        id,
        method,
        params
      }, this.origin)
    })
  }
}`}</code></pre>
                  </div>
                </div>

                <div className="pattern-card">
                  <h3>Event Streaming</h3>
                  <p>Stream events from iframe to parent:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`// Inside iframe - stream user interactions
const streamEvent = (eventType, data) => {
  window.parent.postMessage({
    type: 'EVENT_STREAM',
    eventType,
    data,
    timestamp: Date.now()
  }, '*')
}

// Track user interactions
document.addEventListener('click', (e) => {
  streamEvent('CLICK', {
    element: e.target.tagName,
    x: e.clientX,
    y: e.clientY
  })
})`}</code></pre>
                  </div>
                </div>

                <div className="pattern-card">
                  <h3>State Synchronization</h3>
                  <p>Keep iframe state in sync with parent:</p>
                  <div className="code-viewer">
                    <pre><code className="language-javascript">{`// State sync manager
class StateSync {
  constructor(iframe, initialState) {
    this.iframe = iframe
    this.state = initialState
    this.syncToIframe()
  }
  
  updateState(updates) {
    this.state = { ...this.state, ...updates }
    this.syncToIframe()
  }
  
  syncToIframe() {
    this.iframe.contentWindow.postMessage({
      type: 'STATE_UPDATE',
      state: this.state
    }, '*')
  }
}`}</code></pre>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="demo-content">
              <section>
                <h2>Interactive iframe Demo</h2>
                
                <div className="demo-controls">
                  <h3>Select Demo Application:</h3>
                  <div className="demo-selector">
                    {Object.entries(demoApps).map(([key, app]) => (
                      <button
                        key={key}
                        className={`demo-app-button ${demoApp === key ? 'active' : ''}`}
                        onClick={() => setDemoApp(key)}
                      >
                        {app.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="demo-container">
                  <div className="demo-app-info">
                    <h3>{demoApps[demoApp].title}</h3>
                    <p>{demoApps[demoApp].description}</p>
                    <div className="app-features">
                      {demoApps[demoApp].features.map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>

                  <div className="iframe-demo-container">
                    <div className="iframe-header">
                      <span className="iframe-url">{demoApps[demoApp].url}</span>
                      <div className="iframe-controls">
                        <button onClick={sendMessageToIframe}>Send Message</button>
                        <button onClick={() => setIframeMessages([])}>Clear Log</button>
                      </div>
                    </div>
                    
                    <div className="simulated-iframe">
                      <div className="iframe-content">
                        <h4>Simulated {demoApps[demoApp].title}</h4>
                        <p>This would be the actual iframe content</p>
                        <div className="iframe-demo-features">
                          {demoApps[demoApp].features.map((feature, index) => (
                            <div key={index} className="demo-feature">
                              <input type="checkbox" defaultChecked />
                              <label>{feature}</label>
                            </div>
                          ))}
                        </div>
                        <button className="iframe-demo-button">
                          Demo Action
                        </button>
                      </div>
                    </div>
                    
                    <div className="communication-log">
                      <h4>Message Log</h4>
                      <div className="message-log">
                        {iframeMessages.length === 0 ? (
                          <p>No messages yet...</p>
                        ) : (
                          iframeMessages.map((message, index) => (
                            <div key={index} className="log-message">{message}</div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Real-World Examples</h2>
                <div className="examples-grid">
                  <div className="example-card">
                    <h3>Stripe Payment Forms</h3>
                    <p>Payment processing forms use iframes for PCI compliance</p>
                    <ul>
                      <li>Secure card input isolation</li>
                      <li>PCI DSS compliance</li>
                      <li>Fraud protection</li>
                    </ul>
                  </div>
                  
                  <div className="example-card">
                    <h3>Google Maps Embed</h3>
                    <p>Interactive maps embedded in websites</p>
                    <ul>
                      <li>Complete map functionality</li>
                      <li>Isolated from parent styles</li>
                      <li>API key protection</li>
                    </ul>
                  </div>
                  
                  <div className="example-card">
                    <h3>YouTube Video Player</h3>
                    <p>Video players with full controls and features</p>
                    <ul>
                      <li>Media controls</li>
                      <li>Fullscreen support</li>
                      <li>Privacy protection</li>
                    </ul>
                  </div>
                  
                  <div className="example-card">
                    <h3>Customer Support Chat</h3>
                    <p>Live chat widgets from third-party services</p>
                    <ul>
                      <li>Real-time messaging</li>
                      <li>Agent routing</li>
                      <li>File uploads</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Considerations</h2>
                <div className="performance-tips">
                  <div className="tip-card">
                    <h4>Lazy Loading</h4>
                    <p>Use loading="lazy" to defer iframe loading until needed</p>
                  </div>
                  <div className="tip-card">
                    <h4>Resource Hints</h4>
                    <p>Preconnect to iframe origins to reduce connection time</p>
                  </div>
                  <div className="tip-card">
                    <h4>Size Optimization</h4>
                    <p>Set explicit width/height to prevent layout shifts</p>
                  </div>
                  <div className="tip-card">
                    <h4>Memory Management</h4>
                    <p>Remove unused iframes to free up memory</p>
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

export default IframePage