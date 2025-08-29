import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>WebGL Shaders</h1>
        <p className="page-description">
          Dive into the world of GPU programming with GLSL shaders. Learn to create stunning 
          visual effects, procedural patterns, and real-time graphics using the power of WebGL.
        </p>
      </header>

      <section className="intro-section">
        <h2>What are Shaders?</h2>
        <p>
          Shaders are small programs that run on the GPU (Graphics Processing Unit). They're written 
          in GLSL (OpenGL Shading Language) and are responsible for determining the final color of 
          every pixel on the screen. With shaders, you can create effects that would be impossible 
          or extremely slow to achieve with traditional Canvas or CSS.
        </p>
      </section>

      <section className="learning-paths">
        <h2>Learning Path</h2>
        <div className="concept-grid">
          <Link to="/basics" className="concept-card">
            <h3>GLSL Basics</h3>
            <p>
              Start with the fundamentals of GLSL syntax, data types, built-in functions, 
              and the graphics pipeline.
            </p>
          </Link>

          <Link to="/fragment-shaders" className="concept-card">
            <h3>Fragment Shaders</h3>
            <p>
              Learn to manipulate individual pixels, create gradients, patterns, and 
              procedural textures.
            </p>
          </Link>

          <Link to="/vertex-shaders" className="concept-card">
            <h3>Vertex Shaders</h3>
            <p>
              Transform geometry in 3D space, create waves, morphing effects, and 
              particle animations.
            </p>
          </Link>

          <Link to="/patterns" className="concept-card">
            <h3>Shader Patterns</h3>
            <p>
              Master noise functions, fractals, raymarching, and advanced mathematical 
              patterns.
            </p>
          </Link>

          <Link to="/post-processing" className="concept-card">
            <h3>Post-Processing</h3>
            <p>
              Apply screen-space effects like blur, bloom, chromatic aberration, and 
              color grading.
            </p>
          </Link>

          <Link to="/playground" className="concept-card">
            <h3>🎨 Shader Playground</h3>
            <p>
              Experiment with live shader editing, presets, and share your creations 
              with the community.
            </p>
          </Link>
        </div>
      </section>

      <section className="resources-section">
        <h2>Key Concepts</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Parallel Processing</h3>
            <p>Shaders run in parallel on thousands of GPU cores simultaneously</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Performance</h3>
            <p>Create complex visual effects that run at 60+ FPS</p>
          </div>
          <div className="feature-card">
            <h3>Mathematical Beauty</h3>
            <p>Use math functions to create organic, procedural patterns</p>
          </div>
          <div className="feature-card">
            <h3>Cross-Platform</h3>
            <p>WebGL shaders work in all modern browsers on any device</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          max-width: 1200px;
        }

        .intro-section {
          background: var(--bg-secondary);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-primary);
          padding: 2rem;
          margin-bottom: 3rem;
          border-radius: 8px;
        }

        .intro-section h2 {
          color: var(--accent-green-bright);
          margin-bottom: 1rem;
        }

        .intro-section p {
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .learning-paths h2,
        .resources-section h2 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .feature-card h3 {
          color: var(--accent-green-bright);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  )
}

export default HomePage