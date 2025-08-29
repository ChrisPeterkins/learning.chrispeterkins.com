import React, { useState, useEffect } from 'react';
import { TestRunner, TestResult } from '../testing/TestRunner';
import { UserManager, APIClient, Counter, createIntegrationTestSuite } from '../testing/testExamples';
import { createMockAPI, createMockFetch } from '../testing/mocks';

const IntegrationTestingPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExample, setSelectedExample] = useState('user-manager');
  const [apiDelay, setApiDelay] = useState(100);
  const [failureRate, setFailureRate] = useState(0);
  
  const testRunner = new TestRunner();

  useEffect(() => {
    testRunner.onResultsUpdate(setTestResults);
  }, []);

  const runIntegrationTests = async () => {
    setIsRunning(true);
    testRunner.clear();
    
    if (selectedExample === 'user-manager') {
      testRunner.describe('UserManager Integration Tests', () => {
        let userManager: UserManager;

        testRunner.it('should integrate user creation and retrieval', () => {
          userManager = new UserManager();
          const user = userManager.addUser('John Doe', 'john@example.com');
          const retrieved = userManager.getUser(user.id);
          
          if (!retrieved || retrieved.name !== 'John Doe') {
            throw new Error('Failed to integrate user creation and retrieval');
          }
        });

        testRunner.it('should handle complex user management workflow', () => {
          userManager = new UserManager();
          
          // Create multiple users
          const user1 = userManager.addUser('Alice', 'alice@example.com');
          const user2 = userManager.addUser('Bob', 'bob@example.com');
          
          // Update user
          const updated = userManager.updateUser(user1.id, { name: 'Alice Smith' });
          
          // Verify all users
          const allUsers = userManager.getAllUsers();
          if (allUsers.length !== 2) {
            throw new Error('Expected 2 users');
          }
          
          if (updated.name !== 'Alice Smith') {
            throw new Error('User update failed');
          }
          
          // Remove user
          userManager.removeUser(user2.id);
          if (userManager.getAllUsers().length !== 1) {
            throw new Error('User removal failed');
          }
        });

        testRunner.it('should enforce business rules across operations', () => {
          userManager = new UserManager();
          
          // Create user
          userManager.addUser('John', 'john@example.com');
          
          // Try to create another user with same email
          try {
            userManager.addUser('Jane', 'john@example.com');
            throw new Error('Should have prevented duplicate email');
          } catch (error) {
            if ((error as Error).message !== 'User with this email already exists') {
              throw error;
            }
          }
        });
      });
    } else if (selectedExample === 'api-client') {
      testRunner.describe('API Client Integration Tests', () => {
        let apiClient: APIClient;
        let mockFetch: any;

        testRunner.it('should handle successful API flow', async () => {
          mockFetch = createMockFetch();
          (global as any).fetch = mockFetch;
          apiClient = new APIClient();
          
          mockFetch.mockDelay(apiDelay);
          mockFetch.mockResponse('/api/users', { 
            status: 200, 
            body: { id: 1, name: 'Test User' } 
          });
          
          const result = await apiClient.get('/users');
          if (!result || result.id !== 1) {
            throw new Error('API integration failed');
          }
        });

        testRunner.it('should handle API error scenarios', async () => {
          mockFetch = createMockFetch();
          (global as any).fetch = mockFetch;
          apiClient = new APIClient();
          
          mockFetch.mockResponse('/api/users/999', { 
            status: 404, 
            body: 'Not Found' 
          });
          
          try {
            await apiClient.get('/users/999');
            throw new Error('Should have thrown an error');
          } catch (error) {
            if (!(error as Error).message.includes('HTTP 404')) {
              throw error;
            }
          }
        });

        testRunner.it('should integrate POST and GET operations', async () => {
          mockFetch = createMockFetch();
          (global as any).fetch = mockFetch;
          apiClient = new APIClient();
          
          const newUser = { name: 'New User', email: 'new@example.com' };
          const createdUser = { id: 123, ...newUser };
          
          mockFetch.mockResponse('/api/users', { 
            status: 201, 
            body: createdUser 
          });
          mockFetch.mockResponse('/api/users/123', { 
            status: 200, 
            body: createdUser 
          });
          
          const created = await apiClient.post('/users', newUser);
          const retrieved = await apiClient.get('/users/123');
          
          if (created.id !== retrieved.id || created.name !== retrieved.name) {
            throw new Error('POST/GET integration failed');
          }
        });
      });
    } else if (selectedExample === 'observer-pattern') {
      testRunner.describe('Observer Pattern Integration Tests', () => {
        let counter: Counter;
        let notifications: number[];
        let notifications2: number[];

        testRunner.it('should integrate counter with multiple observers', () => {
          counter = new Counter();
          notifications = [];
          notifications2 = [];
          
          counter.addListener((value) => notifications.push(value));
          counter.addListener((value) => notifications2.push(value * 2));
          
          counter.increment();
          counter.increment();
          counter.decrement();
          
          if (JSON.stringify(notifications) !== JSON.stringify([1, 2, 1])) {
            throw new Error('Observer 1 notifications failed');
          }
          
          if (JSON.stringify(notifications2) !== JSON.stringify([2, 4, 2])) {
            throw new Error('Observer 2 notifications failed');
          }
        });

        testRunner.it('should handle observer lifecycle management', () => {
          counter = new Counter();
          notifications = [];
          
          const listener = (value: number) => notifications.push(value);
          counter.addListener(listener);
          
          counter.increment(); // Should notify
          counter.removeListener(listener);
          counter.increment(); // Should not notify
          
          if (notifications.length !== 1 || notifications[0] !== 1) {
            throw new Error('Observer lifecycle management failed');
          }
        });
      });
    }
    
    await testRunner.runTests();
    setIsRunning(false);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    testRunner.clear();
    createIntegrationTestSuite(testRunner);
    await testRunner.runTests();
    setIsRunning(false);
  };

  const summary = testRunner.getSummary();

  const getExampleCode = () => {
    switch (selectedExample) {
      case 'user-manager':
        return `// UserManager - Business logic with multiple operations
export class UserManager {
  private users: Array<{id: number, name: string, email: string}> = [];
  private nextId = 1;

  addUser(name: string, email: string) {
    if (!name || !email) {
      throw new Error('Name and email are required');
    }
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (this.users.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    const user = { id: this.nextId++, name, email };
    this.users.push(user);
    return user;
  }

  updateUser(id: number, updates: {name?: string, email?: string}) {
    const user = this.getUser(id);
    if (!user) throw new Error('User not found');
    
    if (updates.email && !this.isValidEmail(updates.email)) {
      throw new Error('Invalid email format');
    }
    if (updates.email && updates.email !== user.email && 
        this.users.some(u => u.email === updates.email)) {
      throw new Error('User with this email already exists');
    }

    Object.assign(user, updates);
    return user;
  }

  removeUser(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    return this.users.splice(index, 1)[0];
  }
}`;
      case 'api-client':
        return `// APIClient - Network operations with error handling
export class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '/api', timeout: number = 5000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async get(endpoint: string) {
    const response = await this.fetchWithTimeout(\`\${this.baseURL}\${endpoint}\`);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await this.fetchWithTimeout(\`\${this.baseURL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return response.json();
  }

  private async fetchWithTimeout(url: string, options: any = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}`;
      case 'observer-pattern':
        return `// Counter with Observer Pattern - State management with notifications
export class Counter {
  private value: number = 0;
  private listeners: Array<(value: number) => void> = [];

  increment() {
    this.value++;
    this.notify();
    return this.value;
  }

  decrement() {
    this.value--;
    this.notify();
    return this.value;
  }

  setValue(newValue: number) {
    this.value = newValue;
    this.notify();
    return this.value;
  }

  addListener(listener: (value: number) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (value: number) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.value));
  }
}`;
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Integration Testing</h1>
        <p className="page-description">
          Integration tests verify that different parts of your system work together correctly. 
          They test the interfaces and interactions between modules, catching issues that unit tests might miss 
          when components are combined.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>What is Integration Testing?</h3>
          <p>
            Integration testing focuses on the interfaces and interaction between components, modules, 
            or services. It verifies that integrated units work together as expected, catching issues 
            like interface mismatches, data flow problems, and communication failures.
          </p>
        </div>

        <div className="info-card">
          <h3>Types of Integration Testing</h3>
          <p>
            Big Bang integration tests all modules together at once. Incremental integration uses 
            top-down, bottom-up, or sandwich approaches to gradually integrate components. 
            API integration tests verify service communication and data contracts.
          </p>
        </div>

        <div className="info-card">
          <h3>Testing Strategies</h3>
          <p>
            Test data flow between components, error propagation, transaction boundaries, and 
            external service integration. Use test doubles for expensive or unreliable dependencies 
            while testing real integration points where it matters most.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Integration Testing Examples</h2>
        <p>Select an integration scenario to explore testing component interactions:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedExample === 'user-manager' ? 'active' : ''}`}
            onClick={() => setSelectedExample('user-manager')}
          >
            Business Logic Integration
          </button>
          <button 
            className={`demo-button ${selectedExample === 'api-client' ? 'active' : ''}`}
            onClick={() => setSelectedExample('api-client')}
          >
            API Integration
          </button>
          <button 
            className={`demo-button ${selectedExample === 'observer-pattern' ? 'active' : ''}`}
            onClick={() => setSelectedExample('observer-pattern')}
          >
            Observer Pattern
          </button>
        </div>

        {selectedExample === 'api-client' && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>API Simulation Settings</h4>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                  Delay (ms):
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={apiDelay}
                  onChange={(e) => setApiDelay(Number(e.target.value))}
                  style={{ width: '100px' }}
                />
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  {apiDelay}ms
                </span>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                  Failure Rate:
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={failureRate * 100}
                  onChange={(e) => setFailureRate(Number(e.target.value) / 100)}
                  style={{ width: '100px' }}
                />
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  {(failureRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Implementation Code</span>
        </div>
        <div className="code-content">
          <pre>{getExampleCode()}</pre>
        </div>
      </div>

      <div className="test-runner-container">
        <div className="test-runner-header">
          <span className="test-runner-title">Integration Test Runner</span>
          <div className="test-runner-controls">
            <button 
              className="test-button"
              onClick={runIntegrationTests}
              disabled={isRunning}
            >
              Run Selected Tests
            </button>
            <button 
              className="test-button primary"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run All Integration Tests'}
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
              Running integration tests...
            </div>
          )}
          
          {testResults.length === 0 && !isRunning && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click "Run Tests" to see integration test results
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
          <h3>Test Data Management</h3>
          <p>
            Integration tests often need complex test data. Use builders, factories, or fixtures 
            to create consistent test data. Consider using test databases or containers to provide 
            isolated environments for tests that interact with external systems.
          </p>
        </div>

        <div className="info-card">
          <h3>Mocking External Dependencies</h3>
          <p>
            Mock external services like databases, APIs, or file systems to make tests reliable 
            and fast. Focus integration testing on the boundaries you control and use contract 
            testing to verify external service assumptions.
          </p>
        </div>

        <div className="info-card">
          <h3>Error Scenarios</h3>
          <p>
            Test how your system handles integration failures: network timeouts, database 
            connection errors, invalid responses, and partial failures. Verify that error 
            messages are propagated correctly and cleanup occurs properly.
          </p>
        </div>

        <div className="info-card">
          <h3>Performance Considerations</h3>
          <p>
            Integration tests are slower than unit tests but should still run reasonably fast. 
            Use parallel execution, optimize test data setup, and consider using faster test 
            doubles for expensive operations while preserving critical integration paths.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestingPage;