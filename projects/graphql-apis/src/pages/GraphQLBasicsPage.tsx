import React, { useState } from 'react'
import { queryExecutor } from '../api/MockGraphQLServer'

const EXAMPLE_QUERIES = {
  'Simple User Query': `query GetUser {
  user(id: "1") {
    id
    name
    email
  }
}`,
  
  'User with Posts': `query GetUserWithPosts {
  user(id: "1") {
    id
    name
    email
    posts {
      id
      title
      published
      createdAt
    }
  }
}`,

  'All Users': `query GetAllUsers {
  users {
    id
    name
    email
    age
    createdAt
  }
}`,

  'Posts with Authors': `query GetPostsWithAuthors {
  posts {
    id
    title
    content
    published
    author {
      id
      name
      email
    }
    tags
    createdAt
  }
}`,

  'Search Example': `query SearchContent {
  search(query: "GraphQL") {
    ... on User {
      id
      name
      email
    }
    ... on Post {
      id
      title
      content
      author {
        name
      }
    }
  }
}`,

  'With Variables': `query GetUserById($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    posts {
      id
      title
      createdAt
    }
  }
}`
};

const EXAMPLE_VARIABLES = {
  'With Variables': {
    userId: "2"
  }
};

function GraphQLBasicsPage() {
  const [selectedQuery, setSelectedQuery] = useState('Simple User Query')
  const [query, setQuery] = useState(EXAMPLE_QUERIES['Simple User Query'])
  const [variables, setVariables] = useState('')
  const [result, setResult] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const executeQuery = async () => {
    if (!query.trim()) return
    
    setIsExecuting(true)
    setExecutionTime(null)
    
    try {
      let parsedVariables = {}
      if (variables.trim()) {
        try {
          parsedVariables = JSON.parse(variables)
        } catch (e) {
          setResult('Error: Invalid variables JSON')
          setIsExecuting(false)
          return
        }
      }
      
      const startTime = Date.now()
      const response = await queryExecutor.execute(query, parsedVariables)
      const endTime = Date.now()
      
      setExecutionTime(endTime - startTime)
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const loadExampleQuery = (queryName: string) => {
    setSelectedQuery(queryName)
    setQuery(EXAMPLE_QUERIES[queryName as keyof typeof EXAMPLE_QUERIES])
    setVariables(
      EXAMPLE_VARIABLES[queryName as keyof typeof EXAMPLE_VARIABLES] 
        ? JSON.stringify(EXAMPLE_VARIABLES[queryName as keyof typeof EXAMPLE_VARIABLES], null, 2)
        : ''
    )
    setResult('')
    setExecutionTime(null)
  }

  return (
    <div>
      <div className="page-header">
        <h1>GraphQL Basics</h1>
        <p className="page-description">
          Learn the fundamentals of GraphQL through interactive examples. 
          Try different queries, see how data is fetched, and understand the core concepts
          that make GraphQL powerful.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Query Structure</h3>
          <p>
            GraphQL queries mirror the shape of the data you want to receive. 
            You specify exactly which fields you need, and the server returns 
            data in the same structure.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Single Endpoint</h3>
          <p>
            Unlike REST APIs with multiple endpoints, GraphQL uses a single endpoint. 
            All data fetching happens through queries sent to this single URL,
            typically <code>/graphql</code>.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Type System</h3>
          <p>
            GraphQL has a strong type system. Every field has a specific type,
            enabling powerful developer tooling, validation, and introspection
            capabilities.
          </p>
        </div>
      </div>

      <div className="graphql-playground">
        <div className="playground-header">
          <h3>Interactive GraphQL Playground</h3>
          <p>Try executing GraphQL queries against our mock server. Select an example or write your own!</p>
        </div>
        
        <div className="demo-controls">
          {Object.keys(EXAMPLE_QUERIES).map((queryName) => (
            <button
              key={queryName}
              className={`demo-button ${selectedQuery === queryName ? 'active' : ''}`}
              onClick={() => loadExampleQuery(queryName)}
            >
              {queryName}
            </button>
          ))}
        </div>
        
        <div className="playground-content">
          <div className="query-editor">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Query:</strong>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your GraphQL query here..."
              style={{ height: '200px' }}
            />
            
            {selectedQuery === 'With Variables' && (
              <>
                <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <strong>Variables (JSON):</strong>
                </div>
                <textarea
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  placeholder='{"userId": "1"}'
                  style={{ height: '80px' }}
                />
              </>
            )}
            
            <div className="query-controls">
              <button
                className="execute-button"
                onClick={executeQuery}
                disabled={isExecuting || !query.trim()}
              >
                {isExecuting ? 'Executing...' : 'Execute Query'}
              </button>
              {executionTime && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Executed in {executionTime}ms
                </span>
              )}
            </div>
          </div>
          
          <div className="result-panel">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Result:</strong>
            </div>
            <div className="result-content">
              {result || 'Click "Execute Query" to see results'}
            </div>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">GraphQL Query Syntax</span>
        </div>
        <div className="code-content">
          <pre>{`# Basic query structure
query QueryName {
  fieldName {
    subField
    anotherSubField
  }
}

# Query with arguments
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}

# Query with multiple fields
query DashboardData {
  currentUser: user(id: "1") {
    name
    email
  }
  recentPosts: posts(limit: 5) {
    title
    author {
      name
    }
  }
}

# Query with fragments (reusable field sets)
fragment UserInfo on User {
  id
  name
  email
}

query GetUsers {
  allUsers: users {
    ...UserInfo
  }
  currentUser: user(id: "1") {
    ...UserInfo
    posts {
      title
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Fields & Selection Sets</h3>
          <p>
            Fields are the basic units of a GraphQL query. A selection set is a collection of fields
            enclosed in curly braces. Scalar fields return values, while object fields require
            nested selection sets.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Arguments</h3>
          <p>
            Fields can accept arguments to filter, sort, or transform data.
            Arguments are passed in parentheses and can be literal values or variables.
            Every argument has a specific type defined in the schema.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Variables</h3>
          <p>
            Variables make queries reusable and secure. They're defined at the query level
            with a type, and can be used throughout the query. This prevents injection attacks
            and allows for dynamic query execution.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>Query Validation</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          GraphQL validates queries against the schema before execution:
        </p>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Syntax Validation</h4>
            <div className="code-content">
              <pre>{`# Invalid syntax ❌
query {
  user(id: "1" {
    name
  }
}

# Valid syntax ✅
query {
  user(id: "1") {
    name
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Field Validation</h4>
            <div className="code-content">
              <pre>{`# Non-existent field ❌
query {
  user(id: "1") {
    invalidField
  }
}

# Valid field ✅
query {
  user(id: "1") {
    name
    email
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Type Validation</h4>
            <div className="code-content">
              <pre>{`# Wrong argument type ❌
query {
  user(id: 123) {
    name
  }
}

# Correct argument type ✅
query {
  user(id: "123") {
    name
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Advanced Query Features</span>
        </div>
        <div className="code-content">
          <pre>{`# Aliases - rename fields in response
query {
  currentUser: user(id: "1") {
    name
  }
  otherUser: user(id: "2") {
    name
  }
}

# Directives - conditional field inclusion
query GetUser($includeEmail: Boolean!) {
  user(id: "1") {
    name
    email @include(if: $includeEmail)
  }
}

# Fragments - reusable field sets
fragment ContactInfo on User {
  name
  email
}

query {
  user(id: "1") {
    ...ContactInfo
    age
  }
}

# Inline fragments - type-specific fields
query Search {
  search(query: "test") {
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Query Optimization</h3>
          <p>
            GraphQL enables efficient data fetching by allowing clients to specify exactly
            what data they need. This eliminates over-fetching and under-fetching problems
            common in REST APIs.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Introspection</h3>
          <p>
            GraphQL APIs are self-documenting through introspection. You can query the schema
            itself to discover available types, fields, and their relationships, enabling
            powerful developer tools.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Error Handling</h3>
          <p>
            GraphQL has a standardized error format. Errors are returned alongside data,
            allowing partial results. Each error includes a message, locations, and path
            information for debugging.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>Common Query Patterns</h3>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Nested Relationships</h4>
            <div className="code-content">
              <pre>{`query {
  user(id: "1") {
    name
    posts {
      title
      comments {
        content
        author {
          name
        }
      }
    }
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Multiple Root Fields</h4>
            <div className="code-content">
              <pre>{`query Dashboard {
  me {
    name
    email
  }
  posts(limit: 5) {
    title
    createdAt
  }
  analytics {
    totalUsers
    totalPosts
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Conditional Fields</h4>
            <div className="code-content">
              <pre>{`query GetUser($detailed: Boolean!) {
  user(id: "1") {
    name
    email
    age @include(if: $detailed)
    posts @include(if: $detailed) {
      title
      content
    }
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GraphQLBasicsPage