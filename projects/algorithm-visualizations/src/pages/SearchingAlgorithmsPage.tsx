import React, { useState, useCallback } from 'react'

type SearchingAlgorithm = 'linear' | 'binary' | 'jump';

const SearchingAlgorithmsPage: React.FC = () => {
  const [array] = useState<number[]>([2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78, 89, 92]);
  const [target, setTarget] = useState(23);
  const [algorithm, setAlgorithm] = useState<SearchingAlgorithm>('binary');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [foundIndex, setFoundIndex] = useState<number>(-1);
  const [comparisons, setComparisons] = useState<number>(0);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const linearSearch = useCallback(async () => {
    setIsRunning(true);
    setFoundIndex(-1);
    setComparisons(0);
    let comps = 0;

    for (let i = 0; i < array.length; i++) {
      setCurrentIndex(i);
      comps++;
      setComparisons(comps);
      setCurrentStep(`Checking index ${i}: ${array[i]} ${array[i] === target ? '=' : '≠'} ${target}`);
      
      await delay(500);
      
      if (array[i] === target) {
        setFoundIndex(i);
        setCurrentStep(`Found ${target} at index ${i} after ${comps} comparisons!`);
        break;
      }
    }
    
    if (foundIndex === -1 && array[currentIndex] !== target) {
      setCurrentStep(`${target} not found in array after ${comps} comparisons.`);
    }
    
    setCurrentIndex(-1);
    setIsRunning(false);
  }, [array, target, currentIndex, foundIndex]);

  const binarySearch = useCallback(async () => {
    setIsRunning(true);
    setFoundIndex(-1);
    setComparisons(0);
    let comps = 0;
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setCurrentIndex(mid);
      comps++;
      setComparisons(comps);
      setCurrentStep(`Checking middle index ${mid}: ${array[mid]} ${array[mid] === target ? '=' : array[mid] < target ? '<' : '>'} ${target}`);
      
      await delay(700);
      
      if (array[mid] === target) {
        setFoundIndex(mid);
        setCurrentStep(`Found ${target} at index ${mid} after ${comps} comparisons!`);
        break;
      } else if (array[mid] < target) {
        left = mid + 1;
        setCurrentStep(`${array[mid]} < ${target}, searching right half`);
      } else {
        right = mid - 1;
        setCurrentStep(`${array[mid]} > ${target}, searching left half`);
      }
      await delay(300);
    }
    
    if (left > right) {
      setCurrentStep(`${target} not found in array after ${comps} comparisons.`);
    }
    
    setCurrentIndex(-1);
    setIsRunning(false);
  }, [array, target]);

  const jumpSearch = useCallback(async () => {
    setIsRunning(true);
    setFoundIndex(-1);
    setComparisons(0);
    let comps = 0;
    const jumpSize = Math.floor(Math.sqrt(array.length));
    let prev = 0;

    // Jump to find the block
    while (array[Math.min(jumpSize, array.length) - 1] < target) {
      setCurrentIndex(Math.min(jumpSize, array.length) - 1);
      comps++;
      setComparisons(comps);
      setCurrentStep(`Jumping to index ${Math.min(jumpSize, array.length) - 1}: ${array[Math.min(jumpSize, array.length) - 1]} < ${target}`);
      
      await delay(600);
      
      prev = jumpSize;
      jumpSize += Math.floor(Math.sqrt(array.length));
      if (prev >= array.length) {
        setCurrentStep(`${target} not found in array after ${comps} comparisons.`);
        setCurrentIndex(-1);
        setIsRunning(false);
        return;
      }
    }

    // Linear search in the identified block
    setCurrentStep(`Linear search from index ${prev}`);
    await delay(400);
    
    while (array[prev] < target) {
      setCurrentIndex(prev);
      comps++;
      setComparisons(comps);
      setCurrentStep(`Checking index ${prev}: ${array[prev]} ${array[prev] === target ? '=' : '<'} ${target}`);
      
      await delay(500);
      
      prev++;
      if (prev === Math.min(jumpSize, array.length)) {
        setCurrentStep(`${target} not found in array after ${comps} comparisons.`);
        setCurrentIndex(-1);
        setIsRunning(false);
        return;
      }
    }

    if (array[prev] === target) {
      setFoundIndex(prev);
      setCurrentStep(`Found ${target} at index ${prev} after ${comps} comparisons!`);
    } else {
      setCurrentStep(`${target} not found in array after ${comps} comparisons.`);
    }
    
    setCurrentIndex(-1);
    setIsRunning(false);
  }, [array, target]);

  const startSearch = useCallback(() => {
    setFoundIndex(-1);
    setComparisons(0);
    
    switch(algorithm) {
      case 'linear':
        linearSearch();
        break;
      case 'binary':
        binarySearch();
        break;
      case 'jump':
        jumpSearch();
        break;
    }
  }, [algorithm, linearSearch, binarySearch, jumpSearch]);

  const algorithmInfo = {
    linear: {
      name: 'Linear Search',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description: 'Searches sequentially through each element until the target is found.',
    },
    binary: {
      name: 'Binary Search',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description: 'Efficiently searches sorted arrays by repeatedly dividing the search interval in half.',
    },
    jump: {
      name: 'Jump Search',
      timeComplexity: 'O(√n)',
      spaceComplexity: 'O(1)',
      description: 'Jumps ahead by fixed steps, then performs linear search in the identified block.',
    }
  };

  return (
    <div className="searching-algorithms-page">
      <header className="page-header">
        <h1>Searching Algorithms</h1>
        <p className="page-description">
          Learn how different searching algorithms find elements in arrays.
          Compare linear search, binary search, and jump search performance.
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
            <div className="complexity-label">Time Complexity</div>
            <div className="complexity-value">{algorithmInfo[algorithm].timeComplexity}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Space Complexity</div>
            <div className="complexity-value">{algorithmInfo[algorithm].spaceComplexity}</div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="control-panel">
          <div className="control-group">
            <label className="control-label">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as SearchingAlgorithm)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="linear">Linear Search</option>
              <option value="binary">Binary Search</option>
              <option value="jump">Jump Search</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Target Value</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              disabled={isRunning}
              className="demo-button"
              style={{ width: '80px' }}
            />
          </div>

          <button
            className="action-button"
            onClick={startSearch}
            disabled={isRunning}
          >
            {isRunning ? 'Searching...' : 'Start Search'}
          </button>

          {comparisons > 0 && (
            <div style={{ marginTop: '1rem', color: 'var(--accent-green-bright)' }}>
              Comparisons: {comparisons}
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--code-bg)',
          padding: '2rem',
          border: '1px solid var(--code-border)',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {array.map((value, index) => (
              <div
                key={index}
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: foundIndex === index ? 'var(--accent-green-bright)' : 
                               currentIndex === index ? 'var(--accent-yellow)' : 
                               'var(--code-border)',
                  backgroundColor: foundIndex === index ? 'rgba(34, 197, 94, 0.1)' :
                                  currentIndex === index ? 'rgba(250, 204, 21, 0.1)' :
                                  'transparent',
                  borderRadius: '4px',
                  color: foundIndex === index ? 'var(--accent-green-bright)' :
                        currentIndex === index ? 'var(--accent-yellow)' :
                        'var(--text-primary)',
                  fontWeight: foundIndex === index || currentIndex === index ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {value}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
              Target: {target}
            </p>
            {currentStep && (
              <p style={{ color: 'var(--text-primary)', marginTop: '1rem' }}>
                {currentStep}
              </p>
            )}
          </div>
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Search Algorithm Comparison</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Linear Search</h3>
            <p>
              <strong>Best for:</strong> Unsorted data, small datasets<br/>
              <strong>Time:</strong> O(n) - checks every element<br/>
              <strong>Space:</strong> O(1) - no extra space needed
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Binary Search</h3>
            <p>
              <strong>Best for:</strong> Sorted data, large datasets<br/>
              <strong>Time:</strong> O(log n) - divides search space in half<br/>
              <strong>Space:</strong> O(1) iterative, O(log n) recursive
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Jump Search</h3>
            <p>
              <strong>Best for:</strong> Sorted data, when binary search overhead is high<br/>
              <strong>Time:</strong> O(√n) - optimal jump size is √n<br/>
              <strong>Space:</strong> O(1) - no extra space needed
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchingAlgorithmsPage;