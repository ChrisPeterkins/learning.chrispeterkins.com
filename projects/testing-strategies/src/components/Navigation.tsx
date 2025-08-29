import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Testing Strategies</h2>
        <span className="nav-subtitle">Master Software Testing</span>
      </div>

      <div className="nav-section">
        <h3>Fundamentals</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/unit-testing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Unit Testing
        </NavLink>
        <NavLink to="/integration-testing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Integration Testing
        </NavLink>
        <NavLink to="/e2e-testing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          End-to-End Testing
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Advanced Concepts</h3>
        <NavLink to="/tdd" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Test-Driven Development
        </NavLink>
        <NavLink to="/mocking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Mocking & Stubs
        </NavLink>
        <NavLink to="/react-testing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Testing React Components
        </NavLink>
        <NavLink to="/performance-testing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Performance Testing
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
};

export default Navigation;