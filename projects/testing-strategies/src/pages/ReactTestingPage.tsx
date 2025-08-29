import React, { useState } from 'react';

const ReactTestingPage: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState('component-rendering');
  const [demoOutput, setDemoOutput] = useState<string[]>([]);

  const simulateTest = (testType: string) => {
    setDemoOutput([]);
    
    const steps = getTestSteps(testType);
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setDemoOutput(prev => [...prev, step]);
      }, index * 800);
    });
  };

  const getTestSteps = (testType: string): string[] => {
    switch (testType) {
      case 'component-rendering':
        return [
          '✓ Component renders without crashing',
          '✓ Displays correct initial props',
          '✓ Applies CSS classes correctly',
          '✓ Renders child components',
          '✓ Handles empty/null props gracefully'
        ];
      case 'user-interactions':
        return [
          '✓ Button click triggers callback',
          '✓ Form input updates state',
          '✓ Keyboard events work correctly',
          '✓ Mouse hover shows tooltip',
          '✓ Form submission prevents default'
        ];
      case 'state-management':
        return [
          '✓ Initial state is set correctly',
          '✓ setState updates component state',
          '✓ State changes trigger re-renders',
          '✓ Complex state updates work',
          '✓ State cleanup on unmount'
        ];
      case 'hooks-testing':
        return [
          '✓ useEffect runs on mount',
          '✓ useEffect cleanup on unmount',
          '✓ Custom hook returns expected values',
          '✓ Hook dependencies trigger updates',
          '✓ Hook error handling works'
        ];
      default:
        return [];
    }
  };

  const getExampleCode = () => {
    switch (selectedExample) {
      case 'component-rendering':
        return `// Component Rendering Tests
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders with custom props', () => {
    render(
      <Button 
        data-testid="custom-button" 
        aria-label="Custom action"
      >
        Custom Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom action');
  });

  it('handles missing children gracefully', () => {
    render(<Button />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

// Snapshot Testing
import { render } from '@testing-library/react';
import { Card } from './Card';

it('matches snapshot', () => {
  const { container } = render(
    <Card title="Test Card" content="Test content" />
  );
  
  expect(container.firstChild).toMatchSnapshot();
});`;

      case 'user-interactions':
        return `// User Interaction Tests
import { render, screen, fireEvent, userEvent } from '@testing-library/react';
import { ContactForm } from './ContactForm';

describe('ContactForm User Interactions', () => {
  it('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('submits form with correct data', async () => {
    const mockSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<ContactForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello world');
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello world'
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    nameInput.focus();
    expect(nameInput).toHaveFocus();
    
    await user.tab();
    expect(emailInput).toHaveFocus();
  });

  it('handles button click events', async () => {
    const mockClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={mockClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});`;

      case 'state-management':
        return `// State Management Testing
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';
import { TodoList } from './TodoList';

describe('Counter State Management', () => {
  it('initializes with correct state', () => {
    render(<Counter initialValue={5} />);
    
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  it('increments counter on button click', () => {
    render(<Counter initialValue={0} />);
    
    const incrementButton = screen.getByText('Increment');
    
    fireEvent.click(incrementButton);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
    
    fireEvent.click(incrementButton);
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  });

  it('resets counter', () => {
    render(<Counter initialValue={10} />);
    
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});

describe('TodoList State Management', () => {
  it('adds new todos', () => {
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText('Enter todo');
    const addButton = screen.getByText('Add Todo');
    
    fireEvent.change(input, { target: { value: 'Buy milk' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(input).toHaveValue(''); // Input should be cleared
  });

  it('toggles todo completion', () => {
    render(<TodoList initialTodos={[{ id: 1, text: 'Test todo', completed: false }]} />);
    
    const checkbox = screen.getByRole('checkbox');
    
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('removes todos', () => {
    render(<TodoList initialTodos={[{ id: 1, text: 'Test todo', completed: false }]} />);
    
    const deleteButton = screen.getByText('Delete');
    
    fireEvent.click(deleteButton);
    expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
  });
});`;

      case 'hooks-testing':
        return `// Hooks Testing
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useCounter, useFetch, useLocalStorage } from './hooks';

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(5));
    
    expect(result.current.count).toBe(5);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('resets count', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});

describe('useFetch Hook', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('handles loading state', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' })
    } as Response);

    const { result } = renderHook(() => useFetch('/api/data'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('handles successful fetch', async () => {
    const mockData = { id: 1, name: 'Test' };
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useFetch('/api/data'));
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch error', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result, waitForNextUpdate } = renderHook(() => useFetch('/api/data'));
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(new Error('Network error'));
  });
});

// Testing Hooks in Components
function TestComponent() {
  const { count, increment } = useCounter(0);
  
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

describe('Hook Integration in Component', () => {
  it('works correctly when used in component', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});`;

      default:
        return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Testing React Components</h1>
        <p className="page-description">
          Testing React components requires specific techniques for testing rendering, user interactions, 
          state management, and hooks. Learn to write effective tests using React Testing Library 
          and modern testing patterns for component-based applications.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>React Testing Library</h3>
          <p>
            React Testing Library focuses on testing components the way users interact with them. 
            It encourages testing behavior over implementation details, leading to more maintainable 
            and reliable tests that give confidence in your application.
          </p>
        </div>

        <div className="info-card">
          <h3>Testing Philosophy</h3>
          <p>
            "The more your tests resemble the way your software is used, the more confidence they can give you." 
            Focus on testing what users see and do rather than internal component implementation details.
          </p>
        </div>

        <div className="info-card">
          <h3>Common Testing Scenarios</h3>
          <p>
            Test component rendering, user interactions (clicks, typing, form submission), 
            state changes, prop handling, accessibility features, and integration with external APIs 
            or state management libraries.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>React Testing Scenarios</h2>
        <p>Explore different approaches to testing React components:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedExample === 'component-rendering' ? 'active' : ''}`}
            onClick={() => setSelectedExample('component-rendering')}
          >
            Component Rendering
          </button>
          <button 
            className={`demo-button ${selectedExample === 'user-interactions' ? 'active' : ''}`}
            onClick={() => setSelectedExample('user-interactions')}
          >
            User Interactions
          </button>
          <button 
            className={`demo-button ${selectedExample === 'state-management' ? 'active' : ''}`}
            onClick={() => setSelectedExample('state-management')}
          >
            State Management
          </button>
          <button 
            className={`demo-button ${selectedExample === 'hooks-testing' ? 'active' : ''}`}
            onClick={() => setSelectedExample('hooks-testing')}
          >
            Hooks Testing
          </button>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">React Testing Example</span>
        </div>
        <div className="code-content">
          <pre>{getExampleCode()}</pre>
        </div>
      </div>

      <div className="test-runner-container">
        <div className="test-runner-header">
          <span className="test-runner-title">Test Simulation</span>
          <div className="test-runner-controls">
            <button 
              className="test-button primary"
              onClick={() => simulateTest(selectedExample)}
            >
              Simulate Tests
            </button>
          </div>
        </div>

        <div className="test-results">
          {demoOutput.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click "Simulate Tests" to see testing scenarios in action
            </div>
          )}

          {demoOutput.map((result, index) => (
            <div 
              key={index} 
              className="test-result passed"
              style={{ 
                padding: '0.75rem 1rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.85rem'
              }}
            >
              <div className="test-result-name">{result}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Queries and Selectors</h3>
          <p>
            Use semantic queries like getByRole(), getByLabelText(), and getByText() that reflect 
            how users interact with your app. Avoid implementation details like getByTestId() 
            unless necessary, and use accessibility-friendly selectors.
          </p>
        </div>

        <div className="info-card">
          <h3>User Events</h3>
          <p>
            Use @testing-library/user-event for realistic user interactions instead of fireEvent. 
            user-event simulates the full sequence of events that real users generate, 
            providing more accurate testing of user behavior.
          </p>
        </div>

        <div className="info-card">
          <h3>Async Testing</h3>
          <p>
            Use waitFor(), findBy queries, and act() for testing asynchronous behavior. 
            These utilities help handle loading states, API calls, and other async operations 
            while ensuring tests are stable and deterministic.
          </p>
        </div>

        <div className="info-card">
          <h3>Custom Render</h3>
          <p>
            Create custom render functions that wrap components with necessary providers 
            (Router, Theme, Redux store). This ensures consistent test setup and makes 
            tests more maintainable when context requirements change.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Testing Best Practices</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Query Priority</h4>
            <ol style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>getByRole() - Most accessible</li>
              <li>getByLabelText() - Form elements</li>
              <li>getByPlaceholderText() - Inputs</li>
              <li>getByText() - Non-interactive content</li>
              <li>getByDisplayValue() - Current value</li>
              <li>getByAltText() - Images</li>
              <li>getByTitle() - Last resort</li>
              <li>getByTestId() - Custom test IDs</li>
            </ol>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Component Setup</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Create reusable render functions</li>
              <li>Mock external dependencies</li>
              <li>Provide necessary context/providers</li>
              <li>Use realistic test data</li>
              <li>Clean up after each test</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>User Interactions</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Use user-event over fireEvent</li>
              <li>Test keyboard navigation</li>
              <li>Verify focus management</li>
              <li>Test form validation</li>
              <li>Check accessibility attributes</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Async Testing</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Use waitFor() for async assertions</li>
              <li>Use findBy*() queries when possible</li>
              <li>Mock API calls and timers</li>
              <li>Test loading and error states</li>
              <li>Handle promise rejections properly</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Custom Test Utilities</span>
        </div>
        <div className="code-content">
          <pre>{`// Custom render function with providers
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { QueryClient, QueryClientProvider } from 'react-query';

interface CustomRenderOptions extends RenderOptions {
  initialEntries?: string[];
  theme?: 'light' | 'dark';
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialEntries = ['/'],
    theme = 'light',
    ...renderOptions
  } = options;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from RTL
export * from '@testing-library/react';
export { customRender as render };

// Common test utilities
export const createMockProps = (overrides = {}) => ({
  id: 'test-id',
  className: 'test-class',
  onClick: jest.fn(),
  ...overrides
});

export const mockApiResponse = (data: any, delay = 0) => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

// Setup for all tests
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fetch mock
  if (global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
});`}</pre>
        </div>
      </div>
    </div>
  );
};

export default ReactTestingPage;