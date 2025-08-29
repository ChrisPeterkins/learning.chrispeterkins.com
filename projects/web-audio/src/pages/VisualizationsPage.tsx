import { useState, useRef, useEffect } from 'react'
import './VisualizationsPage.css'

function VisualizationsPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [visualMode, setVisualMode] = useState<'waveform' | 'frequency' | 'both'>('both')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      analyserRef.current = analyser
      sourceRef.current = source
      setIsPlaying(true)

      draw()
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Please allow microphone access to use visualizations')
    }
  }

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    setIsPlaying(false)
  }

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const analyser = analyserRef.current

    const drawWaveform = () => {
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteTimeDomainData(dataArray)

      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 2
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * (canvas.height / 2)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke()
    }

    const drawFrequency = () => {
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, '#1a5d3a')
        gradient.addColorStop(0.5, '#4ade80')
        gradient.addColorStop(1, '#86efac')

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    ctx.fillStyle = 'rgba(10, 15, 13, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (visualMode === 'waveform') {
      drawWaveform()
    } else if (visualMode === 'frequency') {
      drawFrequency()
    } else {
      ctx.save()
      ctx.globalAlpha = 0.5
      drawFrequency()
      ctx.restore()
      drawWaveform()
    }

    animationRef.current = requestAnimationFrame(draw)
  }

  return (
    <div className="visualizations-page">
      <h1>Audio Visualizations</h1>

      <div className="viz-container">
        <div className="controls">
          <button
            className={`viz-button ${isPlaying ? 'stop' : 'start'}`}
            onClick={isPlaying ? stopVisualization : startVisualization}
          >
            {isPlaying ? 'Stop' : 'Start'} Visualization
          </button>

          <div className="mode-selector">
            <label>Visualization Mode:</label>
            <select value={visualMode} onChange={(e) => setVisualMode(e.target.value as any)}>
              <option value="waveform">Waveform</option>
              <option value="frequency">Frequency Bars</option>
              <option value="both">Combined</option>
            </select>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="viz-canvas"
        />

        <div className="info-panel">
          <h3>Understanding Audio Visualizations</h3>
          <ul>
            <li><strong>Waveform:</strong> Shows the amplitude of the audio signal over time (time-domain)</li>
            <li><strong>Frequency Bars:</strong> Shows the intensity of different frequencies (frequency-domain via FFT)</li>
            <li><strong>AnalyserNode:</strong> Provides real-time frequency and time-domain analysis</li>
            <li><strong>FFT Size:</strong> Determines the resolution of frequency analysis (higher = more detail)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default VisualizationsPage