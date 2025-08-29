import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <h1>Canvas Animations & Creative Coding</h1>
      <p className="intro">
        Explore the creative possibilities of HTML5 Canvas through interactive animations, 
        particle systems, physics simulations, and generative art.
      </p>

      <div className="topic-grid">
        <div className="topic-card">
          <h3>Particle Systems</h3>
          <p>Create stunning visual effects with particles, including fireworks, starfields, and smoke effects.</p>
        </div>

        <div className="topic-card">
          <h3>Physics Simulation</h3>
          <p>Build realistic physics simulations with gravity, collisions, springs, and pendulums.</p>
        </div>

        <div className="topic-card">
          <h3>Creative Coding</h3>
          <p>Explore generative art, algorithmic patterns, and artistic expressions through code.</p>
        </div>

        <div className="topic-card">
          <h3>Fractals</h3>
          <p>Generate mesmerizing fractal patterns including Mandelbrot sets, Julia sets, and tree fractals.</p>
        </div>

        <div className="topic-card">
          <h3>Interactive Animations</h3>
          <p>Create mouse and touch responsive animations that react to user input in creative ways.</p>
        </div>

        <div className="topic-card">
          <h3>Flow Fields</h3>
          <p>Visualize vector fields and create organic, flowing animations using Perlin noise.</p>
        </div>
      </div>

      <div className="resources">
        <h2>Core Concepts</h2>
        <ul>
          <li>Canvas 2D Context API</li>
          <li>Animation loops with requestAnimationFrame</li>
          <li>Vector math and transformations</li>
          <li>Particle physics and forces</li>
          <li>Noise functions and randomness</li>
          <li>Performance optimization techniques</li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage