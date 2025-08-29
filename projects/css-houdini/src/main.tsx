import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Register CSS Houdini worklets if supported
async function registerWorklets() {
  if ('CSS' in window && 'paintWorklet' in CSS) {
    try {
      // Register custom paint worklets
      await CSS.paintWorklet.addModule('/src/worklets/checkerboard.js');
      await CSS.paintWorklet.addModule('/src/worklets/ripple.js');
      await CSS.paintWorklet.addModule('/src/worklets/gradient-noise.js');
      console.log('CSS Paint Worklets registered successfully');
    } catch (error) {
      console.warn('Failed to register paint worklets:', error);
    }
  }

  if ('CSS' in window && 'animationWorklet' in CSS) {
    try {
      // Register animation worklets
      await CSS.animationWorklet.addModule('/src/worklets/spring-timing.js');
      console.log('CSS Animation Worklets registered successfully');
    } catch (error) {
      console.warn('Failed to register animation worklets:', error);
    }
  }

  // Register custom properties
  if ('CSS' in window && 'registerProperty' in CSS) {
    try {
      CSS.registerProperty({
        name: '--ripple-color',
        syntax: '<color>',
        inherits: false,
        initialValue: '#0066cc'
      });

      CSS.registerProperty({
        name: '--checkerboard-size',
        syntax: '<length>',
        inherits: false,
        initialValue: '20px'
      });

      CSS.registerProperty({
        name: '--animation-progress',
        syntax: '<number>',
        inherits: false,
        initialValue: '0'
      });

      console.log('CSS Properties registered successfully');
    } catch (error) {
      console.warn('Failed to register CSS properties:', error);
    }
  }
}

// Initialize worklets and render app
registerWorklets().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter basename="/projects/css-houdini">
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
});