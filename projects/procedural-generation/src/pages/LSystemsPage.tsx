import { useEffect, useRef, useState } from 'react'

interface LSystemRule {
  symbol: string
  replacement: string
}

interface TurtleState {
  x: number
  y: number
  angle: number
}

interface LSystemConfig {
  axiom: string
  rules: LSystemRule[]
  iterations: number
  angle: number
  distance: number
  startX: number
  startY: number
  startAngle: number
}

const presetSystems = {
  fractalTree: {
    name: "Fractal Tree",
    axiom: "0",
    rules: [
      { symbol: "1", replacement: "11" },
      { symbol: "0", replacement: "1[0]0" }
    ],
    angle: 45,
    distance: 10,
    iterations: 4
  },
  dragon: {
    name: "Dragon Curve",
    axiom: "FX",
    rules: [
      { symbol: "X", replacement: "X+YF+" },
      { symbol: "Y", replacement: "-FX-Y" }
    ],
    angle: 90,
    distance: 3,
    iterations: 10
  },
  plant: {
    name: "Plant",
    axiom: "X",
    rules: [
      { symbol: "X", replacement: "F+[[X]-X]-F[-FX]+X" },
      { symbol: "F", replacement: "FF" }
    ],
    angle: 25,
    distance: 2,
    iterations: 5
  },
  sierpinski: {
    name: "Sierpinski Triangle",
    axiom: "F-G-G",
    rules: [
      { symbol: "F", replacement: "F-G+F+G-F" },
      { symbol: "G", replacement: "GG" }
    ],
    angle: 120,
    distance: 2,
    iterations: 6
  }
}

function LSystemsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [config, setConfig] = useState<LSystemConfig>({
    axiom: "0",
    rules: [
      { symbol: "1", replacement: "11" },
      { symbol: "0", replacement: "1[0]0" }
    ],
    iterations: 4,
    angle: 45,
    distance: 10,
    startX: 400,
    startY: 550,
    startAngle: -90
  })
  
  const [currentString, setCurrentString] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("fractalTree")
  const [stats, setStats] = useState({
    stringLength: 0,
    drawCommands: 0,
    generationTime: 0
  })

  const generateLSystem = (axiom: string, rules: LSystemRule[], iterations: number): string => {
    let result = axiom
    
    for (let i = 0; i < iterations; i++) {
      let nextResult = ""
      for (const char of result) {
        const rule = rules.find(r => r.symbol === char)
        nextResult += rule ? rule.replacement : char
      }
      result = nextResult
    }
    
    return result
  }

  const drawLSystem = (
    ctx: CanvasRenderingContext2D, 
    lString: string, 
    config: LSystemConfig
  ) => {
    const stack: TurtleState[] = []
    let turtle: TurtleState = {
      x: config.startX,
      y: config.startY,
      angle: config.startAngle
    }
    
    let drawCommands = 0
    const angleRad = (config.angle * Math.PI) / 180
    
    // Set drawing style
    ctx.strokeStyle = '#4ade80'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    
    // Create gradient for more visual appeal
    const gradient = ctx.createLinearGradient(0, 0, 0, 600)
    gradient.addColorStop(0, '#4ade80')
    gradient.addColorStop(0.7, '#22c55e')
    gradient.addColorStop(1, '#166534')
    ctx.strokeStyle = gradient
    
    for (const command of lString) {
      switch (command) {
        case 'F':
        case '0':
        case '1':
          // Draw forward
          ctx.beginPath()
          ctx.moveTo(turtle.x, turtle.y)
          
          const newX = turtle.x + Math.cos(turtle.angle * Math.PI / 180) * config.distance
          const newY = turtle.y + Math.sin(turtle.angle * Math.PI / 180) * config.distance
          
          ctx.lineTo(newX, newY)
          ctx.stroke()
          
          turtle.x = newX
          turtle.y = newY
          drawCommands++
          break
          
        case '+':
          // Turn right
          turtle.angle += config.angle
          break
          
        case '-':
          // Turn left
          turtle.angle -= config.angle
          break
          
        case '[':
          // Save state
          stack.push({ ...turtle })
          break
          
        case ']':
          // Restore state
          if (stack.length > 0) {
            turtle = stack.pop()!
          }
          break
      }
    }
    
    return drawCommands
  }

  const generateAndDraw = async () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    const startTime = performance.now()
    
    // Clear canvas
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0a0f0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    try {
      // Generate L-system string
      const lString = generateLSystem(config.axiom, config.rules, config.iterations)
      setCurrentString(lString)
      
      // Draw the system
      const drawCommands = drawLSystem(ctx, lString, config)
      
      const endTime = performance.now()
      
      setStats({
        stringLength: lString.length,
        drawCommands,
        generationTime: Math.round(endTime - startTime)
      })
      
    } catch (error) {
      console.error('Error generating L-system:', error)
    }
    
    setIsGenerating(false)
  }

  const loadPreset = (presetKey: string) => {
    const preset = presetSystems[presetKey as keyof typeof presetSystems]
    if (preset) {
      setConfig({
        ...config,
        axiom: preset.axiom,
        rules: preset.rules,
        angle: preset.angle,
        distance: preset.distance,
        iterations: preset.iterations
      })
      setSelectedPreset(presetKey)
    }
  }

  const updateRule = (index: number, field: 'symbol' | 'replacement', value: string) => {
    const newRules = [...config.rules]
    newRules[index][field] = value
    setConfig({ ...config, rules: newRules })
  }

  const addRule = () => {
    setConfig({
      ...config,
      rules: [...config.rules, { symbol: "", replacement: "" }]
    })
  }

  const removeRule = (index: number) => {
    const newRules = config.rules.filter((_, i) => i !== index)
    setConfig({ ...config, rules: newRules })
  }

  useEffect(() => {
    generateAndDraw()
  }, [config])

  return (
    <div className="page">
      <h2>L-Systems (Lindenmayer Systems)</h2>
      <p className="page-description">
        Generate complex organic structures using simple rewriting rules. L-systems are parallel 
        rewriting systems that can model the growth processes of plants and create beautiful fractals.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Preset Systems</label>
          <select 
            value={selectedPreset} 
            onChange={(e) => loadPreset(e.target.value)}
          >
            {Object.entries(presetSystems).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Axiom (Start String)</label>
          <input
            type="text"
            value={config.axiom}
            onChange={(e) => setConfig({ ...config, axiom: e.target.value })}
            style={{ width: '100px', padding: '0.5rem', fontFamily: 'monospace' }}
          />
        </div>

        <div className="control-group">
          <label>Iterations: {config.iterations}</label>
          <input
            type="range"
            min="1"
            max="8"
            value={config.iterations}
            onChange={(e) => setConfig({ ...config, iterations: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Angle: {config.angle}°</label>
          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={config.angle}
            onChange={(e) => setConfig({ ...config, angle: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Distance: {config.distance}</label>
          <input
            type="range"
            min="1"
            max="20"
            value={config.distance}
            onChange={(e) => setConfig({ ...config, distance: parseInt(e.target.value) })}
          />
        </div>

        <button 
          className="generate-button" 
          onClick={generateAndDraw}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600}
        />
        <div className="canvas-info">
          800×600
        </div>
      </div>

      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">String Length</span>
          <span className="stat-value">{stats.stringLength.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Draw Commands</span>
          <span className="stat-value">{stats.drawCommands.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Generation Time</span>
          <span className="stat-value">{stats.generationTime}ms</span>
        </div>
      </div>

      {/* Rule Editor */}
      <div className="info-panel">
        <h3>Production Rules</h3>
        <div style={{ marginBottom: '1rem' }}>
          {config.rules.map((rule, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center', 
              marginBottom: '0.5rem',
              background: 'rgba(26, 93, 58, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              <input
                type="text"
                value={rule.symbol}
                onChange={(e) => updateRule(index, 'symbol', e.target.value)}
                placeholder="Symbol"
                style={{ width: '60px', fontFamily: 'monospace' }}
              />
              <span style={{ color: '#4ade80' }}>→</span>
              <input
                type="text"
                value={rule.replacement}
                onChange={(e) => updateRule(index, 'replacement', e.target.value)}
                placeholder="Replacement"
                style={{ flex: 1, fontFamily: 'monospace' }}
              />
              <button 
                onClick={() => removeRule(index)}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  border: '1px solid #dc2626',
                  color: '#fca5a5',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px'
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button onClick={addRule} className="generate-button" style={{ marginTop: '0.5rem' }}>
            Add Rule
          </button>
        </div>
        
        <div style={{ 
          background: 'rgba(15, 25, 20, 0.6)', 
          padding: '1rem', 
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          color: '#a8bdb2',
          wordBreak: 'break-all',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          <strong>Generated String:</strong><br />
          {currentString.length > 500 ? 
            `${currentString.substring(0, 500)}... (${currentString.length - 500} more chars)` : 
            currentString
          }
        </div>
      </div>

      <div className="info-panel">
        <h3>How L-Systems Work</h3>
        <ul>
          <li><strong>Axiom:</strong> The initial string that serves as the starting point</li>
          <li><strong>Production Rules:</strong> Define how each symbol is replaced in each iteration</li>
          <li><strong>Turtle Graphics:</strong> Interprets the final string as drawing commands</li>
          <li><strong>Commands:</strong> F/0/1 = draw forward, +/- = turn, [ = save state, ] = restore state</li>
          <li><strong>Parallel Rewriting:</strong> All symbols are replaced simultaneously in each iteration</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>Turtle Commands</h3>
        <ul>
          <li><strong>F, 0, 1:</strong> Move forward and draw a line</li>
          <li><strong>+:</strong> Turn right by the specified angle</li>
          <li><strong>-:</strong> Turn left by the specified angle</li>
          <li><strong>[:</strong> Save current position and angle (push to stack)</li>
          <li><strong>]:</strong> Restore last saved position and angle (pop from stack)</li>
        </ul>
      </div>
    </div>
  )
}

export default LSystemsPage