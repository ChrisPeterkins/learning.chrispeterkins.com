// Mock data for testing
export const mockUserData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ],
  posts: [
    { id: 1, userId: 1, title: 'First Post', content: 'This is my first post' },
    { id: 2, userId: 2, title: 'Second Post', content: 'Another great post' },
    { id: 3, userId: 1, title: 'Third Post', content: 'More content here' }
  ]
};

// Mock API responses
export const mockApiResponses = {
  getUserSuccess: (id: number) => ({
    status: 200,
    data: mockUserData.users.find(u => u.id === id)
  }),
  getUserError: () => ({
    status: 404,
    error: 'User not found'
  }),
  getPostsSuccess: () => ({
    status: 200,
    data: mockUserData.posts
  }),
  createUserSuccess: (userData: any) => ({
    status: 201,
    data: { id: Date.now(), ...userData }
  })
};

// Mock functions for different scenarios
export const createMockAPI = () => {
  let delay = 0;
  let shouldFail = false;
  let failureRate = 0;

  return {
    setDelay: (ms: number) => { delay = ms; },
    setShouldFail: (fail: boolean) => { shouldFail = fail; },
    setFailureRate: (rate: number) => { failureRate = rate; },
    
    async getUser(id: number) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (shouldFail || Math.random() < failureRate) {
        throw new Error('Network error');
      }
      
      return mockApiResponses.getUserSuccess(id);
    },
    
    async getPosts() {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (shouldFail || Math.random() < failureRate) {
        throw new Error('Network error');
      }
      
      return mockApiResponses.getPostsSuccess();
    },
    
    async createUser(userData: any) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (shouldFail || Math.random() < failureRate) {
        throw new Error('Network error');
      }
      
      return mockApiResponses.createUserSuccess(userData);
    }
  };
};

// Mock timers
export const mockTimers = {
  setTimeout: (callback: () => void, delay: number) => {
    return window.setTimeout(callback, delay);
  },
  setInterval: (callback: () => void, delay: number) => {
    return window.setInterval(callback, delay);
  },
  clearTimeout: (id: number) => {
    window.clearTimeout(id);
  },
  clearInterval: (id: number) => {
    window.clearInterval(id);
  },
  // Fast-forward time for testing
  fastForward: (ms: number) => {
    // This would integrate with fake timers in a real testing environment
    console.log(`Fast-forwarding time by ${ms}ms`);
  }
};

// Mock DOM elements
export const createMockElement = (tagName: string = 'div') => {
  const element = {
    tagName: tagName.toUpperCase(),
    children: [] as any[],
    attributes: new Map<string, string>(),
    classList: {
      add: (className: string) => {
        const current = element.attributes.get('class') || '';
        const classes = current.split(' ').filter(c => c);
        if (!classes.includes(className)) {
          classes.push(className);
          element.attributes.set('class', classes.join(' '));
        }
      },
      remove: (className: string) => {
        const current = element.attributes.get('class') || '';
        const classes = current.split(' ').filter(c => c && c !== className);
        element.attributes.set('class', classes.join(' '));
      },
      contains: (className: string) => {
        const current = element.attributes.get('class') || '';
        return current.split(' ').includes(className);
      }
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    click: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
    getAttribute: (name: string) => element.attributes.get(name),
    setAttribute: (name: string, value: string) => element.attributes.set(name, value),
    appendChild: (child: any) => element.children.push(child),
    removeChild: (child: any) => {
      const index = element.children.indexOf(child);
      if (index > -1) element.children.splice(index, 1);
    }
  };
  
  return element;
};

// Mock storage (localStorage/sessionStorage)
export const createMockStorage = () => {
  const storage = new Map<string, string>();
  
  return {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: (index: number) => Array.from(storage.keys())[index] || null
  };
};

// Mock fetch API
export const createMockFetch = () => {
  let responses = new Map<string, any>();
  let delay = 0;
  let shouldFail = false;
  
  const mockFetch = async (url: string, options: any = {}) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (shouldFail) {
      throw new Error('Network error');
    }
    
    const response = responses.get(url) || { status: 404, body: 'Not found' };
    
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.body,
      text: async () => JSON.stringify(response.body)
    };
  };
  
  mockFetch.mockResponse = (url: string, response: any) => {
    responses.set(url, response);
  };
  
  mockFetch.mockDelay = (ms: number) => {
    delay = ms;
  };
  
  mockFetch.mockFailure = (fail: boolean) => {
    shouldFail = fail;
  };
  
  mockFetch.reset = () => {
    responses.clear();
    delay = 0;
    shouldFail = false;
  };
  
  return mockFetch;
};

// Jest-like mock function implementation
export const jest = {
  fn(implementation?: (...args: any[]) => any) {
  const calls: any[][] = [];
  const results: { type: 'return' | 'throw', value: any }[] = [];
  let mockImplementation = implementation;

  const mockFn = (...args: any[]) => {
    calls.push([...args]);
    
    try {
      const result = mockImplementation ? mockImplementation(...args) : undefined;
      results.push({ type: 'return', value: result });
      return result;
    } catch (error) {
      results.push({ type: 'throw', value: error });
      throw error;
    }
  };

  // Add mock properties and methods
  Object.defineProperty(mockFn, 'mock', {
    value: {
      calls,
      results,
      instances: [] // For constructor mocks
    }
  });

  mockFn.mockReturnValue = (value: any) => {
    mockImplementation = () => value;
    return mockFn;
  };

  mockFn.mockReturnValueOnce = (value: any) => {
    const originalImpl = mockImplementation;
    let called = false;
    mockImplementation = (...args: any[]) => {
      if (!called) {
        called = true;
        return value;
      }
      return originalImpl ? originalImpl(...args) : undefined;
    };
    return mockFn;
  };

  mockFn.mockImplementation = (impl: (...args: any[]) => any) => {
    mockImplementation = impl;
    return mockFn;
  };

  mockFn.mockResolvedValue = (value: any) => {
    mockImplementation = async () => value;
    return mockFn;
  };

  mockFn.mockRejectedValue = (error: any) => {
    mockImplementation = async () => { throw error; };
    return mockFn;
  };

  mockFn.mockReset = () => {
    calls.length = 0;
    results.length = 0;
    mockImplementation = implementation;
    return mockFn;
  };

  mockFn.mockClear = () => {
    calls.length = 0;
    results.length = 0;
    return mockFn;
  };

  return mockFn;
  }
};