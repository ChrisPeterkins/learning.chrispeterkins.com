import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>React Patterns</h2>
        <p className="nav-subtitle">Interactive Learning</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/projects/react-patterns" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>React Hooks</h3>
        <NavLink to="/projects/react-patterns/hooks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Overview
        </NavLink>
        <NavLink to="/projects/react-patterns/hooks/useState" className={({ isActive }) => isActive ? 'nav-link sub-link active' : 'nav-link sub-link'}>
          useState
        </NavLink>
        <NavLink to="/projects/react-patterns/hooks/useEffect" className={({ isActive }) => isActive ? 'nav-link sub-link active' : 'nav-link sub-link'}>
          useEffect
        </NavLink>
        <NavLink to="/projects/react-patterns/hooks/useContext" className={({ isActive }) => isActive ? 'nav-link sub-link active' : 'nav-link sub-link'}>
          useContext
        </NavLink>
        <NavLink to="/projects/react-patterns/hooks/useReducer" className={({ isActive }) => isActive ? 'nav-link sub-link active' : 'nav-link sub-link'}>
          useReducer
        </NavLink>
        <NavLink to="/projects/react-patterns/hooks/custom" className={({ isActive }) => isActive ? 'nav-link sub-link active' : 'nav-link sub-link'}>
          Custom Hooks
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Component Patterns</h3>
        <NavLink to="/projects/react-patterns/patterns" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          All Patterns
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>State Management</h3>
        <NavLink to="/projects/react-patterns/state-management" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Overview
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="https://learning.chrispeterkins.com/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation