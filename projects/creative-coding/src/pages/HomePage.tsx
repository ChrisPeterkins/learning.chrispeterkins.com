import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const projects = [
    {
      path: '/generative-art',
      title: 'Generative Art',
      description: 'Create algorithmic art using randomness and mathematical rules',
      topics: ['Algorithmic patterns', 'Random systems', 'Emergence']
    },
    {
      path: '/pattern-making',
      title: 'Pattern Making',
      description: 'Design repeating patterns and tessellations with code',
      topics: ['Symmetry', 'Tiling', 'Islamic patterns']
    },
    {
      path: '/audio-visuals',
      title: 'Audio Visuals',
      description: 'Visualize sound and create reactive audio experiences',
      topics: ['FFT analysis', 'Waveforms', 'Beat detection']
    },
    {
      path: '/fractal-explorations',
      title: 'Fractal Explorations',
      description: 'Explore self-similar patterns and infinite complexity',
      topics: ['Mandelbrot set', 'Julia sets', 'L-systems']
    },
    {
      path: '/natural-simulations',
      title: 'Natural Simulations',
      description: 'Simulate natural phenomena and organic behaviors',
      topics: ['Flocking', 'Growth patterns', 'Physics']
    },
    {
      path: '/color-theory',
      title: 'Color Theory',
      description: 'Explore color relationships and generative palettes',
      topics: ['Color harmony', 'Gradients', 'Palettes']
    },
    {
      path: '/noise-algorithms',
      title: 'Noise Algorithms',
      description: 'Use Perlin noise and other algorithms for organic randomness',
      topics: ['Perlin noise', 'Simplex noise', 'Flow fields']
    },
    {
      path: '/geometric-designs',
      title: 'Geometric Designs',
      description: 'Create precise geometric compositions and constructions',
      topics: ['Sacred geometry', 'Polygons', 'Transformations']
    }
  ]

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>Creative Coding Lab</h1>
        <p className="subtitle">Explore the intersection of art, mathematics, and code</p>
        <p className="description">
          Creative coding is a type of computer programming in which the goal is to create 
          something expressive rather than something functional. Learn to use code as your 
          creative medium and explore generative art, data visualization, and interactive experiences.
        </p>
      </header>

      <section className="projects-grid">
        {projects.map((project) => (
          <Link to={project.path} key={project.path} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="topics">
              {project.topics.map((topic, index) => (
                <span key={index} className="topic-tag">{topic}</span>
              ))}
            </div>
            <span className="explore-link">Explore →</span>
          </Link>
        ))}
      </section>

      <section className="learning-resources">
        <h2>Learning Approach</h2>
        <div className="resource-grid">
          <div className="resource-card">
            <h4>Visual Feedback</h4>
            <p>See your code come to life immediately with visual output and interactive controls</p>
          </div>
          <div className="resource-card">
            <h4>Mathematical Foundation</h4>
            <p>Understand the math behind the visuals with clear explanations and examples</p>
          </div>
          <div className="resource-card">
            <h4>Creative Exploration</h4>
            <p>Experiment with parameters and discover unexpected emergent behaviors</p>
          </div>
          <div className="resource-card">
            <h4>p5.js Framework</h4>
            <p>Built with p5.js, a powerful JavaScript library for creative coding</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage