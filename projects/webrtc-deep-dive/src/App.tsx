import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import PeerConnectionsPage from './pages/PeerConnectionsPage'
import MediaStreamsPage from './pages/MediaStreamsPage'
import DataChannelsPage from './pages/DataChannelsPage'
import ScreenSharingPage from './pages/ScreenSharingPage'
import VideoChatPage from './pages/VideoChatPage'
import SignalingPage from './pages/SignalingPage'
import SecurityPage from './pages/SecurityPage'

function App() {
  return (
    <Router basename="/projects/webrtc-deep-dive">
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/peer-connections" element={<PeerConnectionsPage />} />
            <Route path="/media-streams" element={<MediaStreamsPage />} />
            <Route path="/data-channels" element={<DataChannelsPage />} />
            <Route path="/screen-sharing" element={<ScreenSharingPage />} />
            <Route path="/video-chat" element={<VideoChatPage />} />
            <Route path="/signaling" element={<SignalingPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App