import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import GridBasicsPage from './pages/GridBasicsPage'
import FlexboxPage from './pages/FlexboxPage'
import AnimationsPage from './pages/AnimationsPage'
import TransitionsPage from './pages/TransitionsPage'
import TransformsPage from './pages/TransformsPage'
import AdvancedLayoutsPage from './pages/AdvancedLayoutsPage'
import ResponsivePage from './pages/ResponsivePage'

function App() {
  return (
    <Router basename="/projects/css-animations">
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grid-basics" element={<GridBasicsPage />} />
            <Route path="/flexbox" element={<FlexboxPage />} />
            <Route path="/animations" element={<AnimationsPage />} />
            <Route path="/transitions" element={<TransitionsPage />} />
            <Route path="/transforms" element={<TransformsPage />} />
            <Route path="/advanced-layouts" element={<AdvancedLayoutsPage />} />
            <Route path="/responsive" element={<ResponsivePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App