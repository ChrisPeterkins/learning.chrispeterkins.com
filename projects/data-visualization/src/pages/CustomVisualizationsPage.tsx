import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const CustomVisualizationsPage: React.FC = () => {
  const sunburstRef = useRef<SVGSVGElement>(null)
  const parallelRef = useRef<SVGSVGElement>(null)
  const [selectedDataset, setSelectedDataset] = useState<'company' | 'skills' | 'budget'>('company')

  // Hierarchical data for sunburst
  const hierarchicalData = {
    company: {
      name: 'Company',
      children: [
        {
          name: 'Engineering',
          children: [
            { name: 'Frontend', value: 25 },
            { name: 'Backend', value: 30 },
            { name: 'DevOps', value: 15 }
          ]
        },
        {
          name: 'Product',
          children: [
            { name: 'Design', value: 20 },
            { name: 'Research', value: 10 },
            { name: 'Strategy', value: 8 }
          ]
        },
        {
          name: 'Marketing',
          children: [
            { name: 'Digital', value: 12 },
            { name: 'Content', value: 8 },
            { name: 'Events', value: 5 }
          ]
        }
      ]
    },
    skills: {
      name: 'Skills',
      children: [
        {
          name: 'Technical',
          children: [
            { name: 'JavaScript', value: 35 },
            { name: 'Python', value: 28 },
            { name: 'React', value: 22 }
          ]
        },
        {
          name: 'Design',
          children: [
            { name: 'UI/UX', value: 20 },
            { name: 'Visual', value: 15 },
            { name: 'Motion', value: 10 }
          ]
        },
        {
          name: 'Business',
          children: [
            { name: 'Strategy', value: 18 },
            { name: 'Analytics', value: 12 },
            { name: 'Operations', value: 8 }
          ]
        }
      ]
    },
    budget: {
      name: 'Budget',
      children: [
        {
          name: 'Personnel',
          children: [
            { name: 'Salaries', value: 45 },
            { name: 'Benefits', value: 15 },
            { name: 'Training', value: 5 }
          ]
        },
        {
          name: 'Technology',
          children: [
            { name: 'Software', value: 12 },
            { name: 'Hardware', value: 8 },
            { name: 'Cloud', value: 10 }
          ]
        },
        {
          name: 'Operations',
          children: [
            { name: 'Office', value: 3 },
            { name: 'Marketing', value: 1 },
            { name: 'Legal', value: 1 }
          ]
        }
      ]
    }
  }

  // Parallel coordinates data
  const parallelData = [
    { name: 'Project A', performance: 85, cost: 120, time: 95, quality: 88 },
    { name: 'Project B', performance: 92, cost: 80, time: 78, quality: 90 },
    { name: 'Project C', performance: 78, cost: 150, time: 105, quality: 75 },
    { name: 'Project D', performance: 88, cost: 95, time: 85, quality: 92 },
    { name: 'Project E', performance: 95, cost: 110, time: 90, quality: 85 },
    { name: 'Project F', performance: 82, cost: 130, time: 100, quality: 80 },
    { name: 'Project G', performance: 90, cost: 85, time: 88, quality: 95 },
    { name: 'Project H', performance: 76, cost: 140, time: 110, quality: 78 }
  ]

  // Sunburst Chart
  useEffect(() => {
    if (!sunburstRef.current) return

    const svg = d3.select(sunburstRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    const data = hierarchicalData[selectedDataset]
    const root = d3.hierarchy(data)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value! - a.value!)

    const partition = d3.partition()
      .size([2 * Math.PI, radius])

    partition(root)

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const arc = d3.arc<any>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)

    const paths = g.selectAll('path')
      .data(root.descendants().filter(d => d.depth > 0))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.depth.toString()))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    // Add text labels
    const labels = g.selectAll('text')
      .data(root.descendants().filter(d => d.depth > 0 && d.x1 - d.x0 > 0.1))
      .enter().append('text')
      .attr('transform', d => {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI
        const y = (d.y0 + d.y1) / 2
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', d => {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI
        return x < 180 ? 'start' : 'end'
      })
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text(d => d.data.name)

    // Animation
    paths
      .attr('opacity', 0)
      .transition()
      .delay((d, i) => i * 50)
      .duration(800)
      .attr('opacity', 0.8)

    // Hover effects
    paths
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 3)

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        const value = d.value || 0
        const percentage = ((value / root.value!) * 100).toFixed(1)

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        tooltip.html(`
          <strong>${d.data.name}</strong><br/>
          Value: ${value}<br/>
          Percentage: ${percentage}%<br/>
          Depth: ${d.depth}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke-width', 2)

        d3.selectAll('.tooltip').remove()
      })

  }, [selectedDataset])

  // Parallel Coordinates
  useEffect(() => {
    if (!parallelRef.current) return

    const svg = d3.select(parallelRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 40, bottom: 30, left: 40 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const dimensions = ['performance', 'cost', 'time', 'quality']
    
    const y = {}
    const x = d3.scalePoint()
      .range([0, width])
      .domain(dimensions)

    // Create scales for each dimension
    dimensions.forEach(dim => {
      y[dim] = d3.scaleLinear()
        .domain(d3.extent(parallelData, d => d[dim])!)
        .range([height, 0])
    })

    const line = d3.line()
      .defined(([, value]) => value != null)
      .x(([key]) => x(key)!)
      .y(([key, value]) => y[key](value))

    // Add background lines
    const background = g.append('g')
      .attr('class', 'background')

    background.selectAll('path')
      .data(parallelData)
      .enter().append('path')
      .attr('d', d => line(dimensions.map(key => [key, d[key]])))
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('opacity', 0.3)

    // Add foreground lines
    const foreground = g.append('g')
      .attr('class', 'foreground')

    const paths = foreground.selectAll('path')
      .data(parallelData)
      .enter().append('path')
      .attr('d', d => line(dimensions.map(key => [key, d[key]])))
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')

    // Add axes
    const axes = g.selectAll('.axis')
      .data(dimensions)
      .enter().append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${x(d)},0)`)

    axes.each(function(d) {
      d3.select(this).call(d3.axisLeft(y[d]))
    })

    // Add axis labels
    axes.append('text')
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'var(--text-primary)')
      .text(d => d.charAt(0).toUpperCase() + d.slice(1))

    // Animation
    const totalLength = paths.nodes().map(n => n.getTotalLength())
    paths
      .attr('stroke-dasharray', (d, i) => totalLength[i] + ' ' + totalLength[i])
      .attr('stroke-dashoffset', (d, i) => totalLength[i])
      .transition()
      .delay((d, i) => i * 100)
      .duration(1500)
      .attr('stroke-dashoffset', 0)

    // Hover effects
    paths
      .on('mouseover', function(event, d) {
        // Fade other lines
        foreground.selectAll('path')
          .attr('opacity', 0.1)

        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 4)

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        tooltip.html(`
          <strong>${d.name}</strong><br/>
          Performance: ${d.performance}<br/>
          Cost: ${d.cost}<br/>
          Time: ${d.time}<br/>
          Quality: ${d.quality}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        foreground.selectAll('path')
          .attr('opacity', 0.7)
          .attr('stroke-width', 2)

        d3.selectAll('.tooltip').remove()
      })

  }, [])

  return (
    <div className="custom-visualizations-page">
      <header className="page-header">
        <h1>Custom Visualizations</h1>
        <p className="page-description">
          Design unique, custom visualizations that tell your specific story. Learn advanced 
          D3.js patterns, custom layouts, and creative data representation techniques.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Sunburst Chart</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button 
              className={`demo-button ${selectedDataset === 'company' ? 'active' : ''}`}
              onClick={() => setSelectedDataset('company')}
            >
              Company Structure
            </button>
            <button 
              className={`demo-button ${selectedDataset === 'skills' ? 'active' : ''}`}
              onClick={() => setSelectedDataset('skills')}
            >
              Skill Distribution
            </button>
            <button 
              className={`demo-button ${selectedDataset === 'budget' ? 'active' : ''}`}
              onClick={() => setSelectedDataset('budget')}
            >
              Budget Allocation
            </button>
          </div>
          
          <div className="visualization-container">
            <svg ref={sunburstRef} width="400" height="400"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Hierarchical Sunburst Visualization</span>
          </div>
          <div className="code-content">
            <pre>{`// Create hierarchy from nested data
const root = d3.hierarchy(data)
  .sum(d => d.value || 0)
  .sort((a, b) => b.value - a.value)

// Partition layout for sunburst
const partition = d3.partition()
  .size([2 * Math.PI, radius])

partition(root)

// Arc generator
const arc = d3.arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => d.y0)
  .outerRadius(d => d.y1)

// Draw segments
svg.selectAll('path')
  .data(root.descendants().filter(d => d.depth > 0))
  .enter().append('path')
  .attr('d', arc)
  .attr('fill', d => colorScale(d.depth))
  .attr('stroke', '#fff')`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Parallel Coordinates</h2>
        
        <div className="demo-container">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Compare multiple variables across different projects. Each line represents one project, 
            and each vertical axis represents a different metric.
          </p>
          
          <div className="visualization-container">
            <svg ref={parallelRef} width="600" height="400"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Parallel Coordinates Implementation</span>
          </div>
          <div className="code-content">
            <pre>{`// Create scales for each dimension
const dimensions = ['performance', 'cost', 'time', 'quality']
const y = {}

dimensions.forEach(dim => {
  y[dim] = d3.scaleLinear()
    .domain(d3.extent(data, d => d[dim]))
    .range([height, 0])
})

const x = d3.scalePoint()
  .range([0, width])
  .domain(dimensions)

// Line generator
const line = d3.line()
  .x(([key]) => x(key))
  .y(([key, value]) => y[key](value))

// Draw lines for each data point
svg.selectAll('path')
  .data(data)
  .enter().append('path')
  .attr('d', d => line(dimensions.map(key => [key, d[key]])))
  .attr('stroke', (d, i) => colorScale(i))
  .attr('fill', 'none')`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Advanced Techniques</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Custom Layouts</h3>
            <p>
              Create your own layout algorithms using force simulations, mathematical 
              functions, or domain-specific arrangements. Think beyond standard charts.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`// Custom spiral layout
const spiral = (d, i) => {
  const angle = i * 0.175
  const radius = Math.sqrt(i) * 10
  return [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius
  ]
}`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Shape Morphing</h3>
            <p>
              Animate between different shapes and representations of the same data. 
              Use path interpolation and custom tweening functions.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`// Morph between shapes
path.transition()
  .duration(1000)
  .attrTween('d', function(d) {
    return d3.interpolate(oldPath, newPath)
  })`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Multi-dimensional Encoding</h3>
            <p>
              Use position, size, color, opacity, shape, and texture to encode up to 
              6-7 dimensions of data in a single visualization.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`// Multiple encodings
circle
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y))
  .attr('r', d => sizeScale(d.size))
  .attr('fill', d => colorScale(d.category))
  .attr('opacity', d => opacityScale(d.confidence))`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Procedural Generation</h3>
            <p>
              Generate visualizations procedurally using algorithms, noise functions, 
              and mathematical patterns for unique, data-driven art.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`// Procedural pattern
const noise = (x, y) => 
  Math.sin(x * 0.1) * Math.cos(y * 0.1)

points.forEach((p, i) => {
  p.wobble = noise(p.x, p.y) * amplitude
})`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Creative Visualization Types</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Voronoi Diagrams</h3>
            <p>
              Create cellular patterns based on proximity to data points. Great for 
              showing territories, influence areas, or spatial relationships.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Sankey Diagrams</h3>
            <p>
              Visualize flow and connections between nodes with variable-width paths. 
              Perfect for showing energy, money, or data flows.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Chord Diagrams</h3>
            <p>
              Show relationships within a group using curved connections. Ideal for 
              migration patterns, trade relationships, or social networks.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Treemaps</h3>
            <p>
              Display hierarchical data using nested rectangles. Size represents 
              value, and nesting shows hierarchy - great for budget visualization.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Design Principles</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Start with the Story
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Custom visualizations should serve a specific narrative purpose. 
                Design the visualization to highlight the key insights in your data.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Progressive Disclosure
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Reveal complexity gradually. Start with an overview, then provide 
                details on demand through interaction and exploration.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Test & Iterate
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Custom visualizations need user testing. What seems obvious to you 
                might be confusing to others. Iterate based on feedback.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CustomVisualizationsPage