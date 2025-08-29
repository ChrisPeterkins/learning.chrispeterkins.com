import React from 'react';
import { Layout, AlertTriangle } from 'lucide-react';

const LayoutAPIPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Layout className="inline" size={32} />
          Layout API
        </h1>
        <p className="page-subtitle">
          Define custom layout algorithms that integrate seamlessly with the browser's layout engine.
          Create masonry layouts, custom grid systems, and complex positioning logic.
        </p>
      </div>

      <div className="section">
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <AlertTriangle size={24} color="#856404" />
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Limited Browser Support</h3>
            <p style={{ margin: 0, color: '#856404', lineHeight: 1.5 }}>
              The CSS Layout API is currently experimental and has very limited browser support. 
              It's available behind flags in Chrome and is being actively developed. This page 
              demonstrates the concepts and potential future capabilities.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Masonry Layout Example</h2>
        <p className="section-description">
          A masonry layout arranges items in columns, fitting items into the shortest column. 
          This would be implemented using the Layout API when available.
        </p>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              height: '100%'
            }}>
              {[60, 80, 40, 70, 90, 50].map((height, i) => (
                <div
                  key={i}
                  style={{
                    background: `linear-gradient(135deg, #667eea, #764ba2)`,
                    borderRadius: '4px',
                    height: `${height}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="code-container">
            <div className="code-header">Future CSS Syntax</div>
            <div className="code-content">
              {`.masonry-container {
  display: layout(masonry);
  --columns: 3;
  --gap: 10px;
}

.masonry-item {
  break-inside: avoid;
}`}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Custom Grid System</h2>
        <p className="section-description">
          The Layout API would allow creating completely custom grid systems with complex
          alignment and distribution rules.
        </p>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              {[1, 2, 1.5, 1, 2.5, 1].map((flex, i) => (
                <div
                  key={i}
                  style={{
                    flex: `${flex}`,
                    minWidth: '40px',
                    height: `${50 + i * 15}px`,
                    background: '#667eea',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {flex}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">How Layout API Works</h2>
        <p className="section-description">
          The Layout API allows you to define custom layout classes that hook into the browser's 
          layout process. Here's the conceptual structure:
        </p>
        
        <div className="code-container">
          <div className="code-header">JavaScript Layout Class</div>
          <div className="code-content">
            <pre>{`class MasonryLayout {
  static get inputProperties() {
    return ['--columns', '--gap'];
  }

  static get childInputProperties() {
    return ['--span'];
  }

  async intrinsicSizes(children, edges, styleMap) {
    // Calculate intrinsic sizes
    return { minContentSize: 100, maxContentSize: 500 };
  }

  async layout(children, edges, constraints, styleMap) {
    const columns = parseInt(styleMap.get('--columns')) || 3;
    const gap = parseInt(styleMap.get('--gap')) || 10;
    
    const columnWidth = (constraints.fixedInlineSize - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);
    
    const childFragments = await Promise.all(
      children.map(async (child, index) => {
        const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
        const childConstraints = new LayoutConstraints({
          fixedInlineSize: columnWidth,
        });
        
        const fragment = await child.layoutNextFragment(childConstraints);
        
        fragment.inlineOffset = shortestColumn * (columnWidth + gap);
        fragment.blockOffset = columnHeights[shortestColumn];
        
        columnHeights[shortestColumn] += fragment.blockSize + gap;
        
        return fragment;
      })
    );

    return {
      childFragments,
      autoBlockSize: Math.max(...columnHeights) - gap,
    };
  }
}

registerLayout('masonry', MasonryLayout);`}</pre>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Future Possibilities</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Layout size={24} />
            </div>
            <h3 className="feature-title">Masonry Layouts</h3>
            <p className="feature-description">
              Pinterest-style layouts with automatic column balancing
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Layout size={24} />
            </div>
            <h3 className="feature-title">Custom Grids</h3>
            <p className="feature-description">
              Complex grid systems beyond CSS Grid capabilities
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Layout size={24} />
            </div>
            <h3 className="feature-title">Dynamic Layouts</h3>
            <p className="feature-description">
              Layouts that respond to content and container changes
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Layout size={24} />
            </div>
            <h3 className="feature-title">Performance</h3>
            <p className="feature-description">
              Native-speed layouts that integrate with browser optimizations
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Current Status</h2>
        <p className="section-description">
          The Layout API is still in early development. You can track its progress and 
          experiment with prototypes in browsers that support it behind feature flags.
        </p>
        
        <div className="browser-support">
          <div className="browser-item browser-item--partial">
            <strong>Chrome</strong>
            <span>Experimental</span>
          </div>
          <div className="browser-item browser-item--unsupported">
            <strong>Firefox</strong>
            <span>Not implemented</span>
          </div>
          <div className="browser-item browser-item--unsupported">
            <strong>Safari</strong>
            <span>Not implemented</span>
          </div>
          <div className="browser-item browser-item--partial">
            <strong>Edge</strong>
            <span>Experimental</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutAPIPage;