import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const GeographicMapsPage: React.FC = () => {
  const choroplethRef = useRef<SVGSVGElement>(null)
  const pointMapRef = useRef<SVGSVGElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<'population' | 'gdp' | 'temperature'>('population')

  // Mock geographic data - in a real app, you'd load actual GeoJSON
  const stateData = {
    population: {
      'California': 39538223,
      'Texas': 29145505,
      'Florida': 21538187,
      'New York': 20201249,
      'Pennsylvania': 13002700,
      'Illinois': 12812508,
      'Ohio': 11799448,
      'Georgia': 10711908,
      'North Carolina': 10439388,
      'Michigan': 10037261
    },
    gdp: {
      'California': 3353,
      'Texas': 2356,
      'New York': 1893,
      'Florida': 1032,
      'Illinois': 806,
      'Pennsylvania': 788,
      'Ohio': 689,
      'Georgia': 589,
      'North Carolina': 566,
      'Michigan': 527
    },
    temperature: {
      'California': 15.2,
      'Texas': 19.8,
      'Florida': 22.1,
      'New York': 8.9,
      'Pennsylvania': 9.4,
      'Illinois': 10.6,
      'Ohio': 10.8,
      'Georgia': 16.7,
      'North Carolina': 14.8,
      'Michigan': 8.1
    }
  }

  const cities = [
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, population: 3979576 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298, population: 2693976 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698, population: 2320268 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740, population: 1680992 },
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, population: 1584064 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936, population: 1547253 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611, population: 1423851 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970, population: 1343573 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863, population: 1021795 },
    { name: 'Austin', lat: 30.2672, lng: -97.7431, population: 978908 }
  ]

  // Choropleth Map (simplified version)
  useEffect(() => {
    if (!choroplethRef.current) return

    const svg = d3.select(choroplethRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400

    // Create a simple grid representation for demonstration
    const states = Object.keys(stateData[selectedMetric])
    const gridSize = Math.ceil(Math.sqrt(states.length))
    const cellSize = Math.min(width, height) / gridSize - 5

    const values = Object.values(stateData[selectedMetric])
    const colorScale = d3.scaleSequential()
      .interpolator(selectedMetric === 'temperature' ? d3.interpolateRdYlBu : d3.interpolateBlues)
      .domain(d3.extent(values)!)

    const g = svg.append('g')
      .attr('transform', 'translate(50, 20)')

    // Create grid cells
    const cells = g.selectAll('.state-cell')
      .data(states)
      .enter().append('g')
      .attr('class', 'state-cell')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        return `translate(${col * (cellSize + 5)}, ${row * (cellSize + 5)})`
      })

    cells.append('rect')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(stateData[selectedMetric][d]))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 0.8)

    cells.append('text')
      .attr('x', cellSize / 2)
      .attr('y', cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text(d => d.substring(0, 2).toUpperCase())

    // Add hover effects
    cells.on('mouseover', function(event, d) {
      d3.select(this).select('rect')
        .attr('stroke', '#4ade80')
        .attr('stroke-width', 3)

      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

      const value = stateData[selectedMetric][d]
      const unit = selectedMetric === 'temperature' ? '°C' : 
                   selectedMetric === 'gdp' ? 'B' : ''

      tooltip.transition()
        .duration(200)
        .style('opacity', .9)
      tooltip.html(`<strong>${d}</strong><br/>${selectedMetric}: ${value.toLocaleString()}${unit}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
    })
    .on('mouseout', function() {
      d3.select(this).select('rect')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      d3.selectAll('.tooltip').remove()
    })

    // Add legend
    const legendWidth = 20
    const legendHeight = 200
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 80}, 50)`)

    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([legendHeight, 0])

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d => {
        const unit = selectedMetric === 'temperature' ? '°C' : 
                     selectedMetric === 'gdp' ? 'B' : ''
        return `${d}${unit}`
      })

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
      const t = i / steps
      const value = colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0])
      gradient.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', colorScale(value))
    }

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')

    legend.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)

  }, [selectedMetric])

  // Point Map
  useEffect(() => {
    if (!pointMapRef.current) return

    const svg = d3.select(pointMapRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400

    // Simple projection for US coordinates (very simplified)
    const projection = d3.scaleLinear()
      .domain([-125, -66]) // longitude range
      .range([50, width - 50])

    const projectionY = d3.scaleLinear()
      .domain([49, 25]) // latitude range
      .range([50, height - 50])

    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(cities, d => d.population)!)
      .range([5, 30])

    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(26, 93, 58, 0.05)')

    // Add cities
    const cityPoints = svg.selectAll('.city')
      .data(cities)
      .enter().append('g')
      .attr('class', 'city')
      .attr('transform', d => `translate(${projection(d.lng)}, ${projectionY(d.lat)})`)

    cityPoints.append('circle')
      .attr('r', 0)
      .attr('fill', '#4ade80')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .delay((d, i) => i * 100)
      .duration(800)
      .attr('r', d => sizeScale(d.population))

    // Add city labels
    cityPoints.append('text')
      .attr('x', 0)
      .attr('y', d => -sizeScale(d.population) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', 'var(--text-primary)')
      .style('pointer-events', 'none')
      .text(d => d.name)
      .attr('opacity', 0)
      .transition()
      .delay((d, i) => i * 100 + 400)
      .duration(600)
      .attr('opacity', 1)

    // Add hover effects
    cityPoints.on('mouseover', function(event, d) {
      d3.select(this).select('circle')
        .attr('stroke', '#22d3ee')
        .attr('stroke-width', 3)

      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

      tooltip.transition()
        .duration(200)
        .style('opacity', .9)
      tooltip.html(`
        <strong>${d.name}</strong><br/>
        Population: ${d.population.toLocaleString()}<br/>
        Coordinates: ${d.lat.toFixed(2)}, ${d.lng.toFixed(2)}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
    })
    .on('mouseout', function() {
      d3.select(this).select('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      d3.selectAll('.tooltip').remove()
    })

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', 'var(--text-primary)')
      .text('US Cities by Population')

  }, [])

  return (
    <div className="geographic-maps-page">
      <header className="page-header">
        <h1>Geographic Maps</h1>
        <p className="page-description">
          Create interactive geographic visualizations with choropleth maps, point maps, 
          and custom projections. Learn to work with GeoJSON data and geographic projections.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Choropleth Map</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button 
              className={`demo-button ${selectedMetric === 'population' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('population')}
            >
              Population
            </button>
            <button 
              className={`demo-button ${selectedMetric === 'gdp' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('gdp')}
            >
              GDP (Billions)
            </button>
            <button 
              className={`demo-button ${selectedMetric === 'temperature' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('temperature')}
            >
              Avg Temperature
            </button>
          </div>
          
          <div className="visualization-container">
            <svg ref={choroplethRef} width="600" height="400"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Choropleth Map with Color Scale</span>
          </div>
          <div className="code-content">
            <pre>{`// Load GeoJSON data
d3.json('us-states.json').then(data => {
  // Create projection
  const projection = d3.geoAlbersUsa()
    .fitSize([width, height], data)
  
  const path = d3.geoPath().projection(projection)
  
  // Create color scale
  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain(d3.extent(stateData, d => d.value))
  
  // Draw states
  svg.selectAll('path')
    .data(data.features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', d => colorScale(getValue(d)))
    .attr('stroke', '#fff')
    .on('mouseover', showTooltip)
})`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Point Map</h2>
        
        <div className="demo-container">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Cities visualized as circles where size represents population. Hover for details.
          </p>
          
          <div className="visualization-container">
            <svg ref={pointMapRef} width="600" height="400"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Point Map with Size Encoding</span>
          </div>
          <div className="code-content">
            <pre>{`// Create projection for coordinates
const projection = d3.geoAlbersUsa()
  .fitSize([width, height], geoData)

// Size scale for population
const sizeScale = d3.scaleSqrt()
  .domain(d3.extent(cities, d => d.population))
  .range([3, 20])

// Plot cities
svg.selectAll('.city')
  .data(cities)
  .enter().append('circle')
  .attr('class', 'city')
  .attr('cx', d => projection([d.lng, d.lat])[0])
  .attr('cy', d => projection([d.lng, d.lat])[1])
  .attr('r', d => sizeScale(d.population))
  .attr('fill', '#4ade80')
  .attr('opacity', 0.7)`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Geographic Projections</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Mercator Projection</h3>
            <p>
              Best for navigation and web maps. Preserves angles but distorts areas, 
              especially near the poles. Used by most web mapping services.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`d3.geoMercator()
  .scale(150)
  .translate([width/2, height/2])`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Albers USA</h3>
            <p>
              Composite projection designed specifically for the United States. 
              Combines three projections for better area representation.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`d3.geoAlbersUsa()
  .fitSize([width, height], geoData)`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Natural Earth</h3>
            <p>
              Compromise projection that balances area and shape distortions. 
              Good for world maps and thematic visualizations.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`d3.geoNaturalEarth1()
  .fitSize([width, height], worldData)`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Orthographic</h3>
            <p>
              Globe-like projection showing Earth as it appears from space. 
              Great for interactive globe visualizations with rotation.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`d3.geoOrthographic()
  .scale(200)
  .rotate([longitude, -latitude])`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Advanced Techniques</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Multi-layer Maps</h3>
            <p>
              Combine base maps with data layers, administrative boundaries, 
              and interactive elements for rich geographic visualizations.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Zoom & Pan</h3>
            <p>
              Implement smooth zooming and panning with d3.zoom(). Handle different 
              detail levels and coordinate transformations properly.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Flow Maps</h3>
            <p>
              Visualize movement between locations using curved paths, animated flows, 
              and origin-destination matrices.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Heat Maps</h3>
            <p>
              Create geographic heat maps using point density, kernel density estimation, 
              or hexagonal binning for spatial analysis.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Data Sources & Tools</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                GeoJSON Format
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Standard format for geographic data. Contains geometry (coordinates) 
                and properties (data attributes) for easy visualization with D3.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Natural Earth Data
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Free geographic datasets at multiple scales. Perfect for world maps, 
                country boundaries, and physical features.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                TopoJSON
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Compressed format that's 80% smaller than GeoJSON. Great for web 
                applications with shared boundaries between features.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GeographicMapsPage