import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import HooksPage from './pages/HooksPage'
import PatternsPage from './pages/PatternsPage'
import StateManagementPage from './pages/StateManagementPage'
import UseStatePage from './pages/hooks/UseStatePage'
import UseEffectPage from './pages/hooks/UseEffectPage'
import UseContextPage from './pages/hooks/UseContextPage'
import UseReducerPage from './pages/hooks/UseReducerPage'
import CustomHooksPage from './pages/hooks/CustomHooksPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="*" element={<HomePage />} />
        <Route path="/projects/react-patterns" element={<HomePage />} />
        <Route path="/projects/react-patterns/hooks" element={<HooksPage />} />
        <Route path="/projects/react-patterns/hooks/useState" element={<UseStatePage />} />
        <Route path="/projects/react-patterns/hooks/useEffect" element={<UseEffectPage />} />
        <Route path="/projects/react-patterns/hooks/useContext" element={<UseContextPage />} />
        <Route path="/projects/react-patterns/hooks/useReducer" element={<UseReducerPage />} />
        <Route path="/projects/react-patterns/hooks/custom" element={<CustomHooksPage />} />
        <Route path="/projects/react-patterns/patterns" element={<PatternsPage />} />
        <Route path="/projects/react-patterns/state-management" element={<StateManagementPage />} />
      </Routes>
    </Layout>
  )
}

export default App