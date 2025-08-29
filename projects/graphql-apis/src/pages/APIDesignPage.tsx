import React, { useState } from 'react'

const DESIGN_PATTERNS = {
  'Relay Connections': {
    description: 'Standardized pagination pattern for consistent list handling',
    code: `type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  posts(
    first: Int
    after: String
    last: Int
    before: String
  ): PostConnection!
}`
  },

  'Error Handling': {
    description: 'Structured error handling with unions and error types',
    code: `union CreatePostResult = CreatePostSuccess | ValidationError

type CreatePostSuccess {
  post: Post!
}

type ValidationError {
  field: String!
  message: String!
  code: String!
}

type Mutation {
  createPost(input: CreatePostInput!): CreatePostResult!
}

# Usage
mutation {
  createPost(input: {title: "", content: "..."}) {
    ... on CreatePostSuccess {
      post {
        id
        title
      }
    }
    ... on ValidationError {
      field
      message
      code
    }
  }
}`
  },

  'Global Object ID': {
    description: 'Node interface for globally unique object identification',
    code: `interface Node {
  id: ID!
}

type User implements Node {
  id: ID!  # Global ID like "VXNlcjox" (base64 of "User:1")
  name: String!
}

type Post implements Node {
  id: ID!  # Global ID like "UG9zdDox" (base64 of "Post:1")
  title: String!
}

type Query {
  node(id: ID!): Node
}

# Client can refetch any object
query RefetchObject($id: ID!) {
  node(id: $id) {
    id
    ... on User {
      name
    }
    ... on Post {
      title
    }
  }
}`
  },

  'Dataloader Pattern': {
    description: 'Batch and cache database queries to solve N+1 problem',
    code: `# Without DataLoader (N+1 Problem)
query {
  posts {           # 1 query for posts
    title
    author {        # N queries for authors
      name
    }
  }
}

# With DataLoader
const userLoader = new DataLoader(async (userIds) => {
  // Single batch query for all user IDs
  const users = await db.users.findByIds(userIds);
  return userIds.map(id => users.find(user => user.id === id));
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId)
  }
};

# Result: 1 query for posts + 1 batched query for all authors`
  },

  'Schema Stitching': {
    description: 'Combine multiple GraphQL schemas into a unified API',
    code: `# User Service Schema
type User {
  id: ID!
  name: String!
  email: String!
}

type Query {
  user(id: ID!): User
  users: [User!]!
}

# Posts Service Schema  
type Post {
  id: ID!
  title: String!
  authorId: ID!
}

type Query {
  post(id: ID!): Post
  posts: [Post!]!
}

# Stitched Schema
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!  # Added via stitching
}

type Post {
  id: ID!
  title: String!
  authorId: ID!
  author: User!     # Added via stitching
}`
  }
};

const BEST_PRACTICES = {
  'Naming Conventions': {
    good: `type User {
  id: ID!
  firstName: String!      # camelCase for fields
  lastName: String!
  profilePicture: String  # descriptive names
  createdAt: DateTime!    # consistent timestamps
}

enum UserRole {
  ADMIN                   # SCREAMING_SNAKE_CASE for enums
  MODERATOR
  USER
}

input CreateUserInput {   # Input suffix for input types
  firstName: String!
  lastName: String!
  email: String!
}`,
    bad: `type user {                # lowercase type name
  ID: ID!                  # uppercase field name
  first_name: String!      # snake_case field
  pic: String              # abbreviated name
  created: String!         # inconsistent timestamp type
}

enum Role {
  admin                    # lowercase enum value
  mod                      # abbreviated value
}

input UserInput {         # missing Create prefix
  first: String!           # abbreviated field
}`
  },

  'Schema Design': {
    good: `# Business-focused, not database-focused
type Order {
  id: ID!
  customer: User!          # Relationship, not foreign key
  items: [OrderItem!]!     # Nested objects
  total: Money!            # Domain-specific types
  status: OrderStatus!     # Enum for constrained values
  estimatedDelivery: DateTime
}

type Money {
  amount: Float!
  currency: String!
}

# Pagination built-in
type Query {
  orders(
    first: Int = 10
    after: String
    status: OrderStatus
  ): OrderConnection!
}`,
    bad: `# Database-focused design
type Order {
  id: ID!
  customer_id: String!     # Foreign key exposed
  order_data: JSON!        # Unstructured data
  total_cents: Int!        # Primitive money representation
  status: String!          # String instead of enum
}

# No pagination
type Query {
  orders: [Order!]!        # Returns all orders
}`
  },

  'Error Handling': {
    good: `# Structured errors with context
type ValidationError {
  field: String!
  message: String!
  code: ValidationErrorCode!
}

enum ValidationErrorCode {
  REQUIRED
  INVALID_FORMAT
  TOO_SHORT
  TOO_LONG
}

# Partial success with errors
type CreateUserPayload {
  user: User
  errors: [ValidationError!]!
}

# Field-level error handling
mutation {
  createUser(input: {email: "invalid"}) {
    user {
      id
      name
    }
    errors {
      field
      message
      code
    }
  }
}`,
    bad: `# Generic error throwing
type Mutation {
  createUser(input: CreateUserInput!): User!  # Throws on error
}

# No structured error information
# Client gets generic "Internal server error"
# No field-level error context`
  }
};

