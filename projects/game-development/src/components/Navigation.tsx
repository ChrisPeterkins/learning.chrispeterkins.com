import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Game Development</h2>
        <span className="nav-subtitle">Build Interactive Games</span>
      </div>

      <div className="nav-section">
        <h3>Core Concepts</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/game-loop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Game Loop & Timing
        </NavLink>
        <NavLink to="/collision" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Collision Detection
        </NavLink>
        <NavLink to="/physics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Physics & Movement
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Graphics & Animation</h3>
        <NavLink to="/sprite-animation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Sprite Animation
        </NavLink>
        <NavLink to="/particle-systems" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Particle Systems
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Architecture</h3>
        <NavLink to="/entity-system" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Entity Component System
        </NavLink>
        <NavLink to="/input-handling" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Input Handling
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
};

export default Navigation;