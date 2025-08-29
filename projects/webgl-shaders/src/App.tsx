import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import BasicsPage from './pages/BasicsPage'
import FragmentShadersPage from './pages/FragmentShadersPage'
import VertexShadersPage from './pages/VertexShadersPage'
import ShaderPatternsPage from './pages/ShaderPatternsPage'
import PostProcessingPage from './pages/PostProcessingPage'
import PlaygroundPage from './pages/PlaygroundPage'

function App() {
  return (
    <Router basename="/projects/webgl-shaders">
      <div className="layout">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/basics" element={<BasicsPage />} />
            <Route path="/fragment-shaders" element={<FragmentShadersPage />} />
            <Route path="/vertex-shaders" element={<VertexShadersPage />} />
            <Route path="/patterns" element={<ShaderPatternsPage />} />
            <Route path="/post-processing" element={<PostProcessingPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App