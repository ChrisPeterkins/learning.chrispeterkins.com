import React, { useState, useEffect } from 'react';
import { TestRunner, TestResult } from '../testing/TestRunner';
import { mathUtils, stringUtils, arrayUtils, createUnitTestSuite } from '../testing/testExamples';

const UnitTestingPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExample, setSelectedExample] = useState('math');
  const testRunner = new TestRunner();

  useEffect(() => {
    testRunner.onResultsUpdate(setTestResults);
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    testRunner.clear();
    createUnitTestSuite(testRunner);
    await testRunner.runTests();
    setIsRunning(false);
  };

  const runSingleTest = async (category: string) => {
    setIsRunning(true);
    testRunner.clear();
    
    if (category === 'math') {
      testRunner.describe('Math Utils', () => {
        testRunner.it('should add two numbers correctly', () => {
          if (mathUtils.add(2, 3) !== 5) throw new Error('Expected 5');
          if (mathUtils.add(-1, 1) !== 0) throw new Error('Expected 0');
        });
        
        testRunner.it('should handle division by zero', () => {
          try {
            mathUtils.divide(5, 0);
            throw new Error('Should have thrown an error');
          } catch (error) {
            if ((error as Error).message !== 'Division by zero') {
              throw new Error('Wrong error message');
            }
          }
        });
      });
    } else if (category === 'string') {
      testRunner.describe('String Utils', () => {
        testRunner.it('should reverse strings correctly', () => {
          if (stringUtils.reverse('hello') !== 'olleh') throw new Error('Expected olleh');
        });
        
        testRunner.it('should detect palindromes', () => {
          if (!stringUtils.isPalindrome('racecar')) throw new Error('Should detect palindrome');
          if (stringUtils.isPalindrome('hello')) throw new Error('Should not detect palindrome');
        });
      });
    } else if (category === 'array') {
      testRunner.describe('Array Utils', () => {
        testRunner.it('should remove duplicates', () => {
          const result = arrayUtils.unique([1, 2, 2, 3]);
          if (JSON.stringify(result) !== JSON.stringify([1, 2, 3])) {
            throw new Error('Expected [1, 2, 3]');
          }
        });
        
        testRunner.it('should handle empty arrays', () => {
          try {
            arrayUtils.findMax([]);
            throw new Error('Should have thrown an error');
          } catch (error) {
            if ((error as Error).message !== 'Array is empty') {
              throw new Error('Wrong error message');
            }
          }
        });
      });
    }
    
    await testRunner.runTests();
    setIsRunning(false);
  };

  const summary = testRunner.getSummary();

  const getExampleCode = (category: string) => {
    switch (category) {
      case 'math':
        return `// Math utility functions
export const mathUtils = {
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  multiply: (a: number, b: number): number => a * b,
  divide: (a: number, b: number): number => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  },
  factorial: (n: number): number => {
    if (n < 0) throw new Error('Factorial of negative number');
    if (n === 0 || n === 1) return 1;
    return n * mathUtils.factorial(n - 1);
  }
};`;
      case 'string':
        return `// String utility functions
export const stringUtils = {
  reverse: (str: string): string => 
    str.split('').reverse().join(''),
  
  capitalize: (str: string): string => 
    str.charAt(0).toUpperCase() + str.slice(1),
  
  isPalindrome: (str: string): boolean => {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  },
  
  wordCount: (str: string): number => 
    str.trim().split(/\\s+/).filter(word => word.length > 0).length
};`;
      case 'array':
        return `// Array utility functions
export const arrayUtils = {
  unique: <T>(arr: T[]): T[] => Array.from(new Set(arr)),
  
  flatten: (arr: any[]): any[] => arr.flat(Infinity),
  
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
  
  findMax: (arr: number[]): number => {
    if (arr.length === 0) throw new Error('Array is empty');
    return Math.max(...arr);
  }
};`;
      default:
        return '';
    }
  };

  const getTestCode = (category: string) => {
    switch (category) {
      case 'math':
        return `describe('Math Utils', () => {
  it('should add two numbers correctly', () => {
    expect(mathUtils.add(2, 3)).toBe(5);
    expect(mathUtils.add(-1, 1)).toBe(0);
    expect(mathUtils.add(0, 0)).toBe(0);
  });

  it('should throw error when dividing by zero', () => {
    expect(() => mathUtils.divide(5, 0)).toThrow('Division by zero');
  });

  it('should calculate factorial correctly', () => {
    expect(mathUtils.factorial(0)).toBe(1);
    expect(mathUtils.factorial(5)).toBe(120);
  });

  it('should throw error for negative factorial', () => {
    expect(() => mathUtils.factorial(-1))
      .toThrow('Factorial of negative number');
  });
});`;
      case 'string':
        return `describe('String Utils', () => {
  it('should reverse strings correctly', () => {
    expect(stringUtils.reverse('hello')).toBe('olleh');
    expect(stringUtils.reverse('')).toBe('');
  });

  it('should detect palindromes correctly', () => {
    expect(stringUtils.isPalindrome('racecar')).toBe(true);
    expect(stringUtils.isPalindrome('A man a plan a canal Panama'))
      .toBe(true);
    expect(stringUtils.isPalindrome('hello')).toBe(false);
  });

  it('should count words correctly', () => {
    expect(stringUtils.wordCount('hello world')).toBe(2);
    expect(stringUtils.wordCount('  spaced   out  ')).toBe(2);
    expect(stringUtils.wordCount('')).toBe(0);
  });
});`;
      case 'array':
        return `describe('Array Utils', () => {
  it('should remove duplicates', () => {
    expect(arrayUtils.unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    expect(arrayUtils.unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('should chunk arrays correctly', () => {
    expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2))
      .toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should find maximum value', () => {
    expect(arrayUtils.findMax([1, 5, 3, 2])).toBe(5);
  });

  it('should throw error for empty array', () => {
    expect(() => arrayUtils.findMax([])).toThrow('Array is empty');
  });
});`;
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Unit Testing</h1>
        <p className="page-description">
          Unit tests verify individual functions or methods in isolation. They're fast, focused, 
          and provide immediate feedback about code correctness. Learn to write effective unit tests 
          that catch bugs early and enable confident refactoring.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>What is Unit Testing?</h3>
          <p>
            Unit testing involves testing individual units of code (functions, methods, classes) 
            in isolation from their dependencies. Each test focuses on a single piece of functionality, 
            making it easy to identify and fix issues when they occur.
          </p>
        </div>

        <div className="info-card">
          <h3>Benefits of Unit Testing</h3>
          <p>
            Unit tests provide fast feedback, enable safe refactoring, serve as living documentation, 
            and catch regressions early. They form the foundation of the testing pyramid and should 
            make up the majority of your test suite.
          </p>
        </div>

        <div className="info-card">
          <h3>Best Practices</h3>
          <p>
            Write tests that are independent, repeatable, and focused on a single behavior. 
            Use descriptive test names, arrange-act-assert structure, and test both happy paths 
            and edge cases including error conditions.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Interactive Unit Testing Examples</h2>
        <p>Select a category to explore unit testing with different types of functions:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedExample === 'math' ? 'active' : ''}`}
            onClick={() => setSelectedExample('math')}
          >
            Math Functions
          </button>
          <button 
            className={`demo-button ${selectedExample === 'string' ? 'active' : ''}`}
            onClick={() => setSelectedExample('string')}
          >
            String Functions
          </button>
          <button 
            className={`demo-button ${selectedExample === 'array' ? 'active' : ''}`}
            onClick={() => setSelectedExample('array')}
          >
            Array Functions
          </button>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Implementation Code</span>
        </div>
        <div className="code-content">
          <pre>{getExampleCode(selectedExample)}</pre>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Unit Tests</span>
        </div>
        <div className="code-content">
          <pre>{getTestCode(selectedExample)}</pre>
        </div>
      </div>

      <div className="test-runner-container">
        <div className="test-runner-header">
          <span className="test-runner-title">Live Test Runner</span>
          <div className="test-runner-controls">
            <button 
              className="test-button"
              onClick={() => runSingleTest(selectedExample)}
              disabled={isRunning}
            >
              Run {selectedExample.charAt(0).toUpperCase() + selectedExample.slice(1)} Tests
            </button>
            <button 
              className="test-button primary"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run All Tests'}
            </button>
          </div>
        </div>

        {summary.total > 0 && (
          <div className="test-summary">
            <div className="test-stats">
              <div className="test-stat passed">
                <span>Passed:</span>
                <span className="test-stat-value">{summary.passed}</span>
              </div>
              <div className="test-stat failed">
                <span>Failed:</span>
                <span className="test-stat-value">{summary.failed}</span>
              </div>
              <div className="test-stat duration">
                <span>Duration:</span>
                <span className="test-stat-value">{summary.duration.toFixed(2)}ms</span>
              </div>
              <div className="test-stat">
                <span>Pass Rate:</span>
                <span className="test-stat-value">{summary.passRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="test-results">
          {isRunning && (
            <div className="loading">
              <div className="loading-spinner"></div>
              Running tests...
            </div>
          )}
          
          {testResults.length === 0 && !isRunning && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click "Run Tests" to see the results
            </div>
          )}

          {testResults.map((result, index) => (
            <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
              <div className="test-result-name">
                {result.passed ? '✓' : '✗'} {result.name}
              </div>
              <div className="test-result-duration">
                {result.duration.toFixed(2)}ms
              </div>
              {result.error && (
                <div className="test-result-error">{result.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Test Structure</h3>
          <p>
            Good unit tests follow the Arrange-Act-Assert (AAA) pattern: Arrange the test data 
            and dependencies, Act by calling the function under test, and Assert that the 
            result matches expectations. This structure makes tests clear and maintainable.
          </p>
        </div>

        <div className="info-card">
          <h3>Edge Cases & Boundaries</h3>
          <p>
            Test boundary conditions like empty inputs, null values, maximum values, and 
            error conditions. These edge cases often reveal bugs that normal usage might miss. 
            Consider what could go wrong and write tests to verify proper error handling.
          </p>
        </div>

        <div className="info-card">
          <h3>Test Independence</h3>
          <p>
            Each unit test should be independent and not rely on other tests or external state. 
            Tests should be able to run in any order and still pass. Use setup and teardown 
            methods to ensure each test starts with a clean state.
          </p>
        </div>

        <div className="info-card">
          <h3>Descriptive Test Names</h3>
          <p>
            Test names should clearly describe what behavior is being tested. Good names include 
            the scenario and expected outcome, like "should_return_error_when_dividing_by_zero". 
            This makes test failures immediately understandable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitTestingPage;