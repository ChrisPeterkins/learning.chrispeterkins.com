import React, { useState } from 'react'
import { MockSignalingServer, SignalingStep } from '../webrtc/SignalingServer'

function SignalingPage() {
  const [signalingServer] = useState(() => new MockSignalingServer())
  const [steps, setSteps] = useState<SignalingStep[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const startSignalingProcess = async () => {
    setIsProcessing(true)
    signalingServer.resetSignaling()
    
    signalingServer.onSignalingStepUpdate((updatedSteps) => {
      setSteps([...updatedSteps])
    })

    await signalingServer.simulateSignalingProcess()
    setIsProcessing(false)
  }

  const resetDemo = () => {
    signalingServer.resetSignaling()
    setSteps(signalingServer.getSignalingSteps())
    setIsProcessing(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Signaling & STUN/TURN</h1>
        <p className="page-description">
          Understand how WebRTC peers discover and connect to each other through 
          signaling servers, STUN servers, and TURN relays.
        </p>
      </div>

      <div className="demo-container">
        <h3>Signaling Process Visualization</h3>
        
        <div className="demo-controls">
          <button 
            className="demo-button action-button"
            onClick={startSignalingProcess}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Start Signaling Process'}
          </button>
          <button 
            className="demo-button"
            onClick={resetDemo}
            disabled={isProcessing}
          >
            Reset
          </button>
        </div>

        <div className="signaling-steps">
          {steps.map(step => (
            <div key={step.id} className={`signaling-step ${step.status}`}>
              <div className="step-indicator">
                <span className="step-number">{step.id}</span>
                <div className={`step-status ${step.status}`}>
                  {step.status === 'completed' ? '✅' : 
                   step.status === 'failed' ? '❌' : '⏳'}
                </div>
              </div>
              <div className="step-content">
                <h4>{step.action}</h4>
                <p>{step.description}</p>
                <div className="step-time">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Signaling Architecture</h2>
        <div className="architecture-diagram">
          <div className="peer peer-left">
            <h4>Peer A</h4>
            <div className="peer-actions">
              <div>1. Create Offer</div>
              <div>3. Receive Answer</div>
              <div>5. Exchange ICE</div>
            </div>
          </div>
          
          <div className="signaling-server">
            <h4>Signaling Server</h4>
            <div className="server-note">
              Relays SDP offers/answers<br/>
              and ICE candidates
            </div>
          </div>
          
          <div className="peer peer-right">
            <h4>Peer B</h4>
            <div className="peer-actions">
              <div>2. Receive Offer</div>
              <div>4. Create Answer</div>
              <div>6. Direct Connection</div>
            </div>
          </div>
        </div>

        <div className="stun-turn-section">
          <div className="stun-info">
            <h4>STUN Server</h4>
            <p>Discovers public IP address and port</p>
            <ul>
              <li>NAT traversal</li>
              <li>Public endpoint discovery</li>
              <li>Lightweight protocol</li>
            </ul>
          </div>
          
          <div className="turn-info">
            <h4>TURN Server</h4>
            <p>Relays traffic when direct connection fails</p>
            <ul>
              <li>Symmetric NAT handling</li>
              <li>Firewall traversal</li>
              <li>Higher bandwidth usage</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Implementation Example</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Signaling Implementation</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Signaling server connection
const signalingSocket = new WebSocket('wss://signaling-server.com');

// Peer A: Create and send offer
async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  
  // Send offer through signaling server
  signalingSocket.send(JSON.stringify({
    type: 'offer',
    sdp: offer,
    targetPeer: 'peer-b-id'
  }));
}

// Peer B: Handle incoming offer
signalingSocket.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'offer') {
    await peerConnection.setRemoteDescription(message.sdp);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer back
    signalingSocket.send(JSON.stringify({
      type: 'answer',
      sdp: answer,
      targetPeer: message.fromPeer
    }));
  }
  
  if (message.type === 'ice-candidate') {
    await peerConnection.addIceCandidate(message.candidate);
  }
};

// Handle ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    signalingSocket.send(JSON.stringify({
      type: 'ice-candidate',
      candidate: event.candidate,
      targetPeer: 'peer-b-id'
    }));
  }
};`}</code></pre>
          </div>
        </div>
      </div>

      <style jsx>{`
        .signaling-steps {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .signaling-step {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
          transition: all 0.3s ease;
        }

        .signaling-step.pending {
          background: rgba(107, 114, 128, 0.1);
        }

        .signaling-step.completed {
          background: rgba(26, 93, 58, 0.1);
          border-color: var(--accent-green);
        }

        .signaling-step.failed {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 1.5rem;
        }

        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--accent-green);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .step-status {
          font-size: 1.2rem;
        }

        .step-content {
          flex: 1;
        }

        .step-content h4 {
          margin: 0 0 0.5rem 0;
          color: var(--accent-green-bright);
        }

        .step-content p {
          margin: 0 0 0.5rem 0;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .step-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .architecture-diagram {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          margin: 2rem 0;
          padding: 2rem;
          background: rgba(26, 93, 58, 0.1);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .peer {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
        }

        .peer h4 {
          margin: 0 0 1rem 0;
          color: var(--accent-green-bright);
        }

        .peer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .peer-actions div {
          padding: 0.5rem;
          background: rgba(26, 93, 58, 0.2);
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .signaling-server {
          text-align: center;
          padding: 1.5rem;
          background: var(--code-bg);
          border: 2px solid var(--accent-green);
          border-radius: 8px;
        }

        .signaling-server h4 {
          margin: 0 0 1rem 0;
          color: var(--accent-green-bright);
        }

        .server-note {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .stun-turn-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .stun-info,
        .turn-info {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .stun-info h4,
        .turn-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--accent-green-bright);
        }

        .stun-info p,
        .turn-info p {
          margin: 0 0 1rem 0;
          color: var(--text-secondary);
        }

        .stun-info ul,
        .turn-info ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .stun-info li,
        .turn-info li {
          margin-bottom: 0.25rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .architecture-diagram {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .stun-turn-section {
            grid-template-columns: 1fr;
          }

          .signaling-step {
            flex-direction: column;
            text-align: center;
          }

          .step-indicator {
            margin-right: 0;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default SignalingPage