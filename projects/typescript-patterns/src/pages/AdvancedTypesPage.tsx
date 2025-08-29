import React, { useState } from 'react'

const AdvancedTypesPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Mapped Types',
      code: `// Basic mapped type
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Advanced mapped types with transformations
type Getters<T> = {
  [P in keyof T as \`get\${Capitalize<P & string>}\`]: () => T[P]
}

type Setters<T> = {
  [P in keyof T as \`set\${Capitalize<P & string>}\`]: (value: T[P]) => void
}

interface Person {
  name: string
  age: number
  email: string
}

type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number; getEmail: () => string }

type PersonSetters = Setters<Person>
// { setName: (value: string) => void; setAge: (value: number) => void; ... }

// Key remapping with filtering
type RemovePrefix<T, Prefix extends string> = {
  [P in keyof T as P extends \`\${Prefix}\${infer Rest}\` ? Rest : P]: T[P]
}

interface PrefixedData {
  _id: string
  _name: string
  _private: boolean
  public: string
}

type CleanData = RemovePrefix<PrefixedData, '_'>
// { id: string; name: string; private: boolean; public: string }

// Conditional mapped types
type NullableKeys<T> = {
  [P in keyof T]: null extends T[P] ? P : never
}[keyof T]

type NonNullableKeys<T> = {
  [P in keyof T]: null extends T[P] ? never : P
}[keyof T]

interface User {
  id: number
  name: string
  bio?: string | null
  avatar?: string | null
}

type UserNullableKeys = NullableKeys<User>     // "bio" | "avatar"
type UserNonNullableKeys = NonNullableKeys<User> // "id" | "name"`,
      explanation: 'Mapped types transform properties of existing types, allowing powerful type transformations and key remapping.'
    },
    {
      title: 'Template Literal Types',
      code: `// Basic template literal types
type EventName = 'click' | 'focus' | 'blur'
type EventHandler = \`on\${Capitalize<EventName>}\`
// "onClick" | "onFocus" | "onBlur"

// String pattern matching
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Endpoint = '/users' | '/posts' | '/comments'
type APIRoute = \`\${HTTPMethod} \${Endpoint}\`
// "GET /users" | "GET /posts" | ... | "DELETE /comments"

// CSS units
type CSSValue = \`\${number}px\` | \`\${number}%\` | \`\${number}rem\` | 'auto'

interface Styles {
  width: CSSValue
  height: CSSValue
  margin: CSSValue
}

const styles: Styles = {
  width: '100px',
  height: '50%',
  margin: 'auto'
}

// Complex string transformations
type PropEventSource<T> = {
  on<K extends keyof T & string>(
    eventName: \`\${K}Changed\`,
    callback: (newValue: T[K]) => void
  ): void
}

interface Settings {
  theme: 'light' | 'dark'
  fontSize: number
  autoSave: boolean
}

declare const settings: PropEventSource<Settings>
settings.on('themeChanged', (newTheme) => {}) // newTheme: 'light' | 'dark'
settings.on('fontSizeChanged', (size) => {})   // size: number

// Path autocomplete
type PathFor<T> = T extends object ? {
  [K in keyof T & string]: T[K] extends object 
    ? K | \`\${K}.\${PathFor<T[K]>}\`
    : K
}[keyof T & string] : never

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
  }
}

type ConfigPath = PathFor<Config>
// "server" | "database" | "server.host" | "server.port" | "server.ssl" | ...

function get(config: Config, path: ConfigPath): any {
  // Implementation
}`,
      explanation: 'Template literal types enable string manipulation at the type level, creating powerful string pattern matching and transformation.'
    },
    {
      title: 'Recursive Types',
      code: `// Recursive data structures
type LinkedList<T> = {
  value: T
  next: LinkedList<T> | null
}

const list: LinkedList<number> = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: null
    }
  }
}

// Deep nested objects
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? T[P] extends Function 
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

// JSON type definition
type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray

interface JSONObject {
  [key: string]: JSONValue
}

interface JSONArray extends Array<JSONValue> {}

// Tree structures
interface TreeNode<T> {
  value: T
  children: TreeNode<T>[]
}

type Tree<T> = TreeNode<T> | null

// Flattening nested arrays
type Flatten<T> = T extends Array<infer U>
  ? Flatten<U>
  : T

type Nested = number[][][][]
type Flat = Flatten<Nested>  // number

// Recursive path types
type Paths<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? Paths<T[K], P extends '' ? K : \`\${P}.\${K}\`> | (P extends '' ? K : \`\${P}.\${K}\`)
        : P extends '' ? K : \`\${P}.\${K}\`
    }[keyof T & string]
  : never

// Tuple to union recursively
type TupleToUnion<T extends readonly any[]> = T extends readonly [infer Head, ...infer Tail]
  ? Head | TupleToUnion<Tail>
  : never

type Union = TupleToUnion<[1, 2, 3, 'a', 'b']>  // 1 | 2 | 3 | 'a' | 'b'`,
      explanation: 'Recursive types reference themselves in their definition, enabling modeling of nested and tree-like data structures.'
    },
    {
      title: 'Variadic Tuple Types',
      code: `// Variadic tuple patterns
type Concat<T extends any[], U extends any[]> = [...T, ...U]

type A = [1, 2]
type B = [3, 4]
type C = Concat<A, B>  // [1, 2, 3, 4]

// Function composition with variadic tuples
type ExtractParameters<T extends any[]> = T extends [
  (...args: infer P) => any,
  ...infer Rest
] ? [P, ...ExtractParameters<Rest>] : []

type ExtractReturns<T extends any[]> = T extends [
  (...args: any[]) => infer R,
  ...infer Rest
] ? [R, ...ExtractReturns<Rest>] : []

// Zip function type
type Zip<T extends any[], U extends any[]> = T extends [infer TH, ...infer TT]
  ? U extends [infer UH, ...infer UT]
    ? [[TH, UH], ...Zip<TT, UT>]
    : []
  : []

type Zipped = Zip<[1, 2, 3], ['a', 'b', 'c']>
// [[1, 'a'], [2, 'b'], [3, 'c']]

// Head and Tail operations
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never
type Tail<T extends any[]> = T extends [any, ...infer T] ? T : []
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never

// Length of tuple
type Length<T extends readonly any[]> = T['length']

type Len = Length<[1, 2, 3, 4, 5]>  // 5

// Building tuples of specific length
type Tuple<N extends number, T = any, R extends T[] = []> = 
  R['length'] extends N ? R : Tuple<N, T, [...R, T]>

type FiveBooleans = Tuple<5, boolean>  // [boolean, boolean, boolean, boolean, boolean]

// Optional and rest parameters
type OptionalTuple<T extends any[]> = Partial<T>
type RequiredTuple<T extends any[]> = Required<T>

function processItems<T extends any[]>(...items: T): T {
  return items
}

const result = processItems(1, 'hello', true)  // [number, string, boolean]`,
      explanation: 'Variadic tuple types allow manipulation of tuple types with spread operators, enabling type-safe array operations.'
    },
    {
      title: 'Type Inference in Conditional Types',
      code: `// Basic inference
type UnpackPromise<T> = T extends Promise<infer U> ? U : T

type A = UnpackPromise<Promise<string>>  // string
type B = UnpackPromise<number>           // number

// Multiple inference positions
type UnpackFunction<T> = T extends (...args: infer A) => infer R
  ? { args: A; return: R }
  : never

type FuncInfo = UnpackFunction<(a: string, b: number) => boolean>
// { args: [string, number]; return: boolean }

// Inference with constraints
type GetValueType<T> = T extends { value: infer V } ? V : never

type Val1 = GetValueType<{ value: string }>      // string
type Val2 = GetValueType<{ value: number[] }>    // number[]
type Val3 = GetValueType<{ name: string }>       // never

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never

type Arr = ToArray<string | number>  // string[] | number[]

// Non-distributive (using tuple)
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never

type ArrNonDist = ToArrayNonDist<string | number>  // (string | number)[]

// Pattern matching with inference
type ExtractType<T, U> = T extends U ? T : never
type ExcludeType<T, U> = T extends U ? never : T

type Strings = ExtractType<'a' | 'b' | 1 | 2, string>  // 'a' | 'b'
type Numbers = ExcludeType<'a' | 'b' | 1 | 2, string>  // 1 | 2

// Complex inference patterns
type PromiseReturnType<T extends (...args: any[]) => any> = 
  ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>

async function fetchUser(): Promise<{ name: string }> {
  return { name: 'Alice' }
}

function getNumber(): number {
  return 42
}

type UserType = PromiseReturnType<typeof fetchUser>  // { name: string }
type NumType = PromiseReturnType<typeof getNumber>   // number`,
      explanation: 'Type inference in conditional types extracts types from generic patterns, enabling powerful type extraction and transformation.'
    },
    {
      title: 'Intersection & Union Advanced Patterns',
      code: `// Union to intersection conversion
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void ? I : never

type Union = { a: string } | { b: number } | { c: boolean }
type Intersection = UnionToIntersection<Union>
// { a: string } & { b: number } & { c: boolean }

// Discriminated union exhaustiveness
type Status = 
  | { type: 'loading' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error }

function assertNever(x: never): never {
  throw new Error('Unexpected value: ' + x)
}

function handleStatus(status: Status) {
  switch (status.type) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return status.data
    case 'error':
      return status.error.message
    default:
      return assertNever(status)  // Ensures exhaustiveness
  }
}

// Merge types with conflict resolution
type Merge<T, U> = Omit<T, keyof U> & U

interface Default {
  id: number
  name: string
  active: boolean
}

interface Override {
  name: string  // Different type allowed
  email: string
}

type Merged = Merge<Default, Override>
// { id: number; active: boolean; name: string; email: string }

// XOR (Exclusive OR) type
type XOR<T, U> = T | U extends object 
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }

type EitherOr = XOR<
  { email: string; password: string },
  { phone: string; otp: string }
>

// Must provide either email/password OR phone/otp, not both
const login1: EitherOr = { email: 'a@b.com', password: '123' }  // OK
const login2: EitherOr = { phone: '555-1234', otp: '9876' }     // OK
// const login3: EitherOr = { email: 'a@b.com', phone: '555' }  // Error

// Tagged unions with shared fields
type Tagged<T extends Record<string, any>> = {
  [K in keyof T]: { type: K } & T[K]
}[keyof T]

type Events = Tagged<{
  click: { x: number; y: number }
  key: { key: string; shift: boolean }
  scroll: { delta: number }
}>

// Generates:
// | { type: 'click'; x: number; y: number }
// | { type: 'key'; key: string; shift: boolean }
// | { type: 'scroll'; delta: number }`,
      explanation: 'Advanced union and intersection patterns enable complex type compositions and discriminated union handling.'
    }
  ]

  return (
    <div className="pattern-page">
      <header className="page-header">
        <h1>Advanced Types</h1>
        <p className="page-description">
          Explore TypeScript's most powerful type system features: mapped types, template literals, 
          recursive types, and advanced type manipulation patterns.
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
          <span className="example-badge badge-advanced">Expert</span>
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
          <h3>Type-Level Programming</h3>
          <p>
            These patterns enable computation at the type level, creating types that adapt 
            based on input types and constraints.
          </p>
        </div>

        <div className="concept-card">
          <h3>Performance Impact</h3>
          <p>
            Complex types can increase compilation time. Balance type safety with 
            compilation performance in large codebases.
          </p>
        </div>

        <div className="concept-card">
          <h3>Real-World Usage</h3>
          <p>
            These patterns power libraries like Prisma, tRPC, and Zod, providing 
            incredible type safety and developer experience.
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

export default AdvancedTypesPage