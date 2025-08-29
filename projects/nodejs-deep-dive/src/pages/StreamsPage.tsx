import React, { useState, useRef, useEffect } from 'react'

const StreamsPage: React.FC = () => {
  const [streamType, setStreamType] = useState('readable')
  const [dataFlow, setDataFlow] = useState<string[]>([])
  const [isFlowing, setIsFlowing] = useState(false)
  const animationRef = useRef<number>()
  
  const streamExamples = {
    readable: {
      title: 'Readable Stream',
      description: 'Reads data from a source',
      code: `const { Readable } = require('stream');

const readableStream = new Readable({
  read() {
    this.push('Hello ');
    this.push('World!');
    this.push(null); // End stream
  }
});

readableStream.on('data', (chunk) => {
  console.log('Received:', chunk.toString());
});`
    },
    writable: {
      title: 'Writable Stream',
      description: 'Writes data to a destination',
      code: `const { Writable } = require('stream');

const writableStream = new Writable({
  write(chunk, encoding, callback) {
    console.log('Writing:', chunk.toString());
    callback();
  }
});

writableStream.write('Hello ');
writableStream.write('World!');
writableStream.end();`
    },
    transform: {
      title: 'Transform Stream',
      description: 'Modifies data as it passes through',
      code: `const { Transform } = require('stream');

const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

process.stdin
  .pipe(upperCaseTransform)
  .pipe(process.stdout);`
    },
    duplex: {
      title: 'Duplex Stream',
      description: 'Both readable and writable',
      code: `const { Duplex } = require('stream');

const duplexStream = new Duplex({
  read() {
    this.push('Reading data...');
    this.push(null);
  },
  write(chunk, encoding, callback) {
    console.log('Writing:', chunk.toString());
    callback();
  }
});

duplexStream.on('data', console.log);
duplexStream.write('Hello Duplex!');`
    }
  }
  
  useEffect(() => {
    if (isFlowing) {
      let counter = 0
      const chunks = ['Data', 'Chunk', 'Buffer', 'Packet', 'Block']
      
      const flow = () => {
        if (counter < 10) {
          const chunk = chunks[Math.floor(Math.random() * chunks.length)]
          setDataFlow(prev => [...prev.slice(-4), `${chunk} ${counter}`])
          counter++
          animationRef.current = requestAnimationFrame(() => setTimeout(flow, 500))
        } else {
          setIsFlowing(false)
        }
      }
      
      flow()
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [isFlowing])
  
  const startFlow = () => {
    setDataFlow([])
    setIsFlowing(true)
  }
  
  return (
    <div className="streams-page">
      <header className="page-header">
        <h1>Node.js Streams</h1>
        <p className="page-description">
          Master the art of processing data piece by piece with Node.js streams. Handle large files, 
          network data, and real-time information efficiently without loading everything into memory.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Stream Types</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            {Object.keys(streamExamples).map(type => (
              <button
                key={type}
                className={`demo-button ${streamType === type ? 'active' : ''}`}
                onClick={() => setStreamType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>
              {streamExamples[streamType as keyof typeof streamExamples].title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {streamExamples[streamType as keyof typeof streamExamples].description}
            </p>
            
            <div className="code-container">
              <div className="code-header">
                <span className="code-title">Example Code</span>
              </div>
              <div className="code-content">
                <pre>{streamExamples[streamType as keyof typeof streamExamples].code}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Stream Flow Visualization</h2>
        
        <div className="visualization-container">
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1rem',
                background: 'var(--code-bg)',
                border: '2px solid var(--accent-green)',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <strong>Source</strong>
              </div>
              
              <div style={{ 
                flex: 1, 
                height: '60px',
                margin: '0 1rem',
                position: 'relative',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                overflow: 'hidden'
              }}>
                {dataFlow.map((chunk, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${(i / dataFlow.length) * 80}%`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.5rem',
                      background: 'var(--accent-green)',
                      color: 'var(--bg-primary)',
                      fontSize: '0.8rem',
                      animation: 'slideRight 2s ease-out'
                    }}
                  >
                    {chunk}
                  </div>
                ))}
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'var(--code-bg)',
                border: '2px solid var(--accent-green)',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <strong>Destination</strong>
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button 
                className="demo-button" 
                onClick={startFlow}
                disabled={isFlowing}
              >
                {isFlowing ? 'Streaming...' : 'Start Stream'}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Practical Examples</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">File Processing with Streams</span>
          </div>
          <div className="code-content">
            <pre>{`const fs = require('fs');
const zlib = require('zlib');

// Process large files efficiently
fs.createReadStream('large-file.txt')
  .pipe(zlib.createGzip()) // Compress on-the-fly
  .pipe(fs.createWriteStream('large-file.txt.gz'))
  .on('finish', () => {
    console.log('File compressed successfully');
  });`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Pipeline for Error Handling</span>
          </div>
          <div className="code-content">
            <pre>{`const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Custom Transform Stream</span>
          </div>
          <div className="code-content">
            <pre>{`const { Transform } = require('stream');

class CSVParser extends Transform {
  constructor(options) {
    super(options);
    this.lineBuffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    const lines = (this.lineBuffer + chunk).split('\\n');
    this.lineBuffer = lines.pop() || '';
    
    lines.forEach(line => {
      const values = line.split(',');
      this.push(JSON.stringify(values) + '\\n');
    });
    
    callback();
  }
  
  _flush(callback) {
    if (this.lineBuffer) {
      const values = this.lineBuffer.split(',');
      this.push(JSON.stringify(values) + '\\n');
    }
    callback();
  }
}`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Stream Modes & Events</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Flowing Mode</h3>
            <p>
              Data is read automatically and provided as quickly as possible via events. 
              Use 'data' event or pipe() method.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Paused Mode</h3>
            <p>
              Must explicitly call read() to get chunks of data. Default mode for readable 
              streams. More control over data flow.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Object Mode</h3>
            <p>
              Streams operate on JavaScript objects instead of strings/buffers. Useful for 
              processing structured data.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Backpressure</h3>
            <p>
              Mechanism to pause reading when the writable stream can't handle data fast enough. 
              Prevents memory overflow.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>High Water Mark</h3>
            <p>
              Buffer threshold that controls when to stop reading (backpressure). Default is 
              16KB for normal streams.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Stream Events</h3>
            <p>
              'data', 'end', 'error', 'finish', 'pipe', 'unpipe', 'readable', 'drain' - 
              Key events for stream lifecycle.
            </p>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes slideRight {
          from {
            left: 0;
            opacity: 0;
          }
          to {
            left: 80%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default StreamsPage