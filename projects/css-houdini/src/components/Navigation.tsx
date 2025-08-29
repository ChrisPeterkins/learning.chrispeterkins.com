import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Palette, Layout, Settings, Play, Code, Monitor, Beaker } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Monitor size={18} /> },
    { path: '/paint-api', label: 'Paint API', icon: <Palette size={18} /> },
    { path: '/layout-api', label: 'Layout API', icon: <Layout size={18} /> },
    { path: '/properties-api', label: 'Properties API', icon: <Settings size={18} /> },
    { path: '/animation-worklet', label: 'Animation Worklet', icon: <Play size={18} /> },
    { path: '/typed-om', label: 'Typed OM', icon: <Code size={18} /> },
    { path: '/compatibility', label: 'Browser Support', icon: <Monitor size={18} /> },
    { path: '/playground', label: 'Playground', icon: <Beaker size={18} /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <Palette className="brand-icon" size={24} />
          <span className="brand-text">CSS Houdini Lab</span>
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