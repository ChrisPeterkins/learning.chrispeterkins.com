import React, { useState, useCallback } from 'react'
import SortingVisualizer from '../visualizers/SortingVisualizer'
import { bubbleSort, quickSort, mergeSort, heapSort, generateRandomArray, SortStep } from '../algorithms/sorting'

type SortingAlgorithm = 'bubble' | 'quick' | 'merge' | 'heap';
type Speed = 'slow' | 'medium' | 'fast';

const SortingAlgorithmsPage: React.FC = () => {
  const [array, setArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 88, 5, 77, 30, 42, 55]);
  const [originalArray, setOriginalArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 88, 5, 77, 30, 42, 55]);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [isRunning, setIsRunning] = useState(false);
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [swappingIndices, setSwappingIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [speed, setSpeed] = useState<Speed>('medium');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [steps, setSteps] = useState<string[]>([]);
  const [arraySize, setArraySize] = useState(13);

  const speedDelays = {
    slow: 1000,
    medium: 500,
    fast: 200
  };

  const algorithmInfo = {
    bubble: {
      name: 'Bubble Sort',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      bestCase: 'O(n)',
      worstCase: 'O(n²)'
    },
    quick: {
      name: 'Quick Sort',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)',
      description: 'Divides the array around a pivot element and recursively sorts the partitions.',
      bestCase: 'O(n log n)',
      worstCase: 'O(n²)'
    },
    merge: {
      name: 'Merge Sort',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description: 'Divides the array into halves, sorts them recursively, then merges the sorted halves.',
      bestCase: 'O(n log n)',
      worstCase: 'O(n log n)'
    },
    heap: {
      name: 'Heap Sort',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description: 'Builds a max heap from the array, then repeatedly extracts the maximum element.',
      bestCase: 'O(n log n)',
      worstCase: 'O(n log n)'
    }
  };

  const handleStep = useCallback(async (step: SortStep, currentArray: number[]) => {
    setArray([...currentArray]);
    setCurrentStep(step.message);
    setSteps(prev => [...prev, step.message]);

    // Update visual indicators based on step type
    switch (step.type) {
      case 'compare':
        setComparingIndices(step.indices);
        setSwappingIndices([]);
        break;
      case 'swap':
        setSwappingIndices(step.indices);
        setComparingIndices([]);
        break;
      case 'complete':
        setSortedIndices(step.indices);
        setComparingIndices([]);
        setSwappingIndices([]);
        break;
      default:
        setComparingIndices([]);
        setSwappingIndices([]);
    }

    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, speedDelays[speed]));
  }, [speed]);

  const runSortingAlgorithm = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setSteps([]);
    setSortedIndices([]);
    setComparingIndices([]);
    setSwappingIndices([]);
    setCurrentStep('Starting sorting algorithm...');

    try {
      let sortedArray: number[] = [];

      switch (algorithm) {
        case 'bubble':
          sortedArray = await bubbleSort([...array], handleStep);
          break;
        case 'quick':
          sortedArray = await quickSort([...array], handleStep);
          break;
        case 'merge':
          sortedArray = await mergeSort([...array], handleStep);
          break;
        case 'heap':
          sortedArray = await heapSort([...array], handleStep);
          break;
      }

      setArray(sortedArray);
      setCurrentStep('Sorting completed!');
    } catch (error) {
      console.error('Error during sorting:', error);
      setCurrentStep('Error occurred during sorting');
    } finally {
      setIsRunning(false);
    }
  };

  const resetArray = () => {
    if (isRunning) return;
    setArray([...originalArray]);
    setSortedIndices([]);
    setComparingIndices([]);
    setSwappingIndices([]);
    setCurrentStep('');
    setSteps([]);
  };

  const generateNewArray = () => {
    if (isRunning) return;
    const newArray = generateRandomArray(arraySize, 5, 95);
    setArray(newArray);
    setOriginalArray([...newArray]);
    setSortedIndices([]);
    setComparingIndices([]);
    setSwappingIndices([]);
    setCurrentStep('');
    setSteps([]);
  };

  return (
    <div className="sorting-algorithms-page">
      <header className="page-header">
        <h1>Sorting Algorithms</h1>
        <p className="page-description">
          Compare different sorting algorithms and see how they work step-by-step. 
          Watch as elements are compared and swapped to achieve sorted order.
        </p>
      </header>

      <div className="algorithm-info">
        <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
          {algorithmInfo[algorithm].name}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {algorithmInfo[algorithm].description}
        </p>
        
        <div className="complexity-info">
          <div className="complexity-item">
            <div className="complexity-label">Average Time</div>
            <div className="complexity-value">{algorithmInfo[algorithm].timeComplexity}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Space</div>
            <div className="complexity-value">{algorithmInfo[algorithm].spaceComplexity}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Best Case</div>
            <div className="complexity-value">{algorithmInfo[algorithm].bestCase}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Worst Case</div>
            <div className="complexity-value">{algorithmInfo[algorithm].worstCase}</div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="control-panel">
          <div className="control-group">
            <label className="control-label">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as SortingAlgorithm)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="bubble">Bubble Sort</option>
              <option value="quick">Quick Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="heap">Heap Sort</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Speed</label>
            <div className="speed-control">
              {(['slow', 'medium', 'fast'] as Speed[]).map(s => (
                <button
                  key={s}
                  className={`speed-button ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                  disabled={isRunning}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Array Size</label>
            <input
              type="range"
              min="5"
              max="20"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isRunning}
              style={{ marginRight: '10px' }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{arraySize}</span>
          </div>

          <div className="control-group">
            <button
              className="action-button"
              onClick={runSortingAlgorithm}
              disabled={isRunning}
            >
              {isRunning ? 'Sorting...' : 'Start Sort'}
            </button>
            <button
              className="demo-button"
              onClick={resetArray}
              disabled={isRunning}
            >
              Reset
            </button>
            <button
              className="demo-button"
              onClick={generateNewArray}
              disabled={isRunning}
            >
              New Array
            </button>
          </div>
        </div>

        <SortingVisualizer
          array={array}
          comparingIndices={comparingIndices}
          swappingIndices={swappingIndices}
          sortedIndices={sortedIndices}
        />

        {currentStep && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'var(--code-bg)',
            border: '1px solid var(--code-border)',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--accent-green-bright)'
          }}>
            {currentStep}
          </div>
        )}
      </div>

      {steps.length > 0 && (
        <div className="steps-container">
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Algorithm Steps ({steps.length} operations)
          </h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {steps.slice(-10).map((step, index) => (
              <div key={index} className="step-item">
                {steps.length - 10 + index + 1}: {step}
              </div>
            ))}
            {steps.length > 10 && (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ... showing last 10 of {steps.length} steps
              </div>
            )}
          </div>
        </div>
      )}

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Sorting Algorithm Comparison</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Bubble Sort</h3>
            <p>
              <strong>Pros:</strong> Simple to understand and implement, stable sort.<br/>
              <strong>Cons:</strong> Inefficient for large datasets, O(n²) time complexity.<br/>
              <strong>Use when:</strong> Learning algorithms or very small datasets.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Quick Sort</h3>
            <p>
              <strong>Pros:</strong> Fast average case, in-place sorting, cache efficient.<br/>
              <strong>Cons:</strong> Worst case O(n²), not stable, recursive depth.<br/>
              <strong>Use when:</strong> General purpose sorting, performance matters.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Merge Sort</h3>
            <p>
              <strong>Pros:</strong> Guaranteed O(n log n), stable sort, predictable.<br/>
              <strong>Cons:</strong> Requires O(n) extra space, not in-place.<br/>
              <strong>Use when:</strong> Stability required, worst-case performance matters.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Heap Sort</h3>
            <p>
              <strong>Pros:</strong> Guaranteed O(n log n), in-place sorting, no recursion.<br/>
              <strong>Cons:</strong> Not stable, poor cache performance, complex to implement.<br/>
              <strong>Use when:</strong> Memory is limited, consistent performance needed.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Key Concepts</h2>
        
        <div className="demo-container">
          <div className="concept-grid">
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Stability
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                A stable sort preserves the relative order of equal elements. This is important 
                when sorting objects by multiple criteria.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                In-Place Sorting
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                An in-place algorithm uses only O(1) extra memory space. This is important 
                for large datasets where memory is limited.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Adaptive Algorithms
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Some algorithms perform better on partially sorted data. Bubble sort, for 
                example, can terminate early if no swaps are made.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Divide & Conquer
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Algorithms like merge sort and quick sort use divide and conquer strategy, 
                breaking the problem into smaller subproblems.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SortingAlgorithmsPage;