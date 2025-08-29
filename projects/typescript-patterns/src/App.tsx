import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import TypeGuardsPage from './pages/TypeGuardsPage'
import GenericsPage from './pages/GenericsPage'
import UtilityTypesPage from './pages/UtilityTypesPage'
import DecoratorPatternsPage from './pages/DecoratorPatternsPage'
import AdvancedTypesPage from './pages/AdvancedTypesPage'
import PatternMatchingPage from './pages/PatternMatchingPage'

function App() {
  return (
    <Router basename="/projects/typescript-patterns">
      <div className="layout">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/type-guards" element={<TypeGuardsPage />} />
            <Route path="/generics" element={<GenericsPage />} />
            <Route path="/utility-types" element={<UtilityTypesPage />} />
            <Route path="/decorators" element={<DecoratorPatternsPage />} />
            <Route path="/advanced-types" element={<AdvancedTypesPage />} />
            <Route path="/pattern-matching" element={<PatternMatchingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App