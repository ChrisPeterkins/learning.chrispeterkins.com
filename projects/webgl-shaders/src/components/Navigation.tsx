import React from 'react'
import { NavLink } from 'react-router-dom'

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>WebGL Shaders</h2>
        <p className="nav-subtitle">GLSL Programming & Visual Effects</p>
      </div>

      <div className="nav-section">
        <h3>Fundamentals</h3>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/basics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          GLSL Basics
        </NavLink>
        <NavLink to="/fragment-shaders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Fragment Shaders
        </NavLink>
        <NavLink to="/vertex-shaders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Vertex Shaders
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Advanced</h3>
        <NavLink to="/patterns" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Shader Patterns
        </NavLink>
        <NavLink to="/post-processing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Post-Processing
        </NavLink>
        <NavLink to="/playground" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Playground
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation