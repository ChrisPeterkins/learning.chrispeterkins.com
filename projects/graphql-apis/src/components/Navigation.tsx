import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>GraphQL & APIs</h2>
        <p className="nav-subtitle">Query Languages & API Design</p>
      </div>
      
      <div className="nav-section">
        <h3>Foundation</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/graphql-basics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          GraphQL Basics
        </NavLink>
        <NavLink to="/schemas-types" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Schemas & Types
        </NavLink>
        <NavLink to="/queries-mutations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Queries & Mutations
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Advanced Concepts</h3>
        <NavLink to="/subscriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Subscriptions
        </NavLink>
        <NavLink to="/rest-vs-graphql" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          REST vs GraphQL
        </NavLink>
        <NavLink to="/api-design" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          API Design Patterns
        </NavLink>
        <NavLink to="/realtime-apis" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Real-time APIs
        </NavLink>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)' }}>
        <a href="/" className="nav-link" style={{ fontSize: '0.85rem' }}>
          ← Back to Learning Hub
        </a>
      </div>
    </nav>
  )
}

export default Navigation