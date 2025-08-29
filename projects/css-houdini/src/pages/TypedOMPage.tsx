import React, { useState } from 'react';
import { Code } from 'lucide-react';

const TypedOMPage: React.FC = () => {
  const [outputLog, setOutputLog] = useState<string[]>([]);

  const runTypedOMDemo = () => {
    const logs: string[] = [];
    
    try {
      // Basic Typed OM usage
      if ('CSS' in window && 'number' in (window as any).CSS) {
        const numberValue = (CSS as any).number(42);
        logs.push(`CSS.number(42): ${numberValue}`);
        
        const pixelValue = (CSS as any).px(100);
        logs.push(`CSS.px(100): ${pixelValue}`);
        
        const percentValue = (CSS as any).percent(50);
        logs.push(`CSS.percent(50): ${percentValue}`);
      } else {
        logs.push('CSS Typed OM not supported in this browser');
      }
      
      // Element style manipulation
      const testElement = document.createElement('div');
      testElement.style.width = '100px';
      testElement.style.height = '200px';
      
      logs.push(`Element width: ${testElement.style.width}`);
      logs.push(`Element height: ${testElement.style.height}`);
      
    } catch (error) {
      logs.push(`Error: ${error}`);
    }
    
    setOutputLog(logs);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Code className="inline" size={32} />
          Typed OM
        </h1>
        <p className="page-subtitle">
          Work with CSS values as JavaScript objects instead of strings. 
          Provides better performance and type safety for CSS manipulation.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Try Typed OM</h2>
        <p className="section-description">
          Click the button below to run some Typed OM examples and see the results.
        </p>
        
        <div className="controls">
          <button onClick={runTypedOMDemo} className="control-button">
            Run Typed OM Demo
          </button>
        </div>
        
        {outputLog.length > 0 && (
          <div className="code-container">
            <div className="code-header">Output</div>
            <div className="code-content">
              {outputLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">Typed OM Benefits</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Code size={24} />
            </div>
            <h3 className="feature-title">Type Safety</h3>
            <p className="feature-description">
              Work with typed CSS values instead of error-prone strings
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Code size={24} />
            </div>
            <h3 className="feature-title">Performance</h3>
            <p className="feature-description">
              Avoid parsing overhead by working with structured values
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Code size={24} />
            </div>
            <h3 className="feature-title">Math Operations</h3>
            <p className="feature-description">
              Perform calculations on CSS values with proper unit handling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypedOMPage;