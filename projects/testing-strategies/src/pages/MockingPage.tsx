import React, { useState, useEffect } from 'react';
import { TestRunner, TestResult } from '../testing/TestRunner';
import { createMockFetch, createMockAPI, jest } from '../testing/mocks';

const MockingPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExample, setSelectedExample] = useState('function-mocks');
  const testRunner = new TestRunner();

  useEffect(() => {
    testRunner.onResultsUpdate(setTestResults);
  }, []);

  const runMockTests = async () => {
    setIsRunning(true);
    testRunner.clear();
    
    if (selectedExample === 'function-mocks') {
      testRunner.describe('Function Mocking', () => {
        testRunner.it('should mock function calls and verify interactions', () => {
          // Create a mock function
          const mockCallback = jest.fn();
          mockCallback.mockReturnValue('mocked result');
          
          // Function under test
          function processData(data: string[], callback: (item: string) => string): string[] {
            return data.map(callback);
          }
          
          // Test with mock
          const result = processData(['a', 'b', 'c'], mockCallback);
          
          // Verify mock was called correctly
          if (mockCallback.mock.calls.length !== 3) {
            throw new Error(`Expected 3 calls, got ${mockCallback.mock.calls.length}`);
          }
          
          if (mockCallback.mock.calls[0][0] !== 'a') {
            throw new Error('First call should have been with "a"');
          }
          
          if (result.length !== 3 || result[0] !== 'mocked result') {
            throw new Error('Mock return value not used correctly');
          }
        });

        testRunner.it('should track different return values', () => {
          const mockFn = jest.fn();
          
          // Set up different return values
          mockFn.mockReturnValueOnce('first');
          mockFn.mockReturnValueOnce('second');
          mockFn.mockReturnValue('default');
          
          const results = [mockFn(), mockFn(), mockFn(), mockFn()];
          
          if (JSON.stringify(results) !== JSON.stringify(['first', 'second', 'default', 'default'])) {
            throw new Error('Mock return values not handled correctly');
          }
        });
      });
      
    } else if (selectedExample === 'api-mocks') {
      testRunner.describe('API Mocking', () => {
        testRunner.it('should mock HTTP requests', async () => {
          const mockFetch = createMockFetch();
          (global as any).fetch = mockFetch;
          
          // Set up mock response
          mockFetch.mockResponse('/api/users/1', {
            status: 200,
            body: { id: 1, name: 'John Doe', email: 'john@example.com' }
          });
          
          // Function under test
          async function fetchUser(id: number) {
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
          }
          
          const user = await fetchUser(1);
          
          if (user.name !== 'John Doe' || user.email !== 'john@example.com') {
            throw new Error('Mock API response not returned correctly');
          }
        });

        testRunner.it('should simulate API errors', async () => {
          const mockFetch = createMockFetch();
          (global as any).fetch = mockFetch;
          
          mockFetch.mockResponse('/api/users/999', {
            status: 404,
            body: { error: 'User not found' }
          });
          
          async function fetchUser(id: number) {
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          }
          
          try {
            await fetchUser(999);
            throw new Error('Should have thrown an error');
          } catch (error) {
            if (!(error as Error).message.includes('HTTP 404')) {
              throw error;
            }
          }
        });
      });
      
    } else if (selectedExample === 'dependency-injection') {
      testRunner.describe('Dependency Injection Mocking', () => {
        testRunner.it('should mock injected dependencies', () => {
          // Logger interface
          interface Logger {
            log(message: string): void;
            error(message: string): void;
          }
          
          // Service that depends on logger
          class UserService {
            constructor(private logger: Logger) {}
            
            createUser(name: string, email: string) {
              if (!name || !email) {
                this.logger.error('Invalid user data');
                throw new Error('Name and email required');
              }
              
              this.logger.log(`Creating user: ${name}`);
              return { id: 1, name, email };
            }
          }
          
          // Mock logger
          const mockLogger = {
            log: jest.fn(),
            error: jest.fn()
          };
          
          const userService = new UserService(mockLogger);
          
          // Test successful case
          const user = userService.createUser('John', 'john@example.com');
          
          if (mockLogger.log.mock.calls.length !== 1) {
            throw new Error('Logger.log should have been called once');
          }
          
          if (!mockLogger.log.mock.calls[0][0].includes('Creating user: John')) {
            throw new Error('Logger should have logged user creation');
          }
          
          // Test error case
          try {
            userService.createUser('', '');
          } catch (error) {
            // Expected
          }
          
          if (mockLogger.error.mock.calls.length !== 1) {
            throw new Error('Logger.error should have been called once');
          }
        });
      });
      
    } else if (selectedExample === 'partial-mocks') {
      testRunner.describe('Partial Mocking', () => {
        testRunner.it('should mock only specific methods', () => {
          class MathService {
            add(a: number, b: number): number {
              return a + b;
            }
            
            multiply(a: number, b: number): number {
              return a * b;
            }
            
            complexCalculation(x: number, y: number): number {
              // Use both add and multiply
              const sum = this.add(x, y);
              return this.multiply(sum, 2);
            }
          }
          
          const mathService = new MathService();
          
          // Mock only the multiply method
          const originalMultiply = mathService.multiply;
          mathService.multiply = jest.fn().mockReturnValue(100);
          
          const result = mathService.complexCalculation(3, 7);
          
          // add() should work normally (3 + 7 = 10)
          // multiply() should return mocked value (100)
          if (result !== 100) {
            throw new Error('Partial mock not working correctly');
          }
          
          // Verify mock was called with correct arguments
          const mockMultiply = mathService.multiply as jest.MockedFunction<typeof mathService.multiply>;
          if (mockMultiply.mock.calls[0][0] !== 10 || mockMultiply.mock.calls[0][1] !== 2) {
            throw new Error('Mock multiply was not called with expected arguments');
          }
          
          // Restore original method
          mathService.multiply = originalMultiply;
        });
      });
    }
    
    await testRunner.runTests();
    setIsRunning(false);
  };

  const getExampleCode = () => {
    switch (selectedExample) {
      case 'function-mocks':
        return `// Function Mocking with Jest
describe('Function Mocking', () => {
  it('should mock callback functions', () => {
    // Create mock function
    const mockCallback = jest.fn();
    mockCallback.mockReturnValue('mocked result');
    
    // Function under test
    function processData(data: string[], callback: (item: string) => string) {
      return data.map(callback);
    }
    
    // Test with mock
    const result = processData(['a', 'b', 'c'], mockCallback);
    
    // Verify interactions
    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenCalledWith('a');
    expect(mockCallback).toHaveBeenCalledWith('b');
    expect(mockCallback).toHaveBeenCalledWith('c');
    expect(result).toEqual(['mocked result', 'mocked result', 'mocked result']);
  });

  it('should mock with different return values', () => {
    const mockFn = jest.fn();
    
    // Different return values for different calls
    mockFn
      .mockReturnValueOnce('first call')
      .mockReturnValueOnce('second call')
      .mockReturnValue('default');
    
    expect(mockFn()).toBe('first call');
    expect(mockFn()).toBe('second call');
    expect(mockFn()).toBe('default');
    expect(mockFn()).toBe('default'); // Continues returning default
  });

  it('should mock async functions', async () => {
    const mockAsyncFn = jest.fn();
    mockAsyncFn.mockResolvedValueOnce('success');
    mockAsyncFn.mockRejectedValueOnce(new Error('failure'));
    
    expect(await mockAsyncFn()).toBe('success');
    await expect(mockAsyncFn()).rejects.toThrow('failure');
  });
});`;

      case 'api-mocks':
        return `// API Mocking Strategies
describe('API Mocking', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  it('should mock successful API responses', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ id: 1, name: 'John Doe' })
    };
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);
    
    // Function under test
    async function fetchUser(id: number) {
      const response = await fetch(\`/api/users/\${id}\`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
    
    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: 'John Doe' });
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('should mock API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    };
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);
    
    async function fetchUser(id: number) {
      const response = await fetch(\`/api/users/\${id}\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      return response.json();
    }
    
    await expect(fetchUser(999)).rejects.toThrow('HTTP 404');
  });

  it('should use MSW for complex API mocking', () => {
    // Mock Service Worker example
    import { rest } from 'msw';
    import { setupServer } from 'msw/node';
    
    const server = setupServer(
      rest.get('/api/users/:id', (req, res, ctx) => {
        const { id } = req.params;
        return res(
          ctx.json({ id: Number(id), name: \`User \${id}\` })
        );
      })
    );
    
    // This would be in your test setup
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
  });
});`;

      case 'dependency-injection':
        return `// Dependency Injection Mocking
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

class UserService {
  constructor(private logger: Logger) {}
  
  createUser(name: string, email: string) {
    if (!name || !email) {
      this.logger.error('Invalid user data');
      throw new Error('Name and email required');
    }
    
    this.logger.log(\`Creating user: \${name}\`);
    return { id: 1, name, email };
  }
}

describe('UserService with Dependency Injection', () => {
  it('should use injected logger', () => {
    // Create mock logger
    const mockLogger: Logger = {
      log: jest.fn(),
      error: jest.fn()
    };
    
    const userService = new UserService(mockLogger);
    
    // Test successful creation
    const user = userService.createUser('John', 'john@example.com');
    
    expect(mockLogger.log).toHaveBeenCalledWith('Creating user: John');
    expect(user).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
  });

  it('should handle validation errors', () => {
    const mockLogger: Logger = {
      log: jest.fn(),
      error: jest.fn()
    };
    
    const userService = new UserService(mockLogger);
    
    expect(() => userService.createUser('', '')).toThrow('Name and email required');
    expect(mockLogger.error).toHaveBeenCalledWith('Invalid user data');
    expect(mockLogger.log).not.toHaveBeenCalled();
  });
});

// Alternative: Using jest.createMockFromModule
const mockLogger = jest.createMockFromModule<Logger>('./logger');
mockLogger.log = jest.fn();
mockLogger.error = jest.fn();`;

      case 'partial-mocks':
        return `// Partial Mocking - Mock only specific methods
class DatabaseService {
  connect(): Promise<void> {
    // Real database connection
    return Promise.resolve();
  }
  
  query(sql: string): Promise<any[]> {
    // Real database query
    return Promise.resolve([]);
  }
  
  getUserCount(): Promise<number> {
    // Uses this.query internally
    return this.query('SELECT COUNT(*) FROM users')
      .then(result => result[0].count);
  }
}

describe('Partial Mocking', () => {
  it('should mock only specific methods', async () => {
    const dbService = new DatabaseService();
    
    // Mock only the query method
    const mockQuery = jest.spyOn(dbService, 'query');
    mockQuery.mockResolvedValue([{ count: 42 }]);
    
    // getUserCount will use real logic but mocked query
    const count = await dbService.getUserCount();
    
    expect(count).toBe(42);
    expect(mockQuery).toHaveBeenCalledWith('SELECT COUNT(*) FROM users');
    
    // Restore original method
    mockQuery.mockRestore();
  });

  it('should use jest.spyOn for method spying', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
      multiply: (a: number, b: number) => a * b
    };
    
    // Spy on method without changing implementation
    const addSpy = jest.spyOn(calculator, 'add');
    
    const result = calculator.add(2, 3);
    
    expect(result).toBe(5); // Original implementation
    expect(addSpy).toHaveBeenCalledWith(2, 3);
    
    addSpy.mockRestore();
  });
});

// Module Mocking
jest.mock('./userService', () => ({
  ...jest.requireActual('./userService'),
  createUser: jest.fn().mockResolvedValue({ id: 1, name: 'Mock User' })
}));`;

      default:
        return '';
    }
  };

  const summary = testRunner.getSummary();

  return (
    <div>
      <div className="page-header">
        <h1>Mocking & Stubs</h1>
        <p className="page-description">
          Mocking and stubbing are essential techniques for isolating code under test by replacing dependencies 
          with controlled fake implementations. Learn when and how to use mocks, stubs, spies, and fakes 
          to create reliable and fast tests.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Types of Test Doubles</h3>
          <p>
            <strong>Mocks</strong> verify interactions, <strong>Stubs</strong> provide predetermined responses, 
            <strong>Spies</strong> record calls while preserving behavior, and <strong>Fakes</strong> are 
            simplified working implementations. Each serves different testing needs.
          </p>
        </div>

        <div className="info-card">
          <h3>When to Use Mocks</h3>
          <p>
            Use mocks for slow dependencies (databases, network calls), external services, 
            or when you need to verify specific interactions. They enable testing in isolation 
            and make tests fast, reliable, and independent of external systems.
          </p>
        </div>

        <div className="info-card">
          <h3>Mock Patterns</h3>
          <p>
            Common patterns include dependency injection for easy mock substitution, 
            factory functions for creating test doubles, and module mocking for replacing 
            entire modules. Choose the pattern that best fits your architecture.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Mocking Strategies</h2>
        <p>Explore different mocking approaches and their use cases:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedExample === 'function-mocks' ? 'active' : ''}`}
            onClick={() => setSelectedExample('function-mocks')}
          >
            Function Mocks
          </button>
          <button 
            className={`demo-button ${selectedExample === 'api-mocks' ? 'active' : ''}`}
            onClick={() => setSelectedExample('api-mocks')}
          >
            API Mocking
          </button>
          <button 
            className={`demo-button ${selectedExample === 'dependency-injection' ? 'active' : ''}`}
            onClick={() => setSelectedExample('dependency-injection')}
          >
            Dependency Injection
          </button>
          <button 
            className={`demo-button ${selectedExample === 'partial-mocks' ? 'active' : ''}`}
            onClick={() => setSelectedExample('partial-mocks')}
          >
            Partial Mocks
          </button>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Mocking Example Code</span>
        </div>
        <div className="code-content">
          <pre>{getExampleCode()}</pre>
        </div>
      </div>

      <div className="test-runner-container">
        <div className="test-runner-header">
          <span className="test-runner-title">Mock Test Runner</span>
          <div className="test-runner-controls">
            <button 
              className="test-button primary"
              onClick={runMockTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Mock Tests'}
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
            </div>
          </div>
        )}

        <div className="test-results">
          {isRunning && (
            <div className="loading">
              <div className="loading-spinner"></div>
              Running mock tests...
            </div>
          )}
          
          {testResults.length === 0 && !isRunning && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click "Run Mock Tests" to see mocking in action
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
          <h3>Mock Verification</h3>
          <p>
            Verify that mocks were called correctly: check call count, arguments, call order, 
            and return values. Use assertions like toHaveBeenCalledWith(), toHaveBeenCalledTimes(), 
            and toHaveBeenLastCalledWith() to ensure proper interactions.
          </p>
        </div>

        <div className="info-card">
          <h3>Mock Lifecycle</h3>
          <p>
            Reset mocks between tests to prevent test interference. Use beforeEach() to clear 
            mock call history and return values. Consider using mockRestore() to return 
            to original implementations when using spies.
          </p>
        </div>

        <div className="info-card">
          <h3>Avoiding Over-Mocking</h3>
          <p>
            Don't mock everything - test real interactions where possible. Over-mocking can lead 
            to tests that pass but don't reflect real behavior. Mock at boundaries (network, database) 
            but keep domain logic interactions real.
          </p>
        </div>

        <div className="info-card">
          <h3>Mock Strategies</h3>
          <p>
            Use manual mocks for consistent behavior across tests, automatic mocks for quick setup, 
            and mock factories for complex scenarios. Consider using libraries like MSW for 
            API mocking or Sinon.js for advanced mocking features.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Best Practices</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Mock Creation</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Mock at the right level of abstraction</li>
              <li>Use dependency injection for easy mocking</li>
              <li>Create reusable mock factories</li>
              <li>Keep mocks simple and focused</li>
              <li>Document complex mock setups</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Mock Verification</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Verify important interactions only</li>
              <li>Check call arguments and frequency</li>
              <li>Use descriptive assertion messages</li>
              <li>Test both success and error scenarios</li>
              <li>Don't verify implementation details</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Mock Maintenance</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Keep mocks in sync with real interfaces</li>
              <li>Clean up mocks between tests</li>
              <li>Use TypeScript for better mock safety</li>
              <li>Update mocks when APIs change</li>
              <li>Remove unused mock setups</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Common Pitfalls</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Testing mock implementations instead of behavior</li>
              <li>Over-mocking internal methods</li>
              <li>Forgetting to reset mocks between tests</li>
              <li>Making mocks too complex</li>
              <li>Not updating mocks when code changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockingPage;