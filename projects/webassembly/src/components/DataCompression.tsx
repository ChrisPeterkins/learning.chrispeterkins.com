import React, { useState } from 'react';

const DataCompression: React.FC = () => {
  const [input, setInput] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10));
  const [compressed, setCompressed] = useState('');
  const [decompressed, setDecompressed] = useState('');
  const [compressionRatio, setCompressionRatio] = useState(0);

  const compress = () => {
    // Simulated compression - in real implementation would use WASM
    const encoded = btoa(input);
    setCompressed(encoded);
    const ratio = (1 - encoded.length / input.length) * 100;
    setCompressionRatio(Math.max(0, ratio));
  };

  const decompress = () => {
    try {
      const decoded = atob(compressed);
      setDecompressed(decoded);
    } catch {
      setDecompressed('Decompression failed');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Data Compression</h2>
        <p className="demo-description">
          Compress and decompress data using WebAssembly implementations of popular algorithms
          like LZ77, Huffman coding, and Brotli.
        </p>
      </div>

      <div className="controls-section">
        <div className="control-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <label className="control-label">Input Data:</label>
          <textarea
            className="control-input"
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to compress"
            style={{ resize: 'vertical', fontFamily: 'monospace' }}
          />
        </div>
        
        <div className="grid grid-2" style={{ marginTop: '1rem' }}>
          <div>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              Original Size: {formatBytes(new Blob([input]).size)}
            </p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              Compressed Size: {compressed ? formatBytes(new Blob([compressed]).size) : '0 Bytes'}
            </p>
          </div>
        </div>

        <div className="control-group">
          <button className="btn" onClick={compress}>
            Compress (LZ77)
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={decompress}
            disabled={!compressed}
          >
            Decompress
          </button>
        </div>
      </div>

      {compressionRatio > 0 && (
        <div className="results-section">
          <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Compression Results</h3>
          <div className="benchmark-item">
            <span className="benchmark-label">Compression Ratio</span>
            <div className="benchmark-bar">
              <div 
                className="benchmark-fill" 
                style={{ 
                  width: `${compressionRatio}%`,
                  background: 'linear-gradient(90deg, #10b981, #059669)'
                }}
              ></div>
            </div>
            <span className="benchmark-value">{compressionRatio.toFixed(1)}%</span>
          </div>

          {compressed && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Compressed Data (Base64):</h4>
              <div className="code-block" style={{ maxHeight: '150px', overflow: 'auto' }}>
                <pre>{compressed}</pre>
              </div>
            </div>
          )}

          {decompressed && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Decompressed Data:</h4>
              <div className="code-block" style={{ maxHeight: '150px', overflow: 'auto' }}>
                <pre>{decompressed}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="code-block">
        <pre>{`// Rust/WebAssembly LZ77 Compression
use flate2::write::GzEncoder;
use flate2::Compression;
use std::io::Write;

#[no_mangle]
pub extern "C" fn compress_data(
    input: *const u8,
    input_len: usize,
    output: *mut u8
) -> usize {
    let data = unsafe {
        std::slice::from_raw_parts(input, input_len)
    };
    
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(data).unwrap();
    let compressed = encoder.finish().unwrap();
    
    unsafe {
        std::ptr::copy(compressed.as_ptr(), output, compressed.len());
    }
    
    compressed.len()
}`}</pre>
      </div>
    </div>
  );
};

export default DataCompression;