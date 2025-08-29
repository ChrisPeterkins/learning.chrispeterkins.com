import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import GSAPPage from './pages/GSAPPage';
import FramerMotionPage from './pages/FramerMotionPage';
import LottiePage from './pages/LottiePage';
import SVGAnimationPage from './pages/SVGAnimationPage';
import CSS3DPage from './pages/CSS3DPage';
import PerformancePage from './pages/PerformancePage';
import TimelinePage from './pages/TimelinePage';

const App: React.FC = () => {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gsap" element={<GSAPPage />} />
          <Route path="/framer-motion" element={<FramerMotionPage />} />
          <Route path="/lottie" element={<LottiePage />} />
          <Route path="/svg-animation" element={<SVGAnimationPage />} />
          <Route path="/css-3d" element={<CSS3DPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;