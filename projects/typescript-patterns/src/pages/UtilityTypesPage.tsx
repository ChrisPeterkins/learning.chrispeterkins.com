import React, { useState } from 'react'

const UtilityTypesPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Partial & Required',
      code: `// Partial<T> - Makes all properties optional
interface User {
  id: number
  name: string
  email: string
  age: number
}

type PartialUser = Partial<User>
// All properties are now optional
const updateUser: PartialUser = {
  name: 'Alice'  // Can update just the name
}

// Required<T> - Makes all properties required
interface Config {
  apiUrl?: string
  timeout?: number
  retries?: number
}

type RequiredConfig = Required<Config>
// All properties are now required
const config: RequiredConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3  // Must provide all properties
}

// Practical example: Update function
function updateEntity<T>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates }
}

const user: User = { id: 1, name: 'Bob', email: 'bob@example.com', age: 25 }
const updated = updateEntity(user, { age: 26, email: 'newemail@example.com' })`,
      explanation: 'Partial makes all properties optional, while Required makes all properties required. Perfect for update operations and configuration objects.'
    },
    {
      title: 'Pick & Omit',
      code: `// Pick<T, K> - Creates type with only specified properties
interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
}

type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>
// Only has id, name, and price properties

const summary: ProductSummary = {
  id: 1,
  name: 'Laptop',
  price: 999
}

// Omit<T, K> - Creates type without specified properties
type ProductWithoutStock = Omit<Product, 'stock'>
// Has all properties except stock

type PublicUser = Omit<User, 'email' | 'age'>
// Removes sensitive information

// Combining Pick and Omit
type EditableProduct = Omit<Product, 'id'> // Can't change ID
type DisplayProduct = Pick<Product, 'name' | 'price' | 'description'>

// Practical usage
function createProduct(data: Omit<Product, 'id'>): Product {
  return {
    id: Math.random(),
    ...data
  }
}

function getPublicProfile(user: User): Pick<User, 'id' | 'name'> {
  return {
    id: user.id,
    name: user.name
  }
}`,
      explanation: 'Pick selects specific properties from a type, while Omit excludes specific properties. Great for creating subsets of interfaces.'
    },
    {
      title: 'Record & Extract & Exclude',
      code: `// Record<K, T> - Creates object type with keys K and values T
type Role = 'admin' | 'user' | 'guest'
type Permissions = 'read' | 'write' | 'delete'

type RolePermissions = Record<Role, Permissions[]>

const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
}

// Creating lookup tables
type StatusColors = Record<'success' | 'warning' | 'error', string>
const colors: StatusColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
}

// Extract<T, U> - Extracts from T those types assignable to U
type AllEvents = 'click' | 'focus' | 'blur' | 'change' | 'submit'
type FormEvents = Extract<AllEvents, 'change' | 'submit'>
// Type: 'change' | 'submit'

// Exclude<T, U> - Excludes from T those types assignable to U
type NonFormEvents = Exclude<AllEvents, FormEvents>
// Type: 'click' | 'focus' | 'blur'

// Practical example with discriminated unions
type Action = 
  | { type: 'ADD_TODO', payload: string }
  | { type: 'REMOVE_TODO', payload: number }
  | { type: 'TOGGLE_TODO', payload: number }
  | { type: 'SET_FILTER', payload: string }

type TodoActions = Extract<Action, { type: 'ADD_TODO' | 'REMOVE_TODO' | 'TOGGLE_TODO' }>
type FilterActions = Extract<Action, { type: 'SET_FILTER' }>`,
      explanation: 'Record creates object types with specific keys and values. Extract and Exclude filter union types based on assignability.'
    },
    {
      title: 'ReturnType & Parameters',
      code: `// ReturnType<T> - Extracts return type of function
function createUser(name: string, age: number) {
  return { id: Math.random(), name, age, createdAt: new Date() }
}

type User = ReturnType<typeof createUser>
// Inferred type from function return

// Parameters<T> - Extracts parameter types as tuple
type CreateUserParams = Parameters<typeof createUser>
// Type: [string, number]

function callWithLogging<F extends (...args: any[]) => any>(
  fn: F,
  ...args: Parameters<F>
): ReturnType<F> {
  console.log('Calling function with args:', args)
  const result = fn(...args)
  console.log('Result:', result)
  return result
}

// ConstructorParameters<T> - Extract constructor parameters
class Product {
  constructor(
    public name: string,
    public price: number,
    public inStock: boolean
  ) {}
}

type ProductParams = ConstructorParameters<typeof Product>
// Type: [string, number, boolean]

// InstanceType<T> - Extract instance type of constructor
type ProductInstance = InstanceType<typeof Product>
// Same as: Product

// Practical factory pattern
function createInstance<T extends new (...args: any[]) => any>(
  Constructor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Constructor(...args)
}

const product = createInstance(Product, 'Laptop', 999, true)`,
      explanation: 'These utilities extract type information from functions and constructors, enabling powerful meta-programming patterns.'
    },
    {
      title: 'Readonly & ReadonlyArray',
      code: `// Readonly<T> - Makes all properties readonly
interface State {
  count: number
  user: { name: string; age: number }
  items: string[]
}

type ReadonlyState = Readonly<State>
// All top-level properties are readonly

const state: ReadonlyState = {
  count: 0,
  user: { name: 'Alice', age: 30 },
  items: ['a', 'b']
}

// state.count = 1  // Error: Cannot assign to 'count'
// Note: nested properties are not readonly
state.user.age = 31  // This still works!

// Deep readonly utility
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

type ImmutableState = DeepReadonly<State>
// Now all properties at all levels are readonly

// ReadonlyArray<T> - Immutable array
const numbers: ReadonlyArray<number> = [1, 2, 3]
// numbers.push(4)  // Error: push doesn't exist on ReadonlyArray
// numbers[0] = 10  // Error: Index signature is readonly

// Using readonly modifier
interface Config {
  readonly apiKey: string
  readonly endpoints: readonly string[]  // Readonly array
}

// as const assertion for deep readonly
const settings = {
  theme: 'dark',
  features: ['auth', 'api']
} as const
// Type is deeply readonly with literal types

// Practical immutability helper
function freeze<T>(obj: T): Readonly<T> {
  return Object.freeze(obj)
}`,
      explanation: 'Readonly utilities create immutable types, preventing accidental mutations and enabling safer code patterns.'
    },
    {
      title: 'Custom Utility Types',
      code: `// Building your own utility types
// Nullable type
type Nullable<T> = T | null

// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

interface User {
  id: number
  name: string
  email: string
  bio: string
}

type UserWithOptionalBio = PartialBy<User, 'bio'>
// bio is optional, others required

// Make specific properties required
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

// Type XOR (exclusive or)
type XOR<T, U> = (T & { [K in Exclude<keyof U, keyof T>]?: never }) |
                 (U & { [K in Exclude<keyof T, keyof U>]?: never })

type EmailLogin = { email: string; password: string }
type PhoneLogin = { phone: string; code: string }
type Login = XOR<EmailLogin, PhoneLogin>
// Must use either email/password OR phone/code, not both

// Mutable (remove readonly)
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

// Get object values as union
type ValueOf<T> = T[keyof T]

const Status = {
  Pending: 'pending',
  Active: 'active',
  Completed: 'completed'
} as const

type StatusValues = ValueOf<typeof Status>
// Type: 'pending' | 'active' | 'completed'

// Awaited type (built-in in TS 4.5+)
type Awaited<T> = T extends Promise<infer U> ? U : T

type PromiseString = Promise<string>
type StringType = Awaited<PromiseString>  // string`,
      explanation: 'Custom utility types combine built-in utilities to create powerful, reusable type transformations specific to your domain.'
    }
  ]

  return (
    <div className="pattern-page">
      <header className="page-header">
        <h1>Utility Types</h1>
        <p className="page-description">
          TypeScript provides powerful built-in utility types for common type transformations. 
          Learn to use and create utility types for cleaner, more maintainable code.
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
          <span className="example-badge badge-intermediate">Practical</span>
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
          <h3>Composition Power</h3>
          <p>
            Utility types can be composed together to create complex type transformations. 
            Start with simple utilities and combine them for advanced patterns.
          </p>
        </div>

        <div className="concept-card">
          <h3>Type Safety</h3>
          <p>
            Utility types help enforce constraints at compile time, catching errors before 
            runtime and providing better IntelliSense support.
          </p>
        </div>

        <div className="concept-card">
          <h3>DRY Principle</h3>
          <p>
            Instead of repeating type definitions, use utility types to derive new types 
            from existing ones, keeping your code DRY and maintainable.
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
      `}</style>
    </div>
  )
}

export default UtilityTypesPage