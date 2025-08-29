import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import SDFBasicsPage from './pages/SDFBasicsPage';
import RayMarchingPage from './pages/RayMarchingPage';
import FractalsPage from './pages/FractalsPage';
import ShadowsPage from './pages/ShadowsPage';
import VolumetricPage from './pages/VolumetricPage';
import ShaderEditorPage from './pages/ShaderEditorPage';
import PerformancePage from './pages/PerformancePage';

const App: React.FC = () => {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sdf-basics" element={<SDFBasicsPage />} />
          <Route path="/ray-marching" element={<RayMarchingPage />} />
          <Route path="/fractals" element={<FractalsPage />} />
          <Route path="/shadows" element={<ShadowsPage />} />
          <Route path="/volumetric" element={<VolumetricPage />} />
          <Route path="/shader-editor" element={<ShaderEditorPage />} />
          <Route path="/performance" element={<PerformancePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;