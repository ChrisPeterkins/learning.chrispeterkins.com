import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-header">
          <h1 className="nav-title">Creative Coding Lab</h1>
          <Link to="/" className="home-link">Home</Link>
        </div>
        <div className="nav-links">
          <Link 
            to="/generative-art" 
            className={location.pathname === '/generative-art' ? 'active' : ''}
          >
            Generative Art
          </Link>
          <Link 
            to="/pattern-making" 
            className={location.pathname === '/pattern-making' ? 'active' : ''}
          >
            Pattern Making
          </Link>
          <Link 
            to="/audio-visuals" 
            className={location.pathname === '/audio-visuals' ? 'active' : ''}
          >
            Audio Visuals
          </Link>
          <Link 
            to="/fractal-explorations" 
            className={location.pathname === '/fractal-explorations' ? 'active' : ''}
          >
            Fractals
          </Link>
          <Link 
            to="/natural-simulations" 
            className={location.pathname === '/natural-simulations' ? 'active' : ''}
          >
            Natural Simulations
          </Link>
          <Link 
            to="/color-theory" 
            className={location.pathname === '/color-theory' ? 'active' : ''}
          >
            Color Theory
          </Link>
          <Link 
            to="/noise-algorithms" 
            className={location.pathname === '/noise-algorithms' ? 'active' : ''}
          >
            Noise Algorithms
          </Link>
          <Link 
            to="/geometric-designs" 
            className={location.pathname === '/geometric-designs' ? 'active' : ''}
          >
            Geometric Designs
          </Link>
        </div>
        <a href="/" className="back-to-hub">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation