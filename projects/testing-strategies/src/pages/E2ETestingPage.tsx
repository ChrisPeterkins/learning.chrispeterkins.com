import React, { useState } from 'react';

const E2ETestingPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('login-flow');
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string[]>([]);

  const simulateE2ETest = async (scenario: string) => {
    setIsRunning(true);
    setTestOutput([]);
    
    const steps = getTestSteps(scenario);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setTestOutput(prev => [...prev, `${i + 1}. ${step.action}`]);
      
      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      if (step.success) {
        setTestOutput(prev => [...prev, `   ✓ ${step.result}`]);
      } else {
        setTestOutput(prev => [...prev, `   ✗ ${step.result}`]);
        break;
      }
    }
    
    setIsRunning(false);
  };

  const getTestSteps = (scenario: string) => {
    switch (scenario) {
      case 'login-flow':
        return [
          { action: 'Navigate to login page', duration: 800, success: true, result: 'Page loaded successfully' },
          { action: 'Enter username "testuser@example.com"', duration: 300, success: true, result: 'Username field populated' },
          { action: 'Enter password "password123"', duration: 300, success: true, result: 'Password field populated' },
          { action: 'Click login button', duration: 1200, success: true, result: 'Login request sent' },
          { action: 'Wait for dashboard to load', duration: 1500, success: true, result: 'Dashboard displayed with user data' },
          { action: 'Verify user profile information', duration: 500, success: true, result: 'Profile shows correct user details' }
        ];
      case 'shopping-cart':
        return [
          { action: 'Navigate to product catalog', duration: 1000, success: true, result: 'Catalog page loaded with products' },
          { action: 'Search for "laptop"', duration: 800, success: true, result: 'Search results displayed (15 items)' },
          { action: 'Click on first laptop product', duration: 600, success: true, result: 'Product detail page opened' },
          { action: 'Select quantity: 2', duration: 300, success: true, result: 'Quantity selector updated' },
          { action: 'Add to cart', duration: 500, success: true, result: 'Item added to cart, badge updated' },
          { action: 'Navigate to cart', duration: 400, success: true, result: 'Cart page shows 2 laptops' },
          { action: 'Proceed to checkout', duration: 700, success: true, result: 'Checkout form displayed' },
          { action: 'Fill shipping information', duration: 1200, success: true, result: 'Shipping form completed' },
          { action: 'Select payment method', duration: 400, success: true, result: 'Credit card option selected' },
          { action: 'Complete purchase', duration: 2000, success: true, result: 'Order confirmed with ID #12345' }
        ];
      case 'form-validation':
        return [
          { action: 'Navigate to contact form', duration: 600, success: true, result: 'Contact form loaded' },
          { action: 'Submit empty form', duration: 300, success: true, result: 'Validation errors displayed' },
          { action: 'Enter invalid email "notanemail"', duration: 400, success: true, result: 'Email validation error shown' },
          { action: 'Enter valid email "test@example.com"', duration: 300, success: true, result: 'Email validation passed' },
          { action: 'Enter message < 10 characters', duration: 500, success: true, result: 'Message length error shown' },
          { action: 'Enter valid message (50+ characters)', duration: 800, success: true, result: 'Message validation passed' },
          { action: 'Submit valid form', duration: 1200, success: true, result: 'Form submitted successfully' },
          { action: 'Verify success message', duration: 400, success: true, result: 'Thank you message displayed' }
        ];
      case 'responsive-design':
        return [
          { action: 'Load page in desktop view (1920x1080)', duration: 800, success: true, result: 'Desktop layout rendered correctly' },
          { action: 'Verify navigation menu is horizontal', duration: 300, success: true, result: 'Horizontal nav menu visible' },
          { action: 'Resize to tablet view (768x1024)', duration: 500, success: true, result: 'Layout adjusted for tablet' },
          { action: 'Check that sidebar collapses', duration: 300, success: true, result: 'Sidebar hidden, hamburger menu shown' },
          { action: 'Resize to mobile view (375x667)', duration: 500, success: true, result: 'Mobile layout activated' },
          { action: 'Test hamburger menu functionality', duration: 400, success: true, result: 'Mobile menu toggles correctly' },
          { action: 'Verify touch-friendly button sizes', duration: 300, success: true, result: 'Buttons meet 44px touch target size' }
        ];
      default:
        return [];
    }
  };

  const getScenarioCode = (scenario: string) => {
    switch (scenario) {
      case 'login-flow':
        return `// Cypress E2E Test - Login Flow
describe('User Login Flow', () => {
  it('should allow user to log in and access dashboard', () => {
    // Navigate to login page
    cy.visit('/login');
    
    // Fill in login form
    cy.get('[data-testid="email-input"]').type('testuser@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify user is logged in
    cy.get('[data-testid="user-profile"]')
      .should('contain', 'testuser@example.com');
    
    // Check that protected content is visible
    cy.get('[data-testid="dashboard-content"]').should('be.visible');
  });

  it('should handle invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Should show error message
    cy.get('[data-testid="error-message"]')
      .should('contain', 'Invalid credentials');
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });
});`;

      case 'shopping-cart':
        return `// Playwright E2E Test - Shopping Cart
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Flow', () => {
  test('should add items to cart and complete purchase', async ({ page }) => {
    // Navigate to product catalog
    await page.goto('/products');
    
    // Search for products
    await page.fill('[data-testid="search-input"]', 'laptop');
    await page.click('[data-testid="search-button"]');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click on first product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Add to cart
    await page.selectOption('[data-testid="quantity-select"]', '2');
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart badge updated
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('2');
    
    // Go to cart
    await page.click('[data-testid="cart-link"]');
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="item-quantity"]')).toHaveText('2');
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Fill checkout form
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'Anytown');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    
    // Complete purchase
    await page.click('[data-testid="place-order"]');
    
    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="order-number"]'))
      .toContainText('#');
  });
});`;

      case 'form-validation':
        return `// Selenium WebDriver E2E Test - Form Validation
import { Builder, By, until, WebDriver } from 'selenium-webdriver';

describe('Contact Form Validation', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('should validate form fields and show errors', async () => {
    // Navigate to contact form
    await driver.get('http://localhost:3000/contact');
    
    // Try to submit empty form
    const submitButton = await driver.findElement(By.css('[data-testid="submit"]'));
    await submitButton.click();
    
    // Check for validation errors
    const emailError = await driver.findElement(By.css('[data-testid="email-error"]'));
    expect(await emailError.getText()).toContain('Email is required');
    
    const messageError = await driver.findElement(By.css('[data-testid="message-error"]'));
    expect(await messageError.getText()).toContain('Message is required');
    
    // Enter invalid email
    const emailInput = await driver.findElement(By.css('[data-testid="email"]'));
    await emailInput.sendKeys('notanemail');
    await submitButton.click();
    
    expect(await emailError.getText()).toContain('Invalid email format');
    
    // Enter valid email but short message
    await emailInput.clear();
    await emailInput.sendKeys('test@example.com');
    
    const messageInput = await driver.findElement(By.css('[data-testid="message"]'));
    await messageInput.sendKeys('Hi');
    await submitButton.click();
    
    expect(await messageError.getText()).toContain('Message too short');
    
    // Enter valid data
    await messageInput.clear();
    await messageInput.sendKeys('This is a longer message that should pass validation');
    await submitButton.click();
    
    // Wait for success message
    const successMessage = await driver.wait(
      until.elementLocated(By.css('[data-testid="success-message"]')),
      5000
    );
    
    expect(await successMessage.getText()).toContain('Thank you');
  });
});`;

      case 'responsive-design':
        return `// Cypress E2E Test - Responsive Design
describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];

  viewports.forEach(({ name, width, height }) => {
    it(\`should display correctly on \${name}\`, () => {
      cy.viewport(width, height);
      cy.visit('/');
      
      if (name === 'desktop') {
        // Desktop-specific tests
        cy.get('[data-testid="main-nav"]').should('be.visible');
        cy.get('[data-testid="sidebar"]').should('be.visible');
        cy.get('[data-testid="hamburger-menu"]').should('not.exist');
        
        // Check grid layout
        cy.get('[data-testid="content-grid"]')
          .should('have.css', 'grid-template-columns')
          .and('match', /repeat\\(3, 1fr\\)/);
          
      } else if (name === 'tablet') {
        // Tablet-specific tests
        cy.get('[data-testid="main-nav"]').should('be.visible');
        cy.get('[data-testid="sidebar"]').should('not.be.visible');
        
        // Check 2-column grid
        cy.get('[data-testid="content-grid"]')
          .should('have.css', 'grid-template-columns')
          .and('match', /repeat\\(2, 1fr\\)/);
          
      } else if (name === 'mobile') {
        // Mobile-specific tests
        cy.get('[data-testid="main-nav"]').should('not.be.visible');
        cy.get('[data-testid="hamburger-menu"]').should('be.visible');
        
        // Test hamburger menu
        cy.get('[data-testid="hamburger-menu"]').click();
        cy.get('[data-testid="mobile-nav"]').should('be.visible');
        
        // Check single column layout
        cy.get('[data-testid="content-grid"]')
          .should('have.css', 'grid-template-columns', '1fr');
          
        // Test touch-friendly buttons
        cy.get('[data-testid="cta-button"]')
          .should('have.css', 'min-height', '44px')
          .and('have.css', 'min-width', '44px');
      }
    });
  });

  it('should handle orientation change on mobile', () => {
    cy.viewport(375, 667); // Portrait
    cy.visit('/');
    
    cy.get('[data-testid="mobile-layout"]').should('be.visible');
    
    cy.viewport(667, 375); // Landscape
    cy.get('[data-testid="landscape-layout"]').should('be.visible');
  });
});`;

      default:
        return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>End-to-End Testing</h1>
        <p className="page-description">
          End-to-end (E2E) tests validate complete user workflows by simulating real user interactions 
          with your application. They provide confidence that all components work together to deliver 
          the expected user experience from start to finish.
        </p>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>What is E2E Testing?</h3>
          <p>
            E2E testing simulates real user scenarios by automating browser interactions, 
            testing the application from the user interface down to the database. 
            It verifies that all integrated components work together correctly in a production-like environment.
          </p>
        </div>

        <div className="info-card">
          <h3>E2E Testing Tools</h3>
          <p>
            Modern E2E testing tools include Cypress (developer-friendly with great debugging), 
            Playwright (cross-browser support), and Selenium (mature ecosystem). 
            Each offers different trade-offs in speed, browser support, and developer experience.
          </p>
        </div>

        <div className="info-card">
          <h3>When to Use E2E Tests</h3>
          <p>
            Use E2E tests for critical user journeys, payment flows, authentication, 
            and complex workflows that span multiple pages or systems. Keep them focused 
            on happy paths and critical error scenarios to maintain speed and reliability.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>E2E Testing Scenarios</h2>
        <p>Select a scenario to see how E2E tests validate complete user workflows:</p>
        
        <div className="demo-controls">
          <button 
            className={`demo-button ${selectedScenario === 'login-flow' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('login-flow')}
          >
            Login Flow
          </button>
          <button 
            className={`demo-button ${selectedScenario === 'shopping-cart' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('shopping-cart')}
          >
            Shopping Cart
          </button>
          <button 
            className={`demo-button ${selectedScenario === 'form-validation' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('form-validation')}
          >
            Form Validation
          </button>
          <button 
            className={`demo-button ${selectedScenario === 'responsive-design' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('responsive-design')}
          >
            Responsive Design
          </button>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">E2E Test Code</span>
        </div>
        <div className="code-content">
          <pre>{getScenarioCode(selectedScenario)}</pre>
        </div>
      </div>

      <div className="test-runner-container">
        <div className="test-runner-header">
          <span className="test-runner-title">E2E Test Simulator</span>
          <div className="test-runner-controls">
            <button 
              className="test-button primary"
              onClick={() => simulateE2ETest(selectedScenario)}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Simulate E2E Test'}
            </button>
          </div>
        </div>

        <div className="test-results">
          {testOutput.length === 0 && !isRunning && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click "Simulate E2E Test" to see the testing process
            </div>
          )}

          {testOutput.map((line, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '0.5rem 1rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.85rem',
                color: line.includes('✓') ? 'var(--success-green)' : 
                       line.includes('✗') ? 'var(--error-red)' : 
                       line.match(/^\d+\./) ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: line.includes('✗') ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
              }}
            >
              {line}
            </div>
          ))}

          {isRunning && (
            <div className="loading" style={{ marginTop: '1rem' }}>
              <div className="loading-spinner"></div>
              Executing E2E test steps...
            </div>
          )}
        </div>
      </div>

      <div className="concept-grid">
        <div className="info-card">
          <h3>Test Data Management</h3>
          <p>
            E2E tests need realistic test data and clean environments. Use database seeders, 
            API fixtures, or test user accounts. Consider using separate test environments 
            and data cleanup strategies to ensure test independence and reliability.
          </p>
        </div>

        <div className="info-card">
          <h3>Page Object Pattern</h3>
          <p>
            Organize E2E tests using the Page Object pattern to encapsulate page interactions 
            and reduce duplication. Create reusable page classes that hide implementation details 
            and provide business-focused methods for test scenarios.
          </p>
        </div>

        <div className="info-card">
          <h3>Flaky Test Prevention</h3>
          <p>
            E2E tests can be flaky due to timing issues, network delays, or browser differences. 
            Use explicit waits, stable selectors, retry mechanisms, and proper test isolation 
            to improve reliability and reduce false failures.
          </p>
        </div>

        <div className="info-card">
          <h3>CI/CD Integration</h3>
          <p>
            Run E2E tests in CI/CD pipelines with proper browser environments, video recording 
            on failures, and parallel execution for faster feedback. Consider running critical 
            tests on every commit and full suites on releases.
          </p>
        </div>
      </div>

      <div className="demo-container">
        <h2>E2E Testing Best Practices</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Test Organization</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Group tests by user journey or feature</li>
              <li>Use descriptive test names that explain the scenario</li>
              <li>Keep tests independent and isolated</li>
              <li>Follow the testing pyramid - few E2E tests</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Selector Strategy</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Use data-testid attributes for test stability</li>
              <li>Avoid CSS selectors that change with styling</li>
              <li>Prefer semantic selectors when possible</li>
              <li>Document selector conventions for the team</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Error Handling</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Take screenshots on test failures</li>
              <li>Record videos of test execution</li>
              <li>Add meaningful error messages and context</li>
              <li>Implement proper cleanup on test failures</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Performance</h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Run tests in parallel where possible</li>
              <li>Use headless browsers for faster execution</li>
              <li>Optimize test data setup and teardown</li>
              <li>Cache login states and common setup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default E2ETestingPage;