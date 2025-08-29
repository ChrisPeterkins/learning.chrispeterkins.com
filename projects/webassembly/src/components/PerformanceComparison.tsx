import React, { useState, useEffect } from 'react';

interface BenchmarkResult {
  name: string;
  jsTime: number;
  wasmTime: number;
  speedup: number;
}

const PerformanceComparison: React.FC = () => {
  const [iterations, setIterations] = useState(1000000);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [wasmModule, setWasmModule] = useState<any>(null);

  useEffect(() => {
    loadWasmModule();
  }, []);

  const loadWasmModule = async () => {
    try {
      const response = await fetch('/projects/webassembly/wasm/performance.wasm');
      const bytes = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(bytes);
      setWasmModule(module.instance.exports);
    } catch (error) {
      console.error('Failed to load WASM module:', error);
    }
  };

  const runBenchmarks = async () => {
    setRunning(true);
    const benchmarkResults: BenchmarkResult[] = [];

    // Fibonacci Benchmark
    const fibJS = (n: number): number => {
      if (n <= 1) return n;
      return fibJS(n - 1) + fibJS(n - 2);
    };

    const jsFibStart = performance.now();
    for (let i = 0; i < iterations / 1000; i++) {
      fibJS(20);
    }
    const jsFibTime = performance.now() - jsFibStart;

    const wasmFibStart = performance.now();
    if (wasmModule) {
      for (let i = 0; i < iterations / 1000; i++) {
        wasmModule.fibonacci(20);
      }
    }
    const wasmFibTime = performance.now() - wasmFibStart;

    benchmarkResults.push({
      name: 'Fibonacci (n=20)',
      jsTime: jsFibTime,
      wasmTime: wasmFibTime,
      speedup: jsFibTime / wasmFibTime
    });

    // Prime Number Check Benchmark
    const isPrimeJS = (n: number): boolean => {
      if (n <= 1) return false;
      for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    const jsPrimeStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      isPrimeJS(97);
    }
    const jsPrimeTime = performance.now() - jsPrimeStart;

    const wasmPrimeStart = performance.now();
    if (wasmModule) {
      for (let i = 0; i < iterations; i++) {
        wasmModule.is_prime(97);
      }
    }
    const wasmPrimeTime = performance.now() - wasmPrimeStart;

    benchmarkResults.push({
      name: 'Prime Check',
      jsTime: jsPrimeTime,
      wasmTime: wasmPrimeTime,
      speedup: jsPrimeTime / wasmPrimeTime
    });

    // Matrix Multiplication Benchmark
    const matrixMultiplyJS = (size: number) => {
      const a = Array(size).fill(0).map(() => Array(size).fill(1));
      const b = Array(size).fill(0).map(() => Array(size).fill(2));
      const result = Array(size).fill(0).map(() => Array(size).fill(0));
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          for (let k = 0; k < size; k++) {
            result[i][j] += a[i][k] * b[k][j];
          }
        }
      }
      return result;
    };

    const jsMatrixStart = performance.now();
    for (let i = 0; i < 100; i++) {
      matrixMultiplyJS(10);
    }
    const jsMatrixTime = performance.now() - jsMatrixStart;

    const wasmMatrixStart = performance.now();
    if (wasmModule) {
      for (let i = 0; i < 100; i++) {
        wasmModule.matrix_multiply(10);
      }
    }
    const wasmMatrixTime = performance.now() - wasmMatrixStart;

    benchmarkResults.push({
      name: 'Matrix Multiply (10x10)',
      jsTime: jsMatrixTime,
      wasmTime: wasmMatrixTime,
      speedup: jsMatrixTime / wasmMatrixTime
    });

    setResults(benchmarkResults);
    setRunning(false);
  };

  const getBarWidth = (speedup: number) => {
    const maxSpeedup = Math.max(...results.map(r => r.speedup), 1);
    return `${(speedup / maxSpeedup) * 100}%`;
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Performance Comparison</h2>
        <p className="demo-description">
          Compare the performance of JavaScript vs WebAssembly for compute-intensive operations.
          WebAssembly typically shows significant speedups for numerical computations.
        </p>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label className="control-label">Iterations:</label>
          <input
            type="number"
            className="control-input"
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            min="1000"
            max="10000000"
            step="1000"
          />
        </div>
        <button 
          className="btn"
          onClick={runBenchmarks}
          disabled={running || !wasmModule}
        >
          {running ? 'Running...' : 'Run Benchmarks'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Benchmark Results</h3>
          <div className="benchmark-results">
            {results.map((result, index) => (
              <div key={index}>
                <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{result.name}</h4>
                <div className="benchmark-item">
                  <span className="benchmark-label">JavaScript</span>
                  <div className="benchmark-bar">
                    <div className="benchmark-fill" style={{ width: '100%' }}></div>
                  </div>
                  <span className="benchmark-value">{result.jsTime.toFixed(2)}ms</span>
                </div>
                <div className="benchmark-item">
                  <span className="benchmark-label">WebAssembly</span>
                  <div className="benchmark-bar">
                    <div 
                      className="benchmark-fill" 
                      style={{ 
                        width: `${(result.wasmTime / result.jsTime) * 100}%`,
                        background: 'linear-gradient(90deg, #10b981, #059669)'
                      }}
                    ></div>
                  </div>
                  <span className="benchmark-value">{result.wasmTime.toFixed(2)}ms</span>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '0.5rem', 
                  color: '#10b981',
                  fontWeight: 'bold'
                }}>
                  {result.speedup.toFixed(2)}x faster
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="code-block">
        <pre>{`// JavaScript Implementation
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Rust/WebAssembly Implementation
#[no_mangle]
pub extern "C" fn fibonacci(n: i32) -> i32 {
    if n <= 1 { n } else { fibonacci(n - 1) + fibonacci(n - 2) }
}`}</pre>
      </div>
    </div>
  );
};

export default PerformanceComparison;