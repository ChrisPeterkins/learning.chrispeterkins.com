import { useState, useRef, useEffect } from 'react'
import './EffectsPage.css'

function EffectsPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [sourceType, setSourceType] = useState<'oscillator' | 'microphone'>('oscillator')
  
  // Effect parameters
  const [filterFreq, setFilterFreq] = useState(1000)
  const [filterQ, setFilterQ] = useState(1)
  const [filterType, setFilterType] = useState<BiquadFilterType>('lowpass')
  const [delayTime, setDelayTime] = useState(0.3)
  const [delayFeedback, setDelayFeedback] = useState(0.4)
  const [delayMix, setDelayMix] = useState(0.3)
  const [distortionAmount, setDistortionAmount] = useState(0)
  const [reverbMix, setReverbMix] = useState(0)
  
  // Effect bypasses
  const [filterEnabled, setFilterEnabled] = useState(true)
  const [delayEnabled, setDelayEnabled] = useState(false)
  const [distortionEnabled, setDistortionEnabled] = useState(false)
  const [reverbEnabled, setReverbEnabled] = useState(false)
  
  // Audio nodes
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)
  const delayRef = useRef<DelayNode | null>(null)
  const feedbackRef = useRef<GainNode | null>(null)
  const delayMixRef = useRef<GainNode | null>(null)
  const distortionRef = useRef<WaveShaperNode | null>(null)
  const convolverRef = useRef<ConvolverNode | null>(null)
  const reverbMixRef = useRef<GainNode | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    return () => {
      stopAudio()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const createDistortionCurve = (amount: number): Float32Array => {
    const samples = 44100
    const curve = new Float32Array(samples)
    const deg = Math.PI / 180
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
    }
    
    return curve
  }

  const createReverbImpulse = (duration: number, decay: number): AudioBuffer => {
    const ctx = audioContextRef.current!
    const length = ctx.sampleRate * duration
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }
    
    return impulse
  }

  const connectEffectsChain = () => {
    if (!audioContextRef.current || !sourceRef.current) return

    const ctx = audioContextRef.current
    
    // Create nodes if they don't exist
    if (!filterRef.current) {
      filterRef.current = ctx.createBiquadFilter()
      filterRef.current.type = filterType
      filterRef.current.frequency.value = filterFreq
      filterRef.current.Q.value = filterQ
    }
    
    if (!distortionRef.current) {
      distortionRef.current = ctx.createWaveShaper()
      distortionRef.current.curve = createDistortionCurve(distortionAmount)
      distortionRef.current.oversample = '4x'
    }
    
    if (!delayRef.current) {
      delayRef.current = ctx.createDelay(5)
      delayRef.current.delayTime.value = delayTime
      
      feedbackRef.current = ctx.createGain()
      feedbackRef.current.gain.value = delayFeedback
      
      delayMixRef.current = ctx.createGain()
      delayMixRef.current.gain.value = delayMix
    }
    
    if (!convolverRef.current) {
      convolverRef.current = ctx.createConvolver()
      convolverRef.current.buffer = createReverbImpulse(2, 2)
      
      reverbMixRef.current = ctx.createGain()
      reverbMixRef.current.gain.value = reverbMix
    }
    
    if (!masterGainRef.current) {
      masterGainRef.current = ctx.createGain()
      masterGainRef.current.gain.value = 0.8
    }
    
    // Disconnect everything first
    sourceRef.current.disconnect()
    
    // Build the effects chain
    let currentNode: AudioNode = sourceRef.current
    
    if (filterEnabled && filterRef.current) {
      currentNode.connect(filterRef.current)
      currentNode = filterRef.current
    }
    
    if (distortionEnabled && distortionRef.current) {
      currentNode.connect(distortionRef.current)
      currentNode = distortionRef.current
    }
    
    // Delay effect (parallel processing)
    if (delayEnabled && delayRef.current && feedbackRef.current && delayMixRef.current) {
      // Dry signal
      const dryGain = ctx.createGain()
      dryGain.gain.value = 1 - delayMix
      currentNode.connect(dryGain)
      
      // Wet signal
      currentNode.connect(delayRef.current)
      delayRef.current.connect(feedbackRef.current)
      feedbackRef.current.connect(delayRef.current)
      delayRef.current.connect(delayMixRef.current)
      
      // Combine dry and wet
      const delayMixer = ctx.createGain()
      dryGain.connect(delayMixer)
      delayMixRef.current.connect(delayMixer)
      currentNode = delayMixer
    }
    
    // Reverb effect (parallel processing)
    if (reverbEnabled && convolverRef.current && reverbMixRef.current) {
      // Dry signal
      const dryGain = ctx.createGain()
      dryGain.gain.value = 1 - reverbMix
      currentNode.connect(dryGain)
      
      // Wet signal
      currentNode.connect(convolverRef.current)
      convolverRef.current.connect(reverbMixRef.current)
      
      // Combine dry and wet
      const reverbMixer = ctx.createGain()
      dryGain.connect(reverbMixer)
      reverbMixRef.current.connect(reverbMixer)
      currentNode = reverbMixer
    }
    
    // Connect to master gain and destination
    currentNode.connect(masterGainRef.current!)
    masterGainRef.current!.connect(ctx.destination)
  }

  const startAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current

    if (sourceType === 'oscillator') {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 220
      sourceRef.current = osc
      osc.start()
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        sourceRef.current = ctx.createMediaStreamSource(stream)
      } catch (err) {
        console.error('Microphone access denied:', err)
        alert('Please allow microphone access to use this feature')
        return
      }
    }

    connectEffectsChain()
    setIsPlaying(true)
  }

  const stopAudio = () => {
    if (sourceRef.current) {
      if (sourceRef.current instanceof OscillatorNode) {
        sourceRef.current.stop()
      }
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    setIsPlaying(false)
  }

  // Update filter parameters in real-time
  useEffect(() => {
    if (filterRef.current && audioContextRef.current) {
      filterRef.current.frequency.setValueAtTime(filterFreq, audioContextRef.current.currentTime)
      filterRef.current.Q.setValueAtTime(filterQ, audioContextRef.current.currentTime)
      filterRef.current.type = filterType
    }
  }, [filterFreq, filterQ, filterType])

  // Update delay parameters
  useEffect(() => {
    if (delayRef.current && audioContextRef.current) {
      delayRef.current.delayTime.setValueAtTime(delayTime, audioContextRef.current.currentTime)
    }
    if (feedbackRef.current && audioContextRef.current) {
      feedbackRef.current.gain.setValueAtTime(delayFeedback, audioContextRef.current.currentTime)
    }
    if (delayMixRef.current && audioContextRef.current) {
      delayMixRef.current.gain.setValueAtTime(delayMix, audioContextRef.current.currentTime)
    }
  }, [delayTime, delayFeedback, delayMix])

  // Update distortion
  useEffect(() => {
    if (distortionRef.current) {
      distortionRef.current.curve = createDistortionCurve(distortionAmount)
    }
  }, [distortionAmount])

  // Update reverb mix
  useEffect(() => {
    if (reverbMixRef.current && audioContextRef.current) {
      reverbMixRef.current.gain.setValueAtTime(reverbMix, audioContextRef.current.currentTime)
    }
  }, [reverbMix])

  // Reconnect chain when effects are toggled
  useEffect(() => {
    if (isPlaying) {
      connectEffectsChain()
    }
  }, [filterEnabled, delayEnabled, distortionEnabled, reverbEnabled])

  return (
    <div className="effects-page">
      <h1>Audio Effects Chain</h1>

      <div className="effects-container">
        <div className="source-selector">
          <h3>Audio Source</h3>
          <div className="source-buttons">
            <button
              className={sourceType === 'oscillator' ? 'active' : ''}
              onClick={() => setSourceType('oscillator')}
              disabled={isPlaying}
            >
              Oscillator
            </button>
            <button
              className={sourceType === 'microphone' ? 'active' : ''}
              onClick={() => setSourceType('microphone')}
              disabled={isPlaying}
            >
              Microphone
            </button>
          </div>
          <button
            className={`play-button ${isPlaying ? 'stop' : 'start'}`}
            onClick={isPlaying ? stopAudio : startAudio}
          >
            {isPlaying ? 'Stop' : 'Start'} Audio
          </button>
        </div>

        <div className="effects-grid">
          <div className={`effect-module ${filterEnabled ? 'active' : ''}`}>
            <div className="effect-header">
              <h3>Filter</h3>
              <label className="bypass-toggle">
                <input
                  type="checkbox"
                  checked={filterEnabled}
                  onChange={(e) => setFilterEnabled(e.target.checked)}
                />
                <span>Enable</span>
              </label>
            </div>
            
            <div className="effect-controls">
              <div className="control">
                <label>Type</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value as BiquadFilterType)}
                >
                  <option value="lowpass">Low Pass</option>
                  <option value="highpass">High Pass</option>
                  <option value="bandpass">Band Pass</option>
                  <option value="notch">Notch</option>
                  <option value="allpass">All Pass</option>
                  <option value="peaking">Peaking</option>
                  <option value="lowshelf">Low Shelf</option>
                  <option value="highshelf">High Shelf</option>
                </select>
              </div>
              
              <div className="control">
                <label>Frequency: {filterFreq} Hz</label>
                <input
                  type="range"
                  min="20"
                  max="20000"
                  value={filterFreq}
                  onChange={(e) => setFilterFreq(Number(e.target.value))}
                  className="log-scale"
                />
              </div>
              
              <div className="control">
                <label>Resonance (Q): {filterQ.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={filterQ}
                  onChange={(e) => setFilterQ(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className={`effect-module ${distortionEnabled ? 'active' : ''}`}>
            <div className="effect-header">
              <h3>Distortion</h3>
              <label className="bypass-toggle">
                <input
                  type="checkbox"
                  checked={distortionEnabled}
                  onChange={(e) => setDistortionEnabled(e.target.checked)}
                />
                <span>Enable</span>
              </label>
            </div>
            
            <div className="effect-controls">
              <div className="control">
                <label>Amount: {distortionAmount.toFixed(0)}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={distortionAmount}
                  onChange={(e) => setDistortionAmount(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className={`effect-module ${delayEnabled ? 'active' : ''}`}>
            <div className="effect-header">
              <h3>Delay</h3>
              <label className="bypass-toggle">
                <input
                  type="checkbox"
                  checked={delayEnabled}
                  onChange={(e) => setDelayEnabled(e.target.checked)}
                />
                <span>Enable</span>
              </label>
            </div>
            
            <div className="effect-controls">
              <div className="control">
                <label>Time: {(delayTime * 1000).toFixed(0)} ms</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={delayTime}
                  onChange={(e) => setDelayTime(Number(e.target.value))}
                />
              </div>
              
              <div className="control">
                <label>Feedback: {(delayFeedback * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.01"
                  value={delayFeedback}
                  onChange={(e) => setDelayFeedback(Number(e.target.value))}
                />
              </div>
              
              <div className="control">
                <label>Mix: {(delayMix * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={delayMix}
                  onChange={(e) => setDelayMix(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className={`effect-module ${reverbEnabled ? 'active' : ''}`}>
            <div className="effect-header">
              <h3>Reverb</h3>
              <label className="bypass-toggle">
                <input
                  type="checkbox"
                  checked={reverbEnabled}
                  onChange={(e) => setReverbEnabled(e.target.checked)}
                />
                <span>Enable</span>
              </label>
            </div>
            
            <div className="effect-controls">
              <div className="control">
                <label>Mix: {(reverbMix * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={reverbMix}
                  onChange={(e) => setReverbMix(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="info-panel">
          <h3>Signal Flow</h3>
          <div className="signal-flow">
            Source → Filter → Distortion → Delay → Reverb → Output
          </div>
          <ul>
            <li><strong>Filter:</strong> Shape the frequency content of your sound</li>
            <li><strong>Distortion:</strong> Add harmonic saturation and grit</li>
            <li><strong>Delay:</strong> Create echoes and rhythmic patterns</li>
            <li><strong>Reverb:</strong> Add spatial depth and ambience</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EffectsPage