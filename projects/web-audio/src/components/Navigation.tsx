import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1>Web Audio API</h1>
        <a href="/" className="back-link">← Back to Hub</a>
      </div>
      <div className="nav-links">
        <NavLink to="/" end>Overview</NavLink>
        <NavLink to="/basic-synth">Basic Synth</NavLink>
        <NavLink to="/visualizations">Visualizations</NavLink>
        <NavLink to="/effects">Audio Effects</NavLink>
        <NavLink to="/sequencer">Step Sequencer</NavLink>
        <NavLink to="/audio-analysis">Audio Analysis</NavLink>
      </div>
    </nav>
  )
}

export default Navigation