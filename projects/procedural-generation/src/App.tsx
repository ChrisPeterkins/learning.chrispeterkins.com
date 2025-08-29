import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TerrainGenerationPage from './pages/TerrainGenerationPage'
import LSystemsPage from './pages/LSystemsPage'
import NoiseFieldsPage from './pages/NoiseFieldsPage'
import DungeonGenerationPage from './pages/DungeonGenerationPage'
import WorldBuildingPage from './pages/WorldBuildingPage'
import MazeGenerationPage from './pages/MazeGenerationPage'
import CaveSystemsPage from './pages/CaveSystemsPage'
import VegetationPage from './pages/VegetationPage'

function App() {
  return (
    <Router basename="/projects/procedural-generation">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="terrain-generation" element={<TerrainGenerationPage />} />
          <Route path="l-systems" element={<LSystemsPage />} />
          <Route path="noise-fields" element={<NoiseFieldsPage />} />
          <Route path="dungeon-generation" element={<DungeonGenerationPage />} />
          <Route path="world-building" element={<WorldBuildingPage />} />
          <Route path="maze-generation" element={<MazeGenerationPage />} />
          <Route path="cave-systems" element={<CaveSystemsPage />} />
          <Route path="vegetation" element={<VegetationPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App