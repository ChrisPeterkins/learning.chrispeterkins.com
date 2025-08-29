import React, { useState } from 'react'

const BuffersPage: React.FC = () => {
  const [encoding, setEncoding] = useState('utf8')
  
  return (
    <div className="buffers-page">
      <header className="page-header">
        <h1>Buffers & Binary Data</h1>
        <p className="page-description">
          Work with raw binary data in Node.js. Understand memory allocation, encoding/decoding, 
          and efficient data manipulation techniques.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Buffer Operations</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Creating Buffers</span>
          </div>
          <div className="code-content">
            <pre>{`// Different ways to create buffers
const buf1 = Buffer.alloc(10); // 10 bytes, initialized to 0
const buf2 = Buffer.allocUnsafe(10); // 10 bytes, uninitialized (faster)
const buf3 = Buffer.from('Hello World', 'utf8');
const buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);

// Convert between strings and buffers
const str = buf3.toString('utf8');
const hex = buf3.toString('hex');
const base64 = buf3.toString('base64');`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Buffer Manipulation</span>
          </div>
          <div className="code-content">
            <pre>{`// Reading and writing data
const buf = Buffer.alloc(8);

// Write different data types
buf.writeUInt32BE(0x12345678, 0); // Big-endian 32-bit int at offset 0
buf.writeFloatLE(3.14159, 4); // Little-endian float at offset 4

// Read data back
const int32 = buf.readUInt32BE(0);
const float = buf.readFloatLE(4);

// Slice and copy operations
const slice = buf.slice(0, 4); // Creates a view, not a copy
const copy = Buffer.from(buf); // Creates an actual copy`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Encoding Types</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            {['utf8', 'hex', 'base64', 'latin1'].map(enc => (
              <button
                key={enc}
                className={`demo-button ${encoding === enc ? 'active' : ''}`}
                onClick={() => setEncoding(enc)}
              >
                {enc.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div className="code-container">
              <div className="code-header">
                <span className="code-title">{encoding.toUpperCase()} Encoding Example</span>
              </div>
              <div className="code-content">
                <pre>{`const text = 'Hello Node.js 🚀';
const buffer = Buffer.from(text, 'utf8');

// Encode to ${encoding}
const encoded = buffer.toString('${encoding}');
console.log('Encoded:', encoded);
// Output: ${Buffer.from('Hello Node.js 🚀', 'utf8').toString(encoding as BufferEncoding).slice(0, 50)}...

// Decode back to UTF-8
const decoded = Buffer.from(encoded, '${encoding}').toString('utf8');
console.log('Decoded:', decoded);`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Performance Tips</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Buffer Pooling</h3>
            <p>
              Node.js maintains a pool for small buffers (&lt; 4KB). Use Buffer.allocUnsafe() 
              for better performance when security isn't critical.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Avoid Concatenation</h3>
            <p>
              Use Buffer.concat() instead of repeated concatenation. Pre-allocate when 
              size is known for better performance.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Memory Management</h3>
            <p>
              Buffers are allocated outside V8 heap. Monitor RSS memory usage. Clear 
              references to allow garbage collection.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BuffersPage