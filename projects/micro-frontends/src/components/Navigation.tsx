import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/module-federation', label: 'Module Federation' },
    { path: '/single-spa', label: 'Single-spa' },
    { path: '/iframe', label: 'iFrame Integration' },
    { path: '/web-components', label: 'Web Components' },
    { path: '/state-sharing', label: 'State Sharing' },
    { path: '/deployment', label: 'Deployment' },
  ]

  return (
    <nav className="navigation">
      <div className="nav-header">
        <Link to="/" className="nav-title">
          <h1>Micro-Frontends</h1>
          <span className="nav-subtitle">Architecture Patterns</span>
        </Link>
      </div>
      <ul className="nav-list">
        {navItems.map(({ path, label }) => (
          <li key={path}>
            <Link
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-footer">
        <Link to="/" className="back-link">← Back to Hub</Link>
      </div>
    </nav>
  )
}

export default Navigation