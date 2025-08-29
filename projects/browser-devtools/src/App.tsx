import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ConsolePage from './pages/ConsolePage';
import ElementsPage from './pages/ElementsPage';
import NetworkPage from './pages/NetworkPage';
import PerformancePage from './pages/PerformancePage';
import MemoryPage from './pages/MemoryPage';
import ApplicationPage from './pages/ApplicationPage';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <Router basename="/projects/browser-devtools">
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/console" element={<ConsolePage />} />
            <Route path="/elements" element={<ElementsPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/application" element={<ApplicationPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;