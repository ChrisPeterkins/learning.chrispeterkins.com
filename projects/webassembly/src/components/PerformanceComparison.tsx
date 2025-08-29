import React, { useState, useEffect } from 'react';
import { Play, Zap, Activity, Timer } from 'lucide-react';
import { WasmCompiler, jsImplementations } from '../wasm/wasm-compiler';

interface BenchmarkResult {
  name: string;
  jsTime: number;
  wasmTime: number;
  speedup: number;
  iterations: number;
}

const PerformanceComparison: React.FC = () => {
  const [iterations, setIterations] = useState(100000);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadWasmModule();
  }, []);

  const loadWasmModule = async () => {
    try {
      const wasm = await WasmCompiler.compile('algorithms');
      setWasmModule(wasm.exports);
    } catch (error) {
      console.error('Failed to load WASM module:', error);
    }
  };

  const runBenchmarks = async () => {
    if (!wasmModule) {
      await loadWasmModule();
      if (!wasmModule) return;
    }

    setRunning(true);
    setProgress(0);
    const benchmarkResults: BenchmarkResult[] = [];

    // Benchmark 1: Fibonacci
    setProgress(20);
    const fibN = 20;
    const fibIterations = Math.min(iterations / 100, 1000);
    
    const jsFibStart = performance.now();
    for (let i = 0; i < fibIterations; i++) {
      jsImplementations.fibonacci(fibN);
    }
    const jsFibTime = performance.now() - jsFibStart;

    const wasmFibStart = performance.now();
    for (let i = 0; i < fibIterations; i++) {
      wasmModule.fibonacci(fibN);
    }
    const wasmFibTime = performance.now() - wasmFibStart;

    benchmarkResults.push({
      name: `Fibonacci (n=${fibN})`,
      jsTime: jsFibTime,
      wasmTime: wasmFibTime,
      speedup: jsFibTime / wasmFibTime,
      iterations: fibIterations
    });

    // Benchmark 2: Prime Number Check
    setProgress(40);
    const primeN = 97;
    
    const jsPrimeStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      jsImplementations.isPrime(primeN);
    }
    const jsPrimeTime = performance.now() - jsPrimeStart;

    const wasmPrimeStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      wasmModule.isPrime(primeN);
    }
    const wasmPrimeTime = performance.now() - wasmPrimeStart;

    benchmarkResults.push({
      name: `Prime Check (n=${primeN})`,
      jsTime: jsPrimeTime,
      wasmTime: wasmPrimeTime,
      speedup: jsPrimeTime / wasmPrimeTime,
      iterations
    });

    // Benchmark 3: Factorial
    setProgress(60);
    const factN = 15;
    
    const jsFactStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      jsImplementations.factorial(factN);
    }
    const jsFactTime = performance.now() - jsFactStart;

    const wasmFactStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      wasmModule.factorial(factN);
    }
    const wasmFactTime = performance.now() - wasmFactStart;

    benchmarkResults.push({
      name: `Factorial (n=${factN})`,
      jsTime: jsFactTime,
      wasmTime: wasmFactTime,
      speedup: jsFactTime / wasmFactTime,
      iterations
    });

    // Benchmark 4: Matrix Operations
    setProgress(80);
    const matrixSize = 10;
    const matrixIterations = Math.min(iterations / 100, 1000);
    
    const jsMatrixStart = performance.now();
    for (let i = 0; i < matrixIterations; i++) {
      jsImplementations.matrixMultiply(matrixSize);
    }
    const jsMatrixTime = performance.now() - jsMatrixStart;

    const wasmMatrixStart = performance.now();
    for (let i = 0; i < matrixIterations; i++) {
      wasmModule.matrixMultiply(matrixSize);
    }
    const wasmMatrixTime = performance.now() - wasmMatrixStart;

    benchmarkResults.push({
      name: `Matrix Multiply (${matrixSize}x${matrixSize})`,
      jsTime: jsMatrixTime,
      wasmTime: wasmMatrixTime,
      speedup: jsMatrixTime / wasmMatrixTime,
      iterations: matrixIterations
    });

    setProgress(100);
    setResults(benchmarkResults);
    setRunning(false);
  };

  const getSpeedupColor = (speedup: number) => {
    if (speedup > 2) return '#10b981';
    if (speedup > 1.5) return '#34d399';
    if (speedup > 1) return '#86efac';
    return '#fbbf24';
  };

  const getSpeedupLabel = (speedup: number) => {
    if (speedup > 1) {
      return `${speedup.toFixed(2)}x faster`;
    } else if (speedup === 1) {
      return 'Same speed';
    } else {
      return `${(1 / speedup).toFixed(2)}x slower`;
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Performance Comparison</h2>
        <p className="demo-description">
          Compare the performance of JavaScript vs WebAssembly for compute-intensive operations.
          WebAssembly provides near-native performance for numerical computations.
        </p>
      </div>

      <div className="wasm-features">
        <div className="feature-card">
          <Zap className="feature-icon" />
          <h3>Near-Native Speed</h3>
          <p>WebAssembly runs at near-native speed by taking advantage of common hardware capabilities.</p>
        </div>
        <div className="feature-card">
          <Activity className="feature-icon" />
          <h3>Low-Level Control</h3>
          <p>Direct memory management and predictable performance characteristics.</p>
        </div>
        <div className="feature-card">
          <Timer className="feature-icon" />
          <h3>Parallel Execution</h3>
          <p>Can run alongside JavaScript without blocking the main thread.</p>
        </div>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label className="control-label">Iterations:</label>
          <input
            type="number"
            className="control-input"
            value={iterations}
            onChange={(e) => setIterations(Math.max(1000, Math.min(10000000, Number(e.target.value))))}
            min="1000"
            max="10000000"
            step="1000"
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={runBenchmarks}
          disabled={running || !wasmModule}
        >
          <Play size={16} />
          {running ? 'Running...' : 'Run Benchmarks'}
        </button>
        {!wasmModule && (
          <span className="wasm-loading">Loading WASM module...</span>
        )}
      </div>

      {running && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="results-section">
          <h3>Benchmark Results</h3>
          <div className="benchmark-results">
            {results.map((result, index) => (
              <div key={index} className="benchmark-card">
                <h4>{result.name}</h4>
                <p className="benchmark-iterations">{result.iterations.toLocaleString()} iterations</p>
                
                <div className="benchmark-comparison">
                  <div className="benchmark-item">
                    <span className="benchmark-label">JavaScript</span>
                    <div className="benchmark-bar">
                      <div 
                        className="benchmark-fill js-fill" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="benchmark-value">{result.jsTime.toFixed(2)}ms</span>
                  </div>
                  
                  <div className="benchmark-item">
                    <span className="benchmark-label">WebAssembly</span>
                    <div className="benchmark-bar">
                      <div 
                        className="benchmark-fill wasm-fill" 
                        style={{ 
                          width: `${Math.min(100, (result.wasmTime / result.jsTime) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="benchmark-value">{result.wasmTime.toFixed(2)}ms</span>
                  </div>
                </div>
                
                <div className="speedup-indicator" style={{ color: getSpeedupColor(result.speedup) }}>
                  {getSpeedupLabel(result.speedup)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="code-examples">
        <h3>Implementation Examples</h3>
        <div className="code-tabs">
          <div className="code-tab">
            <h4>JavaScript</h4>
            <pre className="code-block">{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function isPrime(n) {
  if (n <= 1) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}`}</pre>
          </div>
          <div className="code-tab">
            <h4>WebAssembly (WAT)</h4>
            <pre className="code-block">{`(func $fibonacci (export "fibonacci") 
  (param $n i32) (result i32)
  (if (result i32)
    (i32.le_s (local.get $n) (i32.const 1))
    (then (local.get $n))
    (else
      (i32.add
        (call $fibonacci 
          (i32.sub (local.get $n) (i32.const 1)))
        (call $fibonacci 
          (i32.sub (local.get $n) (i32.const 2)))
      )
    )
  )
)`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceComparison;