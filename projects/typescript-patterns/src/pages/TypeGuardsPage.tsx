import React, { useState } from 'react'

const TypeGuardsPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'typeof Type Guards',
      code: `// Using typeof for primitive type narrowing
function processValue(value: string | number | boolean) {
  if (typeof value === 'string') {
    // TypeScript knows value is string here
    return value.toUpperCase()
  } else if (typeof value === 'number') {
    // TypeScript knows value is number here
    return value.toFixed(2)
  } else {
    // TypeScript knows value is boolean here
    return value ? 'true' : 'false'
  }
}

// Example usage
console.log(processValue('hello'))     // "HELLO"
console.log(processValue(42.156))      // "42.16"
console.log(processValue(true))        // "true"`,
      explanation: 'The typeof operator is the simplest type guard, perfect for primitive types. TypeScript automatically narrows the type within each branch.'
    },
    {
      title: 'instanceof Type Guards',
      code: `// Using instanceof for class type checking
class FileError extends Error {
  fileName: string
  constructor(fileName: string, message: string) {
    super(message)
    this.fileName = fileName
  }
}

class NetworkError extends Error {
  statusCode: number
  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

function handleError(error: FileError | NetworkError | Error) {
  if (error instanceof FileError) {
    console.log(\`File error in \${error.fileName}: \${error.message}\`)
  } else if (error instanceof NetworkError) {
    console.log(\`Network error \${error.statusCode}: \${error.message}\`)
  } else {
    console.log(\`General error: \${error.message}\`)
  }
}`,
      explanation: 'instanceof checks if an object is an instance of a class, enabling type narrowing for class-based types.'
    },
    {
      title: 'in Operator Type Guards',
      code: `// Using 'in' operator for object property checking
type Car = {
  brand: string
  wheels: 4
  drive: () => void
}

type Boat = {
  brand: string
  propellers: number
  sail: () => void
}

type Plane = {
  brand: string
  wings: 2
  fly: () => void
}

function operateVehicle(vehicle: Car | Boat | Plane) {
  if ('wheels' in vehicle) {
    // TypeScript knows it's a Car
    console.log(\`Driving \${vehicle.brand} car\`)
    vehicle.drive()
  } else if ('propellers' in vehicle) {
    // TypeScript knows it's a Boat
    console.log(\`Sailing \${vehicle.brand} boat with \${vehicle.propellers} propellers\`)
    vehicle.sail()
  } else {
    // TypeScript knows it's a Plane
    console.log(\`Flying \${vehicle.brand} plane\`)
    vehicle.fly()
  }
}`,
      explanation: 'The in operator checks for property existence, allowing TypeScript to narrow types based on unique properties.'
    },
    {
      title: 'Custom Type Predicates',
      code: `// User-defined type guards with type predicates
interface User {
  type: 'user'
  name: string
  email: string
}

interface Admin {
  type: 'admin'
  name: string
  permissions: string[]
}

interface Guest {
  type: 'guest'
  sessionId: string
}

// Custom type guard functions
function isUser(person: User | Admin | Guest): person is User {
  return person.type === 'user'
}

function isAdmin(person: User | Admin | Guest): person is Admin {
  return person.type === 'admin'
}

function hasPermission(
  person: User | Admin | Guest,
  permission: string
): boolean {
  if (isAdmin(person)) {
    return person.permissions.includes(permission)
  }
  return false
}

// Usage
const visitor: User | Admin | Guest = {
  type: 'admin',
  name: 'Alice',
  permissions: ['read', 'write', 'delete']
}

if (isAdmin(visitor)) {
  console.log(\`Admin \${visitor.name} has permissions: \${visitor.permissions.join(', ')}\`)
}`,
      explanation: 'Custom type predicates use the "is" keyword to create reusable type guard functions that TypeScript understands.'
    },
    {
      title: 'Discriminated Unions',
      code: `// Using discriminated unions for exhaustive type checking
type Success<T> = {
  status: 'success'
  data: T
}

type Loading = {
  status: 'loading'
}

type Error = {
  status: 'error'
  error: string
}

type AsyncState<T> = Success<T> | Loading | Error

function renderAsyncState<T>(
  state: AsyncState<T>,
  render: (data: T) => string
): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    
    case 'success':
      return render(state.data)
    
    case 'error':
      return \`Error: \${state.error}\`
    
    default:
      // TypeScript ensures this is never reached
      const _exhaustive: never = state
      return _exhaustive
  }
}

// Usage
const userState: AsyncState<{ name: string }> = {
  status: 'success',
  data: { name: 'John' }
}

console.log(renderAsyncState(userState, user => \`Hello, \${user.name}!\`))`,
      explanation: 'Discriminated unions use a common property to distinguish between types, enabling exhaustive pattern matching.'
    },
    {
      title: 'Assertion Functions',
      code: `// Assertion functions for runtime validation
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(\`Expected string, got \${typeof value}\`)
  }
}

function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined')
  }
}

function assertIsPositive(value: number): asserts value is number {
  if (value <= 0) {
    throw new Error(\`Expected positive number, got \${value}\`)
  }
}

// Usage
function processInput(input: unknown) {
  assertIsString(input)
  // TypeScript knows input is string from here
  console.log(input.toUpperCase())
  
  const length = input.length
  assertIsPositive(length)
  // TypeScript knows length is positive
  console.log(\`String has \${length} characters\`)
}

// Example with optional values
function getUserName(user: { name?: string } | null) {
  assertIsDefined(user)
  assertIsDefined(user.name)
  // TypeScript knows user.name is string
  return user.name.trim()
}`,
      explanation: 'Assertion functions throw errors if conditions are not met, and TypeScript narrows types after successful assertions.'
    }
  ]

  return (
    <div className="pattern-page">
      <header className="page-header">
        <h1>Type Guards & Narrowing</h1>
        <p className="page-description">
          Type guards are TypeScript's way of narrowing types within conditional blocks. 
          They help you write safer code by ensuring type correctness at compile time.
        </p>
      </header>

      <section className="examples-nav">
        <div className="example-tabs">
          {examples.map((example, index) => (
            <button
              key={index}
              className={`example-tab ${activeExample === index ? 'active' : ''}`}
              onClick={() => setActiveExample(index)}
            >
              {example.title}
            </button>
          ))}
        </div>
      </section>

      <section className="code-example">
        <div className="example-header">
          <span className="example-title">{examples[activeExample].title}</span>
          <span className="example-badge badge-basic">Interactive</span>
        </div>
        <pre className="code-block">
          <code>{examples[activeExample].code}</code>
        </pre>
        <div className="explanation">
          {examples[activeExample].explanation}
        </div>
      </section>

      <section className="concept-grid">
        <div className="concept-card">
          <h3>When to Use Type Guards</h3>
          <p>
            Use type guards when working with union types, unknown values from external sources, 
            or when you need runtime type checking that TypeScript can understand.
          </p>
        </div>

        <div className="concept-card">
          <h3>Best Practices</h3>
          <p>
            Prefer discriminated unions over complex type guards. Use assertion functions 
            for validation at system boundaries. Create reusable type guard functions.
          </p>
        </div>

        <div className="concept-card">
          <h3>Common Patterns</h3>
          <p>
            API response validation, form input processing, error handling with different 
            error types, and state machine implementations.
          </p>
        </div>
      </section>

      <style jsx>{`
        .pattern-page {
          max-width: 1200px;
        }

        .examples-nav {
          margin: 2rem 0;
        }

        .example-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
        }

        .example-tab {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          border-radius: 4px;
        }

        .example-tab:hover {
          background: rgba(26, 93, 58, 0.1);
          color: var(--text-primary);
        }

        .example-tab.active {
          background: var(--accent-green);
          color: var(--text-primary);
          border-color: var(--accent-green);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }

        .feature-card {
          background: var(--bg-secondary);
          padding: 1rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
        }

        .feature-card h3 {
          color: var(--accent-green-bright);
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}

export default TypeGuardsPage