import React, { useState, useEffect } from 'react'

const DeploymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedExample, setSelectedExample] = useState('docker-compose')
  const [deploymentStrategy, setDeploymentStrategy] = useState('independent')
  const [selectedPipeline, setSelectedPipeline] = useState('github-actions')

  useEffect(() => {
    // Syntax highlighting removed for build compatibility
  }, [activeTab, selectedExample, selectedPipeline])

  const dockerComposeExample = `# docker-compose.yml - Multi-service deployment
version: '3.8'

services:
  # Gateway/Shell application
  shell:
    build: ./apps/shell
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
      - HEADER_URL=http://header:3001
      - PRODUCTS_URL=http://products:3002
      - CART_URL=http://cart:3003
    depends_on:
      - header
      - products
      - cart
    networks:
      - micro-frontends

  # Header micro-frontend
  header:
    build: ./apps/header
    ports:
      - "3001:80"
    environment:
      - NODE_ENV=production
      - API_URL=http://api:4000
    networks:
      - micro-frontends

  # Products micro-frontend
  products:
    build: ./apps/products
    ports:
      - "3002:80"
    environment:
      - NODE_ENV=production
      - API_URL=http://api:4000
      - SEARCH_URL=http://search:5000
    networks:
      - micro-frontends

  # Cart micro-frontend
  cart:
    build: ./apps/cart
    ports:
      - "3003:80"
    environment:
      - NODE_ENV=production
      - API_URL=http://api:4000
      - PAYMENT_URL=http://payment:6000
    networks:
      - micro-frontends

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - shell
      - header
      - products
      - cart
    networks:
      - micro-frontends

networks:
  micro-frontends:
    driver: bridge

volumes:
  node_modules:
  dist:`

  const kubernetesExample = `# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shell-app
  labels:
    app: shell
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shell
  template:
    metadata:
      labels:
        app: shell
    spec:
      containers:
      - name: shell
        image: company/shell:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: HEADER_URL
          value: "http://header-service:3001"
        - name: PRODUCTS_URL
          value: "http://products-service:3002"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: shell-service
spec:
  selector:
    app: shell
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 80
  type: ClusterIP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: header-app
  labels:
    app: header
spec:
  replicas: 2
  selector:
    matchLabels:
      app: header
  template:
    metadata:
      labels:
        app: header
    spec:
      containers:
      - name: header
        image: company/header:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: header-service
spec:
  selector:
    app: header
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: micro-frontends-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: app.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: shell-service
            port:
              number: 3000
      - path: /header
        pathType: Prefix
        backend:
          service:
            name: header-service
            port:
              number: 3001`

  const cdnDeploymentExample = `# CDN Deployment Strategy
# Build script for CDN deployment
{
  "name": "micro-frontend-build",
  "version": "1.0.0",
  "scripts": {
    "build:shell": "cd apps/shell && npm run build",
    "build:header": "cd apps/header && npm run build",
    "build:products": "cd apps/products && npm run build",
    "build:all": "npm run build:shell && npm run build:header && npm run build:products",
    "deploy:dev": "npm run build:all && aws s3 sync dist/ s3://mf-dev-bucket --delete",
    "deploy:prod": "npm run build:all && aws s3 sync dist/ s3://mf-prod-bucket --delete",
    "invalidate:dev": "aws cloudfront create-invalidation --distribution-id E123DEV --paths '/*'",
    "invalidate:prod": "aws cloudfront create-invalidation --distribution-id E123PROD --paths '/*'"
  }
}

# Webpack config for CDN deployment
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  mode: 'production',
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        header: 'header@https://cdn.company.com/header/latest/remoteEntry.js',
        products: 'products@https://cdn.company.com/products/latest/remoteEntry.js',
        cart: 'cart@https://cdn.company.com/cart/latest/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ],
  output: {
    publicPath: 'https://cdn.company.com/shell/latest/'
  }
}

# S3 bucket policy for CDN
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mf-prod-bucket/*"
    }
  ]
}

# CloudFront distribution config
{
  "Origins": [
    {
      "Id": "S3-mf-prod-bucket",
      "DomainName": "mf-prod-bucket.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-mf-prod-bucket",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "managed-caching-optimized"
  },
  "CacheBehaviors": [
    {
      "PathPattern": "/shell/*",
      "TargetOriginId": "S3-mf-prod-bucket",
      "CachePolicyId": "managed-caching-disabled",
      "TTL": 300
    }
  ]
}`

  const githubActionsExample = `# .github/workflows/deploy-micro-frontends.yml
name: Deploy Micro-Frontends

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      shell: \${{ steps.changes.outputs.shell }}
      header: \${{ steps.changes.outputs.header }}
      products: \${{ steps.changes.outputs.products }}
      cart: \${{ steps.changes.outputs.cart }}
    steps:
    - uses: actions/checkout@v3
    - uses: dorny/paths-filter@v2
      id: changes
      with:
        filters: |
          shell:
            - 'apps/shell/**'
          header:
            - 'apps/header/**'
          products:
            - 'apps/products/**'
          cart:
            - 'apps/cart/**'

  build-and-test:
    runs-on: ubuntu-latest
    needs: detect-changes
    strategy:
      matrix:
        app: [shell, header, products, cart]
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: apps/\${{ matrix.app }}/package-lock.json
    
    - name: Install dependencies
      run: |
        cd apps/\${{ matrix.app }}
        npm ci
    
    - name: Run tests
      run: |
        cd apps/\${{ matrix.app }}
        npm run test
    
    - name: Run linting
      run: |
        cd apps/\${{ matrix.app }}
        npm run lint
    
    - name: Build application
      run: |
        cd apps/\${{ matrix.app }}
        npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: \${{ matrix.app }}-dist
        path: apps/\${{ matrix.app }}/dist

  build-docker-images:
    runs-on: ubuntu-latest
    needs: [detect-changes, build-and-test]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    strategy:
      matrix:
        app: [shell, header, products, cart]
    steps:
    - uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: \${{ matrix.app }}-dist
        path: apps/\${{ matrix.app }}/dist
    
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v3
      with:
        context: apps/\${{ matrix.app }}
        push: true
        tags: |
          \${{ env.REGISTRY }}/\${{ github.repository }}/\${{ matrix.app }}:latest
          \${{ env.REGISTRY }}/\${{ github.repository }}/\${{ matrix.app }}:\${{ github.sha }}

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-docker-images]
    environment: staging
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # kubectl apply -f k8s/staging/
        # Or use your deployment tool of choice
    
    - name: Run integration tests
      run: |
        echo "Running integration tests"
        # npm run test:integration

  deploy-production:
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    environment: production
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # kubectl apply -f k8s/production/
    
    - name: Health checks
      run: |
        echo "Running health checks"
        # curl -f http://prod-url/health || exit 1`

  const netlifyExample = `# netlify.toml - Netlify deployment configuration
[build]
  base = "/"
  publish = "dist"
  command = "npm run build:all"

[build.environment]
  NODE_VERSION = "18"

# Redirect rules for micro-frontend routing
[[redirects]]
  from = "/shell/*"
  to = "/shell/index.html"
  status = 200

[[redirects]]
  from = "/header/*"
  to = "/header/index.html"
  status = 200

[[redirects]]
  from = "/products/*"
  to = "/products/index.html"
  status = 200

# Headers for CORS and caching
[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/remoteEntry.js"
  [headers.values]
    Cache-Control = "public, max-age=300"
    Access-Control-Allow-Origin = "*"

# Build command for each micro-frontend
[context.production]
  command = """
    cd apps/shell && npm ci && npm run build &&
    cd ../header && npm ci && npm run build &&
    cd ../products && npm ci && npm run build &&
    cp -r apps/*/dist/* dist/
  """

# Branch deployments
[context.branch-deploy]
  command = "npm run build:preview"

# Environment variables
[context.production.environment]
  NODE_ENV = "production"
  HEADER_URL = "https://header.company.com"
  PRODUCTS_URL = "https://products.company.com"

[context.deploy-preview.environment]
  NODE_ENV = "staging"
  HEADER_URL = "https://header-preview.company.com"
  PRODUCTS_URL = "https://products-preview.company.com"`

  const vercelExample = `# vercel.json - Vercel deployment configuration
{
  "version": 2,
  "builds": [
    {
      "src": "apps/shell/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "apps/header/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "apps/products/package.json", 
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/shell/(.*)",
      "dest": "/apps/shell/dist/$1"
    },
    {
      "src": "/header/(.*)",
      "dest": "/apps/header/dist/$1"
    },
    {
      "src": "/products/(.*)",
      "dest": "/apps/products/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/apps/shell/dist/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    },
    {
      "source": "/remoteEntry.js",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, max-age=300"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "HEADER_URL": "https://header.vercel.app",
    "PRODUCTS_URL": "https://products.vercel.app"
  }
}

# package.json build scripts
{
  "scripts": {
    "build": "npm run build:shell && npm run build:header && npm run build:products",
    "build:shell": "cd apps/shell && npm ci && npm run build",
    "build:header": "cd apps/header && npm ci && npm run build", 
    "build:products": "cd apps/products && npm ci && npm run build",
    "vercel-build": "npm run build"
  }
}`

  const monitoringExample = `# monitoring-setup.yml - Application monitoring
version: '3.8'

services:
  # Prometheus for metrics
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  # Grafana for visualization
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  # ELK Stack for logging
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  # Jaeger for distributed tracing
  jaeger:
    image: jaegertracing/all-in-one:1.35
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    ports:
      - "16686:16686"
      - "14250:14250"

volumes:
  grafana-storage:

# prometheus.yml configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'shell-app'
    static_configs:
      - targets: ['shell:3000']
    metrics_path: '/metrics'
    
  - job_name: 'header-app'
    static_configs:
      - targets: ['header:3001']
    metrics_path: '/metrics'
    
  - job_name: 'products-app'
    static_configs:
      - targets: ['products:3002']
    metrics_path: '/metrics'

# Application metrics middleware (Express.js example)
const promClient = require('prom-client')
const express = require('express')

// Create metrics
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code', 'micro_frontend'],
  buckets: [0.1, 5, 15, 50, 100, 500]
})

const httpRequests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'micro_frontend']
})

// Middleware
const metricsMiddleware = (microFrontendName) => {
  return (req, res, next) => {
    const start = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - start
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
        micro_frontend: microFrontendName
      }
      
      httpDuration.observe(labels, duration)
      httpRequests.inc(labels)
    })
    
    next()
  }
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)
  res.end(await promClient.register.metrics())
})

// Error tracking (Sentry example)
const Sentry = require('@sentry/node')

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tags: {
    micro_frontend: 'header-app'
  }
})

// Error middleware
app.use(Sentry.Handlers.errorHandler())`

  const examples = {
    'docker-compose': { title: 'Docker Compose', code: dockerComposeExample, language: 'yaml' },
    'kubernetes': { title: 'Kubernetes Deployment', code: kubernetesExample, language: 'yaml' },
    'cdn-deployment': { title: 'CDN Deployment', code: cdnDeploymentExample, language: 'javascript' },
    'netlify': { title: 'Netlify Configuration', code: netlifyExample, language: 'yaml' },
    'vercel': { title: 'Vercel Configuration', code: vercelExample, language: 'json' },
    'monitoring': { title: 'Monitoring Setup', code: monitoringExample, language: 'yaml' }
  }

  const pipelineExamples = {
    'github-actions': { title: 'GitHub Actions', code: githubActionsExample, language: 'yaml' },
    'gitlab-ci': { title: 'GitLab CI/CD', code: '# GitLab CI/CD pipeline example would go here', language: 'yaml' },
    'jenkins': { title: 'Jenkins Pipeline', code: '// Jenkins pipeline example would go here', language: 'javascript' }
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Deployment Strategies</h1>
        <p className="page-description">
          Explore different deployment approaches for micro-frontend applications, from simple static hosting
          to complex orchestrated environments with monitoring and CI/CD pipelines.
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
            className={`tab-button ${activeTab === 'strategies' ? 'active' : ''}`}
            onClick={() => setActiveTab('strategies')}
          >
            Strategies
          </button>
          <button
            className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
            onClick={() => setActiveTab('examples')}
          >
            Examples
          </button>
          <button
            className={`tab-button ${activeTab === 'cicd' ? 'active' : ''}`}
            onClick={() => setActiveTab('cicd')}
          >
            CI/CD
          </button>
          <button
            className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            Monitoring
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <section>
                <h2>Deployment Challenges in Micro-Frontends</h2>
                <p>
                  Deploying micro-frontend applications introduces unique challenges compared to monolithic 
                  applications. Each micro-frontend can be developed, built, and deployed independently, 
                  but they must work together as a cohesive user experience.
                </p>

                <div className="challenges-grid">
                  <div className="challenge-card">
                    <h3>Independent Deployments</h3>
                    <p>Each micro-frontend should be deployable without affecting others</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Version Compatibility</h3>
                    <p>Ensuring different versions of micro-frontends work together</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Shared Dependencies</h3>
                    <p>Managing shared libraries and runtime dependencies</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Routing & Discovery</h3>
                    <p>Service discovery and routing between micro-frontends</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Rollback Strategies</h3>
                    <p>Ability to rollback individual micro-frontends safely</p>
                  </div>
                  <div className="challenge-card">
                    <h3>Testing & Integration</h3>
                    <p>End-to-end testing across multiple deployed services</p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Deployment Models</h2>
                <div className="deployment-models">
                  <div className="model-card">
                    <h3>Independent Deployment</h3>
                    <p>Each micro-frontend is deployed to its own infrastructure</p>
                    <div className="model-pros-cons">
                      <div className="pros">
                        <h4>Pros:</h4>
                        <ul>
                          <li>True independence</li>
                          <li>Team autonomy</li>
                          <li>Technology flexibility</li>
                          <li>Isolated failures</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h4>Cons:</h4>
                        <ul>
                          <li>Complex orchestration</li>
                          <li>Higher infrastructure costs</li>
                          <li>Network latency</li>
                          <li>Monitoring complexity</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="model-card">
                    <h3>Monorepo Deployment</h3>
                    <p>All micro-frontends deployed together from a single repository</p>
                    <div className="model-pros-cons">
                      <div className="pros">
                        <h4>Pros:</h4>
                        <ul>
                          <li>Simplified coordination</li>
                          <li>Shared tooling</li>
                          <li>Atomic deployments</li>
                          <li>Easier testing</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h4>Cons:</h4>
                        <ul>
                          <li>Reduced independence</li>
                          <li>Deployment bottlenecks</li>
                          <li>Coordinated releases</li>
                          <li>Larger blast radius</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="model-card">
                    <h3>Hybrid Deployment</h3>
                    <p>Mix of independent and coordinated deployments based on coupling</p>
                    <div className="model-pros-cons">
                      <div className="pros">
                        <h4>Pros:</h4>
                        <ul>
                          <li>Flexible approach</li>
                          <li>Optimized for teams</li>
                          <li>Reduced risk</li>
                          <li>Gradual migration</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h4>Cons:</h4>
                        <ul>
                          <li>Complex strategy</li>
                          <li>Mixed tooling</li>
                          <li>Inconsistent practices</li>
                          <li>Learning curve</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Deployment Environments</h2>
                <div className="environment-flow">
                  <div className="env-stage">
                    <h3>Development</h3>
                    <p>Local development with hot reloading</p>
                    <ul>
                      <li>Local servers</li>
                      <li>Mock services</li>
                      <li>Fast feedback</li>
                    </ul>
                  </div>
                  <div className="env-arrow">→</div>
                  <div className="env-stage">
                    <h3>Integration</h3>
                    <p>Combined testing of all micro-frontends</p>
                    <ul>
                      <li>Full integration</li>
                      <li>Automated testing</li>
                      <li>Performance testing</li>
                    </ul>
                  </div>
                  <div className="env-arrow">→</div>
                  <div className="env-stage">
                    <h3>Staging</h3>
                    <p>Production-like environment for final testing</p>
                    <ul>
                      <li>Production data</li>
                      <li>Load testing</li>
                      <li>Security testing</li>
                    </ul>
                  </div>
                  <div className="env-arrow">→</div>
                  <div className="env-stage">
                    <h3>Production</h3>
                    <p>Live environment serving real users</p>
                    <ul>
                      <li>High availability</li>
                      <li>Monitoring</li>
                      <li>Rollback ready</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Infrastructure Patterns</h2>
                <div className="infrastructure-patterns">
                  <div className="pattern-card">
                    <h3>Container Orchestration</h3>
                    <p>Using Kubernetes or Docker Swarm for container management</p>
                    <div className="pattern-features">
                      <ul>
                        <li>Auto-scaling</li>
                        <li>Service discovery</li>
                        <li>Health checks</li>
                        <li>Rolling deployments</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>Serverless Functions</h3>
                    <p>Deploy micro-frontends as serverless functions</p>
                    <div className="pattern-features">
                      <ul>
                        <li>Auto-scaling</li>
                        <li>Pay-per-use</li>
                        <li>Zero maintenance</li>
                        <li>Global distribution</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>Edge Deployment</h3>
                    <p>Deploy to edge locations for better performance</p>
                    <div className="pattern-features">
                      <ul>
                        <li>Low latency</li>
                        <li>Global reach</li>
                        <li>CDN integration</li>
                        <li>Edge computing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pattern-card">
                    <h3>Static Site Hosting</h3>
                    <p>Deploy static builds to CDN or static hosting</p>
                    <div className="pattern-features">
                      <ul>
                        <li>High performance</li>
                        <li>Global CDN</li>
                        <li>Simple setup</li>
                        <li>Cost effective</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="strategies-content">
              <section>
                <h2>Deployment Strategy Selector</h2>
                <div className="strategy-selector">
                  <button
                    className={`strategy-button ${deploymentStrategy === 'independent' ? 'active' : ''}`}
                    onClick={() => setDeploymentStrategy('independent')}
                  >
                    Independent
                  </button>
                  <button
                    className={`strategy-button ${deploymentStrategy === 'monorepo' ? 'active' : ''}`}
                    onClick={() => setDeploymentStrategy('monorepo')}
                  >
                    Monorepo
                  </button>
                  <button
                    className={`strategy-button ${deploymentStrategy === 'hybrid' ? 'active' : ''}`}
                    onClick={() => setDeploymentStrategy('hybrid')}
                  >
                    Hybrid
                  </button>
                  <button
                    className={`strategy-button ${deploymentStrategy === 'serverless' ? 'active' : ''}`}
                    onClick={() => setDeploymentStrategy('serverless')}
                  >
                    Serverless
                  </button>
                </div>

                {deploymentStrategy === 'independent' && (
                  <div className="strategy-details">
                    <h3>Independent Deployment Strategy</h3>
                    <p>Each micro-frontend is deployed independently with its own CI/CD pipeline.</p>
                    
                    <div className="strategy-architecture">
                      <div className="deployment-flow">
                        <div className="deploy-step">
                          <h4>Team A</h4>
                          <div className="repo">Repo A</div>
                          <div className="pipeline">Pipeline A</div>
                          <div className="deployment">Deploy A</div>
                        </div>
                        <div className="deploy-step">
                          <h4>Team B</h4>
                          <div className="repo">Repo B</div>
                          <div className="pipeline">Pipeline B</div>
                          <div className="deployment">Deploy B</div>
                        </div>
                        <div className="deploy-step">
                          <h4>Team C</h4>
                          <div className="repo">Repo C</div>
                          <div className="pipeline">Pipeline C</div>
                          <div className="deployment">Deploy C</div>
                        </div>
                      </div>
                    </div>

                    <div className="strategy-considerations">
                      <div className="consideration-card">
                        <h4>Team Structure</h4>
                        <p>Best for: Autonomous teams with clear domain boundaries</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Technology Stack</h4>
                        <p>Teams can choose different frameworks and tools</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Release Cycle</h4>
                        <p>Each team can release at their own pace</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Infrastructure</h4>
                        <p>Requires robust service discovery and monitoring</p>
                      </div>
                    </div>
                  </div>
                )}

                {deploymentStrategy === 'monorepo' && (
                  <div className="strategy-details">
                    <h3>Monorepo Deployment Strategy</h3>
                    <p>All micro-frontends are developed in a single repository and deployed together.</p>
                    
                    <div className="strategy-architecture">
                      <div className="monorepo-flow">
                        <div className="single-repo">
                          <h4>Single Repository</h4>
                          <div className="mono-contents">
                            <div className="app-folder">apps/shell/</div>
                            <div className="app-folder">apps/header/</div>
                            <div className="app-folder">apps/products/</div>
                            <div className="shared-folder">shared/</div>
                          </div>
                        </div>
                        <div className="mono-arrow">→</div>
                        <div className="unified-pipeline">
                          <h4>Unified Pipeline</h4>
                          <div className="pipeline-steps">
                            <div className="step">Build All</div>
                            <div className="step">Test All</div>
                            <div className="step">Deploy All</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="strategy-considerations">
                      <div className="consideration-card">
                        <h4>Code Sharing</h4>
                        <p>Easy sharing of utilities, components, and types</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Atomic Changes</h4>
                        <p>Cross-app changes can be made atomically</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Tooling</h4>
                        <p>Shared build tools, linting, and testing setup</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Coordination</h4>
                        <p>Requires more coordination between teams</p>
                      </div>
                    </div>
                  </div>
                )}

                {deploymentStrategy === 'hybrid' && (
                  <div className="strategy-details">
                    <h3>Hybrid Deployment Strategy</h3>
                    <p>Combines independent and coordinated deployments based on coupling and team structure.</p>
                    
                    <div className="strategy-architecture">
                      <div className="hybrid-flow">
                        <div className="core-group">
                          <h4>Core Platform</h4>
                          <div className="coordinated">Coordinated Deploy</div>
                          <div className="core-apps">
                            <div className="app">Shell</div>
                            <div className="app">Auth</div>
                            <div className="app">Navigation</div>
                          </div>
                        </div>
                        <div className="feature-group">
                          <h4>Feature Apps</h4>
                          <div className="independent">Independent Deploy</div>
                          <div className="feature-apps">
                            <div className="app">Products</div>
                            <div className="app">Orders</div>
                            <div className="app">Support</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="strategy-considerations">
                      <div className="consideration-card">
                        <h4>Core Stability</h4>
                        <p>Core platform provides stable foundation</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Feature Velocity</h4>
                        <p>Feature teams can move at their own pace</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Risk Management</h4>
                        <p>Balanced approach to deployment risk</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Complexity</h4>
                        <p>More complex to set up and maintain</p>
                      </div>
                    </div>
                  </div>
                )}

                {deploymentStrategy === 'serverless' && (
                  <div className="strategy-details">
                    <h3>Serverless Deployment Strategy</h3>
                    <p>Deploy micro-frontends as serverless functions with edge-side rendering.</p>
                    
                    <div className="strategy-architecture">
                      <div className="serverless-flow">
                        <div className="cdn-layer">
                          <h4>CDN/Edge Layer</h4>
                          <div className="edge-locations">Global Edge Locations</div>
                        </div>
                        <div className="function-layer">
                          <h4>Serverless Functions</h4>
                          <div className="functions">
                            <div className="function">Shell Function</div>
                            <div className="function">Header Function</div>
                            <div className="function">Products Function</div>
                          </div>
                        </div>
                        <div className="storage-layer">
                          <h4>Static Assets</h4>
                          <div className="storage">Object Storage</div>
                        </div>
                      </div>
                    </div>

                    <div className="strategy-considerations">
                      <div className="consideration-card">
                        <h4>Auto-scaling</h4>
                        <p>Automatic scaling based on demand</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Cost Efficiency</h4>
                        <p>Pay only for actual usage</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Global Distribution</h4>
                        <p>Deploy to edge locations worldwide</p>
                      </div>
                      <div className="consideration-card">
                        <h4>Cold Starts</h4>
                        <p>May have latency issues with cold starts</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h2>Deployment Best Practices</h2>
                <div className="best-practices-grid">
                  <div className="practice-card">
                    <h3>Blue-Green Deployments</h3>
                    <p>Maintain two identical production environments</p>
                    <ul>
                      <li>Zero-downtime deployments</li>
                      <li>Quick rollback capability</li>
                      <li>Full testing before switch</li>
                      <li>Reduced deployment risk</li>
                    </ul>
                  </div>

                  <div className="practice-card">
                    <h3>Canary Releases</h3>
                    <p>Gradually roll out changes to subset of users</p>
                    <ul>
                      <li>Risk mitigation</li>
                      <li>Real user feedback</li>
                      <li>Performance monitoring</li>
                      <li>Controlled rollout</li>
                    </ul>
                  </div>

                  <div className="practice-card">
                    <h3>Feature Flags</h3>
                    <p>Control feature availability without deployments</p>
                    <ul>
                      <li>Runtime feature toggles</li>
                      <li>A/B testing</li>
                      <li>Emergency kill switch</li>
                      <li>Gradual feature rollout</li>
                    </ul>
                  </div>

                  <div className="practice-card">
                    <h3>Health Checks</h3>
                    <p>Monitor application health and dependencies</p>
                    <ul>
                      <li>Automated monitoring</li>
                      <li>Dependency checking</li>
                      <li>Performance metrics</li>
                      <li>Alert systems</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="examples-content">
              <section>
                <h2>Deployment Examples</h2>
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
                <h2>Platform-Specific Configurations</h2>
                <div className="platform-configs">
                  <div className="platform-card">
                    <h3>AWS Deployment</h3>
                    <ul>
                      <li>S3 + CloudFront for static assets</li>
                      <li>ECS/EKS for containerized apps</li>
                      <li>Lambda for serverless functions</li>
                      <li>Application Load Balancer for routing</li>
                      <li>CodePipeline for CI/CD</li>
                    </ul>
                  </div>

                  <div className="platform-card">
                    <h3>Azure Deployment</h3>
                    <ul>
                      <li>Azure Storage + CDN for static assets</li>
                      <li>Container Instances for apps</li>
                      <li>Azure Functions for serverless</li>
                      <li>Application Gateway for routing</li>
                      <li>Azure DevOps for CI/CD</li>
                    </ul>
                  </div>

                  <div className="platform-card">
                    <h3>Google Cloud Deployment</h3>
                    <ul>
                      <li>Cloud Storage + Cloud CDN</li>
                      <li>GKE for Kubernetes orchestration</li>
                      <li>Cloud Functions for serverless</li>
                      <li>Load Balancer for routing</li>
                      <li>Cloud Build for CI/CD</li>
                    </ul>
                  </div>

                  <div className="platform-card">
                    <h3>Edge Deployment</h3>
                    <ul>
                      <li>Vercel Edge Functions</li>
                      <li>Netlify Edge Functions</li>
                      <li>Cloudflare Workers</li>
                      <li>AWS Lambda@Edge</li>
                      <li>Fastly Compute@Edge</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Performance Optimization</h2>
                <div className="performance-optimizations">
                  <div className="optimization-card">
                    <h3>Bundle Optimization</h3>
                    <ul>
                      <li>Tree shaking for unused code</li>
                      <li>Code splitting by route</li>
                      <li>Shared dependency deduplication</li>
                      <li>Dynamic imports for lazy loading</li>
                    </ul>
                  </div>

                  <div className="optimization-card">
                    <h3>Caching Strategies</h3>
                    <ul>
                      <li>Long-term caching for assets</li>
                      <li>Short-term caching for entry files</li>
                      <li>Service worker for offline support</li>
                      <li>CDN edge caching</li>
                    </ul>
                  </div>

                  <div className="optimization-card">
                    <h3>Loading Optimization</h3>
                    <ul>
                      <li>Resource hints (preload, prefetch)</li>
                      <li>Critical CSS inlining</li>
                      <li>Progressive loading</li>
                      <li>Module preloading</li>
                    </ul>
                  </div>

                  <div className="optimization-card">
                    <h3>Network Optimization</h3>
                    <ul>
                      <li>HTTP/2 server push</li>
                      <li>Compression (Gzip, Brotli)</li>
                      <li>Connection pooling</li>
                      <li>Request deduplication</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'cicd' && (
            <div className="cicd-content">
              <section>
                <h2>CI/CD Pipeline Examples</h2>
                <div className="pipeline-selector">
                  {Object.entries(pipelineExamples).map(([key, example]) => (
                    <button
                      key={key}
                      className={`pipeline-button ${selectedPipeline === key ? 'active' : ''}`}
                      onClick={() => setSelectedPipeline(key)}
                    >
                      {example.title}
                    </button>
                  ))}
                </div>

                <div className="code-example">
                  <h3>{pipelineExamples[selectedPipeline].title}</h3>
                  <div className="code-viewer">
                    <pre>
                      <code className={`language-${pipelineExamples[selectedPipeline].language}`}>
                        {pipelineExamples[selectedPipeline].code}
                      </code>
                    </pre>
                  </div>
                </div>
              </section>

              <section>
                <h2>Pipeline Stages</h2>
                <div className="pipeline-stages">
                  <div className="stage-card">
                    <h3>1. Source</h3>
                    <p>Code checkout and change detection</p>
                    <ul>
                      <li>Git webhook triggers</li>
                      <li>Change detection per app</li>
                      <li>Parallel pipeline execution</li>
                      <li>Dependency analysis</li>
                    </ul>
                  </div>

                  <div className="stage-card">
                    <h3>2. Build</h3>
                    <p>Compilation and optimization</p>
                    <ul>
                      <li>Parallel builds</li>
                      <li>Shared dependency caching</li>
                      <li>Asset optimization</li>
                      <li>Bundle analysis</li>
                    </ul>
                  </div>

                  <div className="stage-card">
                    <h3>3. Test</h3>
                    <p>Automated testing suite</p>
                    <ul>
                      <li>Unit tests</li>
                      <li>Integration tests</li>
                      <li>End-to-end tests</li>
                      <li>Cross-browser testing</li>
                    </ul>
                  </div>

                  <div className="stage-card">
                    <h3>4. Security</h3>
                    <p>Security scanning and compliance</p>
                    <ul>
                      <li>Dependency scanning</li>
                      <li>SAST analysis</li>
                      <li>Container scanning</li>
                      <li>License compliance</li>
                    </ul>
                  </div>

                  <div className="stage-card">
                    <h3>5. Package</h3>
                    <p>Artifact creation and storage</p>
                    <ul>
                      <li>Docker image build</li>
                      <li>Registry push</li>
                      <li>Version tagging</li>
                      <li>Artifact signing</li>
                    </ul>
                  </div>

                  <div className="stage-card">
                    <h3>6. Deploy</h3>
                    <p>Environment deployment</p>
                    <ul>
                      <li>Blue-green deployment</li>
                      <li>Canary releases</li>
                      <li>Health checks</li>
                      <li>Rollback triggers</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Testing Strategies</h2>
                <div className="testing-strategies">
                  <div className="testing-pyramid">
                    <div className="pyramid-level e2e">
                      <h4>E2E Tests</h4>
                      <p>Full application flow testing</p>
                    </div>
                    <div className="pyramid-level integration">
                      <h4>Integration Tests</h4>
                      <p>API and service integration</p>
                    </div>
                    <div className="pyramid-level unit">
                      <h4>Unit Tests</h4>
                      <p>Component and function testing</p>
                    </div>
                  </div>

                  <div className="testing-details">
                    <div className="test-type-card">
                      <h3>Contract Testing</h3>
                      <p>Verify API contracts between micro-frontends</p>
                      <ul>
                        <li>Pact.js for consumer-driven contracts</li>
                        <li>OpenAPI specification validation</li>
                        <li>Schema compatibility testing</li>
                      </ul>
                    </div>

                    <div className="test-type-card">
                      <h3>Visual Regression Testing</h3>
                      <p>Detect UI changes and regressions</p>
                      <ul>
                        <li>Percy for visual diffs</li>
                        <li>Chromatic for Storybook</li>
                        <li>Screenshot comparison</li>
                      </ul>
                    </div>

                    <div className="test-type-card">
                      <h3>Performance Testing</h3>
                      <p>Monitor application performance</p>
                      <ul>
                        <li>Lighthouse CI integration</li>
                        <li>Bundle size tracking</li>
                        <li>Core Web Vitals monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="monitoring-content">
              <section>
                <h2>Monitoring and Observability</h2>
                <p>
                  Comprehensive monitoring is crucial for micro-frontend applications due to their 
                  distributed nature. You need visibility into performance, errors, and user experience 
                  across all micro-frontends.
                </p>

                <div className="monitoring-pillars">
                  <div className="pillar-card">
                    <h3>Metrics</h3>
                    <p>Quantitative measurements of system behavior</p>
                    <ul>
                      <li>Performance metrics (load time, render time)</li>
                      <li>Business metrics (conversion, engagement)</li>
                      <li>Infrastructure metrics (CPU, memory, network)</li>
                      <li>Custom application metrics</li>
                    </ul>
                  </div>

                  <div className="pillar-card">
                    <h3>Logs</h3>
                    <p>Structured records of application events</p>
                    <ul>
                      <li>Application logs (errors, warnings, info)</li>
                      <li>Access logs (HTTP requests, responses)</li>
                      <li>Security logs (authentication, authorization)</li>
                      <li>Audit logs (user actions, changes)</li>
                    </ul>
                  </div>

                  <div className="pillar-card">
                    <h3>Traces</h3>
                    <p>Distributed request flow tracking</p>
                    <ul>
                      <li>Request journey across services</li>
                      <li>Performance bottleneck identification</li>
                      <li>Dependency mapping</li>
                      <li>Error correlation</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2>Monitoring Tools & Setup</h2>
                <div className="tool-categories">
                  <div className="tool-category">
                    <h3>Application Performance Monitoring (APM)</h3>
                    <div className="tool-grid">
                      <div className="tool-card">
                        <h4>New Relic</h4>
                        <p>Full-stack observability platform</p>
                      </div>
                      <div className="tool-card">
                        <h4>DataDog</h4>
                        <p>Monitoring and analytics platform</p>
                      </div>
                      <div className="tool-card">
                        <h4>AppDynamics</h4>
                        <p>Application intelligence platform</p>
                      </div>
                      <div className="tool-card">
                        <h4>Dynatrace</h4>
                        <p>AI-powered observability platform</p>
                      </div>
                    </div>
                  </div>

                  <div className="tool-category">
                    <h3>Error Tracking</h3>
                    <div className="tool-grid">
                      <div className="tool-card">
                        <h4>Sentry</h4>
                        <p>Error monitoring and performance tracking</p>
                      </div>
                      <div className="tool-card">
                        <h4>Rollbar</h4>
                        <p>Real-time error alerting and debugging</p>
                      </div>
                      <div className="tool-card">
                        <h4>Bugsnag</h4>
                        <p>Error monitoring and reporting</p>
                      </div>
                      <div className="tool-card">
                        <h4>Airbrake</h4>
                        <p>Error and performance monitoring</p>
                      </div>
                    </div>
                  </div>

                  <div className="tool-category">
                    <h3>Real User Monitoring (RUM)</h3>
                    <div className="tool-grid">
                      <div className="tool-card">
                        <h4>Google Analytics</h4>
                        <p>Web analytics and user behavior</p>
                      </div>
                      <div className="tool-card">
                        <h4>LogRocket</h4>
                        <p>Session replay and monitoring</p>
                      </div>
                      <div className="tool-card">
                        <h4>FullStory</h4>
                        <p>Digital experience intelligence</p>
                      </div>
                      <div className="tool-card">
                        <h4>Hotjar</h4>
                        <p>Behavior analytics and user feedback</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Key Metrics to Monitor</h2>
                <div className="metrics-categories">
                  <div className="metric-category">
                    <h3>Performance Metrics</h3>
                    <div className="metric-list">
                      <div className="metric-item">
                        <h4>Core Web Vitals</h4>
                        <p>LCP, FID, CLS - Google's user experience metrics</p>
                      </div>
                      <div className="metric-item">
                        <h4>Time to Interactive (TTI)</h4>
                        <p>When the page becomes fully interactive</p>
                      </div>
                      <div className="metric-item">
                        <h4>Bundle Size</h4>
                        <p>JavaScript bundle size per micro-frontend</p>
                      </div>
                      <div className="metric-item">
                        <h4>Memory Usage</h4>
                        <p>Client-side memory consumption</p>
                      </div>
                    </div>
                  </div>

                  <div className="metric-category">
                    <h3>Business Metrics</h3>
                    <div className="metric-list">
                      <div className="metric-item">
                        <h4>Conversion Rate</h4>
                        <p>Percentage of users completing goals</p>
                      </div>
                      <div className="metric-item">
                        <h4>User Engagement</h4>
                        <p>Time spent, page views, interactions</p>
                      </div>
                      <div className="metric-item">
                        <h4>Feature Usage</h4>
                        <p>Adoption of specific micro-frontend features</p>
                      </div>
                      <div className="metric-item">
                        <h4>Error Impact</h4>
                        <p>Business impact of technical errors</p>
                      </div>
                    </div>
                  </div>

                  <div className="metric-category">
                    <h3>Technical Metrics</h3>
                    <div className="metric-list">
                      <div className="metric-item">
                        <h4>Error Rate</h4>
                        <p>Percentage of requests resulting in errors</p>
                      </div>
                      <div className="metric-item">
                        <h4>Uptime</h4>
                        <p>Service availability percentage</p>
                      </div>
                      <div className="metric-item">
                        <h4>Response Time</h4>
                        <p>API and page load response times</p>
                      </div>
                      <div className="metric-item">
                        <h4>Throughput</h4>
                        <p>Requests processed per second</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Alerting and Incident Response</h2>
                <div className="alerting-strategy">
                  <div className="alert-levels">
                    <div className="alert-level critical">
                      <h3>Critical</h3>
                      <p>Service down, data loss, security breach</p>
                      <ul>
                        <li>Immediate notification (SMS, call)</li>
                        <li>Automatic escalation</li>
                        <li>War room activation</li>
                      </ul>
                    </div>

                    <div className="alert-level high">
                      <h3>High</h3>
                      <p>Significant performance degradation</p>
                      <ul>
                        <li>Slack/Teams notification</li>
                        <li>On-call engineer alert</li>
                        <li>Status page update</li>
                      </ul>
                    </div>

                    <div className="alert-level medium">
                      <h3>Medium</h3>
                      <p>Minor issues, approaching thresholds</p>
                      <ul>
                        <li>Email notification</li>
                        <li>Dashboard highlight</li>
                        <li>Trend monitoring</li>
                      </ul>
                    </div>

                    <div className="alert-level low">
                      <h3>Low</h3>
                      <p>Informational, trend changes</p>
                      <ul>
                        <li>Dashboard notification</li>
                        <li>Weekly summary</li>
                        <li>Historical tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2>Monitoring Dashboard Example</h2>
                <div className="dashboard-mockup">
                  <div className="dashboard-header">
                    <h3>Micro-Frontend Health Dashboard</h3>
                    <div className="dashboard-controls">
                      <select>
                        <option>Last 24 hours</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="dashboard-grid">
                    <div className="dashboard-widget">
                      <h4>System Health</h4>
                      <div className="health-indicators">
                        <div className="health-item healthy">Shell: Healthy</div>
                        <div className="health-item healthy">Header: Healthy</div>
                        <div className="health-item warning">Products: Warning</div>
                        <div className="health-item healthy">Cart: Healthy</div>
                      </div>
                    </div>

                    <div className="dashboard-widget">
                      <h4>Performance</h4>
                      <div className="performance-metrics">
                        <div className="metric">
                          <span>Average Load Time</span>
                          <span className="value">1.2s</span>
                        </div>
                        <div className="metric">
                          <span>Core Web Vitals</span>
                          <span className="value good">Good</span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-widget">
                      <h4>Error Rate</h4>
                      <div className="error-chart">
                        <div className="chart-placeholder">📊 Error rate trending down</div>
                      </div>
                    </div>

                    <div className="dashboard-widget">
                      <h4>Active Users</h4>
                      <div className="user-metrics">
                        <div className="metric">
                          <span>Current</span>
                          <span className="value">1,247</span>
                        </div>
                        <div className="metric">
                          <span>Peak Today</span>
                          <span className="value">3,891</span>
                        </div>
                      </div>
                    </div>
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

export default DeploymentPage