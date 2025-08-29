import React from 'react'

function SecurityPage() {
  const securityFeatures = [
    {
      title: "Mandatory Encryption",
      description: "All WebRTC communications are encrypted by default using DTLS and SRTP protocols.",
      details: ["DTLS for data channels", "SRTP for media streams", "Perfect Forward Secrecy", "Key rotation"]
    },
    {
      title: "Identity Verification", 
      description: "Cryptographic identity verification prevents man-in-the-middle attacks.",
      details: ["DTLS fingerprint verification", "Certificate validation", "Secure key exchange", "Peer authentication"]
    },
    {
      title: "Same-Origin Policy",
      description: "WebRTC respects browser security policies and requires user consent.",
      details: ["getUserMedia permissions", "HTTPS requirement", "Cross-origin restrictions", "User gesture requirements"]
    },
    {
      title: "NAT Traversal Security",
      description: "Secure handling of firewall and NAT traversal with ICE framework.",
      details: ["ICE candidate filtering", "TURN authentication", "Consent freshness", "Binding request validation"]
    }
  ]

  const vulnerabilities = [
    {
      title: "IP Address Leakage",
      severity: "Medium",
      description: "Local and public IP addresses can be discovered through ICE gathering.",
      mitigation: "Use VPN, disable WebRTC, or use proxy TURN servers"
    },
    {
      title: "Fingerprinting",
      severity: "Low", 
      description: "Device and browser fingerprinting through codec support and capabilities.",
      mitigation: "Standardize codec lists and limit capability exposure"
    },
    {
      title: "Resource Exhaustion",
      severity: "Medium",
      description: "Potential DoS attacks through excessive connection attempts.",
      mitigation: "Rate limiting, connection limits, and resource monitoring"
    }
  ]

  const bestPractices = [
    "Always use HTTPS for signaling servers",
    "Implement proper authentication for signaling",
    "Validate all incoming data and messages", 
    "Use secure TURN servers with authentication",
    "Implement connection limits and rate limiting",
    "Regularly audit and update dependencies",
    "Monitor for suspicious connection patterns",
    "Consider using TURN servers exclusively for sensitive applications"
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>WebRTC Security</h1>
        <p className="page-description">
          Learn about WebRTC security features, potential vulnerabilities, and best practices 
          for building secure real-time communication applications.
        </p>
      </div>

      {/* Security Features */}
      <div className="section">
        <h2>Built-in Security Features</h2>
        <div className="security-features-grid">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="security-feature">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul>
                {feature.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Potential Vulnerabilities */}
      <div className="section">
        <h2>Security Considerations</h2>
        <div className="vulnerabilities-list">
          {vulnerabilities.map((vuln, index) => (
            <div key={index} className="vulnerability-card">
              <div className="vulnerability-header">
                <h4>{vuln.title}</h4>
                <span className={`severity-badge severity-${vuln.severity.toLowerCase()}`}>
                  {vuln.severity}
                </span>
              </div>
              <p className="vulnerability-description">{vuln.description}</p>
              <div className="mitigation">
                <strong>Mitigation:</strong> {vuln.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encryption Details */}
      <div className="section">
        <h2>Encryption Protocols</h2>
        <div className="encryption-details">
          <div className="protocol-card">
            <h4>DTLS (Datagram Transport Layer Security)</h4>
            <p>Provides encryption for data channels</p>
            <ul>
              <li>Based on TLS 1.2/1.3</li>
              <li>Handles packet loss and reordering</li>
              <li>Perfect Forward Secrecy</li>
              <li>Certificate-based authentication</li>
            </ul>
          </div>
          
          <div className="protocol-card">
            <h4>SRTP (Secure Real-time Transport Protocol)</h4>
            <p>Encrypts audio and video streams</p>
            <ul>
              <li>AES encryption for media</li>
              <li>HMAC authentication</li>
              <li>Replay attack protection</li>
              <li>Key derivation functions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="section">
        <h2>Security Best Practices</h2>
        <div className="best-practices">
          <div className="practices-list">
            {bestPractices.map((practice, index) => (
              <div key={index} className="practice-item">
                <span className="practice-check">✅</span>
                <span className="practice-text">{practice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="section">
        <h2>Secure Implementation Example</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Secure WebRTC Setup</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Secure peer connection configuration
const secureConfig = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'authenticated-user',
      credential: 'secure-password'
    }
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

const peerConnection = new RTCPeerConnection(secureConfig);

// Validate signaling messages
function validateSignalingMessage(message) {
  if (!message || typeof message !== 'object') {
    throw new Error('Invalid message format');
  }
  
  if (!['offer', 'answer', 'ice-candidate'].includes(message.type)) {
    throw new Error('Invalid message type');
  }
  
  // Additional validation logic...
  return true;
}

// Secure data channel creation
const dataChannel = peerConnection.createDataChannel('secure-channel', {
  ordered: true,
  protocol: 'secure-protocol-v1'
});

// Handle data channel messages securely
dataChannel.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    
    // Validate incoming data
    if (validateIncomingData(data)) {
      processSecureData(data);
    }
  } catch (error) {
    console.error('Invalid data received:', error);
  }
};

// Implement connection monitoring
peerConnection.onconnectionstatechange = () => {
  if (peerConnection.connectionState === 'failed') {
    console.warn('Connection failed - potential security issue');
    handleConnectionFailure();
  }
};`}</code></pre>
          </div>
        </div>
      </div>

      {/* Security Checklist */}
      <div className="section">
        <h2>Security Checklist</h2>
        <div className="security-checklist">
          <div className="checklist-category">
            <h4>Development Phase</h4>
            <div className="checklist-items">
              <div className="checklist-item">Use HTTPS for all signaling</div>
              <div className="checklist-item">Implement input validation</div>
              <div className="checklist-item">Use authenticated TURN servers</div>
              <div className="checklist-item">Sanitize user inputs</div>
            </div>
          </div>
          
          <div className="checklist-category">
            <h4>Deployment Phase</h4>
            <div className="checklist-items">
              <div className="checklist-item">Configure secure headers</div>
              <div className="checklist-item">Monitor connection patterns</div>
              <div className="checklist-item">Implement rate limiting</div>
              <div className="checklist-item">Regular security audits</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .security-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .security-feature {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 2rem;
          border-radius: 8px;
        }

        .security-feature h3 {
          margin: 0 0 1rem 0;
          color: var(--accent-green-bright);
        }

        .security-feature p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .security-feature ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .security-feature li {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .vulnerabilities-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .vulnerability-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .vulnerability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .vulnerability-header h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .severity-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .severity-high {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        .severity-medium {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }

        .severity-low {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid #22c55e;
        }

        .vulnerability-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .mitigation {
          color: var(--text-secondary);
          background: rgba(26, 93, 58, 0.1);
          padding: 1rem;
          border-radius: 4px;
        }

        .encryption-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .protocol-card {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .protocol-card h4 {
          margin: 0 0 0.5rem 0;
          color: var(--accent-green-bright);
        }

        .protocol-card p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .protocol-card ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .protocol-card li {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .best-practices {
          margin-top: 2rem;
        }

        .practices-list {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 2rem;
          border-radius: 8px;
        }

        .practice-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .practice-check {
          font-size: 1.2rem;
        }

        .practice-text {
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .security-checklist {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .checklist-category {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .checklist-category h4 {
          margin: 0 0 1rem 0;
          color: var(--accent-green-bright);
        }

        .checklist-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: rgba(26, 93, 58, 0.2);
          border-radius: 4px;
          color: var(--text-secondary);
          position: relative;
          padding-left: 2rem;
        }

        .checklist-item::before {
          content: '☐';
          position: absolute;
          left: 0.5rem;
          color: var(--accent-green-bright);
        }

        @media (max-width: 768px) {
          .vulnerability-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default SecurityPage