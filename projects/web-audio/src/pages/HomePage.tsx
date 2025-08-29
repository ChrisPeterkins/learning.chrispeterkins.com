import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <h1>Web Audio API Exploration</h1>
      <p className="intro">
        Discover the power of the Web Audio API through interactive examples and hands-on experiments.
        From basic synthesis to advanced audio processing, learn how to create, manipulate, and visualize audio in the browser.
      </p>

      <div className="topic-grid">
        <div className="topic-card">
          <h3>Basic Synthesis</h3>
          <p>Create your first synthesizer using oscillators and gain nodes. Learn about waveforms, frequency, and amplitude.</p>
        </div>

        <div className="topic-card">
          <h3>Audio Visualizations</h3>
          <p>Visualize audio data in real-time using the AnalyserNode. Create waveforms, frequency bars, and custom visualizations.</p>
        </div>

        <div className="topic-card">
          <h3>Audio Effects</h3>
          <p>Apply filters, reverb, delay, and distortion to audio signals. Build a complete effects chain.</p>
        </div>

        <div className="topic-card">
          <h3>Step Sequencer</h3>
          <p>Build a drum machine and step sequencer. Learn about timing, scheduling, and sample playback.</p>
        </div>

        <div className="topic-card">
          <h3>Audio Analysis</h3>
          <p>Analyze audio frequencies, detect beats, and extract musical features from audio signals.</p>
        </div>

        <div className="topic-card">
          <h3>Advanced Techniques</h3>
          <p>Explore spatial audio, convolution reverb, and custom audio worklets for advanced processing.</p>
        </div>
      </div>

      <div className="resources">
        <h2>Key Concepts</h2>
        <ul>
          <li>AudioContext and the audio graph</li>
          <li>Audio nodes and connections</li>
          <li>Oscillators and waveforms</li>
          <li>Filters and frequency response</li>
          <li>Time-domain vs frequency-domain analysis</li>
          <li>Audio scheduling and timing</li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage