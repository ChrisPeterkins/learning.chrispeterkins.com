import React, { useEffect, useState } from 'react'

interface BrowserSupport {
  getUserMedia: boolean
  webRTC: boolean
  screenShare: boolean
  dataChannels: boolean
  mediaRecorder: boolean
}

function HomePage() {
  const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(null)

  useEffect(() => {
    checkBrowserSupport()
  }, [])

  const checkBrowserSupport = () => {
    const support: BrowserSupport = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webRTC: !!(window.RTCPeerConnection),
      screenShare: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
      dataChannels: !!(window.RTCPeerConnection && RTCPeerConnection.prototype.createDataChannel),
      mediaRecorder: !!(window.MediaRecorder)
    }
    setBrowserSupport(support)
  }

  const concepts = [
    {
      title: "Peer-to-Peer Communication",
      description: "WebRTC enables direct browser-to-browser communication without servers, reducing latency and improving privacy."
    },
    {
      title: "Media Streaming",
      description: "Access and stream audio/video from cameras, microphones, and screens in real-time with low latency."
    },
    {
      title: "Data Channels",
      description: "Send arbitrary data between peers including text, files, and binary data with customizable delivery guarantees."
    },
    {
      title: "NAT Traversal",
      description: "STUN and TURN servers help establish connections through firewalls and NAT devices."
    },
    {
      title: "Signaling Protocol",
      description: "Exchange connection metadata and negotiate session parameters before establishing P2P connections."
    },
    {
      title: "Built-in Security",
      description: "Mandatory encryption (DTLS/SRTP) ensures all WebRTC communications are secure by default."
    }
  ]

  const architectureSteps = [
    {
      step: "1",
      title: "Signaling",
      description: "Peers exchange session descriptions and ICE candidates through a signaling server"
    },
    {
      step: "2", 
      title: "STUN/TURN",
      description: "Discover public IP addresses and relay traffic through TURN servers when needed"
    },
    {
      step: "3",
      title: "ICE Negotiation",
      description: "Interactive Connectivity Establishment finds the best path for peer connection"
    },
    {
      step: "4",
      title: "DTLS Handshake",
      description: "Establish encrypted connection using Datagram Transport Layer Security"
    },
    {
      step: "5",
      title: "Media/Data Flow",
      description: "Direct peer-to-peer communication with audio, video, and data streams"
    }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>WebRTC Deep Dive</h1>
        <p className="page-description">
          Explore Web Real-Time Communication (WebRTC) through interactive demos and comprehensive examples. 
          Learn how to build real-time applications with peer-to-peer audio, video, and data sharing.
        </p>
      </div>

      {/* Browser Support Check */}
      <div className="demo-container">
        <h3>Browser Support Check</h3>
        <div className="support-grid">
          {browserSupport && Object.entries(browserSupport).map(([feature, supported]) => (
            <div key={feature} className={`support-item ${supported ? 'supported' : 'not-supported'}`}>
              <div className="support-icon">
                {supported ? '✅' : '❌'}
              </div>
              <div className="support-label">
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WebRTC Concepts */}
      <div className="section">
        <h2>Core WebRTC Concepts</h2>
        <div className="concept-grid">
          {concepts.map((concept, index) => (
            <div key={index} className="concept-card">
              <h3>{concept.title}</h3>
              <p>{concept.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WebRTC Architecture */}
      <div className="section">
        <h2>WebRTC Connection Architecture</h2>
        <div className="architecture-container">
          <div className="architecture-diagram">
            {architectureSteps.map((item, index) => (
              <div key={index} className="architecture-step">
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                {index < architectureSteps.length - 1 && (
                  <div className="step-arrow">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="section">
        <h2>Basic WebRTC Example</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Creating a Peer Connection</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Create a new RTCPeerConnection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});

// Get user media (camera/microphone)
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// Add local stream to peer connection
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// Handle remote stream
peerConnection.ontrack = (event) => {
  const remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.srcObject = event.streams[0];
};

// Create and send offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
// Send offer through signaling server...`}</code></pre>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="section">
        <h2>WebRTC Use Cases</h2>
        <div className="use-cases-grid">
          <div className="use-case-item">
            <h4>Video Conferencing</h4>
            <p>Real-time video calls with multiple participants</p>
            <div className="use-case-examples">
              <span className="example-tag">Zoom</span>
              <span className="example-tag">Google Meet</span>
              <span className="example-tag">Discord</span>
            </div>
          </div>
          <div className="use-case-item">
            <h4>File Sharing</h4>
            <p>Direct peer-to-peer file transfers without servers</p>
            <div className="use-case-examples">
              <span className="example-tag">WeTransfer</span>
              <span className="example-tag">FilePizza</span>
              <span className="example-tag">ShareDrop</span>
            </div>
          </div>
          <div className="use-case-item">
            <h4>Gaming</h4>
            <p>Real-time multiplayer games with low latency</p>
            <div className="use-case-examples">
              <span className="example-tag">.io Games</span>
              <span className="example-tag">Browser MMOs</span>
              <span className="example-tag">Turn-based</span>
            </div>
          </div>
          <div className="use-case-item">
            <h4>IoT & Streaming</h4>
            <p>Remote monitoring and control applications</p>
            <div className="use-case-examples">
              <span className="example-tag">IP Cameras</span>
              <span className="example-tag">Remote Desktop</span>
              <span className="example-tag">Live Streaming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="section">
        <h2>Recommended Learning Path</h2>
        <div className="learning-path">
          <div className="learning-step">
            <div className="step-indicator">1</div>
            <div className="step-info">
              <h4>Media Streams</h4>
              <p>Start with camera and microphone access</p>
            </div>
          </div>
          <div className="learning-step">
            <div className="step-indicator">2</div>
            <div className="step-info">
              <h4>Peer Connections</h4>
              <p>Understand the connection lifecycle</p>
            </div>
          </div>
          <div className="learning-step">
            <div className="step-indicator">3</div>
            <div className="step-info">
              <h4>Signaling</h4>
              <p>Learn how peers find and connect to each other</p>
            </div>
          </div>
          <div className="learning-step">
            <div className="step-indicator">4</div>
            <div className="step-info">
              <h4>Data Channels</h4>
              <p>Send custom data between peers</p>
            </div>
          </div>
          <div className="learning-step">
            <div className="step-indicator">5</div>
            <div className="step-info">
              <h4>Advanced Features</h4>
              <p>Screen sharing, recording, and security</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .support-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .support-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          background: rgba(26, 93, 58, 0.1);
        }

        .support-item.supported {
          border: 1px solid var(--accent-green);
        }

        .support-item.not-supported {
          border: 1px solid #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .support-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .support-label {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .architecture-container {
          margin-top: 2rem;
        }

        .architecture-diagram {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .architecture-step {
          display: flex;
          align-items: center;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-green);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          font-weight: bold;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
          padding: 1rem;
          background: rgba(26, 93, 58, 0.1);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .step-content h4 {
          margin: 0 0 0.5rem 0;
          color: var(--accent-green-bright);
        }

        .step-content p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .step-arrow {
          position: absolute;
          left: 20px;
          top: 50px;
          color: var(--accent-green);
          font-size: 1.2rem;
          transform: rotate(90deg);
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .use-case-item {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .use-case-item h4 {
          margin: 0 0 0.5rem 0;
          color: var(--accent-green-bright);
        }

        .use-case-item p {
          margin: 0 0 1rem 0;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .use-case-examples {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .example-tag {
          background: rgba(26, 93, 58, 0.3);
          color: var(--text-primary);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          border: 1px solid var(--border-primary);
        }

        .learning-path {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .learning-step {
          display: flex;
          align-items: center;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-green), var(--accent-green-bright));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          font-weight: bold;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .step-info {
          flex: 1;
        }

        .step-info h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .step-info p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .architecture-step {
            flex-direction: column;
            text-align: center;
          }

          .step-number {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }

          .step-arrow {
            display: none;
          }

          .learning-step {
            flex-direction: column;
            text-align: center;
          }

          .step-indicator {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage