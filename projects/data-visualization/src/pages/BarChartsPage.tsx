import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const BarChartsPage: React.FC = () => {
  const barChartRef = useRef<SVGSVGElement>(null)
  const lineChartRef = useRef<SVGSVGElement>(null)
  const [selectedDataset, setSelectedDataset] = useState<'sales' | 'population' | 'temperature'>('sales')

  const datasets = {
    sales: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 190 },
      { label: 'Mar', value: 300 },
      { label: 'Apr', value: 500 },
      { label: 'May', value: 200 },
      { label: 'Jun', value: 300 }
    ],
    population: [
      { label: 'Tokyo', value: 37.4 },
      { label: 'Delhi', value: 30.3 },
      { label: 'Shanghai', value: 27.1 },
      { label: 'São Paulo', value: 22.0 },
      { label: 'Mexico City', value: 21.8 }
    ],
    temperature: [
      { label: 'Mon', value: 22 },
      { label: 'Tue', value: 25 },
      { label: 'Wed', value: 23 },
      { label: 'Thu', value: 27 },
      { label: 'Fri', value: 28 },
      { label: 'Sat', value: 26 },
      { label: 'Sun', value: 24 }
    ]
  }

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2024, 0, i + 1),
    value: Math.sin(i * 0.1) * 50 + 100 + Math.random() * 20
  }))

  // Bar Chart
  useEffect(() => {
    if (!barChartRef.current) return

    const svg = d3.select(barChartRef.current)
    svg.selectAll('*').remove()

    const data = datasets[selectedDataset]
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.bottom - margin.top

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)!])
      .nice()
      .range([height, 0])

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => '')
      )

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )

    // Add bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label)!)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', '#4ade80')
      .attr('opacity', 0.8)

    // Animate bars
    bars.transition()
      .duration(1000)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))

    // Add hover effects
    bars
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('fill', '#22d3ee')

        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        tooltip.html(`${d.label}: ${d.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('fill', '#4ade80')

        d3.selectAll('.tooltip').remove()
      })

    // Add axes
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y))

    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'var(--text-secondary)')
      .text('Value')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', 'var(--text-secondary)')
      .text('Category')

  }, [selectedDataset])

  // Line Chart
  useEffect(() => {
    if (!lineChartRef.current) return

    const svg = d3.select(lineChartRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleTime()
      .domain(d3.extent(timeSeriesData, d => d.date)!)
      .range([0, width])

    const y = d3.scaleLinear()
      .domain(d3.extent(timeSeriesData, d => d.value)!)
      .nice()
      .range([height, 0])

    const line = d3.line<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX)

    // Add grid
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => '')
      )

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )

    // Add line
    const path = g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Animate line drawing
    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .attr('stroke-dashoffset', 0)

    // Add dots
    g.selectAll('.dot')
      .data(timeSeriesData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 0)
      .attr('fill', '#4ade80')
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .attr('r', 3)

    // Add axes
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')))

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y))

  }, [])

  return (
    <div className="bar-charts-page">
      <header className="page-header">
        <h1>Bar & Line Charts</h1>
        <p className="page-description">
          Master the fundamentals of data visualization with bar charts and line charts. 
          Learn scales, axes, animations, and interactivity using D3.js.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Interactive Bar Chart</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button 
              className={`demo-button ${selectedDataset === 'sales' ? 'active' : ''}`}
              onClick={() => setSelectedDataset('sales')}
            >
              Monthly Sales
            </button>
            <button 
              className={`demo-button ${selectedDataset === 'population' ? 'active' : ''}`}
              onClick={() => setSelectedDataset('population')}
            >
              City Population (M)
            </button>
            <button 
              className={`demo-button ${selectedDataset === 'temperature' ? 'active' : ''}`}
              onClick={() => setSelectedDataset('temperature')}
            >
              Weekly Temperature
            </button>
          </div>
          
          <div className="visualization-container">
            <svg ref={barChartRef} width="600" height="400"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">D3.js Bar Chart Implementation</span>
          </div>
          <div className="code-content">
            <pre>{`// Create scales
const x = d3.scaleBand()
  .domain(data.map(d => d.label))
  .range([0, width])
  .padding(0.1)

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .nice()
  .range([height, 0])

// Create bars with animation
const bars = g.selectAll('.bar')
  .data(data)
  .enter().append('rect')
  .attr('class', 'bar')
  .attr('x', d => x(d.label))
  .attr('width', x.bandwidth())
  .attr('y', height)
  .attr('height', 0)
  .attr('fill', '#4ade80')

// Animate bars
bars.transition()
  .duration(1000)
  .attr('y', d => y(d.value))
  .attr('height', d => height - y(d.value))

// Add hover effects
bars.on('mouseover', function(event, d) {
  d3.select(this).attr('fill', '#22d3ee')
  // Show tooltip...
})`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Animated Line Chart</h2>
        
        <div className="demo-container">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Time series data with smooth curve interpolation and animated drawing effect.
          </p>
          
          <div className="visualization-container">
            <svg ref={lineChartRef} width="600" height="300"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">D3.js Line Chart with Animation</span>
          </div>
          <div className="code-content">
            <pre>{`// Create line generator
const line = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.value))
  .curve(d3.curveMonotoneX)

// Add animated line
const path = g.append('path')
  .datum(timeSeriesData)
  .attr('fill', 'none')
  .attr('stroke', '#4ade80')
  .attr('stroke-width', 2)
  .attr('d', line)

// Animate line drawing
const totalLength = path.node().getTotalLength()
path
  .attr('stroke-dasharray', totalLength + ' ' + totalLength)
  .attr('stroke-dashoffset', totalLength)
  .transition()
  .duration(2000)
  .attr('stroke-dashoffset', 0)

// Add time scale
const x = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([0, width])`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Key Concepts</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Scales</h3>
            <p>
              Scales map data values to visual dimensions. Use scaleBand for categorical data, 
              scaleLinear for continuous data, and scaleTime for temporal data.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Axes & Grid Lines</h3>
            <p>
              Axes provide reference for reading values. Grid lines help users estimate 
              values more accurately. Both are created using D3's axis generators.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Transitions</h3>
            <p>
              Smooth transitions help users follow changes in data. Use .transition() 
              with duration and delay to create engaging animations.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Interactivity</h3>
            <p>
              Mouse events add interactivity. Use mouseover, mouseout, and click events 
              to provide detailed information and enable exploration.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Best Practices</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Choose the Right Chart
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Bar charts for comparing categories, line charts for trends over time. 
                Consider your data type and the story you want to tell.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Start Y-Axis at Zero
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                For bar charts, always start the y-axis at zero to avoid misleading 
                visual proportions. Line charts can have different baselines if appropriate.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Use Color Meaningfully
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Use color to encode additional information or highlight important data points. 
                Ensure sufficient contrast and consider colorblind accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BarChartsPage