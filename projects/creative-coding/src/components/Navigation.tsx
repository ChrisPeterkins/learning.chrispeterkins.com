import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Creative Coding</h2>
        <p className="nav-subtitle">Generative Art & Algorithms</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Creative Explorations</h3>
        <NavLink to="/generative-art" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Generative Art
        </NavLink>
        <NavLink to="/pattern-making" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Pattern Making
        </NavLink>
        <NavLink to="/audio-visuals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Audio Visuals
        </NavLink>
        <NavLink to="/fractal-explorations" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Fractals
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Algorithms & Theory</h3>
        <NavLink to="/natural-simulations" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Natural Simulations
        </NavLink>
        <NavLink to="/color-theory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Color Theory
        </NavLink>
        <NavLink to="/noise-algorithms" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Noise Algorithms
        </NavLink>
        <NavLink to="/geometric-designs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Geometric Designs
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation