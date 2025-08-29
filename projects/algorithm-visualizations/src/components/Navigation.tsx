import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Algorithm Visualizations</h2>
        <p className="nav-subtitle">Interactive Algorithm Learning</p>
      </div>
      
      <div className="nav-section">
        <h3>Overview</h3>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Sorting Algorithms</h3>
        <NavLink to="/sorting" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Bubble, Quick, Merge, Heap
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Searching Algorithms</h3>
        <NavLink to="/searching" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Binary, Linear, Jump
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Graph Algorithms</h3>
        <NavLink to="/graph" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          DFS, BFS, Dijkstra
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Pathfinding</h3>
        <NavLink to="/pathfinding" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          A*, Greedy Best-First
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Tree Traversals</h3>
        <NavLink to="/trees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Inorder, Preorder, Postorder
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Dynamic Programming</h3>
        <NavLink to="/dynamic-programming" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Fibonacci, Knapsack
        </NavLink>
      </div>
      
      <div className="nav-section">
        <h3>Data Structures</h3>
        <NavLink to="/data-structures" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Stack, Queue, Linked List
        </NavLink>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)' }}>
        <a href="/" className="nav-link" style={{ fontSize: '0.85rem' }}>
          ← Back to Learning Hub
        </a>
      </div>
    </nav>
  )
}

export default Navigation