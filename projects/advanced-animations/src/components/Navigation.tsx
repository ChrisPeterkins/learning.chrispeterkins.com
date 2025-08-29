import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Advanced Animations</h2>
        <p className="nav-subtitle">Modern Web Animation</p>
      </div>

      <div className="nav-section">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Animation Libraries</h3>
        <NavLink to="/gsap" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          GSAP
        </NavLink>
        <NavLink to="/framer-motion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Framer Motion
        </NavLink>
        <NavLink to="/lottie" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Lottie
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Techniques</h3>
        <NavLink to="/svg-animation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          SVG Animation
        </NavLink>
        <NavLink to="/css-3d" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          3D CSS
        </NavLink>
        <NavLink to="/timeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Timelines
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Optimization</h3>
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