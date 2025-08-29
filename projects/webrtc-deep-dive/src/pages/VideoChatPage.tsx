import React, { useState, useRef, useEffect } from 'react'

function VideoChatPage() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnection = useRef<RTCPeerConnection | null>(null)

  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // For demo purposes, create a "loopback" by cloning the stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream.clone()
      }
      
      setIsCallActive(true)
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    
    setIsCallActive(false)
    setIsMuted(false)
    setIsVideoOff(false)
  }

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Video Chat Demo</h1>
        <p className="page-description">
          Experience a simulated video chat interface with local loopback. 
          This demonstrates the UI and controls for a real WebRTC video call.
        </p>
      </div>

      <div className="video-chat-container">
        <div className="video-grid">
          <div className="video-panel local-panel">
            <video 
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="video-stream"
            />
            <div className="video-label">You</div>
            {isVideoOff && <div className="video-off-overlay">Video Off</div>}
          </div>
          
          <div className="video-panel remote-panel">
            <video 
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="video-stream"
            />
            <div className="video-label">Remote Peer (Demo)</div>
          </div>
        </div>

        <div className="call-controls">
          {!isCallActive ? (
            <button 
              className="control-button start-call"
              onClick={startCall}
            >
              📞 Start Call
            </button>
          ) : (
            <>
              <button 
                className={`control-button ${isMuted ? 'muted' : ''}`}
                onClick={toggleMute}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              
              <button 
                className={`control-button ${isVideoOff ? 'video-off' : ''}`}
                onClick={toggleVideo}
              >
                {isVideoOff ? '📷' : '📹'}
              </button>
              
              <button 
                className="control-button end-call"
                onClick={endCall}
              >
                📞 End Call
              </button>
            </>
          )}
        </div>
      </div>

      <div className="section">
        <h2>Video Chat Implementation</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Complete Video Chat Setup</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Video chat implementation
class VideoChat {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
  }

  async startCall() {
    // Get user media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: { echoCancellation: true, noiseSuppression: true }
    });
    
    // Add tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      document.getElementById('remoteVideo').srcObject = this.remoteStream;
    };
    
    // Display local video
    document.getElementById('localVideo').srcObject = this.localStream;
  }

  toggleMute() {
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  }

  toggleVideo() {
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  }
}`}</code></pre>
          </div>
        </div>
      </div>

      <style jsx>{`
        .video-chat-container {
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 3rem;
        }

        .video-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .video-panel {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid var(--border-primary);
          aspect-ratio: 4/3;
        }

        .video-stream {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-label {
          position: absolute;
          bottom: 0.5rem;
          left: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .video-off-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .call-controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .control-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .start-call {
          background: var(--accent-green);
          color: white;
        }

        .start-call:hover {
          background: var(--accent-green-bright);
        }

        .control-button:not(.start-call):not(.end-call) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .control-button:not(.start-call):not(.end-call):hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .control-button.muted,
        .control-button.video-off {
          background: #ef4444;
        }

        .end-call {
          background: #ef4444;
          color: white;
        }

        .end-call:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: 1fr;
          }
          
          .call-controls {
            gap: 0.5rem;
          }
          
          .control-button {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  )
}

export default VideoChatPage