function APIDesignPage() {
  const [selectedPattern, setSelectedPattern] = useState('Relay Connections')
  const [selectedPractice, setSelectedPractice] = useState('Naming Conventions')

  return (
    <div>
      <div className="page-header">
        <h1>API Design Patterns</h1>
        <p className="page-description">
          Learn proven patterns and best practices for designing robust, scalable GraphQL APIs.
          Discover how to structure schemas, handle errors, implement pagination, and create
          maintainable APIs that stand the test of time.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Schema-First Design</h3>
          <p>
            Design your schema before implementing resolvers. This ensures
            clear contracts, better collaboration between frontend and backend
            teams, and more thoughtful API design.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Business Logic Focus</h3>
          <p>
            Design your schema around business concepts, not database structure.
            Expose domain objects and operations that make sense to API consumers,
            hiding implementation details.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Evolutionary Design</h3>
          <p>
            Plan for schema evolution from day one. Use deprecation instead of
            breaking changes, design extensible types, and consider future
            requirements in your initial design.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>Common Design Patterns</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Explore proven patterns for common GraphQL API challenges:
        </p>
        
        <div className="demo-controls">
          {Object.keys(DESIGN_PATTERNS).map((pattern) => (
            <button
              key={pattern}
              className={`demo-button ${selectedPattern === pattern ? 'active' : ''}`}
              onClick={() => setSelectedPattern(pattern)}
            >
              {pattern}
            </button>
          ))}
        </div>
        
        <div className="concept-card">
          <h4>{selectedPattern}</h4>
          <p style={{ marginBottom: '1.5rem' }}>
            {DESIGN_PATTERNS[selectedPattern as keyof typeof DESIGN_PATTERNS].description}
          </p>
          <div className="code-content">
            <pre>{DESIGN_PATTERNS[selectedPattern as keyof typeof DESIGN_PATTERNS].code}</pre>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Schema Design Principles</span>
        </div>
        <div className="code-content">
          <pre>{`# 1. Design for your clients, not your database
type User {
  id: ID!
  displayName: String!     # What clients need
  avatar: String
  posts(first: Int): PostConnection!  # Pagination built-in
}

# Not this database-focused approach:
# type User {
#   user_id: String!       # Database column name
#   first_name: String!    # Separate fields instead of displayName
#   last_name: String!
#   avatar_url: String
# }

# 2. Use descriptive, consistent naming
type Order {
  id: ID!
  createdAt: DateTime!     # Consistent timestamp naming
  updatedAt: DateTime!     # Always include both
  estimatedDelivery: DateTime
  customer: User!          # Clear relationship
  items: [OrderItem!]!     # Plural for lists
  status: OrderStatus!     # Enum for constrained values
}

# 3. Group related fields into objects
type UserProfile {
  bio: String
  website: String
  location: String
  socialLinks: [SocialLink!]!
}

type User {
  id: ID!
  name: String!
  email: String!
  profile: UserProfile     # Group related fields
}

# 4. Use input types for mutations
input CreatePostInput {
  title: String!
  content: String!
  tags: [String!] = []
  published: Boolean = false
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}

# 5. Design for null safety
type Post {
  id: ID!                 # Never null
  title: String!          # Never null
  content: String!        # Never null
  publishedAt: DateTime   # Nullable for drafts
  author: User!           # Never null
  tags: [String!]!        # Non-null list of non-null strings
}`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Best Practices Comparison</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          See good vs bad examples of common GraphQL patterns:
        </p>
        
        <div className="demo-controls">
          {Object.keys(BEST_PRACTICES).map((practice) => (
            <button
              key={practice}
              className={`demo-button ${selectedPractice === practice ? 'active' : ''}`}
              onClick={() => setSelectedPractice(practice)}
            >
              {practice}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div className="concept-card">
            <h4>✅ Good Example</h4>
            <div className="code-content">
              <pre>{BEST_PRACTICES[selectedPractice as keyof typeof BEST_PRACTICES].good}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>❌ Bad Example</h4>
            <div className="code-content">
              <pre>{BEST_PRACTICES[selectedPractice as keyof typeof BEST_PRACTICES].bad}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Performance Patterns</h3>
          <p>
            • Use DataLoader for batching<br/>
            • Implement query complexity analysis<br/>
            • Add query depth limiting<br/>
            • Use connection patterns for pagination<br/>
            • Cache at resolver and HTTP levels<br/>
            • Monitor and optimize N+1 queries
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Security Patterns</h3>
          <p>
            • Validate input at schema level<br/>
            • Implement rate limiting<br/>
            • Use allow-lists for production<br/>
            • Sanitize user inputs<br/>
            • Add field-level authorization<br/>
            • Log and monitor query patterns
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Maintenance Patterns</h3>
          <p>
            • Use deprecation instead of breaking changes<br/>
            • Version your schema in Git<br/>
            • Document schema changes<br/>
            • Track field usage<br/>
            • Implement schema validation in CI<br/>
            • Plan migration strategies
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Advanced Schema Patterns</span>
        </div>
        <div className="code-content">
          <pre>{`# Custom scalars for domain types
scalar DateTime
scalar EmailAddress
scalar URL
scalar JSON

type User {
  id: ID!
  email: EmailAddress!     # Validated email
  website: URL            # Valid URL
  createdAt: DateTime!    # Proper date handling
  metadata: JSON          # Flexible data
}

# Interface for polymorphic data
interface Searchable {
  id: ID!
  title: String!
  createdAt: DateTime!
}

type Article implements Searchable {
  id: ID!
  title: String!
  content: String!
  createdAt: DateTime!
}

type Video implements Searchable {
  id: ID!
  title: String!
  url: String!
  duration: Int!
  createdAt: DateTime!
}

# Union for heterogeneous results
union SearchResult = Article | Video | User

type Query {
  search(query: String!): [SearchResult!]!
}

# Directive for metadata
directive @auth(requires: Role = USER) on FIELD_DEFINITION
directive @deprecated(reason: String) on FIELD_DEFINITION
directive @rateLimit(max: Int!, window: String!) on FIELD_DEFINITION

type Query {
  me: User @auth(requires: USER)
  posts: [Post!]! @rateLimit(max: 100, window: "1h")
  oldField: String @deprecated(reason: "Use newField instead")
}

# Input unions (using oneof directive)
input SearchFilter @oneOf {
  byAuthor: String
  byTag: String
  byDateRange: DateRange
}

# Subscription patterns
type Subscription {
  # Room-based subscriptions
  chatMessage(roomId: ID!): ChatMessage!
  
  # User-specific subscriptions  
  notifications(userId: ID!): Notification!
  
  # Global subscriptions with filters
  postPublished(authorIds: [ID!]): Post!
}`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Schema Evolution Strategies</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Adding Fields</h4>
            <p>
              Always safe to add new fields to existing types.
              Existing queries continue to work unchanged.
              Consider making new fields nullable initially.
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Deprecating Fields</h4>
            <p>
              Mark fields as deprecated instead of removing them.
              Track usage to understand when it's safe to remove.
              Provide clear migration guidance.
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Changing Types</h4>
            <p>
              Never change existing field types (breaking change).
              Add new field with correct type, deprecate old one.
              Consider using unions for complex changes.
            </p>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Testing Strategies</h3>
          <p>
            • Schema validation tests<br/>
            • Resolver unit tests<br/>
            • Integration tests with real queries<br/>
            • Performance tests for complex queries<br/>
            • Error handling tests<br/>
            • Schema evolution tests
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Documentation</h3>
          <p>
            • Add descriptions to all types and fields<br/>
            • Use GraphQL comments for context<br/>
            • Maintain schema changelog<br/>
            • Generate API documentation<br/>
            • Provide usage examples<br/>
            • Document deprecation timelines
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Monitoring & Analytics</h3>
          <p>
            • Track query performance<br/>
            • Monitor field usage<br/>
            • Alert on error rates<br/>
            • Measure client satisfaction<br/>
            • Analyze query complexity<br/>
            • Track schema evolution impact
          </p>
        </div>
      </div>
    </div>
  )
}

export default APIDesignPage