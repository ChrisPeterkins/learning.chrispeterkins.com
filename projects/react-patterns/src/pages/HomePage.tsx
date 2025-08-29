import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>React Patterns & Best Practices</h1>
        <p className="subtitle">Master modern React development through interactive examples</p>
      </header>

      <section className="intro-section">
        <p>
          Welcome to the React Patterns learning hub! This interactive platform is designed to help you 
          understand and master React concepts through hands-on examples and real-world patterns.
        </p>
      </section>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Interactive Examples</h3>
          <p>Live code editing with instant preview. Modify examples and see changes in real-time.</p>
        </div>
        
        <div className="feature-card">
          <h3>Progressive Learning</h3>
          <p>Start with fundamentals and advance to complex patterns and optimizations.</p>
        </div>
        
        <div className="feature-card">
          <h3>Best Practices</h3>
          <p>Learn industry-standard patterns and conventions used in production applications.</p>
        </div>
        
        <div className="feature-card">
          <h3>TypeScript First</h3>
          <p>All examples include TypeScript for better type safety and developer experience.</p>
        </div>
      </div>

      <section className="learning-paths">
        <h2>Learning Paths</h2>
        <div className="path-cards">
          <div className="path-card">
            <div className="path-number">01</div>
            <h4>React Hooks</h4>
            <p>Master all built-in hooks and create custom hooks for reusable logic.</p>
          </div>
          
          <div className="path-card">
            <div className="path-number">02</div>
            <h4>Component Patterns</h4>
            <p>Learn HOCs, Render Props, Compound Components, and more advanced patterns.</p>
          </div>
          
          <div className="path-card">
            <div className="path-number">03</div>
            <h4>State Management</h4>
            <p>From Context API to advanced state management solutions and patterns.</p>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <p>Start exploring from the navigation menu on the left →</p>
      </footer>
    </div>
  )
}

export default HomePage