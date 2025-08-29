import React, { useState, useEffect, useRef } from 'react'
import { WebRTCPeerConnection, ConnectionState } from '../webrtc/PeerConnection'
import { MockSignalingServer } from '../webrtc/SignalingServer'

function PeerConnectionsPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [peerA, setPeerA] = useState<WebRTCPeerConnection | null>(null)
  const [peerB, setPeerB] = useState<WebRTCPeerConnection | null>(null)
  const [signalingServer] = useState(() => new MockSignalingServer())
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

  const createPeerConnection = () => {
    if (peerA || peerB) {
      cleanup()
    }

    addLog('Creating Peer Connection A and B')
    
    const pcA = new WebRTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    const pcB = new WebRTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    // Set up state monitoring for Peer A
    pcA.onStateChangeListener((state) => {
      setConnectionState(state)
      addLog(`Peer A - Connection: ${state.connectionState}, ICE: ${state.iceConnectionState}, Signaling: ${state.signalingState}`)
    })

    setPeerA(pcA)
    setPeerB(pcB)
    addLog('Peer connections created successfully')
  }

  const establishConnection = async () => {
    if (!peerA || !peerB) {
      addLog('Error: Peer connections not created')
      return
    }

    setIsConnecting(true)
    addLog('Starting connection establishment process...')

    try {
      // Step 1: Create data channel on Peer A
      addLog('Creating data channel on Peer A')
      peerA.createDataChannel('demo-channel', { ordered: true })

      // Step 2: Create offer from Peer A
      addLog('Creating offer from Peer A')
      const offer = await peerA.createOffer()
      addLog(`Offer created: ${offer.type}`)

      // Step 3: Set remote description on Peer B
      addLog('Setting remote description on Peer B')
      await peerB.setRemoteDescription(offer)

      // Step 4: Create answer from Peer B
      addLog('Creating answer from Peer B')
      const answer = await peerB.createAnswer()
      addLog(`Answer created: ${answer.type}`)

      // Step 5: Set remote description on Peer A
      addLog('Setting remote description on Peer A')
      await peerA.setRemoteDescription(answer)

      // Simulate ICE candidate exchange
      addLog('Simulating ICE candidate exchange...')
      setTimeout(() => {
        addLog('ICE candidates exchanged')
        addLog('Connection establishment process completed')
        setIsConnecting(false)
      }, 2000)

    } catch (error) {
      addLog(`Error during connection: ${error}`)
      setIsConnecting(false)
    }
  }

  const testDataChannel = () => {
    if (!peerA) {
      addLog('Error: Peer A not available')
      return
    }

    const testMessage = `Test message at ${new Date().toLocaleTimeString()}`
    peerA.sendDataChannelMessage(testMessage)
    addLog(`Sent test message: ${testMessage}`)
  }

  const cleanup = () => {
    if (peerA) {
      peerA.close()
      setPeerA(null)
    }
    if (peerB) {
      peerB.close()
      setPeerB(null)
    }
    setConnectionState(null)
    addLog('Peer connections closed and cleaned up')
  }

  const clearLogs = () => {
    setLogs([])
  }

  const connectionStates = [
    { state: 'new', description: 'Initial state when peer connection is created' },
    { state: 'connecting', description: 'ICE agent is gathering addresses and attempting to connect' },
    { state: 'connected', description: 'ICE agent has found a working connection' },
    { state: 'disconnected', description: 'Previously connected, now disconnected (may reconnect)' },
    { state: 'failed', description: 'Connection permanently failed' },
    { state: 'closed', description: 'Connection is closed and will not reopen' }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Peer Connections</h1>
        <p className="page-description">
          Explore the WebRTC peer connection lifecycle with interactive demonstrations. 
          Learn how peers establish direct connections and exchange data.
        </p>
      </div>

      {/* Current Connection State */}
      {connectionState && (
        <div className="demo-container">
          <h3>Current Connection State</h3>
          <div className="connection-status-grid">
            <div className="status-item">
              <label>Connection State</label>
              <span className={`status-badge status-${connectionState.connectionState}`}>
                {connectionState.connectionState}
              </span>
            </div>
            <div className="status-item">
              <label>ICE Connection</label>
              <span className={`status-badge status-${connectionState.iceConnectionState}`}>
                {connectionState.iceConnectionState}
              </span>
            </div>
            <div className="status-item">
              <label>ICE Gathering</label>
              <span className={`status-badge status-${connectionState.iceGatheringState}`}>
                {connectionState.iceGatheringState}
              </span>
            </div>
            <div className="status-item">
              <label>Signaling State</label>
              <span className={`status-badge status-${connectionState.signalingState}`}>
                {connectionState.signalingState}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="demo-container">
        <h3>Peer Connection Demo</h3>
        <div className="demo-controls">
          <button 
            className="demo-button" 
            onClick={createPeerConnection}
            disabled={isConnecting}
          >
            Create Peer Connections
          </button>
          <button 
            className="demo-button" 
            onClick={establishConnection}
            disabled={!peerA || !peerB || isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Establish Connection'}
          </button>
          <button 
            className="demo-button" 
            onClick={testDataChannel}
            disabled={!peerA || connectionState?.connectionState !== 'connected'}
          >
            Test Data Channel
          </button>
          <button 
            className="demo-button" 
            onClick={cleanup}
            style={{ background: '#ef4444' }}
          >
            Cleanup
          </button>
        </div>

        {/* Connection Logs */}
        <div className="logs-container">
          <div className="logs-header">
            <h4>Connection Logs</h4>
            <button className="demo-button" onClick={clearLogs}>Clear</button>
          </div>
          <div className="logs-content">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* Connection State Explanation */}
      <div className="section">
        <h2>Connection States Explained</h2>
        <div className="states-grid">
          {connectionStates.map((item, index) => (
            <div key={index} className="state-card">
              <div className={`state-indicator state-${item.state}`}>
                {item.state}
              </div>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="section">
        <h2>Peer Connection Lifecycle Code</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Complete Connection Example</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Create peer connections
const peerA = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
const peerB = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// Monitor connection state changes
peerA.addEventListener('connectionstatechange', () => {
  console.log('Connection state:', peerA.connectionState);
});

// Create data channel
const dataChannel = peerA.createDataChannel('messages');

// Establish connection
async function connect() {
  // 1. Create offer
  const offer = await peerA.createOffer();
  await peerA.setLocalDescription(offer);
  
  // 2. Send offer to peer B (via signaling server)
  await peerB.setRemoteDescription(offer);
  
  // 3. Create answer
  const answer = await peerB.createAnswer();
  await peerB.setLocalDescription(answer);
  
  // 4. Send answer back to peer A
  await peerA.setRemoteDescription(answer);
  
  // 5. Handle ICE candidates
  peerA.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      peerB.addIceCandidate(event.candidate);
    }
  });
}

connect();`}</code></pre>
          </div>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="section">
        <h2>Connection Flow Diagram</h2>
        <div className="connection-flow">
          <div className="peer-box peer-a">
            <h4>Peer A (Caller)</h4>
            <div className="peer-steps">
              <div className="step">1. Create Offer</div>
              <div className="step">3. Set Remote Answer</div>
              <div className="step">5. Exchange ICE</div>
            </div>
          </div>
          
          <div className="signaling-arrow">
            <div className="arrow-label">Signaling Server</div>
            <div className="arrow">↔</div>
          </div>
          
          <div className="peer-box peer-b">
            <h4>Peer B (Callee)</h4>
            <div className="peer-steps">
              <div className="step">2. Set Remote Offer</div>
              <div className="step">4. Create Answer</div>
              <div className="step">6. Direct P2P Connection</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .connection-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(26, 93, 58, 0.1);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .status-item label {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          text-align: center;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }

        .status-new { background: #6b7280; color: white; }
        .status-connecting { background: #f59e0b; color: white; }
        .status-connected { background: var(--accent-green); color: white; }
        .status-disconnected { background: #ef4444; color: white; }
        .status-failed { background: #dc2626; color: white; }
        .status-closed { background: #374151; color: white; }
        .status-stable { background: var(--accent-green); color: white; }
        .status-gathering { background: #f59e0b; color: white; }
        .status-complete { background: var(--accent-green); color: white; }

        .logs-container {
          margin-top: 2rem;
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          background: var(--code-bg);
        }

        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .logs-header h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .logs-content {
          padding: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .log-entry {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
          padding: 0.25rem;
          border-left: 2px solid transparent;
        }

        .log-entry:hover {
          background: rgba(26, 93, 58, 0.1);
          border-left-color: var(--accent-green);
        }

        .states-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }

        .state-card {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .state-indicator {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .connection-flow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2rem;
          background: rgba(26, 93, 58, 0.1);
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .peer-box {
          flex: 1;
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
        }

        .peer-box h4 {
          margin: 0 0 1rem 0;
          color: var(--accent-green-bright);
        }

        .peer-steps {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .step {
          padding: 0.5rem;
          background: rgba(26, 93, 58, 0.2);
          border-radius: 4px;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .signaling-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 2rem;
        }

        .arrow-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .arrow {
          font-size: 2rem;
          color: var(--accent-green-bright);
        }

        @media (max-width: 768px) {
          .connection-flow {
            flex-direction: column;
            gap: 1rem;
          }

          .signaling-arrow {
            margin: 0;
            transform: rotate(90deg);
          }

          .connection-status-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default PeerConnectionsPage