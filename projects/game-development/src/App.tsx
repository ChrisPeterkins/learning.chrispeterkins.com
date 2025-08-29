import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import GameLoopPage from './pages/GameLoopPage';
import CollisionPage from './pages/CollisionPage';
import PhysicsPage from './pages/PhysicsPage';
import SpriteAnimationPage from './pages/SpriteAnimationPage';
import ParticleSystemsPage from './pages/ParticleSystemsPage';
import EntitySystemPage from './pages/EntitySystemPage';
import InputHandlingPage from './pages/InputHandlingPage';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <Router basename="/projects/game-development">
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game-loop" element={<GameLoopPage />} />
            <Route path="/collision" element={<CollisionPage />} />
            <Route path="/physics" element={<PhysicsPage />} />
            <Route path="/sprite-animation" element={<SpriteAnimationPage />} />
            <Route path="/particle-systems" element={<ParticleSystemsPage />} />
            <Route path="/entity-system" element={<EntitySystemPage />} />
            <Route path="/input-handling" element={<InputHandlingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;