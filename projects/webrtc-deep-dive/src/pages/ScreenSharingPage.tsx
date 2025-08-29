import React, { useState, useRef } from 'react'

function ScreenSharingPage() {
  const [isSharing, setIsSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startScreenShare = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: true
      })
      
      setScreenStream(stream)
      setIsSharing(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })
      
    } catch (err) {
      setError('Failed to start screen sharing')
    }
  }

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setScreenStream(null)
    }
    setIsSharing(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (isRecording) {
      stopRecording()
    }
  }

  const startRecording = () => {
    if (!screenStream) return
    
    const mediaRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm' })
    mediaRecorderRef.current = mediaRecorder
    
    const chunks: Blob[] = []
    
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data)
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `screen-recording-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    setIsRecording(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Screen Sharing</h1>
        <p className="page-description">
          Learn how to capture and share screen content using the Screen Capture API. 
          Record screens, windows, and browser tabs for real-time streaming.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="demo-container">
        <h3>Screen Share Demo</h3>
        
        <div className="video-container">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="screen-video"
            style={{ display: isSharing ? 'block' : 'none' }}
          />
          {!isSharing && (
            <div className="video-placeholder">
              Click "Start Screen Share" to begin
            </div>
          )}
        </div>

        <div className="demo-controls">
          <button 
            className="demo-button action-button"
            onClick={startScreenShare}
            disabled={isSharing}
          >
            Start Screen Share
          </button>
          <button 
            className="demo-button"
            onClick={stopScreenShare}
            disabled={!isSharing}
            style={{ background: '#ef4444' }}
          >
            Stop Sharing
          </button>
          <button 
            className="demo-button"
            onClick={startRecording}
            disabled={!isSharing || isRecording}
          >
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          {isRecording && (
            <button 
              className="demo-button"
              onClick={stopRecording}
              style={{ background: '#ef4444' }}
            >
              Stop Recording
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <h2>Screen Capture API</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Basic Screen Sharing</span>
          </div>
          <div className="code-content">
            <pre><code>{`// Request screen sharing permission
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    width: 1920,
    height: 1080,
    frameRate: 30
  },
  audio: true // Include system audio if available
});

// Attach to video element
const video = document.getElementById('screenVideo');
video.srcObject = stream;

// Handle when user stops sharing
stream.getVideoTracks()[0].addEventListener('ended', () => {
  console.log('Screen sharing ended');
  // Clean up UI
});`}</code></pre>
          </div>
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
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 2rem;
          border: 1px solid var(--border-primary);
        }

        .screen-video {
          width: 100%;
          height: 400px;
          object-fit: contain;
        }

        .video-placeholder {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 1.2rem;
          background: rgba(26, 93, 58, 0.1);
        }
      `}</style>
    </div>
  )
}

export default ScreenSharingPage