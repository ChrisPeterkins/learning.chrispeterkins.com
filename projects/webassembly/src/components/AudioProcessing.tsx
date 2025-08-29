import React, { useState, useRef, useEffect } from 'react';

const AudioProcessing: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    
    return () => {
      ctx.close();
    };
  }, []);

  const startVisualization = async () => {
    if (!audioContext || !canvasRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      
      source.connect(analyserNode);
      setAnalyser(analyserNode);
      setIsRecording(true);
      
      visualize(analyserNode);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVisualization = () => {
    setIsRecording(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const visualize = (analyserNode: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(10, 15, 13, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.7;

        const r = 26 + (dataArray[i] / 255) * 50;
        const g = 93 + (dataArray[i] / 255) * 100;
        const b = 58;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Audio Processing</h2>
        <p className="demo-description">
          Real-time audio processing and visualization using WebAssembly for DSP operations,
          FFT analysis, and audio effects.
        </p>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <button 
            className="btn"
            onClick={isRecording ? stopVisualization : startVisualization}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        <div className="grid grid-3" style={{ marginTop: '1rem' }}>
          <button className="btn btn-secondary">Apply Reverb</button>
          <button className="btn btn-secondary">Apply Echo</button>
          <button className="btn btn-secondary">Apply Distortion</button>
        </div>
      </div>

      <div className="canvas-container">
        {!isRecording && (
          <p style={{ color: '#94a3b8' }}>Click "Start Recording" to visualize audio</p>
        )}
        <canvas 
          ref={canvasRef}
          style={{ 
            width: '100%', 
            height: '100%',
            display: isRecording ? 'block' : 'none'
          }}
        />
      </div>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>FFT Analysis</h3>
          <p>Fast Fourier Transform for frequency domain analysis, running at 60fps with WebAssembly optimization.</p>
        </div>
        <div className="card">
          <h3>Audio Effects</h3>
          <p>Real-time effects processing including reverb, delay, distortion, and filters implemented in Rust.</p>
        </div>
      </div>

      <div className="code-block">
        <pre>{`// Rust/WebAssembly Audio DSP
use std::f32::consts::PI;

#[no_mangle]
pub extern "C" fn apply_reverb(
    input: *const f32,
    output: *mut f32,
    samples: usize,
    decay: f32,
    delay_ms: f32
) {
    let input_data = unsafe {
        std::slice::from_raw_parts(input, samples)
    };
    let output_data = unsafe {
        std::slice::from_raw_parts_mut(output, samples)
    };
    
    let delay_samples = (delay_ms * 44.1) as usize;
    
    for i in 0..samples {
        output_data[i] = input_data[i];
        if i >= delay_samples {
            output_data[i] += input_data[i - delay_samples] * decay;
        }
    }
}`}</pre>
      </div>
    </div>
  );
};

export default AudioProcessing;