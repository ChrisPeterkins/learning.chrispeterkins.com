import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import EventLoopPage from './pages/EventLoopPage'
import StreamsPage from './pages/StreamsPage'
import WorkerThreadsPage from './pages/WorkerThreadsPage'
import AsyncPatternsPage from './pages/AsyncPatternsPage'
import BuffersPage from './pages/BuffersPage'
import ClusteringPage from './pages/ClusteringPage'
import PerformancePage from './pages/PerformancePage'

function App() {
  return (
    <Router basename="/projects/nodejs-deep-dive">
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event-loop" element={<EventLoopPage />} />
            <Route path="/streams" element={<StreamsPage />} />
            <Route path="/worker-threads" element={<WorkerThreadsPage />} />
            <Route path="/async-patterns" element={<AsyncPatternsPage />} />
            <Route path="/buffers" element={<BuffersPage />} />
            <Route path="/clustering" element={<ClusteringPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App