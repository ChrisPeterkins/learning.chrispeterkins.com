import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Data Visualization</h2>
        <p className="nav-subtitle">Interactive Charts & Graphs</p>
      </div>
      
      <div className="nav-section">
        <h3>Foundation</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/bar-charts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Bar & Line Charts
        </NavLink>
        <NavLink to="/scatter-plots" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Scatter Plots & Heatmaps
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Advanced Techniques</h3>
        <NavLink to="/network-graphs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Network Graphs
        </NavLink>
        <NavLink to="/real-time" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Real-time Data
        </NavLink>
        <NavLink to="/geographic-maps" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Geographic Maps
        </NavLink>
        <NavLink to="/custom-visualizations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Custom Visualizations
        </NavLink>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)' }}>
        <a href="/" className="nav-link" style={{ fontSize: '0.85rem' }}>
          ← Back to Learning Hub
        </a>
      </div>
    </nav>
  )
}

export default Navigation