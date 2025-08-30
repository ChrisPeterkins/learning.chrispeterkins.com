import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const ScatterPlotsPage: React.FC = () => {
  const scatterRef = useRef<SVGSVGElement>(null)
  const heatmapRef = useRef<SVGSVGElement>(null)
  const [scatterDataset, setScatterDataset] = useState<'iris' | 'cars' | 'random'>('iris')

  const datasets = {
    iris: [
      { x: 5.1, y: 3.5, size: 15, category: 'Setosa' },
      { x: 4.9, y: 3.0, size: 14, category: 'Setosa' },
      { x: 4.7, y: 3.2, size: 13, category: 'Setosa' },
      { x: 4.6, y: 3.1, size: 15, category: 'Setosa' },
      { x: 5.0, y: 3.6, size: 14, category: 'Setosa' },
      { x: 7.0, y: 3.2, size: 47, category: 'Versicolor' },
      { x: 6.4, y: 3.2, size: 45, category: 'Versicolor' },
      { x: 6.9, y: 3.1, size: 49, category: 'Versicolor' },
      { x: 5.5, y: 2.3, size: 40, category: 'Versicolor' },
      { x: 6.5, y: 2.8, size: 46, category: 'Versicolor' },
      { x: 6.3, y: 3.3, size: 60, category: 'Virginica' },
      { x: 5.8, y: 2.7, size: 51, category: 'Virginica' },
      { x: 7.1, y: 3.0, size: 59, category: 'Virginica' },
      { x: 6.3, y: 2.9, size: 56, category: 'Virginica' },
      { x: 6.5, y: 3.0, size: 58, category: 'Virginica' }
    ],
    cars: [
      { x: 21.0, y: 6, size: 160, category: 'Compact' },
      { x: 21.0, y: 6, size: 160, category: 'Compact' },
      { x: 22.8, y: 4, size: 108, category: 'Compact' },
      { x: 21.4, y: 6, size: 258, category: 'Mid-size' },
      { x: 18.7, y: 8, size: 360, category: 'Full-size' },
      { x: 18.1, y: 6, size: 225, category: 'Mid-size' },
      { x: 14.3, y: 8, size: 360, category: 'Full-size' },
      { x: 24.4, y: 4, size: 147, category: 'Compact' },
      { x: 22.8, y: 4, size: 141, category: 'Compact' },
      { x: 19.2, y: 6, size: 168, category: 'Mid-size' },
      { x: 17.8, y: 6, size: 168, category: 'Mid-size' },
      { x: 16.4, y: 8, size: 276, category: 'Full-size' },
      { x: 17.3, y: 8, size: 276, category: 'Full-size' },
      { x: 15.2, y: 8, size: 275, category: 'Full-size' },
      { x: 10.4, y: 8, size: 472, category: 'Full-size' }
    ],
    random: Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 5,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }))
  }

  // Heatmap data
  const heatmapData = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => ({
      x: i,
      y: j,
      value: Math.sin(i * 0.3) * Math.cos(j * 0.4) * 100 + Math.random() * 20
    }))
  ).flat()

  const colorScale = d3.scaleOrdinal()
    .domain(['Setosa', 'Versicolor', 'Virginica', 'Compact', 'Mid-size', 'Full-size', 'A', 'B', 'C'])
    .range(['#4ade80', '#22d3ee', '#4ade80', '#f59e0b', '#ef4444', '#ec4899', '#1a5d3a', '#06b6d4', '#10b981'])

  // Scatter Plot
  useEffect(() => {
    if (!scatterRef.current) return

    const svg = d3.select(scatterRef.current)
    svg.selectAll('*').remove()

    const data = datasets[scatterDataset]
    const margin = { top: 20, right: 100, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.bottom - margin.top

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x)!)
      .nice()
      .range([0, width])

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y)!)
      .nice()
      .range([height, 0])

    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(data, d => d.size)!)
      .range([4, 15])

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

    // Add dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 0)
      .attr('fill', d => colorScale(d.category) as string)
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)

    // Animate dots
    dots.transition()
      .delay((d, i) => i * 50)
      .duration(800)
      .attr('r', d => sizeScale(d.size))

    // Add hover effects
    dots
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 2)

        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        tooltip.html(`Category: ${d.category}<br/>X: ${d.x.toFixed(1)}<br/>Y: ${d.y.toFixed(1)}<br/>Size: ${d.size.toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke-width', 1)

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

    // Add legend
    const categories = [...new Set(data.map(d => d.category))]
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 10}, 20)`)

    const legendItems = legend.selectAll('.legend-item')
      .data(categories)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`)

    legendItems.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)
      .attr('fill', d => colorScale(d) as string)

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)')
      .text(d => d)

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'var(--text-secondary)')
      .text('Y Value')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', 'var(--text-secondary)')
      .text('X Value')

  }, [scatterDataset])

  // Heatmap
  useEffect(() => {
    if (!heatmapRef.current) return

    const svg = d3.select(heatmapRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xValues = [...new Set(heatmapData.map(d => d.x))].sort((a, b) => a - b)
    const yValues = [...new Set(heatmapData.map(d => d.y))].sort((a, b) => a - b)

    const x = d3.scaleBand()
      .domain(xValues.map(String))
      .range([0, width])
      .padding(0.05)

    const y = d3.scaleBand()
      .domain(yValues.map(String))
      .range([0, height])
      .padding(0.05)

    const colorScaleHeat = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain(d3.extent(heatmapData, d => d.value)!)

    // Add rectangles
    const rects = g.selectAll('.cell')
      .data(heatmapData)
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', d => x(String(d.x))!)
      .attr('y', d => y(String(d.y))!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', '#000')
      .attr('opacity', 0)

    // Animate cells
    rects.transition()
      .delay((d, i) => i * 20)
      .duration(600)
      .attr('fill', d => colorScaleHeat(d.value))
      .attr('opacity', 0.8)

    // Add hover effects
    rects
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1)

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        tooltip.html(`X: ${d.x}<br/>Y: ${d.y}<br/>Value: ${d.value.toFixed(2)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8)
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

    // Add color legend
    const legendWidth = 20
    const legendHeight = height
    const legendG = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`)

    const legendScale = d3.scaleLinear()
      .domain(colorScaleHeat.domain())
      .range([legendHeight, 0])

    const legendAxis = d3.axisRight(legendScale)
      .ticks(6)

    // Create gradient
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '100%')
      .attr('y2', '0%')

    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const value = (i / steps) * (colorScaleHeat.domain()[1] - colorScaleHeat.domain()[0]) + colorScaleHeat.domain()[0]
      gradient.append('stop')
        .attr('offset', `${(i / steps) * 100}%`)
        .attr('stop-color', colorScaleHeat(value))
    }

    legendG.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')

    legendG.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)

  }, [])

  return (
    <div className="scatter-plots-page">
      <header className="page-header">
        <h1>Scatter Plots & Heatmaps</h1>
        <p className="page-description">
          Explore multi-dimensional data with scatter plots and heatmaps. Learn to encode 
          multiple variables using position, size, color, and create correlation visualizations.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Interactive Scatter Plot</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button 
              className={`demo-button ${scatterDataset === 'iris' ? 'active' : ''}`}
              onClick={() => setScatterDataset('iris')}
            >
              Iris Dataset
            </button>
            <button 
              className={`demo-button ${scatterDataset === 'cars' ? 'active' : ''}`}
              onClick={() => setScatterDataset('cars')}
            >
              Car Performance
            </button>
            <button 
              className={`demo-button ${scatterDataset === 'random' ? 'active' : ''}`}
              onClick={() => setScatterDataset('random')}
            >
              Random Data
            </button>
          </div>
          
          <div className="visualization-container">
            <svg ref={scatterRef} width="600" height="400"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Scatter Plot with Size and Color Encoding</span>
          </div>
          <div className="code-content">
            <pre>{`// Create scales
