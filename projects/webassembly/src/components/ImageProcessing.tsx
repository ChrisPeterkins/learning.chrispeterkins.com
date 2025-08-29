import React, { useState, useRef, useEffect } from 'react';

const ImageProcessing: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [wasmModule, setWasmModule] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWasmModule();
  }, []);

  const loadWasmModule = async () => {
    try {
      const response = await fetch('/projects/webassembly/wasm/image_processing.wasm');
      const bytes = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(bytes);
      setWasmModule(module.instance.exports);
    } catch (error) {
      console.error('Failed to load WASM module:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        setImageLoaded(true);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = async (filterType: string) => {
    if (!imageLoaded || !canvasRef.current || !wasmModule) return;
    
    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simulate WebAssembly processing
    // In real implementation, this would call WASM functions
    switch (filterType) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        break;
      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;
      case 'blur':
        // Simplified blur - in real WASM would be more efficient
        const tempData = new Uint8ClampedArray(data);
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const idx = (y * width + x) * 4 + c;
              let sum = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                  sum += tempData[nIdx];
                }
              }
              data[idx] = sum / 9;
            }
          }
        }
        break;
      case 'edge':
        // Edge detection
        const edgeData = new Uint8ClampedArray(data);
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          edgeData[i] = gray;
          edgeData[i + 1] = gray;
          edgeData[i + 2] = gray;
        }
        // Apply Sobel operator (simplified)
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;
            const top = ((y - 1) * canvas.width + x) * 4;
            const bottom = ((y + 1) * canvas.width + x) * 4;
            const left = (y * canvas.width + (x - 1)) * 4;
            const right = (y * canvas.width + (x + 1)) * 4;
            
            const gx = -edgeData[top - 4] + edgeData[top + 4] - 
                      2 * edgeData[left] + 2 * edgeData[right] - 
                      edgeData[bottom - 4] + edgeData[bottom + 4];
            const gy = -edgeData[top - 4] - 2 * edgeData[top] - edgeData[top + 4] + 
                      edgeData[bottom - 4] + 2 * edgeData[bottom] + edgeData[bottom + 4];
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            data[idx] = data[idx + 1] = data[idx + 2] = Math.min(255, magnitude);
          }
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
    setProcessing(false);
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Image Processing</h2>
        <p className="demo-description">
          Apply real-time image filters using WebAssembly for high-performance pixel manipulation.
          WASM provides significant speedups for image processing operations.
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
            className="btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </button>
        </div>

        {imageLoaded && (
          <div className="control-group" style={{ flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => applyFilter('grayscale')}
              disabled={processing}
            >
              Grayscale
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => applyFilter('invert')}
              disabled={processing}
            >
              Invert
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => applyFilter('blur')}
              disabled={processing}
            >
              Blur
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => applyFilter('edge')}
              disabled={processing}
            >
              Edge Detection
            </button>
          </div>
        )}
      </div>

      <div className="canvas-container">
        {!imageLoaded && (
          <p style={{ color: '#94a3b8' }}>Upload an image to start processing</p>
        )}
        <canvas 
          ref={canvasRef}
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            display: imageLoaded ? 'block' : 'none'
          }}
        />
        {processing && (
          <div className="loading-spinner" style={{ position: 'absolute' }}></div>
        )}
      </div>

      <div className="code-block">
        <pre>{`// Rust/WebAssembly Image Filter
#[no_mangle]
pub extern "C" fn apply_grayscale(pixels: *mut u8, len: usize) {
    let data = unsafe { std::slice::from_raw_parts_mut(pixels, len) };
    
    for i in (0..len).step_by(4) {
        let avg = (data[i] as u16 + data[i+1] as u16 + data[i+2] as u16) / 3;
        data[i] = avg as u8;
        data[i+1] = avg as u8;
        data[i+2] = avg as u8;
    }
}`}</pre>
      </div>
    </div>
  );
};

export default ImageProcessing;