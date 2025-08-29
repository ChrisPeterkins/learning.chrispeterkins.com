import React, { useState, useContext, createContext } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const themeContextExample = `
// Create a context
const ThemeContext = createContext()

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Component using the context
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '0.75rem 1.5rem',
        background: theme === 'dark' ? '#1a5d3a' : '#4ade80',
        color: theme === 'dark' ? '#f0f4f2' : '#0a0f0d',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      Current theme: {theme}
    </button>
  )
}

// Nested component also using context
function ThemedCard() {
  const { theme } = useContext(ThemeContext)
  
  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      background: theme === 'dark' 
        ? 'rgba(15, 25, 20, 0.6)' 
        : 'rgba(240, 244, 242, 0.9)',
      color: theme === 'dark' ? '#a8bdb2' : '#1a5d3a',
      border: '1px solid rgba(143, 169, 155, 0.2)',
      borderRadius: '8px'
    }}>
      <p>This card responds to theme changes!</p>
      <p>No prop drilling required.</p>
    </div>
  )
}

// App component
function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: '1rem' }}>
        <ThemedButton />
        <ThemedCard />
      </div>
    </ThemeProvider>
  )
}

// Render the App
<App />`

const userAuthExample = `
// Authentication Context
const AuthContext = createContext()

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  const login = (username) => {
    setUser({ 
      username, 
      role: username === 'admin' ? 'admin' : 'user',
      loginTime: new Date().toLocaleTimeString()
    })
  }
  
  const logout = () => setUser(null)
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Login Form Component
function LoginForm() {
  const [username, setUsername] = useState('')
  const { login } = useContext(AuthContext)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      login(username)
      setUsername('')
    }
  }
  
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        style={{
          padding: '0.5rem',
          marginRight: '0.5rem',
          background: 'rgba(15, 25, 20, 0.6)',
          color: '#f0f4f2',
          border: '1px solid rgba(143, 169, 155, 0.2)',
          borderRadius: '4px'
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.5rem 1rem',
          background: '#1a5d3a',
          color: '#f0f4f2',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Login
      </button>
    </form>
  )
}

// User Profile Component
function UserProfile() {
  const { user, logout } = useContext(AuthContext)
  
  if (!user) {
    return (
      <div style={{ 
        padding: '1rem',
        background: 'rgba(15, 25, 20, 0.6)',
        border: '1px solid rgba(143, 169, 155, 0.2)',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#8fa99b' }}>Not logged in</p>
      </div>
    )
  }
  
  return (
    <div style={{ 
      padding: '1rem',
      background: 'rgba(15, 25, 20, 0.6)',
      border: '1px solid rgba(143, 169, 155, 0.2)',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>
        Welcome, {user.username}!
      </h4>
      <p style={{ color: '#a8bdb2' }}>Role: {user.role}</p>
      <p style={{ color: '#a8bdb2' }}>Logged in at: {user.loginTime}</p>
      <button
        onClick={logout}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#735c3a',
          color: '#f0f4f2',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  )
}

// App with Auth
function App() {
  return (
    <AuthProvider>
      <div style={{ padding: '1rem' }}>
        <LoginForm />
        <UserProfile />
      </div>
    </AuthProvider>
  )
}

<App />`

const multiContextExample = `
// Language Context
const LanguageContext = createContext()
const NotificationContext = createContext()

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  
  const translations = {
    en: { greeting: 'Hello', button: 'Click me', message: 'Welcome!' },
    es: { greeting: 'Hola', button: 'Haz clic', message: '¡Bienvenido!' },
    fr: { greeting: 'Bonjour', button: 'Cliquez', message: 'Bienvenue!' }
  }
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t: translations[language] 
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  
  const addNotification = (message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }
  
  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

// Component using multiple contexts
function MultiContextApp() {
  const { language, setLanguage, t } = useContext(LanguageContext)
  const { notifications, addNotification } = useContext(NotificationContext)
  
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <select 
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value)
            addNotification(\`Language changed to \${e.target.value}\`)
          }}
          style={{
            padding: '0.5rem',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: '1px solid rgba(143, 169, 155, 0.2)',
            borderRadius: '4px'
          }}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
      
      <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>
        {t.greeting}!
      </h3>
      <p style={{ color: '#a8bdb2', marginBottom: '1rem' }}>
        {t.message}
      </p>
      <button
        onClick={() => addNotification(t.button)}
        style={{
          padding: '0.5rem 1rem',
          background: '#1a5d3a',
          color: '#f0f4f2',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {t.button}
      </button>
      
      <div style={{ marginTop: '1rem' }}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              padding: '0.5rem',
              marginBottom: '0.5rem',
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '4px',
              color: '#4ade80',
              animation: 'slideIn 0.3s ease'
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  )
}

// App with multiple providers
function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <MultiContextApp />
      </NotificationProvider>
    </LanguageProvider>
  )
}

<App />`

function UseContextPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useContext Hook</h1>
        <p className="subtitle">Share data across components without prop drilling</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useContext</code> hook provides a way to pass data through the component tree 
          without having to pass props down manually at every level. It's perfect for global state 
          like themes, authentication, or language preferences.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`// Create a context
const MyContext = createContext(defaultValue)

// Provide context value
<MyContext.Provider value={value}>
  {children}
</MyContext.Provider>

// Consume context value
const value = useContext(MyContext)`}
        </pre>
      </section>

      <section className="content-section">
        <h2>Key Concepts</h2>
        <ul className="concepts-list">
          <li><strong>Provider:</strong> Component that provides the context value to its children</li>
          <li><strong>Consumer:</strong> Components that use the context value</li>
          <li><strong>Default Value:</strong> Fallback value when no provider is found</li>
          <li><strong>Re-rendering:</strong> All consumers re-render when context value changes</li>
        </ul>
      </section>

      <section className="examples-section">
        <h2>Interactive Examples</h2>
        
        <CodeExample
          title="Theme Context"
          description="Share theme state across nested components"
          code={themeContextExample}
          scope={{ React, useState, useContext, createContext }}
        />
        
        <CodeExample
          title="Authentication Context"
          description="Manage user authentication state globally"
          code={userAuthExample}
          scope={{ React, useState, useContext, createContext }}
        />
        
        <CodeExample
          title="Multiple Contexts"
          description="Using multiple contexts together for complex state"
          code={multiContextExample}
          scope={{ React, useState, useContext, createContext }}
        />
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Split contexts by concern (auth, theme, etc.) rather than one global context</li>
          <li>Keep context values simple and focused</li>
          <li>Place providers as low in the tree as possible</li>
          <li>Consider using useReducer with context for complex state logic</li>
          <li>Export custom hooks that use useContext internally</li>
          <li>Memoize context values to prevent unnecessary re-renders</li>
        </ul>
      </section>
    </div>
  )
}

export default UseContextPage