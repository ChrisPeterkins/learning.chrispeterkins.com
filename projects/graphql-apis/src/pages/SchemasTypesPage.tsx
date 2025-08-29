import React, { useState } from 'react'
import { BASIC_SCHEMA, ADVANCED_SCHEMA } from '../api/schemas'

const SCALAR_TYPES = {
  'Int': 'Integer numbers (-2147483648 to 2147483647)',
  'Float': 'Floating-point numbers (double precision)',
  'String': 'UTF-8 character sequences',
  'Boolean': 'true or false values',
  'ID': 'Unique identifiers (serialized as strings)'
};

const SCHEMA_EXAMPLES = {
  'Basic Schema': BASIC_SCHEMA,
  'Advanced Schema': ADVANCED_SCHEMA
};

const TYPE_EXAMPLES = {
  'Object Types': `type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  tags: [String!]!
}`,

  'Scalar Types': `# Built-in scalars
scalar Int
scalar Float  
scalar String
scalar Boolean
scalar ID

# Custom scalars
scalar DateTime
scalar JSON
scalar Upload
scalar URL
scalar EmailAddress`,

  'Enum Types': `enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum UserRole {
  ADMIN
  MODERATOR
  USER
  GUEST
}

enum OrderBy {
  CREATED_AT_ASC
  CREATED_AT_DESC
  NAME_ASC
  NAME_DESC
}`,

  'Interface Types': `interface Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Node & Timestamped {
  id: ID!
  name: String!
  email: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}`,

  'Union Types': `union SearchResult = User | Post | Comment

union Media = Photo | Video | Document

type Query {
  search(query: String!): [SearchResult!]!
  getMedia(id: ID!): Media
}`,

  'Input Types': `input CreateUserInput {
  name: String!
  email: String!
  age: Int
  role: UserRole = USER
}

input UpdatePostInput {
  title: String
  content: String
  published: Boolean
  tags: [String!]
}

input FilterInput {
  status: PostStatus
  authorId: ID
  tags: [String!]
  dateRange: DateRangeInput
}

input DateRangeInput {
  start: DateTime!
  end: DateTime!
}`
};

function SchemasTypesPage() {
  const [selectedSchema, setSelectedSchema] = useState('Basic Schema')
  const [selectedType, setSelectedType] = useState('Object Types')

  return (
    <div>
      <div className="page-header">
        <h1>Schemas & Types</h1>
        <p className="page-description">
          The GraphQL schema defines the shape of your API. It describes what data is available,
          how it's structured, and what operations are possible. Learn about the type system
          that makes GraphQL so powerful.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Schema Definition Language</h3>
          <p>
            GraphQL uses a Schema Definition Language (SDL) to define your API.
            The schema serves as a contract between client and server,
            providing type safety and clear documentation.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Type System</h3>
          <p>
            GraphQL has a rich type system with scalar types, object types,
            interfaces, unions, enums, and input types. Every field has a
            specific type, enabling validation and tooling.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Schema First Development</h3>
          <p>
            Design your schema first, then implement resolvers. This approach
            ensures clear API contracts, better collaboration between teams,
            and more maintainable code.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h3>Schema Explorer</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Explore different schema examples and see how types are defined:
        </p>
        
        <div className="demo-controls">
          {Object.keys(SCHEMA_EXAMPLES).map((schemaName) => (
            <button
              key={schemaName}
              className={`demo-button ${selectedSchema === schemaName ? 'active' : ''}`}
              onClick={() => setSelectedSchema(schemaName)}
            >
              {schemaName}
            </button>
          ))}
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">{selectedSchema}</span>
          </div>
          <div className="code-content">
            <pre>{SCHEMA_EXAMPLES[selectedSchema as keyof typeof SCHEMA_EXAMPLES]}</pre>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Scalar Types</h3>
          <p>
            Scalar types represent leaf values in a GraphQL schema.
            GraphQL has five built-in scalars, and you can define custom scalars
            for domain-specific data types.
          </p>
          <div style={{ marginTop: '1rem' }}>
            {Object.entries(SCALAR_TYPES).map(([type, description]) => (
              <div key={type} style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--accent-green-bright)' }}>{type}:</strong> {description}
              </div>
            ))}
          </div>
        </div>
        
        <div className="concept-card">
          <h3>Non-Null & Lists</h3>
          <p>
            Type modifiers control nullability and list behavior:
          </p>
          <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>
            <div><strong>String</strong> - nullable string</div>
            <div><strong>String!</strong> - non-null string</div>
            <div><strong>[String]</strong> - nullable list of nullable strings</div>
            <div><strong>[String]!</strong> - non-null list of nullable strings</div>
            <div><strong>[String!]!</strong> - non-null list of non-null strings</div>
          </div>
        </div>
        
        <div className="concept-card">
          <h3>Schema Directives</h3>
          <p>
            Directives provide a way to describe additional information about types,
            fields, fragments, and operations:
          </p>
          <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            <div><strong>@deprecated</strong> - Mark fields as deprecated</div>
            <div><strong>@include(if:)</strong> - Conditionally include fields</div>
            <div><strong>@skip(if:)</strong> - Conditionally skip fields</div>
            <div><strong>@specifiedBy</strong> - Link to scalar specification</div>
          </div>
        </div>
      </div>

      <div className="demo-container">
        <h3>Type System Examples</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Explore different types of GraphQL types and how they work:
        </p>
        
        <div className="demo-controls">
          {Object.keys(TYPE_EXAMPLES).map((typeName) => (
            <button
              key={typeName}
              className={`demo-button ${selectedType === typeName ? 'active' : ''}`}
              onClick={() => setSelectedType(typeName)}
            >
              {typeName}
            </button>
          ))}
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">{selectedType}</span>
          </div>
          <div className="code-content">
            <pre>{TYPE_EXAMPLES[selectedType as keyof typeof TYPE_EXAMPLES]}</pre>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Object Types</h3>
          <p>
            Object types define the structure of your data. Each object type
            has fields, and each field has a type. Object types can reference
            other object types, creating a graph of data.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Interfaces</h3>
          <p>
            Interfaces define a common set of fields that multiple types can implement.
            They enable polymorphism and allow clients to query for shared fields
            across different types.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Union Types</h3>
          <p>
            Union types allow a field to return one of several possible types.
            Unlike interfaces, union types don't define common fields -
            you use inline fragments to query specific fields.
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Schema Design Best Practices</span>
        </div>
        <div className="code-content">
          <pre>{`# 1. Use descriptive names
type BlogPost {          # ✅ Clear and descriptive
  title: String!
  content: String!
}

type Post {              # ❌ Too generic
  data: String!
}

# 2. Design for client needs
type User {
  # Include fields clients actually need
  id: ID!
  displayName: String!   # Better than just 'name'
  avatarUrl: String
  
  # Provide useful relationships
  posts(first: Int = 10): [Post!]!
  followers: [User!]!
}

# 3. Use appropriate nullability
type Product {
  id: ID!                # Required fields are non-null
  name: String!
  description: String    # Optional fields are nullable
  price: Float!
  imageUrl: String
}

# 4. Group related fields with interfaces
interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Timestamped {
  id: ID!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# 5. Use enums for constrained values
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

# 6. Design input types carefully
input CreatePostInput {
  title: String!
  content: String!
  tags: [String!] = []   # Provide sensible defaults
  published: Boolean = false
}

# 7. Use unions for heterogeneous data
union SearchResult = User | Post | Comment | Tag

type Query {
  search(query: String!): [SearchResult!]!
}`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Schema Evolution</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          GraphQL schemas can evolve over time while maintaining backward compatibility:
        </p>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Adding Fields ✅</h4>
            <div className="code-content">
              <pre>{`# Before
type User {
  id: ID!
  name: String!
  email: String!
}

# After - safe to add fields
type User {
  id: ID!
  name: String!
  email: String!
  avatar: String      # New field
  bio: String         # Another new field
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Deprecating Fields ⚠️</h4>
            <div className="code-content">
              <pre>{`type User {
  id: ID!
  name: String!
  # Deprecate instead of removing
  username: String @deprecated(
    reason: "Use 'name' field instead"
  )
  email: String!
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Changing Field Types ❌</h4>
            <div className="code-content">
              <pre>{`# Breaking change - don't do this
type User {
  id: ID!
  name: String!
  age: String!  # Changed from Int to String
}

# Instead, add a new field
type User {
  id: ID!
  name: String!
  age: Int @deprecated(reason: "Use ageString")
  ageString: String
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Advanced Schema Patterns</span>
        </div>
        <div className="code-content">
          <pre>{`# Relay-style connections for pagination
type PostConnection {
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

# Node interface for global object identification
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}

# Error handling with unions
union CreatePostResult = CreatePostSuccess | ValidationError

type CreatePostSuccess {
  post: Post!
}

type ValidationError {
  field: String!
  message: String!
}

# Polymorphic relationships
interface Content {
  id: ID!
  title: String!
  createdAt: DateTime!
}

type Article implements Content {
  id: ID!
  title: String!
  body: String!
  createdAt: DateTime!
}

type Video implements Content {
  id: ID!
  title: String!
  url: String!
  duration: Int!
  createdAt: DateTime!
}

# Custom scalars with validation
scalar EmailAddress
scalar URL
scalar DateTime
scalar JSON

# Directive definitions
directive @auth(requires: UserRole = USER) on FIELD_DEFINITION
directive @rateLimit(max: Int!, window: String!) on FIELD_DEFINITION

type Query {
  me: User @auth(requires: USER)
  posts: [Post!]! @rateLimit(max: 100, window: "1m")
}`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Schema Validation</h3>
          <p>
            GraphQL validates your schema to ensure it's valid and follows best practices.
            This includes checking for circular references, proper type definitions,
            and correct field types.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Introspection</h3>
          <p>
            The schema is queryable itself through introspection. This enables
            powerful developer tools like GraphQL Playground, automatic
            documentation generation, and code generation.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Schema Stitching & Federation</h3>
          <p>
            Large applications can compose multiple GraphQL schemas using
            schema stitching or Apollo Federation, allowing teams to work
            independently while providing a unified API.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SchemasTypesPage