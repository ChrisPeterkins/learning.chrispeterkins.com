import React, { useState } from 'react'
import { restAPI, comparisonScenarios } from '../api/restApi'
import { queryExecutor } from '../api/MockGraphQLServer'

function RestVsGraphQLPage() {
  const [selectedScenario, setSelectedScenario] = useState('getUserWithPosts')
  const [restResult, setRestResult] = useState('')
  const [graphqlResult, setGraphqlResult] = useState('')
  const [isTestingRest, setIsTestingRest] = useState(false)
  const [isTestingGraphQL, setIsTestingGraphQL] = useState(false)

  const testRESTScenario = async () => {
    setIsTestingRest(true)
    setRestResult('')
    
    try {
      const startTime = Date.now()
      
      if (selectedScenario === 'getUserWithPosts') {
        const user = await restAPI.getUser('1')
        const posts = await restAPI.getUserPosts('1')
        const result = { ...user, posts }
        const endTime = Date.now()
        
        setRestResult(JSON.stringify({
          data: result,
          requestCount: 2,
          executionTime: endTime - startTime
        }, null, 2))
      } else if (selectedScenario === 'dashboard') {
        const [user, posts, comments] = await Promise.all([
          restAPI.getUser('1'),
          restAPI.getPosts(),
          restAPI.getComments()
        ])
        const analytics = { totalUsers: 3, totalPosts: 2, postsThisWeek: 1 }
        const endTime = Date.now()
        
        setRestResult(JSON.stringify({
          data: { me: user, posts, comments, analytics },
          requestCount: 4,
          executionTime: endTime - startTime
        }, null, 2))
      }
    } catch (error) {
      setRestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingRest(false)
    }
  }

  const testGraphQLScenario = async () => {
    setIsTestingGraphQL(true)
    setGraphqlResult('')
    
    try {
      let query = ''
      let variables = {}
      
      if (selectedScenario === 'getUserWithPosts') {
        query = `
          query GetUserWithPosts($id: ID!) {
            user(id: $id) {
              id
              name
              email
              posts {
                id
                title
                content
                createdAt
              }
            }
          }
        `
        variables = { id: '1' }
      } else if (selectedScenario === 'dashboard') {
        query = `
          query Dashboard {
            me: user(id: "1") {
              id
              name
              email
            }
            posts {
              id
              title
              createdAt
            }
            analytics {
              totalUsers
              totalPosts
              postsThisWeek
            }
          }
        `
      }
      
      const result = await queryExecutor.execute(query, variables)
      setGraphqlResult(JSON.stringify({
        ...result,
        requestCount: 1
      }, null, 2))
    } catch (error) {
      setGraphqlResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingGraphQL(false)
    }
  }

  const currentScenario = comparisonScenarios[selectedScenario as keyof typeof comparisonScenarios]

  return (
    <div>
      <div className="page-header">
        <h1>REST vs GraphQL</h1>
        <p className="page-description">
          Compare REST and GraphQL approaches side-by-side. Understand the strengths and weaknesses
          of each approach, when to use them, and how they handle common API scenarios differently.
        </p>
      </div>

      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>REST</th>
              <th>GraphQL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Architecture</strong></td>
              <td>Resource-based, multiple endpoints</td>
              <td>Schema-based, single endpoint</td>
            </tr>
            <tr>
              <td><strong>Data Fetching</strong></td>
              <td>Fixed data structure per endpoint</td>
              <td className="pro">Client specifies exact data needed</td>
            </tr>
            <tr>
              <td><strong>Over/Under-fetching</strong></td>
              <td className="con">Common problem</td>
              <td className="pro">Eliminated by design</td>
            </tr>
            <tr>
              <td><strong>Type System</strong></td>
              <td>Loosely typed, relies on documentation</td>
              <td className="pro">Strongly typed schema</td>
            </tr>
            <tr>
              <td><strong>Caching</strong></td>
              <td className="pro">HTTP caching (GET requests)</td>
              <td>More complex, requires specialized tools</td>
            </tr>
            <tr>
              <td><strong>Learning Curve</strong></td>
              <td className="pro">Familiar to most developers</td>
              <td>Requires learning new concepts</td>
            </tr>
            <tr>
              <td><strong>Real-time</strong></td>
              <td>Additional protocols (WebSockets, SSE)</td>
              <td className="pro">Built-in subscriptions</td>
            </tr>
            <tr>
              <td><strong>Versioning</strong></td>
              <td>Multiple API versions</td>
              <td className="pro">Schema evolution without versioning</td>
            </tr>
            <tr>
              <td><strong>File Uploads</strong></td>
              <td className="pro">Native multipart/form-data support</td>
              <td>Requires multipart spec or separate endpoint</td>
            </tr>
            <tr>
              <td><strong>Monitoring</strong></td>
              <td className="pro">Standard HTTP monitoring tools</td>
              <td>Requires GraphQL-specific tools</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="demo-container">
        <h3>Interactive Comparison</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Test both approaches with realistic scenarios and compare the results:
        </p>
        
        <div className="demo-controls">
          {Object.entries(comparisonScenarios).map(([key, scenario]) => (
            <button
              key={key}
              className={`demo-button ${selectedScenario === key ? 'active' : ''}`}
              onClick={() => setSelectedScenario(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div className="concept-card">
            <h4>REST Approach</h4>
            <p style={{ marginBottom: '1rem' }}>{currentScenario.rest.description}</p>
            
            <div className="code-content" style={{ marginBottom: '1rem' }}>
              <pre>{currentScenario.rest.code || currentScenario.rest.requests.join('\n')}</pre>
            </div>
            
            <button
              className="execute-button"
              onClick={testRESTScenario}
              disabled={isTestingRest}
              style={{ marginBottom: '1rem' }}
            >
              {isTestingRest ? 'Testing...' : 'Test REST API'}
            </button>
            
            <div className="demo-output">
              {restResult || 'Click "Test REST API" to see results'}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Issues:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {currentScenario.rest.issues.map((issue, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="concept-card">
            <h4>GraphQL Approach</h4>
            <p style={{ marginBottom: '1rem' }}>{currentScenario.graphql.description}</p>
            
            <div className="code-content" style={{ marginBottom: '1rem' }}>
              <pre>{currentScenario.graphql.query}</pre>
            </div>
            
            <button
              className="execute-button"
              onClick={testGraphQLScenario}
              disabled={isTestingGraphQL}
              style={{ marginBottom: '1rem' }}
            >
              {isTestingGraphQL ? 'Testing...' : 'Test GraphQL API'}
            </button>
            
            <div className="demo-output">
              {graphqlResult || 'Click "Test GraphQL API" to see results'}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <strong>Benefits:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {currentScenario.graphql.benefits.map((benefit, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', color: 'var(--accent-green-bright)' }}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>When to Choose REST</h3>
          <p>
            • Simple CRUD applications<br/>
            • Teams familiar with REST<br/>
            • Heavy caching requirements<br/>
            • File upload heavy apps<br/>
            • Public APIs with broad usage<br/>
            • Simple client requirements
          </p>
        </div>
        
        <div className="concept-card">
          <h3>When to Choose GraphQL</h3>
          <p>
            • Complex data relationships<br/>
            • Multiple client types (web, mobile)<br/>
            • Real-time requirements<br/>
            • Rapid frontend development<br/>
            • Microservices aggregation<br/>
            • Strong typing requirements
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Hybrid Approaches</h3>
          <p>
            • GraphQL for reads, REST for writes<br/>
            • GraphQL gateway over REST services<br/>
            • REST for public API, GraphQL internal<br/>
            • File uploads via REST, data via GraphQL<br/>
            • Gradual migration strategies
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Network Efficiency Comparison</span>
        </div>
        <div className="code-content">
          <pre>{`# Scenario: Mobile app showing user profile with recent posts

# REST Approach (Multiple Requests)
GET /api/users/1
Response: {
  "id": "1", "name": "Alice", "email": "alice@example.com",
  "bio": "...", "avatar": "...", "website": "...", 
  "preferences": {...}, "settings": {...}  // Over-fetching
}

GET /api/users/1/posts?limit=5
Response: [{
  "id": "1", "title": "...", "content": "...",
  "authorId": "1", "published": true, "tags": [...],
  "metadata": {...}, "stats": {...}  // Over-fetching
}]

# Result: 2 requests, ~8KB total, lots of unused data

# GraphQL Approach (Single Request)
POST /graphql
Query: {
  user(id: "1") {
    name
    avatar
    posts(first: 5) {
      title
      createdAt
    }
  }
}

Response: {
  "data": {
    "user": {
      "name": "Alice",
      "avatar": "https://...",
      "posts": [
        {"title": "Post 1", "createdAt": "2024-01-01"},
        {"title": "Post 2", "createdAt": "2024-01-02"}
      ]
    }
  }
}

# Result: 1 request, ~1KB total, exactly what's needed`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Migration Strategies</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>1. GraphQL Gateway</h4>
            <p>
              Add GraphQL layer over existing REST APIs.
              Resolvers call REST endpoints behind the scenes.
              Allows gradual adoption without rewriting backend.
            </p>
          </div>
          
          <div className="concept-card">
            <h4>2. Strangler Fig Pattern</h4>
            <p>
              Gradually replace REST endpoints with GraphQL.
              Start with new features in GraphQL, migrate
              existing features over time.
            </p>
          </div>
          
          <div className="concept-card">
            <h4>3. Parallel Implementation</h4>
            <p>
              Run REST and GraphQL side by side.
              Different clients can use different APIs.
              Useful during transition periods.
            </p>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Performance Considerations</h3>
          <p>
            <strong>REST:</strong> HTTP caching, CDN-friendly, predictable load<br/>
            <strong>GraphQL:</strong> Reduced requests, precise data, complex caching<br/>
            <br/>
            Consider query complexity, N+1 problems, and caching strategies
            for both approaches.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Development Experience</h3>
          <p>
            <strong>REST:</strong> Simple, familiar, extensive tooling<br/>
            <strong>GraphQL:</strong> Type safety, introspection, better DX<br/>
            <br/>
            GraphQL provides better developer experience with
            auto-completion, validation, and documentation.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Ecosystem Maturity</h3>
          <p>
            <strong>REST:</strong> Mature ecosystem, widespread adoption<br/>
            <strong>GraphQL:</strong> Growing rapidly, excellent tooling<br/>
            <br/>
            Both have strong ecosystems, but REST has longer
            history and broader industry adoption.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RestVsGraphQLPage