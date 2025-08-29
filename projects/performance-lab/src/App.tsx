import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BundleAnalysis from './pages/BundleAnalysis'
import LazyLoading from './pages/LazyLoading'
import CodeSplitting from './pages/CodeSplitting'
import PerformanceMetrics from './pages/PerformanceMetrics'
import ImageOptimization from './pages/ImageOptimization'
import Virtualization from './pages/Virtualization'

function App() {
  return (
    <Router basename="/projects/performance-lab">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bundle-analysis" element={<BundleAnalysis />} />
          <Route path="/lazy-loading" element={<LazyLoading />} />
          <Route path="/code-splitting" element={<CodeSplitting />} />
          <Route path="/metrics" element={<PerformanceMetrics />} />
          <Route path="/images" element={<ImageOptimization />} />
          <Route path="/virtualization" element={<Virtualization />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App