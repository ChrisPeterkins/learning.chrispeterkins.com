import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Download, Upload, Maximize2, Copy, Check } from 'lucide-react';
import ShaderCanvas from './ShaderCanvas';
import { defaultVertexShader } from '../utils/webgl';

interface ShaderEditorProps {
  initialVertexShader?: string;
  initialFragmentShader?: string;
  presets?: ShaderPreset[];
  onShaderChange?: (vertex: string, fragment: string) => void;
}

export interface ShaderPreset {
  name: string;
  category: string;
  vertexShader?: string;
  fragmentShader: string;
  uniforms?: Record<string, any>;
  description?: string;
}

const ShaderEditor: React.FC<ShaderEditorProps> = ({
  initialVertexShader = defaultVertexShader,
  initialFragmentShader = '',
  presets = [],
  onShaderChange
}) => {
  const [vertexShader, setVertexShader] = useState(initialVertexShader);
  const [fragmentShader, setFragmentShader] = useState(initialFragmentShader);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'vertex' | 'fragment'>('fragment');
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uniforms, setUniforms] = useState<Record<string, any>>({});
  const [fps, setFps] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lastFrameTime = useRef(performance.now());
  const frameCount = useRef(0);

  // FPS Counter
  useEffect(() => {
    if (!isPlaying) return;

    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      frameCount.current++;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }

      if (isPlaying) {
        requestAnimationFrame(updateFPS);
      }
    };

    requestAnimationFrame(updateFPS);

    return () => {
      frameCount.current = 0;
    };
  }, [isPlaying]);

  // Handle preset selection
  const handlePresetChange = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      if (preset.vertexShader) {
        setVertexShader(preset.vertexShader);
      }
      setFragmentShader(preset.fragmentShader);
      setUniforms(preset.uniforms || {});
      setSelectedPreset(presetName);
      setError(null);
    }
  };

  // Handle shader compilation error
  const handleShaderError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const shaderCode = activeTab === 'vertex' ? vertexShader : fragmentShader;
    try {
      await navigator.clipboard.writeText(shaderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Export shader
  const exportShader = () => {
    const shaderData = {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(shaderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shader-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import shader
  const importShader = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.vertex) setVertexShader(data.vertex);
        if (data.fragment) setFragmentShader(data.fragment);
        if (data.uniforms) setUniforms(data.uniforms);
        setError(null);
      } catch (err) {
        setError('Failed to import shader file');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const resetShader = () => {
    setVertexShader(defaultVertexShader);
    setFragmentShader(initialFragmentShader);
    setUniforms({});
    setError(null);
    setSelectedPreset('');
  };

  // Syntax highlighting (simple version)
  const highlightSyntax = (code: string) => {
    // This would ideally use a proper syntax highlighter like Prism.js
    return code
      .replace(/\b(uniform|attribute|varying|void|float|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(gl_Position|gl_FragColor|gl_FragCoord)\b/g, '<span class="builtin">$1</span>')
      .replace(/\b(sin|cos|tan|abs|floor|ceil|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize)\b/g, '<span class="function">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  };

  // Handle shader changes
  useEffect(() => {
    onShaderChange?.(vertexShader, fragmentShader);
  }, [vertexShader, fragmentShader, onShaderChange]);

  return (
    <div className={`shader-editor ${showFullscreen ? 'fullscreen' : ''}`}>
      <div className="editor-header">
        <div className="editor-tabs">
          <button
            className={`tab ${activeTab === 'vertex' ? 'active' : ''}`}
            onClick={() => setActiveTab('vertex')}
          >
            Vertex Shader
          </button>
          <button
            className={`tab ${activeTab === 'fragment' ? 'active' : ''}`}
            onClick={() => setActiveTab('fragment')}
          >
            Fragment Shader
          </button>
        </div>

        <div className="editor-controls">
          {presets.length > 0 && (
            <select
              className="preset-selector"
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              <option value="">Choose Preset...</option>
              {presets.map(preset => (
                <option key={preset.name} value={preset.name}>
                  {preset.category} - {preset.name}
                </option>
              ))}
            </select>
          )}

          <button
            className="control-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            className="control-btn"
            onClick={resetShader}
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>

          <button
            className="control-btn"
            onClick={copyToClipboard}
            title="Copy Code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          <button
            className="control-btn"
            onClick={exportShader}
            title="Export Shader"
          >
            <Download size={16} />
          </button>

          <label className="control-btn" title="Import Shader">
            <Upload size={16} />
            <input
              type="file"
              accept=".json"
              onChange={importShader}
              style={{ display: 'none' }}
            />
          </label>

          <button
            className="control-btn"
            onClick={() => setShowFullscreen(!showFullscreen)}
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-panel">
          <div className="code-editor">
            <div className="line-numbers">
              {(activeTab === 'vertex' ? vertexShader : fragmentShader)
                .split('\n')
                .map((_, i) => (
                  <div key={i} className="line-number">{i + 1}</div>
                ))}
            </div>
            <textarea
              ref={editorRef}
              className="code-input"
              value={activeTab === 'vertex' ? vertexShader : fragmentShader}
              onChange={(e) => {
                if (activeTab === 'vertex') {
                  setVertexShader(e.target.value);
                } else {
                  setFragmentShader(e.target.value);
                }
                setError(null);
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <div 
              className="code-highlight"
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(activeTab === 'vertex' ? vertexShader : fragmentShader)
              }}
            />
          </div>

          {error && (
            <div className="error-panel">
              <strong>Compilation Error:</strong>
              <pre>{error}</pre>
            </div>
          )}
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <span className="preview-title">Live Preview</span>
            <span className="fps-counter">FPS: {fps}</span>
          </div>
          <div className="preview-canvas">
            <ShaderCanvas
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              uniforms={uniforms}
              animate={isPlaying}
              onError={handleShaderError}
            />
          </div>
        </div>
      </div>

      <div className="editor-footer">
        <div className="uniform-controls">
          {Object.entries(uniforms).map(([name, value]) => (
            <div key={name} className="uniform-control">
              <label>{name}:</label>
              {typeof value === 'number' ? (
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={value}
                  onChange={(e) => setUniforms({
                    ...uniforms,
                    [name]: parseFloat(e.target.value)
                  })}
                />
              ) : (
                <span>{JSON.stringify(value)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShaderEditor;