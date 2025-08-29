import React, { useState, useEffect } from 'react';

type TDDStep = 'red' | 'green' | 'refactor' | 'complete';

interface TDDDemo {
  step: TDDStep;
  testCode: string;
  implementationCode: string;
  testResult: 'pending' | 'failing' | 'passing';
  explanation: string;
}

const TDDPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<TDDStep>('red');
  const [selectedExample, setSelectedExample] = useState('calculator');
  const [isAnimating, setIsAnimating] = useState(false);

  const getTDDSteps = (example: string): Record<TDDStep, TDDDemo> => {
    if (example === 'calculator') {
      return {
        red: {
          step: 'red',
          testCode: `// Step 1: Write a failing test
describe('Calculator', () => {
  it('should add two numbers', () => {
    const calculator = new Calculator();
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
});

// Test Result: ❌ FAILING
// ReferenceError: Calculator is not defined`,
          implementationCode: `// No implementation yet
// We start with the failing test`,
          testResult: 'failing',
          explanation: 'Write the simplest test that fails. The test describes what we want the code to do, but the implementation doesn\'t exist yet.'
        },
        green: {
          step: 'green',
          testCode: `// Step 2: Same test, now we make it pass
describe('Calculator', () => {
  it('should add two numbers', () => {
    const calculator = new Calculator();
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
});

// Test Result: ✅ PASSING`,
          implementationCode: `// Step 2: Write minimal code to make test pass
export class Calculator {
  add(a: number, b: number): number {
    return 5; // Hardcoded to make test pass
  }
}`,
          testResult: 'passing',
          explanation: 'Write the minimal code to make the test pass. Even if it seems silly (like hardcoding the result), this ensures the test is working correctly.'
        },
        refactor: {
          step: 'refactor',
          testCode: `// Step 3: Add more tests to drive proper implementation
describe('Calculator', () => {
  it('should add two numbers', () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 3)).toBe(5);
    expect(calculator.add(1, 4)).toBe(5); // This will fail!
    expect(calculator.add(0, 0)).toBe(0);
  });
});

// Need to refactor to handle all cases`,
          implementationCode: `// Step 3: Refactor to proper implementation
export class Calculator {
  add(a: number, b: number): number {
    return a + b; // Now properly implemented
  }
}

// All tests now pass with correct logic`,
          testResult: 'passing',
          explanation: 'Refactor the implementation to handle all test cases properly. Add more tests to ensure the implementation is robust and correct.'
        },
        complete: {
          step: 'complete',
          testCode: `// Step 4: Complete test suite with edge cases
describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
      expect(calculator.add(10, 15)).toBe(25);
    });

    it('should handle negative numbers', () => {
      expect(calculator.add(-2, 3)).toBe(1);
      expect(calculator.add(-5, -3)).toBe(-8);
    });

    it('should handle zero', () => {
      expect(calculator.add(0, 5)).toBe(5);
      expect(calculator.add(0, 0)).toBe(0);
    });

    it('should handle decimal numbers', () => {
      expect(calculator.add(1.5, 2.5)).toBe(4);
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });
});`,
          implementationCode: `// Step 4: Final implementation with full test coverage
export class Calculator {
  /**
   * Adds two numbers together
   * @param a First number
   * @param b Second number
   * @returns Sum of a and b
   */
  add(a: number, b: number): number {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    return a + b;
  }

  // Ready to add more methods following TDD...
  subtract(a: number, b: number): number {
    // Would follow same TDD process
    return a - b;
  }
}`,
          testResult: 'passing',
          explanation: 'Complete the feature with comprehensive tests covering edge cases, error conditions, and documentation. The implementation is now robust and well-tested.'
        }
      };
    } else if (example === 'todo-list') {
      return {
        red: {
          step: 'red',
          testCode: `// Step 1: Write a failing test for todo list
describe('TodoList', () => {
  it('should start empty', () => {
    const todoList = new TodoList();
    expect(todoList.getItems()).toEqual([]);
    expect(todoList.getCount()).toBe(0);
  });
});

// Test Result: ❌ FAILING
// ReferenceError: TodoList is not defined`,
          implementationCode: `// No implementation yet`,
          testResult: 'failing',
          explanation: 'Start by testing the most basic behavior - an empty todo list. This defines the interface we want to create.'
        },
        green: {
          step: 'green',
          testCode: `// Step 2: Make the test pass
describe('TodoList', () => {
  it('should start empty', () => {
    const todoList = new TodoList();
    expect(todoList.getItems()).toEqual([]);
    expect(todoList.getCount()).toBe(0);
  });
});

// Test Result: ✅ PASSING`,
          implementationCode: `// Step 2: Minimal implementation
export class TodoList {
  getItems(): string[] {
    return [];
  }
  
  getCount(): number {
    return 0;
  }
}`,
          testResult: 'passing',
          explanation: 'Create the minimal implementation to make the test pass. We hardcode empty arrays and zero counts.'
        },
        refactor: {
          step: 'refactor',
          testCode: `// Step 3: Add more functionality
describe('TodoList', () => {
  let todoList: TodoList;

  beforeEach(() => {
    todoList = new TodoList();
  });

  it('should start empty', () => {
    expect(todoList.getItems()).toEqual([]);
    expect(todoList.getCount()).toBe(0);
  });

  it('should add items', () => {
    todoList.addItem('Buy milk');
    expect(todoList.getItems()).toEqual(['Buy milk']);
    expect(todoList.getCount()).toBe(1);
  });
});`,
          implementationCode: `// Step 3: Add functionality driven by tests
export class TodoList {
  private items: string[] = [];

  getItems(): string[] {
    return [...this.items]; // Return copy to prevent mutation
  }
  
  getCount(): number {
    return this.items.length;
  }

  addItem(item: string): void {
    if (!item.trim()) {
      throw new Error('Item cannot be empty');
    }
    this.items.push(item);
  }
}`,
          testResult: 'passing',
          explanation: 'Refactor to use actual data storage and add new functionality. Tests drive the design and ensure correctness.'
        },
        complete: {
          step: 'complete',
          testCode: `// Step 4: Complete todo list with all features
describe('TodoList', () => {
  let todoList: TodoList;

  beforeEach(() => {
    todoList = new TodoList();
  });

  describe('initialization', () => {
    it('should start empty', () => {
      expect(todoList.getItems()).toEqual([]);
      expect(todoList.getCount()).toBe(0);
    });
  });

  describe('adding items', () => {
    it('should add single item', () => {
      todoList.addItem('Buy milk');
      expect(todoList.getItems()).toEqual(['Buy milk']);
      expect(todoList.getCount()).toBe(1);
    });

    it('should add multiple items', () => {
      todoList.addItem('Buy milk');
      todoList.addItem('Walk dog');
      expect(todoList.getCount()).toBe(2);
    });

    it('should reject empty items', () => {
      expect(() => todoList.addItem('')).toThrow('Item cannot be empty');
      expect(() => todoList.addItem('   ')).toThrow('Item cannot be empty');
    });
  });

  describe('removing items', () => {
    beforeEach(() => {
      todoList.addItem('Buy milk');
      todoList.addItem('Walk dog');
    });

    it('should remove item by index', () => {
      todoList.removeItem(0);
      expect(todoList.getItems()).toEqual(['Walk dog']);
      expect(todoList.getCount()).toBe(1);
    });

    it('should handle invalid indices', () => {
      expect(() => todoList.removeItem(-1)).toThrow('Invalid index');
      expect(() => todoList.removeItem(10)).toThrow('Invalid index');
    });
  });
});`,
          implementationCode: `// Step 4: Complete TodoList implementation
export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export class TodoList {
  private items: TodoItem[] = [];
  private nextId = 1;

  getItems(): TodoItem[] {
    return this.items.map(item => ({ ...item })); // Deep copy
  }
  
  getCount(): number {
    return this.items.length;
  }

  addItem(text: string): TodoItem {
    if (!text.trim()) {
      throw new Error('Item cannot be empty');
    }
    
    const item: TodoItem = {
      id: this.nextId++,
      text: text.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    this.items.push(item);
    return item;
  }

  removeItem(index: number): TodoItem {
    if (index < 0 || index >= this.items.length) {
      throw new Error('Invalid index');
    }
    return this.items.splice(index, 1)[0];
  }

  toggleItem(id: number): void {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    item.completed = !item.completed;
  }

  getCompletedCount(): number {
    return this.items.filter(item => item.completed).length;
  }

  getPendingCount(): number {
    return this.items.filter(item => !item.completed).length;
  }
}`,
          testResult: 'passing',
          explanation: 'The complete TodoList with full functionality, driven entirely by tests. Each feature was added incrementally with tests first.'
        }
      };
    }
    return {} as Record<TDDStep, TDDDemo>;
  };

  const advanceStep = () => {
    setIsAnimating(true);
    const steps: TDDStep[] = ['red', 'green', 'refactor', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const nextIndex = (currentIndex + 1) % steps.length;
    
    setTimeout(() => {
      setCurrentStep(steps[nextIndex]);
      setIsAnimating(false);
    }, 500);
  };

  const currentDemo = getTDDSteps(selectedExample)[currentStep];

  return (
    <div>
      <div className="page-header">
        <h1>Test-Driven Development</h1>
        <p className="page-description">
          Test-Driven Development (TDD) is a development process where you write tests before writing the implementation code. 
          The Red-Green-Refactor cycle ensures high code quality, better design, and comprehensive test coverage.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>The TDD Cycle</h3>
          <p>
            TDD follows a three-step cycle: Red (write a failing test), Green (write minimal code to pass), 
            and Refactor (improve the code while keeping tests passing). This cycle is repeated for each 
            small piece of functionality.
          </p>
        </div>

        <div className="info-card">
          <h3>Benefits of TDD</h3>
          <p>
            TDD leads to better code design, higher test coverage, fewer bugs, and more confidence in changes. 
            It forces you to think about the API design first and ensures every line of code is justified by a test.
          </p>
        </div>

        <div className="info-card">
          <h3>TDD Best Practices</h3>
          <p>
            Write the smallest possible failing test, make it pass with minimal code, then refactor. 
            Keep the cycles short (minutes), focus on one behavior at a time, and let the tests drive your design decisions.
          </p>
        </div>
      </div>

      <div className="tdd-workflow">
        <div className={`tdd-step red ${currentStep === 'red' ? 'active' : ''}`}>
          <div className="tdd-step-icon">1</div>
          <h3>Red</h3>
          <p>Write a failing test that describes the desired behavior</p>
        </div>

        <div className="tdd-arrow">→</div>

        <div className={`tdd-step green ${currentStep === 'green' ? 'active' : ''}`}>
          <div className="tdd-step-icon">2</div>
          <h3>Green</h3>
          <p>Write minimal code to make the test pass</p>
        </div>

        <div className="tdd-arrow">→</div>

        <div className={`tdd-step blue ${currentStep === 'refactor' ? 'active' : ''}`}>
          <div className="tdd-step-icon">3</div>
          <h3>Refactor</h3>
          <p>Improve code quality while keeping tests passing</p>
        </div>

        <div className="tdd-arrow">→</div>

        <div className={`tdd-step green ${currentStep === 'complete' ? 'active' : ''}`}>
          <div className="tdd-step-icon">✓</div>
          <h3>Complete</h3>
          <p>Feature complete with full test coverage</p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Interactive TDD Demo</h2>
        <p>Follow the TDD cycle step by step with a practical example:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedExample === 'calculator' ? 'active' : ''}`}
            onClick={() => {setSelectedExample('calculator'); setCurrentStep('red');}}
          >
            Calculator Example
          </button>
          <button 
            className={`demo-button ${selectedExample === 'todo-list' ? 'active' : ''}`}
            onClick={() => {setSelectedExample('todo-list'); setCurrentStep('red');}}
          >
            Todo List Example
          </button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <button 
              className="demo-button"
              onClick={() => setCurrentStep('red')}
              disabled={isAnimating}
            >
              Reset to Red
            </button>
            <button 
              className="test-button primary"
              onClick={advanceStep}
              disabled={isAnimating}
            >
              {isAnimating ? 'Transitioning...' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>

      <div className="demo-container">
        <h3>Current Step: <span style={{ color: 'var(--accent-green-bright)' }}>{currentDemo.step.toUpperCase()}</span></h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {currentDemo.explanation}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div className="code-container">
            <div className="code-header">
              <span className="code-title">
                Test Code 
                <span style={{ 
                  marginLeft: '1rem', 
                  color: currentDemo.testResult === 'passing' ? 'var(--success-green)' : 'var(--error-red)',
                  fontSize: '0.8rem'
                }}>
                  {currentDemo.testResult === 'passing' ? '✅ PASSING' : 
                   currentDemo.testResult === 'failing' ? '❌ FAILING' : '⏳ PENDING'}
                </span>
              </span>
            </div>
            <div className="code-content">
              <pre>{currentDemo.testCode}</pre>
            </div>
          </div>

          <div className="code-container">
            <div className="code-header">
              <span className="code-title">Implementation Code</span>
            </div>
            <div className="code-content">
              <pre>{currentDemo.implementationCode}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Red Phase - Failing Test</h3>
          <p>
            Write the smallest test that fails. This test should describe one specific behavior 
            you want to implement. The test will fail because the implementation doesn't exist yet, 
            which confirms the test is actually testing something.
          </p>
        </div>

        <div className="info-card">
          <h3>Green Phase - Make it Pass</h3>
          <p>
            Write the simplest code possible to make the test pass. Don't worry about code quality 
            or edge cases yet - just make the test green. This might mean hardcoding values or 
            using naive implementations.
          </p>
        </div>

        <div className="info-card">
          <h3>Refactor Phase - Clean Up</h3>
          <p>
            Improve the code quality without changing its behavior. Remove duplication, improve naming, 
            and enhance the design. The tests ensure you don't break functionality during refactoring.
          </p>
        </div>

        <div className="info-card">
          <h3>Repeat the Cycle</h3>
          <p>
            Continue the Red-Green-Refactor cycle for each new piece of functionality. 
            Each cycle should be small (a few minutes) and focus on one specific behavior. 
            This builds up complex functionality incrementally.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>TDD Guidelines</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Test Writing</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Write the simplest failing test</li>
              <li>Test one behavior at a time</li>
              <li>Use descriptive test names</li>
              <li>Start with the happy path</li>
              <li>Add edge cases incrementally</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Implementation</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Write minimal code to pass</li>
              <li>Don't over-engineer initially</li>
              <li>Hardcode if necessary</li>
              <li>Let tests drive the design</li>
              <li>Refactor only when tests pass</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Refactoring</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Improve code without changing behavior</li>
              <li>Remove duplication</li>
              <li>Enhance readability</li>
              <li>Improve performance if needed</li>
              <li>Keep all tests passing</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Common Pitfalls</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Writing too much code at once</li>
              <li>Skipping the refactor step</li>
              <li>Testing implementation details</li>
              <li>Writing tests after code</li>
              <li>Making cycles too long</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDDPage;