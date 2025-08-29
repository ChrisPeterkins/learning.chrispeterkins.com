import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1>Testing Strategies</h1>
        <p className="page-description">
          Master the art of software testing with comprehensive strategies, practical examples, 
          and hands-on implementations. Learn to write effective tests that ensure code quality, 
          reliability, and maintainability.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Why Testing Matters</h3>
          <p>
            Testing is crucial for building reliable software. It catches bugs early, 
            provides confidence in code changes, serves as living documentation, 
            and enables safe refactoring. Good tests act as a safety net that 
            allows developers to move fast without breaking things.
          </p>
        </div>

        <div className="info-card">
          <h3>Testing Pyramid</h3>
          <p>
            The testing pyramid guides test distribution: many fast unit tests at the base, 
            fewer integration tests in the middle, and minimal slow end-to-end tests at the top. 
            This approach provides comprehensive coverage while maintaining quick feedback cycles.
          </p>
        </div>

        <div className="info-card">
          <h3>Test-Driven Development</h3>
          <p>
            TDD follows the Red-Green-Refactor cycle: write a failing test, 
            make it pass with minimal code, then refactor for quality. This approach 
            leads to better design, higher coverage, and more maintainable code.
          </p>
        </div>

        <div className="info-card">
          <h3>Testing in Practice</h3>
          <p>
            Effective testing combines multiple strategies: unit tests for individual functions, 
            integration tests for component interactions, and end-to-end tests for user workflows. 
            Each serves a specific purpose in ensuring software quality.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Testing Fundamentals</h2>
        <p>
          Testing software involves verifying that code behaves as expected under various conditions. 
          This includes testing normal operations, edge cases, error conditions, and performance 
          characteristics. Good tests are:
        </p>
        
        <ul style={{ margin: '1rem 0', paddingLeft: '2rem', color: 'var(--text-secondary)' }}>
          <li><strong>Fast:</strong> Run quickly to provide immediate feedback</li>
          <li><strong>Independent:</strong> Don't depend on other tests or external state</li>
          <li><strong>Repeatable:</strong> Produce the same results every time</li>
          <li><strong>Self-validating:</strong> Have clear pass/fail outcomes</li>
          <li><strong>Timely:</strong> Written at the right time in the development process</li>
        </ul>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Unit Testing</h3>
          <p>
            Tests individual functions or methods in isolation. They're fast, focused, 
            and provide quick feedback. Unit tests verify that each piece of code 
            works correctly on its own, making them the foundation of a good test suite.
          </p>
        </div>

        <div className="info-card">
          <h3>Integration Testing</h3>
          <p>
            Tests how different parts of the system work together. These tests verify 
            that modules, services, or components integrate correctly, catching issues 
            that unit tests might miss when components interact.
          </p>
        </div>

        <div className="info-card">
          <h3>End-to-End Testing</h3>
          <p>
            Tests complete user workflows from start to finish. E2E tests simulate 
            real user interactions with the application, ensuring that all components 
            work together to deliver the expected user experience.
          </p>
        </div>

        <div className="info-card">
          <h3>Mocking & Stubbing</h3>
          <p>
            Techniques for isolating code under test by replacing dependencies with 
            controlled fake implementations. Mocks verify interactions while stubs 
            provide predictable responses, enabling reliable and fast tests.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>Testing Tools & Frameworks</h2>
        <p>Modern testing ecosystems provide powerful tools for different testing needs:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>Test Runners</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
              <li>Jest - JavaScript testing framework</li>
              <li>Vitest - Fast Vite-native test runner</li>
              <li>Mocha - Flexible testing framework</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>Assertion Libraries</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
              <li>Jest - Built-in assertions</li>
              <li>Chai - BDD/TDD assertion library</li>
              <li>Expect - Simple assertions</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>React Testing</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
              <li>React Testing Library</li>
              <li>Enzyme (legacy)</li>
              <li>React Test Utils</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>E2E Testing</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
              <li>Cypress - Modern E2E testing</li>
              <li>Playwright - Cross-browser automation</li>
              <li>Selenium - Web automation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3>Getting Started</h3>
        <p>
          Navigate through the sections to explore different testing strategies. Each section includes 
          interactive examples, live test runners, and practical implementations you can experiment with. 
          Start with unit testing fundamentals, then progress through integration testing, TDD practices, 
          and advanced topics like mocking and performance testing.
        </p>
      </div>
    </div>
  );
};

export default HomePage;