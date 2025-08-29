import { useState, lazy, Suspense } from 'react'
import { useInView } from 'react-intersection-observer'

// Simulate a heavy component
const HeavyComponent = lazy(() => 
  new Promise(resolve => 
    setTimeout(() => resolve({
      default: () => (
        <div className="card">
          <h3>Heavy Component Loaded!</h3>
          <p>This component was loaded on demand, reducing initial bundle size.</p>
          <div style={{ 
            height: '200px', 
            background: 'linear-gradient(135deg, rgba(26, 93, 58, 0.2), rgba(74, 222, 128, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4ade80',
            fontSize: '1.2rem'
          }}>
            Component Content
          </div>
        </div>
      )
    }), 2000)
  )
)

function ImageWithLazyLoad({ src, alt }: { src: string; alt: string }) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <div ref={ref} className="image-card">
      {inView ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="loading-skeleton" />
      )}
      <div className="image-info">{alt}</div>
    </div>
  )
}

function LazyLoading() {
  const [showComponent, setShowComponent] = useState(false)
  const [visibleItems, setVisibleItems] = useState(5)

  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`
  }))

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + 10, items.length))
  }

  const images = [
    'https://via.placeholder.com/300x200/004225/4ade80?text=Image+1',
    'https://via.placeholder.com/300x200/1a5d3a/f0f4f2?text=Image+2',
    'https://via.placeholder.com/300x200/0a0f0d/8fa99b?text=Image+3',
    'https://via.placeholder.com/300x200/004225/4ade80?text=Image+4',
    'https://via.placeholder.com/300x200/1a5d3a/f0f4f2?text=Image+5',
    'https://via.placeholder.com/300x200/0a0f0d/8fa99b?text=Image+6'
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lazy Loading</h1>
        <p className="page-description">
          Improve initial load time by loading resources only when needed.
          Implement lazy loading for components, images, and data.
        </p>
      </div>

      <div className="demo-section">
        <div className="card">
          <h2>Component Lazy Loading</h2>
          <p>Load React components on demand using React.lazy() and Suspense.</p>
          
          <div className="controls">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowComponent(!showComponent)}
            >
              {showComponent ? 'Hide' : 'Load'} Heavy Component
            </button>
          </div>

          {showComponent && (
            <Suspense fallback={
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: '#4ade80', marginBottom: '1rem' }}>Loading component...</div>
                <div className="loading-skeleton" style={{ height: '100px' }} />
              </div>
            }>
              <HeavyComponent />
            </Suspense>
          )}

          <div className="code-block">
            <pre>{`// Lazy load a component
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Use with Suspense
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>`}</pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <div className="card">
          <h2>Image Lazy Loading</h2>
          <p>Load images as they enter the viewport using Intersection Observer.</p>
          
          <div className="image-grid">
            {images.map((src, index) => (
              <ImageWithLazyLoad 
                key={index}
                src={src}
                alt={`Lazy loaded image ${index + 1}`}
              />
            ))}
          </div>

          <div className="info-box">
            <strong>Scroll down to see images load as they enter the viewport!</strong>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <div className="card">
          <h2>List Virtualization & Pagination</h2>
          <p>Load data incrementally to improve performance with large datasets.</p>
          
          <div className="list-container">
            {items.slice(0, visibleItems).map(item => (
              <div key={item.id} className="list-item">
                <h4 style={{ color: '#4ade80', marginBottom: '0.25rem' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.description}</p>
              </div>
            ))}
          </div>

          {visibleItems < items.length && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn" onClick={loadMore}>
                Load More ({items.length - visibleItems} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Lazy Loading Strategies</h2>
        <div className="grid grid-2">
          <div>
            <h3>Route-based Splitting</h3>
            <div className="code-block">
              <pre>{`// Split by routes
const Home = lazy(() => import('./Home'))
const About = lazy(() => import('./About'))
const Contact = lazy(() => import('./Contact'))`}</pre>
            </div>
          </div>
          <div>
            <h3>Component-based Splitting</h3>
            <div className="code-block">
              <pre>{`// Split heavy components
const Chart = lazy(() => import('./Chart'))
const Editor = lazy(() => import('./Editor'))
const Table = lazy(() => import('./Table'))`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LazyLoading