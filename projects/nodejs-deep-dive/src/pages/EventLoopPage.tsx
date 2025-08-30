import React, { useState, useEffect, useRef } from 'react'

interface Phase {
  name: string
  description: string
  color: string
  active: boolean
}

const EventLoopPage: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const animationRef = useRef<number>()
  
  const phases: Phase[] = [
    {
      name: 'Timers',
      description: 'Executes callbacks scheduled by setTimeout() and setInterval()',
      color: '#4ade80',
      active: false
    },
    {
      name: 'Pending Callbacks',
      description: 'Executes I/O callbacks deferred to the next loop iteration',
      color: '#60a5fa',
      active: false
    },
    {
      name: 'Idle, Prepare',
      description: 'Internal use only',
      color: '#4ade80',
      active: false
    },
    {
      name: 'Poll',
      description: 'Retrieve new I/O events; execute I/O related callbacks',
      color: '#f472b6',
      active: false
    },
    {
      name: 'Check',
      description: 'setImmediate() callbacks are invoked here',
      color: '#fb923c',
      active: false
    },
    {
      name: 'Close Callbacks',
      description: 'Execute close event callbacks (e.g., socket.on("close"))',
      color: '#fbbf24',
      active: false
    }
  ]
  
  useEffect(() => {
    if (isRunning) {
      const cycle = () => {
        setCurrentPhase(prev => {
          const next = (prev + 1) % phases.length
          addLog(`➤ Entering ${phases[next].name} phase`)
          return next
        })
      }
      
      const interval = setInterval(cycle, 1500)
      return () => clearInterval(interval)
    }
  }, [isRunning])
  
  const addLog = (message: string) => {
    setExecutionLog(prev => [...prev.slice(-9), message])
  }
  
  const runExample = (example: string) => {
    switch (example) {
      case 'timers':
        addLog('📝 Code: setTimeout(() => console.log("Timer"), 0)')
        addLog('📝 Code: setImmediate(() => console.log("Immediate"))')
        setTimeout(() => {
          addLog('✓ Immediate callback executed (Check phase)')
          addLog('✓ Timer callback executed (Timers phase)')
        }, 100)
        break
        
      case 'promise':
        addLog('📝 Code: Promise.resolve().then(() => console.log("Promise"))')
        addLog('📝 Code: process.nextTick(() => console.log("NextTick"))')
        setTimeout(() => {
          addLog('✓ NextTick callback (before event loop)')
          addLog('✓ Promise microtask (before event loop)')
        }, 100)
        break
        
      case 'io':
        addLog('📝 Code: fs.readFile("file.txt", callback)')
        setTimeout(() => {
          addLog('⏳ I/O operation initiated')
          addLog('✓ I/O callback queued (Poll phase)')
        }, 100)
        break
    }
  }
  
  return (
    <div className="event-loop-page">
      <header className="page-header">
        <h1>The Event Loop</h1>
        <p className="page-description">
          Understanding Node.js's event-driven architecture and how it handles asynchronous operations 
          through the event loop phases.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Event Loop Phases</h2>
        
        <div className="visualization-container">
          <svg width="500" height="500" viewBox="0 0 500 500">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill="var(--accent-green-bright)"
                />
              </marker>
            </defs>
            
            {/* Draw hexagon for event loop */}
            {phases.map((phase, index) => {
              const angle = (index * 60 - 90) * (Math.PI / 180)
              const x = 250 + 150 * Math.cos(angle)
              const y = 250 + 150 * Math.sin(angle)
              const nextAngle = ((index + 1) * 60 - 90) * (Math.PI / 180)
              const nextX = 250 + 150 * Math.cos(nextAngle)
              const nextY = 250 + 150 * Math.sin(nextAngle)
              
              return (
                <g key={index}>
                  {/* Connection lines */}
                  <line
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke={currentPhase === index ? 'var(--accent-green-bright)' : 'var(--border-primary)'}
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  
                  {/* Phase circles */}
                  <circle
                    cx={x}
                    cy={y}
                    r="35"
                    fill={currentPhase === index ? phase.color : 'var(--bg-secondary)'}
                    stroke={currentPhase === index ? phase.color : 'var(--border-primary)'}
                    strokeWidth="2"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  
                  {/* Phase labels */}
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={currentPhase === index ? 'var(--bg-primary)' : 'var(--text-secondary)'}
                    fontSize="12"
                    fontWeight={currentPhase === index ? '600' : '400'}
                  >
                    {phase.name.split(' ')[0]}
                  </text>
                </g>
              )
            })}
            
            {/* Center label */}
            <text
              x="250"
              y="250"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-primary)"
              fontSize="16"
              fontWeight="600"
            >
              Event Loop
            </text>
          </svg>
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              className={`demo-button ${isRunning ? 'active' : ''}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Stop' : 'Start'} Animation
            </button>
          </div>
          
          {currentPhase !== null && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'var(--code-bg)',
              border: '1px solid var(--code-border)',
              borderLeft: `3px solid ${phases[currentPhase].color}`
            }}>
              <h3 style={{ color: phases[currentPhase].color, marginBottom: '0.5rem' }}>
                {phases[currentPhase].name} Phase
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {phases[currentPhase].description}
              </p>
            </div>
          )}
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Interactive Examples</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button className="demo-button" onClick={() => runExample('timers')}>
              Timers vs Immediate
            </button>
            <button className="demo-button" onClick={() => runExample('promise')}>
              Promises & NextTick
            </button>
            <button className="demo-button" onClick={() => runExample('io')}>
              I/O Operations
            </button>
          </div>
          
          <div className="demo-output">
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem' }}>
              {executionLog.length === 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Click a button above to see execution order...
                </span>
              ) : (
                executionLog.map((log, i) => (
                  <div key={i} style={{ 
                    marginBottom: '0.5rem',
                    color: log.includes('✓') ? 'var(--accent-green-bright)' : 
                           log.includes('➤') ? 'var(--text-primary)' : 
                           'var(--text-secondary)'
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Code Examples</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Understanding Execution Order</span>
          </div>
          <div className="code-content">
            <pre>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

Promise.resolve()
  .then(() => console.log('Promise'));

process.nextTick(() => {
  console.log('NextTick');
});

setImmediate(() => {
  console.log('Immediate');
});

console.log('End');

// Output order:
// Start
// End
// NextTick
// Promise
// Timeout or Immediate (depends on process performance)
// Immediate or Timeout`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Blocking vs Non-Blocking</span>
          </div>
          <div className="code-content">
            <pre>{`// ❌ Blocking - Avoid this!
const fs = require('fs');
const data = fs.readFileSync('/large-file.json');
console.log('This waits for file read');

// ✅ Non-blocking - Preferred approach
fs.readFile('/large-file.json', (err, data) => {
  if (err) throw err;
  console.log('File read complete');
});
console.log('This runs immediately');`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Key Concepts</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Microtasks Queue</h3>
            <p>
              Promises and process.nextTick() callbacks are processed between each phase of the 
              event loop, ensuring they run before the next phase begins.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>I/O Polling</h3>
            <p>
              The Poll phase will wait for I/O events if there are no timers scheduled, making 
              Node.js efficient for I/O-heavy operations.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>setImmediate vs setTimeout</h3>
            <p>
              Within an I/O cycle, setImmediate() always executes before setTimeout(), but their 
              order can vary in the main module.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EventLoopPage