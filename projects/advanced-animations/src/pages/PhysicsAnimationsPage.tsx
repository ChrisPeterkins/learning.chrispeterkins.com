import React, { useRef, useEffect, useState } from 'react';
import { Activity, Zap, Target, Move, Circle, Square } from 'lucide-react';

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  isDragging?: boolean;
  restitution: number;
}

const PhysicsAnimationsPage: React.FC = () => {
  const bouncingCanvasRef = useRef<HTMLCanvasElement>(null);
  const pendulumCanvasRef = useRef<HTMLCanvasElement>(null);
  const springCanvasRef = useRef<HTMLCanvasElement>(null);
  const collisionCanvasRef = useRef<HTMLCanvasElement>(null);
  const clothCanvasRef = useRef<HTMLCanvasElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gravity, setGravity] = useState(0.5);
  const [damping, setDamping] = useState(0.99);
  const [springStrength, setSpringStrength] = useState(0.05);
  const [restitution, setRestitution] = useState(0.8);

  // Bouncing balls with gravity
  useEffect(() => {
    const canvas = bouncingCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const balls: Body[] = [];
    let animationId: number;
    
    // Create initial balls
    for (let i = 0; i < 10; i++) {
      balls.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5,
        radius: Math.random() * 20 + 10,
        mass: 1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        restitution: restitution
      });
    }
    
    const update = () => {
      balls.forEach(ball => {
        // Apply gravity
        ball.vy += gravity;
        
        // Apply damping
        ball.vx *= damping;
        ball.vy *= damping;
        
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Bounce off walls
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.vx *= -ball.restitution;
          ball.x = ball.x - ball.radius < 0 ? ball.radius : canvas.width - ball.radius;
        }
        
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
          ball.vy *= -ball.restitution;
          ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
          
          // Apply some friction when bouncing on ground
          if (ball.y + ball.radius >= canvas.height) {
            ball.vx *= 0.95;
          }
        }
      });
      
      // Ball-to-ball collisions
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < b1.radius + b2.radius) {
            // Collision detected
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // Rotate velocities
            const v1x = b1.vx * cos + b1.vy * sin;
            const v1y = b1.vy * cos - b1.vx * sin;
            const v2x = b2.vx * cos + b2.vy * sin;
            const v2y = b2.vy * cos - b2.vx * sin;
            
            // Collision response
            const finalV1x = v2x * b1.restitution;
            const finalV2x = v1x * b2.restitution;
            
            // Rotate back
            b1.vx = finalV1x * cos - v1y * sin;
            b1.vy = v1y * cos + finalV1x * sin;
            b2.vx = finalV2x * cos - v2y * sin;
            b2.vy = v2y * cos + finalV2x * sin;
            
            // Separate balls
            const overlap = (b1.radius + b2.radius) - dist;
            const separateX = (dx / dist) * overlap * 0.5;
            const separateY = (dy / dist) * overlap * 0.5;
            b1.x -= separateX;
            b1.y -= separateY;
            b2.x += separateX;
            b2.y += separateY;
          }
        }
      }
    };
    
    const render = () => {
      ctx.fillStyle = 'rgba(245, 245, 245, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      balls.forEach(ball => {
        ctx.save();
        ctx.fillStyle = ball.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      update();
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gravity, damping, restitution]);

  // Pendulum simulation
  useEffect(() => {
    const canvas = pendulumCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let angle = Math.PI / 4;
    let angleVel = 0;
    const length = 150;
    const damping = 0.995;
    let animationId: number;
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate pendulum physics
      const angleAcc = (-gravity / length) * Math.sin(angle);
      angleVel += angleAcc;
      angleVel *= damping;
      angle += angleVel;
      
      // Calculate position
      const x = canvas.width / 2 + length * Math.sin(angle);
      const y = 50 + length * Math.cos(angle);
      
      // Draw string
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 50);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Draw pivot
      ctx.fillStyle = '#764ba2';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 50, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw bob
      ctx.fillStyle = '#667eea';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#667eea';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw trail
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
      ctx.lineWidth = 40;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - angleVel * 50, y);
      ctx.stroke();
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    // Click to restart
    const handleClick = () => {
      angle = Math.PI / 4;
      angleVel = 0;
    };
    
    canvas.addEventListener('click', handleClick);
    
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gravity]);

  // Spring system
  useEffect(() => {
    const canvas = springCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const springs: any[] = [];
    const nodes: any[] = [];
    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let selectedNode: any = null;
    
    // Create spring mesh
    const rows = 5;
    const cols = 5;
    const spacing = 60;
    const startX = (canvas.width - (cols - 1) * spacing) / 2;
    const startY = (canvas.height - (rows - 1) * spacing) / 2;
    
    // Create nodes
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        nodes.push({
          x: startX + j * spacing,
          y: startY + i * spacing,
          vx: 0,
          vy: 0,
          fixed: false
        });
      }
    }
    
    // Create springs
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const current = i * cols + j;
        
        // Horizontal spring
        if (j < cols - 1) {
          springs.push({
            a: nodes[current],
            b: nodes[current + 1],
            restLength: spacing
          });
        }
        
        // Vertical spring
        if (i < rows - 1) {
          springs.push({
            a: nodes[current],
            b: nodes[current + cols],
            restLength: spacing
          });
        }
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      
      if (selectedNode) {
        selectedNode.x = mouseX;
        selectedNode.y = mouseY;
        selectedNode.vx = 0;
        selectedNode.vy = 0;
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      
      // Find nearest node
      let minDist = Infinity;
      nodes.forEach(node => {
        const dist = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
        if (dist < 20 && dist < minDist) {
          minDist = dist;
          selectedNode = node;
        }
      });
    };
    
    const handleMouseUp = () => {
      selectedNode = null;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    const update = () => {
      // Update springs
      springs.forEach(spring => {
        const dx = spring.b.x - spring.a.x;
        const dy = spring.b.y - spring.a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = springStrength * (dist - spring.restLength);
        
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        
        if (!spring.a.fixed && spring.a !== selectedNode) {
          spring.a.vx += fx;
          spring.a.vy += fy;
        }
        if (!spring.b.fixed && spring.b !== selectedNode) {
          spring.b.vx -= fx;
          spring.b.vy -= fy;
        }
      });
      
      // Update nodes
      nodes.forEach(node => {
        if (!node.fixed && node !== selectedNode) {
          node.vx *= 0.95; // Damping
          node.vy *= 0.95;
          node.vy += gravity * 0.1;
          
          node.x += node.vx;
          node.y += node.vy;
        }
      });
    };
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw springs
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
      ctx.lineWidth = 2;
      springs.forEach(spring => {
        ctx.beginPath();
        ctx.moveTo(spring.a.x, spring.a.y);
        ctx.lineTo(spring.b.x, spring.b.y);
        ctx.stroke();
      });
      
      // Draw nodes
      nodes.forEach(node => {
        ctx.fillStyle = node === selectedNode ? '#f87171' : '#667eea';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      
      update();
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gravity, springStrength]);

  // Cloth simulation
  useEffect(() => {
    const canvas = clothCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const points: any[] = [];
    const constraints: any[] = [];
    let animationId: number;
    
    const rows = 15;
    const cols = 20;
    const spacing = 15;
    const startX = (canvas.width - (cols - 1) * spacing) / 2;
    const startY = 50;
    
    // Create points
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const point = {
          x: startX + x * spacing,
          y: startY + y * spacing,
          oldX: startX + x * spacing,
          oldY: startY + y * spacing,
          pinned: y === 0 && (x === 0 || x === cols - 1 || x % 4 === 0)
        };
        points.push(point);
      }
    }
    
    // Create constraints
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = y * cols + x;
        
        if (x < cols - 1) {
          constraints.push({
            p1: points[index],
            p2: points[index + 1],
            restLength: spacing
          });
        }
        
        if (y < rows - 1) {
          constraints.push({
            p1: points[index],
            p2: points[index + cols],
            restLength: spacing
          });
        }
      }
    }
    
    const updatePoints = () => {
      points.forEach(point => {
        if (!point.pinned) {
          const velX = (point.x - point.oldX) * 0.99;
          const velY = (point.y - point.oldY) * 0.99;
          
          point.oldX = point.x;
          point.oldY = point.y;
          
          point.x += velX;
          point.y += velY + gravity * 0.2;
        }
      });
    };
    
    const updateConstraints = () => {
      for (let i = 0; i < 2; i++) {
        constraints.forEach(constraint => {
          const dx = constraint.p2.x - constraint.p1.x;
          const dy = constraint.p2.y - constraint.p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const diff = constraint.restLength - dist;
          const percent = diff / dist / 2;
          const offsetX = dx * percent;
          const offsetY = dy * percent;
          
          if (!constraint.p1.pinned) {
            constraint.p1.x -= offsetX;
            constraint.p1.y -= offsetY;
          }
          if (!constraint.p2.pinned) {
            constraint.p2.x += offsetX;
            constraint.p2.y += offsetY;
          }
        });
      }
    };
    
    const render = () => {
      ctx.fillStyle = 'rgba(245, 245, 245, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      updatePoints();
      updateConstraints();
      
      // Draw cloth
      ctx.strokeStyle = 'rgba(118, 75, 162, 0.5)';
      ctx.lineWidth = 1;
      
      constraints.forEach(constraint => {
        ctx.beginPath();
        ctx.moveTo(constraint.p1.x, constraint.p1.y);
        ctx.lineTo(constraint.p2.x, constraint.p2.y);
        ctx.stroke();
      });
      
      // Draw pinned points
      points.forEach(point => {
        if (point.pinned) {
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gravity]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Activity size={32} />
          Physics-Based Animations
        </h1>
        <p className="page-subtitle">
          Realistic motion with physics simulations and natural movement
        </p>
      </div>

      {/* Controls */}
      <div className="section">
        <h2 className="section-title">Physics Parameters</h2>
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Gravity: {gravity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Damping: {damping.toFixed(2)}</label>
            <input
              type="range"
              min="0.9"
              max="1"
              step="0.01"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Spring Strength: {springStrength.toFixed(2)}</label>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={springStrength}
              onChange={(e) => setSpringStrength(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Restitution: {restitution.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={restitution}
              onChange={(e) => setRestitution(Number(e.target.value))}
              className="control-input"
            />
          </div>
        </div>
      </div>

      {/* Bouncing Balls */}
      <div className="section">
        <h2 className="section-title">
          <Circle size={24} />
          Bouncing Balls & Collisions
        </h2>
        <p className="section-description">
          Gravity, restitution, and elastic collisions between objects
        </p>
        <canvas ref={bouncingCanvasRef} className="physics-canvas" />
      </div>

      {/* Pendulum */}
      <div className="section">
        <h2 className="section-title">
          <Move size={24} />
          Pendulum Motion
        </h2>
        <p className="section-description">
          Click to reset the pendulum. Observe damped harmonic motion.
        </p>
        <canvas ref={pendulumCanvasRef} className="physics-canvas dark-canvas" />
      </div>

      {/* Spring System */}
      <div className="section">
        <h2 className="section-title">
          <Zap size={24} />
          Spring System
        </h2>
        <p className="section-description">
          Drag nodes to interact with the spring mesh
        </p>
        <canvas ref={springCanvasRef} className="physics-canvas" />
      </div>

      {/* Cloth Simulation */}
      <div className="section">
        <h2 className="section-title">
          <Square size={24} />
          Cloth Simulation
        </h2>
        <p className="section-description">
          Verlet integration for realistic cloth behavior
        </p>
        <canvas ref={clothCanvasRef} className="physics-canvas" />
      </div>

      <style>{`
        .physics-canvas {
          width: 100%;
          height: 400px;
          background: linear-gradient(180deg, #f5f5f5, #e0e0e0);
          border-radius: 1rem;
          margin-top: 1rem;
          cursor: grab;
        }

        .physics-canvas:active {
          cursor: grabbing;
        }

        .dark-canvas {
          background: linear-gradient(180deg, #0a0f0d, #1a1a2e);
        }

        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-label {
          font-weight: 600;
          color: #333;
        }

        .control-input {
          width: 100%;
        }

        .section {
          margin-bottom: 4rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .section-description {
          color: #666;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default PhysicsAnimationsPage;