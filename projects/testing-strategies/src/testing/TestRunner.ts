export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export interface TestSuite {
  name: string;
  tests: Test[];
}

export interface Test {
  name: string;
  fn: () => void | Promise<void>;
}

export class TestRunner {
  private suites: TestSuite[] = [];
  private results: TestResult[] = [];
  private listeners: ((results: TestResult[]) => void)[] = [];

  describe(suiteName: string, testSuite: () => void): void {
    const suite: TestSuite = {
      name: suiteName,
      tests: []
    };

    const originalIt = globalThis.it;
    globalThis.it = (testName: string, testFn: () => void | Promise<void>) => {
      suite.tests.push({
        name: testName,
        fn: testFn
      });
    };

    testSuite();
    globalThis.it = originalIt;
    this.suites.push(suite);
  }

  it(testName: string, testFn: () => void | Promise<void>): void {
    // This is a standalone test
    this.suites.push({
      name: 'Standalone Tests',
      tests: [{ name: testName, fn: testFn }]
    });
  }

  async runTests(): Promise<TestResult[]> {
    this.results = [];

    for (const suite of this.suites) {
      for (const test of suite.tests) {
        const fullTestName = `${suite.name}: ${test.name}`;
        const startTime = performance.now();

        try {
          const result = test.fn();
          if (result instanceof Promise) {
            await result;
          }
          
          const endTime = performance.now();
          const testResult: TestResult = {
            name: fullTestName,
            passed: true,
            duration: endTime - startTime
          };
          
          this.results.push(testResult);
        } catch (error) {
          const endTime = performance.now();
          const testResult: TestResult = {
            name: fullTestName,
            passed: false,
            error: error instanceof Error ? error.message : String(error),
            duration: endTime - startTime
          };
          
          this.results.push(testResult);
        }
      }
    }

    this.notifyListeners();
    return this.results;
  }

  onResultsUpdate(listener: (results: TestResult[]) => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.results));
  }

  clear(): void {
    this.suites = [];
    this.results = [];
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      duration: totalDuration,
      passRate: total > 0 ? (passed / total) * 100 : 0
    };
  }
}