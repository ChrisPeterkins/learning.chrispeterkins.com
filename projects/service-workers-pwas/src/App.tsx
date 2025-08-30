import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import OfflineDemo from './components/OfflineDemo';
import OfflineAdvanced from './components/OfflineAdvanced';
import CacheStrategies from './components/CacheStrategies';
import PushNotifications from './components/PushNotifications';
import PushNotificationsAdvanced from './components/PushNotificationsAdvanced';
import BackgroundSync from './components/BackgroundSync';
import BackgroundSyncAdvanced from './components/BackgroundSyncAdvanced';
import InstallPWA from './components/InstallPWA';
import PerformanceMetrics from './components/PerformanceMetrics';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Service Workers & PWAs</h2>
        <p className="nav-subtitle">Progressive Web Applications</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>Core Features</h3>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Offline Demo
        </NavLink>
        <NavLink to="/offline-advanced" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Advanced Offline
        </NavLink>
        <NavLink to="/cache-strategies" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Cache Strategies
        </NavLink>
        <NavLink to="/push-notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Push Notifications
        </NavLink>
        <NavLink to="/push-advanced" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Advanced Push
        </NavLink>
        <NavLink to="/background-sync" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Background Sync
        </NavLink>
        <NavLink to="/sync-advanced" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Advanced Sync
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>PWA Features</h3>
        <NavLink to="/install-pwa" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Installation
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Performance Metrics
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router basename="/projects/service-workers-pwas">
      <div className="app">
        <Navigation />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<OfflineDemo />} />
            <Route path="/offline-advanced" element={<OfflineAdvanced />} />
            <Route path="/cache-strategies" element={<CacheStrategies />} />
            <Route path="/push-notifications" element={<PushNotifications />} />
            <Route path="/push-advanced" element={<PushNotificationsAdvanced />} />
            <Route path="/background-sync" element={<BackgroundSync />} />
            <Route path="/sync-advanced" element={<BackgroundSyncAdvanced />} />
            <Route path="/install-pwa" element={<InstallPWA />} />
            <Route path="/performance" element={<PerformanceMetrics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;