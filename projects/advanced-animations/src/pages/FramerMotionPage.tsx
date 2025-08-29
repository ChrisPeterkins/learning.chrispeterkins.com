import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play } from 'lucide-react';

const FramerMotionPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = [
    { id: "1", title: "Item 1", subtitle: "Framer Motion" },
    { id: "2", title: "Item 2", subtitle: "Layout Animation" },
    { id: "3", title: "Item 3", subtitle: "Gesture Support" }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Wind size={32} />
          Framer Motion
        </h1>
        <p className="page-subtitle">
          Declarative animations for React with layout animations, gestures, and spring physics.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Layout Animations</h2>
        <div className="controls">
          <button onClick={() => setIsVisible(!isVisible)} className="control-button">
            <Play size={16} />
            Toggle Visibility
          </button>
        </div>
        
        <div className="demo-preview" style={{ minHeight: '200px' }}>
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="animated-box"
                style={{ position: 'absolute' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Layout Animation Grid</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => setSelectedId(item.id)}
              className="demo-card"
              style={{ cursor: 'pointer', minHeight: '120px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedId && (
            <motion.div
              layoutId={selectedId}
              onClick={() => setSelectedId(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                cursor: 'pointer'
              }}
            >
              <motion.div
                className="demo-card"
                style={{ width: '300px', height: '200px' }}
              >
                <h3>Expanded View</h3>
                <p>Click to close</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="code-container">
        <div className="code-header">Framer Motion Example</div>
        <div className="code-content">
          <pre>{`import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.5 }}
  transition={{ type: "spring", stiffness: 300 }}
/>`}</pre>
        </div>
      </div>
    </div>
  );
};

export default FramerMotionPage;