const x = d3.scaleLinear()
  .domain(d3.extent(data, d => d.x))
  .nice()
  .range([0, width])

const y = d3.scaleLinear()
  .domain(d3.extent(data, d => d.y))
  .nice()
  .range([height, 0])

const sizeScale = d3.scaleSqrt()
  .domain(d3.extent(data, d => d.size))
  .range([4, 15])

const colorScale = d3.scaleOrdinal()
  .domain(categories)
  .range(['#4ade80', '#22d3ee', '#4ade80'])

// Create circles
g.selectAll('.dot')
  .data(data)
  .enter().append('circle')
  .attr('cx', d => x(d.x))
  .attr('cy', d => y(d.y))
  .attr('r', d => sizeScale(d.size))
  .attr('fill', d => colorScale(d.category))
  .attr('opacity', 0.7)`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Interactive Heatmap</h2>
        
        <div className="demo-container">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Heatmap showing correlation patterns with color-coded values and interactive tooltips.
          </p>
          
          <div className="visualization-container">
            <svg ref={heatmapRef} width="600" height="300"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">D3.js Heatmap Implementation</span>
          </div>
          <div className="code-content">
            <pre>{`// Create scales
const x = d3.scaleBand()
  .domain(xValues.map(String))
  .range([0, width])
  .padding(0.05)

const y = d3.scaleBand()
  .domain(yValues.map(String))
  .range([0, height])
  .padding(0.05)

const colorScale = d3.scaleSequential()
  .interpolator(d3.interpolateViridis)
  .domain(d3.extent(data, d => d.value))

// Create cells
g.selectAll('.cell')
  .data(heatmapData)
  .enter().append('rect')
  .attr('x', d => x(String(d.x)))
  .attr('y', d => y(String(d.y)))
  .attr('width', x.bandwidth())
  .attr('height', y.bandwidth())
  .attr('fill', d => colorScale(d.value))
  .attr('opacity', 0.8)`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Advanced Techniques</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Multi-dimensional Encoding</h3>
            <p>
              Use position (x, y), size, color, and shape to encode different variables. 
              This allows you to visualize 4-5 dimensions of data simultaneously.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Color Scales</h3>
            <p>
              Choose appropriate color scales: categorical for discrete groups, 
              sequential for ordered data, diverging for data with meaningful midpoint.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Brushing & Linking</h3>
            <p>
              Allow users to select regions in one chart to highlight corresponding 
              points in another. Great for exploring relationships between variables.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Clustering Visualization</h3>
            <p>
              Use algorithms like k-means clustering and visualize the results with 
              different colors or shapes to show natural groupings in your data.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Design Guidelines</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Avoid Overplotting
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                When points overlap, use transparency, jittering, or hexagonal binning. 
                Consider using smaller points or alternative representations for dense data.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Choose Meaningful Colors
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Use perceptually uniform color scales like Viridis. Ensure colors are 
                distinguishable and consider colorblind accessibility.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Add Clear Legends
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Always provide legends for color and size encodings. Make them interactive 
                when possible to help users understand the mapping.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ScatterPlotsPage