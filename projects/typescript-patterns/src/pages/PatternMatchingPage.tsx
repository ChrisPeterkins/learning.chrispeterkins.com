import React, { useState } from 'react'

const PatternMatchingPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Exhaustive Pattern Matching',
      code: `// Discriminated union for pattern matching
type Result<T, E = Error> = 
  | { type: 'success'; value: T }
  | { type: 'failure'; error: E }
  | { type: 'pending' }

function match<T, E, R>(
  result: Result<T, E>,
  patterns: {
    success: (value: T) => R
    failure: (error: E) => R
    pending: () => R
  }
): R {
  switch (result.type) {
    case 'success':
      return patterns.success(result.value)
    case 'failure':
      return patterns.failure(result.error)
    case 'pending':
      return patterns.pending()
    default:
      const _exhaustive: never = result
      throw new Error(\`Unhandled case: \${_exhaustive}\`)
  }
}

// Usage
const apiResult: Result<string> = { type: 'success', value: 'Data loaded' }

const message = match(apiResult, {
  success: (value) => \`Success: \${value}\`,
  failure: (error) => \`Error: \${error.message}\`,
  pending: () => 'Loading...'
})

// Pattern matching with guards
type Action = 
  | { type: 'increment'; amount: number }
  | { type: 'decrement'; amount: number }
  | { type: 'reset' }
  | { type: 'set'; value: number }

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment':
      return state + action.amount
    case 'decrement':
      return state - action.amount
    case 'reset':
      return 0
    case 'set':
      return action.value
    default:
      const _exhaustive: never = action
      return state
  }
}`,
      explanation: 'Exhaustive pattern matching ensures all cases are handled at compile time, preventing runtime errors from missing cases.'
    },
    {
      title: 'Pattern Matching Library',
      code: `// Building a pattern matching library
type Pattern<T> = {
  [K in keyof T]: (value: T[K]) => any
}

class Matcher<T> {
  constructor(private value: T) {}
  
  when<K extends keyof T, R>(
    key: K,
    handler: (value: T[K]) => R
  ): R | null {
    if (key in this.value) {
      return handler((this.value as any)[key])
    }
    return null
  }
  
  match<R>(patterns: Partial<Pattern<T>> & { _: () => R }): R {
    for (const key in patterns) {
      if (key === '_') continue
      if (key in this.value) {
        return patterns[key]!((this.value as any)[key])
      }
    }
    return patterns._()
  }
}

// Advanced pattern matching with type predicates
type Extractor<T, U> = (value: T) => U | undefined

function match<T, R>(
  value: T,
  ...patterns: Array<[((v: T) => boolean) | Extractor<T, any>, (v: any) => R] | (() => R)>
): R {
  for (const pattern of patterns) {
    if (typeof pattern === 'function') {
      return pattern()
    }
    
    const [predicate, handler] = pattern
    if (typeof predicate === 'function') {
      const result = predicate(value)
      if (typeof result === 'boolean' && result) {
        return handler(value)
      } else if (result !== undefined) {
        return handler(result)
      }
    }
  }
  
  throw new Error('No pattern matched')
}

// Usage
const value: unknown = { type: 'user', name: 'Alice' }

const result = match(
  value,
  [
    (v): v is string => typeof v === 'string',
    (s) => \`String: \${s}\`
  ],
  [
    (v): v is number => typeof v === 'number',
    (n) => \`Number: \${n}\`
  ],
  [
    (v): v is { type: string } => typeof v === 'object' && v !== null && 'type' in v,
    (obj) => \`Object with type: \${obj.type}\`
  ],
  () => 'Unknown type'
)`,
      explanation: 'Pattern matching libraries provide functional programming style pattern matching similar to languages like Rust or Haskell.'
    },
    {
      title: 'Visitor Pattern',
      code: `// Visitor pattern for AST processing
type Expression = 
  | { kind: 'literal'; value: number }
  | { kind: 'variable'; name: string }
  | { kind: 'binary'; operator: '+' | '-' | '*' | '/'; left: Expression; right: Expression }
  | { kind: 'unary'; operator: '-' | '!'; operand: Expression }
  | { kind: 'call'; func: string; args: Expression[] }

interface Visitor<R> {
  visitLiteral(value: number): R
  visitVariable(name: string): R
  visitBinary(operator: string, left: R, right: R): R
  visitUnary(operator: string, operand: R): R
  visitCall(func: string, args: R[]): R
}

function visit<R>(expr: Expression, visitor: Visitor<R>): R {
  switch (expr.kind) {
    case 'literal':
      return visitor.visitLiteral(expr.value)
    
    case 'variable':
      return visitor.visitVariable(expr.name)
    
    case 'binary':
      return visitor.visitBinary(
        expr.operator,
        visit(expr.left, visitor),
        visit(expr.right, visitor)
      )
    
    case 'unary':
      return visitor.visitUnary(
        expr.operator,
        visit(expr.operand, visitor)
      )
    
    case 'call':
      return visitor.visitCall(
        expr.func,
        expr.args.map(arg => visit(arg, visitor))
      )
    
    default:
      const _exhaustive: never = expr
      throw new Error('Unhandled expression kind')
  }
}

// Evaluator visitor
const evaluator: Visitor<number> = {
  visitLiteral: (value) => value,
  visitVariable: (name) => {
    // Look up variable value
    const vars: Record<string, number> = { x: 10, y: 20 }
    return vars[name] || 0
  },
  visitBinary: (op, left, right) => {
    switch (op) {
      case '+': return left + right
      case '-': return left - right
      case '*': return left * right
      case '/': return left / right
      default: return 0
    }
  },
  visitUnary: (op, operand) => {
    switch (op) {
      case '-': return -operand
      case '!': return operand === 0 ? 1 : 0
      default: return operand
    }
  },
  visitCall: (func, args) => {
    switch (func) {
      case 'max': return Math.max(...args)
      case 'min': return Math.min(...args)
      default: return 0
    }
  }
}

// Pretty printer visitor
const printer: Visitor<string> = {
  visitLiteral: (value) => value.toString(),
  visitVariable: (name) => name,
  visitBinary: (op, left, right) => \`(\${left} \${op} \${right})\`,
  visitUnary: (op, operand) => \`\${op}\${operand}\`,
  visitCall: (func, args) => \`\${func}(\${args.join(', ')})\`
}`,
      explanation: 'The visitor pattern provides a way to separate operations from data structures, enabling extensible processing of complex types.'
    },
    {
      title: 'State Machine Pattern',
      code: `// Type-safe state machine
type State = 
  | { type: 'idle' }
  | { type: 'loading'; startTime: number }
  | { type: 'success'; data: string; loadTime: number }
  | { type: 'error'; error: Error; retries: number }

type Event =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: string }
  | { type: 'FAILURE'; error: Error }
  | { type: 'RETRY' }
  | { type: 'RESET' }

// State transition function with exhaustive checking
function transition(state: State, event: Event): State {
  switch (state.type) {
    case 'idle':
      switch (event.type) {
        case 'FETCH':
          return { type: 'loading', startTime: Date.now() }
        default:
          return state
      }
    
    case 'loading':
      switch (event.type) {
        case 'SUCCESS':
          return {
            type: 'success',
            data: event.data,
            loadTime: Date.now() - state.startTime
          }
        case 'FAILURE':
          return { type: 'error', error: event.error, retries: 0 }
        case 'RESET':
          return { type: 'idle' }
        default:
          return state
      }
    
    case 'success':
      switch (event.type) {
        case 'FETCH':
          return { type: 'loading', startTime: Date.now() }
        case 'RESET':
          return { type: 'idle' }
        default:
          return state
      }
    
    case 'error':
      switch (event.type) {
        case 'RETRY':
          return { type: 'loading', startTime: Date.now() }
        case 'RESET':
          return { type: 'idle' }
        case 'FAILURE':
          return { ...state, retries: state.retries + 1 }
        default:
          return state
      }
    
    default:
      const _exhaustive: never = state
      return state
  }
}

// Type-safe event emitter
class StateMachine<S, E> {
  constructor(
    private state: S,
    private transition: (state: S, event: E) => S
  ) {}
  
  send(event: E): S {
    this.state = this.transition(this.state, event)
    return this.state
  }
  
  getState(): S {
    return this.state
  }
  
  matches<T extends S['type']>(
    type: T
  ): this is StateMachine<Extract<S, { type: T }>, E> {
    return (this.state as any).type === type
  }
}

// Usage with type inference
const machine = new StateMachine<State, Event>(
  { type: 'idle' },
  transition
)

machine.send({ type: 'FETCH' })
if (machine.matches('loading')) {
  // TypeScript knows state is loading
  console.log('Loading started at:', machine.getState().startTime)
}`,
      explanation: 'State machines with TypeScript provide compile-time guarantees about valid state transitions and event handling.'
    },
    {
      title: 'Railway-Oriented Programming',
      code: `// Railway-oriented programming pattern
type Success<T> = { type: 'success'; value: T }
type Failure<E> = { type: 'failure'; error: E }
type Result<T, E = Error> = Success<T> | Failure<E>

// Result constructors
const Ok = <T>(value: T): Success<T> => ({ type: 'success', value })
const Err = <E>(error: E): Failure<E> => ({ type: 'failure', error })

// Result methods
class ResultWrapper<T, E> {
  constructor(private result: Result<T, E>) {}
  
  map<U>(fn: (value: T) => U): ResultWrapper<U, E> {
    if (this.result.type === 'success') {
      return new ResultWrapper(Ok(fn(this.result.value)))
    }
    return new ResultWrapper(this.result as Failure<E>)
  }
  
  flatMap<U>(fn: (value: T) => Result<U, E>): ResultWrapper<U, E> {
    if (this.result.type === 'success') {
      return new ResultWrapper(fn(this.result.value))
    }
    return new ResultWrapper(this.result as Failure<E>)
  }
  
  mapError<F>(fn: (error: E) => F): ResultWrapper<T, F> {
    if (this.result.type === 'failure') {
      return new ResultWrapper(Err(fn(this.result.error)))
    }
    return new ResultWrapper(this.result as Success<T>)
  }
  
  unwrapOr(defaultValue: T): T {
    return this.result.type === 'success' ? this.result.value : defaultValue
  }
  
  match<R>(patterns: { success: (value: T) => R; failure: (error: E) => R }): R {
    return this.result.type === 'success'
      ? patterns.success(this.result.value)
      : patterns.failure(this.result.error)
  }
}

// Railway-oriented composition
function parseNumber(input: string): Result<number, string> {
  const num = Number(input)
  return isNaN(num) ? Err(\`Invalid number: \${input}\`) : Ok(num)
}

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? Err('Division by zero') : Ok(a / b)
}

function sqrt(n: number): Result<number, string> {
  return n < 0 ? Err('Cannot take square root of negative number') : Ok(Math.sqrt(n))
}

// Composing operations
function calculate(input1: string, input2: string): Result<number, string> {
  return new ResultWrapper(parseNumber(input1))
    .flatMap(a => 
      new ResultWrapper(parseNumber(input2))
        .flatMap(b => divide(a, b))
        .flatMap(sqrt)
        .result
    )
    .result
}

// Usage
const result = calculate('100', '4')
const message = new ResultWrapper(result).match({
  success: (value) => \`Result: \${value}\`,
  failure: (error) => \`Error: \${error}\`
})`,
      explanation: 'Railway-oriented programming treats success and failure as two parallel tracks, composing operations that might fail elegantly.'
    },
    {
      title: 'ADT (Algebraic Data Types)',
      code: `// Algebraic Data Types pattern
// Sum types (discriminated unions)
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number }

// Product types (records)
type Point = { x: number; y: number }
type ColoredShape = Shape & { color: string; position: Point }

// Option/Maybe type
type Option<T> = { type: 'some'; value: T } | { type: 'none' }

const Some = <T>(value: T): Option<T> => ({ type: 'some', value })
const None = <T>(): Option<T> => ({ type: 'none' })

// Either type
type Either<L, R> = { type: 'left'; value: L } | { type: 'right'; value: R }

const Left = <L>(value: L): Either<L, never> => ({ type: 'left', value })
const Right = <R>(value: R): Either<never, R> => ({ type: 'right', value })

// List type (recursive ADT)
type List<T> = { type: 'nil' } | { type: 'cons'; head: T; tail: List<T> }

const Nil = <T>(): List<T> => ({ type: 'nil' })
const Cons = <T>(head: T, tail: List<T>): List<T> => ({
  type: 'cons',
  head,
  tail
})

// Pattern matching on ADTs
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return (shape.base * shape.height) / 2
    default:
      const _exhaustive: never = shape
      throw new Error('Unknown shape')
  }
}

// Functor pattern
function mapOption<A, B>(option: Option<A>, fn: (a: A) => B): Option<B> {
  switch (option.type) {
    case 'some':
      return Some(fn(option.value))
    case 'none':
      return None()
  }
}

// Fold/reduce for lists
function fold<T, R>(
  list: List<T>,
  initial: R,
  fn: (acc: R, value: T) => R
): R {
  switch (list.type) {
    case 'nil':
      return initial
    case 'cons':
      return fold(list.tail, fn(initial, list.head), fn)
  }
}

// Example: Building and processing a list
const myList = Cons(1, Cons(2, Cons(3, Nil())))
const sum = fold(myList, 0, (acc, val) => acc + val)  // 6

// Tree ADT
type Tree<T> = 
  | { type: 'leaf'; value: T }
  | { type: 'branch'; left: Tree<T>; right: Tree<T> }

function mapTree<A, B>(tree: Tree<A>, fn: (a: A) => B): Tree<B> {
  switch (tree.type) {
    case 'leaf':
      return { type: 'leaf', value: fn(tree.value) }
    case 'branch':
      return {
        type: 'branch',
        left: mapTree(tree.left, fn),
        right: mapTree(tree.right, fn)
      }
  }
}`,
      explanation: 'Algebraic Data Types combine sum types (unions) and product types (tuples/records) to model complex domains with type safety.'
    }
  ]

  return (
    <div className="pattern-page">
      <header className="page-header">
        <h1>Pattern Matching</h1>
        <p className="page-description">
          Implement functional programming patterns in TypeScript with exhaustive pattern matching, 
          discriminated unions, and algebraic data types for robust, maintainable code.
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
          <span className="example-badge badge-advanced">Functional</span>
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
          <h3>Why Pattern Matching?</h3>
          <p>
            Pattern matching eliminates entire classes of bugs by ensuring all cases are 
            handled at compile time, making refactoring safer and code more maintainable.
          </p>
        </div>

        <div className="concept-card">
          <h3>Libraries to Explore</h3>
          <p>
            Check out ts-pattern for advanced pattern matching, fp-ts for functional 
            programming patterns, and zod for schema validation with pattern matching.
          </p>
        </div>

        <div className="concept-card">
          <h3>Future of TypeScript</h3>
          <p>
            Pattern matching is being considered for future ECMAScript versions, which 
            would bring native pattern matching to JavaScript and TypeScript.
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

export default PatternMatchingPage