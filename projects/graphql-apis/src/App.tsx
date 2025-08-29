import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import GraphQLBasicsPage from './pages/GraphQLBasicsPage'
import SchemasTypesPage from './pages/SchemasTypesPage'
import QueriesMutationsPage from './pages/QueriesMutationsPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import RestVsGraphQLPage from './pages/RestVsGraphQLPage'
import APIDesignPage from './pages/APIDesignPage'
import RealTimeAPIsPage from './pages/RealTimeAPIsPage'

function App() {
  return (
    <Router basename="/projects/graphql-apis">
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/graphql-basics" element={<GraphQLBasicsPage />} />
            <Route path="/schemas-types" element={<SchemasTypesPage />} />
            <Route path="/queries-mutations" element={<QueriesMutationsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/rest-vs-graphql" element={<RestVsGraphQLPage />} />
            <Route path="/api-design" element={<APIDesignPage />} />
            <Route path="/realtime-apis" element={<RealTimeAPIsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App