import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GenerativeArtPage from './pages/GenerativeArtPage'
import PatternMakingPage from './pages/PatternMakingPage'
import AudioVisualsPage from './pages/AudioVisualsPage'
import FractalExplorationsPage from './pages/FractalExplorationsPage'
import NaturalSimulationsPage from './pages/NaturalSimulationsPage'
import ColorTheoryPage from './pages/ColorTheoryPage'
import NoiseAlgorithmsPage from './pages/NoiseAlgorithmsPage'
import GeometricDesignsPage from './pages/GeometricDesignsPage'

function App() {
  return (
    <Router basename="/projects/creative-coding">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="generative-art" element={<GenerativeArtPage />} />
          <Route path="pattern-making" element={<PatternMakingPage />} />
          <Route path="audio-visuals" element={<AudioVisualsPage />} />
          <Route path="fractal-explorations" element={<FractalExplorationsPage />} />
          <Route path="natural-simulations" element={<NaturalSimulationsPage />} />
          <Route path="color-theory" element={<ColorTheoryPage />} />
          <Route path="noise-algorithms" element={<NoiseAlgorithmsPage />} />
          <Route path="geometric-designs" element={<GeometricDesignsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App