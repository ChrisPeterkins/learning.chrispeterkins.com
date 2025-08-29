import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>CSS Grid & Animations</h2>
        <p className="nav-subtitle">Modern Layouts</p>
      </div>
      
      <div className="nav-section">
        <h3>Layout Systems</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/grid-basics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          CSS Grid
        </NavLink>
        <NavLink to="/flexbox" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Flexbox
        </NavLink>
        <NavLink to="/advanced-layouts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Advanced Layouts
        </NavLink>
        <NavLink to="/responsive" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Responsive Design
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Animations</h3>
        <NavLink to="/animations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          CSS Animations
        </NavLink>
        <NavLink to="/transitions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Transitions
        </NavLink>
        <NavLink to="/transforms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Transforms
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