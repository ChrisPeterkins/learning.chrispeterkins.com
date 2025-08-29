import { Link } from 'react-router-dom'
import './HooksPage.css'

function HooksPage() {
  const hooks = [
    {
      name: 'useState',
      path: '/hooks/useState',
      description: 'Manage component state with the most fundamental React hook',
      difficulty: 'Beginner'
    },
    {
      name: 'useEffect',
      path: '/hooks/useEffect',
      description: 'Handle side effects and lifecycle events in functional components',
      difficulty: 'Beginner'
    },
    {
      name: 'useContext',
      path: '/hooks/useContext',
      description: 'Share data across components without prop drilling',
      difficulty: 'Intermediate'
    },
    {
      name: 'useReducer',
      path: '/hooks/useReducer',
      description: 'Manage complex state logic with reducer functions',
      difficulty: 'Intermediate'
    },
    {
      name: 'useMemo',
      path: '/hooks/useMemo',
      description: 'Optimize expensive computations with memoization',
      difficulty: 'Intermediate'
    },
    {
      name: 'useCallback',
      path: '/hooks/useCallback',
      description: 'Memoize callback functions to prevent unnecessary re-renders',
      difficulty: 'Intermediate'
    },
    {
      name: 'useRef',
      path: '/hooks/useRef',
      description: 'Access DOM elements and persist values between renders',
      difficulty: 'Intermediate'
    },
    {
      name: 'Custom Hooks',
      path: '/hooks/custom',
      description: 'Create reusable logic by building your own hooks',
      difficulty: 'Advanced'
    }
  ]

  return (
    <div className="hooks-page">
      <header className="page-header">
        <h1>React Hooks</h1>
        <p className="subtitle">Master the building blocks of modern React</p>
      </header>

      <div className="hooks-grid">
        {hooks.map(hook => (
          <Link to={hook.path} key={hook.name} className="hook-card">
            <div className="hook-header">
              <h3>{hook.name}</h3>
              <span className={`difficulty ${hook.difficulty.toLowerCase()}`}>
                {hook.difficulty}
              </span>
            </div>
            <p>{hook.description}</p>
            <span className="learn-more">Learn more →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HooksPage