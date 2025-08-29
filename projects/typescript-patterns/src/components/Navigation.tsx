import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>TypeScript Patterns</h2>
        <span className="nav-subtitle">Advanced Type System Mastery</span>
      </div>

      <div className="nav-section">
        <h3>Fundamentals</h3>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Overview
        </Link>
        <Link to="/type-guards" className={`nav-link ${isActive('/type-guards') ? 'active' : ''}`}>
          Type Guards & Narrowing
        </Link>
        <Link to="/generics" className={`nav-link ${isActive('/generics') ? 'active' : ''}`}>
          Generic Patterns
        </Link>
      </div>

      <div className="nav-section">
        <h3>Advanced Patterns</h3>
        <Link to="/utility-types" className={`nav-link ${isActive('/utility-types') ? 'active' : ''}`}>
          Utility Types
        </Link>
        <Link to="/decorators" className={`nav-link ${isActive('/decorators') ? 'active' : ''}`}>
          Decorator Patterns
        </Link>
        <Link to="/advanced-types" className={`nav-link ${isActive('/advanced-types') ? 'active' : ''}`}>
          Advanced Types
        </Link>
        <Link to="/pattern-matching" className={`nav-link ${isActive('/pattern-matching') ? 'active' : ''}`}>
          Pattern Matching
        </Link>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation