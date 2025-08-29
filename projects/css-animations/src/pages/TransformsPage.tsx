import React, { useState } from 'react'

const TransformsPage: React.FC = () => {
  const [rotateX, setRotateX] = useState('0')
  const [rotateY, setRotateY] = useState('0')
  const [rotateZ, setRotateZ] = useState('0')
  const [scale, setScale] = useState('1')
  const [translateX, setTranslateX] = useState('0')
  const [translateY, setTranslateY] = useState('0')
  const [skewX, setSkewX] = useState('0')
  const [perspective, setPerspective] = useState('1000')

  return (
    <div className="transforms-page">
      <header className="page-header">
        <h1>CSS Transforms</h1>
        <p className="page-description">
          Transform elements in 2D and 3D space. Rotate, scale, skew, and translate elements 
          to create dynamic layouts and interactive effects.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>3D Transform Playground</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <div className="control-group">
              <label>Rotate X: {rotateX}°</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotateX}
                onChange={(e) => setRotateX(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Rotate Y: {rotateY}°</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotateY}
                onChange={(e) => setRotateY(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Rotate Z: {rotateZ}°</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotateZ}
                onChange={(e) => setRotateZ(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Scale: {scale}</label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Translate X: {translateX}px</label>
              <input 
                type="range" 
                min="-100" 
                max="100" 
                value={translateX}
                onChange={(e) => setTranslateX(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Skew X: {skewX}°</label>
              <input 
                type="range" 
                min="-45" 
                max="45" 
                value={skewX}
                onChange={(e) => setSkewX(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <button 
              className="demo-button"
              onClick={() => {
                setRotateX('0')
                setRotateY('0')
                setRotateZ('0')
                setScale('1')
                setTranslateX('0')
                setTranslateY('0')
                setSkewX('0')
              }}
            >
              Reset
            </button>
          </div>
          
          <div style={{
            background: 'var(--code-bg)',
            padding: '4rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            perspective: `${perspective}px`
          }}>
            <div style={{
              width: '150px',
              height: '150px',
              background: 'linear-gradient(135deg, var(--accent-green), var(--accent-green-bright))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg-primary)',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              transform: `
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                rotateZ(${rotateZ}deg) 
                scale(${scale}) 
                translateX(${translateX}px) 
                translateY(${translateY}px) 
                skewX(${skewX}deg)
              `,
              transition: 'transform 0.3s ease',
              transformStyle: 'preserve-3d'
            }}>
              3D Box
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Card Flip Example</h2>
        
        <div className="demo-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <div className="flip-card" style={{
              width: '200px',
              height: '280px',
              perspective: '1000px'
            }}>
              <div className="flip-card-inner" style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.6s',
                transformStyle: 'preserve-3d'
              }}>
                <div className="flip-card-front" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, var(--accent-green), var(--accent-green-bright))',
                  color: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}>
                  <h3>Front Side</h3>
                  <p>Hover to flip</p>
                </div>
                <div className="flip-card-back" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--accent-green)',
                  color: 'var(--text-primary)',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}>
                  <h3>Back Side</h3>
                  <p>Hidden content</p>
                </div>
              </div>
            </div>
          </div>
          
          <style>{`
            .flip-card:hover .flip-card-inner {
              transform: rotateY(180deg);
            }
          `}</style>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Transform Functions</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>2D Transforms</h3>
            <p>
              translate(), rotate(), scale(), skew(), matrix()
            </p>
          </div>
          
          <div className="concept-card">
            <h3>3D Transforms</h3>
            <p>
              translate3d(), rotate3d(), scale3d(), perspective(), matrix3d()
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Transform Origin</h3>
            <p>
              Control the point around which transformations occur. Default is center.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TransformsPage