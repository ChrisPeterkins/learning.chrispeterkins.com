import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import UnitTestingPage from './pages/UnitTestingPage';
import IntegrationTestingPage from './pages/IntegrationTestingPage';
import E2ETestingPage from './pages/E2ETestingPage';
import TDDPage from './pages/TDDPage';
import MockingPage from './pages/MockingPage';
import ReactTestingPage from './pages/ReactTestingPage';
import PerformanceTestingPage from './pages/PerformanceTestingPage';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <Router basename="/projects/testing-strategies">
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/unit-testing" element={<UnitTestingPage />} />
            <Route path="/integration-testing" element={<IntegrationTestingPage />} />
            <Route path="/e2e-testing" element={<E2ETestingPage />} />
            <Route path="/tdd" element={<TDDPage />} />
            <Route path="/mocking" element={<MockingPage />} />
            <Route path="/react-testing" element={<ReactTestingPage />} />
            <Route path="/performance-testing" element={<PerformanceTestingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;