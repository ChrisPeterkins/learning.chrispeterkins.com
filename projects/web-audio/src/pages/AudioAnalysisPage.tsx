import { useState, useRef, useEffect, useCallback } from 'react'
import './AudioAnalysisPage.css'

function AudioAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [bpm, setBpm] = useState(0)
  const [peakFrequency, setPeakFrequency] = useState(0)
  const [rms, setRms] = useState(0)
  const [beatDetected, setBeatDetected] = useState(false)
  const [spectralCentroid, setSpectralCentroid] = useState(0)
  const [zeroCrossingRate, setZeroCrossingRate] = useState(0)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  
  // Beat detection variables
  const beatHistoryRef = useRef<number[]>([])
  const lastBeatTimeRef = useRef(0)
  const beatIntervalsRef = useRef<number[]>([])
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  const calculateRMS = (dataArray: Uint8Array): number => {
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128
      sum += normalized * normalized
    }
    return Math.sqrt(sum / dataArray.length)
  }

  const calculateSpectralCentroid = (freqData: Uint8Array, sampleRate: number, fftSize: number): number => {
    let weightedSum = 0
    let magnitudeSum = 0
    
    for (let i = 0; i < freqData.length; i++) {
      const freq = (i * sampleRate) / fftSize
      const magnitude = freqData[i]
      weightedSum += freq * magnitude
      magnitudeSum += magnitude
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  const calculateZeroCrossingRate = (timeData: Uint8Array): number => {
    let crossings = 0
    for (let i = 1; i < timeData.length; i++) {
      const prev = (timeData[i - 1] - 128) / 128
      const curr = (timeData[i] - 128) / 128
      if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
        crossings++
      }
    }
    return crossings / timeData.length
  }

  const detectBeat = useCallback((rmsValue: number, currentTime: number) => {
    // Simple beat detection based on RMS threshold
    const threshold = 0.3
    const minInterval = 200 // minimum ms between beats
    
    if (rmsValue > threshold && currentTime - lastBeatTimeRef.current > minInterval) {
      setBeatDetected(true)
      setTimeout(() => setBeatDetected(false), 100)
      
      if (lastBeatTimeRef.current > 0) {
        const interval = currentTime - lastBeatTimeRef.current
        beatIntervalsRef.current.push(interval)
        
        // Keep only last 10 intervals
        if (beatIntervalsRef.current.length > 10) {
          beatIntervalsRef.current.shift()
        }
        
        // Calculate BPM from average interval
        if (beatIntervalsRef.current.length >= 4) {
          const avgInterval = beatIntervalsRef.current.reduce((a, b) => a + b) / beatIntervalsRef.current.length
          const calculatedBpm = Math.round(60000 / avgInterval)
          setBpm(calculatedBpm)
        }
      }
      
      lastBeatTimeRef.current = currentTime
    }
    
    // Add to history for adaptive threshold
    beatHistoryRef.current.push(rmsValue)
    if (beatHistoryRef.current.length > 100) {
      beatHistoryRef.current.shift()
    }
  }, [])

  const findPeakFrequency = (freqData: Uint8Array, sampleRate: number, fftSize: number): number => {
    let maxValue = 0
    let maxIndex = 0
    
    for (let i = 0; i < freqData.length; i++) {
      if (freqData[i] > maxValue) {
        maxValue = freqData[i]
        maxIndex = i
      }
    }
    
    return (maxIndex * sampleRate) / (2 * fftSize)
  }

  const drawSpectrogram = (freqData: Uint8Array) => {
    if (!spectrogramCanvasRef.current) return
    
    const canvas = spectrogramCanvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Shift existing image to the left
    const imageData = ctx.getImageData(1, 0, canvas.width - 1, canvas.height)
    ctx.putImageData(imageData, 0, 0)
    
    // Draw new frequency column
    for (let i = 0; i < freqData.length; i++) {
      const value = freqData[i]
      const y = canvas.height - (i * canvas.height / freqData.length)
      
      // Color mapping: blue (low) -> green -> yellow -> red (high)
      const intensity = value / 255
      let r, g, b
      
      if (intensity < 0.25) {
        r = 0
        g = 0
        b = intensity * 4 * 255
      } else if (intensity < 0.5) {
        r = 0
        g = (intensity - 0.25) * 4 * 255
        b = 255 - ((intensity - 0.25) * 4 * 255)
      } else if (intensity < 0.75) {
        r = (intensity - 0.5) * 4 * 255
        g = 255
        b = 0
      } else {
        r = 255
        g = 255 - ((intensity - 0.75) * 4 * 255)
        b = 0
      }
      
      ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
      ctx.fillRect(canvas.width - 1, y, 1, canvas.height / freqData.length)
    }
  }

  const analyze = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !audioContextRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const analyser = analyserRef.current
    
    const bufferLength = analyser.frequencyBinCount
    const timeData = new Uint8Array(bufferLength)
    const freqData = new Uint8Array(bufferLength)
    
    analyser.getByteTimeDomainData(timeData)
    analyser.getByteFrequencyData(freqData)
    
    // Calculate audio features
    const rmsValue = calculateRMS(timeData)
    setRms(rmsValue)
    
    const peak = findPeakFrequency(freqData, audioContextRef.current.sampleRate, analyser.fftSize)
    setPeakFrequency(Math.round(peak))
    
    const centroid = calculateSpectralCentroid(freqData, audioContextRef.current.sampleRate, analyser.fftSize)
    setSpectralCentroid(Math.round(centroid))
    
    const zcr = calculateZeroCrossingRate(timeData)
    setZeroCrossingRate(zcr)
    
    // Beat detection
    detectBeat(rmsValue, performance.now())
    
    // Draw spectrogram
    drawSpectrogram(freqData)
    
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 15, 13, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw frequency bars
    const barWidth = (canvas.width / bufferLength) * 2.5
    let x = 0
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (freqData[i] / 255) * canvas.height * 0.7
      
      const hue = 120 + (i / bufferLength) * 60 // Green to yellow
      const lightness = 50 + (freqData[i] / 255) * 30
      
      ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      
      x += barWidth + 1
    }
    
    // Draw waveform overlay
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    const sliceWidth = canvas.width / bufferLength
    x = 0
    
    for (let i = 0; i < bufferLength; i++) {
      const v = timeData[i] / 128.0
      const y = v * canvas.height / 2
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      x += sliceWidth
    }
    
    ctx.stroke()
    
    animationRef.current = requestAnimationFrame(analyze)
  }, [detectBeat])

  const startAnalysis = async () => {
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
      setIsAnalyzing(true)
      
      // Clear spectrogram canvas
      if (spectrogramCanvasRef.current) {
        const ctx = spectrogramCanvasRef.current.getContext('2d')!
        ctx.fillStyle = '#0a0f0d'
        ctx.fillRect(0, 0, spectrogramCanvasRef.current.width, spectrogramCanvasRef.current.height)
      }
      
      analyze()
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Please allow microphone access to use audio analysis')
    }
  }

  const stopAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    setIsAnalyzing(false)
    setBpm(0)
    setPeakFrequency(0)
    setRms(0)
    setSpectralCentroid(0)
    setZeroCrossingRate(0)
    beatIntervalsRef.current = []
    lastBeatTimeRef.current = 0
  }

  return (
    <div className="audio-analysis-page">
      <h1>Audio Analysis</h1>

      <div className="analysis-container">
        <div className="controls">
          <button
            className={`analyze-button ${isAnalyzing ? 'stop' : 'start'}`}
            onClick={isAnalyzing ? stopAnalysis : startAnalysis}
          >
            {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
          </button>
        </div>

        <div className="metrics-grid">
          <div className={`metric ${beatDetected ? 'beat' : ''}`}>
            <label>BPM</label>
            <div className="value">{bpm || '--'}</div>
          </div>
          
          <div className="metric">
            <label>Peak Frequency</label>
            <div className="value">{peakFrequency} Hz</div>
          </div>
          
          <div className="metric">
            <label>RMS Level</label>
            <div className="value">{(rms * 100).toFixed(1)}%</div>
            <div className="level-bar">
              <div className="level-fill" style={{ width: `${rms * 100}%` }} />
            </div>
          </div>
          
          <div className="metric">
            <label>Spectral Centroid</label>
            <div className="value">{spectralCentroid} Hz</div>
          </div>
          
          <div className="metric">
            <label>Zero Crossing Rate</label>
            <div className="value">{(zeroCrossingRate * 100).toFixed(2)}%</div>
          </div>
          
          <div className={`metric ${beatDetected ? 'pulse' : ''}`}>
            <label>Beat Detector</label>
            <div className="beat-indicator" />
          </div>
        </div>

        <div className="visualizations">
          <div className="viz-section">
            <h3>Frequency Spectrum & Waveform</h3>
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="analysis-canvas"
            />
          </div>
          
          <div className="viz-section">
            <h3>Spectrogram</h3>
            <canvas
              ref={spectrogramCanvasRef}
              width={800}
              height={200}
              className="spectrogram-canvas"
            />
            <div className="freq-labels">
              <span>0 Hz</span>
              <span>{audioContextRef.current ? Math.round(audioContextRef.current.sampleRate / 4) : '11025'} Hz</span>
              <span>{audioContextRef.current ? Math.round(audioContextRef.current.sampleRate / 2) : '22050'} Hz</span>
            </div>
          </div>
        </div>

        <div className="info-panel">
          <h3>Audio Features Explained</h3>
          <ul>
            <li><strong>BPM:</strong> Beats per minute detected from rhythmic patterns</li>
            <li><strong>Peak Frequency:</strong> The dominant frequency in the signal</li>
            <li><strong>RMS Level:</strong> Root Mean Square - overall signal strength</li>
            <li><strong>Spectral Centroid:</strong> The "center of mass" of the spectrum</li>
            <li><strong>Zero Crossing Rate:</strong> How often the signal crosses zero</li>
            <li><strong>Spectrogram:</strong> Visual representation of frequencies over time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AudioAnalysisPage