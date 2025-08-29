import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ModuleFederationPage from './pages/ModuleFederationPage'
import SingleSpaPage from './pages/SingleSpaPage'
import IframePage from './pages/IframePage'
import WebComponentsPage from './pages/WebComponentsPage'
import StateSharingPage from './pages/StateSharingPage'
import DeploymentPage from './pages/DeploymentPage'
import Navigation from './components/Navigation'
import './styles/index.css'

const App: React.FC = () => {
  return (
    <Router basename="/projects/micro-frontends">
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/module-federation" element={<ModuleFederationPage />} />
            <Route path="/single-spa" element={<SingleSpaPage />} />
            <Route path="/iframe" element={<IframePage />} />
            <Route path="/web-components" element={<WebComponentsPage />} />
            <Route path="/state-sharing" element={<StateSharingPage />} />
            <Route path="/deployment" element={<DeploymentPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App