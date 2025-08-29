import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Browser DevTools</h2>
        <span className="nav-subtitle">Master Developer Tools</span>
      </div>

      <div className="nav-section">
        <h3>Core Tools</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/console" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Console & Debugging
        </NavLink>
        <NavLink to="/elements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Elements & Styles
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Advanced</h3>
        <NavLink to="/network" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Network Analysis
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Performance Profiling
        </NavLink>
        <NavLink to="/memory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Memory Management
        </NavLink>
        <NavLink to="/application" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Application Storage
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
};

export default Navigation;