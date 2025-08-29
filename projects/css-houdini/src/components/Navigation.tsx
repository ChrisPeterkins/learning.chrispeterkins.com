import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>CSS Houdini Lab</h2>
        <p className="nav-subtitle">Custom CSS Magic</p>
      </div>

      <div className="nav-section">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Core APIs</h3>
        <NavLink to="/paint-api" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Paint API
        </NavLink>
        <NavLink to="/layout-api" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Layout API
        </NavLink>
        <NavLink to="/properties-api" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Properties API
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Advanced Features</h3>
        <NavLink to="/animation-worklet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Animation Worklet
        </NavLink>
        <NavLink to="/typed-om" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Typed OM
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Resources</h3>
        <NavLink to="/compatibility" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Browser Support
        </NavLink>
        <NavLink to="/playground" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Playground
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
};

export default Navigation;