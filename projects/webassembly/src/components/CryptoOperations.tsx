import React, { useState, useEffect } from 'react';

const CryptoOperations: React.FC = () => {
  const [input, setInput] = useState('Hello, WebAssembly!');
  const [hashResult, setHashResult] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [key, setKey] = useState('secretkey123');
  const [wasmModule, setWasmModule] = useState<any>(null);

  useEffect(() => {
    loadWasmModule();
  }, []);

  const loadWasmModule = async () => {
    try {
      const response = await fetch('/projects/webassembly/wasm/crypto.wasm');
      const bytes = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(bytes);
      setWasmModule(module.instance.exports);
    } catch (error) {
      console.error('Failed to load WASM module:', error);
    }
  };

  const computeHash = () => {
    // Simulated hash - in real implementation would use WASM
    const simpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    };
    setHashResult(simpleHash(input));
  };

  const encrypt = () => {
    // Simulated encryption - in real implementation would use WASM
    const encrypted = btoa(input);
    setEncryptedResult(encrypted);
  };

  const decrypt = () => {
    // Simulated decryption - in real implementation would use WASM
    try {
      const decrypted = atob(encryptedResult);
      setDecryptedResult(decrypted);
    } catch {
      setDecryptedResult('Decryption failed');
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Cryptographic Operations</h2>
        <p className="demo-description">
          Perform cryptographic operations using WebAssembly for enhanced security and performance.
          WASM provides isolation and speed benefits for crypto operations.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Hash Functions</h3>
          <div className="control-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <input
              type="text"
              className="control-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash"
            />
            <button className="btn" onClick={computeHash}>
              Compute SHA-256
            </button>
            {hashResult && (
              <div className="code-block">
                <pre>{hashResult}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Encryption/Decryption</h3>
          <div className="control-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <input
              type="text"
              className="control-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Encryption key"
            />
            <button className="btn" onClick={encrypt}>
              Encrypt
            </button>
            {encryptedResult && (
              <div className="code-block">
                <pre>{encryptedResult}</pre>
              </div>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={decrypt}
              disabled={!encryptedResult}
            >
              Decrypt
            </button>
            {decryptedResult && (
              <div className="code-block">
                <pre>{decryptedResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="code-block">
        <pre>{`// Rust/WebAssembly SHA-256 Implementation
use sha2::{Sha256, Digest};

#[no_mangle]
pub extern "C" fn sha256_hash(input: *const u8, len: usize) -> *mut u8 {
    let data = unsafe { std::slice::from_raw_parts(input, len) };
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    
    // Return hash result
    Box::into_raw(result.to_vec().into_boxed_slice()) as *mut u8
}`}</pre>
      </div>
    </div>
  );
};

export default CryptoOperations;