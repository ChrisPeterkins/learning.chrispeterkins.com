import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Procedural Generation</h2>
        <p className="nav-subtitle">Algorithmic Content Creation</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Terrain & Worlds</h3>
        <NavLink to="/terrain-generation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Terrain Generation
        </NavLink>
        <NavLink to="/world-building" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          World Building
        </NavLink>
        <NavLink to="/cave-systems" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Cave Systems
        </NavLink>
        <NavLink to="/noise-fields" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Noise Fields
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Structures & Patterns</h3>
        <NavLink to="/dungeon-generation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dungeon Generation
        </NavLink>
        <NavLink to="/maze-generation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Maze Generation
        </NavLink>
        <NavLink to="/l-systems" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          L-Systems
        </NavLink>
        <NavLink to="/vegetation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Vegetation
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation