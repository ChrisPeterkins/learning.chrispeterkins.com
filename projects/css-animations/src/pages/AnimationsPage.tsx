import React, { useState } from 'react'

const AnimationsPage: React.FC = () => {
  const [animation, setAnimation] = useState('bounce')
  const [duration, setDuration] = useState('1')
  const [timing, setTiming] = useState('ease')
  const [iteration, setIteration] = useState('infinite')
  const [direction, setDirection] = useState('normal')
  const [isPlaying, setIsPlaying] = useState(true)

  const animations = {
    bounce: `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`,
    rotate: `
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    pulse: `
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}`,
    slide: `
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}`,
    fade: `
@keyframes fade {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}`,
    shake: `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}`
  }

  const timingFunctions = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']
  const directions = ['normal', 'reverse', 'alternate', 'alternate-reverse']

  return (
    <div className="animations-page">
      <header className="page-header">
        <h1>CSS Animations</h1>
        <p className="page-description">
          Create complex, multi-step animations with CSS keyframes. Control timing, duration, 
          and create engaging user experiences with pure CSS.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Animation Playground</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <div className="control-group">
              <label>Animation</label>
              <select 
                className="control-input"
                value={animation} 
                onChange={(e) => setAnimation(e.target.value)}
              >
                {Object.keys(animations).map(anim => (
                  <option key={anim} value={anim}>
                    {anim.charAt(0).toUpperCase() + anim.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Duration: {duration}s</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Timing Function</label>
              <select 
                className="control-input"
                value={timing} 
                onChange={(e) => setTiming(e.target.value)}
              >
                {timingFunctions.map(func => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Iteration</label>
              <select 
                className="control-input"
                value={iteration} 
                onChange={(e) => setIteration(e.target.value)}
              >
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="infinite">Infinite</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Direction</label>
              <select 
                className="control-input"
                value={direction} 
                onChange={(e) => setDirection(e.target.value)}
              >
                {directions.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
            
            <button 
              className={`demo-button ${isPlaying ? 'active' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
          
          <div className="animation-showcase">
            <div 
              className="animated-element"
              style={{
                animation: isPlaying 
                  ? `${animation} ${duration}s ${timing} ${iteration} ${direction}`
                  : 'none'
              }}
            >
              Animated
            </div>
            
            <style>{animations[animation as keyof typeof animations]}</style>
          </div>
          
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid var(--accent-green)'
          }}>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>
              Animation Properties
            </h4>
            <code style={{ 
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}>
              animation: {animation} {duration}s {timing} {iteration} {direction};
            </code>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Keyframe Definition</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Current Animation Keyframes</span>
          </div>
          <div className="code-content">
            <pre>{animations[animation as keyof typeof animations]}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Complex Animation Examples</h2>
        
        <div className="demo-container">
          <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1.5rem' }}>Loading Spinner</h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--code-bg)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid var(--border-primary)',
              borderTopColor: 'var(--accent-green-bright)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
          
          <h3 style={{ color: 'var(--accent-green-bright)', marginTop: '2rem', marginBottom: '1.5rem' }}>
            Typing Effect
          </h3>
          <div style={{ 
            padding: '2rem',
            background: 'var(--code-bg)',
            fontFamily: 'JetBrains Mono'
          }}>
            <span style={{
              color: 'var(--accent-green-bright)',
              borderRight: '2px solid var(--accent-green-bright)',
              animation: 'typing 3s steps(20) infinite, blink 0.5s step-end infinite',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'inline-block',
              width: '20ch'
            }}>
              Hello CSS Animations
            </span>
          </div>
          
          <h3 style={{ color: 'var(--accent-green-bright)', marginTop: '2rem', marginBottom: '1.5rem' }}>
            Morphing Shape
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '3rem',
            background: 'var(--code-bg)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--accent-green), var(--accent-green-bright))',
              animation: 'morph 4s ease-in-out infinite'
            }} />
          </div>
        </div>
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes typing {
            from { width: 0; }
            to { width: 20ch; }
          }
          
          @keyframes blink {
            50% { border-color: transparent; }
          }
          
          @keyframes morph {
            0%, 100% { 
              border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
              transform: rotate(0deg);
            }
            33% { 
              border-radius: 50% 20% 50% 20% / 20% 50% 20% 50%;
              transform: rotate(120deg);
            }
            66% { 
              border-radius: 20% 50% 20% 50% / 50% 20% 50% 20%;
              transform: rotate(240deg);
            }
          }
        `}</style>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Performance Tips</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Transform & Opacity</h3>
            <p>
              Animate only transform and opacity for best performance. These properties 
              don't trigger layout recalculation.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Will-Change</h3>
            <p>
              Use will-change property to hint browsers about upcoming animations. 
              Remove it after animation completes.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>GPU Acceleration</h3>
            <p>
              Use transform: translateZ(0) or will-change: transform to enable GPU 
              acceleration for smoother animations.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AnimationsPage