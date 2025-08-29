import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>TypeScript Patterns</h1>
        <p className="page-description">
          Master advanced TypeScript patterns and type system features. Learn how to write 
          type-safe, maintainable code with practical examples and real-world patterns.
        </p>
      </header>

      <section className="intro-section">
        <h2>Why TypeScript Patterns Matter</h2>
        <p>
          TypeScript's type system is incredibly powerful, but many developers only scratch 
          the surface. This module explores advanced patterns that will help you write more 
          expressive, safer, and more maintainable code.
        </p>
      </section>

      <section className="learning-paths">
        <h2>Learning Path</h2>
        <div className="concept-grid">
          <Link to="/type-guards" className="concept-card">
            <h3>Type Guards & Narrowing</h3>
            <p>
              Learn how to narrow types at runtime with type guards, discriminated unions, 
              and custom type predicates for safer code.
            </p>
          </Link>

          <Link to="/generics" className="concept-card">
            <h3>Generic Patterns</h3>
            <p>
              Master generic constraints, conditional types, and generic utilities to create 
              flexible, reusable type-safe abstractions.
            </p>
          </Link>

          <Link to="/utility-types" className="concept-card">
            <h3>Utility Types</h3>
            <p>
              Explore built-in utility types and learn to create custom utilities for 
              common type transformations.
            </p>
          </Link>

          <Link to="/decorators" className="concept-card">
            <h3>Decorator Patterns</h3>
            <p>
              Understand TypeScript decorators for class enhancement, method modification, 
              and metadata programming.
            </p>
          </Link>

          <Link to="/advanced-types" className="concept-card">
            <h3>Advanced Types</h3>
            <p>
              Deep dive into mapped types, template literal types, and recursive type 
              patterns for complex type modeling.
            </p>
          </Link>

          <Link to="/pattern-matching" className="concept-card">
            <h3>Pattern Matching</h3>
            <p>
              Implement exhaustive pattern matching, discriminated unions, and functional 
              programming patterns in TypeScript.
            </p>
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>What You'll Learn</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Type Safety</h3>
            <p>Write code that catches errors at compile time, not runtime</p>
          </div>
          <div className="feature-card">
            <h3>Better IntelliSense</h3>
            <p>Leverage TypeScript's type system for superior IDE support</p>
          </div>
          <div className="feature-card">
            <h3>Design Patterns</h3>
            <p>Implement classic patterns with TypeScript's type system</p>
          </div>
          <div className="feature-card">
            <h3>Real-World Examples</h3>
            <p>Learn from practical, production-ready code examples</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage