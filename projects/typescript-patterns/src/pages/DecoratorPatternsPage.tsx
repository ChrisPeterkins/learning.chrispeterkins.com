import React, { useState } from 'react'

const DecoratorPatternsPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Class Decorators',
      code: `// Class decorator for adding metadata
function Entity(tableName: string) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static tableName = tableName
      static createdAt = new Date()
      
      getTableName() {
        return tableName
      }
    }
  }
}

// Sealed decorator to prevent modifications
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

// Component decorator with configuration
interface ComponentConfig {
  selector: string
  template: string
  styles?: string[]
}

function Component(config: ComponentConfig) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      selector = config.selector
      template = config.template
      styles = config.styles || []
      
      render() {
        console.log(\`Rendering \${config.selector}\`)
        return config.template
      }
    }
  }
}

// Usage
@Entity('users')
@sealed
class User {
  constructor(public name: string, public email: string) {}
}

@Component({
  selector: 'app-header',
  template: '<header>{{ title }}</header>',
  styles: ['header { background: blue; }']
})
class HeaderComponent {
  title = 'My App'
}`,
      explanation: 'Class decorators modify or enhance classes at declaration time, adding metadata, methods, or modifying the constructor.'
    },
    {
      title: 'Method Decorators',
      code: `// Method decorator for logging
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${propertyKey} with args:\`, args)
    const result = originalMethod.apply(this, args)
    console.log(\`Result:\`, result)
    return result
  }
  
  return descriptor
}

// Timing decorator
function timed(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    const result = originalMethod.apply(this, args)
    const end = performance.now()
    console.log(\`\${propertyKey} took \${end - start}ms\`)
    return result
  }
}

// Memoization decorator
function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const cache = new Map()
  
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = originalMethod.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// Validation decorator
function validate(validator: (args: any[]) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function (...args: any[]) {
      if (!validator(args)) {
        throw new Error(\`Invalid arguments for \${propertyKey}\`)
      }
      return originalMethod.apply(this, args)
    }
  }
}

// Usage
class Calculator {
  @log
  @timed
  add(a: number, b: number): number {
    return a + b
  }
  
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
  
  @validate(args => args.every(arg => typeof arg === 'number'))
  multiply(a: number, b: number): number {
    return a * b
  }
}`,
      explanation: 'Method decorators modify method behavior, adding logging, timing, caching, validation, or other cross-cutting concerns.'
    },
    {
      title: 'Property Decorators',
      code: `// Property decorator for validation
function required(target: any, propertyKey: string) {
  let value: any
  
  const getter = () => value
  const setter = (newValue: any) => {
    if (newValue === null || newValue === undefined || newValue === '') {
      throw new Error(\`\${propertyKey} is required\`)
    }
    value = newValue
  }
  
  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  })
}

// Range validation decorator
function range(min: number, max: number) {
  return function (target: any, propertyKey: string) {
    let value: number
    
    const setter = (newValue: number) => {
      if (newValue < min || newValue > max) {
        throw new Error(\`\${propertyKey} must be between \${min} and \${max}\`)
      }
      value = newValue
    }
    
    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: setter,
      enumerable: true,
      configurable: true
    })
  }
}

// Observable property decorator
function observable(target: any, propertyKey: string) {
  let value: any
  const observers: ((newValue: any) => void)[] = []
  
  Object.defineProperty(target, propertyKey, {
    get() {
      return value
    },
    set(newValue: any) {
      value = newValue
      observers.forEach(observer => observer(newValue))
    },
    enumerable: true,
    configurable: true
  })
  
  // Add observe method
  target[\`observe_\${propertyKey}\`] = function (observer: (value: any) => void) {
    observers.push(observer)
  }
}

// Format decorator
function format(formatter: (value: any) => string) {
  return function (target: any, propertyKey: string) {
    let value: any
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return formatter(value)
      },
      set(newValue: any) {
        value = newValue
      },
      enumerable: true,
      configurable: true
    })
  }
}

// Usage
class Person {
  @required
  name!: string
  
  @range(0, 150)
  age!: number
  
  @observable
  status!: string
  
  @format(value => value ? value.toUpperCase() : '')
  country!: string
}`,
      explanation: 'Property decorators add metadata or modify property behavior, enabling validation, observation, and transformation patterns.'
    },
    {
      title: 'Parameter Decorators',
      code: `// Parameter decorator for validation
function positive(target: any, propertyKey: string, parameterIndex: number) {
  const existingValidators = Reflect.getOwnMetadata('validators', target, propertyKey) || []
  existingValidators.push({
    index: parameterIndex,
    validator: (value: any) => {
      if (value <= 0) {
        throw new Error(\`Parameter at index \${parameterIndex} must be positive\`)
      }
    }
  })
  Reflect.defineMetadata('validators', existingValidators, target, propertyKey)
}

// Type checking decorator
function isString(target: any, propertyKey: string, parameterIndex: number) {
  const existingValidators = Reflect.getOwnMetadata('validators', target, propertyKey) || []
  existingValidators.push({
    index: parameterIndex,
    validator: (value: any) => {
      if (typeof value !== 'string') {
        throw new Error(\`Parameter at index \${parameterIndex} must be a string\`)
      }
    }
  })
  Reflect.defineMetadata('validators', existingValidators, target, propertyKey)
}

// Method decorator to apply parameter validators
function validateParams(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    const validators = Reflect.getOwnMetadata('validators', target, propertyKey) || []
    
    validators.forEach((v: any) => {
      v.validator(args[v.index])
    })
    
    return originalMethod.apply(this, args)
  }
}

// Inject decorator for dependency injection
const INJECT_METADATA_KEY = Symbol('INJECT_METADATA_KEY')

function inject(token: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const existingTokens = Reflect.getOwnMetadata(INJECT_METADATA_KEY, target, propertyKey) || []
    existingTokens[parameterIndex] = token
    Reflect.defineMetadata(INJECT_METADATA_KEY, existingTokens, target, propertyKey)
  }
}

// Usage
class BankAccount {
  balance = 1000
  
  @validateParams
  withdraw(
    @positive amount: number,
    @isString reason: string
  ): void {
    if (amount > this.balance) {
      throw new Error('Insufficient funds')
    }
    this.balance -= amount
    console.log(\`Withdrew \${amount} for \${reason}\`)
  }
}

// Dependency injection example
class Service {
  constructor(
    @inject('database') private db: any,
    @inject('logger') private logger: any
  ) {}
}`,
      explanation: 'Parameter decorators add metadata to function parameters, enabling validation, dependency injection, and other patterns.'
    },
    {
      title: 'Decorator Factories',
      code: `// Configurable decorator factory
function deprecated(message?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function (...args: any[]) {
      console.warn(\`Warning: \${propertyKey} is deprecated. \${message || ''}\`)
      return originalMethod.apply(this, args)
    }
  }
}

// Rate limiting decorator factory
function rateLimit(maxCalls: number, windowMs: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const calls: number[] = []
    
    descriptor.value = function (...args: any[]) {
      const now = Date.now()
      const recentCalls = calls.filter(time => now - time < windowMs)
      
      if (recentCalls.length >= maxCalls) {
        throw new Error(\`Rate limit exceeded for \${propertyKey}\`)
      }
      
      calls.push(now)
      return originalMethod.apply(this, args)
    }
  }
}

// Retry decorator factory
function retry(times: number = 3, delay: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error
      
      for (let i = 0; i < times; i++) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          lastError = error as Error
          console.log(\`Attempt \${i + 1} failed, retrying...\`)
          if (i < times - 1) {
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }
      
      throw lastError!
    }
  }
}

// Access control decorator factory
type Role = 'admin' | 'user' | 'guest'

function authorize(...roles: Role[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function (...args: any[]) {
      // Check user role (simplified)
      const userRole = (this as any).role
      if (!roles.includes(userRole)) {
        throw new Error(\`Unauthorized: requires one of \${roles.join(', ')}\`)
      }
      return originalMethod.apply(this, args)
    }
  }
}

// Usage
class API {
  role: Role = 'user'
  
  @deprecated('Use fetchDataV2 instead')
  fetchData() {
    return 'old data'
  }
  
  @rateLimit(5, 60000) // 5 calls per minute
  @retry(3, 1000)
  async apiCall() {
    // Simulated API call
    return fetch('/api/data')
  }
  
  @authorize('admin')
  deleteUser(id: number) {
    console.log(\`Deleting user \${id}\`)
  }
}`,
      explanation: 'Decorator factories are functions that return decorators, allowing configuration and customization of decorator behavior.'
    },
    {
      title: 'Metadata & Reflection',
      code: `// Using Reflect metadata API
import 'reflect-metadata'

// Define metadata keys
const VALIDATION_METADATA = Symbol('validation')
const SERIALIZATION_METADATA = Symbol('serialization')

// Validation metadata decorator
function validate(rules: any) {
  return Reflect.metadata(VALIDATION_METADATA, rules)
}

// Serialization control
function serializable(options?: { name?: string; transform?: (value: any) => any }) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(SERIALIZATION_METADATA, options || {}, target, propertyKey)
  }
}

// Type metadata decorator
function type(type: any) {
  return Reflect.metadata('design:type', type)
}

// Collecting metadata
function getValidationRules(target: any): any {
  return Reflect.getMetadata(VALIDATION_METADATA, target)
}

function getSerializableProperties(target: any): string[] {
  const properties: string[] = []
  
  for (const key of Object.keys(target)) {
    const metadata = Reflect.getMetadata(SERIALIZATION_METADATA, target, key)
    if (metadata !== undefined) {
      properties.push(key)
    }
  }
  
  return properties
}

// Auto-serialization using metadata
function serialize(obj: any): any {
  const result: any = {}
  
  for (const key of Object.keys(obj)) {
    const metadata = Reflect.getMetadata(SERIALIZATION_METADATA, obj, key)
    if (metadata) {
      const name = metadata.name || key
      const value = metadata.transform ? metadata.transform(obj[key]) : obj[key]
      result[name] = value
    }
  }
  
  return result
}

// Model with metadata
@validate({
  minLength: { name: 2 },
  required: ['name', 'email']
})
class User {
  @serializable({ name: 'user_id' })
  id!: number
  
  @serializable()
  @type(String)
  name!: string
  
  @serializable({ transform: (email: string) => email.toLowerCase() })
  email!: string
  
  @serializable({ name: 'created_at', transform: (date: Date) => date.toISOString() })
  createdAt!: Date
  
  // Not serializable
  password!: string
}

// Usage
const user = new User()
user.id = 1
user.name = 'Alice'
user.email = 'ALICE@EXAMPLE.COM'
user.createdAt = new Date()
user.password = 'secret'

const serialized = serialize(user)
// { user_id: 1, name: 'Alice', email: 'alice@example.com', created_at: '2024-...' }`,
      explanation: 'The Reflect metadata API enables powerful runtime introspection and metadata-driven programming patterns.'
    }
  ]

  return (
    <div className="pattern-page">
      <header className="page-header">
        <h1>Decorator Patterns</h1>
        <p className="page-description">
          Decorators provide a way to add annotations and modify classes, methods, properties, and 
          parameters. Enable experimental decorators to unlock powerful metaprogramming capabilities.
        </p>
      </header>

      <div className="decorator-config">
        <h3>Enable Decorators in tsconfig.json:</h3>
        <pre className="config-snippet">
{`{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}`}
        </pre>
      </div>

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
          <span className="example-badge badge-advanced">Advanced</span>
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
          <h3>Decorator Execution Order</h3>
          <p>
            Decorators execute bottom-to-top for evaluation and top-to-bottom for application. 
            Parameter decorators run before method decorators.
          </p>
        </div>

        <div className="concept-card">
          <h3>Common Use Cases</h3>
          <p>
            Logging, validation, caching, rate limiting, authorization, dependency injection, 
            and ORM mapping are common decorator patterns.
          </p>
        </div>

        <div className="concept-card">
          <h3>Production Note</h3>
          <p>
            Decorators are still experimental. For production, consider using well-tested 
            libraries like TypeORM, NestJS, or Angular that leverage decorators.
          </p>
        </div>
      </section>

      <style jsx>{`
        .pattern-page {
          max-width: 1200px;
        }

        .decorator-config {
          background: var(--code-bg);
          border: 1px solid var(--code-border);
          border-radius: 8px;
          padding: 1rem;
          margin: 2rem 0;
        }

        .decorator-config h3 {
          color: var(--accent-green-bright);
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .config-snippet {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
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

export default DecoratorPatternsPage