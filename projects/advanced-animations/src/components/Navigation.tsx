import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Wind, Sparkles, Waves, Box, Gauge, Clock, Home } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/gsap', label: 'GSAP', icon: <Zap size={18} /> },
    { path: '/framer-motion', label: 'Framer Motion', icon: <Wind size={18} /> },
    { path: '/lottie', label: 'Lottie', icon: <Sparkles size={18} /> },
    { path: '/svg-animation', label: 'SVG Animation', icon: <Waves size={18} /> },
    { path: '/css-3d', label: '3D CSS', icon: <Box size={18} /> },
    { path: '/performance', label: 'Performance', icon: <Gauge size={18} /> },
    { path: '/timeline', label: 'Timelines', icon: <Clock size={18} /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <Zap className="brand-icon" size={24} />
          <span className="brand-text">Advanced Animations</span>
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