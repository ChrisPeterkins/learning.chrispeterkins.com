import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Node.js Deep Dive</h2>
        <p className="nav-subtitle">Backend Mastery</p>
      </div>
      
      <div className="nav-section">
        <h3>Core Concepts</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/event-loop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Event Loop
        </NavLink>
        <NavLink to="/async-patterns" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Async Patterns
        </NavLink>
        <NavLink to="/streams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Streams
        </NavLink>
        <NavLink to="/buffers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Buffers
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Advanced Topics</h3>
        <NavLink to="/worker-threads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Worker Threads
        </NavLink>
        <NavLink to="/clustering" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Clustering
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Performance
        </NavLink>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)' }}>
        <a href="/" className="nav-link" style={{ fontSize: '0.85rem' }}>
          ← Back to Hub
        </a>
      </div>
    </nav>
  )
}

export default Navigation