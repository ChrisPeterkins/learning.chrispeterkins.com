import { useEffect, useRef, useState } from 'react'

interface AudioConfig {
  fftSize: number
  smoothingTimeConstant: number
  minDecibels: number
  maxDecibels: number
  visualizationType: 'bars' | 'circle' | 'waveform' | 'particles'
  sensitivity: number
  colorScheme: 'rainbow' | 'green' | 'blue' | 'fire'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

function AudioVisualsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()
  const [config, setConfig] = useState<AudioConfig>({
    fftSize: 1024,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10,
    visualizationType: 'bars',
    sensitivity: 1.0,
    colorScheme: 'rainbow'
  })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [audioStarted, setAudioStarted] = useState(false)

  const getColor = (value: number, scheme: string): string => {
    const intensity = Math.min(1, value)
    
    switch (scheme) {
      case 'rainbow':
        const hue = (1 - intensity) * 240
        return `hsl(${hue}, 100%, ${50 + intensity * 30}%)`
      
      case 'green':
        return `rgb(${intensity * 100}, ${100 + intensity * 155}, ${intensity * 100})`
      
      case 'blue':
        return `rgb(${intensity * 100}, ${intensity * 150}, ${100 + intensity * 155})`
      
      case 'fire':
        const red = 255
        const green = Math.floor(intensity * 200)
        const blue = Math.floor(intensity * 50)
        return `rgb(${red}, ${green}, ${blue})`
      
      default:
        return `rgb(${intensity * 255}, ${intensity * 255}, ${intensity * 255})`
    }
  }

  const createParticle = (x: number, y: number, energy: number): Particle => {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * energy * 5,
      vy: (Math.random() - 0.5) * energy * 5,
      size: 2 + energy * 8,
      color: getColor(energy, config.colorScheme),
      life: 1.0
    }
  }

  const updateParticles = (frequencyData: Uint8Array) => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const newParticles: Particle[] = []
    
    // Update existing particles
    particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life -= 0.02
      particle.size *= 0.98
      
      if (particle.life > 0 && 
          particle.x >= 0 && particle.x <= canvas.width &&
          particle.y >= 0 && particle.y <= canvas.height) {
        newParticles.push(particle)
      }
    })
    
    // Add new particles based on audio
    const avgFrequency = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length
    const energy = avgFrequency / 255 * config.sensitivity
    
    if (energy > 0.1) {
      for (let i = 0; i < Math.floor(energy * 5); i++) {
        newParticles.push(createParticle(
          canvas.width / 2 + (Math.random() - 0.5) * 100,
          canvas.height / 2 + (Math.random() - 0.5) * 100,
          energy
        ))
      }
    }
    
    setParticles(newParticles)
  }

  const drawBars = (ctx: CanvasRenderingContext2D, frequencyData: Uint8Array) => {
    const barCount = 64
    const barWidth = ctx.canvas.width / barCount
    const barSpacing = 2
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * frequencyData.length / barCount)
      const barHeight = (frequencyData[dataIndex] / 255) * ctx.canvas.height * config.sensitivity
      
      ctx.fillStyle = getColor(frequencyData[dataIndex] / 255, config.colorScheme)
      ctx.fillRect(
        i * barWidth, 
        ctx.canvas.height - barHeight, 
        barWidth - barSpacing, 
        barHeight
      )
    }
  }

  const drawCircle = (ctx: CanvasRenderingContext2D, frequencyData: Uint8Array) => {
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    const radius = 100
    const barCount = 128
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * frequencyData.length / barCount)
      const barHeight = (frequencyData[dataIndex] / 255) * 150 * config.sensitivity
      const angle = (i / barCount) * Math.PI * 2
      
      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)
      
      ctx.strokeStyle = getColor(frequencyData[dataIndex] / 255, config.colorScheme)
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  const drawWaveform = (ctx: CanvasRenderingContext2D, frequencyData: Uint8Array) => {
    ctx.strokeStyle = getColor(0.8, config.colorScheme)
    ctx.lineWidth = 2
    ctx.beginPath()
    
    const sliceWidth = ctx.canvas.width / frequencyData.length
    let x = 0
    
    for (let i = 0; i < frequencyData.length; i++) {
      const v = (frequencyData[i] / 255) * config.sensitivity
      const y = v * ctx.canvas.height / 2 + ctx.canvas.height / 2
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      x += sliceWidth
    }
    
    ctx.stroke()
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const analyser = analyserRef.current
    
    // Get frequency data
    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(frequencyData)
    
    // Clear canvas
    ctx.fillStyle = '#0a0f0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw visualization based on type
    switch (config.visualizationType) {
      case 'bars':
        drawBars(ctx, frequencyData)
        break
      case 'circle':
        drawCircle(ctx, frequencyData)
        break
      case 'waveform':
        drawWaveform(ctx, frequencyData)
        break
      case 'particles':
        updateParticles(frequencyData)
        drawParticles(ctx)
        break
    }
    
    animationRef.current = requestAnimationFrame(draw)
  }

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = config.fftSize
      analyser.smoothingTimeConstant = config.smoothingTimeConstant
      analyser.minDecibels = config.minDecibels
      analyser.maxDecibels = config.maxDecibels
      
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      setIsPlaying(true)
      setAudioStarted(true)
      
      draw()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please allow microphone access to see audio visualizations.')
    }
  }

  const stopAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    analyserRef.current = null
    setIsPlaying(false)
  }

  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.fftSize = config.fftSize
      analyserRef.current.smoothingTimeConstant = config.smoothingTimeConstant
      analyserRef.current.minDecibels = config.minDecibels
      analyserRef.current.maxDecibels = config.maxDecibels
    }
  }, [config.fftSize, config.smoothingTimeConstant, config.minDecibels, config.maxDecibels])

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="page">
      <h2>Audio Visualizations</h2>
      <p className="page-description">
        Create real-time audio visualizations using your microphone. Explore different visualization 
        types and see how sound transforms into beautiful visual patterns.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Visualization Type</label>
          <select 
            value={config.visualizationType} 
            onChange={(e) => setConfig({ ...config, visualizationType: e.target.value as any })}
          >
            <option value="bars">Frequency Bars</option>
            <option value="circle">Radial Spectrum</option>
            <option value="waveform">Waveform</option>
            <option value="particles">Audio Particles</option>
          </select>
        </div>

        <div className="control-group">
          <label>Color Scheme</label>
          <select 
            value={config.colorScheme} 
            onChange={(e) => setConfig({ ...config, colorScheme: e.target.value as any })}
          >
            <option value="rainbow">Rainbow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="fire">Fire</option>
          </select>
        </div>

        <div className="control-group">
          <label>FFT Size</label>
          <select 
            value={config.fftSize} 
            onChange={(e) => setConfig({ ...config, fftSize: parseInt(e.target.value) })}
          >
            <option value={256}>256</option>
            <option value={512}>512</option>
            <option value={1024}>1024</option>
            <option value={2048}>2048</option>
          </select>
        </div>

        <div className="control-group">
          <label>Sensitivity: {config.sensitivity.toFixed(1)}x</label>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={config.sensitivity}
            onChange={(e) => setConfig({ ...config, sensitivity: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Smoothing: {config.smoothingTimeConstant.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="0.99"
            step="0.01"
            value={config.smoothingTimeConstant}
            onChange={(e) => setConfig({ ...config, smoothingTimeConstant: parseFloat(e.target.value) })}
          />
        </div>

        <button 
          className={isPlaying ? "reset-button" : "generate-button"}
          onClick={isPlaying ? stopAudio : startAudio}
        >
          {isPlaying ? 'Stop Visualization' : 'Start Microphone'}
        </button>
      </div>

      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600}
        />
        <div className="canvas-info">
          800×600 {isPlaying ? '(Live)' : '(Click Start)'}
        </div>
      </div>

      {!audioStarted && (
        <div className="info-panel" style={{ background: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ade80' }}>
          <h3>Getting Started</h3>
          <p>Click "Start Microphone" to begin visualizing audio. Your browser will ask for microphone permissions.</p>
          <p>Make some noise, play music, or speak to see the visualizations react to sound!</p>
        </div>
      )}

      <div className="info-panel">
        <h3>Visualization Types</h3>
        <ul>
          <li><strong>Frequency Bars:</strong> Classic bar chart showing frequency spectrum</li>
          <li><strong>Radial Spectrum:</strong> Circular visualization radiating from center</li>
          <li><strong>Waveform:</strong> Shows the audio waveform in real-time</li>
          <li><strong>Audio Particles:</strong> Dynamic particles that respond to sound intensity</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>Parameters</h3>
        <ul>
          <li><strong>FFT Size:</strong> Frequency resolution (higher = more detail, more CPU)</li>
          <li><strong>Sensitivity:</strong> How much the visualization responds to sound</li>
          <li><strong>Smoothing:</strong> How much to smooth rapid changes in frequency data</li>
        </ul>
      </div>
    </div>
  )
}

export default AudioVisualsPage