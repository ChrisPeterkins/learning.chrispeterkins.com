import { useState, useRef, useEffect, useCallback } from 'react'
import './SequencerPage.css'

interface DrumSound {
  name: string
  frequency?: number
  type?: OscillatorType
  envelope: {
    attack: number
    decay: number
    pitch?: number
  }
}

const drumSounds: DrumSound[] = [
  {
    name: 'Kick',
    frequency: 60,
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.15, pitch: 100 }
  },
  {
    name: 'Snare',
    frequency: 200,
    type: 'triangle',
    envelope: { attack: 0.001, decay: 0.1 }
  },
  {
    name: 'Hi-Hat',
    frequency: 800,
    type: 'square',
    envelope: { attack: 0.001, decay: 0.03 }
  },
  {
    name: 'Open Hat',
    frequency: 800,
    type: 'square',
    envelope: { attack: 0.001, decay: 0.3 }
  },
  {
    name: 'Clap',
    frequency: 1500,
    type: 'sawtooth',
    envelope: { attack: 0.001, decay: 0.05 }
  },
  {
    name: 'Tom',
    frequency: 120,
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.2, pitch: 50 }
  }
]

function SequencerPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [currentStep, setCurrentStep] = useState(-1)
  const [swing, setSwing] = useState(0)
  const [pattern, setPattern] = useState<boolean[][]>(
    drumSounds.map(() => new Array(16).fill(false))
  )
  const [volume, setVolume] = useState(0.7)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const nextStepTimeRef = useRef(0)
  const timerIdRef = useRef<number | null>(null)
  const stepIndexRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playDrumSound = useCallback((sound: DrumSound) => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    // Create oscillator
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    // Noise for snare/hihat
    let noise: AudioBufferSourceNode | null = null
    let noiseGain: GainNode | null = null
    
    if (sound.name === 'Snare' || sound.name.includes('Hat') || sound.name === 'Clap') {
      // Create white noise
      const bufferSize = ctx.sampleRate * 0.1
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      noise = ctx.createBufferSource()
      noise.buffer = buffer
      noiseGain = ctx.createGain()
      
      // Filter for noise
      const filter = ctx.createBiquadFilter()
      filter.type = sound.name === 'Snare' ? 'highpass' : 'bandpass'
      filter.frequency.value = sound.frequency || 1000
      
      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(ctx.destination)
    }

    // Set oscillator parameters
    if (sound.frequency) {
      osc.frequency.setValueAtTime(sound.frequency, now)
      
      // Pitch envelope for kick and tom
      if (sound.envelope.pitch) {
        osc.frequency.exponentialRampToValueAtTime(
          sound.frequency,
          now + sound.envelope.attack
        )
        osc.frequency.exponentialRampToValueAtTime(
          sound.frequency * 0.5,
          now + sound.envelope.decay
        )
      }
    }
    
    if (sound.type) {
      osc.type = sound.type
    }

    // Volume envelope
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + sound.envelope.attack)
    gain.gain.exponentialRampToValueAtTime(0.001, now + sound.envelope.attack + sound.envelope.decay)

    if (noiseGain) {
      noiseGain.gain.setValueAtTime(0, now)
      noiseGain.gain.linearRampToValueAtTime(volume * 0.5, now + sound.envelope.attack)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + sound.envelope.attack + sound.envelope.decay)
    }

    // Connect and play
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + sound.envelope.attack + sound.envelope.decay)
    
    if (noise) {
      noise.start(now)
      noise.stop(now + sound.envelope.attack + sound.envelope.decay)
    }
  }, [volume])

  const scheduleNote = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return

    const currentStepIndex = stepIndexRef.current
    
    // Play all active drums for this step
    pattern.forEach((track, trackIndex) => {
      if (track[currentStepIndex]) {
        playDrumSound(drumSounds[trackIndex])
      }
    })

    // Update current step for visual feedback
    setCurrentStep(currentStepIndex)

    // Calculate next step time
    const secondsPerBeat = 60.0 / tempo
    const secondsPerStep = secondsPerBeat / 4 // 16th notes
    
    // Apply swing to even steps
    let stepDuration = secondsPerStep
    if (currentStepIndex % 2 === 0 && swing > 0) {
      stepDuration = secondsPerStep * (1 + swing / 100)
    } else if (currentStepIndex % 2 === 1 && swing > 0) {
      stepDuration = secondsPerStep * (1 - swing / 100)
    }

    nextStepTimeRef.current += stepDuration

    // Move to next step
    stepIndexRef.current = (stepIndexRef.current + 1) % 16

    // Schedule next step
    const lookAhead = 100 // ms
    const scheduleAheadTime = nextStepTimeRef.current - audioContextRef.current.currentTime
    
    timerIdRef.current = window.setTimeout(
      scheduleNote,
      Math.max(0, scheduleAheadTime * 1000 - lookAhead)
    )
  }, [pattern, tempo, swing, playDrumSound, isPlaying])

  const startSequencer = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    stepIndexRef.current = 0
    nextStepTimeRef.current = audioContextRef.current.currentTime + 0.1
    setIsPlaying(true)
    scheduleNote()
  }

  const stopSequencer = () => {
    setIsPlaying(false)
    setCurrentStep(-1)
    
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current)
      timerIdRef.current = null
    }
  }

  useEffect(() => {
    if (isPlaying) {
      scheduleNote()
    }
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
    }
  }, [isPlaying, scheduleNote])

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newPattern = [...pattern]
    newPattern[trackIndex][stepIndex] = !newPattern[trackIndex][stepIndex]
    setPattern(newPattern)
  }

  const clearPattern = () => {
    setPattern(drumSounds.map(() => new Array(16).fill(false)))
  }

  const randomizeTrack = (trackIndex: number) => {
    const newPattern = [...pattern]
    newPattern[trackIndex] = newPattern[trackIndex].map(() => Math.random() > 0.7)
    setPattern(newPattern)
  }

  // Preset patterns
  const loadPreset = (presetName: string) => {
    const presets: { [key: string]: boolean[][] } = {
      'basic': [
        [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
        [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-hat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Open hat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Clap
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Tom
      ],
      'house': [
        [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Snare
        [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Hi-hat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true], // Open hat
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Clap
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Tom
      ],
      'trap': [
        [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false], // Kick
        [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // Snare
        [true, true, true, true, false, true, true, true, true, false, true, true, false, false, false, false], // Hi-hat
        [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false], // Open hat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Clap
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Tom
      ]
    }
    
    if (presets[presetName]) {
      setPattern(presets[presetName])
    }
  }

  return (
    <div className="sequencer-page">
      <h1>Step Sequencer</h1>

      <div className="sequencer-container">
        <div className="transport">
          <button
            className={`play-button ${isPlaying ? 'stop' : 'play'}`}
            onClick={isPlaying ? stopSequencer : startSequencer}
          >
            {isPlaying ? '■ Stop' : '▶ Play'}
          </button>
          
          <div className="tempo-control">
            <label>Tempo: {tempo} BPM</label>
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
            />
          </div>
          
          <div className="swing-control">
            <label>Swing: {swing}%</label>
            <input
              type="range"
              min="0"
              max="70"
              value={swing}
              onChange={(e) => setSwing(Number(e.target.value))}
            />
          </div>
          
          <div className="volume-control">
            <label>Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="pattern-controls">
          <button onClick={clearPattern}>Clear All</button>
          <button onClick={() => loadPreset('basic')}>Basic Beat</button>
          <button onClick={() => loadPreset('house')}>House</button>
          <button onClick={() => loadPreset('trap')}>Trap</button>
        </div>

        <div className="sequencer-grid">
          <div className="track-labels">
            {drumSounds.map((sound, index) => (
              <div key={index} className="track-label">
                <span>{sound.name}</span>
                <button
                  className="randomize-btn"
                  onClick={() => randomizeTrack(index)}
                  title="Randomize track"
                >
                  🎲
                </button>
              </div>
            ))}
          </div>
          
          <div className="step-grid">
            <div className="step-numbers">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className={`step-number ${currentStep === i ? 'active' : ''}`}>
                  {(i % 4) + 1}
                </div>
              ))}
            </div>
            
            {pattern.map((track, trackIndex) => (
              <div key={trackIndex} className="track">
                {track.map((active, stepIndex) => (
                  <button
                    key={stepIndex}
                    className={`step ${active ? 'active' : ''} ${currentStep === stepIndex ? 'playing' : ''} ${stepIndex % 4 === 0 ? 'downbeat' : ''}`}
                    onClick={() => toggleStep(trackIndex, stepIndex)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="info-panel">
          <h3>How to Use</h3>
          <ul>
            <li>Click on grid cells to create patterns</li>
            <li>Each row represents a different drum sound</li>
            <li>Use presets to load common patterns</li>
            <li>Adjust swing for a more human feel</li>
            <li>Click 🎲 to randomize individual tracks</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SequencerPage