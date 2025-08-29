import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ParticleSystemsPage from './pages/ParticleSystemsPage'
import PhysicsSimulationPage from './pages/PhysicsSimulationPage'
import CreativeCodingPage from './pages/CreativeCodingPage'
import FractalsPage from './pages/FractalsPage'
import InteractiveAnimationsPage from './pages/InteractiveAnimationsPage'
import FlowFieldsPage from './pages/FlowFieldsPage'

function App() {
  return (
    <Router basename="/projects/canvas-animations">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/particles" element={<ParticleSystemsPage />} />
          <Route path="/physics" element={<PhysicsSimulationPage />} />
          <Route path="/creative" element={<CreativeCodingPage />} />
          <Route path="/fractals" element={<FractalsPage />} />
          <Route path="/interactive" element={<InteractiveAnimationsPage />} />
          <Route path="/flow-fields" element={<FlowFieldsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App