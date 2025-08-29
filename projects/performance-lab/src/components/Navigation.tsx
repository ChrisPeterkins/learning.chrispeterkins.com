import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Performance Lab</h2>
        <p className="nav-subtitle">Web Performance Optimization</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Overview
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Bundle Optimization</h3>
        <NavLink to="/bundle-analysis" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Bundle Analysis
        </NavLink>
        <NavLink to="/code-splitting" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Code Splitting
        </NavLink>
        <NavLink to="/lazy-loading" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Lazy Loading
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Runtime Performance</h3>
        <NavLink to="/virtualization" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Virtualization
        </NavLink>
        <NavLink to="/images" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Image Optimization
        </NavLink>
        <NavLink to="/metrics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Performance Metrics
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  )
}

export default Navigation