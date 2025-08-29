import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

interface Boid {
  position: p5.Vector
  velocity: p5.Vector
  acceleration: p5.Vector
  maxSpeed: number
  maxForce: number
  size: number
  color: p5.Color
}

interface Branch {
  start: p5.Vector
  end: p5.Vector
  thickness: number
  generation: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

function NaturalSimulationsPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    simulation: 'flocking',
    flockSize: 50,
    separationRadius: 25,
    alignmentRadius: 50,
    cohesionRadius: 50,
    maxSpeed: 2,
    branchingAngle: 0.3,
    branchLength: 15,
    windStrength: 1,
    particleCount: 200
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let boids: Boid[] = []
      let branches: Branch[] = []
      let particles: Particle[] = []
      let time = 0

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        
        initializeBoids()
        initializeTrees()
        initializeParticles()
      }

      const initializeBoids = () => {
        boids = []
        for (let i = 0; i < params.flockSize; i++) {
          boids.push({
            position: p.createVector(p.random(p.width), p.random(p.height)),
            velocity: p.createVector(p.random(-1, 1), p.random(-1, 1)),
            acceleration: p.createVector(0, 0),
            maxSpeed: params.maxSpeed,
            maxForce: 0.03,
            size: p.random(3, 6),
            color: p.color(p.random(180, 220), 60, 80)
          })
        }
      }

      const initializeTrees = () => {
        branches = []
        // Create initial trunk
        const trunk = {
          start: p.createVector(p.width / 2, p.height),
          end: p.createVector(p.width / 2, p.height - params.branchLength * 4),
          thickness: 8,
          generation: 0
        }
        branches.push(trunk)
        growTree(trunk, 6) // Grow 6 generations
      }

      const initializeParticles = () => {
        particles = []
        for (let i = 0; i < params.particleCount; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-1, 1),
            vy: p.random(-1, 1),
            life: p.random(100, 255),
            maxLife: 255
          })
        }
      }

      const growTree = (parentBranch: Branch, maxGenerations: number) => {
        if (parentBranch.generation >= maxGenerations) return

        const numBranches = p.random(1, 4)
        for (let i = 0; i < numBranches; i++) {
          const angleOffset = p.random(-params.branchingAngle, params.branchingAngle)
          const branchAngle = parentBranch.end.copy().sub(parentBranch.start).heading() + angleOffset
          const branchLength = params.branchLength * (1 - parentBranch.generation * 0.15)
          
          const newBranch: Branch = {
            start: parentBranch.end.copy(),
            end: p.createVector(
              parentBranch.end.x + p.cos(branchAngle) * branchLength,
              parentBranch.end.y + p.sin(branchAngle) * branchLength
            ),
            thickness: parentBranch.thickness * 0.7,
            generation: parentBranch.generation + 1
          }
          
          branches.push(newBranch)
          
          // Recursively grow more branches
          if (p.random() > 0.3) {
            growTree(newBranch, maxGenerations)
          }
        }
      }

      p.draw = () => {
        time += 0.01

        if (params.simulation === 'flocking') {
          drawFlocking()
        } else if (params.simulation === 'growth') {
          drawGrowth()
        } else if (params.simulation === 'fluid') {
          drawFluid()
        } else if (params.simulation === 'ecosystem') {
          drawEcosystem()
        }
      }

      const drawFlocking = () => {
        p.background(20, 30, 40)
        
        // Update boids
        for (let boid of boids) {
          flock(boid)
          update(boid)
          wrapAround(boid)
        }

        // Draw boids
        for (let boid of boids) {
          drawBoid(boid)
        }
      }

      const flock = (boid: Boid) => {
        let sep = separate(boid)
        let ali = align(boid)
        let coh = cohesion(boid)
        
        sep.mult(1.5)
        ali.mult(1.0)
        coh.mult(1.0)
        
        boid.acceleration.add(sep)
        boid.acceleration.add(ali)
        boid.acceleration.add(coh)
      }

      const separate = (boid: Boid): p5.Vector => {
        let steer = p.createVector(0, 0)
        let count = 0
        
        for (let other of boids) {
          let d = p5.Vector.dist(boid.position, other.position)
          if (d > 0 && d < params.separationRadius) {
            let diff = p5.Vector.sub(boid.position, other.position)
            diff.normalize()
            diff.div(d) // Weight by distance
            steer.add(diff)
            count++
          }
        }
        
        if (count > 0) {
          steer.div(count)
          steer.normalize()
          steer.mult(boid.maxSpeed)
          steer.sub(boid.velocity)
          steer.limit(boid.maxForce)
        }
        
        return steer
      }

      const align = (boid: Boid): p5.Vector => {
        let sum = p.createVector(0, 0)
        let count = 0
        
        for (let other of boids) {
          let d = p5.Vector.dist(boid.position, other.position)
          if (d > 0 && d < params.alignmentRadius) {
            sum.add(other.velocity)
            count++
          }
        }
        
        if (count > 0) {
          sum.div(count)
          sum.normalize()
          sum.mult(boid.maxSpeed)
          let steer = p5.Vector.sub(sum, boid.velocity)
          steer.limit(boid.maxForce)
          return steer
        }
        
        return p.createVector(0, 0)
      }

      const cohesion = (boid: Boid): p5.Vector => {
        let sum = p.createVector(0, 0)
        let count = 0
        
        for (let other of boids) {
          let d = p5.Vector.dist(boid.position, other.position)
          if (d > 0 && d < params.cohesionRadius) {
            sum.add(other.position)
            count++
          }
        }
        
        if (count > 0) {
          sum.div(count)
          return seek(boid, sum)
        }
        
        return p.createVector(0, 0)
      }

      const seek = (boid: Boid, target: p5.Vector): p5.Vector => {
        let desired = p5.Vector.sub(target, boid.position)
        desired.normalize()
        desired.mult(boid.maxSpeed)
        
        let steer = p5.Vector.sub(desired, boid.velocity)
        steer.limit(boid.maxForce)
        return steer
      }

      const update = (boid: Boid) => {
        boid.velocity.add(boid.acceleration)
        boid.velocity.limit(boid.maxSpeed)
        boid.position.add(boid.velocity)
        boid.acceleration.mult(0)
      }

      const wrapAround = (boid: Boid) => {
        if (boid.position.x < -boid.size) boid.position.x = p.width + boid.size
        if (boid.position.x > p.width + boid.size) boid.position.x = -boid.size
        if (boid.position.y < -boid.size) boid.position.y = p.height + boid.size
        if (boid.position.y > p.height + boid.size) boid.position.y = -boid.size
      }

      const drawBoid = (boid: Boid) => {
        let theta = boid.velocity.heading() + p.PI / 2
        p.fill(boid.color)
        p.stroke(0)
        p.pushMatrix()
        p.translate(boid.position.x, boid.position.y)
        p.rotate(theta)
        p.beginShape()
        p.vertex(0, -boid.size)
        p.vertex(-boid.size / 2, boid.size)
        p.vertex(boid.size / 2, boid.size)
        p.endShape(p.CLOSE)
        p.popMatrix()
      }

      const drawGrowth = () => {
        p.background(240, 248, 255)
        
        // Draw branches
        for (let branch of branches) {
          p.stroke(101, 67, 33)
          p.strokeWeight(branch.thickness)
          p.line(branch.start.x, branch.start.y, branch.end.x, branch.end.y)
          
          // Draw leaves on younger branches
          if (branch.generation > 3) {
            p.fill(34, 139, 34, 150)
            p.noStroke()
            p.circle(branch.end.x, branch.end.y, branch.thickness * 2)
          }
        }
      }

      const drawFluid = () => {
        p.background(0, 20, 40)
        
        // Update particles with fluid-like behavior
        for (let particle of particles) {
          // Add wind force
          particle.vx += p.noise(particle.x * 0.01, time) * params.windStrength * 0.1 - 0.05
          particle.vy += p.noise(particle.y * 0.01, time) * params.windStrength * 0.1 - 0.05
          
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          
          // Damping
          particle.vx *= 0.99
          particle.vy *= 0.99
          
          // Wrap around
          if (particle.x < 0) particle.x = p.width
          if (particle.x > p.width) particle.x = 0
          if (particle.y < 0) particle.y = p.height
          if (particle.y > p.height) particle.y = 0
          
          // Update life
          particle.life -= 1
          if (particle.life <= 0) {
            particle.life = particle.maxLife
            particle.x = p.random(p.width)
            particle.y = p.random(p.height)
          }
          
          // Draw particle
          let alpha = p.map(particle.life, 0, particle.maxLife, 0, 255)
          p.fill(100, 150, 255, alpha)
          p.noStroke()
          p.circle(particle.x, particle.y, 3)
        }
      }

      const drawEcosystem = () => {
        p.background(50, 80, 60)
        
        // Draw a simple ecosystem with different layers
        
        // Ground
        p.fill(139, 69, 19)
        p.rect(0, p.height * 0.8, p.width, p.height * 0.2)
        
        // Grass
        p.stroke(34, 139, 34)
        for (let x = 0; x < p.width; x += 5) {
          let grassHeight = p.noise(x * 0.01, time) * 30 + 20
          p.line(x, p.height * 0.8, x, p.height * 0.8 - grassHeight)
        }
        
        // Simple creatures moving around
        for (let i = 0; i < 10; i++) {
          let x = p.width * 0.1 + (i * p.width * 0.08) + p.sin(time + i) * 20
          let y = p.height * 0.75 + p.cos(time * 0.5 + i) * 10
          
          p.fill(255, 165, 0)
          p.noStroke()
          p.circle(x, y, 8)
          
          // Simple legs
          p.stroke(139, 69, 19)
          p.strokeWeight(2)
          p.line(x - 3, y + 4, x - 3, y + 8)
          p.line(x + 3, y + 4, x + 3, y + 8)
        }
      }

      // Update functions for parameter changes
      p.updateBoids = () => {
        initializeBoids()
      }

      p.updateTrees = () => {
        initializeTrees()
      }

      p.updateParticles = () => {
        initializeParticles()
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  // Update simulations when parameters change
  useEffect(() => {
    if (p5Instance.current) {
      if (params.simulation === 'flocking' && (p5Instance.current as any).updateBoids) {
        (p5Instance.current as any).updateBoids()
      } else if (params.simulation === 'growth' && (p5Instance.current as any).updateTrees) {
        (p5Instance.current as any).updateTrees()
      } else if (params.simulation === 'fluid' && (p5Instance.current as any).updateParticles) {
        (p5Instance.current as any).updateParticles()
      }
    }
  }, [params.flockSize, params.branchingAngle, params.branchLength, params.particleCount])

  return (
    <div className="page">
      <h2>Natural Simulations</h2>
      <p className="page-description">
        Explore emergent behaviors and natural phenomena through interactive simulations of flocking, growth patterns, and fluid dynamics.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Simulation Type</label>
          <select
            value={params.simulation}
            onChange={(e) => setParams({ ...params, simulation: e.target.value })}
          >
            <option value="flocking">Flocking Behavior (Boids)</option>
            <option value="growth">Growth Patterns</option>
            <option value="fluid">Fluid Dynamics</option>
            <option value="ecosystem">Simple Ecosystem</option>
          </select>
        </div>

        {params.simulation === 'flocking' && (
          <>
            <div className="control-group">
              <label>Flock Size: {params.flockSize}</label>
              <input
                type="range"
                min="10"
                max="150"
                value={params.flockSize}
                onChange={(e) => setParams({ ...params, flockSize: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Separation: {params.separationRadius}</label>
              <input
                type="range"
                min="10"
                max="50"
                value={params.separationRadius}
                onChange={(e) => setParams({ ...params, separationRadius: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Alignment: {params.alignmentRadius}</label>
              <input
                type="range"
                min="20"
                max="80"
                value={params.alignmentRadius}
                onChange={(e) => setParams({ ...params, alignmentRadius: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Cohesion: {params.cohesionRadius}</label>
              <input
                type="range"
                min="20"
                max="100"
                value={params.cohesionRadius}
                onChange={(e) => setParams({ ...params, cohesionRadius: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        {params.simulation === 'growth' && (
          <>
            <div className="control-group">
              <label>Branching Angle: {params.branchingAngle.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={params.branchingAngle}
                onChange={(e) => setParams({ ...params, branchingAngle: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Branch Length: {params.branchLength}</label>
              <input
                type="range"
                min="5"
                max="30"
                value={params.branchLength}
                onChange={(e) => setParams({ ...params, branchLength: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        {params.simulation === 'fluid' && (
          <>
            <div className="control-group">
              <label>Wind Strength: {params.windStrength.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={params.windStrength}
                onChange={(e) => setParams({ ...params, windStrength: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Particle Count: {params.particleCount}</label>
              <input
                type="range"
                min="50"
                max="500"
                value={params.particleCount}
                onChange={(e) => setParams({ ...params, particleCount: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Natural Simulation Techniques</h3>
        <ul>
          <li><strong>Flocking (Boids):</strong> Three simple rules create complex group behavior</li>
          <li><strong>Separation:</strong> Avoid crowding neighbors</li>
          <li><strong>Alignment:</strong> Steer towards average heading of neighbors</li>
          <li><strong>Cohesion:</strong> Steer towards average position of neighbors</li>
          <li><strong>Growth Patterns:</strong> Recursive branching creates natural tree structures</li>
          <li><strong>Fluid Dynamics:</strong> Particles follow flow fields and forces</li>
          <li><strong>Emergent Behavior:</strong> Complex patterns arise from simple rules</li>
        </ul>
        
        <h3>Real-World Applications</h3>
        <ul>
          <li><strong>Animation:</strong> Realistic crowd and animal movement</li>
          <li><strong>Game AI:</strong> Natural-looking group behaviors</li>
          <li><strong>Architecture:</strong> Organic building and space design</li>
          <li><strong>Biology:</strong> Understanding natural systems and evolution</li>
        </ul>
      </div>
    </div>
  )
}

export default NaturalSimulationsPage