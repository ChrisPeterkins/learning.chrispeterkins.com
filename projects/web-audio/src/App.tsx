import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BasicSynthPage from './pages/BasicSynthPage'
import VisualizationsPage from './pages/VisualizationsPage'
import EffectsPage from './pages/EffectsPage'
import SequencerPage from './pages/SequencerPage'
import AudioAnalysisPage from './pages/AudioAnalysisPage'

function App() {
  return (
    <Router basename="/projects/web-audio">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/basic-synth" element={<BasicSynthPage />} />
          <Route path="/visualizations" element={<VisualizationsPage />} />
          <Route path="/effects" element={<EffectsPage />} />
          <Route path="/sequencer" element={<SequencerPage />} />
          <Route path="/audio-analysis" element={<AudioAnalysisPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App