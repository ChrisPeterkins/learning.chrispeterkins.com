import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const projects = [
    {
      path: '/terrain-generation',
      title: 'Terrain Generation',
      description: 'Generate realistic landscapes using height maps and noise functions',
      topics: ['Height maps', 'Perlin noise', 'Erosion simulation']
    },
    {
      path: '/l-systems',
      title: 'L-Systems',
      description: 'Create organic structures like trees and plants with L-system grammars',
      topics: ['Fractal trees', 'Plant growth', 'Turtle graphics']
    },
    {
      path: '/noise-fields',
      title: 'Noise Fields',
      description: 'Explore various noise algorithms for natural-looking randomness',
      topics: ['Perlin noise', 'Simplex noise', 'Worley noise']
    },
    {
      path: '/dungeon-generation',
      title: 'Dungeon Generation',
      description: 'Build procedural dungeons with rooms, corridors, and meaningful layouts',
      topics: ['BSP trees', 'Room placement', 'Corridor carving']
    },
    {
      path: '/world-building',
      title: 'World Building',
      description: 'Create entire worlds with biomes, cities, and geographic features',
      topics: ['Biome distribution', 'City placement', 'Rivers']
    },
    {
      path: '/maze-generation',
      title: 'Maze Generation',
      description: 'Generate perfect and imperfect mazes using various algorithms',
      topics: ['Recursive backtracking', 'Kruskal\'s', 'Prim\'s']
    },
    {
      path: '/cave-systems',
      title: 'Cave Systems',
      description: 'Create natural-looking cave networks using cellular automata',
      topics: ['Cellular automata', 'Marching squares', 'Cave networks']
    },
    {
      path: '/vegetation',
      title: 'Vegetation',
      description: 'Distribute plants and foliage realistically across landscapes',
      topics: ['Ecosystem rules', 'Density maps', 'Species distribution']
    }
  ]

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>Procedural Generation Lab</h1>
        <p className="subtitle">Create infinite worlds with code and mathematics</p>
        <p className="description">
          Procedural generation is a method of creating data algorithmically as opposed to manually.
          Learn to generate terrains, dungeons, plants, and entire worlds using algorithms that 
          produce endless variations from simple rules.
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
        <h2>Core Concepts</h2>
        <div className="resource-grid">
          <div className="resource-card">
            <h4>Deterministic Randomness</h4>
            <p>Use seeds to create reproducible "random" content that can be regenerated exactly</p>
          </div>
          <div className="resource-card">
            <h4>Noise Functions</h4>
            <p>Generate smooth, natural-looking randomness for terrain and texture generation</p>
          </div>
          <div className="resource-card">
            <h4>Grammar Systems</h4>
            <p>Define rules that expand into complex structures like plants and buildings</p>
          </div>
          <div className="resource-card">
            <h4>Space Partitioning</h4>
            <p>Divide space intelligently for dungeons, cities, and other structured content</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage