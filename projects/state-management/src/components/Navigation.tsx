import { NavLink } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>State Management</h2>
        <p className="nav-subtitle">Modern Solutions</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/projects/state-management" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Libraries</h3>
        <NavLink to="/projects/state-management/zustand" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Zustand
        </NavLink>
        <NavLink to="/projects/state-management/jotai" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Jotai
        </NavLink>
        <NavLink to="/projects/state-management/valtio" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Valtio
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Comparisons</h3>
        <NavLink to="/projects/state-management/redux-comparison" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          vs Redux
        </NavLink>
        <NavLink to="/projects/state-management/atomic-state" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Atomic State
        </NavLink>
        <NavLink to="/projects/state-management/performance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Performance
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
}

export default Navigation;