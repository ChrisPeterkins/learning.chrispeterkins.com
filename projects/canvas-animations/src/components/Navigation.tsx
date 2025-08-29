import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1>Canvas Animations</h1>
        <a href="/" className="back-link">← Back to Hub</a>
      </div>
      <div className="nav-links">
        <NavLink to="/" end>Overview</NavLink>
        <NavLink to="/particles">Particle Systems</NavLink>
        <NavLink to="/physics">Physics Simulation</NavLink>
        <NavLink to="/creative">Creative Coding</NavLink>
        <NavLink to="/fractals">Fractals</NavLink>
        <NavLink to="/interactive">Interactive</NavLink>
        <NavLink to="/flow-fields">Flow Fields</NavLink>
      </div>
    </nav>
  )
}

export default Navigation