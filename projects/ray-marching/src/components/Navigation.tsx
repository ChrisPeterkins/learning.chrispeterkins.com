import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Circle, Layers, Sparkles, Sun, Cloud, Code, Gauge, Home } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/sdf-basics', label: 'SDF Basics', icon: <Circle size={18} /> },
    { path: '/ray-marching', label: 'Ray Marching', icon: <Zap size={18} /> },
    { path: '/fractals', label: 'Fractals', icon: <Sparkles size={18} /> },
    { path: '/shadows', label: 'Shadows', icon: <Sun size={18} /> },
    { path: '/volumetric', label: 'Volumetric', icon: <Cloud size={18} /> },
    { path: '/shader-editor', label: 'Editor', icon: <Code size={18} /> },
    { path: '/performance', label: 'Performance', icon: <Gauge size={18} /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <Layers className="brand-icon" size={24} />
          <span className="brand-text">Ray Marching Lab</span>
        </Link>
      </div>

      <button
        className="nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`nav-links ${isOpen ? 'nav-links--open' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${isActive(item.path) ? 'nav-link--active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)} />}
    </nav>
  );
};

export default Navigation;