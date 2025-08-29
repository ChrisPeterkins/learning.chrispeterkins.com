import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import PerformanceComparison from './components/PerformanceComparison';
import ImageProcessing from './components/ImageProcessing';
import CryptoOperations from './components/CryptoOperations';
import GamePhysics from './components/GamePhysics';
import DataCompression from './components/DataCompression';
import AudioProcessing from './components/AudioProcessing';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>WebAssembly</h2>
        <p className="nav-subtitle">High-Performance Computing</p>
      </div>
      
      <div className="nav-section">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
      </div>

      <div className="nav-section">
        <h3>WebAssembly Demos</h3>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Performance Benchmarks
        </NavLink>
        <NavLink to="/image-processing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Image Processing
        </NavLink>
        <NavLink to="/crypto" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Cryptography
        </NavLink>
        <NavLink to="/physics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Physics Engine
        </NavLink>
        <NavLink to="/compression" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Data Compression
        </NavLink>
        <NavLink to="/audio" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Audio Processing
        </NavLink>
      </div>

      <div className="nav-footer">
        <a href="/" className="back-link">← Back to Learning Hub</a>
      </div>
    </nav>
  );
}

function App() {
  const [wasmReady, setWasmReady] = useState(false);

  return (
    <Router basename="/projects/webassembly">
      <div className="app-container">
        <Navigation />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PerformanceComparison />} />
            <Route path="/image-processing" element={<ImageProcessing />} />
            <Route path="/crypto" element={<CryptoOperations />} />
            <Route path="/physics" element={<GamePhysics />} />
            <Route path="/compression" element={<DataCompression />} />
            <Route path="/audio" element={<AudioProcessing />} />
          </Routes>
          
          <div className="wasm-status">
            <span className={`status-indicator ${wasmReady ? 'ready' : 'loading'}`}></span>
            <span>WebAssembly: {wasmReady ? 'Ready' : 'Loading...'}</span>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;