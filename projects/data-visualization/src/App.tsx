import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import BarChartsPage from './pages/BarChartsPage'
import ScatterPlotsPage from './pages/ScatterPlotsPage'
import NetworkGraphsPage from './pages/NetworkGraphsPage'
import RealTimeDataPage from './pages/RealTimeDataPage'
import GeographicMapsPage from './pages/GeographicMapsPage'
import CustomVisualizationsPage from './pages/CustomVisualizationsPage'

function App() {
  return (
    <Router basename="/projects/data-visualization">
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bar-charts" element={<BarChartsPage />} />
            <Route path="/scatter-plots" element={<ScatterPlotsPage />} />
            <Route path="/network-graphs" element={<NetworkGraphsPage />} />
            <Route path="/real-time" element={<RealTimeDataPage />} />
            <Route path="/geographic-maps" element={<GeographicMapsPage />} />
            <Route path="/custom-visualizations" element={<CustomVisualizationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App