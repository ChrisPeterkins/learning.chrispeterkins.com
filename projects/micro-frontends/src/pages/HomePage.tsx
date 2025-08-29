import React, { useState } from 'react'

const HomePage: React.FC = () => {
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>('')

  const architectures = [
    {
      id: 'module-federation',
      name: 'Module Federation',
      description: 'Webpack 5\'s built-in solution for runtime code sharing',
      pros: ['Built into Webpack 5', 'Runtime loading', 'Shared dependencies'],
      cons: ['Webpack dependency', 'Complex configuration', 'Version conflicts'],
      useCases: ['Large enterprises', 'Complex applications', 'Team independence']
    },
    {
      id: 'single-spa',
      name: 'Single-spa',
      description: 'Framework-agnostic orchestration layer',
      pros: ['Framework agnostic', 'Mature ecosystem', 'Good routing'],
      cons: ['Learning curve', 'Additional abstraction', 'Bundle size'],
      useCases: ['Multi-framework apps', 'Legacy migration', 'Team diversity']
    },
    {
      id: 'iframe',
      name: 'iFrame Integration',
      description: 'Complete isolation using browser native features',
      pros: ['Complete isolation', 'Simple implementation', 'No conflicts'],
      cons: ['Poor UX', 'Communication overhead', 'SEO issues'],
      useCases: ['Third-party widgets', 'Legacy systems', 'Security-critical']
    },
    {
      id: 'web-components',
      name: 'Web Components',
      description: 'Standards-based custom elements approach',
      pros: ['Web standards', 'Framework agnostic', 'Encapsulation'],
      cons: ['Browser support', 'Limited ecosystem', 'Complexity'],
      useCases: ['Design systems', 'Reusable components', 'Long-term projects']
    }
  ]

  const comparisonData = {
    'Development Complexity': {
      'Module Federation': 'High',
      'Single-spa': 'High',
      'iFrame': 'Low',
      'Web Components': 'Medium'
    },
    'Runtime Performance': {
      'Module Federation': 'High',
      'Single-spa': 'High',
      'iFrame': 'Low',
      'Web Components': 'High'
    },
    'Isolation Level': {
      'Module Federation': 'Medium',
      'Single-spa': 'Low',
      'iFrame': 'High',
      'Web Components': 'High'
    },
    'Team Independence': {
      'Module Federation': 'High',
      'Single-spa': 'Medium',
      'iFrame': 'High',
      'Web Components': 'Medium'
    }
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Micro-Frontend Architectures</h1>
        <p className="page-description">
          Explore different approaches to building scalable, maintainable micro-frontend applications.
          Each pattern offers unique benefits and trade-offs for different use cases.
        </p>
      </header>

      <section className="introduction">
        <h2>What are Micro-Frontends?</h2>
        <p>
          Micro-frontends extend the microservices concept to frontend development, allowing teams to
          build, deploy, and maintain parts of a larger application independently. This approach enables
          organizations to scale their frontend development across multiple teams while maintaining
          consistency and user experience.
        </p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Team Autonomy</h3>
            <p>Teams can choose their own technology stack and release independently</p>
          </div>
          <div className="benefit-card">
            <h3>Incremental Upgrades</h3>
            <p>Gradually migrate legacy applications without complete rewrites</p>
          </div>
          <div className="benefit-card">
            <h3>Fault Isolation</h3>
            <p>Issues in one micro-frontend don't crash the entire application</p>
          </div>
          <div className="benefit-card">
            <h3>Scalable Development</h3>
            <p>Add more teams and features without increasing complexity linearly</p>
          </div>
        </div>
      </section>

      <section className="architecture-comparison">
        <h2>Architecture Patterns Comparison</h2>
        
        <div className="architecture-selector">
          {architectures.map((arch) => (
            <button
              key={arch.id}
              className={`arch-button ${selectedArchitecture === arch.id ? 'active' : ''}`}
              onClick={() => setSelectedArchitecture(selectedArchitecture === arch.id ? '' : arch.id)}
            >
              {arch.name}
            </button>
          ))}
        </div>

        {selectedArchitecture && (
          <div className="architecture-details">
            {architectures
              .filter(arch => arch.id === selectedArchitecture)
              .map(arch => (
                <div key={arch.id} className="architecture-card">
                  <h3>{arch.name}</h3>
                  <p className="architecture-description">{arch.description}</p>
                  
                  <div className="pros-cons">
                    <div className="pros">
                      <h4>Pros</h4>
                      <ul>
                        {arch.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="cons">
                      <h4>Cons</h4>
                      <ul>
                        {arch.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="use-cases">
                    <h4>Best Use Cases</h4>
                    <div className="use-case-list">
                      {arch.useCases.map((useCase, index) => (
                        <span key={index} className="use-case-tag">{useCase}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="comparison-matrix">
        <h2>Feature Comparison Matrix</h2>
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="comparison-cell header-cell">Criteria</div>
            <div className="comparison-cell header-cell">Module Federation</div>
            <div className="comparison-cell header-cell">Single-spa</div>
            <div className="comparison-cell header-cell">iFrame</div>
            <div className="comparison-cell header-cell">Web Components</div>
          </div>
          {Object.entries(comparisonData).map(([criteria, values]) => (
            <div key={criteria} className="comparison-row">
              <div className="comparison-cell criteria-cell">{criteria}</div>
              <div className={`comparison-cell value-cell ${values['Module Federation'].toLowerCase()}`}>
                {values['Module Federation']}
              </div>
              <div className={`comparison-cell value-cell ${values['Single-spa'].toLowerCase()}`}>
                {values['Single-spa']}
              </div>
              <div className={`comparison-cell value-cell ${values['iFrame'].toLowerCase()}`}>
                {values['iFrame']}
              </div>
              <div className={`comparison-cell value-cell ${values['Web Components'].toLowerCase()}`}>
                {values['Web Components']}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="implementation-flow">
        <h2>Implementation Journey</h2>
        <div className="journey-steps">
          <div className="journey-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Identify Boundaries</h3>
              <p>Define clear domain boundaries and team responsibilities</p>
            </div>
          </div>
          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Choose Architecture</h3>
              <p>Select the most appropriate micro-frontend pattern</p>
            </div>
          </div>
          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Design Integration</h3>
              <p>Plan communication and shared state management</p>
            </div>
          </div>
          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Implement & Deploy</h3>
              <p>Build, test, and deploy your micro-frontends</p>
            </div>
          </div>
        </div>
      </section>

      <section className="getting-started">
        <h2>Getting Started</h2>
        <div className="starter-cards">
          <div className="starter-card">
            <h3>For Beginners</h3>
            <p>Start with iFrame integration to understand the basics</p>
            <a href="/iframe" className="starter-link">iFrame Guide →</a>
          </div>
          <div className="starter-card">
            <h3>For Teams</h3>
            <p>Explore Module Federation for enterprise-grade solutions</p>
            <a href="/module-federation" className="starter-link">Module Federation →</a>
          </div>
          <div className="starter-card">
            <h3>For Flexibility</h3>
            <p>Learn Single-spa for framework-agnostic applications</p>
            <a href="/single-spa" className="starter-link">Single-spa Guide →</a>
          </div>
          <div className="starter-card">
            <h3>For Standards</h3>
            <p>Discover Web Components for future-proof solutions</p>
            <a href="/web-components" className="starter-link">Web Components →</a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage