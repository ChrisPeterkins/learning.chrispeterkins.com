import React, { useState, useEffect, useRef } from 'react'
import { MediaManager, MediaDeviceInfo, MediaStats } from '../webrtc/MediaManager'

function MediaStreamsPage() {
  const [mediaManager] = useState(() => new MediaManager())
  const [isStreaming, setIsStreaming] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null)
  const [error, setError] = useState<string>('')
  const [effects, setEffects] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioLevelRef = useRef<number>(0)

  useEffect(() => {
    loadDevices()
    
    return () => {
      mediaManager.stopAllTracks()
    }
  }, [mediaManager])

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        const level = mediaManager.getAudioLevel()
        audioLevelRef.current = level
        setAudioLevel(level)
        
        const stats = mediaManager.getStreamStats()
        if (stats) {
          setMediaStats(stats)
        }
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [isStreaming, mediaManager])

  const loadDevices = async () => {
    try {
      const deviceList = await mediaManager.getAvailableDevices()
      setDevices(deviceList)
      
      // Set default devices
      const cameras = deviceList.filter(d => d.kind === 'videoinput')
      const microphones = deviceList.filter(d => d.kind === 'audioinput')
      
      if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId)
      if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId)
    } catch (error) {
      setError('Failed to load media devices')
    }
  }

  const startStream = async () => {
    try {
      setError('')
      
      const constraints = {
        video: selectedCamera ? 
          { deviceId: { exact: selectedCamera }, width: 640, height: 480 } : 
          { width: 640, height: 480 },
        audio: selectedMicrophone ? 
          { deviceId: { exact: selectedMicrophone } } : 
          true
      }
      
      const stream = await mediaManager.getUserMedia(constraints)
      
      if (videoRef.current) {
        mediaManager.attachToVideoElement(videoRef.current)
        videoRef.current.play()
      }
      
      setIsStreaming(true)
    } catch (error) {
      setError(`Failed to start media stream: ${error}`)
    }
  }

  const stopStream = () => {
    mediaManager.stopAllTracks()
    setIsStreaming(false)
    setAudioLevel(0)
    setMediaStats(null)
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const switchCamera = async () => {
    if (!isStreaming) return
    
    try {
      await mediaManager.switchCamera(selectedCamera)
    } catch (error) {
      setError(`Failed to switch camera: ${error}`)
    }
  }

  const toggleAudio = () => {
    const newState = !isAudioEnabled
    mediaManager.toggleAudio(newState)
    setIsAudioEnabled(newState)
  }

  const toggleVideo = () => {
    const newState = !isVideoEnabled
    mediaManager.toggleVideo(newState)
    setIsVideoEnabled(newState)
  }

  const applyEffects = () => {
    mediaManager.applyVideoEffects(effects)
  }

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    ctx.drawImage(video, 0, 0)
    
    // Download the snapshot
    canvas.toBlob((blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `snapshot-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const cameras = devices.filter(d => d.kind === 'videoinput')
  const microphones = devices.filter(d => d.kind === 'audioinput')

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Media Streams</h1>
        <p className="page-description">
          Learn how to access and control camera and microphone streams with WebRTC. 
          Explore device selection, stream manipulation, and audio/video effects.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Video Display */}
      <div className="demo-container">
        <h3>Live Video Stream</h3>
        <div className="video-container">
          <video
            ref={videoRef}
            className="main-video"
            autoPlay
            muted
            playsInline
            style={{
              display: isVideoEnabled ? 'block' : 'none'
            }}
          />
          {!isVideoEnabled && (
            <div className="video-placeholder">
              Video Disabled
            </div>
          )}
          
          {/* Audio Level Indicator */}
          {isStreaming && (
            <div className="audio-level-container">
              <label>Audio Level</label>
              <div className="audio-level-bar">
                <div 
                  className="audio-level-fill"
                  style={{ 
                    width: `${audioLevel * 100}%`,
                    backgroundColor: audioLevel > 0.7 ? '#ef4444' : audioLevel > 0.4 ? '#f59e0b' : 'var(--accent-green)'
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Stream Controls */}
      <div className="demo-container">
        <h3>Stream Controls</h3>
        <div className="controls-grid">
          <div className="control-section">
            <h4>Basic Controls</h4>
            <div className="demo-controls">
              <button 
                className="demo-button action-button"
                onClick={startStream}
                disabled={isStreaming}
              >
                Start Stream
              </button>
              <button 
                className="demo-button"
                onClick={stopStream}
                disabled={!isStreaming}
                style={{ background: '#ef4444' }}
              >
                Stop Stream
              </button>
              <button 
                className="demo-button"
                onClick={toggleAudio}
                disabled={!isStreaming}
              >
                {isAudioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
              </button>
              <button 
                className="demo-button"
                onClick={toggleVideo}
                disabled={!isStreaming}
              >
                {isVideoEnabled ? '📹 Video On' : '📷 Video Off'}
              </button>
              <button 
                className="demo-button"
                onClick={takeSnapshot}
                disabled={!isStreaming}
              >
                📸 Snapshot
              </button>
            </div>
          </div>

          <div className="control-section">
            <h4>Device Selection</h4>
            <div className="device-controls">
              <div className="device-select">
                <label>Camera:</label>
                <select 
                  value={selectedCamera} 
                  onChange={(e) => setSelectedCamera(e.target.value)}
                >
                  {cameras.map(camera => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </option>
                  ))}
                </select>
                <button 
                  className="demo-button"
                  onClick={switchCamera}
                  disabled={!isStreaming}
                >
                  Switch
                </button>
              </div>
              
              <div className="device-select">
                <label>Microphone:</label>
                <select 
                  value={selectedMicrophone} 
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                >
                  {microphones.map(mic => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Effects */}
      <div className="demo-container">
        <h3>Video Effects</h3>
        <div className="effects-controls">
          <div className="effect-control">
            <label>Brightness: {effects.brightness}%</label>
            <input
              type="range"
              min="0"
              max="200"
              value={effects.brightness}
              onChange={(e) => setEffects(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
            />
          </div>
          
          <div className="effect-control">
            <label>Contrast: {effects.contrast}%</label>
            <input
              type="range"
              min="0"
              max="200"
              value={effects.contrast}
              onChange={(e) => setEffects(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
            />
          </div>
          
          <div className="effect-control">
            <label>Saturation: {effects.saturation}%</label>
            <input
              type="range"
              min="0"
              max="200"
              value={effects.saturation}
              onChange={(e) => setEffects(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
            />
          </div>
          
          <div className="effects-buttons">
            <button className="demo-button" onClick={applyEffects}>
              Apply Effects
            </button>
            <button 
              className="demo-button" 
              onClick={() => {
                setEffects({ brightness: 100, contrast: 100, saturation: 100 })
                mediaManager.applyVideoEffects({ brightness: 100, contrast: 100, saturation: 100 })
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Media Statistics */}
      {mediaStats && (
        <div className="demo-container">
          <h3>Stream Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Resolution</label>
              <span>{mediaStats.videoResolution.width} x {mediaStats.videoResolution.height}</span>
            </div>
            <div className="stat-item">
              <label>Frame Rate</label>
              <span>{mediaStats.frameRate.toFixed(1)} fps</span>
            </div>
            <div className="stat-item">
              <label>Audio Level</label>
              <span>{(audioLevel * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Code Examples */}
      <div className="section">
        <h2>Media Stream API Examples</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Basic Media Access</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Request camera and microphone access
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
});

// Attach to video element
const video = document.getElementById('myVideo');
video.srcObject = stream;

// List available devices
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter(d => d.kind === 'videoinput');
const microphones = devices.filter(d => d.kind === 'audioinput');`}</code></pre>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Advanced Stream Control</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Toggle audio/video tracks
stream.getAudioTracks().forEach(track => {
  track.enabled = !track.enabled; // Toggle audio
});

stream.getVideoTracks().forEach(track => {
  track.enabled = !track.enabled; // Toggle video
});

// Switch camera
async function switchCamera(deviceId) {
  // Stop current video tracks
  stream.getVideoTracks().forEach(track => track.stop());
  
  // Get new video stream
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: deviceId } },
    audio: false
  });
  
  // Replace video track
  const videoTrack = newStream.getVideoTracks()[0];
  const sender = peerConnection.getSenders().find(s => 
    s.track && s.track.kind === 'video'
  );
  
  if (sender) {
    await sender.replaceTrack(videoTrack);
  }
}

// Apply video constraints
const videoTrack = stream.getVideoTracks()[0];
await videoTrack.applyConstraints({
  width: { exact: 1920 },
  height: { exact: 1080 },
  frameRate: { exact: 60 }
});`}</code></pre>
          </div>
        </div>
      </div>

      {/* Browser Support */}
      <div className="section">
        <h2>Media API Support</h2>
        <div className="support-info">
          <p>The Media Streams API is well supported across modern browsers:</p>
          <ul>
            <li><strong>getUserMedia:</strong> Chrome 53+, Firefox 36+, Safari 11+</li>
            <li><strong>enumerateDevices:</strong> Chrome 47+, Firefox 39+, Safari 11+</li>
            <li><strong>getDisplayMedia:</strong> Chrome 72+, Firefox 66+, Safari 13+</li>
            <li><strong>Track Constraints:</strong> Chrome 59+, Firefox 50+, Safari 11+</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .video-container {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-primary);
        }

        .main-video {
          width: 100%;
          height: 400px;
          object-fit: cover;
        }

        .video-placeholder {
          width: 100%;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(26, 93, 58, 0.1);
          color: var(--text-muted);
          font-size: 1.2rem;
        }

        .audio-level-container {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.7);
          padding: 0.5rem;
          border-radius: 4px;
          color: white;
        }

        .audio-level-container label {
          display: block;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .audio-level-bar {
          width: 100px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
        }

        .audio-level-fill {
          height: 100%;
          transition: width 0.1s ease;
          border-radius: 4px;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .control-section {
          background: rgba(26, 93, 58, 0.1);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .control-section h4 {
          margin: 0 0 1rem 0;
          color: var(--accent-green-bright);
        }

        .device-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .device-select {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .device-select label {
          min-width: 80px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .device-select select {
          flex: 1;
          min-width: 200px;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          color: var(--text-primary);
        }

        .effects-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .effect-control {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .effect-control label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .effect-control input[type="range"] {
          width: 100%;
        }

        .effects-buttons {
          grid-column: 1 / -1;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
          padding: 1rem;
          background: rgba(26, 93, 58, 0.1);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .stat-item label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .stat-item span {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--accent-green-bright);
        }

        .support-info {
          background: rgba(26, 93, 58, 0.1);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .support-info ul {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }

        .support-info li {
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .main-video {
            height: 300px;
          }

          .device-select {
            flex-direction: column;
            align-items: stretch;
          }

          .device-select select {
            min-width: auto;
          }

          .effects-controls {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default MediaStreamsPage