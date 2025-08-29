import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface Node extends d3.SimulationNodeDatum {
  id: string
  group: number
  size: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  value: number
}

const NetworkGraphsPage: React.FC = () => {
  const networkRef = useRef<SVGSVGElement>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<'social' | 'tech' | 'random'>('social')

  const networks = {
    social: {
      nodes: [
        { id: 'Alice', group: 1, size: 20 },
        { id: 'Bob', group: 1, size: 15 },
        { id: 'Charlie', group: 1, size: 18 },
        { id: 'David', group: 2, size: 22 },
        { id: 'Eve', group: 2, size: 16 },
        { id: 'Frank', group: 2, size: 14 },
        { id: 'Grace', group: 3, size: 25 },
        { id: 'Henry', group: 3, size: 12 },
        { id: 'Ivy', group: 3, size: 19 }
      ],
      links: [
        { source: 'Alice', target: 'Bob', value: 5 },
        { source: 'Alice', target: 'Charlie', value: 3 },
        { source: 'Bob', target: 'Charlie', value: 4 },
        { source: 'Charlie', target: 'David', value: 2 },
        { source: 'David', target: 'Eve', value: 6 },
        { source: 'David', target: 'Frank', value: 3 },
        { source: 'Eve', target: 'Frank', value: 4 },
        { source: 'Frank', target: 'Grace', value: 2 },
        { source: 'Grace', target: 'Henry', value: 5 },
        { source: 'Grace', target: 'Ivy', value: 3 },
        { source: 'Henry', target: 'Ivy', value: 4 }
      ]
    },
    tech: {
      nodes: [
        { id: 'JavaScript', group: 1, size: 30 },
        { id: 'React', group: 1, size: 25 },
        { id: 'Vue', group: 1, size: 20 },
        { id: 'Angular', group: 1, size: 22 },
        { id: 'Node.js', group: 2, size: 28 },
        { id: 'Express', group: 2, size: 18 },
        { id: 'MongoDB', group: 3, size: 20 },
        { id: 'PostgreSQL', group: 3, size: 19 },
        { id: 'Redis', group: 3, size: 15 }
      ],
      links: [
        { source: 'JavaScript', target: 'React', value: 8 },
        { source: 'JavaScript', target: 'Vue', value: 6 },
        { source: 'JavaScript', target: 'Angular', value: 7 },
        { source: 'JavaScript', target: 'Node.js', value: 9 },
        { source: 'Node.js', target: 'Express', value: 7 },
        { source: 'Express', target: 'MongoDB', value: 5 },
        { source: 'Express', target: 'PostgreSQL', value: 6 },
        { source: 'Node.js', target: 'Redis', value: 4 },
        { source: 'React', target: 'Node.js', value: 5 }
      ]
    },
    random: {
      nodes: Array.from({ length: 15 }, (_, i) => ({
        id: `Node${i}`,
        group: Math.floor(i / 5) + 1,
        size: Math.random() * 20 + 10
      })),
      links: Array.from({ length: 20 }, () => {
        const sourceIndex = Math.floor(Math.random() * 15)
        let targetIndex = Math.floor(Math.random() * 15)
        while (targetIndex === sourceIndex) {
          targetIndex = Math.floor(Math.random() * 15)
        }
        return {
          source: `Node${sourceIndex}`,
          target: `Node${targetIndex}`,
          value: Math.random() * 5 + 1
        }
      })
    }
  }

  useEffect(() => {
    if (!networkRef.current) return

    const svg = d3.select(networkRef.current)
    svg.selectAll('*').remove()

    const { nodes, links } = networks[selectedNetwork]
    const width = 600
    const height = 500

    // Color scale for groups
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // Create simulation
    const simulation = d3.forceSimulation(nodes as Node[])
      .force('link', d3.forceLink<Node, Link>(links as Link[])
        .id(d => d.id)
        .distance(d => 100 - d.value * 5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as Node).size + 5))

    // Create links
    const linkElements = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: Link) => Math.sqrt(d.value))

    // Create nodes
    const nodeElements = svg.selectAll('.node')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', (d: Node) => d.size)
      .attr('fill', (d: Node) => colorScale(d.group.toString()))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    // Add labels
    const labelElements = svg.selectAll('.label')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'label')
      .text((d: Node) => d.id)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', 'var(--text-primary)')
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'central')
      .style('pointer-events', 'none')

    // Drag functionality
    const drag = d3.drag<SVGCircleElement, Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeElements.call(drag)

    // Hover effects
    nodeElements
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 4)
          .attr('stroke', '#4ade80')

        // Highlight connected links
        linkElements
          .attr('stroke-opacity', (l: Link) => {
            return (l.source === d || l.target === d) ? 1 : 0.2
          })
          .attr('stroke', (l: Link) => {
            return (l.source === d || l.target === d) ? '#4ade80' : '#999'
          })

        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        const connectedNodes = links
          .filter(l => l.source === d.id || l.target === d.id)
          .map(l => l.source === d.id ? l.target : l.source)

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        tooltip.html(`
          <strong>${d.id}</strong><br/>
          Group: ${d.group}<br/>
          Size: ${d.size}<br/>
          Connections: ${connectedNodes.length}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('stroke', '#fff')

        linkElements
          .attr('stroke-opacity', 0.6)
          .attr('stroke', '#999')

        d3.selectAll('.tooltip').remove()
      })

    // Update positions on tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: Link) => (d.source as Node).x!)
        .attr('y1', (d: Link) => (d.source as Node).y!)
        .attr('x2', (d: Link) => (d.target as Node).x!)
        .attr('y2', (d: Link) => (d.target as Node).y!)

      nodeElements
        .attr('cx', (d: Node) => d.x!)
        .attr('cy', (d: Node) => d.y!)

      labelElements
        .attr('x', (d: Node) => d.x!)
        .attr('y', (d: Node) => d.y!)
    })

    // Add legend
    const groups = [...new Set(nodes.map(d => d.group))]
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)')

    const legendItems = legend.selectAll('.legend-item')
      .data(groups)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`)

    legendItems.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)
      .attr('fill', d => colorScale(d.toString()))

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)')
      .text(d => `Group ${d}`)

    return () => {
      simulation.stop()
    }

  }, [selectedNetwork])

  return (
    <div className="network-graphs-page">
      <header className="page-header">
        <h1>Network Graphs</h1>
        <p className="page-description">
          Visualize relationships and connections with force-directed network graphs. 
          Learn to create interactive, draggable visualizations that reveal network structures.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Force-Directed Network</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <button 
              className={`demo-button ${selectedNetwork === 'social' ? 'active' : ''}`}
              onClick={() => setSelectedNetwork('social')}
            >
              Social Network
            </button>
            <button 
              className={`demo-button ${selectedNetwork === 'tech' ? 'active' : ''}`}
              onClick={() => setSelectedNetwork('tech')}
            >
              Tech Stack
            </button>
            <button 
              className={`demo-button ${selectedNetwork === 'random' ? 'active' : ''}`}
              onClick={() => setSelectedNetwork('random')}
            >
              Random Network
            </button>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Drag nodes to explore the network. Hover over nodes to see connections highlighted.
          </p>
          
          <div className="visualization-container">
            <svg ref={networkRef} width="600" height="500"></svg>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">
            <span className="code-title">D3.js Force Simulation</span>
          </div>
          <div className="code-content">
            <pre>{`// Create force simulation
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links)
    .id(d => d.id)
    .distance(d => 100 - d.value * 5)
  )
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(d => d.size + 5))

// Create draggable nodes
const drag = d3.drag()
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  })
  .on('drag', (event, d) => {
    d.fx = event.x
    d.fy = event.y
  })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  })

// Update positions on each tick
simulation.on('tick', () => {
  linkElements
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)

  nodeElements
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
})`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Force Types</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Link Force</h3>
            <p>
              Attracts connected nodes together. Distance can be based on link properties 
              like weight or strength to create more realistic layouts.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`.force('link', d3.forceLink()
  .distance(d => d.value * 20))`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Many-Body Force</h3>
            <p>
              Creates repulsion between all nodes. Negative strength pushes nodes apart, 
              positive strength attracts them together.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`.force('charge', 
  d3.forceManyBody().strength(-300))`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Center Force</h3>
            <p>
              Pulls nodes toward a center point to prevent the graph from drifting. 
              Essential for keeping the visualization stable.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`.force('center', 
  d3.forceCenter(width/2, height/2))`}</pre>
              </div>
            </div>
          </div>
          
          <div className="concept-card">
            <h3>Collision Force</h3>
            <p>
              Prevents nodes from overlapping by creating a collision radius around each node. 
              Great for avoiding visual clutter.
            </p>
            <div className="code-container" style={{ marginTop: '1rem' }}>
              <div className="code-content">
                <pre style={{ fontSize: '0.8rem' }}>{`.force('collision', 
  d3.forceCollide().radius(20))`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Network Analysis Concepts</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Node Centrality</h3>
            <p>
              Measure the importance of nodes using degree centrality (number of connections), 
              betweenness centrality (bridging nodes), or eigenvector centrality.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Community Detection</h3>
            <p>
              Identify clusters or communities within the network using algorithms like 
              modularity optimization or hierarchical clustering.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Path Analysis</h3>
            <p>
              Find shortest paths between nodes, identify bottlenecks, and analyze 
              network diameter and connectivity patterns.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Dynamic Networks</h3>
            <p>
              Visualize networks that change over time by animating node and link 
              additions/removals, or by showing network evolution.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Design Best Practices</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Use Node Size Meaningfully
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Map node size to importance metrics like degree centrality, betweenness, 
                or domain-specific values to convey additional information.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Color for Grouping
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Use color to show clusters, communities, or categories. Keep the color 
                palette simple and ensure good contrast for accessibility.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Interactive Exploration
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Enable dragging, zooming, and filtering to help users explore large networks. 
                Highlight connections on hover to reduce visual complexity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NetworkGraphsPage