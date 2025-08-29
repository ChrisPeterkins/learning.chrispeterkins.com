import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>WebRTC Deep Dive</h2>
        <p className="nav-subtitle">Real-Time Communication</p>
      </div>
      
      <div className="nav-section">
        <h3>Overview</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Peer Connections</h3>
        <NavLink to="/peer-connections" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Connection Lifecycle
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Media Streams</h3>
        <NavLink to="/media-streams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Camera & Microphone
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Data Channels</h3>
        <NavLink to="/data-channels" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          P2P Data Transfer
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Screen Sharing</h3>
        <NavLink to="/screen-sharing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Screen Capture API
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Video Chat Demo</h3>
        <NavLink to="/video-chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Simulated Video Call
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Signaling & STUN/TURN</h3>
        <NavLink to="/signaling" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Connection Process
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>WebRTC Security</h3>
        <NavLink to="/security" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Security Concepts
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