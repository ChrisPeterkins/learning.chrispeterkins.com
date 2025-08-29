import React from 'react'

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Data Visualization Workshop</h1>
        <p className="page-description">
          Master the art of data storytelling with D3.js and modern visualization techniques. 
          Learn to transform raw data into compelling, interactive visualizations that reveal insights and drive decisions.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>What You'll Learn</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Chart Fundamentals</h3>
            <p>
              Master the basics with bar charts, line charts, and area charts. Learn when to use 
              each type and how to make them accessible and engaging.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Advanced Visualizations</h3>
            <p>
              Create scatter plots, heatmaps, and network graphs. Explore multi-dimensional 
              data with sophisticated visualization techniques.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Interactive Elements</h3>
            <p>
              Add tooltips, zooming, brushing, and filtering to make your visualizations 
              come alive. Build engaging user experiences with data.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Real-time Data</h3>
            <p>
              Visualize streaming data and create dynamic updates. Learn to handle live data 
              feeds and create responsive, real-time dashboards.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Geographic Mapping</h3>
            <p>
              Create choropleth maps, point maps, and geographic visualizations. Learn to 
              work with GeoJSON and project geographic data effectively.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Custom Visualizations</h3>
            <p>
              Design unique, custom visualizations that tell your specific story. Learn 
              advanced D3.js patterns and animation techniques.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>D3.js Fundamentals</h2>
        
        <div className="demo-container">
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-green-bright)' }}>
            Data-Driven Documents
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            D3.js allows you to bind data to DOM elements and transform the document based on data. 
            Here's a simple example of how D3 works:
          </p>
          
          <div className="code-container">
            <div className="code-header">
              <span className="code-title">Basic D3 Data Binding</span>
            </div>
            <div className="code-content">
              <pre>{`// Select elements and bind data
d3.select("#chart")
  .selectAll("div")
  .data([4, 8, 15, 16, 23, 42])
  .enter()
  .append("div")
  .style("width", d => d * 10 + "px")
  .style("height", "20px")
  .style("background", "#4ade80")
  .style("margin", "2px")
  .text(d => d);

// This creates a simple bar chart with divs
// Each bar's width is proportional to the data value`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Key Concepts</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Scales & Axes</h3>
            <p>
              Transform data values into visual dimensions. Learn linear, ordinal, time, and color scales 
              to map your data to pixels, positions, and colors.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Selections & Data Binding</h3>
            <p>
              Master D3's selection API to bind data to DOM elements. Understand enter, update, 
              and exit patterns for dynamic data visualization.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>SVG & Canvas</h3>
            <p>
              Learn when to use SVG for interactive, scalable graphics versus Canvas for 
              high-performance rendering of large datasets.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Transitions & Animation</h3>
            <p>
              Create smooth, meaningful animations that guide the viewer's attention 
              and reveal changes in data over time.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Learning Path</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderLeft: '3px solid var(--accent-green-bright)',
          borderRadius: '8px'
        }}>
          <ol style={{ 
            listStyle: 'none', 
            counterReset: 'step-counter',
            padding: 0 
          }}>
            {[
              'Start with Bar & Line Charts to learn D3 basics and scales',
              'Explore Scatter Plots & Heatmaps for multi-dimensional data',
              'Create Network Graphs to understand force simulations',
              'Build Real-time Data visualizations with dynamic updates',
              'Design Geographic Maps with projections and GeoJSON',
              'Develop Custom Visualizations with advanced D3 patterns',
              'Integrate everything into interactive dashboards'
            ].map((step, index) => (
              <li key={index} style={{ 
                counterIncrement: 'step-counter',
                position: 'relative',
                paddingLeft: '3rem',
                marginBottom: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '2rem',
                  height: '2rem',
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderRadius: '50%'
                }}>
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Why Data Visualization?</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Pattern Recognition
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Humans are naturally good at recognizing visual patterns. A well-designed chart 
                can reveal insights that might be hidden in rows of numbers.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Communication
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Visualizations communicate complex information quickly and effectively. 
                They bridge the gap between data and decision-making.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Exploration
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Interactive visualizations let users explore data themselves, discovering 
                insights and asking new questions along the way.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage