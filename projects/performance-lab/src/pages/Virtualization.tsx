import { useState, useMemo } from 'react'
import { FixedSizeList as List, VariableSizeList } from 'react-window'

interface ListItem {
  id: number
  name: string
  description: string
  value: number
  category: string
  status: 'active' | 'inactive' | 'pending'
}

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  domNodes: number
  scrollFps: number
}

function Virtualization() {
  const [itemCount, setItemCount] = useState(10000)
  const [activeTab, setActiveTab] = useState('fixed')
  const [showVirtualized, setShowVirtualized] = useState(true)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    domNodes: 0,
    scrollFps: 60
  })

  // Generate large dataset
  const items = useMemo(() => {
    const categories = ['Performance', 'Optimization', 'React', 'JavaScript', 'CSS']
    const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending']
    
    return Array.from({ length: itemCount }, (_, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
      description: `This is item number ${index + 1} with some sample content to demonstrate virtualization performance benefits.`,
      value: Math.floor(Math.random() * 1000),
      category: categories[index % categories.length],
      status: statuses[index % statuses.length]
    }))
  }, [itemCount])

  const measurePerformance = (isVirtualized: boolean) => {
    const startTime = performance.now()
    
    // Simulate performance measurement
    setTimeout(() => {
      const renderTime = performance.now() - startTime
      const estimatedMemory = isVirtualized 
        ? Math.floor(Math.random() * 50 + 20) 
        : Math.floor(Math.random() * 500 + 200)
      const estimatedNodes = isVirtualized ? 50 : itemCount
      const fps = isVirtualized ? 60 : Math.max(15, 60 - Math.floor(itemCount / 1000))
      
      setPerformanceMetrics({
        renderTime: Math.round(renderTime),
        memoryUsage: estimatedMemory,
        domNodes: estimatedNodes,
        scrollFps: fps
      })
    }, 100)
  }

  const toggleVirtualization = () => {
    setShowVirtualized(!showVirtualized)
    measurePerformance(!showVirtualized)
  }

  const updateItemCount = (count: number) => {
    setItemCount(count)
    measurePerformance(showVirtualized)
  }

  // Fixed size list item renderer
  const FixedRowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    const isEven = index % 2 === 0
    
    return (
      <div
        style={{
          ...style,
          background: isEven ? 'rgba(15, 25, 20, 0.4)' : 'rgba(26, 93, 58, 0.1)',
          borderBottom: '1px solid rgba(26, 93, 58, 0.2)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: '#4ade80', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {item.id}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#f0f4f2', fontWeight: '500', marginBottom: '0.25rem' }}>
            {item.name}
          </div>
          <div style={{ color: '#a8bdb2', fontSize: '0.85rem' }}>
            {item.description}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold' }}>
            ${item.value}
          </div>
          <div style={{ 
            color: item.status === 'active' ? '#4ade80' : item.status === 'pending' ? '#f0c674' : '#dc2626',
            fontSize: '0.75rem',
            textTransform: 'uppercase'
          }}>
            {item.status}
          </div>
        </div>
      </div>
    )
  }

  // Variable size list item renderer
  const VariableRowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    const isEven = index % 2 === 0
    const isExpanded = index % 7 === 0 // Every 7th item is expanded
    
    return (
      <div
        style={{
          ...style,
          background: isEven ? 'rgba(15, 25, 20, 0.4)' : 'rgba(26, 93, 58, 0.1)',
          borderBottom: '1px solid rgba(26, 93, 58, 0.2)',
          padding: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: '#4ade80', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {item.id}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f0f4f2', fontWeight: '500', marginBottom: '0.5rem' }}>
              {item.name}
            </div>
            <div style={{ color: '#a8bdb2', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {item.description}
            </div>
            {isExpanded && (
              <div style={{ 
                background: 'rgba(10, 10, 10, 0.4)', 
                padding: '0.75rem', 
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <div style={{ color: '#8fa99b', fontSize: '0.8rem' }}>
                  Expanded content for item {item.id}. This demonstrates variable height items
                  in the virtualized list. Some items have more content than others.
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    background: 'rgba(26, 93, 58, 0.3)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#4ade80'
                  }}>
                    {item.category}
                  </span>
                  <span style={{ 
                    background: 'rgba(26, 93, 58, 0.3)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#4ade80'
                  }}>
                    Value: ${item.value}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#4ade80', fontWeight: 'bold' }}>
              ${item.value}
            </div>
            <div style={{ 
              color: item.status === 'active' ? '#4ade80' : item.status === 'pending' ? '#f0c674' : '#dc2626',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}>
              {item.status}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate item size for variable list
  const getItemSize = (index: number) => {
    return index % 7 === 0 ? 180 : 100 // Expanded items are taller
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>List Virtualization</h1>
        <p className="page-description">
          Learn how to efficiently render large lists with react-window. 
          Only visible items are rendered, dramatically improving performance for large datasets.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value" style={{ 
            color: performanceMetrics.renderTime < 50 ? '#4ade80' : performanceMetrics.renderTime < 100 ? '#f0c674' : '#dc2626' 
          }}>
            {performanceMetrics.renderTime}ms
          </div>
          <div className="metric-label">Render Time</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ 
            color: performanceMetrics.memoryUsage < 100 ? '#4ade80' : performanceMetrics.memoryUsage < 300 ? '#f0c674' : '#dc2626' 
          }}>
            {performanceMetrics.memoryUsage}MB
          </div>
          <div className="metric-label">Memory Usage</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ 
            color: performanceMetrics.domNodes < 100 ? '#4ade80' : performanceMetrics.domNodes < 1000 ? '#f0c674' : '#dc2626' 
          }}>
            {performanceMetrics.domNodes.toLocaleString()}
          </div>
          <div className="metric-label">DOM Nodes</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ 
            color: performanceMetrics.scrollFps >= 60 ? '#4ade80' : performanceMetrics.scrollFps >= 30 ? '#f0c674' : '#dc2626' 
          }}>
            {performanceMetrics.scrollFps}fps
          </div>
          <div className="metric-label">Scroll Performance</div>
        </div>
      </div>

      <div className="controls">
        <button 
          className="btn btn-primary" 
          onClick={toggleVirtualization}
        >
          {showVirtualized ? 'Show Regular List' : 'Show Virtualized List'}
        </button>
        
        <select 
          value={itemCount} 
          onChange={(e) => updateItemCount(Number(e.target.value))}
          style={{
            padding: '0.75rem',
            background: 'rgba(15, 25, 20, 0.6)',
            border: '1px solid rgba(26, 93, 58, 0.2)',
            color: '#f0f4f2',
            borderRadius: '4px'
          }}
        >
          <option value={1000}>1,000 items</option>
          <option value={5000}>5,000 items</option>
          <option value={10000}>10,000 items</option>
          <option value={50000}>50,000 items</option>
          <option value={100000}>100,000 items</option>
        </select>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'fixed' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixed')}
        >
          Fixed Height
        </button>
        <button 
          className={`tab ${activeTab === 'variable' ? 'active' : ''}`}
          onClick={() => setActiveTab('variable')}
        >
          Variable Height
        </button>
        <button 
          className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          Performance Comparison
        </button>
        <button 
          className={`tab ${activeTab === 'implementation' ? 'active' : ''}`}
          onClick={() => setActiveTab('implementation')}
        >
          Implementation
        </button>
      </div>

      {activeTab === 'fixed' && (
        <div className="card">
          <h2>Fixed Size List Virtualization</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All items have the same height. This is the most performant option and suitable for most use cases.
            Current status: <strong style={{ 
              color: showVirtualized ? '#4ade80' : '#dc2626' 
            }}>
              {showVirtualized ? 'Virtualized' : 'Regular List'}
            </strong>
          </p>
          
          <div style={{ 
            height: '400px', 
            border: '1px solid rgba(26, 93, 58, 0.2)',
            background: 'rgba(10, 10, 10, 0.4)'
          }}>
            {showVirtualized ? (
              <List
                height={400}
                itemCount={items.length}
                itemSize={100}
                itemData={items}
              >
                {FixedRowRenderer}
              </List>
            ) : (
              <div style={{ height: '400px', overflowY: 'auto' }}>
                {items.slice(0, Math.min(100, items.length)).map((item, index) => (
                  <FixedRowRenderer key={item.id} index={index} style={{}} />
                ))}
                {items.length > 100 && (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#8fa99b',
                    background: 'rgba(220, 38, 38, 0.1)',
                    borderTop: '2px solid #dc2626'
                  }}>
                    ⚠️ Showing only first 100 items to prevent browser freeze.
                    <br />
                    Regular rendering of {items.length.toLocaleString()} items would be very slow!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="info-box" style={{ marginTop: '1rem' }}>
            <strong>Performance Impact:</strong> With {items.length.toLocaleString()} items, 
            virtualization renders only ~4 visible items instead of all {items.length.toLocaleString()},
            reducing memory usage by over 99%.
          </div>
        </div>
      )}

      {activeTab === 'variable' && (
        <div className="card">
          <h2>Variable Size List Virtualization</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Items can have different heights. More complex but handles dynamic content well.
            Every 7th item is expanded to demonstrate variable sizing.
          </p>
          
          <div style={{ 
            height: '400px', 
            border: '1px solid rgba(26, 93, 58, 0.2)',
            background: 'rgba(10, 10, 10, 0.4)'
          }}>
            <VariableSizeList
              height={400}
              itemCount={items.length}
              itemSize={getItemSize}
              itemData={items}
            >
              {VariableRowRenderer}
            </VariableSizeList>
          </div>

          <div className="code-block" style={{ marginTop: '1rem' }}>
            <pre>{`import { VariableSizeList } from 'react-window';

const getItemSize = (index) => {
  // Dynamic height calculation
  return items[index].isExpanded ? 180 : 100;
};

<VariableSizeList
  height={400}
  itemCount={items.length}
  itemSize={getItemSize}
>
  {Row}
</VariableSizeList>`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="card">
          <h2>Performance Comparison</h2>
          
          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: '#4ade80' }}>Virtualized List Benefits</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Constant memory usage regardless of list size
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Fast initial render times (5-50ms vs 500-5000ms)
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Smooth 60fps scrolling even with 100k+ items
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Minimal DOM nodes (only visible items)
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  No browser freezing or jank
                </li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: '#dc2626' }}>Regular List Limitations</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Memory usage scales linearly with items
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Slow render times increase exponentially
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Janky scrolling with large datasets
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  DOM nodes equal to item count
                </li>
                <li style={{ marginBottom: '0.5rem', color: '#a8bdb2' }}>
                  Browser may freeze with 10k+ items
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Memory Usage Comparison</h3>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '2rem', color: '#4ade80' }}>~50MB</div>
                <div style={{ fontSize: '0.85rem', color: '#8fa99b' }}>Virtualized (100k items)</div>
              </div>
              <div style={{ fontSize: '1.5rem', color: '#8fa99b' }}>vs</div>
              <div>
                <div style={{ fontSize: '2rem', color: '#dc2626' }}>~2000MB</div>
                <div style={{ fontSize: '0.85rem', color: '#8fa99b' }}>Regular (100k items)</div>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <strong>When to Use Virtualization:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Lists with 100+ items (mobile) or 500+ items (desktop)</li>
              <li>Infinite scrolling or pagination alternatives</li>
              <li>Large datasets from APIs or databases</li>
              <li>Performance-critical applications</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'implementation' && (
        <div className="card">
          <h2>Implementation Guide</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Installation</h3>
            <div className="code-block">
              <pre>{`npm install react-window
npm install @types/react-window  # for TypeScript`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Basic Fixed Size List</h3>
            <div className="code-block">
              <pre>{`import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style }) => (
  <div style={style}>
    <div className="list-item">
      Item {index + 1}
    </div>
  </div>
);

function VirtualizedList({ items }) {
  return (
    <List
      height={600}        // Container height
      itemCount={items.length}
      itemSize={50}       // Height of each item
    >
      {Row}
    </List>
  );
}`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Advanced Features</h3>
            <div className="code-block">
              <pre>{`// With item data and scroll to item
import { FixedSizeList as List } from 'react-window';
import { useRef } from 'react';

function AdvancedList({ items }) {
  const listRef = useRef();

  const Row = ({ index, style, data }) => (
    <div style={style}>
      <div className="list-item">
        {data[index].name} - {data[index].value}
      </div>
    </div>
  );

  const scrollToItem = (index) => {
    listRef.current?.scrollToItem(index, 'center');
  };

  return (
    <>
      <button onClick={() => scrollToItem(500)}>
        Jump to item 500
      </button>
      <List
        ref={listRef}
        height={600}
        itemCount={items.length}
        itemSize={50}
        itemData={items}  // Pass data to rows
        overscanCount={5} // Render extra items for smooth scrolling
      >
        {Row}
      </List>
    </>
  );
}`}</pre>
            </div>
          </div>

          <div>
            <h3>Grid Virtualization</h3>
            <div className="code-block">
              <pre>{`import { FixedSizeGrid as Grid } from 'react-window';

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    Cell ({rowIndex}, {columnIndex})
  </div>
);

<Grid
  columnCount={100}
  columnWidth={100}
  height={600}
  rowCount={1000}
  rowHeight={50}
  width={800}
>
  {Cell}
</Grid>`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Virtualization