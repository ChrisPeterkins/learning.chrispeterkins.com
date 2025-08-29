export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export const expect = (actual: any) => {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },

    toEqual(expected: any) {
      if (!deepEqual(actual, expected)) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },

    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },

    toBeFalsy() {
      if (actual) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be falsy`);
      }
    },

    toBeNull() {
      if (actual !== null) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be null`);
      }
    },

    toBeUndefined() {
      if (actual !== undefined) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be undefined`);
      }
    },

    toBeDefined() {
      if (actual === undefined) {
        throw new AssertionError(`Expected value to be defined`);
      }
    },

    toContain(expected: any) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new AssertionError(`Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new AssertionError(`Expected string "${actual}" to contain "${expected}"`);
        }
      } else {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be an array or string`);
      }
    },

    toHaveLength(expected: number) {
      if (!actual || typeof actual.length !== 'number') {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to have a length property`);
      }
      if (actual.length !== expected) {
        throw new AssertionError(`Expected length ${actual.length} to be ${expected}`);
      }
    },

    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number') {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be a number`);
      }
      if (actual <= expected) {
        throw new AssertionError(`Expected ${actual} to be greater than ${expected}`);
      }
    },

    toBeLessThan(expected: number) {
      if (typeof actual !== 'number') {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be a number`);
      }
      if (actual >= expected) {
        throw new AssertionError(`Expected ${actual} to be less than ${expected}`);
      }
    },

    toThrow(expectedError?: string | RegExp | Error) {
      if (typeof actual !== 'function') {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be a function`);
      }

      let threw = false;
      let thrownError: any = null;

      try {
        actual();
      } catch (error) {
        threw = true;
        thrownError = error;
      }

      if (!threw) {
        throw new AssertionError(`Expected function to throw an error`);
      }

      if (expectedError) {
        if (typeof expectedError === 'string') {
          if (thrownError.message !== expectedError) {
            throw new AssertionError(`Expected error message "${thrownError.message}" to be "${expectedError}"`);
          }
        } else if (expectedError instanceof RegExp) {
          if (!expectedError.test(thrownError.message)) {
            throw new AssertionError(`Expected error message "${thrownError.message}" to match ${expectedError}`);
          }
        } else if (expectedError instanceof Error) {
          if (thrownError.constructor !== expectedError.constructor) {
            throw new AssertionError(`Expected error type ${thrownError.constructor.name} to be ${expectedError.constructor.name}`);
          }
        }
      }
    },

    toBeInstanceOf(expected: any) {
      if (!(actual instanceof expected)) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be an instance of ${expected.name}`);
      }
    },

    toHaveProperty(property: string, value?: any) {
      if (!actual || typeof actual !== 'object') {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be an object`);
      }
      
      if (!(property in actual)) {
        throw new AssertionError(`Expected object to have property "${property}"`);
      }

      if (value !== undefined && actual[property] !== value) {
        throw new AssertionError(`Expected property "${property}" to have value ${JSON.stringify(value)}, but got ${JSON.stringify(actual[property])}`);
      }
    }
  };
};

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(a[key], b[key]));
}

// Mock function utilities
export const jest = {
  fn: (implementation?: (...args: any[]) => any) => {
    let mockFn = implementation || ((...args: any[]) => undefined);
    const calls: any[][] = [];
    const results: any[] = [];

    const mock = (...args: any[]) => {
      calls.push(args);
      try {
        const result = mockFn(...args);
        results.push({ type: 'return', value: result });
        return result;
      } catch (error) {
        results.push({ type: 'throw', value: error });
        throw error;
      }
    };

    mock.mockCalls = calls;
    mock.mockResults = results;
    mock.mockReturnValue = (value: any) => {
      mockFn = () => value;
      return mock;
    };
    mock.mockImplementation = (impl: (...args: any[]) => any) => {
      mockFn = impl;
      return mock;
    };
    mock.mockReset = () => {
      calls.length = 0;
      results.length = 0;
    };

    return mock;
  }
};