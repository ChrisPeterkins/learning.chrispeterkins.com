import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-header">
          <h1 className="nav-title">Procedural Generation Lab</h1>
          <Link to="/" className="home-link">Home</Link>
        </div>
        <div className="nav-links">
          <Link 
            to="/terrain-generation" 
            className={location.pathname === '/terrain-generation' ? 'active' : ''}
          >
            Terrain
          </Link>
          <Link 
            to="/l-systems" 
            className={location.pathname === '/l-systems' ? 'active' : ''}
          >
            L-Systems
          </Link>
          <Link 
            to="/noise-fields" 
            className={location.pathname === '/noise-fields' ? 'active' : ''}
          >
            Noise Fields
          </Link>
          <Link 
            to="/dungeon-generation" 
            className={location.pathname === '/dungeon-generation' ? 'active' : ''}
          >
            Dungeons
          </Link>
          <Link 
            to="/world-building" 
            className={location.pathname === '/world-building' ? 'active' : ''}
          >
            World Building
          </Link>
          <Link 
            to="/maze-generation" 
            className={location.pathname === '/maze-generation' ? 'active' : ''}
          >
            Mazes
          </Link>
          <Link 
            to="/cave-systems" 
            className={location.pathname === '/cave-systems' ? 'active' : ''}
          >
            Caves
          </Link>
          <Link 
            to="/vegetation" 
            className={location.pathname === '/vegetation' ? 'active' : ''}
          >
            Vegetation
          </Link>
        </div>
        <a href="/" className="back-to-hub">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation