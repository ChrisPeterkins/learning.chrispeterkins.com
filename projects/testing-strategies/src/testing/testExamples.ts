import { expect } from './assertions';
import { createMockAPI, mockUserData, createMockFetch } from './mocks';

// Simple function examples for testing
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
};

export const stringUtils = {
  reverse: (str: string): string => str.split('').reverse().join(''),
  capitalize: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),
  isPalindrome: (str: string): boolean => {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  },
  wordCount: (str: string): number => str.trim().split(/\s+/).filter(word => word.length > 0).length
};

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
};

// User management class for testing
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

  removeUser(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    return this.users.splice(index, 1)[0];
  }

  getUser(id: number) {
    return this.users.find(u => u.id === id) || null;
  }

  getAllUsers() {
    return [...this.users];
  }

  updateUser(id: number, updates: {name?: string, email?: string}) {
    const user = this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
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

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Async API client for testing
export class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '/api', timeout: number = 5000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async get(endpoint: string) {
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async fetchWithTimeout(url: string, options: any = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
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
}

// Counter class for testing state management
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

  reset() {
    this.value = 0;
    this.notify();
    return this.value;
  }

  getValue() {
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
}

// Test suites for examples
export const createUnitTestSuite = (runner: any) => {
  runner.describe('Math Utils', () => {
    runner.it('should add two numbers correctly', () => {
      expect(mathUtils.add(2, 3)).toBe(5);
      expect(mathUtils.add(-1, 1)).toBe(0);
      expect(mathUtils.add(0, 0)).toBe(0);
    });

    runner.it('should subtract two numbers correctly', () => {
      expect(mathUtils.subtract(5, 3)).toBe(2);
      expect(mathUtils.subtract(0, 5)).toBe(-5);
    });

    runner.it('should multiply two numbers correctly', () => {
      expect(mathUtils.multiply(3, 4)).toBe(12);
      expect(mathUtils.multiply(-2, 3)).toBe(-6);
      expect(mathUtils.multiply(0, 10)).toBe(0);
    });

    runner.it('should divide two numbers correctly', () => {
      expect(mathUtils.divide(10, 2)).toBe(5);
      expect(mathUtils.divide(7, 2)).toBe(3.5);
    });

    runner.it('should throw error when dividing by zero', () => {
      expect(() => mathUtils.divide(5, 0)).toThrow('Division by zero');
    });

    runner.it('should calculate factorial correctly', () => {
      expect(mathUtils.factorial(0)).toBe(1);
      expect(mathUtils.factorial(1)).toBe(1);
      expect(mathUtils.factorial(5)).toBe(120);
    });

    runner.it('should throw error for negative factorial', () => {
      expect(() => mathUtils.factorial(-1)).toThrow('Factorial of negative number');
    });
  });

  runner.describe('String Utils', () => {
    runner.it('should reverse strings correctly', () => {
      expect(stringUtils.reverse('hello')).toBe('olleh');
      expect(stringUtils.reverse('')).toBe('');
      expect(stringUtils.reverse('a')).toBe('a');
    });

    runner.it('should capitalize strings correctly', () => {
      expect(stringUtils.capitalize('hello')).toBe('Hello');
      expect(stringUtils.capitalize('HELLO')).toBe('HELLO');
      expect(stringUtils.capitalize('')).toBe('');
    });

    runner.it('should detect palindromes correctly', () => {
      expect(stringUtils.isPalindrome('racecar')).toBe(true);
      expect(stringUtils.isPalindrome('A man a plan a canal Panama')).toBe(true);
      expect(stringUtils.isPalindrome('hello')).toBe(false);
    });

    runner.it('should count words correctly', () => {
      expect(stringUtils.wordCount('hello world')).toBe(2);
      expect(stringUtils.wordCount('  spaced   out  ')).toBe(2);
      expect(stringUtils.wordCount('')).toBe(0);
    });
  });

  runner.describe('Array Utils', () => {
    runner.it('should remove duplicates', () => {
      expect(arrayUtils.unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
      expect(arrayUtils.unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    runner.it('should flatten nested arrays', () => {
      expect(arrayUtils.flatten([1, [2, 3], [4, [5]]])).toEqual([1, 2, 3, 4, 5]);
    });

    runner.it('should chunk arrays correctly', () => {
      expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    runner.it('should find maximum value', () => {
      expect(arrayUtils.findMax([1, 5, 3, 2])).toBe(5);
      expect(() => arrayUtils.findMax([])).toThrow('Array is empty');
    });
  });
};

export const createIntegrationTestSuite = (runner: any) => {
  runner.describe('UserManager Integration', () => {
    let userManager: UserManager;

    // Setup before each test
    beforeEach(() => {
      userManager = new UserManager();
    });

    runner.it('should create and retrieve users', () => {
      const user = userManager.addUser('John Doe', 'john@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.id).toBeDefined();

      const retrieved = userManager.getUser(user.id);
      expect(retrieved).toEqual(user);
    });

    runner.it('should prevent duplicate emails', () => {
      userManager.addUser('John', 'john@example.com');
      expect(() => userManager.addUser('Jane', 'john@example.com'))
        .toThrow('User with this email already exists');
    });

    runner.it('should update user information', () => {
      const user = userManager.addUser('John', 'john@example.com');
      const updated = userManager.updateUser(user.id, { name: 'John Smith' });
      expect(updated.name).toBe('John Smith');
      expect(updated.email).toBe('john@example.com');
    });

    runner.it('should remove users', () => {
      const user = userManager.addUser('John', 'john@example.com');
      const removed = userManager.removeUser(user.id);
      expect(removed).toEqual(user);
      expect(userManager.getUser(user.id)).toBe(null);
    });
  });

  runner.describe('Counter with Observers', () => {
    let counter: Counter;
    let notifications: number[];

    beforeEach(() => {
      counter = new Counter();
      notifications = [];
      counter.addListener((value) => notifications.push(value));
    });

    runner.it('should notify observers of changes', () => {
      counter.increment();
      counter.increment();
      counter.decrement();
      
      expect(notifications).toEqual([1, 2, 1]);
    });

    runner.it('should handle multiple observers', () => {
      const notifications2: number[] = [];
      counter.addListener((value) => notifications2.push(value * 2));
      
      counter.setValue(5);
      
      expect(notifications).toEqual([5]);
      expect(notifications2).toEqual([10]);
    });
  });
};

export const createAsyncTestSuite = (runner: any) => {
  runner.describe('Async API Client', async () => {
    let apiClient: APIClient;
    let mockFetch: any;

    beforeEach(() => {
      mockFetch = createMockFetch();
      (global as any).fetch = mockFetch;
      apiClient = new APIClient();
    });

    runner.it('should handle successful GET requests', async () => {
      const testData = { id: 1, name: 'Test' };
      mockFetch.mockResponse('/api/users/1', { status: 200, body: testData });
      
      const result = await apiClient.get('/users/1');
      expect(result).toEqual(testData);
    });

    runner.it('should handle HTTP errors', async () => {
      mockFetch.mockResponse('/api/users/999', { status: 404, body: 'Not Found' });
      
      try {
        await apiClient.get('/users/999');
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('HTTP 404');
      }
    });

    runner.it('should handle POST requests', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' };
      const createdUser = { id: 123, ...newUser };
      mockFetch.mockResponse('/api/users', { status: 201, body: createdUser });
      
      const result = await apiClient.post('/users', newUser);
      expect(result).toEqual(createdUser);
    });

    runner.it('should handle network timeouts', async () => {
      mockFetch.mockDelay(6000); // Longer than default timeout
      
      try {
        await apiClient.get('/users/1');
        throw new Error('Should have thrown a timeout error');
      } catch (error) {
        expect((error as Error).message).toBe('Request timeout');
      }
    });
  });
};