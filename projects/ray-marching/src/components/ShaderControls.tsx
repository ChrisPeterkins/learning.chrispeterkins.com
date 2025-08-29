import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export interface ControlParam {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export interface BooleanParam {
  name: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface ColorParam {
  name: string;
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
}

export interface SelectParam {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export interface ShaderControlsProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onReset?: () => void;
  params?: ControlParam[];
  booleanParams?: BooleanParam[];
  colorParams?: ColorParam[];
  selectParams?: SelectParam[];
  performance?: {
    fps: number;
    frameTime: number;
    steps?: number;
  };
  showPerformance?: boolean;
}

const ShaderControls: React.FC<ShaderControlsProps> = ({
  isPlaying = true,
  onPlayPause,
  onReset,
  params = [],
  booleanParams = [],
  colorParams = [],
  selectParams = [],
  performance,
  showPerformance = false
}) => {
  const formatValue = (value: number, step: number): string => {
    if (step >= 1) return value.toString();
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    return value.toFixed(decimals);
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        ]
      : [1, 1, 1];
  };

  const rgbToHex = (rgb: [number, number, number]): string => {
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
  };

  return (
    <div className="controls">
      {/* Playback Controls */}
      {(onPlayPause || onReset) && (
        <div className="control-group">
          <div className="control-label">Playback</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onPlayPause && (
              <button
                onClick={onPlayPause}
                className="control-button"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="control-button"
                title="Reset"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {showPerformance && performance && (
        <div className="control-group">
          <div className="control-label">Performance</div>
          <div className="performance-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))' }}>
            <div className="performance-card">
              <span className="performance-value">{performance.fps}</span>
              <span className="performance-label">FPS</span>
            </div>
            <div className="performance-card">
              <span className="performance-value">{performance.frameTime.toFixed(1)}</span>
              <span className="performance-label">ms</span>
            </div>
            {performance.steps !== undefined && (
              <div className="performance-card">
                <span className="performance-value">{performance.steps}</span>
                <span className="performance-label">Steps</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Select Parameters */}
      {selectParams.map((param) => (
        <div key={param.name} className="control-group">
          <label className="control-label">{param.label}</label>
          <select
            value={param.value}
            onChange={(e) => param.onChange(e.target.value)}
            className="control-input"
          >
            {param.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Boolean Parameters */}
      {booleanParams.map((param) => (
        <div key={param.name} className="control-group">
          <label className="control-label">
            <input
              type="checkbox"
              checked={param.value}
              onChange={(e) => param.onChange(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            {param.label}
          </label>
        </div>
      ))}

      {/* Numeric Parameters */}
      {params.map((param) => (
        <div key={param.name} className="control-group">
          <label className="control-label">
            {param.label}: {formatValue(param.value, param.step)}
          </label>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={param.value}
            onChange={(e) => param.onChange(Number(e.target.value))}
            className="control-input"
          />
          <input
            type="number"
            min={param.min}
            max={param.max}
            step={param.step}
            value={param.value}
            onChange={(e) => param.onChange(Number(e.target.value))}
            className="control-input"
            style={{ width: '80px', marginTop: '0.25rem' }}
          />
        </div>
      ))}

      {/* Color Parameters */}
      {colorParams.map((param) => (
        <div key={param.name} className="control-group">
          <label className="control-label">{param.label}</label>
          <input
            type="color"
            value={rgbToHex(param.value)}
            onChange={(e) => param.onChange(hexToRgb(e.target.value))}
            className="control-input"
            style={{ width: '60px', height: '40px', padding: '2px' }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            RGB: {param.value.map(v => (v * 255).toFixed(0)).join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShaderControls;