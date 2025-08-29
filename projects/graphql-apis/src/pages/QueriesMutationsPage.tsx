import React, { useState } from 'react'
import { queryExecutor } from '../api/MockGraphQLServer'

const QUERY_EXAMPLES = {
  'Simple Query': {
    operation: `query GetUsers {
  users {
    id
    name
    email
    createdAt
  }
}`,
    description: 'Fetch all users with basic information'
  },
  
  'Query with Variables': {
    operation: `query GetUserById($userId: ID!) {
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
}`,
    variables: { userId: "1" },
    description: 'Fetch a specific user with their posts using variables'
  },
  
  'Nested Query': {
    operation: `query GetPostsWithAuthors {
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
  }
}`,
    description: 'Fetch posts with nested author information'
  },
  
  'Query with Arguments': {
    operation: `query GetUserPosts($userId: ID!) {
  postsByUser(userId: $userId) {
    id
    title
    content
    published
    tags
    createdAt
  }
}`,
    variables: { userId: "1" },
    description: 'Fetch posts by a specific user'
  }
};

const MUTATION_EXAMPLES = {
  'Create User': {
    operation: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    age
    createdAt
  }
}`,
    variables: {
      input: {
        name: "John Doe",
        email: "john@example.com",
        age: 30
      }
    },
    description: 'Create a new user'
  },
  
  'Update User': {
    operation: `mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    age
    updatedAt
  }
}`,
    variables: {
      id: "1",
      input: {
        name: "Alice Updated",
        age: 29
      }
    },
    description: 'Update an existing user'
  },
  
  'Create Post': {
    operation: `mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    content
    published
    author {
      id
      name
    }
    tags
    createdAt
  }
}`,
    variables: {
      input: {
        title: "My New Post",
        content: "This is the content of my new post.",
        published: true,
        authorId: "1",
        tags: ["graphql", "tutorial"]
      }
    },
    description: 'Create a new blog post'
  },
  
  'Delete Post': {
    operation: `mutation DeletePost($id: ID!) {
  deletePost(id: $id)
}`,
    variables: { id: "1" },
    description: 'Delete a post by ID'
  }
};

function QueriesMutationsPage() {
  const [activeTab, setActiveTab] = useState<'queries' | 'mutations'>('queries')
  const [selectedExample, setSelectedExample] = useState('Simple Query')
  const [operation, setOperation] = useState(QUERY_EXAMPLES['Simple Query'].operation)
  const [variables, setVariables] = useState('')
  const [result, setResult] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const getCurrentExamples = () => {
    return activeTab === 'queries' ? QUERY_EXAMPLES : MUTATION_EXAMPLES
  }

  const loadExample = (exampleName: string) => {
    const examples = getCurrentExamples()
    const example = examples[exampleName as keyof typeof examples]
    
    setSelectedExample(exampleName)
    setOperation(example.operation)
    setVariables(example.variables ? JSON.stringify(example.variables, null, 2) : '')
    setResult('')
  }

  const executeOperation = async () => {
    if (!operation.trim()) return
    
    setIsExecuting(true)
    
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
      
      const response = await queryExecutor.execute(operation, parsedVariables)
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const switchTab = (tab: 'queries' | 'mutations') => {
    setActiveTab(tab)
    const examples = tab === 'queries' ? QUERY_EXAMPLES : MUTATION_EXAMPLES
    const firstExample = Object.keys(examples)[0]
    loadExample(firstExample)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Queries & Mutations</h1>
        <p className="page-description">
          Master GraphQL operations - queries for reading data and mutations for modifying it.
          Learn how to structure operations, use variables, and handle responses effectively.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Queries</h3>
          <p>
            Queries are read-only operations that fetch data from your GraphQL API.
            They mirror the shape of the data you want to receive and can include
            arguments, nested fields, and variables.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Mutations</h3>
          <p>
            Mutations are write operations that modify data on the server.
            Unlike queries, mutations are executed sequentially to ensure
            data consistency and prevent race conditions.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Variables</h3>
          <p>
            Variables make operations reusable and secure. They're defined
            with types and can be used throughout the operation, preventing
            injection attacks and enabling dynamic execution.
          </p>
        </div>
      </div>

      <div className="graphql-playground">
        <div className="playground-header">
          <h3>Interactive Operations Playground</h3>
          <p>Try executing queries and mutations against our mock GraphQL server:</p>
          
          <div className="demo-controls" style={{ marginTop: '1rem' }}>
            <button
              className={`demo-button ${activeTab === 'queries' ? 'active' : ''}`}
              onClick={() => switchTab('queries')}
            >
              Queries
            </button>
            <button
              className={`demo-button ${activeTab === 'mutations' ? 'active' : ''}`}
              onClick={() => switchTab('mutations')}
            >
              Mutations
            </button>
          </div>
        </div>
        
        <div className="demo-controls">
          {Object.entries(getCurrentExamples()).map(([name, example]) => (
            <button
              key={name}
              className={`demo-button ${selectedExample === name ? 'active' : ''}`}
              onClick={() => loadExample(name)}
              title={example.description}
            >
              {name}
            </button>
          ))}
        </div>
        
        <div className="playground-content">
          <div className="query-editor">
            <div style={{ marginBottom: '1rem' }}>
              <strong>{activeTab === 'queries' ? 'Query:' : 'Mutation:'}</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {getCurrentExamples()[selectedExample as keyof typeof QUERY_EXAMPLES]?.description}
              </p>
            </div>
            <textarea
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              placeholder="Enter your GraphQL operation here..."
              style={{ height: '220px' }}
            />
            
            <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <strong>Variables (JSON):</strong>
            </div>
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder='{"id": "1"}'
              style={{ height: '120px' }}
            />
            
            <div className="query-controls">
              <button
                className="execute-button"
                onClick={executeOperation}
                disabled={isExecuting || !operation.trim()}
              >
                {isExecuting ? 'Executing...' : `Execute ${activeTab === 'queries' ? 'Query' : 'Mutation'}`}
              </button>
            </div>
          </div>
          
          <div className="result-panel">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Result:</strong>
            </div>
            <div className="result-content">
              {result || `Click "Execute ${activeTab === 'queries' ? 'Query' : 'Mutation'}" to see results`}
            </div>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Query Structure & Syntax</span>
        </div>
        <div className="code-content">
          <pre>{`# Basic query structure
query QueryName($variable: Type!) {
  fieldName(argument: $variable) {
    subField
    nestedObject {
      nestedField
    }
  }
}

# Query without variables
query {
  users {
    id
    name
    email
  }
}

# Query with multiple root fields
query GetDashboardData {
  me {
    name
    email
  }
  posts(limit: 5) {
    id
    title
    createdAt
  }
  analytics {
    totalUsers
    totalPosts
  }
}

# Query with fragments
fragment UserInfo on User {
  id
  name
  email
  createdAt
}

query GetUsers {
  users {
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
          <h3>Query Features</h3>
          <p>
            • <strong>Arguments:</strong> Filter and parameterize requests<br/>
            • <strong>Aliases:</strong> Rename fields in the response<br/>
            • <strong>Fragments:</strong> Reuse common field selections<br/>
            • <strong>Directives:</strong> Conditionally include fields<br/>
            • <strong>Variables:</strong> Dynamic, reusable parameters
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Best Practices</h3>
          <p>
            • Always name your operations<br/>
            • Use variables for dynamic values<br/>
            • Request only needed fields<br/>
            • Use fragments for common patterns<br/>
            • Handle errors gracefully
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Performance Tips</h3>
          <p>
            • Avoid deeply nested queries<br/>
            • Use pagination for large datasets<br/>
            • Implement query complexity analysis<br/>
            • Cache results when possible<br/>
            • Monitor query performance
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Mutation Structure & Patterns</span>
        </div>
        <div className="code-content">
          <pre>{`# Basic mutation structure
mutation MutationName($input: InputType!) {
  mutationField(input: $input) {
    # Return fields you need after the mutation
    id
    updatedField
    createdAt
  }
}

# Create operation
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    content
    author {
      name
    }
    createdAt
  }
}

# Update operation
mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
  updatePost(id: $id, input: $input) {
    id
    title
    content
    updatedAt
  }
}

# Delete operation (typically returns boolean or ID)
mutation DeletePost($id: ID!) {
  deletePost(id: $id)  # Returns Boolean
}

# Multiple mutations in one operation
mutation MultipleUpdates($userId: ID!, $postId: ID!) {
  updateUser(id: $userId, input: { name: "New Name" }) {
    id
    name
    updatedAt
  }
  
  deletePost(id: $postId)
  
  createComment(input: {
    content: "Great post!"
    authorId: $userId
    postId: $postId
  }) {
    id
    content
    createdAt
  }
}

# Error handling pattern
mutation CreatePostWithError($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on CreatePostSuccess {
      post {
        id
        title
      }
    }
    ... on ValidationError {
      field
      message
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>CRUD Operations Examples</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Common Create, Read, Update, Delete patterns in GraphQL:
        </p>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Create (C)</h4>
            <div className="code-content">
              <pre>{`mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    age: 25
  }) {
    id
    name
    createdAt
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Read (R)</h4>
            <div className="code-content">
              <pre>{`query {
  user(id: "1") {
    id
    name
    email
    posts {
      title
      createdAt
    }
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Update (U)</h4>
            <div className="code-content">
              <pre>{`mutation {
  updateUser(
    id: "1"
    input: {
      name: "John Smith"
      age: 26
    }
  ) {
    id
    name
    age
    updatedAt
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Delete (D)</h4>
            <div className="code-content">
              <pre>{`mutation {
  deleteUser(id: "1")
}

# Or return deleted object
mutation {
  deletePost(id: "1") {
    id
    title
    deletedAt
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Input Types</h3>
          <p>
            Input types are special object types used for mutation arguments.
            They can't have circular references and can only contain scalar types,
            enums, lists, and other input types.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Mutation Response Design</h3>
          <p>
            Design mutation responses to return useful data. Include the modified
            object, success indicators, and any computed fields that clients
            might need to update their cache.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Error Handling</h3>
          <p>
            GraphQL supports partial success - mutations can return both data
            and errors. Use error extensions for additional context and
            consider union types for complex error scenarios.
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Advanced Operation Patterns</span>
        </div>
        <div className="code-content">
          <pre>{`# Batch mutations with variables
mutation BatchCreateUsers($users: [CreateUserInput!]!) {
  users: createUsers(input: $users) {
    id
    name
    email
  }
}

# Conditional mutations with directives
mutation ConditionalUpdate($updateProfile: Boolean!, $updatePosts: Boolean!) {
  updateUser(id: "1", input: { name: "New Name" }) {
    id
    name
    profile @include(if: $updateProfile) {
      bio
      avatar
    }
    posts @include(if: $updatePosts) {
      title
      updatedAt
    }
  }
}

# Optimistic response pattern
mutation LikePost($postId: ID!) {
  likePost(postId: $postId) {
    id
    likes
    likedByMe
  }
}

# Relay-style mutations
mutation UpdateUserRelay($input: UpdateUserInput!) {
  updateUser(input: $input) {
    user {
      id
      name
      email
    }
    clientMutationId
  }
}

# Error union pattern
mutation CreatePostSafe($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on CreatePostSuccess {
      post {
        id
        title
      }
    }
    ... on ValidationError {
      field
      message
    }
    ... on AuthenticationError {
      message
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Query vs Mutation Execution</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Query Execution</h4>
            <p>
              • Fields execute in parallel<br/>
              • No guaranteed execution order<br/>
              • Safe to execute multiple times<br/>
              • Cacheable and idempotent<br/>
              • Read-only operations
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Mutation Execution</h4>
            <p>
              • Root fields execute sequentially<br/>
              • Guaranteed execution order<br/>
              • Side effects and state changes<br/>
              • Not cacheable by default<br/>
              • Write operations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueriesMutationsPage