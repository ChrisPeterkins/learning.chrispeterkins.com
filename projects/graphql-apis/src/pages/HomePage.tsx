import React from 'react'

function HomePage() {
  return (
    <div>
      <div className="page-header">
        <h1>GraphQL & APIs</h1>
        <p className="page-description">
          Master modern API design with GraphQL, from basic queries to real-time subscriptions. 
          Learn how GraphQL revolutionizes data fetching and provides a more efficient alternative to REST APIs.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>What is GraphQL?</h3>
          <p>
            GraphQL is a query language for APIs and a runtime for executing those queries. 
            It provides a complete and understandable description of the data in your API, 
            gives clients the power to ask for exactly what they need, and makes it easier to evolve APIs over time.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Key Benefits</h3>
          <p>
            • Single endpoint for all data<br/>
            • No over/under-fetching<br/>
            • Strongly typed schema<br/>
            • Real-time subscriptions<br/>
            • Introspection and tooling<br/>
            • Frontend-driven development
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Core Concepts</h3>
          <p>
            • <strong>Schema:</strong> Defines data structure and capabilities<br/>
            • <strong>Queries:</strong> Read operations to fetch data<br/>
            • <strong>Mutations:</strong> Write operations to modify data<br/>
            • <strong>Subscriptions:</strong> Real-time data updates<br/>
            • <strong>Resolvers:</strong> Functions that fetch actual data
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>GraphQL vs REST: Quick Comparison</h3>
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
                <td>Endpoints</td>
                <td>Multiple endpoints</td>
                <td className="pro">Single endpoint</td>
              </tr>
              <tr>
                <td>Data Fetching</td>
                <td>Fixed data structure</td>
                <td className="pro">Request exactly what you need</td>
              </tr>
              <tr>
                <td>Type System</td>
                <td>Loosely typed</td>
                <td className="pro">Strongly typed schema</td>
              </tr>
              <tr>
                <td>Real-time</td>
                <td>Additional setup required</td>
                <td className="pro">Built-in subscriptions</td>
              </tr>
              <tr>
                <td>Caching</td>
                <td className="pro">HTTP caching</td>
                <td>More complex caching</td>
              </tr>
              <tr>
                <td>Learning Curve</td>
                <td className="pro">Familiar to most developers</td>
                <td>Requires learning new concepts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Simple GraphQL Query Example</span>
        </div>
        <div className="code-content">
          <pre>{`# GraphQL Query
query GetUser {
  user(id: "1") {
    id
    name
    email
    posts {
      id
      title
      createdAt
    }
  }
}

# Response
{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "posts": [
        {
          "id": "1",
          "title": "Getting Started with GraphQL",
          "createdAt": "2023-06-15T00:00:00Z"
        }
      ]
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Schema Definition Language (SDL)</h3>
          <p>
            GraphQL uses a Schema Definition Language to define the shape of your API. 
            The schema serves as a contract between the client and server, 
            providing type safety and clear documentation.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Resolvers</h3>
          <p>
            Resolvers are functions that fetch the actual data for each field in your schema. 
            They provide flexibility in how data is retrieved, whether from databases, 
            APIs, files, or any other source.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Tooling Ecosystem</h3>
          <p>
            GraphQL has rich tooling including GraphQL Playground, Apollo Studio, 
            code generators, and introspection tools that make development more productive 
            and debugging easier.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>API Evolution Scenarios</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          See how GraphQL handles common API evolution challenges compared to REST:
        </p>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Adding New Fields</h4>
            <p>
              <strong>REST:</strong> New API version or risk breaking clients<br/>
              <strong>GraphQL:</strong> Add fields to schema, existing queries unaffected
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Deprecating Fields</h4>
            <p>
              <strong>REST:</strong> Maintain multiple API versions<br/>
              <strong>GraphQL:</strong> Mark fields as deprecated, track usage
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Different Client Needs</h4>
            <p>
              <strong>REST:</strong> Multiple endpoints or over-fetching<br/>
              <strong>GraphQL:</strong> Clients request exactly what they need
            </p>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Real-time Updates with Subscriptions</span>
        </div>
        <div className="code-content">
          <pre>{`# GraphQL Subscription
subscription OnPostAdded {
  postAdded {
    id
    title
    content
    author {
      name
    }
    createdAt
  }
}

# WebSocket Response Stream
{
  "data": {
    "postAdded": {
      "id": "123",
      "title": "New Post!",
      "content": "This was just created...",
      "author": {
        "name": "Alice"
      },
      "createdAt": "2024-01-27T10:30:00Z"
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Performance Considerations</h3>
          <p>
            While GraphQL eliminates over-fetching, it introduces new challenges like the N+1 problem. 
            Learn about DataLoader, query complexity analysis, and caching strategies 
            to build performant GraphQL APIs.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Security Best Practices</h3>
          <p>
            GraphQL requires different security considerations than REST. 
            Implement query depth limiting, rate limiting, authentication, 
            and authorization at the field level for secure APIs.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Production Considerations</h3>
          <p>
            Learn about monitoring GraphQL APIs, handling errors gracefully, 
            implementing proper logging, and using tools like Apollo Studio 
            for production GraphQL applications.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>What You'll Learn</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Foundation</h4>
            <p>
              • GraphQL basics and syntax<br/>
              • Schema design principles<br/>
              • Queries and mutations<br/>
              • Type system and validation
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Advanced Topics</h4>
            <p>
              • Real-time subscriptions<br/>
              • API design patterns<br/>
              • Performance optimization<br/>
              • Error handling strategies
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Practical Skills</h4>
            <p>
              • Interactive query playground<br/>
              • Live code examples<br/>
              • REST vs GraphQL comparisons<br/>
              • Real-world use cases
            </p>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Getting Started</span>
        </div>
        <div className="code-content">
          <pre>{`# Start with the basics
1. Explore GraphQL Basics - Learn syntax and core concepts
2. Understand Schemas & Types - Design your data structure  
3. Practice Queries & Mutations - Fetch and modify data
4. Try Subscriptions - Real-time updates
5. Compare with REST - See the differences
6. Learn Design Patterns - Best practices and patterns
7. Build Real-time APIs - WebSockets and live data

# Interactive learning
Each section includes:
• Live code examples you can modify
• Interactive query playground
• Real-time demos
• Performance comparisons
• Best practice guidance`}</pre>
        </div>
      </div>
    </div>
  )
}

export default HomePage