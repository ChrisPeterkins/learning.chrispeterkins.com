import { useState, useRef, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

interface ImageData {
  id: number
  url: string
  format: string
  size: string
  dimensions: string
  loading?: 'lazy' | 'eager'
}

interface ImageStats {
  originalSize: number
  optimizedSize: number
  savings: number
}

function ImageOptimization() {
  const [activeTab, setActiveTab] = useState('formats')
  const [lazyLoadEnabled, setLazyLoadEnabled] = useState(true)
  const [imageStats, setImageStats] = useState<ImageStats>({
    originalSize: 2500,
    optimizedSize: 850,
    savings: 66
  })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample images for demonstration
  const imageFormats: ImageData[] = [
    {
      id: 1,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRhZGU4MCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSI+SlBFRyBPcmlnaW5hbDwvdGV4dD48L3N2Zz4=',
      format: 'JPEG',
      size: '2.5MB',
      dimensions: '3000x2000'
    },
    {
      id: 2,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhNWQzYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSI+V2ViUCBPcHRpbWl6ZWQ8L3RleHQ+PC9zdmc+',
      format: 'WebP',
      size: '850KB',
      dimensions: '3000x2000'
    },
    {
      id: 3,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI2OTMzYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSI+QVZJRiBOZXh0LUdlbjwvdGV4dD48L3N2Zz4=',
      format: 'AVIF',
      size: '420KB',
      dimensions: '3000x2000'
    }
  ]

  const generateSampleImages = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      url: `data:image/svg+xml;base64,${btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1a5d3a;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="300" height="200" fill="url(#grad${i})"/>
          <text x="150" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="white">
            Image ${i + 1}
          </text>
        </svg>
      `)}`,
      format: 'SVG',
      size: `${Math.floor(Math.random() * 500 + 200)}KB`,
      dimensions: '300x200',
      loading: lazyLoadEnabled ? 'lazy' : 'eager'
    }))
  }

  const [lazyImages] = useState(() => generateSampleImages(20))

  const optimizeImage = () => {
    const newSavings = Math.floor(Math.random() * 30 + 50) // 50-80% savings
    const originalSize = Math.floor(Math.random() * 2000 + 1000) // 1-3MB
    const optimizedSize = Math.floor(originalSize * (100 - newSavings) / 100)
    
    setImageStats({
      originalSize,
      optimizedSize,
      savings: newSavings
    })
  }

  const demonstrateCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create a sample image manipulation demo
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Original "image"
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(10, 10, 100, 80)
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Original', 35, 55)
    
    // Arrow
    ctx.fillStyle = '#8fa99b'
    ctx.fillText('→', 130, 55)
    
    // "Optimized" image
    ctx.fillStyle = '#1a5d3a'
    ctx.fillRect(160, 10, 100, 80)
    ctx.fillStyle = 'white'
    ctx.fillText('Optimized', 180, 55)
  }

  useEffect(() => {
    demonstrateCanvas()
  }, [])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Image Optimization</h1>
        <p className="page-description">
          Learn modern image optimization techniques to improve loading performance,
          reduce bandwidth usage, and enhance user experience across all devices.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{imageStats.originalSize}KB</div>
          <div className="metric-label">Original Size</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ color: '#4ade80' }}>
            {imageStats.optimizedSize}KB
          </div>
          <div className="metric-label">Optimized Size</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ color: '#4ade80' }}>
            {imageStats.savings}%
          </div>
          <div className="metric-label">Bandwidth Saved</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">2.3s</div>
          <div className="metric-label">Load Time Reduced</div>
        </div>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={optimizeImage}>
          Simulate Optimization
        </button>
        <button 
          className="btn" 
          onClick={() => setLazyLoadEnabled(!lazyLoadEnabled)}
        >
          {lazyLoadEnabled ? 'Disable' : 'Enable'} Lazy Loading
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'formats' ? 'active' : ''}`}
          onClick={() => setActiveTab('formats')}
        >
          Modern Formats
        </button>
        <button 
          className={`tab ${activeTab === 'lazy' ? 'active' : ''}`}
          onClick={() => setActiveTab('lazy')}
        >
          Lazy Loading
        </button>
        <button 
          className={`tab ${activeTab === 'responsive' ? 'active' : ''}`}
          onClick={() => setActiveTab('responsive')}
        >
          Responsive Images
        </button>
        <button 
          className={`tab ${activeTab === 'techniques' ? 'active' : ''}`}
          onClick={() => setActiveTab('techniques')}
        >
          Optimization Techniques
        </button>
      </div>

      {activeTab === 'formats' && (
        <div className="card">
          <h2>Modern Image Formats Comparison</h2>
          <div className="image-grid">
            {imageFormats.map((image) => (
              <div key={image.id} className="image-card">
                <img src={image.url} alt={`${image.format} example`} />
                <div className="image-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#4ade80' }}>{image.format}</strong>
                    <span>{image.size}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8fa99b' }}>
                    {image.dimensions}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="code-block">
            <pre>{`<!-- Modern format with fallbacks -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>

<!-- Responsive images -->
<img 
  srcset="
    image-320w.webp 320w,
    image-640w.webp 640w,
    image-1200w.webp 1200w
  " 
  sizes="(max-width: 640px) 100vw, 50vw"
  src="image-640w.jpg" 
  alt="Description"
  loading="lazy"
>`}</pre>
          </div>

          <div className="info-box">
            <strong>Format Recommendations:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>AVIF: Best compression, ~50% smaller than JPEG</li>
              <li>WebP: Good compression, ~30% smaller than JPEG</li>
              <li>JPEG: Fallback for older browsers</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'lazy' && (
        <div className="card">
          <h2>Lazy Loading Demonstration</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Scroll down to see images load as they enter the viewport. 
            Lazy loading is currently <strong style={{ color: lazyLoadEnabled ? '#4ade80' : '#dc2626' }}>
              {lazyLoadEnabled ? 'enabled' : 'disabled'}
            </strong>.
          </p>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid rgba(26, 93, 58, 0.2)', padding: '1rem' }}>
            {lazyImages.map((image, index) => (
              <LazyImage key={image.id} image={image} index={index} />
            ))}
          </div>

          <div className="code-block">
            <pre>{`// Native lazy loading
<img src="image.jpg" loading="lazy" alt="Description">

// Intersection Observer API
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});

// React with react-intersection-observer
import { useInView } from 'react-intersection-observer';

function LazyImage({ src, alt }) {
  const { ref, inView } = useInView({ triggerOnce: true });
  
  return (
    <div ref={ref}>
      {inView && <img src={src} alt={alt} />}
    </div>
  );
}`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'responsive' && (
        <div className="card">
          <h2>Responsive Images</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Art Direction vs Resolution Switching</h3>
            <div className="grid grid-2">
              <div>
                <h4 style={{ color: '#4ade80' }}>Art Direction (picture element)</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Different images for different screen sizes
                </p>
                <div className="code-block">
                  <pre>{`<picture>
  <source 
    media="(min-width: 1024px)" 
    srcset="hero-desktop.jpg">
  <source 
    media="(min-width: 640px)" 
    srcset="hero-tablet.jpg">
  <img 
    src="hero-mobile.jpg" 
    alt="Hero image">
</picture>`}</pre>
                </div>
              </div>
              <div>
                <h4 style={{ color: '#4ade80' }}>Resolution Switching (srcset)</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Same image at different resolutions
                </p>
                <div className="code-block">
                  <pre>{`<img 
  srcset="
    image-400w.jpg 400w,
    image-800w.jpg 800w,
    image-1200w.jpg 1200w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1200px) 50vw,
    33vw
  "
  src="image-800w.jpg"
  alt="Description"
>`}</pre>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3>Canvas Optimization Demo</h3>
            <canvas 
              ref={canvasRef} 
              width="300" 
              height="100" 
              style={{ border: '1px solid rgba(26, 93, 58, 0.2)', background: 'rgba(10, 10, 10, 0.4)' }}
            />
            <button className="btn" onClick={demonstrateCanvas} style={{ marginTop: '1rem' }}>
              Redraw Canvas Demo
            </button>
          </div>
        </div>
      )}

      {activeTab === 'techniques' && (
        <div className="card">
          <h2>Advanced Optimization Techniques</h2>
          
          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            <div>
              <h3>Compression Strategies</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Use quality settings: JPEG 80-85%, WebP 80%</li>
                <li style={{ marginBottom: '0.5rem' }}>Remove EXIF data and metadata</li>
                <li style={{ marginBottom: '0.5rem' }}>Optimize color palettes for PNGs</li>
                <li style={{ marginBottom: '0.5rem' }}>Use progressive JPEG for large images</li>
              </ul>
            </div>
            <div>
              <h3>Delivery Optimization</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Implement CDN with image transformations</li>
                <li style={{ marginBottom: '0.5rem' }}>Use HTTP/2 server push for critical images</li>
                <li style={{ marginBottom: '0.5rem' }}>Preload above-the-fold images</li>
                <li style={{ marginBottom: '0.5rem' }}>Implement blur-up placeholders</li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Automated Optimization Pipeline</h3>
            <div className="code-block">
              <pre>{`// Next.js Image Component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority // Preload
  placeholder="blur" // Blur up effect
  blurDataURL="data:image/jpeg;base64,..."
/>

// Webpack image optimization
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 8192 }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 85 },
              optipng: { enabled: true },
              pngquant: { quality: [0.65, 0.90], speed: 4 },
              gifsicle: { interlaced: false },
              webp: { quality: 80 }
            }
          }
        ]
      }
    ]
  }
};`}</pre>
            </div>
          </div>

          <div className="warning-box">
            <strong>Performance Impact:</strong> Unoptimized images can account for 60-70% of page weight. 
            Proper optimization can reduce this by 50-80% without noticeable quality loss.
          </div>
        </div>
      )}
    </div>
  )
}

// LazyImage component for demonstration
function LazyImage({ image, index }: { image: ImageData; index: number }) {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  return (
    <div 
      ref={ref}
      style={{ 
        marginBottom: '1rem', 
        padding: '1rem', 
        background: 'rgba(15, 25, 20, 0.4)', 
        borderLeft: '3px solid #1a5d3a',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div style={{ width: '80px', height: '60px', flexShrink: 0 }}>
        {inView ? (
          <img 
            src={image.url} 
            alt={`Lazy loaded image ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div 
            className="loading-skeleton"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
      <div>
        <div style={{ color: '#f0f4f2', fontWeight: '500' }}>
          Image {index + 1}
        </div>
        <div style={{ color: '#8fa99b', fontSize: '0.85rem' }}>
          {inView ? 'Loaded' : 'Loading...'} • {image.size} • {image.dimensions}
        </div>
      </div>
    </div>
  )
}

export default ImageOptimization