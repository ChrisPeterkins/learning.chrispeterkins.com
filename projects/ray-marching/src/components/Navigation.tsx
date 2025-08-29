import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Ray Marching</h2>
        <p className="nav-subtitle">3D Rendering in Fragment Shaders</p>
      </div>

      <div className="nav-section">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Core Concepts</h3>
        <NavLink to="/sdf-basics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          SDF Basics
        </NavLink>
        <NavLink to="/ray-marching" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Ray Marching Algorithm
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Advanced Techniques</h3>
        <NavLink to="/fractals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          3D Fractals
        </NavLink>
        <NavLink to="/shadows" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Shadows & Lighting
        </NavLink>
        <NavLink to="/volumetric" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Volumetric Rendering
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Tools</h3>
        <NavLink to="/shader-editor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Shader Editor
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Performance
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
};

export default Navigation;