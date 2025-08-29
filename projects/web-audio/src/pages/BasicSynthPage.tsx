import { useState, useRef, useEffect } from 'react'
import './BasicSynthPage.css'

function BasicSynthPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [frequency, setFrequency] = useState(440)
  const [volume, setVolume] = useState(0.5)
  const [waveform, setWaveform] = useState<OscillatorType>('sine')
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = waveform
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()

    oscillatorRef.current = osc
    gainNodeRef.current = gain
    setIsPlaying(true)
  }

  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current.disconnect()
      oscillatorRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    setIsPlaying(false)
  }

  const updateFrequency = (newFreq: number) => {
    setFrequency(newFreq)
    if (oscillatorRef.current && audioContextRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(newFreq, audioContextRef.current.currentTime)
    }
  }

  const updateVolume = (newVol: number) => {
    setVolume(newVol)
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioContextRef.current.currentTime)
    }
  }

  const updateWaveform = (newWave: OscillatorType) => {
    setWaveform(newWave)
    if (oscillatorRef.current) {
      oscillatorRef.current.type = newWave
    }
  }

  const playNote = (noteFreq: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = waveform
    osc.frequency.setValueAtTime(noteFreq, ctx.currentTime)
    
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  }

  const notes = [
    { note: 'C4', freq: 261.63 },
    { note: 'D4', freq: 293.66 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'G4', freq: 392.00 },
    { note: 'A4', freq: 440.00 },
    { note: 'B4', freq: 493.88 },
    { note: 'C5', freq: 523.25 }
  ]

  return (
    <div className="basic-synth-page">
      <h1>Basic Synthesizer</h1>
      
      <div className="synth-container">
        <div className="control-group">
          <h3>Oscillator Controls</h3>
          
          <div className="control">
            <label>Waveform</label>
            <div className="waveform-buttons">
              {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(wave => (
                <button
                  key={wave}
                  className={waveform === wave ? 'active' : ''}
                  onClick={() => updateWaveform(wave)}
                >
                  {wave}
                </button>
              ))}
            </div>
          </div>

          <div className="control">
            <label>Frequency: {frequency} Hz</label>
            <input
              type="range"
              min="20"
              max="2000"
              value={frequency}
              onChange={(e) => updateFrequency(Number(e.target.value))}
            />
          </div>

          <div className="control">
            <label>Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => updateVolume(Number(e.target.value))}
            />
          </div>

          <div className="control">
            <button
              className={`play-button ${isPlaying ? 'stop' : 'play'}`}
              onClick={isPlaying ? stopSound : startSound}
            >
              {isPlaying ? 'Stop' : 'Play'} Continuous Tone
            </button>
          </div>
        </div>

        <div className="keyboard-container">
          <h3>Piano Keyboard</h3>
          <div className="keyboard">
            {notes.map(({ note, freq }) => (
              <button
                key={note}
                className="key"
                onMouseDown={() => playNote(freq)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        <div className="info-panel">
          <h3>How It Works</h3>
          <ul>
            <li><strong>AudioContext:</strong> The main controller for all Web Audio API operations</li>
            <li><strong>OscillatorNode:</strong> Generates periodic waveforms at a given frequency</li>
            <li><strong>GainNode:</strong> Controls the volume/amplitude of the audio signal</li>
            <li><strong>Waveforms:</strong> Different shapes produce different timbres (sine = pure, square = buzzy, sawtooth = bright, triangle = mellow)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BasicSynthPage