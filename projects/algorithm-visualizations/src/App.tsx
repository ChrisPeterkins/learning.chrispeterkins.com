import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import SortingAlgorithmsPage from './pages/SortingAlgorithmsPage'
import SearchingAlgorithmsPage from './pages/SearchingAlgorithmsPage'
import GraphAlgorithmsPage from './pages/GraphAlgorithmsPage'
import PathfindingPage from './pages/PathfindingPage'
import TreeTraversalsPage from './pages/TreeTraversalsPage'
import DynamicProgrammingPage from './pages/DynamicProgrammingPage'
import DataStructuresPage from './pages/DataStructuresPage'

function App() {
  return (
    <Router basename="/projects/algorithm-visualizations">
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sorting" element={<SortingAlgorithmsPage />} />
            <Route path="/searching" element={<SearchingAlgorithmsPage />} />
            <Route path="/graph" element={<GraphAlgorithmsPage />} />
            <Route path="/pathfinding" element={<PathfindingPage />} />
            <Route path="/trees" element={<TreeTraversalsPage />} />
            <Route path="/dynamic-programming" element={<DynamicProgrammingPage />} />
            <Route path="/data-structures" element={<DataStructuresPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App