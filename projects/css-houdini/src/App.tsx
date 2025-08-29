import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PaintAPIPage from './pages/PaintAPIPage';
import LayoutAPIPage from './pages/LayoutAPIPage';
import PropertiesAPIPage from './pages/PropertiesAPIPage';
import AnimationWorkletPage from './pages/AnimationWorkletPage';
import TypedOMPage from './pages/TypedOMPage';
import CompatibilityPage from './pages/CompatibilityPage';
import PlaygroundPage from './pages/PlaygroundPage';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/paint-api" element={<PaintAPIPage />} />
          <Route path="/layout-api" element={<LayoutAPIPage />} />
          <Route path="/properties-api" element={<PropertiesAPIPage />} />
          <Route path="/animation-worklet" element={<AnimationWorkletPage />} />
          <Route path="/typed-om" element={<TypedOMPage />} />
          <Route path="/compatibility" element={<CompatibilityPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;