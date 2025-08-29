import React, { useState, useRef, useEffect } from 'react';

interface ConsoleMessage {
  type: 'log' | 'error' | 'warning' | 'info';
  content: string;
  timestamp: string;
}

const ConsolePage: React.FC = () => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([
    { type: 'log', content: 'Console initialized', timestamp: new Date().toLocaleTimeString() },
    { type: 'info', content: 'Welcome to the interactive console demo', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { type: 'log', content: `> ${cmd}`, timestamp }]);

    try {
      let result: any;
      
      if (cmd === 'clear' || cmd === 'clear()') {
        setMessages([]);
        return;
      } else if (cmd.startsWith('console.')) {
        const method = cmd.match(/console\.(\w+)/)?.[1];
        const args = cmd.match(/\((.*)\)/)?.[1] || '';
        
        if (method === 'log') {
          result = `Logged: ${args.replace(/['"]/g, '')}`;
        } else if (method === 'error') {
          setMessages(prev => [...prev, { 
            type: 'error', 
            content: args.replace(/['"]/g, ''), 
            timestamp 
          }]);
          return;
        } else if (method === 'warn') {
          setMessages(prev => [...prev, { 
            type: 'warning', 
            content: args.replace(/['"]/g, ''), 
            timestamp 
          }]);
          return;
        } else if (method === 'info') {
          setMessages(prev => [...prev, { 
            type: 'info', 
            content: args.replace(/['"]/g, ''), 
            timestamp 
          }]);
          return;
        }
      } else {
        result = eval(cmd);
      }

      setMessages(prev => [...prev, {
        type: 'log',
        content: result !== undefined ? String(result) : 'undefined',
        timestamp
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${(error as Error).message}`,
        timestamp
      }]);
    }

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Console & Debugging</h1>
        <p className="page-description">
          Master the browser console for logging, debugging, and interactive JavaScript development.
          Learn to use breakpoints, watch expressions, and advanced debugging techniques.
        </p>
      </header>

      <section className="demo-container">
        <h2>Interactive Console</h2>
        <div className="console-container">
          <div className="console-header">
            <span className="code-title">Console</span>
            <button 
              className="demo-button" 
              onClick={() => setMessages([])}
            >
              Clear
            </button>
          </div>
          <div className="console-output">
            {messages.map((msg, index) => (
              <div key={index} className={`console-line ${msg.type}`}>
                <span className="console-prompt">
                  {msg.type === 'error' ? '✖' : 
                   msg.type === 'warning' ? '⚠' :
                   msg.type === 'info' ? 'ℹ' : '›'}
                </span>
                <span>{msg.content}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
          <div style={{ padding: '1rem', borderTop: '1px solid var(--code-border)' }}>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type JavaScript code here..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="demo-controls">
          <button 
            className="demo-button" 
            onClick={() => executeCommand('console.log("Hello, DevTools!")')}
          >
            Log Message
          </button>
          <button 
            className="demo-button" 
            onClick={() => executeCommand('console.error("This is an error")')}
          >
            Show Error
          </button>
          <button 
            className="demo-button" 
            onClick={() => executeCommand('console.warn("Warning message")')}
          >
            Show Warning
          </button>
          <button 
            className="demo-button" 
            onClick={() => executeCommand('console.info("Information")')}
          >
            Show Info
          </button>
          <button 
            className="demo-button" 
            onClick={() => executeCommand('[1, 2, 3].map(x => x * 2)')}
          >
            Run Array Map
          </button>
        </div>
      </section>

      <section className="code-container">
        <div className="code-header">
          <span className="code-title">Console Methods</span>
        </div>
        <div className="code-content">
          <pre>{`// Logging Methods
console.log('Basic log');
console.info('Information');
console.warn('Warning');
console.error('Error');
console.debug('Debug info');

// Formatting
console.log('%cStyled text', 'color: green; font-size: 20px');
console.log('Multiple %s %d', 'values', 123);

// Grouping
console.group('Group Name');
console.log('Nested log');
console.groupEnd();

// Tables and Objects
console.table([{a: 1, b: 2}, {a: 3, b: 4}]);
console.dir(document.body);

// Timing
console.time('timer');
// ... code to measure ...
console.timeEnd('timer');

// Assertions
console.assert(1 === 2, 'This will show');

// Stack Traces
console.trace('Show call stack');

// Counting
console.count('label');
console.countReset('label');`}</pre>
        </div>
      </section>

      <section className="demo-container">
        <h2>Debugging Techniques</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>Breakpoints</h3>
            <p>
              Set breakpoints in Sources panel to pause execution. Use conditional
              breakpoints for specific scenarios. Step through code line by line.
            </p>
          </div>

          <div className="info-card">
            <h3>Watch Expressions</h3>
            <p>
              Monitor variable values during execution. Add expressions to watch
              panel for real-time updates. Track complex state changes.
            </p>
          </div>

          <div className="info-card">
            <h3>Call Stack</h3>
            <p>
              Navigate through function call hierarchy. Understand execution flow.
              Jump to different stack frames during debugging.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsolePage;