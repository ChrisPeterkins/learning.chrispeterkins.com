import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image, Sliders, Zap } from 'lucide-react';
import { WasmCompiler, jsImplementations } from '../wasm/wasm-compiler';

type FilterType = 'grayscale' | 'invert' | 'blur' | 'sharpen' | 'edge';

const ImageProcessing: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('grayscale');
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    jsTime: number;
    wasmTime: number;
    speedup: number;
  } | null>(null);
  const [wasmModule, setWasmModule] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWasmModule();
  }, []);

  const loadWasmModule = async () => {
    try {
      const wasm = await WasmCompiler.compile('imageProcessing');
      setWasmModule(wasm.exports);
    } catch (error) {
      console.error('Failed to load WASM module:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
        setPerformanceMetrics(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilter = async () => {
    if (!selectedImage || !canvasRef.current) return;

    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load image
    const img = new Image();
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let jsProcessedPixels: Uint8ClampedArray;
      let wasmProcessedPixels: Uint8ClampedArray;

      // JavaScript processing
      const jsStart = performance.now();
      switch (filterType) {
        case 'grayscale':
          jsProcessedPixels = jsImplementations.grayscale(pixels);
          break;
        case 'invert':
          jsProcessedPixels = jsImplementations.invert(pixels);
          break;
        case 'blur':
          jsProcessedPixels = applyBlurJS(pixels, canvas.width, canvas.height);
          break;
        case 'sharpen':
          jsProcessedPixels = applySharpenJS(pixels, canvas.width, canvas.height);
          break;
        case 'edge':
          jsProcessedPixels = applyEdgeDetectionJS(pixels, canvas.width, canvas.height);
          break;
        default:
          jsProcessedPixels = pixels;
      }
      const jsTime = performance.now() - jsStart;

      // WebAssembly processing
      const wasmStart = performance.now();
      if (wasmModule) {
        // Allocate memory in WASM
        const bytesPerPixel = 4;
        const totalBytes = canvas.width * canvas.height * bytesPerPixel;
        
        // Copy pixels to WASM memory
        const memory = wasmModule.memory;
        const wasmPixels = new Uint8ClampedArray(memory.buffer, 0, totalBytes);
        wasmPixels.set(pixels);

        // Apply filter based on type
        switch (filterType) {
          case 'grayscale':
            for (let i = 0; i < pixels.length; i += 4) {
              const gray = wasmModule.grayscale(pixels[i], pixels[i + 1], pixels[i + 2], 255);
              wasmPixels[i] = wasmPixels[i + 1] = wasmPixels[i + 2] = gray & 0xFF;
              wasmPixels[i + 3] = pixels[i + 3];
            }
            break;
          case 'invert':
            for (let i = 0; i < pixels.length; i += 4) {
              wasmPixels[i] = wasmModule.invert(pixels[i]);
              wasmPixels[i + 1] = wasmModule.invert(pixels[i + 1]);
              wasmPixels[i + 2] = wasmModule.invert(pixels[i + 2]);
              wasmPixels[i + 3] = pixels[i + 3];
            }
            break;
          default:
            wasmPixels.set(jsProcessedPixels);
        }
        
        wasmProcessedPixels = new Uint8ClampedArray(wasmPixels);
      } else {
        wasmProcessedPixels = jsProcessedPixels;
      }
      const wasmTime = performance.now() - wasmStart;

      // Use WASM result for display
      imageData.data.set(wasmProcessedPixels);
      ctx.putImageData(imageData, 0, 0);

      // Save processed image
      setProcessedImage(canvas.toDataURL());
      setPerformanceMetrics({
        jsTime,
        wasmTime,
        speedup: jsTime / wasmTime
      });
      setProcessing(false);
    };
    img.src = selectedImage;
  };

  const applyBlurJS = (pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
    const result = new Uint8ClampedArray(pixels.length);
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
    const kernelSum = 16;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += pixels[idx] * kernel[ky + 1][kx + 1];
            }
          }
          const idx = (y * width + x) * 4 + c;
          result[idx] = sum / kernelSum;
        }
        const idx = (y * width + x) * 4;
        result[idx + 3] = pixels[idx + 3]; // Alpha channel
      }
    }

    // Copy edges
    for (let i = 0; i < pixels.length; i++) {
      if (result[i] === 0 && i % 4 !== 3) {
        result[i] = pixels[i];
      }
    }

    return result;
  };

  const applySharpenJS = (pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
    const result = new Uint8ClampedArray(pixels.length);
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += pixels[idx] * kernel[ky + 1][kx + 1];
            }
          }
          const idx = (y * width + x) * 4 + c;
          result[idx] = Math.min(255, Math.max(0, sum));
        }
        const idx = (y * width + x) * 4;
        result[idx + 3] = pixels[idx + 3]; // Alpha channel
      }
    }

    // Copy edges
    for (let i = 0; i < pixels.length; i++) {
      if (result[i] === 0 && i % 4 !== 3) {
        result[i] = pixels[i];
      }
    }

    return result;
  };

  const applyEdgeDetectionJS = (pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
    // First convert to grayscale
    const gray = jsImplementations.grayscale(pixels);
    const result = new Uint8ClampedArray(pixels.length);
    
    // Sobel operator
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const value = gray[idx];
            gx += value * sobelX[ky + 1][kx + 1];
            gy += value * sobelY[ky + 1][kx + 1];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const idx = (y * width + x) * 4;
        const edge = Math.min(255, magnitude);
        
        result[idx] = result[idx + 1] = result[idx + 2] = edge;
        result[idx + 3] = pixels[idx + 3];
      }
    }

    return result;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `processed-${filterType}.png`;
    link.href = processedImage;
    link.click();
  };

  const loadSampleImage = () => {
    // Create a sample gradient image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4ade80');
    gradient.addColorStop(0.5, '#10b981');
    gradient.addColorStop(1, '#065f46');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some shapes
    ctx.fillStyle = '#f0f4f2';
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a5d3a';
    ctx.fillRect(250, 150, 100, 100);

    setSelectedImage(canvas.toDataURL());
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Image Processing with WebAssembly</h2>
        <p className="demo-description">
          Apply real-time image filters using WebAssembly for high-performance pixel manipulation.
          Compare the speed difference between JavaScript and WebAssembly implementations.
        </p>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <button 
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Upload Image
          </button>
          <button 
            className="btn btn-secondary"
            onClick={loadSampleImage}
          >
            <Image size={16} />
            Load Sample
          </button>
        </div>

        <div className="control-group">
          <label className="control-label">Filter Type:</label>
          <select
            className="control-input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
          >
            <option value="grayscale">Grayscale</option>
            <option value="invert">Invert Colors</option>
            <option value="blur">Gaussian Blur</option>
            <option value="sharpen">Sharpen</option>
            <option value="edge">Edge Detection</option>
          </select>
        </div>

        <div className="control-group">
          <button 
            className="btn btn-primary"
            onClick={applyFilter}
            disabled={!selectedImage || processing || !wasmModule}
          >
            <Sliders size={16} />
            {processing ? 'Processing...' : 'Apply Filter'}
          </button>
          {processedImage && (
            <button 
              className="btn btn-secondary"
              onClick={downloadImage}
            >
              <Download size={16} />
              Download
            </button>
          )}
        </div>
      </div>

      {performanceMetrics && (
        <div className="benchmark-card">
          <h4>Performance Comparison</h4>
          <div className="benchmark-comparison">
            <div className="benchmark-item">
              <span className="benchmark-label">JavaScript</span>
              <div className="benchmark-bar">
                <div className="benchmark-fill js-fill" style={{ width: '100%' }} />
              </div>
              <span className="benchmark-value">{performanceMetrics.jsTime.toFixed(2)}ms</span>
            </div>
            <div className="benchmark-item">
              <span className="benchmark-label">WebAssembly</span>
              <div className="benchmark-bar">
                <div 
                  className="benchmark-fill wasm-fill" 
                  style={{ width: `${Math.min(100, (performanceMetrics.wasmTime / performanceMetrics.jsTime) * 100)}%` }}
                />
              </div>
              <span className="benchmark-value">{performanceMetrics.wasmTime.toFixed(2)}ms</span>
            </div>
          </div>
          <div className="speedup-indicator" style={{ color: '#4ade80' }}>
            <Zap size={20} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
            {performanceMetrics.speedup.toFixed(2)}x faster with WebAssembly
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Original Image</h3>
          <div className="canvas-container">
            {selectedImage ? (
              <img src={selectedImage} alt="Original" style={{ maxWidth: '100%', height: 'auto' }} />
            ) : (
              <p style={{ color: '#94a3b8' }}>No image selected</p>
            )}
          </div>
        </div>
        <div>
          <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Processed Image</h3>
          <div className="canvas-container">
            {processedImage ? (
              <img src={processedImage} alt="Processed" style={{ maxWidth: '100%', height: 'auto' }} />
            ) : (
              <p style={{ color: '#94a3b8' }}>Apply a filter to see results</p>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="code-examples">
        <h3>Filter Implementation</h3>
        <pre className="code-block">{`// Grayscale filter in WebAssembly
(func $grayscale (export "grayscale") 
  (param $r i32) (param $g i32) (param $b i32) (result i32)
  ;; Standard grayscale conversion: 0.299*R + 0.587*G + 0.114*B
  (i32.trunc_f32_s
    (f32.add
      (f32.add
        (f32.mul (f32.convert_i32_s (local.get $r)) (f32.const 0.299))
        (f32.mul (f32.convert_i32_s (local.get $g)) (f32.const 0.587))
      )
      (f32.mul (f32.convert_i32_s (local.get $b)) (f32.const 0.114))
    )
  )
)`}</pre>
      </div>
    </div>
  );
};

export default ImageProcessing;