import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ZustandDemo from './pages/ZustandDemo'
import JotaiDemo from './pages/JotaiDemo'
import ValtioDemo from './pages/ValtioDemo'
import ReduxComparison from './pages/ReduxComparison'
import AtomicState from './pages/AtomicState'
import PerformanceComparison from './pages/PerformanceComparison'

function App() {
  return (
    <Router basename="/projects/state-management">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/zustand" element={<ZustandDemo />} />
          <Route path="/jotai" element={<JotaiDemo />} />
          <Route path="/valtio" element={<ValtioDemo />} />
          <Route path="/redux-comparison" element={<ReduxComparison />} />
          <Route path="/atomic-state" element={<AtomicState />} />
          <Route path="/performance" element={<PerformanceComparison />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App