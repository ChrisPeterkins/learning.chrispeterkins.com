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
        <h3>GSAP Mastery</h3>
        <NavLink to="/gsap" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          GSAP Basics
        </NavLink>
        <NavLink to="/gsap-advanced" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Advanced GSAP
        </NavLink>
        <NavLink to="/scroll-animations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Scroll Animations
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Visual Effects</h3>
        <NavLink to="/particle-systems" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Particle Systems
        </NavLink>
        <NavLink to="/physics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Physics Animation
        </NavLink>
        <NavLink to="/svg-animation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          SVG Animation
        </NavLink>
        <NavLink to="/css-3d" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          3D CSS
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Libraries</h3>
        <NavLink to="/framer-motion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Framer Motion
        </NavLink>
        <NavLink to="/lottie" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Lottie
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