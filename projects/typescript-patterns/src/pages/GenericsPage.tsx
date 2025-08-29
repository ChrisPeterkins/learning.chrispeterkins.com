import React, { useState } from 'react'

const GenericsPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Basic Generic Functions',
      code: `// Generic function for type-safe array operations
function first<T>(items: T[]): T | undefined {
  return items[0]
}

function last<T>(items: T[]): T | undefined {
  return items[items.length - 1]
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key])
}

// Usage with type inference
const numbers = [1, 2, 3, 4, 5]
const firstNumber = first(numbers)  // number | undefined

const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 }
]
const names = pluck(users, 'name')  // string[]
const ages = pluck(users, 'age')    // number[]`,
      explanation: 'Generic functions allow you to write reusable code that works with different types while maintaining type safety.'
    },
    {
      title: 'Generic Constraints',
      code: `// Constraining generic types
interface HasLength {
  length: number
}

function logLength<T extends HasLength>(item: T): T {
  console.log(\`Length: \${item.length}\`)
  return item
}

// Works with any type that has a length property
logLength('hello')           // string has length
logLength([1, 2, 3])        // array has length
logLength({ length: 10 })   // object with length
// logLength(123)           // Error: number doesn't have length

// Multiple constraints
interface Timestamped {
  timestamp: Date
}

interface Named {
  name: string
}

function processEntity<T extends Timestamped & Named>(entity: T): T {
  console.log(\`Processing \${entity.name} at \${entity.timestamp}\`)
  return entity
}

// Using keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const person = { name: 'Alice', age: 30, city: 'NYC' }
const name = getProperty(person, 'name')     // string
const age = getProperty(person, 'age')       // number
// getProperty(person, 'invalid')            // Error: 'invalid' is not a key`,
      explanation: 'Generic constraints use the extends keyword to limit which types can be used with a generic, ensuring certain properties or methods exist.'
    },
    {
      title: 'Generic Classes',
      code: `// Generic class for type-safe data structures
class Stack<T> {
  private items: T[] = []
  
  push(item: T): void {
    this.items.push(item)
  }
  
  pop(): T | undefined {
    return this.items.pop()
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }
  
  isEmpty(): boolean {
    return this.items.length === 0
  }
}

// Type-safe stacks for different types
const numberStack = new Stack<number>()
numberStack.push(1)
numberStack.push(2)
const num = numberStack.pop()  // number | undefined

const stringStack = new Stack<string>()
stringStack.push('hello')
stringStack.push('world')
const str = stringStack.pop()  // string | undefined

// Generic class with multiple type parameters
class Pair<T, U> {
  constructor(
    public first: T,
    public second: U
  ) {}
  
  swap(): Pair<U, T> {
    return new Pair(this.second, this.first)
  }
  
  map<V>(fn: (first: T, second: U) => V): V {
    return fn(this.first, this.second)
  }
}

const pair = new Pair('hello', 42)
const swapped = pair.swap()  // Pair<number, string>
const combined = pair.map((a, b) => \`\${a}: \${b}\`)  // string`,
      explanation: 'Generic classes enable creating reusable data structures that work with any type while maintaining type safety throughout.'
    },
    {
      title: 'Conditional Types',
      code: `// Conditional types for advanced type manipulation
type IsString<T> = T extends string ? true : false

type A = IsString<string>   // true
type B = IsString<number>   // false

// Extract types from arrays
type ElementType<T> = T extends (infer E)[] ? E : never

type NumElement = ElementType<number[]>     // number
type StrElement = ElementType<string[]>     // string
type NotArray = ElementType<string>         // never

// Extract return types
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

function getString(): string { return 'hello' }
function getNumber(): number { return 42 }

type StrReturn = ReturnType<typeof getString>  // string
type NumReturn = ReturnType<typeof getNumber>  // number

// Conditional type with union distribution
type NonNullable<T> = T extends null | undefined ? never : T

type MaybeString = string | null | undefined
type DefiniteString = NonNullable<MaybeString>  // string

// Nested conditionals
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends Function ? 'function' :
  T extends object ? 'object' :
  'unknown'

type T1 = TypeName<string>    // 'string'
type T2 = TypeName<() => void> // 'function'
type T3 = TypeName<{}>        // 'object'`,
      explanation: 'Conditional types allow you to create types that depend on other types, enabling powerful type-level programming.'
    },
    {
      title: 'Generic Utility Functions',
      code: `// Building powerful generic utilities
// Deep partial type
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

interface Config {
  server: {
    host: string
    port: number
    ssl: {
      enabled: boolean
      cert: string
    }
  }
  database: {
    url: string
    poolSize: number
  }
}

const partialConfig: DeepPartial<Config> = {
  server: {
    ssl: {
      enabled: true
      // cert is optional
    }
  }
  // database is optional
}

// Type-safe object paths
type Path<T> = T extends object ? {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? K | \`\${K}.\${Path<T[K]>}\`
      : K
    : never
}[keyof T] : never

type ConfigPaths = Path<Config>
// "server" | "database" | "server.host" | "server.port" | "server.ssl" | ...

// Generic memoization
function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

const expensiveCalc = (n: number): number => {
  console.log('Calculating...')
  return n * n
}

const memoizedCalc = memoize(expensiveCalc)
memoizedCalc(5)  // Logs: "Calculating..."
memoizedCalc(5)  // Returns cached result`,
      explanation: 'Advanced generic patterns enable creating sophisticated type-safe utilities that can transform and manipulate types at compile time.'
    },
    {
      title: 'Generic Type Inference',
      code: `// Advanced type inference with generics
// Infer array element types
function groupBy<T, K extends keyof T>(
  items: T[],
  key: K
): Record<T[K] extends PropertyKey ? T[K] : string, T[]> {
  return items.reduce((groups, item) => {
    const groupKey = String(item[key])
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(item)
    return groups
  }, {} as any)
}

const users = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'admin' }
]

const byRole = groupBy(users, 'role')
// Type: Record<string, typeof users[0][]>
// byRole.admin and byRole.user are typed arrays

// Builder pattern with type inference
class QueryBuilder<T = {}> {
  private query: T
  
  constructor(query: T = {} as T) {
    this.query = query
  }
  
  where<K extends string, V>(
    key: K,
    value: V
  ): QueryBuilder<T & Record<K, V>> {
    return new QueryBuilder({
      ...this.query,
      [key]: value
    } as T & Record<K, V>)
  }
  
  build(): T {
    return this.query
  }
}

const query = new QueryBuilder()
  .where('name', 'Alice')
  .where('age', 30)
  .where('active', true)
  .build()
// Type is inferred as: { name: string, age: number, active: boolean }

// Function composition with generics
function pipe<A, B>(
  fn1: (a: A) => B
): (a: A) => B
function pipe<A, B, C>(
  fn1: (a: A) => B,
  fn2: (b: B) => C
): (a: A) => C
function pipe<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): (a: A) => D
function pipe(...fns: Function[]) {
  return (x: any) => fns.reduce((v, f) => f(v), x)
}

const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const toString = (n: number) => n.toString()

const process = pipe(addOne, double, toString)
const result = process(5)  // "12" (typed as string)`,
      explanation: 'TypeScript can often infer generic types from usage, creating powerful patterns where types flow through transformations automatically.'
    }
  ]

  return (
    <div className="pattern-page">
      <header className="page-header">
        <h1>Generic Patterns</h1>
        <p className="page-description">
          Generics are the foundation of reusable, type-safe code in TypeScript. Master generic 
          functions, classes, constraints, and conditional types to write flexible abstractions.
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
          <span className="example-badge badge-intermediate">Intermediate</span>
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
          <h3>Generic Best Practices</h3>
          <p>
            Use meaningful type parameter names (T for generic, K for keys, V for values). 
            Provide constraints when needed. Let TypeScript infer types when possible.
          </p>
        </div>

        <div className="concept-card">
          <h3>Common Use Cases</h3>
          <p>
            Data structures (lists, trees, maps), API wrappers, state management, 
            form validation, and utility functions.
          </p>
        </div>

        <div className="concept-card">
          <h3>Performance Note</h3>
          <p>
            Generics have zero runtime overhead - they're purely a compile-time feature 
            that gets erased in the JavaScript output.
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

export default GenericsPage