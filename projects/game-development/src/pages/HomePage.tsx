import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Game Development Fundamentals</h1>
        <p className="page-description">
          Learn the core concepts of game development through interactive demos and practical examples.
          Master the fundamental systems that power modern games, from basic game loops to complex physics simulations.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Game Loop & Timing</h3>
          <p>
            Understand the heart of every game - the main loop that handles updates, rendering, and timing.
            Learn about frame rates, delta time, and how to create smooth, consistent gameplay experiences.
          </p>
        </div>

        <div className="info-card">
          <h3>Collision Detection</h3>
          <p>
            Master various collision detection algorithms including AABB, circle-circle, and SAT.
            Essential for creating interactive games where objects need to respond to each other.
          </p>
        </div>

        <div className="info-card">
          <h3>Physics & Movement</h3>
          <p>
            Implement realistic physics including gravity, velocity, acceleration, and forces.
            Create natural-feeling movement and interactions in your game worlds.
          </p>
        </div>

        <div className="info-card">
          <h3>Sprite Animation</h3>
          <p>
            Bring characters and objects to life with sprite sheet animations.
            Learn frame-based animation, timing, and state management for dynamic visuals.
          </p>
        </div>

        <div className="info-card">
          <h3>Particle Systems</h3>
          <p>
            Create stunning visual effects like explosions, fire, smoke, and magic spells.
            Master the art of simulating thousands of small particles for dramatic impact.
          </p>
        </div>

        <div className="info-card">
          <h3>Entity Component System</h3>
          <p>
            Learn the ECS architectural pattern used in modern game engines.
            Create flexible, performant game systems that can handle complex interactions.
          </p>
        </div>

        <div className="info-card">
          <h3>Input Handling</h3>
          <p>
            Master keyboard, mouse, and touch input handling for responsive gameplay.
            Create intuitive controls that feel natural and responsive to players.
          </p>
        </div>
      </div>

      <div className="resources">
        <h2>Core Technologies</h2>
        <div className="tech-list">
          <div className="tech-item">
            <h4>HTML5 Canvas</h4>
            <p>2D rendering context for drawing graphics, sprites, and UI elements</p>
          </div>
          <div className="tech-item">
            <h4>RequestAnimationFrame</h4>
            <p>Browser API for smooth, performance-optimized animation loops</p>
          </div>
          <div className="tech-item">
            <h4>Vector Mathematics</h4>
            <p>2D vector operations for position, velocity, and force calculations</p>
          </div>
          <div className="tech-item">
            <h4>TypeScript</h4>
            <p>Type-safe JavaScript for robust, maintainable game code</p>
          </div>
        </div>
      </div>

      <div className="getting-started">
        <h2>Getting Started</h2>
        <p>
          Each section includes interactive demos that you can experiment with. 
          Start with the Game Loop to understand timing fundamentals, then progress through 
          collision detection and physics to build up your understanding of game mechanics.
        </p>
        <p>
          All examples use vanilla TypeScript and HTML5 Canvas, giving you a solid foundation 
          that can be applied to any game framework or engine.
        </p>
      </div>
    </div>
  );
};

export default HomePage;