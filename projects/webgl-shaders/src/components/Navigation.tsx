import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>WebGL Shaders</h2>
        <span className="nav-subtitle">GLSL Programming & Visual Effects</span>
      </div>

      <div className="nav-section">
        <h3>Fundamentals</h3>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Overview
        </Link>
        <Link to="/basics" className={`nav-link ${isActive('/basics') ? 'active' : ''}`}>
          GLSL Basics
        </Link>
        <Link to="/fragment-shaders" className={`nav-link ${isActive('/fragment-shaders') ? 'active' : ''}`}>
          Fragment Shaders
        </Link>
        <Link to="/vertex-shaders" className={`nav-link ${isActive('/vertex-shaders') ? 'active' : ''}`}>
          Vertex Shaders
        </Link>
      </div>

      <div className="nav-section">
        <h3>Advanced</h3>
        <Link to="/patterns" className={`nav-link ${isActive('/patterns') ? 'active' : ''}`}>
          Shader Patterns
        </Link>
        <Link to="/post-processing" className={`nav-link ${isActive('/post-processing') ? 'active' : ''}`}>
          Post-Processing
        </Link>
        <Link to="/playground" className={`nav-link ${isActive('/playground') ? 'active' : ''}`}>
          🎨 Playground
        </Link>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation