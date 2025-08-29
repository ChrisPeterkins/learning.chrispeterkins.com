import React, { useState } from 'react'

const AsyncPatternsPage: React.FC = () => {
  const [activePattern, setActivePattern] = useState('callbacks')
  
  const patterns = {
    callbacks: {
      title: 'Callback Pattern',
      description: 'The original async pattern in Node.js',
      pros: ['Simple for single async operations', 'No additional syntax needed'],
      cons: ['Callback hell with nested operations', 'Error handling is verbose'],
      code: `// Traditional callback pattern
fs.readFile('file1.txt', (err, data1) => {
  if (err) return handleError(err);
  
  fs.readFile('file2.txt', (err, data2) => {
    if (err) return handleError(err);
    
    fs.writeFile('combined.txt', data1 + data2, (err) => {
      if (err) return handleError(err);
      console.log('Files combined!');
    });
  });
});`
    },
    promises: {
      title: 'Promise Pattern',
      description: 'Chainable async operations with better error handling',
      pros: ['Chainable with .then()', 'Single .catch() for errors', 'Avoids callback hell'],
      cons: ['Can still get complex with multiple branches', 'Need to promisify callbacks'],
      code: `// Promise-based approach
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

readFile('file1.txt')
  .then(data1 => {
    return readFile('file2.txt')
      .then(data2 => ({ data1, data2 }));
  })
  .then(({ data1, data2 }) => {
    return writeFile('combined.txt', data1 + data2);
  })
  .then(() => console.log('Files combined!'))
  .catch(handleError);`
    },
    asyncawait: {
      title: 'Async/Await',
      description: 'Synchronous-looking asynchronous code',
      pros: ['Clean, readable code', 'Easy error handling with try/catch', 'Works great with loops'],
      cons: ['Still need to understand promises', 'Can forget to use await'],
      code: `// Async/await approach
async function combineFiles() {
  try {
    const data1 = await fs.promises.readFile('file1.txt');
    const data2 = await fs.promises.readFile('file2.txt');
    
    await fs.promises.writeFile('combined.txt', data1 + data2);
    console.log('Files combined!');
  } catch (err) {
    handleError(err);
  }
}

combineFiles();`
    },
    streams: {
      title: 'Stream Pattern',
      description: 'Process data piece by piece',
      pros: ['Memory efficient', 'Start processing before complete', 'Built-in backpressure'],
      cons: ['More complex API', 'Not suitable for all use cases'],
      code: `// Stream-based approach
const { pipeline } = require('stream');

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);`
    }
  }
  
  return (
    <div className="async-patterns-page">
      <header className="page-header">
        <h1>Async Patterns</h1>
        <p className="page-description">
          Master asynchronous programming patterns in Node.js. From callbacks to promises 
          to async/await, learn when and how to use each pattern effectively.
        </p>
      </header>
      
      <section>
        <h2 style={{ marginBottom: '2rem' }}>Pattern Comparison</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            {Object.keys(patterns).map(key => (
              <button
                key={key}
                className={`demo-button ${activePattern === key ? 'active' : ''}`}
                onClick={() => setActivePattern(key)}
              >
                {patterns[key as keyof typeof patterns].title}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>
              {patterns[activePattern as keyof typeof patterns].title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {patterns[activePattern as keyof typeof patterns].description}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid var(--accent-green)'
              }}>
                <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>Pros</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {patterns[activePattern as keyof typeof patterns].pros.map((pro, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Cons</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {patterns[activePattern as keyof typeof patterns].cons.map((con, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="code-container">
              <div className="code-header">
                <span className="code-title">Example Code</span>
              </div>
              <div className="code-content">
                <pre>{patterns[activePattern as keyof typeof patterns].code}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Advanced Patterns</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Parallel Execution with Promise.all</span>
          </div>
          <div className="code-content">
            <pre>{`// Execute multiple async operations in parallel
async function fetchAllData() {
  try {
    const [users, posts, comments] = await Promise.all([
      fetchUsers(),
      fetchPosts(),
      fetchComments()
    ]);
    
    return { users, posts, comments };
  } catch (err) {
    console.error('One of the requests failed:', err);
  }
}`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Sequential Processing with for-await-of</span>
          </div>
          <div className="code-content">
            <pre>{`// Process async iterables sequentially
async function processLargeDataset() {
  const stream = fs.createReadStream('large-file.txt');
  const rl = readline.createInterface({ input: stream });
  
  for await (const line of rl) {
    // Process each line asynchronously
    await processLine(line);
  }
  
  console.log('All lines processed');
}`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Error Recovery with Promise.allSettled</span>
          </div>
          <div className="code-content">
            <pre>{`// Continue even if some promises fail
async function fetchWithFallbacks() {
  const results = await Promise.allSettled([
    fetchFromPrimary(),
    fetchFromSecondary(),
    fetchFromCache()
  ]);
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
  
  console.log('Successful:', successful.length);
  console.log('Failed:', failed.length);
  
  return successful[0] || null;
}`}</pre>
          </div>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Best Practices</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Error Handling</h3>
            <p>
              Always handle errors. Use try/catch with async/await, .catch() with promises, 
              and error-first callbacks consistently.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Avoid Mixing Patterns</h3>
            <p>
              Stick to one pattern within a function. Don't mix callbacks with promises 
              unnecessarily. Use util.promisify() to convert.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Concurrency Control</h3>
            <p>
              Use libraries like p-limit to control concurrent operations. Don't overwhelm 
              systems with unlimited parallel requests.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AsyncPatternsPage