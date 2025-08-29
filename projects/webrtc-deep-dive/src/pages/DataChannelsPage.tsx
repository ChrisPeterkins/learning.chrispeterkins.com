import React, { useState, useRef } from 'react'

function DataChannelsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Array<{id: string, text: string, timestamp: number, sender: string}>>([])
  const [messageText, setMessageText] = useState('')
  const [transferProgress, setTransferProgress] = useState(0)
  const [isTransferring, setIsTransferring] = useState(false)
  
  const peerConnectionA = useRef<RTCPeerConnection | null>(null)
  const peerConnectionB = useRef<RTCPeerConnection | null>(null)
  const dataChannelA = useRef<RTCDataChannel | null>(null)
  const dataChannelB = useRef<RTCDataChannel | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPeerConnection = async () => {
    // Create peer connections
    const pcA = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    const pcB = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

    peerConnectionA.current = pcA
    peerConnectionB.current = pcB

    // Create data channel on peer A
    const channelA = pcA.createDataChannel('messages', { ordered: true })
    dataChannelA.current = channelA

    // Handle data channel events
    channelA.onopen = () => {
      setIsConnected(true)
      addMessage('Data channel opened', 'System')
    }

    channelA.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        addMessage(data.text, 'Peer B')
      } else if (data.type === 'file-chunk') {
        handleFileChunk(data)
      }
    }

    // Handle data channel on peer B
    pcB.ondatachannel = (event) => {
      const channelB = event.channel
      dataChannelB.current = channelB

      channelB.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          addMessage(data.text, 'Peer A')
        } else if (data.type === 'file-chunk') {
          handleFileChunk(data)
        }
      }
    }

    // Establish connection
    try {
      const offer = await pcA.createOffer()
      await pcA.setLocalDescription(offer)
      await pcB.setRemoteDescription(offer)

      const answer = await pcB.createAnswer()
      await pcB.setLocalDescription(answer)
      await pcA.setRemoteDescription(answer)

      addMessage('Peer connection established', 'System')
    } catch (error) {
      addMessage(`Connection failed: ${error}`, 'System')
    }
  }

  const addMessage = (text: string, sender: string) => {
    const message = {
      id: Math.random().toString(36),
      text,
      timestamp: Date.now(),
      sender
    }
    setMessages(prev => [...prev, message])
  }

  const sendMessage = () => {
    if (!messageText.trim() || !dataChannelA.current || dataChannelA.current.readyState !== 'open') return

    const data = {
      type: 'message',
      text: messageText,
      timestamp: Date.now()
    }

    dataChannelA.current.send(JSON.stringify(data))
    addMessage(messageText, 'You')
    setMessageText('')
  }

  const sendFile = async (file: File) => {
    if (!dataChannelA.current || dataChannelA.current.readyState !== 'open') return

    setIsTransferring(true)
    setTransferProgress(0)

    const chunkSize = 16384 // 16KB chunks
    const totalChunks = Math.ceil(file.size / chunkSize)

    addMessage(`Sending file: ${file.name} (${formatFileSize(file.size)})`, 'You')

    // Send file metadata
    const fileInfo = {
      type: 'file-info',
      name: file.name,
      size: file.size,
      totalChunks
    }
    dataChannelA.current.send(JSON.stringify(fileInfo))

    // Send file chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const arrayBuffer = await chunk.arrayBuffer()
      const base64Data = arrayBufferToBase64(arrayBuffer)
      
      const chunkData = {
        type: 'file-chunk',
        index: i,
        data: base64Data
      }

      dataChannelA.current.send(JSON.stringify(chunkData))
      setTransferProgress((i + 1) / totalChunks * 100)

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    setIsTransferring(false)
    addMessage(`File sent successfully: ${file.name}`, 'System')
  }

  const handleFileChunk = (chunkData: any) => {
    // This is a simplified version - in a real app you'd reassemble the file
    addMessage(`Received file chunk ${chunkData.index}`, 'System')
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(byte => binary += String.fromCharCode(byte))
    return btoa(binary)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      sendFile(file)
    }
  }

  const testPerformance = () => {
    if (!dataChannelA.current || dataChannelA.current.readyState !== 'open') return

    const testSize = 1024 * 100 // 100KB
    const testData = 'x'.repeat(testSize)
    const startTime = performance.now()

    dataChannelA.current.send(JSON.stringify({
      type: 'performance-test',
      data: testData,
      startTime
    }))

    const endTime = performance.now()
    const throughput = (testSize * 8) / ((endTime - startTime) / 1000) / 1024 / 1024 // Mbps
    addMessage(`Performance test: ${throughput.toFixed(2)} Mbps`, 'System')
  }

  const closeConnection = () => {
    if (peerConnectionA.current) {
      peerConnectionA.current.close()
      peerConnectionA.current = null
    }
    if (peerConnectionB.current) {
      peerConnectionB.current.close()
      peerConnectionB.current = null
    }
    dataChannelA.current = null
    dataChannelB.current = null
    setIsConnected(false)
    addMessage('Connection closed', 'System')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Data Channels</h1>
        <p className="page-description">
          Explore WebRTC Data Channels for peer-to-peer data transfer. Send messages, files, 
          and custom data directly between browsers without servers.
        </p>
      </div>

      {/* Connection Status */}
      <div className="demo-container">
        <h3>Data Channel Connection</h3>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="demo-controls">
            <button 
              className="demo-button action-button"
              onClick={createPeerConnection}
              disabled={isConnected}
            >
              Connect Peers
            </button>
            <button 
              className="demo-button"
              onClick={closeConnection}
              disabled={!isConnected}
              style={{ background: '#ef4444' }}
            >
              Close Connection
            </button>
            <button 
              className="demo-button"
              onClick={testPerformance}
              disabled={!isConnected}
            >
              Test Performance
            </button>
          </div>
        </div>
      </div>

      {/* Message Chat */}
      <div className="demo-container">
        <h3>Text Messaging</h3>
        <div className="chat-container">
          <div className="messages-area">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}>
                <div className="message-sender">{message.sender}</div>
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="message-input-area">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="message-input"
            />
            <button 
              className="demo-button action-button"
              onClick={sendMessage}
              disabled={!isConnected || !messageText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* File Transfer */}
      <div className="demo-container">
        <h3>File Transfer</h3>
        <div className="file-transfer-area">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={!isConnected || isTransferring}
            style={{ display: 'none' }}
          />
          
          <button
            className="demo-button action-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isTransferring}
          >
            {isTransferring ? 'Transferring...' : 'Select File to Send'}
          </button>
          
          {isTransferring && (
            <div className="transfer-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${transferProgress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(transferProgress)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Code Examples */}
      <div className="section">
        <h2>Data Channel Implementation</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Creating Data Channels</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Create data channel on sender
const dataChannel = peerConnection.createDataChannel('myChannel', {
  ordered: true,        // Guarantee message order
  maxRetransmits: 3,    // Retry failed messages
  protocol: 'my-protocol'
});

// Handle data channel events
dataChannel.onopen = () => {
  console.log('Data channel opened');
};

dataChannel.onmessage = (event) => {
  console.log('Message received:', event.data);
};

dataChannel.onerror = (error) => {
  console.error('Data channel error:', error);
};

// Send messages
dataChannel.send('Hello, peer!');
dataChannel.send(JSON.stringify({ type: 'data', value: 123 }));`}</code></pre>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">File Transfer Implementation</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Send file in chunks
async function sendFile(file, dataChannel) {
  const chunkSize = 16384; // 16KB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  // Send file metadata
  dataChannel.send(JSON.stringify({
    type: 'file-info',
    name: file.name,
    size: file.size,
    totalChunks
  }));
  
  // Send file chunks
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const arrayBuffer = await chunk.arrayBuffer();
    dataChannel.send(arrayBuffer);
    
    // Optional: add delay to prevent overwhelming
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

// Receive and reconstruct file
let receivedChunks = [];
let fileInfo = null;

dataChannel.onmessage = (event) => {
  if (typeof event.data === 'string') {
    const message = JSON.parse(event.data);
    if (message.type === 'file-info') {
      fileInfo = message;
      receivedChunks = [];
    }
  } else {
    // Binary data (file chunk)
    receivedChunks.push(event.data);
    
    if (receivedChunks.length === fileInfo.totalChunks) {
      const blob = new Blob(receivedChunks, { type: 'application/octet-stream' });
      downloadFile(blob, fileInfo.name);
    }
  }
};`}</code></pre>
          </div>
        </div>
      </div>

      {/* Data Channel Configuration */}
      <div className="section">
        <h2>Data Channel Configuration</h2>
        <div className="config-table">
          <div className="config-row">
            <div className="config-property">ordered</div>
            <div className="config-description">Guarantee message delivery order (default: true)</div>
          </div>
          <div className="config-row">
            <div className="config-property">maxRetransmits</div>
            <div className="config-description">Maximum number of retransmissions (conflicts with maxPacketLifeTime)</div>
          </div>
          <div className="config-row">
            <div className="config-property">maxPacketLifeTime</div>
            <div className="config-description">Maximum time in milliseconds to attempt delivery</div>
          </div>
          <div className="config-row">
            <div className="config-property">protocol</div>
            <div className="config-description">Sub-protocol name (up to 65535 characters)</div>
          </div>
          <div className="config-row">
            <div className="config-property">negotiated</div>
            <div className="config-description">Whether the channel is pre-negotiated (default: false)</div>
          </div>
          <div className="config-row">
            <div className="config-property">id</div>
            <div className="config-description">Numeric ID for negotiated channels (0-65534)</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .connection-status {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .status-indicator {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.9rem;
        }

        .status-indicator.connected {
          background: var(--accent-green);
          color: white;
          border: 2px solid var(--accent-green-bright);
        }

        .status-indicator.disconnected {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 2px solid #ef4444;
        }

        .chat-container {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .messages-area {
          height: 300px;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message {
          padding: 0.75rem;
          border-radius: 8px;
          max-width: 80%;
          word-wrap: break-word;
        }

        .message.sent {
          align-self: flex-end;
          background: var(--accent-green);
          color: white;
        }

        .message.received {
          align-self: flex-start;
          background: var(--code-bg);
          border: 1px solid var(--border-primary);
        }

        .message-sender {
          font-size: 0.8rem;
          font-weight: 500;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .message-text {
          line-height: 1.4;
        }

        .message-time {
          font-size: 0.7rem;
          opacity: 0.6;
          margin-top: 0.25rem;
        }

        .message-input-area {
          display: flex;
          padding: 1rem;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-primary);
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          color: var(--text-primary);
          margin-right: 0.5rem;
        }

        .message-input:focus {
          outline: none;
          border-color: var(--accent-green);
        }

        .file-transfer-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .transfer-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          max-width: 300px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(26, 93, 58, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-green-bright);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--accent-green-bright);
          min-width: 40px;
        }

        .config-table {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
        }

        .config-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          padding: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .config-row:last-child {
          border-bottom: none;
        }

        .config-property {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          color: var(--accent-green-bright);
        }

        .config-description {
          color: var(--text-secondary);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .connection-status {
            flex-direction: column;
            align-items: stretch;
          }

          .message {
            max-width: 95%;
          }

          .config-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default DataChannelsPage