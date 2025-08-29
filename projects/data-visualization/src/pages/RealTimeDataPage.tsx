import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const RealTimeDataPage: React.FC = () => {
  const realtimeChartRef = useRef<SVGSVGElement>(null)
  const gaugeRef = useRef<SVGSVGElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentValue, setCurrentValue] = useState(50)
  const dataBufferRef = useRef<{ time: Date; value: number }[]>([])

  // Real-time line chart
  useEffect(() => {
    if (!realtimeChartRef.current) return

    const svg = d3.select(realtimeChartRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleTime()
      .range([0, width])

    const y = d3.scaleLinear()
      .range([height, 0])

    const line = d3.line<{ time: Date; value: number }>()
      .x(d => x(d.time))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX)

    const path = g.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)

    const xAxis = g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)

    const yAxis = g.append('g')
      .attr('class', 'axis')

    // Grid lines
    const xGrid = g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)

    const yGrid = g.append('g')
      .attr('class', 'grid')

    let interval: NodeJS.Timeout

    const updateChart = () => {
      const now = new Date()
      const value = Math.sin(Date.now() / 1000) * 30 + 50 + (Math.random() - 0.5) * 20
      
      dataBufferRef.current.push({ time: now, value })
      setCurrentValue(value)

      // Keep only last 50 data points
      if (dataBufferRef.current.length > 50) {
        dataBufferRef.current.shift()
      }

      if (dataBufferRef.current.length < 2) return

      // Update scales
      x.domain(d3.extent(dataBufferRef.current, d => d.time)!)
      y.domain([0, 100])

      // Update grid
      xGrid.call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      
      yGrid.call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )

      // Update axes
      xAxis.call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M:%S')))
      yAxis.call(d3.axisLeft(y))

      // Update path
      path.datum(dataBufferRef.current)
        .attr('d', line)

      // Add new point with animation
      if (dataBufferRef.current.length > 1) {
        const lastPoint = dataBufferRef.current[dataBufferRef.current.length - 1]
        g.append('circle')
          .attr('cx', x(lastPoint.time))
          .attr('cy', y(lastPoint.value))
          .attr('r', 0)
          .attr('fill', '#4ade80')
          .transition()
          .duration(200)
          .attr('r', 3)
          .transition()
          .delay(1000)
          .duration(500)
          .attr('r', 0)
          .remove()
      }
    }

    if (isRunning) {
      interval = setInterval(updateChart, 500)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Gauge chart
  useEffect(() => {
    if (!gaugeRef.current) return

    const svg = d3.select(gaugeRef.current)
    svg.selectAll('*').remove()

    const width = 300
    const height = 200
    const radius = 80

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height - 20})`)

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)

    g.append('path')
      .attr('d', backgroundArc)
      .attr('fill', '#333')

    // Value arc
    const valueArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)

    const valuePath = g.append('path')
      .attr('fill', '#4ade80')

    // Center text
    const valueText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-10px')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', 'var(--text-primary)')

    const labelText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '15px')
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)')
      .text('Real-time Value')

    // Scale marks
    const scale = d3.scaleLinear()
      .domain([0, 100])
      .range([-Math.PI / 2, Math.PI / 2])

    const ticks = d3.range(0, 101, 20)
    const tickArcs = g.selectAll('.tick')
      .data(ticks)
      .enter().append('line')
      .attr('class', 'tick')
      .attr('x1', d => (radius + 5) * Math.cos(scale(d) - Math.PI / 2))
      .attr('y1', d => (radius + 5) * Math.sin(scale(d) - Math.PI / 2))
      .attr('x2', d => (radius + 15) * Math.cos(scale(d) - Math.PI / 2))
      .attr('y2', d => (radius + 15) * Math.sin(scale(d) - Math.PI / 2))
      .attr('stroke', 'var(--text-secondary)')

    const tickLabels = g.selectAll('.tick-label')
      .data(ticks)
      .enter().append('text')
      .attr('class', 'tick-label')
      .attr('x', d => (radius + 25) * Math.cos(scale(d) - Math.PI / 2))
      .attr('y', d => (radius + 25) * Math.sin(scale(d) - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', 'var(--text-secondary)')
      .text(d => d)

    // Update function
    const updateGauge = (value: number) => {
      const angle = scale(value)
      
      valueArc.endAngle(angle)
      valuePath.transition()
        .duration(300)
        .attr('d', valueArc)

      valueText.text(Math.round(value))

      // Color based on value
      const color = value > 75 ? '#ef4444' : value > 50 ? '#f59e0b' : '#4ade80'
      valuePath.attr('fill', color)
    }

    updateGauge(currentValue)

  }, [currentValue])

  const handleStart = () => {
    setIsRunning(true)
    dataBufferRef.current = [] // Clear existing data
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    dataBufferRef.current = []
    setCurrentValue(50)
  }

  return (
    <div className="real-time-data-page">
      <header className="page-header">
        <h1>Real-time Data Visualization</h1>
        <p className="page-description">
          Learn to visualize streaming data with dynamic updates, real-time charts, and 
          interactive dashboards that respond to live data feeds.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Live Data Stream</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button 
              className={`demo-button ${isRunning ? 'active' : ''}`}
              onClick={handleStart}
              disabled={isRunning}
            >
              Start Stream
            </button>
            <button 
              className="demo-button"
              onClick={handleStop}
              disabled={!isRunning}
            >
              Stop Stream
            </button>
            <button 
              className="demo-button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div className="visualization-container" style={{ flex: 1 }}>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Time Series Chart
              </h4>
              <svg ref={realtimeChartRef} width="600" height="300"></svg>
            </div>
            
            <div className="visualization-container" style={{ minWidth: '300px' }}>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Real-time Gauge
              </h4>
              <svg ref={gaugeRef} width="300" height="200"></svg>
            </div>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Real-time Chart Updates</span>
          </div>
          <div className="code-content">
            <pre>{`// Update chart with new data point
const updateChart = () => {
  const now = new Date()
  const value = generateNewValue()
  
  // Add new data point
  dataBuffer.push({ time: now, value })
  
  // Keep only recent data
  if (dataBuffer.length > 50) {
    dataBuffer.shift()
  }
  
  // Update scales
  x.domain(d3.extent(dataBuffer, d => d.time))
  y.domain([0, 100])
  
  // Update path with smooth transition
  path.datum(dataBuffer)
    .transition()
    .duration(200)
    .attr('d', line)
}

// Start real-time updates
const interval = setInterval(updateChart, 500)`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Real-time Patterns</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Data Buffering</h3>
            <p>
              Maintain a rolling buffer of recent data points. Remove old data to prevent 
              memory issues while keeping enough history for context.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`// Rolling data buffer
if (buffer.length > maxPoints) {
  buffer.shift() // Remove oldest
}
buffer.push(newDataPoint)`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Smooth Transitions</h3>
            <p>
              Use D3 transitions to create smooth updates between data states. This helps 
              users track changes and reduces visual jarring.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`path.transition()
  .duration(300)
  .attr('d', line)`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Performance Optimization</h3>
            <p>
              Use requestAnimationFrame for smooth animations, debounce updates for high-frequency 
              data, and consider WebGL for large datasets.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`// Throttle updates
const throttledUpdate = 
  debounce(updateChart, 100)`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>WebSocket Integration</h3>
            <p>
              Connect to real data sources using WebSockets, Server-Sent Events, or polling. 
              Handle connection errors and reconnection logic.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`const ws = new WebSocket(url)
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  updateVisualization(data)
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Dashboard Components</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Metrics Cards</h3>
            <p>
              Display key performance indicators with large numbers, trend indicators, 
              and sparkline charts for quick insights.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Alert Systems</h3>
            <p>
              Implement threshold-based alerts with visual indicators, color changes, 
              and notifications when values exceed normal ranges.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Time Range Controls</h3>
            <p>
              Allow users to zoom into different time periods, from seconds to hours, 
              with appropriate data aggregation for each zoom level.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Multi-stream Correlation</h3>
            <p>
              Show relationships between multiple data streams using synchronized charts, 
              correlation matrices, and cross-filtering.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Implementation Tips</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Handle High Frequency Data
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                For high-frequency data streams, aggregate data points or use sampling 
                to maintain smooth performance while preserving important trends.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Graceful Degradation
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Handle network interruptions gracefully with reconnection logic, 
                cached data, and clear status indicators for users.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Memory Management
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Implement proper cleanup for intervals, WebSocket connections, and 
                DOM elements to prevent memory leaks in long-running applications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RealTimeDataPage